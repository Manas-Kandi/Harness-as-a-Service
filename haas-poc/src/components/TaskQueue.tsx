"use client";

import { useEffect, useState } from "react";
import { Task, TaskStatus } from "@/lib/types";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle, RefreshCw, AlertTriangle, Filter } from "lucide-react";

const statusConfig: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string }> = {
  queued: { label: "Queued", icon: <Clock className="w-4 h-4" />, color: "text-zinc-500" },
  "awaiting-approval": { label: "Awaiting Approval", icon: <AlertCircle className="w-4 h-4" />, color: "text-amber-500" },
  executing: { label: "Executing", icon: <Loader2 className="w-4 h-4 animate-spin" />, color: "text-blue-500" },
  "qa-review": { label: "QA Review", icon: <RefreshCw className="w-4 h-4 animate-spin" />, color: "text-purple-500" },
  completed: { label: "Completed", icon: <CheckCircle className="w-4 h-4" />, color: "text-emerald-500" },
  rejected: { label: "Rejected", icon: <XCircle className="w-4 h-4" />, color: "text-red-500" },
  failed: { label: "Failed", icon: <XCircle className="w-4 h-4" />, color: "text-red-500" },
};

export default function TaskQueue({ refreshTrigger }: { refreshTrigger: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<Task["type"] | "all">("all");

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTasks(json.tasks || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const getTypeLabel = (type: Task["type"]) =>
    type
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    return true;
  });

  const allTypes: Task["type"][] = ["draft-email", "research-topic", "generate-report", "summarize-document"];
  const allStatuses: TaskStatus[] = ["queued", "awaiting-approval", "executing", "qa-review", "completed", "rejected", "failed"];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Task Queue</h2>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">{filteredTasks.length} / {tasks.length}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as Task["type"] | "all")}
          className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-zinc-700 dark:text-zinc-300"
        >
          <option value="all">All Types</option>
          {allTypes.map((t) => (
            <option key={t} value={t}>{getTypeLabel(t)}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
          className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-zinc-700 dark:text-zinc-300"
        >
          <option value="all">All Statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500 dark:text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading tasks...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}
        {!loading && !error && filteredTasks.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
            {tasks.length === 0 ? "No tasks yet. Submit one above." : "No tasks match the selected filters."}
          </p>
        )}
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {getTypeLabel(task.type)}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 capitalize">
                    {task.mode}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 capitalize">
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate">{task.description}</p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${statusConfig[task.status].color}`}>
                {statusConfig[task.status].icon}
                {statusConfig[task.status].label}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Est: ${task.estimatedCost.toFixed(4)}</span>
              {task.actualCost > 0 && <span>Actual: ${task.actualCost.toFixed(4)}</span>}
              {task.tokensUsed > 0 && <span>{task.tokensUsed} tokens</span>}
              {task.qaScore !== undefined && <span>QA: {task.qaScore}/10</span>}
              {task.retryCount > 0 && <span>Retries: {task.retryCount}</span>}
              {task.durationMs !== undefined && (
                <span>{(task.durationMs / 1000).toFixed(1)}s</span>
              )}
            </div>

            {task.output && (
              <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                {task.output}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
