import { describe, expect, it } from "vitest";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { computeCivicScore, explainCivicScore } from "@/lib/civic-score";

describe("Civic Insight Score explanation", () => {
  it("explains exactly the score that is displayed, for every county", () => {
    for (const county of Object.keys(COUNTY_PROFILES)) {
      const e = explainCivicScore(county)!;
      const sum = e.base + e.inputs.reduce((s, i) => s + i.points, 0);
      expect(e.score).toBe(computeCivicScore(county));
      expect(e.score).toBe(Math.max(10, Math.min(95, sum)));
    }
  });

  it("flags a missing input instead of hiding the default that replaced it", () => {
    const flagged = Object.keys(COUNTY_PROFILES).filter((c) => explainCivicScore(c)!.inputs.some((i) => i.imputed));
    for (const c of flagged) {
      const imputed = explainCivicScore(c)!.inputs.filter((i) => i.imputed);
      for (const i of imputed) expect(Number.isNaN(parseFloat(i.value ?? ""))).toBe(true);
    }
  });

  it("returns null for an unknown county rather than a default score", () => {
    expect(explainCivicScore("Atlantis")).toBeNull();
  });
});
