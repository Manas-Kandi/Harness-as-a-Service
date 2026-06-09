"use client";

import { useEffect, useState } from "react";
import { Task, TaskStatus } from "@/lib/types";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle, RefreshCw, AlertTriangle } from "lucide-react";

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

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Task Queue</h2>
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
        {!loading && !error && tasks.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">No tasks yet. Submit one above.</p>
        )}
        {tasks.map((task) => (
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
