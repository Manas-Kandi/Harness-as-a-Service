"use client";

import { useState } from "react";
import TaskForm from "@/components/TaskForm";
import TaskQueue from "@/components/TaskQueue";
import CostMeter from "@/components/CostMeter";
import AuditTrail from "@/components/AuditTrail";
import ApprovalQueue from "@/components/ApprovalQueue";
import HarnessConfig from "@/components/HarnessConfig";
import { Cpu, Shield } from "lucide-react";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSubmit = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black font-sans">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-lg">
              <Cpu className="w-5 h-5 text-white dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">HaaS</h1>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 -mt-0.5">Harness as a Service</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <Shield className="w-3.5 h-3.5" />
            <span>You are not buying software. You are harnessing agents.</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TaskForm onSubmit={handleSubmit} />
            <ApprovalQueue refreshTrigger={refreshTrigger} />
            <TaskQueue refreshTrigger={refreshTrigger} />
          </div>
          <div className="space-y-6">
            <CostMeter />
            <HarnessConfig refreshTrigger={refreshTrigger} />
            <AuditTrail refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}
