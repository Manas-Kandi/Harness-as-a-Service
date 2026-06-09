import { describe, it, expect } from "vitest";
import { estimateCost, getModeLabel } from "./costs";

describe("estimateCost", () => {
  it("calculates cost for draft-email in fast mode", () => {
    const result = estimateCost("draft-email", "fast", 50);
    expect(result.tokens).toBeGreaterThan(0);
    expect(result.cost).toBeGreaterThan(0);
    expect(result.mode).toBe("fast");
  });

  it("scales tokens with description length", () => {
    const short = estimateCost("research-topic", "standard", 50);
    const long = estimateCost("research-topic", "standard", 250);
    expect(long.tokens).toBeGreaterThan(short.tokens);
  });

  it("deep-research is more expensive than standard for same task", () => {
    const standard = estimateCost("generate-report", "standard", 100);
    const deep = estimateCost("generate-report", "deep-research", 100);
    expect(deep.cost).toBeGreaterThan(standard.cost);
  });

  it("uses at least length factor 1", () => {
    const result = estimateCost("summarize-document", "fast", 0);
    expect(result.tokens).toBeGreaterThan(0);
  });
});

describe("getModeLabel", () => {
  it("returns human-readable labels", () => {
    expect(getModeLabel("fast")).toContain("Fast");
    expect(getModeLabel("standard")).toContain("Standard");
    expect(getModeLabel("deep-research")).toContain("Deep Research");
  });
});
