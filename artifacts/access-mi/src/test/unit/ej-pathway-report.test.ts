import { describe, it, expect } from "vitest";
import {
  generateEJPathwayReportText,
} from "@/utils/generateEJPathwayReport";
import { CAUSAL_PATHWAYS } from "@/data/causalPathways";
import {
  isValidShareId,
  cohortShareUrl,
} from "@/Services/cohortCloudSync";

describe("generateEJPathwayReport", () => {
  it("includes all pathways with sources in text report", () => {
    const text = generateEJPathwayReportText();
    for (const p of CAUSAL_PATHWAYS) {
      expect(text.toUpperCase()).toContain(p.title.toUpperCase());
      for (const step of p.steps) {
        expect(text).toContain(step.label);
        expect(text).toContain(step.sources[0].name);
      }
    }
  });

  it("includes integrity methodology footer", () => {
    const text = generateEJPathwayReportText();
    expect(text).toContain("VERIFIED");
    expect(text).toContain("accessmi.org/data-sources");
  });
});

describe("cohortCloudSync helpers", () => {
  it("validates UUID share ids", () => {
    expect(isValidShareId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidShareId("not-a-uuid")).toBe(false);
  });

  it("builds share URLs", () => {
    const url = cohortShareUrl("550e8400-e29b-41d4-a716-446655440000");
    expect(url).toContain("/cohort-builder?share=");
    expect(url).toContain("550e8400-e29b-41d4-a716-446655440000");
  });
});