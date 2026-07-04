import { describe, expect, it } from "vitest";
import { INTELLIGENCE_DOMAINS } from "@/data/intelligence-domains";
import { MICHIGAN_COUNTIES_INTELLIGENCE, getCountyIntelligenceRecord } from "@/data/michigan-counties-intelligence";

describe("intelligence domain scaffolding", () => {
  // Originally 10 domains with 8-10 metrics each, most computed by
  // multiplying a real field by an uncited "placeholder calibration ratio."
  // Reduced to the 3 domains that (a) are actually routed to this
  // dashboard and (b) have at least one field traceable to a real,
  // ingested source. See FIXLOG.md.
  it("defines three domains, each with at least one real-data metric", () => {
    expect(INTELLIGENCE_DOMAINS).toHaveLength(3);
    expect(INTELLIGENCE_DOMAINS.map((d) => d.slug).sort()).toEqual([
      "food-security",
      "health",
      "housing",
    ]);
    expect(INTELLIGENCE_DOMAINS.every((domain) => domain.metrics.length >= 1)).toBe(true);
  });

  it("scaffolds all 83 Michigan counties and fills priority counties with real values", () => {
    expect(MICHIGAN_COUNTIES_INTELLIGENCE).toHaveLength(83);
    expect(getCountyIntelligenceRecord("Wayne")?.fips).toBe("26163");
    expect(getCountyIntelligenceRecord("Wayne")?.domainMetrics.health.uninsured_rate).toBeGreaterThan(0);
    expect(getCountyIntelligenceRecord("Wayne")?.domainMetrics.housing.renter_burden_rate).toBeGreaterThan(0);
    expect(getCountyIntelligenceRecord("Oakland")?.cityBreakdowns[0]?.zipCodes.length).toBeGreaterThan(0);
    expect(getCountyIntelligenceRecord("Alcona")?.domainMetrics.health.uninsured_rate).toBeNull();
  });

  it("no longer carries the removed life_expectancy/mental_health_access fabricated fields", () => {
    expect(getCountyIntelligenceRecord("Wayne")?.domainMetrics.health).not.toHaveProperty("life_expectancy");
    expect(getCountyIntelligenceRecord("Wayne")?.domainMetrics.health).not.toHaveProperty("mental_health_access");
  });
});
