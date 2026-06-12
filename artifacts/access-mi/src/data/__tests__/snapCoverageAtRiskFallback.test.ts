import { describe, it, expect } from "vitest";
import {
  SNAP_COVERAGE_AT_RISK_FALLBACK,
  type SnapCoverageRangeEntry,
} from "../snapCoverageAtRiskFallback";
import { SNAP_COUNTY_FALLBACK } from "../snapMichiganFallback";

// ── Sanity checks ─────────────────────────────────────────────────────────────

describe("SNAP_COVERAGE_AT_RISK_FALLBACK", () => {
  it("has exactly 83 entries  -  one per Michigan county", () => {
    expect(SNAP_COVERAGE_AT_RISK_FALLBACK).toHaveLength(83);
  });

  it("every entry has a valid Michigan FIPS code format (26XXX)", () => {
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.fips).toMatch(/^26\d{3}$/, `${entry.county}: invalid FIPS ${entry.fips}`);
    }
  });

  it("no duplicate FIPS codes", () => {
    const fipsSet = new Set(SNAP_COVERAGE_AT_RISK_FALLBACK.map((e) => e.fips));
    expect(fipsSet.size).toBe(83);
  });

  it("all projectedAffectedLow values are positive integers", () => {
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.projectedAffectedLow).toBeGreaterThan(0);
      expect(Number.isInteger(entry.projectedAffectedLow)).toBe(true);
    }
  });

  it("all projectedAffectedHigh >= projectedAffectedLow", () => {
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.projectedAffectedHigh).toBeGreaterThanOrEqual(
        entry.projectedAffectedLow
      );
    }
  });

  it("high/low ratio is approximately 1.40/0.60 (±1 rounding unit)", () => {
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      if (entry.projectedAffectedLow === 0) continue;
      const ratio = entry.projectedAffectedHigh / entry.projectedAffectedLow;
      // Expected ratio: 1.40/0.60 ≈ 2.333  -  allow rounding to 2 integer places
      expect(ratio).toBeGreaterThan(2.0);
      expect(ratio).toBeLessThan(2.7);
    }
  });

  it("methodologyUrl is /methodology/snap-coverage-at-risk on every entry", () => {
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.methodologyUrl).toBe("/methodology/snap-coverage-at-risk");
    }
  });

  it("projectionAsOf is '2026-04' on every entry", () => {
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.projectionAsOf).toBe("2026-04");
    }
  });

  it("caveat is non-empty on every entry", () => {
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.caveat.length).toBeGreaterThan(0);
    }
  });

  it("Wayne County has the highest projectedAffectedHigh (largest county)", () => {
    const wayne = SNAP_COVERAGE_AT_RISK_FALLBACK.find((e) => e.county === "Wayne");
    expect(wayne).toBeDefined();
    const maxHigh = Math.max(...SNAP_COVERAGE_AT_RISK_FALLBACK.map((e) => e.projectedAffectedHigh));
    expect(wayne!.projectedAffectedHigh).toBe(maxHigh);
  });

  it("statewide sum of projectedAffectedHigh is within ±5% of MLPP × 1.40 = 103,600", () => {
    const stateHigh = SNAP_COVERAGE_AT_RISK_FALLBACK.reduce(
      (sum, e) => sum + e.projectedAffectedHigh,
      0
    );
    // Rounding across 83 counties  -  allow ±200 tolerance
    expect(stateHigh).toBeGreaterThan(103_400);
    expect(stateHigh).toBeLessThan(103_800);
  });

  it("statewide sum of projectedAffectedLow is within ±5% of MLPP × 0.60 = 44,400", () => {
    const stateLow = SNAP_COVERAGE_AT_RISK_FALLBACK.reduce(
      (sum, e) => sum + e.projectedAffectedLow,
      0
    );
    // Min 1 floor raises the sum slightly above theoretical 44,400
    expect(stateLow).toBeGreaterThanOrEqual(44_400);
    expect(stateLow).toBeLessThan(44_600);
  });

  it("currentSnapEnrollment matches the Feature 1 baseline", () => {
    // Every entry's currentSnapEnrollment must equal the corresponding Feature 1 record
    const f1Map = new Map(SNAP_COUNTY_FALLBACK.map((c) => [c.fips, c.enrollmentTotal]));
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      const f1Enrollment = f1Map.get(entry.fips);
      expect(entry.currentSnapEnrollment).toBe(f1Enrollment ?? 0);
    }
  });

  it("all entries have projectionSourceName referencing MLPP/CBO", () => {
    for (const entry of SNAP_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.projectionSourceName.toLowerCase()).toContain("mlpp");
    }
  });
});
