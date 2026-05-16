// SNAP Coverage at Risk — projection fallback data
// Computed: 2026-04-09
// Method: Apply MLPP Michigan state estimate (74,000 adults at risk) to counties
//         proportionally by county SNAP enrollment share (USDA FNS FY2022 county data).
//         Straight enrollment share is used as proxy for adult ABAWD-eligible share —
//         this simplification is documented at /methodology/snap-coverage-at-risk.
// Uncertainty band: GAO-19-56 historical range → low = midpoint × 0.60, high = midpoint × 1.40
// Re-compute when: CBO updates P.L. 119-21 scoring, MLPP revises Michigan estimate,
//                  Feature 1 baseline refreshes beyond FY2022, MDHHS Green Book extractor
//                  replaces FY2022 county data.
// Never present as point estimate. Range only.
// See /methodology/snap-coverage-at-risk for full methodology.
//
// Inputs:
//   - MLPP Michigan state estimate: 74,000 adults at risk (November 2025)
//     Source: https://mlpp.org/the-cost-of-the-federal-megabill-food-assistance/
//   - CBO national figure: 2.4 million/month (August 2025, pub. 61367-SNAP.pdf)
//     Source: https://www.cbo.gov/system/files/2025-08/61367-SNAP.pdf
//   - County SNAP enrollment baseline: USDA FNS FY2022 county data
//     (from snapMichiganFallback.ts — Feature 1 data layer)
//   - Uncertainty multipliers: 0.60 (low), 1.40 (high) — GAO-19-56

import { SNAP_COUNTY_FALLBACK } from "./snapMichiganFallback";

export interface SnapCoverageRangeEntry {
  county: string;
  fips: string;
  currentSnapEnrollment: number;        // from Feature 1 data
  currentSnapAsOf: string;              // honest about FY2022 lag
  projectedAffectedLow: number;         // lower bound of range
  projectedAffectedHigh: number;        // upper bound of range
  projectionSourceName: string;
  methodologyUrl: string;
  projectionAsOf: string;               // "2026-04" — when computed
  caveat: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// MLPP Michigan-specific state estimate — adults in affected ABAWD categories
// Source: MLPP November 2025, https://mlpp.org/the-cost-of-the-federal-megabill-food-assistance/
const MLPP_MICHIGAN_STATE_ESTIMATE = 74_000;

// GAO-19-56 uncertainty band multipliers
const GAO_LOW_MULTIPLIER = 0.60;
const GAO_HIGH_MULTIPLIER = 1.40;

const PROJECTION_SOURCE_NAME = "Modeled from MLPP/CBO P.L. 119-21 SNAP score (county-allocated)";
const METHODOLOGY_URL = "/methodology/snap-coverage-at-risk";
const PROJECTION_AS_OF = "2026-04";

// Sum of all non-null county enrollments — allocation denominator
const COUNTY_ENROLLMENT_TOTAL = SNAP_COUNTY_FALLBACK.reduce(
  (sum, c) => sum + (c.enrollmentTotal ?? 0),
  0
);

// ── Computed fallback ─────────────────────────────────────────────────────────
// Computed at module load time (once), not in the React component render cycle.

export const SNAP_COVERAGE_AT_RISK_FALLBACK: SnapCoverageRangeEntry[] =
  SNAP_COUNTY_FALLBACK.map((c) => {
    const enrollment = c.enrollmentTotal;

    if (!enrollment || COUNTY_ENROLLMENT_TOTAL === 0) {
      return {
        county: c.county,
        fips: c.fips,
        currentSnapEnrollment: 0,
        currentSnapAsOf: c.enrollmentAsOf,
        projectedAffectedLow: 0,
        projectedAffectedHigh: 0,
        projectionSourceName: PROJECTION_SOURCE_NAME,
        methodologyUrl: METHODOLOGY_URL,
        projectionAsOf: PROJECTION_AS_OF,
        caveat:
          "Baseline enrollment data unavailable for this county. Cannot project.",
      };
    }

    const countyShare = enrollment / COUNTY_ENROLLMENT_TOTAL;
    const midpoint = MLPP_MICHIGAN_STATE_ESTIMATE * countyShare;
    const low = Math.max(1, Math.round(midpoint * GAO_LOW_MULTIPLIER));
    const high = Math.round(midpoint * GAO_HIGH_MULTIPLIER);

    return {
      county: c.county,
      fips: c.fips,
      currentSnapEnrollment: enrollment,
      currentSnapAsOf: c.enrollmentAsOf,
      projectedAffectedLow: low,
      projectedAffectedHigh: high,
      projectionSourceName: PROJECTION_SOURCE_NAME,
      methodologyUrl: METHODOLOGY_URL,
      projectionAsOf: PROJECTION_AS_OF,
      caveat:
        "County figures allocate MLPP statewide estimate proportionally by FY2022 enrollment share. " +
        "Actual county distribution will vary. Exposure does not equal loss.",
    };
  });
