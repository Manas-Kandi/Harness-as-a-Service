import { TaskType, ExecutionMode } from "./types";

export interface AgentResult {
  output: string;
  tokensUsed: number;
  success: boolean;
}

const RESPONSES: Record<TaskType, string[]> = {
  "draft-email": [
    "Subject: Follow-up on our recent discussion\n\nDear [Name],\n\nI hope this message finds you well. I wanted to follow up on our conversation last week regarding the upcoming project timeline. Based on our discussion, I've outlined the next steps and would love to get your feedback.\n\nPlease let me know if you have any questions or concerns.\n\nBest regards,\n[Your Name]",
    "Subject: Meeting Request\n\nHi [Name],\n\nI hope you're doing well. I'd like to schedule a brief meeting to discuss the Q3 strategy and align on our priorities. Would you be available sometime this week?\n\nLooking forward to connecting.\n\nBest,\n[Your Name]",
  ],
  "research-topic": [
    "Key findings on the requested topic:\n\n1. Market size is projected to grow at 15% CAGR through 2028\n2. Three dominant players control 60% market share\n3. Emerging technologies in AI and automation are disrupting traditional workflows\n4. Regulatory changes expected in Q2 2025\n\nSources: Industry reports, analyst briefings, SEC filings",
    "Research Summary:\n\n- Primary trend: Shift toward decentralized systems\n- Key stakeholders: Enterprise clients, regulatory bodies, consumers\n- Risk factors: Supply chain dependencies, cybersecurity threats\n- Opportunity areas: SaaS migration, API-first architectures\n\nRecommendation: Proceed with phased approach",
  ],
  "generate-report": [
    "EXECUTIVE SUMMARY\n\nThis report analyzes current operational metrics and identifies three primary areas for optimization:\n\n1. Customer Acquisition Cost has increased 12% QoQ\n2. Retention rates remain strong at 94%\n3. New product line shows early traction with 8% of revenue\n\nAction items:\n- Review marketing spend allocation\n- Expand customer success team\n- Accelerate product roadmap for Q4",
    "ANALYTICAL REPORT\n\nFindings Overview:\n\nRevenue Growth: +18% YoY\nGross Margin: 72% (stable)\nOperating Expenses: Within budget (+3%)\n\nKey Insights:\n1. Enterprise segment driving 65% of new bookings\n2. Self-serve channel conversion improved to 4.2%\n3. Support ticket volume down 22% after recent releases\n\nStrategic Recommendations:\n- Double down on enterprise motion\n- Invest in self-serve onboarding\n- Continue product quality investments",
  ],
  "summarize-document": [
    "Document Summary:\n\nThe document outlines a strategic framework for digital transformation, emphasizing three pillars: technology modernization, workforce upskilling, and customer-centric design. Key takeaways include the importance of iterative implementation and cross-functional collaboration.\n\nCore message: Organizations that adopt agile methodologies see 40% faster time-to-value.",
    "Summary:\n\nThis policy document establishes new guidelines for data handling and privacy compliance. Major changes include enhanced encryption standards, mandatory quarterly audits, and expanded user consent mechanisms.\n\nEffective date: Next fiscal quarter\nImpact: All departments handling customer data\n\nAction required: Update internal procedures by end of month",
  ],
};

export function executeAgent(
  taskType: TaskType,
  mode: ExecutionMode,
  description: string,
  tokens: number
): AgentResult {
  const responses = RESPONSES[taskType];
  const responseIndex =
    description.length % responses.length;
  const output = responses[responseIndex];

  const success = mode !== "deep-research" || Math.random() > 0.15;

  return {
    output,
    tokensUsed: tokens,
    success,
  };
}
