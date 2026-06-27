/**
 * Percentile ranking tests for the county snapshot tile.
 *
 * Covers the bug that rendered "0th percentile" on every county for the
 * food-insecurity metric: the hand-tuned linear `uninsuredPercentile`
 * map had a max=11.5 ceiling, but the MI food-insecurity distribution
 * runs roughly 10-21%, so almost every county clamped to 0.
 *
 * The replacement is a rank-based percentile against the actual
 * distribution of the metric across all 83 county profiles, with the
 * convention HIGHER percentile = BETTER outcome (= lower value, for the
 * three current "lower-is-better" metrics).
 */
import { describe, it, expect } from "vitest";
import { __TEST_ONLY__ } from "@/utils/snapshotMetrics";
import { buildCountySnapshotMetrics } from "@/utils/snapshotMetrics";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";

const {
  rankPercentile,
  UNINSURED_DISTRIBUTION,
  PC_RATIO_DISTRIBUTION,
  FOOD_INSECURITY_DISTRIBUTION,
  foodInsecurityPercentile,
  uninsuredPercentile,
  ratioPercentile,
} = __TEST_ONLY__;

describe("rankPercentile", () => {
  it("returns 100 for the best (lowest) value when lower-is-better", () => {
    expect(rankPercentile(1, [1, 2, 3, 4, 5], true)).toBe(80);
    // Beating every other value -> 100. The above is one of the values
    // itself; a value below the minimum returns 100.
    expect(rankPercentile(0, [1, 2, 3, 4, 5], true)).toBe(100);
  });

  it("returns 0 for the worst (highest) value when lower-is-better", () => {
    expect(rankPercentile(99, [1, 2, 3, 4, 5], true)).toBe(0);
  });

  it("ties: percentile is the share strictly worse", () => {
    // value 3 in [1,2,3,4,5], lower-is-better: 4 and 5 are worse -> 40%
    expect(rankPercentile(3, [1, 2, 3, 4, 5], true)).toBe(40);
  });

  it("flips for higher-is-better", () => {
    // value 5 is the best in [1,2,3,4,5] when higher-is-better -> 4 of 5
    // are worse -> 80; value 1 is the worst -> 0.
    expect(rankPercentile(5, [1, 2, 3, 4, 5], false)).toBe(80);
    expect(rankPercentile(1, [1, 2, 3, 4, 5], false)).toBe(0);
  });

  it("returns 0 for an empty distribution or non-finite input", () => {
    expect(rankPercentile(5, [], true)).toBe(0);
    expect(rankPercentile(NaN, [1, 2, 3], true)).toBe(0);
  });
});

describe("MI county distributions", () => {
  it("covers the expected county count (>=80 valid entries per metric)", () => {
    expect(UNINSURED_DISTRIBUTION.length).toBeGreaterThanOrEqual(80);
    expect(PC_RATIO_DISTRIBUTION.length).toBeGreaterThanOrEqual(80);
    expect(FOOD_INSECURITY_DISTRIBUTION.length).toBeGreaterThanOrEqual(80);
  });

  it("food-insecurity distribution actually spans the MI range (~10-21%)", () => {
    const min = Math.min(...FOOD_INSECURITY_DISTRIBUTION);
    const max = Math.max(...FOOD_INSECURITY_DISTRIBUTION);
    expect(min).toBeGreaterThan(5);
    expect(min).toBeLessThan(15);
    expect(max).toBeGreaterThan(15);
    expect(max).toBeLessThan(30);
  });
});

describe("regression: 0th percentile on food insecurity for above-average counties", () => {
  it("Wayne (15.4% food insecurity) is not 0th", () => {
    // The bug: previous `uninsuredPercentile(15.4)` returned 0. The fix
    // ranks against the actual MI food-insecurity distribution.
    const p = foodInsecurityPercentile(15.4);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(100);
  });

  it("a low-food-insecurity county reads high percentile", () => {
    // 10.1% is roughly the MI minimum -> should approach 100.
    expect(foodInsecurityPercentile(10.1)).toBeGreaterThanOrEqual(90);
  });

  it("a high-food-insecurity county reads low percentile", () => {
    // 20.6% is roughly the MI maximum -> should approach 0.
    expect(foodInsecurityPercentile(20.6)).toBeLessThanOrEqual(5);
  });

  it("primary-care ratio above the old 5000 ceiling is no longer 0th", () => {
    // Old `ratioPercentile(9330)` returned 0 (clamp). New version
    // ranks against the actual distribution.
    expect(ratioPercentile(9330)).toBeGreaterThan(0);
    expect(ratioPercentile(9330)).toBeLessThan(50);
  });

  it("uninsured rate within MI range produces a value in (0, 100)", () => {
    expect(uninsuredPercentile(5.0)).toBeGreaterThan(0);
    expect(uninsuredPercentile(5.0)).toBeLessThan(100);
  });
});

describe("buildCountySnapshotMetrics: end-to-end percentile sanity", () => {
  it("not every county collapses to the same percentile on food insecurity", () => {
    const counties = Object.keys(COUNTY_PROFILES);
    const percentiles = counties
      .map(
        (c) =>
          buildCountySnapshotMetrics(c).find((m) => m.id === "food-insecurity")
            ?.percentile,
      )
      .filter((p): p is number => typeof p === "number");
    const unique = new Set(percentiles);
    expect(percentiles.length).toBeGreaterThan(50);
    expect(unique.size).toBeGreaterThan(5);
  });

  it("all rendered percentiles fall within [0, 100]", () => {
    const counties = Object.keys(COUNTY_PROFILES);
    for (const c of counties) {
      const metrics = buildCountySnapshotMetrics(c);
      for (const m of metrics) {
        if (typeof m.percentile === "number") {
          expect(m.percentile).toBeGreaterThanOrEqual(0);
          expect(m.percentile).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("Wayne food-insecurity reads a sub-50 percentile (above state avg = below median)", () => {
    const wayne = buildCountySnapshotMetrics("Wayne").find(
      (m) => m.id === "food-insecurity",
    );
    expect(wayne?.percentile).toBeGreaterThan(0);
    expect(wayne?.percentile).toBeLessThan(50);
  });
});
