import { describe, it, expect } from "vitest";
import {
  buildCountyAttributionTimeline,
  listAttributionCounties,
  TOTAL_TRACKED_INVESTMENT,
} from "@/utils/investmentAttribution";

describe("investmentAttribution", () => {
  it("lists tracked counties", () => {
    const counties = listAttributionCounties();
    expect(counties.length).toBeGreaterThan(10);
    expect(counties).toContain("Wayne");
  });

  it("builds timeline for Wayne", () => {
    const timeline = buildCountyAttributionTimeline("Wayne");
    expect(timeline).not.toBeNull();
    expect(timeline!.milestones.length).toBe(3);
    expect(timeline!.outcomes.length).toBeGreaterThan(3);
    expect(timeline!.integrityLabel).toBe("PROJECTED");
  });

  it("tracks total investment", () => {
    expect(TOTAL_TRACKED_INVESTMENT).toBeGreaterThan(1_000_000_000);
  });
});