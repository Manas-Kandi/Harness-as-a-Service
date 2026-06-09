"use client";

import { useEffect, useState } from "react";
import { HarnessConfig as ConfigType } from "@/lib/types";
import { Settings, DollarSign, Hash, CheckCircle, RotateCcw, AlertTriangle } from "lucide-react";

export default function HarnessConfig({ refreshTrigger }: { refreshTrigger: number }) {
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/harness/config");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setConfig(json.config);
      setMonthlySpend(json.monthlySpend);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch config");
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [refreshTrigger]);

  const updateField = async (field: keyof ConfigType, value: number) => {
    if (!config) return;
    setLoading(true);
    try {
      const newConfig = { ...config, [field]: value };
      const res = await fetch("/api/harness/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setConfig(json.config);
      setMonthlySpend(json.monthlySpend);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update config");
    } finally {
      setLoading(false);
    }
  };

  if (!config) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Settings className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Harness Configuration</h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-4">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
      <div className="space-y-5">
        <ConfigField
          label="Monthly Spend Cap"
          icon={<DollarSign className="w-4 h-4" />}
          value={config.monthlySpendCap}
          min={1}
          max={500}
          step={1}
          unit="$"
          onChange={(v) => updateField("monthlySpendCap", v)}
          disabled={loading}
        />
        <ConfigField
          label="Per-Task Token Budget"
          icon={<Hash className="w-4 h-4" />}
          value={config.perTaskTokenBudget}
          min={500}
          max={50000}
          step={500}
          unit="tokens"
          onChange={(v) => updateField("perTaskTokenBudget", v)}
          disabled={loading}
        />
        <ConfigField
          label="Auto-Approve Threshold"
          icon={<CheckCircle className="w-4 h-4" />}
          value={config.autoApproveThreshold}
          min={0}
          max={5}
          step={0.05}
          unit="$"
          onChange={(v) => updateField("autoApproveThreshold", v)}
          disabled={loading}
        />
        <ConfigField
          label="QA Score Threshold"
          icon={<CheckCircle className="w-4 h-4" />}
          value={config.qaScoreThreshold}
          min={1}
          max={10}
          step={1}
          unit="/10"
          onChange={(v) => updateField("qaScoreThreshold", v)}
          disabled={loading}
        />
        <ConfigField
          label="Max Retries"
          icon={<RotateCcw className="w-4 h-4" />}
          value={config.maxRetries}
          min={0}
          max={10}
          step={1}
          unit="attempts"
          onChange={(v) => updateField("maxRetries", v)}
          disabled={loading}
        />
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Current Monthly Spend</span>
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">${monthlySpend.toFixed(4)}</span>
      </div>
    </div>
  );
}

function ConfigField({
  label,
  icon,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {icon}
          {label}
        </div>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {value.toFixed(step < 1 ? 2 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100 disabled:opacity-50"
      />
    </div>
  );
}
