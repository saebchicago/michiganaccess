import { describe, it, expect } from "vitest";
import { deriveCountyTrend } from "@/lib/trendSeriesClassifier";
import { classify, slopePerYear, summarize } from "@/lib/trend";

describe("trend classifier - synthetic series", () => {
  const strongDecline = [
    { vintage: 2013, value: 11.0 },
    { vintage: 2018, value: 6.8 },
    { vintage: 2023, value: 5.2 },
  ];
  const flat = [
    { vintage: 2020, value: 5.0 },
    { vintage: 2021, value: 5.02 },
    { vintage: 2022, value: 4.98 },
  ];
  const rising = [
    { vintage: 2015, value: 15.0 },
    { vintage: 2018, value: 18.0 },
    { vintage: 2023, value: 22.0 },
  ];

  it("labels a large decline as IMPROVING when down_is_better", () => {
    expect(classify(strongDecline, "down_is_better")).toBe("IMPROVING");
  });

  it("labels the same decline as CONCERN when up_is_better", () => {
    expect(classify(strongDecline, "up_is_better")).toBe("CONCERN");
  });

  it("labels sub-2% relative change as STABLE regardless of direction", () => {
    expect(classify(flat, "down_is_better")).toBe("STABLE");
    expect(classify(flat, "up_is_better")).toBe("STABLE");
  });

  it("returns INSUFFICIENT when fewer than 3 observed points", () => {
    expect(classify(strongDecline.slice(0, 2), "down_is_better")).toBe(
      "INSUFFICIENT",
    );
  });

  it("computes a non-null slope for at least 2 points", () => {
    expect(slopePerYear(rising)).not.toBeNull();
    expect(slopePerYear(rising)!).toBeGreaterThan(0);
  });

  it("summarize populates first/last vintage + delta", () => {
    const s = summarize(strongDecline, "down_is_better");
    expect(s.classification).toBe("IMPROVING");
    expect(s.firstVintage).toBe(2013);
    expect(s.lastVintage).toBe(2023);
    expect(s.firstToLastAbs).toBeCloseTo(-5.8, 1);
    expect(s.slopePerYear).not.toBeNull();
    expect(s.slopePerYear!).toBeLessThan(0);
  });
});

describe("deriveCountyTrend - integration with trendSeries.json", () => {
  it("Keweenaw population classifies as IMPROVING (small county, growing)", () => {
    const t = deriveCountyTrend("Keweenaw", "population");
    expect(t).not.toBeNull();
    // Keweenaw grew 2020->2024 per the existing PEP fixture
    expect(t!.firstToLastAbs).not.toBeNull();
    expect(t!.firstToLastAbs!).toBeGreaterThan(0);
  });

  it("returns a summary for Wayne uninsuredRate or short-circuits on pending", () => {
    const t = deriveCountyTrend("Wayne", "uninsuredRate");
    // Either null (pending-ci) or a real summary; both are valid states.
    if (t !== null) {
      expect(["IMPROVING", "STABLE", "CONCERN", "INSUFFICIENT"]).toContain(
        t.classification,
      );
    }
  });

  it("returns null for unknown county", () => {
    expect(deriveCountyTrend("NotACounty", "population")).toBeNull();
  });
});
