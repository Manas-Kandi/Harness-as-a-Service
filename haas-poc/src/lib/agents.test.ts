import { describe, it, expect } from "vitest";
import { executeAgent } from "./agents";

describe("executeAgent", () => {
  it("returns a non-empty output for each task type", () => {
    const types = ["draft-email", "research-topic", "generate-report", "summarize-document"] as const;
    for (const type of types) {
      const result = executeAgent(type, "standard", "test description", 1000);
      expect(result.success).toBe(true);
      expect(result.output).toBeTruthy();
      expect(result.tokensUsed).toBe(1000);
    }
  });

  it("returns deterministic output for same description length", () => {
    const r1 = executeAgent("draft-email", "standard", "hello", 100);
    const r2 = executeAgent("draft-email", "standard", "hello", 100);
    expect(r1.output).toBe(r2.output);
  });

  it("sometimes fails for deep-research mode", () => {
    let failures = 0;
    for (let i = 0; i < 100; i++) {
      const result = executeAgent("research-topic", "deep-research", "long description here", 1000);
      if (!result.success) failures++;
    }
    expect(failures).toBeGreaterThan(0);
    expect(failures).toBeLessThan(30);
  });
});
