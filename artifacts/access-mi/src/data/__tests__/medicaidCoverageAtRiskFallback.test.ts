import { describe, it, expect } from "vitest";
import {
  MEDICAID_COVERAGE_AT_RISK_FALLBACK,
  MEDICAID_ALLOCATION_VARIABLES,
  MEDICAID_ALLOCATION_PROVENANCE,
  MEDICAID_ALLOCATION_STATEWIDE_TOTAL,
  MEDICAID_ALLOCATION_METHOD_VERSION,
  MEDICAID_SCENARIO_SCOPE,
  type MedicaidCoverageRangeEntry,
} from "../medicaidCoverageAtRiskFallback";

// ── Sanity checks ─────────────────────────────────────────────────────────────

describe("MEDICAID_COVERAGE_AT_RISK_FALLBACK", () => {
  it("has exactly 83 entries  -  one per Michigan county", () => {
    expect(MEDICAID_COVERAGE_AT_RISK_FALLBACK).toHaveLength(83);
  });

  it("every entry has a valid Michigan FIPS code format (26XXX)", () => {
    for (const entry of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.fips).toMatch(/^26\d{3}$/, `${entry.county}: invalid FIPS ${entry.fips}`);
    }
  });

  it("no duplicate FIPS codes", () => {
    const fipsSet = new Set(MEDICAID_COVERAGE_AT_RISK_FALLBACK.map((e) => e.fips));
    expect(fipsSet.size).toBe(83);
  });

  it("all projectedLossLow values are positive integers (≥ 1)", () => {
    for (const entry of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.projectedLossLow).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(entry.projectedLossLow)).toBe(true);
    }
  });

  it("all projectedLossHigh >= projectedLossLow", () => {
    for (const entry of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.projectedLossHigh).toBeGreaterThanOrEqual(entry.projectedLossLow);
    }
  });

  it("statewide sum of projectedLossLow is within ±500 of Urban Institute low (171,000)", () => {
    const stateLow = MEDICAID_COVERAGE_AT_RISK_FALLBACK.reduce(
      (sum, e) => sum + e.projectedLossLow,
      0
    );
    // Rounding across 83 counties; floor of Math.max(1,...) adds small upward bias
    expect(stateLow).toBeGreaterThanOrEqual(170_500);
    expect(stateLow).toBeLessThanOrEqual(172_000);
  });

  it("statewide sum of projectedLossHigh is within ±500 of Urban Institute high (355,000)", () => {
    const stateHigh = MEDICAID_COVERAGE_AT_RISK_FALLBACK.reduce(
      (sum, e) => sum + e.projectedLossHigh,
      0
    );
    expect(stateHigh).toBeGreaterThanOrEqual(354_500);
    expect(stateHigh).toBeLessThanOrEqual(356_000);
  });

  it("Wayne County has the highest projectedLossHigh (largest county by ACS enrollment)", () => {
    const wayne = MEDICAID_COVERAGE_AT_RISK_FALLBACK.find((e) => e.county === "Wayne");
    expect(wayne).toBeDefined();
    const maxHigh = Math.max(
      ...MEDICAID_COVERAGE_AT_RISK_FALLBACK.map((e) => e.projectedLossHigh)
    );
    expect(wayne!.projectedLossHigh).toBe(maxHigh);
  });

  it("methodologyUrl is /methodology/medicaid-coverage-at-risk on every entry", () => {
    for (const entry of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.methodologyUrl).toBe("/methodology/medicaid-coverage-at-risk");
    }
  });

  it("projectionAsOf is '2026-11' (method 2.0) on every entry", () => {
    for (const entry of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.projectionAsOf).toBe("2026-11");
    }
  });

  it("every entry has a non-empty slug", () => {
    for (const entry of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.slug.length).toBeGreaterThan(0);
    }
  });

  it("Grand Traverse has hyphenated slug", () => {
    const gt = MEDICAID_COVERAGE_AT_RISK_FALLBACK.find((e) => e.county === "Grand Traverse");
    expect(gt).toBeDefined();
    expect(gt!.slug).toBe("grand-traverse");
  });

  it("St. Clair has dot-free hyphenated slug", () => {
    const sc = MEDICAID_COVERAGE_AT_RISK_FALLBACK.find((e) => e.county === "St. Clair");
    expect(sc).toBeDefined();
    expect(sc!.slug).toBe("st-clair");
  });

  it("all entries have projectionSourceName referencing Urban Institute", () => {
    for (const entry of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.projectionSourceName.toLowerCase()).toContain("urban");
    }
  });

  it("all acsAdultMedicaid values are positive integers with a non-negative MOE", () => {
    for (const entry of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(entry.acsAdultMedicaid).toBeGreaterThan(0);
      expect(Number.isInteger(entry.acsAdultMedicaid)).toBe(true);
      expect(entry.acsAdultMedicaidMoe).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── Semantic regression (2026-11-08 correction) ───────────────────────────────
// Method 1.0 summed C27007_003E ("Male: Under 19 years") + C27007_012E
// ("Female:"), population totals rather than Medicaid counts. These tests
// pin the construct, not just the arithmetic.
describe("Medicaid allocation basis - semantic checks", () => {
  it("uses only the 19-64 'With Medicaid' C27007 cells", () => {
    expect([...MEDICAID_ALLOCATION_VARIABLES]).toEqual(["C27007_007E", "C27007_017E"]);
    for (const v of MEDICAID_ALLOCATION_VARIABLES) {
      const label = (MEDICAID_ALLOCATION_PROVENANCE.variables as Record<string, string>)[v];
      expect(label).toMatch(/19 to 64 years:!!With Medicaid\/means-tested public coverage$/);
    }
  });

  it("never reintroduces the population-total cells from method 1.0", () => {
    const vars = Object.keys(MEDICAID_ALLOCATION_PROVENANCE.variables);
    expect(vars).not.toContain("C27007_003E");
    expect(vars).not.toContain("C27007_012E");
  });

  it("statewide basis is plausible for adults with Medicaid, not a population total", () => {
    // Michigan's total population is ~10M; 6.2M was the method-1.0 artifact.
    expect(MEDICAID_ALLOCATION_STATEWIDE_TOTAL).toBeGreaterThan(500_000);
    expect(MEDICAID_ALLOCATION_STATEWIDE_TOTAL).toBeLessThan(2_500_000);
    expect(MEDICAID_ALLOCATION_PROVENANCE.statewide_total).toBe(MEDICAID_ALLOCATION_STATEWIDE_TOTAL);
  });

  it("every entry carries the current method version", () => {
    for (const e of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(e.methodVersion).toBe(MEDICAID_ALLOCATION_METHOD_VERSION);
    }
  });

  it("every county resolves to a registry name (no raw FIPS fallthrough)", () => {
    for (const e of MEDICAID_COVERAGE_AT_RISK_FALLBACK) {
      expect(e.county).not.toMatch(/^\d+$/);
    }
  });

  it("scope names both policy components", () => {
    expect(MEDICAID_SCENARIO_SCOPE).toMatch(/work requirements/i);
    expect(MEDICAID_SCENARIO_SCOPE).toMatch(/six-month redeterminations/i);
  });
});
