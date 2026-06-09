import { z } from "zod";

export const TaskTypeSchema = z.enum([
  "draft-email",
  "research-topic",
  "generate-report",
  "summarize-document",
]);

export const ExecutionModeSchema = z.enum(["fast", "standard", "deep-research"]);

export const PrioritySchema = z.enum(["low", "medium", "high"]);

export const SubmitTaskSchema = z.object({
  action: z.literal("submit"),
  type: TaskTypeSchema,
  description: z.string().min(1, "Description is required").max(5000, "Description too long"),
  mode: ExecutionModeSchema,
  priority: PrioritySchema,
  requestedBy: z.string().min(1, "requestedBy is required"),
});

export const ApproveTaskSchema = z.object({
  action: z.literal("approve"),
  taskId: z.string().min(1, "taskId is required"),
  approved: z.boolean(),
  notes: z.string().optional(),
});

export const UpdateHarnessConfigSchema = z.object({
  perTaskTokenBudget: z.number().int().min(1).max(50000).optional(),
  monthlySpendCap: z.number().min(0.01).max(10000).optional(),
  autoApproveThreshold: z.number().min(0).max(100).optional(),
  qaScoreThreshold: z.number().int().min(1).max(10).optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
});
