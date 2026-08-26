import { describe, expect, it } from "vitest";
import {
  OPPORTUNITY_LENSES,
  getOpportunityInsights,
} from "@/data/opportunityAtlas";
import {
  resolveOpportunityPlace,
  resolveOpportunityPlaceId,
} from "@/lib/opportunityPlaceResolver";

describe("Community Opportunity Atlas data contracts", () => {
  it("resolves supported cities to explicit county context", () => {
    const detroit = resolveOpportunityPlace("Detroit");
    expect(detroit).not.toBeNull();
    expect(detroit?.geographyType).toBe("city");
    expect(detroit?.countyName).toBe("Wayne");
    expect(detroit?.countyFips).toBe("26163");
    expect(detroit?.resolutionNote).toContain("county-context values");
  });

  it("resolves counties with full five-digit FIPS canonical IDs", () => {
    const wayne = resolveOpportunityPlace("Wayne County");
    expect(wayne?.id).toBe("county-26163");
    expect(wayne?.countyFips).toBe("26163");
    expect(resolveOpportunityPlaceId("county-26163")?.countyName).toBe("Wayne");
    expect(resolveOpportunityPlaceId("county-163")).toBeNull();
  });

  it("resolves ZIPs without pretending county metrics are ZIP metrics", () => {
    const place = resolveOpportunityPlace("48322");
    expect(place).not.toBeNull();
    expect(place?.geographyType).toBe("zcta");
    expect(place?.countyName).toBe("Oakland");
    expect(place?.countyFips).toBe("26125");
    expect(place?.resolutionNote).toContain(
      "not represented as ZIP-level measurements",
    );
  });

  it("round-trips canonical public geography IDs", () => {
    expect(resolveOpportunityPlaceId("city-detroit")?.countyName).toBe("Wayne");
    expect(resolveOpportunityPlaceId("zcta-48322")?.countyName).toBe("Oakland");
  });

  it("keeps raw source provenance separate from modeled comparison math", () => {
    const place = resolveOpportunityPlace("Wayne County");
    expect(place).not.toBeNull();
    const insights = getOpportunityInsights(place!);
    expect(insights.length).toBeGreaterThanOrEqual(3);
    expect(insights.some((item) => item.provenanceLabel === "VERIFIED")).toBe(
      true,
    );
    expect(
      insights.every((item) => item.benchmark.provenanceLabel === "MODELED"),
    ).toBe(true);
    expect(insights.every((item) => item.nativeResolution === "county")).toBe(
      true,
    );
  });

  it("does not silently upgrade fine-grain lenses before ingestion or permission review", () => {
    const statuses = Object.fromEntries(
      OPPORTUNITY_LENSES.map((lens) => [lens.id, lens.status]),
    );
    expect(statuses["usda-sram-2025"]).toBe("ingestion-pending");
    expect(statuses["tree-equity"]).toBe("ingestion-pending");
    expect(statuses.parkserve).toBe("permission-review");
    expect(statuses["miejscreen-1-5"]).toBe("ingestion-pending");
    expect(
      OPPORTUNITY_LENSES.every((lens) => lens.provenanceLabel === "PENDING"),
    ).toBe(true);
  });

  it("contains no opaque best/worst community score language", () => {
    const place = resolveOpportunityPlace("Wayne County");
    const corpus = JSON.stringify({
      lenses: OPPORTUNITY_LENSES,
      insights: place ? getOpportunityInsights(place) : [],
    }).toLowerCase();
    expect(corpus).not.toContain("best community");
    expect(corpus).not.toContain("worst community");
    expect(corpus).not.toContain("overall opportunity score");
  });
});
