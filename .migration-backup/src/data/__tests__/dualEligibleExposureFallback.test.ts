import { describe, it, expect } from "vitest";
import {
  DUAL_ELIGIBLE_EXPOSURE_FALLBACK,
  DISPLAY_RANGE_LOW,
  DISPLAY_RANGE_HIGH,
  type DualEligibleCountyEntry,
} from "../dualEligibleExposureFallback";

// ── Sanity checks ─────────────────────────────────────────────────────────────

describe("DUAL_ELIGIBLE_EXPOSURE_FALLBACK", () => {
  it("has exactly 83 entries — one per Michigan county", () => {
    expect(DUAL_ELIGIBLE_EXPOSURE_FALLBACK).toHaveLength(83);
  });

  it("every entry has a valid Michigan FIPS code format (26XXX)", () => {
    for (const entry of DUAL_ELIGIBLE_EXPOSURE_FALLBACK) {
      expect(entry.fips).toMatch(/^26\d{3}$/, `${entry.county}: invalid FIPS ${entry.fips}`);
    }
  });

  it("no duplicate FIPS codes", () => {
    const fipsSet = new Set(DUAL_ELIGIBLE_EXPOSURE_FALLBACK.map((e) => e.fips));
    expect(fipsSet.size).toBe(83);
  });

  it("all allocatedLow values are positive integers (≥ 1)", () => {
    for (const entry of DUAL_ELIGIBLE_EXPOSURE_FALLBACK) {
      expect(entry.allocatedLow).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(entry.allocatedLow)).toBe(true);
    }
  });

  it("all allocatedHigh >= allocatedLow", () => {
    for (const entry of DUAL_ELIGIBLE_EXPOSURE_FALLBACK) {
      expect(entry.allocatedHigh).toBeGreaterThanOrEqual(entry.allocatedLow);
    }
  });

  it("no NaN values in any numeric field", () => {
    for (const entry of DUAL_ELIGIBLE_EXPOSURE_FALLBACK) {
      expect(Number.isNaN(entry.acsDualEstimate)).toBe(false);
      expect(Number.isNaN(entry.allocatedLow)).toBe(false);
      expect(Number.isNaN(entry.allocatedHigh)).toBe(false);
    }
  });

  it("no negative values in any numeric field", () => {
    for (const entry of DUAL_ELIGIBLE_EXPOSURE_FALLBACK) {
      expect(entry.acsDualEstimate).toBeGreaterThanOrEqual(0);
      expect(entry.allocatedLow).toBeGreaterThanOrEqual(0);
      expect(entry.allocatedHigh).toBeGreaterThanOrEqual(0);
    }
  });

  it("statewide sum of allocatedLow reconciles to DISPLAY_RANGE_LOW within rounding tolerance (±500)", () => {
    const stateLow = DUAL_ELIGIBLE_EXPOSURE_FALLBACK.reduce(
      (sum, e) => sum + e.allocatedLow,
      0
    );
    // Rounding across 83 counties; Math.max(1,...) floor adds small upward bias
    expect(stateLow).toBeGreaterThanOrEqual(DISPLAY_RANGE_LOW - 500);
    expect(stateLow).toBeLessThanOrEqual(DISPLAY_RANGE_LOW + 500);
  });

  it("statewide sum of allocatedHigh reconciles to DISPLAY_RANGE_HIGH within rounding tolerance (±500)", () => {
    const stateHigh = DUAL_ELIGIBLE_EXPOSURE_FALLBACK.reduce(
      (sum, e) => sum + e.allocatedHigh,
      0
    );
    expect(stateHigh).toBeGreaterThanOrEqual(DISPLAY_RANGE_HIGH - 500);
    expect(stateHigh).toBeLessThanOrEqual(DISPLAY_RANGE_HIGH + 500);
  });

  it("Wayne County has the highest allocatedHigh (largest county by ACS dual-eligible estimate)", () => {
    const wayne = DUAL_ELIGIBLE_EXPOSURE_FALLBACK.find((e) => e.county === "Wayne");
    expect(wayne).toBeDefined();
    const maxHigh = Math.max(...DUAL_ELIGIBLE_EXPOSURE_FALLBACK.map((e) => e.allocatedHigh));
    expect(wayne!.allocatedHigh).toBe(maxHigh);
  });

  it("every entry has a non-empty slug", () => {
    for (const entry of DUAL_ELIGIBLE_EXPOSURE_FALLBACK) {
      expect(entry.slug.length).toBeGreaterThan(0);
    }
  });

  it("Grand Traverse has hyphenated slug", () => {
    const gt = DUAL_ELIGIBLE_EXPOSURE_FALLBACK.find((e) => e.county === "Grand Traverse");
    expect(gt).toBeDefined();
    expect(gt!.slug).toBe("grand-traverse");
  });

  it("St. Clair has dot-free hyphenated slug", () => {
    const sc = DUAL_ELIGIBLE_EXPOSURE_FALLBACK.find((e) => e.county === "St. Clair");
    expect(sc).toBeDefined();
    expect(sc!.slug).toBe("st-clair");
  });

  it("all acsDualEstimate values are positive integers", () => {
    for (const entry of DUAL_ELIGIBLE_EXPOSURE_FALLBACK) {
      expect(entry.acsDualEstimate).toBeGreaterThan(0);
      expect(Number.isInteger(entry.acsDualEstimate)).toBe(true);
    }
  });
});
