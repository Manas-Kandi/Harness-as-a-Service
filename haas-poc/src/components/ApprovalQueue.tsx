"use client";

import { useEffect, useState } from "react";
import { Task } from "@/lib/types";
import { CheckCircle, XCircle, Shield, AlertTriangle, Loader2 } from "lucide-react";

export default function ApprovalQueue({ refreshTrigger }: { refreshTrigger: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTasks((json.tasks || []).filter((t: Task) => t.status === "awaiting-approval"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleDecision = async (taskId: string, approved: boolean) => {
    setDeciding(taskId);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", taskId, approved }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setDeciding(null);
    }
  };

  if (!loading && !error && tasks.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Approval Queue</h2>
      </div>
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-zinc-500 dark:text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading approvals...
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/40 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{task.description}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Type: {task.type.replace(/-/g, " ")} &middot; Mode: {task.mode} &middot; Est: ${task.estimatedCost.toFixed(4)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecision(task.id, true)}
                disabled={deciding === task.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => handleDecision(task.id, false)}
                disabled={deciding === task.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
