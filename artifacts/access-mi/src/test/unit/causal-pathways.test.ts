import { describe, it, expect } from "vitest";
import { CAUSAL_PATHWAYS, getPathwayById } from "@/data/causalPathways";

describe("causalPathways registry", () => {
  it("defines Phase 1 and Phase 2 pathways", () => {
    expect(CAUSAL_PATHWAYS.length).toBeGreaterThanOrEqual(4);
    expect(getPathwayById("water-safety")).toBeDefined();
    expect(getPathwayById("superfund-proximity")).toBeDefined();
  });

  it("every pathway has valid confidence and steps with sources", () => {
    for (const pathway of CAUSAL_PATHWAYS) {
      expect(pathway.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(pathway.confidenceScore).toBeLessThanOrEqual(100);
      expect(pathway.steps.length).toBeGreaterThanOrEqual(2);
      expect(pathway.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      for (const step of pathway.steps) {
        expect(step.sources.length).toBeGreaterThanOrEqual(1);
        for (const src of step.sources) {
          expect(src.url).toMatch(/^https:\/\//);
          expect(src.name.length).toBeGreaterThan(0);
          expect(src.vintage.length).toBeGreaterThan(0);
        }
      }

      if (pathway.languageStandard === "evidence-backed") {
        const outcome = pathway.steps[pathway.steps.length - 1];
        expect(outcome.sources.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("getPathwayById resolves known ids", () => {
    expect(getPathwayById("air-respiratory")?.title).toContain("Air Quality");
    expect(getPathwayById("missing")).toBeUndefined();
  });
});