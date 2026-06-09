export type TaskType = "draft-email" | "research-topic" | "generate-report" | "summarize-document";

export type ExecutionMode = "fast" | "standard" | "deep-research";

export type TaskStatus =
  | "queued"
  | "awaiting-approval"
  | "executing"
  | "qa-review"
  | "completed"
  | "rejected"
  | "failed";

export interface Task {
  id: string;
  type: TaskType;
  description: string;
  mode: ExecutionMode;
  status: TaskStatus;
  createdAt: string;
  requestedBy: string;
  priority: "low" | "medium" | "high";
  estimatedCost: number;
  actualCost: number;
  tokensUsed: number;
  output?: string;
  qaScore?: number;
  retryCount: number;
  approvalNotes?: string;
}

export interface AuditEntry {
  id: string;
  taskId: string;
  timestamp: string;
  event: string;
  details: string;
  actor: string;
  costDelta?: number;
}

export interface HarnessConfig {
  perTaskTokenBudget: number;
  monthlySpendCap: number;
  autoApproveThreshold: number;
  qaScoreThreshold: number;
  maxRetries: number;
}

export interface CostEstimate {
  tokens: number;
  cost: number;
  mode: ExecutionMode;
}
