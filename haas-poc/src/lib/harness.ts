import { Task, TaskStatus, AuditEntry, HarnessConfig } from "./types";
import { store } from "./store";
import { estimateCost } from "./costs";
import { executeAgent } from "./agents";

export interface HarnessResult {
  success: boolean;
  task?: Task;
  blockedReason?: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function addAudit(taskId: string, event: string, details: string, actor: string, costDelta?: number) {
  store.addAuditEntry({
    id: generateId(),
    taskId,
    timestamp: new Date().toISOString(),
    event,
    details,
    actor,
    costDelta,
  });
}

export function submitTask(
  type: Task["type"],
  description: string,
  mode: Task["mode"],
  priority: Task["priority"],
  requestedBy: string
): HarnessResult {
  const config = store.getConfig();
  const estimate = estimateCost(type, mode, description.length);

  const task: Task = {
    id: generateId(),
    type,
    description,
    mode,
    status: "queued",
    createdAt: new Date().toISOString(),
    requestedBy,
    priority,
    estimatedCost: estimate.cost,
    actualCost: 0,
    tokensUsed: 0,
    retryCount: 0,
  };

  store.addTask(task);
  addAudit(task.id, "Task Submitted", `Type: ${type}, Mode: ${mode}, Estimated cost: $${estimate.cost.toFixed(4)}`, requestedBy);

  // Cost Control Harness
  const monthlySpend = store.getMonthlySpend();
  if (monthlySpend + estimate.cost > config.monthlySpendCap) {
    task.status = "failed";
    store.updateTask(task.id, task);
    addAudit(task.id, "Cost Control Blocked", `Monthly cap $${config.monthlySpendCap} would be exceeded`, "Harness");
    return { success: false, task, blockedReason: "Monthly spend cap would be exceeded" };
  }

  if (estimate.tokens > config.perTaskTokenBudget) {
    task.status = "awaiting-approval";
    store.updateTask(task.id, task);
    addAudit(task.id, "Budget Approval Required", `Token estimate ${estimate.tokens} exceeds per-task budget ${config.perTaskTokenBudget}`, "Harness");
    return { success: true, task };
  }

  // Governance Harness
  if (estimate.cost > config.autoApproveThreshold) {
    task.status = "awaiting-approval";
    store.updateTask(task.id, task);
    addAudit(task.id, "Approval Required", `Cost $${estimate.cost.toFixed(4)} exceeds auto-approve threshold $${config.autoApproveThreshold}`, "Harness");
    return { success: true, task };
  }

  // Auto-execute
  return executeWithHarness(task);
}

export function approveTask(taskId: string, approved: boolean, notes?: string): HarnessResult {
  const task = store.getTaskById(taskId);
  if (!task) return { success: false, blockedReason: "Task not found" };

  if (task.status !== "awaiting-approval") {
    return { success: false, task, blockedReason: "Task is not awaiting approval" };
  }

  if (!approved) {
    task.status = "rejected";
    task.approvalNotes = notes || "Rejected by user";
    store.updateTask(taskId, task);
    addAudit(taskId, "Task Rejected", notes || "Rejected by user", "User");
    return { success: false, task, blockedReason: "Rejected by user" };
  }

  task.approvalNotes = notes || "Approved";
  store.updateTask(taskId, task);
  addAudit(taskId, "Task Approved", notes || "Approved by user", "User");
  return executeWithHarness(task);
}

export function executeWithHarness(task: Task): HarnessResult {
  const config = store.getConfig();
  task.status = "executing";
  store.updateTask(task.id, task);
  addAudit(task.id, "Agent Execution Started", `Mode: ${task.mode}`, "Agent");

  const estimate = estimateCost(task.type, task.mode, task.description.length);
  const result = executeAgent(task.type, task.mode, task.description, estimate.tokens);

  if (!result.success) {
    if (task.retryCount < config.maxRetries) {
      task.retryCount++;
      store.updateTask(task.id, task);
      addAudit(task.id, "Execution Failed", `Retry ${task.retryCount}/${config.maxRetries}`, "Agent");
      return executeWithHarness(task);
    }
    task.status = "failed";
    task.actualCost = estimate.cost;
    store.addSpend(estimate.cost);
    store.updateTask(task.id, task);
    addAudit(task.id, "Execution Failed", `Max retries (${config.maxRetries}) exhausted`, "Agent", estimate.cost);
    return { success: false, task, blockedReason: "Max retries exhausted" };
  }

  task.tokensUsed = result.tokensUsed;
  task.actualCost = estimate.cost;
  store.addSpend(estimate.cost);
  task.output = result.output;

  // QA Harness
  task.status = "qa-review";
  store.updateTask(task.id, task);
  addAudit(task.id, "QA Review Started", "Verifying output quality", "QA Agent");

  const qaScore = Math.floor(Math.random() * 4) + 7; // 7-10 for demo
  task.qaScore = qaScore;

  if (qaScore < config.qaScoreThreshold) {
    if (task.retryCount < config.maxRetries) {
      task.retryCount++;
      task.status = "executing";
      store.updateTask(task.id, task);
      addAudit(task.id, "QA Failed", `Score ${qaScore} below threshold ${config.qaScoreThreshold}. Retrying...`, "QA Agent");
      return executeWithHarness(task);
    }
    task.status = "failed";
    store.updateTask(task.id, task);
    addAudit(task.id, "QA Failed", `Score ${qaScore} below threshold. Max retries exhausted.`, "QA Agent", estimate.cost);
    return { success: false, task, blockedReason: "QA score below threshold after max retries" };
  }

  task.status = "completed";
  store.updateTask(task.id, task);
  addAudit(task.id, "Task Completed", `QA Score: ${qaScore}/10, Cost: $${estimate.cost.toFixed(4)}`, "QA Agent", estimate.cost);

  return { success: true, task };
}
