import { describe, it, expect, beforeEach } from "vitest";
import { Store } from "./store";
import { Task } from "./types";

describe("Store", () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();
  });

  it("starts empty", () => {
    expect(store.getTasks()).toEqual([]);
    expect(store.getAuditLog()).toEqual([]);
    expect(store.getMonthlySpend()).toBe(0);
  });

  it("adds and retrieves tasks sorted by createdAt desc", () => {
    const t1: Task = {
      id: "1",
      type: "draft-email",
      description: "a",
      mode: "fast",
      status: "completed",
      createdAt: "2024-01-01T00:00:00Z",
      requestedBy: "User",
      priority: "low",
      estimatedCost: 0.01,
      actualCost: 0.01,
      tokensUsed: 100,
      retryCount: 0,
    };
    const t2: Task = {
      id: "2",
      type: "research-topic",
      description: "b",
      mode: "standard",
      status: "queued",
      createdAt: "2024-01-02T00:00:00Z",
      requestedBy: "User",
      priority: "high",
      estimatedCost: 0.05,
      actualCost: 0,
      tokensUsed: 0,
      retryCount: 0,
    };
    store.addTask(t1);
    store.addTask(t2);
    const tasks = store.getTasks();
    expect(tasks[0].id).toBe("2");
    expect(tasks[1].id).toBe("1");
  });

  it("updates a task", () => {
    const task: Task = {
      id: "1",
      type: "draft-email",
      description: "a",
      mode: "fast",
      status: "queued",
      createdAt: "2024-01-01T00:00:00Z",
      requestedBy: "User",
      priority: "low",
      estimatedCost: 0.01,
      actualCost: 0,
      tokensUsed: 0,
      retryCount: 0,
    };
    store.addTask(task);
    const updated = store.updateTask("1", { status: "completed", actualCost: 0.01 });
    expect(updated?.status).toBe("completed");
    expect(updated?.actualCost).toBe(0.01);
  });

  it("returns undefined for missing task", () => {
    expect(store.getTaskById("missing")).toBeUndefined();
    expect(store.updateTask("missing", { status: "completed" })).toBeUndefined();
  });

  it("tracks monthly spend", () => {
    store.addSpend(1.5);
    store.addSpend(2.5);
    expect(store.getMonthlySpend()).toBe(4.0);
  });

  it("updates config partially", () => {
    const original = store.getConfig();
    const updated = store.updateConfig({ monthlySpendCap: 100 });
    expect(updated.monthlySpendCap).toBe(100);
    expect(updated.autoApproveThreshold).toBe(original.autoApproveThreshold);
  });
});
