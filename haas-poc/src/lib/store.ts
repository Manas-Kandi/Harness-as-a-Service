import { Task, AuditEntry, HarnessConfig } from "./types";

// In-memory store for the PoC
export class Store {
  private tasks: Task[] = [];
  private auditLog: AuditEntry[] = [];
  private config: HarnessConfig = {
    perTaskTokenBudget: 4000,
    monthlySpendCap: 50.0,
    autoApproveThreshold: 0.15,
    qaScoreThreshold: 7,
    maxRetries: 2,
  };
  private monthlySpend = 0.0;

  // Tasks
  getTasks(): Task[] {
    return [...this.tasks].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  addTask(task: Task): void {
    this.tasks.push(task);
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.tasks[idx] = { ...this.tasks[idx], ...updates };
    return this.tasks[idx];
  }

  // Audit Log
  getAuditLog(): AuditEntry[] {
    return [...this.auditLog].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  addAuditEntry(entry: AuditEntry): void {
    this.auditLog.push(entry);
  }

  // Harness Config
  getConfig(): HarnessConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<HarnessConfig>): HarnessConfig {
    this.config = { ...this.config, ...updates };
    return { ...this.config };
  }

  // Monthly Spend
  getMonthlySpend(): number {
    return this.monthlySpend;
  }

  addSpend(amount: number): void {
    this.monthlySpend += amount;
  }

  reset(): void {
    this.tasks = [];
    this.auditLog = [];
    this.config = {
      perTaskTokenBudget: 4000,
      monthlySpendCap: 50.0,
      autoApproveThreshold: 0.15,
      qaScoreThreshold: 7,
      maxRetries: 2,
    };
    this.monthlySpend = 0.0;
  }
}

export const store = new Store();
