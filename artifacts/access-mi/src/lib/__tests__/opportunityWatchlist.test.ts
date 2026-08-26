import { beforeEach, describe, expect, it } from "vitest";
import {
  getOpportunityPlaceChanges,
  listSavedOpportunityPlaces,
  removeOpportunityPlace,
  saveOpportunityPlace,
} from "@/lib/opportunityWatchlist";
import { getOpportunityInsights } from "@/data/opportunityAtlas";
import { resolveOpportunityPlace } from "@/lib/opportunityPlaceResolver";

describe("Opportunity Atlas local watchlist", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores canonical public geography metadata rather than raw search text", () => {
    const place = resolveOpportunityPlace("Detroit");
    expect(place).not.toBeNull();
    const insights = getOpportunityInsights(place!);
    saveOpportunityPlace(place!, insights);

    const raw = localStorage.getItem("am-opportunity-watchlist") ?? "";
    expect(raw).toContain("city-detroit");
    expect(raw).not.toContain("searchQuery");
    expect(raw).not.toContain("address");
    expect(raw).not.toContain("coordinates");

    const saved = listSavedOpportunityPlaces();
    expect(saved).toHaveLength(1);
    expect(saved[0].placeId).toBe("city-detroit");
    expect(Object.keys(saved[0].snapshot).length).toBe(insights.length);
  });

  it("reports only value/vintage changes, not causal interpretations", () => {
    const place = resolveOpportunityPlace("Wayne County")!;
    const insights = getOpportunityInsights(place);
    const [saved] = saveOpportunityPlace(place, insights);
    expect(getOpportunityPlaceChanges(saved, insights)).toEqual([]);

    const changed = insights.map((item, index) =>
      index === 0 ? { ...item, vintage: `${item.vintage} revised` } : item,
    );
    const changes = getOpportunityPlaceChanges(saved, changed);
    expect(changes).toHaveLength(1);
    expect(changes[0].metricId).toBe(insights[0].metricId);
  });

  it("removes saved places cleanly", () => {
    const place = resolveOpportunityPlace("Oakland County")!;
    saveOpportunityPlace(place, getOpportunityInsights(place));
    expect(listSavedOpportunityPlaces()).toHaveLength(1);
    removeOpportunityPlace(place.id);
    expect(listSavedOpportunityPlaces()).toEqual([]);
  });
});
