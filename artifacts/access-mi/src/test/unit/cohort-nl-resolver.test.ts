import { describe, it, expect } from "vitest";
import { resolveCohortFromNaturalLanguage } from "@/utils/cohortNlResolver";

describe("cohortNlResolver", () => {
  it("does not match unrelated queries", () => {
    const result = resolveCohortFromNaturalLanguage("What is infant mortality?");
    expect(result.matched).toBe(false);
  });

  it("resolves pollution + access cohort intent", () => {
    const result = resolveCohortFromNaturalLanguage(
      "Which ZIPs have high PM2.5 and low primary care in Wayne?",
    );
    expect(result.matched).toBe(true);
    expect(result.href).toContain("/cohort-builder");
    expect(result.href).toContain("pm25=65");
    expect(result.href).toContain("pcp=1500");
    expect(result.criteria.counties).toContain("Wayne");
  });

  it("resolves energy burden + poverty", () => {
    const result = resolveCohortFromNaturalLanguage(
      "Find ZIPs with energy burden and poverty above average",
    );
    expect(result.matched).toBe(true);
    expect(result.href).toContain("energy=4.5");
    expect(result.href).toContain("poverty=15");
  });
});