import { describe, it, expect } from "vitest";
import {
  searchVerifiedClaims,
  formatVerifiedClaimsContext,
  EXAMPLE_ACCESSMI_QUERIES,
} from "@/utils/verifiedClaimsRag";

describe("verifiedClaimsRag", () => {
  it("returns matches for infant mortality query", () => {
    const matches = searchVerifiedClaims("infant mortality Michigan");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].text.toLowerCase()).toMatch(/infant/);
  });

  it("returns pathway matches for energy burden query", () => {
    const matches = searchVerifiedClaims("energy burden chronic disease");
    expect(matches.some((m) => m.category === "pathway")).toBe(true);
  });

  it("formats context block with verified label", () => {
    const matches = searchVerifiedClaims("PFAS Michigan", 3);
    const block = formatVerifiedClaimsContext(matches);
    expect(block).toContain("VERIFIED CLAIMS CONTEXT");
    if (matches.length > 0) {
      expect(block).toMatch(/VERIFIED|UNVERIFIED/);
    }
  });

  it("returns empty for blank query", () => {
    expect(searchVerifiedClaims("")).toEqual([]);
    expect(formatVerifiedClaimsContext([])).toBe("");
  });

  it("example queries are non-empty strings", () => {
    for (const q of EXAMPLE_ACCESSMI_QUERIES) {
      expect(q.length).toBeGreaterThan(10);
    }
  });
});