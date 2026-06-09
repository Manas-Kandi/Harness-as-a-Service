import { describe, it, expect, beforeEach } from "vitest";
import { store } from "./store";
import { submitTask, approveTask } from "./harness";

describe("harness", () => {
  beforeEach(() => {
    store.reset();
  });

  describe("submitTask", () => {
    it("auto-executes cheap tasks", () => {
      const result = submitTask("draft-email", "Quick note", "fast", "low", "User");
      expect(result.success).toBe(true);
      const task = store.getTasks()[0];
      expect(task).toBeDefined();
      expect(["completed", "failed"]).toContain(task.status);
      expect(task.startedAt).toBeDefined();
    });

    it("blocks tasks that would exceed monthly cap", () => {
      store.updateConfig({ monthlySpendCap: 0.001 });
      const result = submitTask("draft-email", "Quick note", "fast", "low", "User");
      expect(result.success).toBe(false);
      expect(result.blockedReason).toContain("Monthly spend cap");
    });

    it("routes expensive tasks to approval queue", () => {
      store.updateConfig({ autoApproveThreshold: 0.001 });
      const result = submitTask("generate-report", "Q3 financials deep dive", "deep-research", "high", "User");
      expect(result.success).toBe(true);
      expect(result.task?.status).toBe("awaiting-approval");
    });

    it("requires approval when token budget is exceeded", () => {
      store.updateConfig({ perTaskTokenBudget: 1 });
      const result = submitTask("generate-report", "Q3 financials deep dive", "standard", "high", "User");
      expect(result.success).toBe(true);
      expect(result.task?.status).toBe("awaiting-approval");
    });
  });

  describe("approveTask", () => {
    it("executes approved tasks", () => {
      store.updateConfig({ autoApproveThreshold: 0.001 });
      const submitResult = submitTask("generate-report", "Q3 financials deep dive", "deep-research", "high", "User");
      expect(submitResult.task).toBeDefined();
      const task = submitResult.task!;
      expect(task.status).toBe("awaiting-approval");

      const result = approveTask(task.id, true, "Looks good");
      expect(result.success).toBe(true);
    });

    it("rejects tasks", () => {
      store.updateConfig({ autoApproveThreshold: 0.001 });
      const submitResult = submitTask("generate-report", "Q3 financials deep dive", "deep-research", "high", "User");
      const task = submitResult.task!;
      const result = approveTask(task.id, false, "Too expensive");
      expect(result.success).toBe(false);
      expect(result.blockedReason).toContain("Rejected");
      const updated = store.getTaskById(task.id);
      expect(updated?.status).toBe("rejected");
    });

    it("returns error for missing task", () => {
      const result = approveTask("nonexistent", true);
      expect(result.success).toBe(false);
      expect(result.blockedReason).toBe("Task not found");
    });

    it("returns error for task not awaiting approval", () => {
      const submitResult = submitTask("draft-email", "note", "fast", "low", "User");
      const task = submitResult.task!;
      const result = approveTask(task.id, true);
      expect(result.success).toBe(false);
      expect(result.blockedReason).toBe("Task is not awaiting approval");
    });
  });
});
