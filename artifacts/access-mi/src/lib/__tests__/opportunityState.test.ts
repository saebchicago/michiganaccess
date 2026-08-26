import { describe, expect, it } from "vitest";
import {
  buildOpportunityUrl,
  parseOpportunityState,
} from "@/lib/opportunityState";

describe("Opportunity Atlas canonical URLs", () => {
  it("serializes only canonical geography and bounded state tokens", () => {
    const url = buildOpportunityUrl(
      {
        placeId: "county-26163",
        metricId: "unemployment-rate",
        lensId: "usda-sram-2025",
        comparePlaceId: "county-26125",
      },
      "https://accessmi.org",
    );
    expect(url).toBe(
      "https://accessmi.org/opportunity?place=county-26163&metric=unemployment-rate&lens=usda-sram-2025&compare=county-26125",
    );
    expect(url).not.toContain("Detroit");
    expect(url).not.toContain("address");
  });

  it("rejects noncanonical county ids rather than silently repairing them", () => {
    expect(() =>
      buildOpportunityUrl(
        { placeId: "county-163" },
        "https://accessmi.org",
      ),
    ).toThrow(/Invalid canonical/);
  });

  it("drops unsafe query tokens while keeping the canonical place", () => {
    const params = new URLSearchParams({
      place: "zcta-48322",
      metric: "unsafe metric with spaces",
      lens: "tree-equity",
      compare: "../../secret",
      q: "raw free text",
    });
    expect(parseOpportunityState(params)).toEqual({
      placeId: "zcta-48322",
      metricId: undefined,
      lensId: "tree-equity",
      comparePlaceId: undefined,
    });
  });
});
