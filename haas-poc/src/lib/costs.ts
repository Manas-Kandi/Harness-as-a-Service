import { TaskType, ExecutionMode, CostEstimate } from "./types";

const COST_PER_1K_TOKENS: Record<ExecutionMode, number> = {
  fast: 0.005,
  standard: 0.015,
  "deep-research": 0.08,
};

const BASE_TOKENS: Record<TaskType, number> = {
  "draft-email": 800,
  "research-topic": 2000,
  "generate-report": 3000,
  "summarize-document": 1200,
};

export function estimateCost(
  taskType: TaskType,
  mode: ExecutionMode,
  descriptionLength: number
): CostEstimate {
  const base = BASE_TOKENS[taskType];
  const lengthFactor = Math.max(1, Math.ceil(descriptionLength / 100));
  const tokens = base * lengthFactor;
  const cost = (tokens / 1000) * COST_PER_1K_TOKENS[mode];
  return { tokens, cost: parseFloat(cost.toFixed(4)), mode };
}

export function getModeLabel(mode: ExecutionMode): string {
  const labels: Record<ExecutionMode, string> = {
    fast: "Fast (Lightweight)",
    standard: "Standard (Balanced)",
    "deep-research": "Deep Research (Intensive)",
  };
  return labels[mode];
}
