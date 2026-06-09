"use client";

import { useState } from "react";
import { TaskType, ExecutionMode } from "@/lib/types";
import { estimateCost, getModeLabel } from "@/lib/costs";
import { Zap, Scale, Search, Send, DollarSign, AlertTriangle } from "lucide-react";

const taskLabels: Record<TaskType, string> = {
  "draft-email": "Draft Email",
  "research-topic": "Research Topic",
  "generate-report": "Generate Report",
  "summarize-document": "Summarize Document",
};

const modeIcons: Record<ExecutionMode, React.ReactNode> = {
  fast: <Zap className="w-4 h-4" />,
  standard: <Scale className="w-4 h-4" />,
  "deep-research": <Search className="w-4 h-4" />,
};

export default function TaskForm({ onSubmit }: { onSubmit: () => void }) {
  const [type, setType] = useState<TaskType>("draft-email");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<ExecutionMode>("standard");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = estimateCost(type, mode, description.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          type,
          description,
          mode,
          priority,
          requestedBy: "User",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDescription("");
      onSubmit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Submit New Task</h2>

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(taskLabels) as TaskType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
              type === t
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
            }`}
          >
            {taskLabels[t]}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you need..."
          className="w-full h-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Execution Mode</label>
        <div className="flex gap-2">
          {(Object.keys(modeIcons) as ExecutionMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                mode === m
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
              }`}
            >
              {modeIcons[m]}
              {getModeLabel(m)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Priority</label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                priority === p
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <DollarSign className="w-4 h-4" />
          <span>Estimated Cost:</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            ${estimate.cost.toFixed(4)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{estimate.tokens} tokens</div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !description.trim()}
        className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:text-zinc-900 rounded-lg py-2.5 font-medium transition-colors"
      >
        <Send className="w-4 h-4" />
        {loading ? "Submitting..." : "Submit Task"}
      </button>
    </form>
  );
}
