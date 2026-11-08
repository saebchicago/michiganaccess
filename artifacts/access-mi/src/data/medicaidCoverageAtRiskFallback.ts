// Medicaid Coverage at Risk - county allocation fallback
//
// METHOD VERSION 2.0 (corrected 2026-11-08). See CORRECTION below.
//
// What this models: the Urban Institute Michigan range (171,000-355,000) is a
// projected REDUCTION IN MEDICAID EXPANSION (Healthy Michigan Plan) ENROLLMENT
// IN 2028 under P.L. 119-21's work requirements AND six-month redeterminations
// combined, relative to Urban's no-change baseline. Low/high are mitigation
// scenarios, not a statistical confidence interval. Source:
//   Urban Institute, March 2026, "Projected Reductions in Medicaid Expansion
//   Enrollment Under OBBBA's Work Requirements and Six-Month Redeterminations"
//   https://www.urban.org/research/publication/projected-reductions-medicaid-expansion-enrollment-under-obbbas-work
// Do not add a separate redetermination-loss estimate on top of this range:
// redeterminations are already inside it.
// Context only (not a model input): CBO pub. 61570 (July 2025), national
//   coverage-loss score for P.L. 119-21. https://www.cbo.gov/publication/61570
//
// County allocation basis: ACS 2024 5-year (2020-2024), table C27007, adults 19-64 with
// Medicaid/means-tested public coverage (C27007_007E + C27007_017E), read
// from the Census table-based Summary File by
// scripts/refresh-medicaid-adult-county.mjs, which asserts the Census
// metadata labels before writing. This is a PROXY for HMP enrollment (it also
// counts traditional-Medicaid adults and is survey-based). Preferred future
// basis: MDHHS county-level HMP enrollment.
//
// CORRECTION (2026-11-08): method 1.0 allocated by C27007_003E + C27007_012E,
// which Census defines as "Male: Under 19 years" and "Female:" (all coverage
// types). Those are population totals, not Medicaid counts; the 6,206,095
// statewide sum was a population figure. Every county range published
// 2026-04-09 through 2026-11-08 used the invalid basis. The statewide range
// was unaffected; county shares shifted (e.g. Wayne 18.3% -> 27.0%).
//
// Never present projectedLossLow / projectedLossHigh as point estimates.

import acsAdultMedicaid from "./acs-medicaid-adult-county.generated.json";
import { getCountyFromFips } from "./census-geographies";

/** Bumped whenever the allocation basis changes. The client hook rejects
 * any edge-function payload whose methodVersion does not match. */
export const MEDICAID_ALLOCATION_METHOD_VERSION = "2.0";

/** Census variables that define the allocation basis. Tests assert these
 * against the labels recorded in the generated provenance block. */
export const MEDICAID_ALLOCATION_VARIABLES = ["C27007_007E", "C27007_017E"] as const;

export const MEDICAID_ALLOCATION_PROVENANCE = acsAdultMedicaid.provenance;

// Urban Institute, March 2026 - Michigan, 2028, work requirements +
// six-month redeterminations combined, mitigation-scenario range.
export const URBAN_MICHIGAN_LOW = 171_000;
export const URBAN_MICHIGAN_HIGH = 355_000;

export const MEDICAID_SCENARIO_SCOPE =
  "Work requirements and six-month redeterminations combined";

const PROJECTION_SOURCE_NAME =
  "Modeled: Urban Institute Michigan 2028 range (work requirements + six-month redeterminations), county-allocated by ACS adults 19-64 with Medicaid";
const METHODOLOGY_URL = "/methodology/medicaid-coverage-at-risk";
const PROJECTION_AS_OF = "2026-11";

export interface MedicaidCoverageRangeEntry {
  county: string;
  slug: string;
  fips: string;
  /** ACS 2024 5-yr adults 19-64 with Medicaid/means-tested coverage (proxy). */
  acsAdultMedicaid: number;
  /** 90% MOE on acsAdultMedicaid. */
  acsAdultMedicaidMoe: number;
  projectedLossLow: number;
  projectedLossHigh: number;
  projectionSourceName: string;
  methodologyUrl: string;
  projectionAsOf: string;
  methodVersion: string;
}

const COUNTY_TOTAL = acsAdultMedicaid.counties.reduce(
  (sum, c) => sum + c.adultsWithMedicaid,
  0,
);

export const MEDICAID_ALLOCATION_STATEWIDE_TOTAL = COUNTY_TOTAL;

function slugify(county: string): string {
  return county.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
}

export const MEDICAID_COVERAGE_AT_RISK_FALLBACK: MedicaidCoverageRangeEntry[] =
  acsAdultMedicaid.counties.map((c) => {
    const county = getCountyFromFips(c.fips.slice(2)) ?? c.fips;
    const share = c.adultsWithMedicaid / COUNTY_TOTAL;
    return {
      county,
      slug: slugify(county),
      fips: c.fips,
      acsAdultMedicaid: c.adultsWithMedicaid,
      acsAdultMedicaidMoe: c.moe,
      projectedLossLow: Math.max(1, Math.round(URBAN_MICHIGAN_LOW * share)),
      projectedLossHigh: Math.max(1, Math.round(URBAN_MICHIGAN_HIGH * share)),
      projectionSourceName: PROJECTION_SOURCE_NAME,
      methodologyUrl: METHODOLOGY_URL,
      projectionAsOf: PROJECTION_AS_OF,
      methodVersion: MEDICAID_ALLOCATION_METHOD_VERSION,
    };
  });
