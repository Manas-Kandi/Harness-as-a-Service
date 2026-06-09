"use client";

import { useEffect, useState } from "react";
import { AuditEntry } from "@/lib/types";
import { Activity, User, Bot, ShieldCheck, AlertOctagon } from "lucide-react";

const actorIcons: Record<string, React.ReactNode> = {
  User: <User className="w-3.5 h-3.5" />,
  Agent: <Bot className="w-3.5 h-3.5" />,
  Harness: <ShieldCheck className="w-3.5 h-3.5" />,
  "QA Agent": <ShieldCheck className="w-3.5 h-3.5" />,
};

const eventColors: Record<string, string> = {
  "Task Submitted": "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
  "Cost Control Blocked": "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30",
  "Budget Approval Required": "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
  "Approval Required": "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
  "Task Approved": "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
  "Task Rejected": "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30",
  "Agent Execution Started": "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30",
  "Execution Failed": "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30",
  "QA Review Started": "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30",
  "QA Failed": "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30",
  "Task Completed": "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
};

export default function AuditTrail({ refreshTrigger }: { refreshTrigger: number }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  const fetchAudit = async () => {
    const res = await fetch("/api/audit");
    const json = await res.json();
    setEntries(json.auditLog || []);
  };

  useEffect(() => {
    fetchAudit();
    const interval = setInterval(fetchAudit, 2000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Audit Trail</h2>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {entries.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">No events recorded yet.</p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50"
          >
            <div className={`mt-0.5 p-1.5 rounded-md ${eventColors[entry.event] || "text-zinc-600 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-800"}`}>
              {actorIcons[entry.actor] || <AlertOctagon className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{entry.event}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{entry.details}</p>
              {entry.costDelta !== undefined && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                  Cost: ${entry.costDelta.toFixed(4)}
                </p>
              )}
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              {entry.actor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
