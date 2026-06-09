"use client";

import { useEffect, useState } from "react";
import { DollarSign, AlertTriangle } from "lucide-react";

export default function CostMeter() {
  const [data, setData] = useState<{ monthlySpend: number; config: { monthlySpendCap: number } } | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/harness/config");
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const { monthlySpend, config } = data;
  const pct = Math.min((monthlySpend / config.monthlySpendCap) * 100, 100);
  const nearLimit = pct > 80;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Monthly Spend</h3>
        </div>
        {nearLimit && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Near Limit
          </div>
        )}
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          ${monthlySpend.toFixed(4)}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          / ${config.monthlySpendCap.toFixed(2)} cap
        </span>
      </div>
      <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            nearLimit ? "bg-amber-500" : "bg-emerald-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
