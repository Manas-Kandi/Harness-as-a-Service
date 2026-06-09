import { describe, it, expect } from "vitest";
import { SubmitTaskSchema, ApproveTaskSchema, UpdateHarnessConfigSchema } from "./validation";

describe("SubmitTaskSchema", () => {
  it("accepts valid submit payload", () => {
    const result = SubmitTaskSchema.safeParse({
      action: "submit",
      type: "draft-email",
      description: "Write a follow-up email",
      mode: "standard",
      priority: "high",
      requestedBy: "Alice",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty description", () => {
    const result = SubmitTaskSchema.safeParse({
      action: "submit",
      type: "draft-email",
      description: "",
      mode: "standard",
      priority: "high",
      requestedBy: "Alice",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = SubmitTaskSchema.safeParse({
      action: "submit",
      type: "hack-the-mainframe",
      description: "test",
      mode: "standard",
      priority: "high",
      requestedBy: "Alice",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = SubmitTaskSchema.safeParse({
      action: "submit",
      type: "draft-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("ApproveTaskSchema", () => {
  it("accepts valid approval", () => {
    const result = ApproveTaskSchema.safeParse({
      action: "approve",
      taskId: "abc123",
      approved: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts rejection with notes", () => {
    const result = ApproveTaskSchema.safeParse({
      action: "approve",
      taskId: "abc123",
      approved: false,
      notes: "Too expensive",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing taskId", () => {
    const result = ApproveTaskSchema.safeParse({
      action: "approve",
      approved: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateHarnessConfigSchema", () => {
  it("accepts valid partial update", () => {
    const result = UpdateHarnessConfigSchema.safeParse({ monthlySpendCap: 75 });
    expect(result.success).toBe(true);
  });

  it("rejects negative spend cap", () => {
    const result = UpdateHarnessConfigSchema.safeParse({ monthlySpendCap: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range retries", () => {
    const result = UpdateHarnessConfigSchema.safeParse({ maxRetries: 99 });
    expect(result.success).toBe(false);
  });
});
