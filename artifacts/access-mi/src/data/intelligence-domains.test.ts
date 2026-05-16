import { describe, expect, it } from "vitest";
import { INTELLIGENCE_DOMAINS } from "@/data/intelligence-domains";
import { MICHIGAN_COUNTIES_INTELLIGENCE, getCountyIntelligenceRecord } from "@/data/michigan-counties-intelligence";

describe("intelligence domain scaffolding", () => {
  it("defines ten domains with at least eight metrics each", () => {
    expect(INTELLIGENCE_DOMAINS).toHaveLength(10);
    expect(INTELLIGENCE_DOMAINS.every((domain) => domain.metrics.length >= 8 && domain.metrics.length <= 10)).toBe(true);
  });

  it("scaffolds all 83 Michigan counties and fills priority counties", () => {
    expect(MICHIGAN_COUNTIES_INTELLIGENCE).toHaveLength(83);
    expect(getCountyIntelligenceRecord("Wayne")?.fips).toBe("26163");
    expect(getCountyIntelligenceRecord("Wayne")?.domainMetrics.health.life_expectancy).toBeGreaterThan(70);
    expect(getCountyIntelligenceRecord("Oakland")?.cityBreakdowns[0]?.zipCodes.length).toBeGreaterThan(0);
    expect(getCountyIntelligenceRecord("Alcona")?.domainMetrics.health.life_expectancy).toBeNull();
  });
});
