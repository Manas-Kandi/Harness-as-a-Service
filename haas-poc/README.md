# HaaS — Harness as a Service

**You are not buying software. You are harnessing agents.**

This is a proof-of-concept demonstrating how a traditional SaaS suite (in this case, a Virtual Assistant / Business Operations platform) can be replaced by a system of **agentic workers governed by a harness**.

## The Core Idea

Instead of paying for static software features, HaaS customers pay for outcomes produced by AI agents. The real product is not the agents themselves — it is the **harness** that wraps them: cost controls, governance gates, quality assurance, and audit trails. The harness ensures agents execute safely, stay within budget, and produce verifiable results.

## What This PoC Demonstrates

A functional dashboard where you can:

- Submit business tasks (draft emails, research topics, generate reports, summarize documents)
- See real-time cost estimates before any agent runs
- Watch tasks flow through 4 harness layers
- Approve or reject expensive tasks
- Track every decision in a complete audit trail
- Configure harness parameters (budgets, thresholds, retry limits)

## Architecture

### Harness Layers

| Layer | Purpose | What It Does |
|-------|---------|-------------|
| **Cost Control** | Keep spend predictable | Per-task token budgets, monthly spend caps, pre-execution cost estimates |
| **Governance** | Human-in-the-loop for expensive work | Auto-approves cheap tasks; routes expensive/sensitive tasks to human approval queue |
| **Quality Assurance** | Ensure output quality | Post-execution verifier scores output 1-10; retries up to max limit if score is too low |
| **Audit & Observability** | Full transparency | Append-only log of every event: submission, approvals, execution, QA, completion, costs |

### Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide icons
- **Backend:** Next.js API Routes (in-memory store for PoC)
- **Agent Engine:** Simulated LLM executor with realistic outputs and token/cost estimation
- **State:** In-memory (no external DB needed for demo)

## File Structure

```
src/
  lib/
    types.ts          # Core types: Task, AuditEntry, HarnessConfig
    store.ts          # In-memory data store
    costs.ts          # Cost estimation logic (tiered pricing)
    agents.ts         # Simulated agent executor
    harness.ts        # 4-layer harness orchestrator
  app/
    page.tsx          # Main dashboard
    layout.tsx        # Root layout
    api/
      tasks/route.ts          # Task submission & approval
      audit/route.ts          # Audit trail
      harness/config/route.ts # Harness configuration
  components/
    TaskForm.tsx      # Submit new tasks with cost estimates
    TaskQueue.tsx     # View all tasks and outputs
    CostMeter.tsx     # Monthly spend tracker
    AuditTrail.tsx    # Full event timeline
    ApprovalQueue.tsx # Human approval interface
    HarnessConfig.tsx # Adjustable harness parameters
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Try It Out

1. **Submit a cheap task:** Choose "Draft Email" + "Standard" mode. It auto-executes and completes instantly (~$0.01).
2. **Submit an expensive task:** Choose "Research Topic" + "Deep Research" mode. It pauses in the Approval Queue due to cost. Approve it to see it execute.
3. **Watch the harness work:** Every step — submission, cost estimate, approval decision, agent execution, QA review, completion — is recorded in the Audit Trail with timestamps and costs.
4. **Tighten the harness:** Lower the "Auto-Approve Threshold" or "Monthly Spend Cap" in the Harness Config panel. Submit more tasks. See them get blocked or require approval.

## Cost Tiers

| Mode | Cost / 1K tokens | Use Case |
|------|-----------------|----------|
| Fast | $0.005 | Quick, lightweight tasks |
| Standard | $0.015 | Balanced quality and speed |
| Deep Research | $0.08 | Complex, intensive analysis |

## Why This Matters

In a HaaS world:
- Software features become agent capabilities
- Your subscription fee becomes an agent budget
- The vendor's moat is not their codebase — it is their harness
- Customers get transparent, per-outcome pricing instead of opaque per-seat fees

This PoC is a functioning argument that the future of software is not more software. It is better harnesses for the agents that replace it.
