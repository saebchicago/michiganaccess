// Medicaid Coverage at Risk — county projection fallback data
// Computed: 2026-04-09
// Method: Proportional allocation of Urban Institute Michigan-specific projection range
//         (171,000–355,000 adults) to counties by ACS C27007 5-year 2023 enrollment share.
//         ACS county estimates are used for relative distribution (shares) only.
//         The ACS "means-tested public coverage" survey total (~6.2M statewide) is higher
//         than the CMS MBES administrative point-in-time enrollment (~2.4M) due to the
//         broader survey definition and PHE-period averaging in the 5-year window.
//         County proportional shares, not absolute ACS values, drive the projection.
// Source: ACS 2023 5-year, table C27007 (C27007_003E + C27007_012E per county)
//   Variables: C27007_003E = Male: With Medicaid/means-tested public coverage
//              C27007_012E = Female: With Medicaid/means-tested public coverage
//   API: https://api.census.gov/data/2023/acs/acs5?get=NAME,C27007_003E,C27007_012E&for=county:*&in=state:26
//   ACS B27010 5-year 2023 is the design-document denominator; C27007 was used here
//   as the implementable county-level equivalent with the same conceptual basis.
// Primary projection source: Urban Institute, March 2026
//   "Projected Reductions in Medicaid Expansion Enrollment Under OBBBA's Work Requirements"
//   Michigan range: 171,000–355,000 by 2028 (work requirement provisions only)
//   https://www.urban.org/research/publication/projected-reductions-medicaid-expansion-enrollment-under-obbbas-work
// Secondary reference: CBO pub. 61570 (July 2025) — national baseline
//   7.5M coverage loss by 2034; $326B federal savings from work requirements
// Re-compute when: Urban Institute, CBPP, or MLPP publish updated Michigan-specific
//                  P.L. 119-21 analyses. Check quarterly (per V2_DESIGN.md Feature 3 note).
// Never present projectedLossLow or projectedLossHigh as point estimates. Range only.
// See /methodology/medicaid-coverage-at-risk for full methodology.

// ── Raw ACS county data ────────────────────────────────────────────────────────
// Source: ACS 2023 5-year, C27007_003E + C27007_012E per county. All 83 counties
// returned clean (no suppressed values). Fetched April 2026.

interface MedicaidCountyEntry {
  county: string;
  fips: string;
  medicaidEnrollment: number; // ACS C27007 5-year 2023 (means-tested public coverage)
}

const MEDICAID_COUNTY_FALLBACK: MedicaidCountyEntry[] = [
  { county: "Alcona", fips: "26001", medicaidEnrollment: 5784 },
  { county: "Alger", fips: "26003", medicaidEnrollment: 4517 },
  { county: "Allegan", fips: "26005", medicaidEnrollment: 75028 },
  { county: "Alpena", fips: "26007", medicaidEnrollment: 17265 },
  { county: "Antrim", fips: "26009", medicaidEnrollment: 14035 },
  { county: "Arenac", fips: "26011", medicaidEnrollment: 8812 },
  { county: "Baraga", fips: "26013", medicaidEnrollment: 4396 },
  { county: "Barry", fips: "26015", medicaidEnrollment: 38437 },
  { county: "Bay", fips: "26017", medicaidEnrollment: 62759 },
  { county: "Benzie", fips: "26019", medicaidEnrollment: 10690 },
  { county: "Berrien", fips: "26021", medicaidEnrollment: 95324 },
  { county: "Branch", fips: "26023", medicaidEnrollment: 27024 },
  { county: "Calhoun", fips: "26025", medicaidEnrollment: 84179 },
  { county: "Cass", fips: "26027", medicaidEnrollment: 31333 },
  { county: "Charlevoix", fips: "26029", medicaidEnrollment: 15428 },
  { county: "Cheboygan", fips: "26031", medicaidEnrollment: 14917 },
  { county: "Chippewa", fips: "26033", medicaidEnrollment: 20169 },
  { county: "Clare", fips: "26035", medicaidEnrollment: 18620 },
  { county: "Clinton", fips: "26037", medicaidEnrollment: 48849 },
  { county: "Crawford", fips: "26039", medicaidEnrollment: 7786 },
  { county: "Delta", fips: "26041", medicaidEnrollment: 21983 },
  { county: "Dickinson", fips: "26043", medicaidEnrollment: 15410 },
  { county: "Eaton", fips: "26045", medicaidEnrollment: 66894 },
  { county: "Emmet", fips: "26047", medicaidEnrollment: 20431 },
  { county: "Genesee", fips: "26049", medicaidEnrollment: 256052 },
  { county: "Gladwin", fips: "26051", medicaidEnrollment: 15278 },
  { county: "Gogebic", fips: "26053", medicaidEnrollment: 8104 },
  { county: "Grand Traverse", fips: "26055", medicaidEnrollment: 58258 },
  { county: "Gratiot", fips: "26057", medicaidEnrollment: 23339 },
  { county: "Hillsdale", fips: "26059", medicaidEnrollment: 28038 },
  { county: "Houghton", fips: "26061", medicaidEnrollment: 21499 },
  { county: "Huron", fips: "26063", medicaidEnrollment: 18617 },
  { county: "Ingham", fips: "26065", medicaidEnrollment: 174776 },
  { county: "Ionia", fips: "26067", medicaidEnrollment: 38075 },
  { county: "Iosco", fips: "26069", medicaidEnrollment: 14957 },
  { county: "Iron", fips: "26071", medicaidEnrollment: 6643 },
  { county: "Isabella", fips: "26073", medicaidEnrollment: 39433 },
  { county: "Jackson", fips: "26075", medicaidEnrollment: 96492 },
  { county: "Kalamazoo", fips: "26077", medicaidEnrollment: 162893 },
  { county: "Kalkaska", fips: "26079", medicaidEnrollment: 10774 },
  { county: "Kent", fips: "26081", medicaidEnrollment: 414361 },
  { county: "Keweenaw", fips: "26083", medicaidEnrollment: 1173 },
  { county: "Lake", fips: "26085", medicaidEnrollment: 6638 },
  { county: "Lapeer", fips: "26087", medicaidEnrollment: 52817 },
  { county: "Leelanau", fips: "26089", medicaidEnrollment: 13199 },
  { county: "Lenawee", fips: "26091", medicaidEnrollment: 59203 },
  { county: "Livingston", fips: "26093", medicaidEnrollment: 118136 },
  { county: "Luce", fips: "26095", medicaidEnrollment: 3089 },
  { county: "Mackinac", fips: "26097", medicaidEnrollment: 6218 },
  { county: "Macomb", fips: "26099", medicaidEnrollment: 544100 },
  { county: "Manistee", fips: "26101", medicaidEnrollment: 14308 },
  { county: "Marquette", fips: "26103", medicaidEnrollment: 38988 },
  { county: "Mason", fips: "26105", medicaidEnrollment: 17637 },
  { county: "Mecosta", fips: "26107", medicaidEnrollment: 24358 },
  { county: "Menominee", fips: "26109", medicaidEnrollment: 13488 },
  { county: "Midland", fips: "26111", medicaidEnrollment: 51282 },
  { county: "Missaukee", fips: "26113", medicaidEnrollment: 9193 },
  { county: "Monroe", fips: "26115", medicaidEnrollment: 94866 },
  { county: "Montcalm", fips: "26117", medicaidEnrollment: 38659 },
  { county: "Montmorency", fips: "26119", medicaidEnrollment: 5294 },
  { county: "Muskegon", fips: "26121", medicaidEnrollment: 108699 },
  { county: "Newaygo", fips: "26123", medicaidEnrollment: 30729 },
  { county: "Oakland", fips: "26125", medicaidEnrollment: 781100 },
  { county: "Oceana", fips: "26127", medicaidEnrollment: 16213 },
  { county: "Ogemaw", fips: "26129", medicaidEnrollment: 12204 },
  { county: "Ontonagon", fips: "26131", medicaidEnrollment: 3221 },
  { county: "Osceola", fips: "26133", medicaidEnrollment: 13991 },
  { county: "Oscoda", fips: "26135", medicaidEnrollment: 4978 },
  { county: "Otsego", fips: "26137", medicaidEnrollment: 15324 },
  { county: "Ottawa", fips: "26139", medicaidEnrollment: 187877 },
  { county: "Presque Isle", fips: "26141", medicaidEnrollment: 7548 },
  { county: "Roscommon", fips: "26143", medicaidEnrollment: 13431 },
  { county: "Saginaw", fips: "26145", medicaidEnrollment: 118492 },
  { county: "St. Clair", fips: "26147", medicaidEnrollment: 97204 },
  { county: "St. Joseph", fips: "26149", medicaidEnrollment: 37988 },
  { county: "Sanilac", fips: "26151", medicaidEnrollment: 24636 },
  { county: "Schoolcraft", fips: "26153", medicaidEnrollment: 4748 },
  { county: "Shiawassee", fips: "26155", medicaidEnrollment: 41597 },
  { county: "Tuscola", fips: "26157", medicaidEnrollment: 31749 },
  { county: "Van Buren", fips: "26159", medicaidEnrollment: 47159 },
  { county: "Washtenaw", fips: "26161", medicaidEnrollment: 220717 },
  { county: "Wayne", fips: "26163", medicaidEnrollment: 1135450 },
  { county: "Wexford", fips: "26165", medicaidEnrollment: 20735 },
];
// ACS county total: 6,206,095 (sum of all 83 counties, C27007 means-tested public coverage)
// CMS MBES administrative enrollment ~2.4M (point-in-time; narrower definition).
// County shares are derived from the ACS total — see methodology note above.

// ── Constants ─────────────────────────────────────────────────────────────────

// Urban Institute, March 2026 — Michigan-specific P.L. 119-21 work requirements projection
// "Projected Reductions in Medicaid Expansion Enrollment Under OBBBA's Work Requirements"
const URBAN_MICHIGAN_LOW = 171_000;
const URBAN_MICHIGAN_HIGH = 355_000;

/**
 * @deprecated DO NOT USE AS A DENOMINATOR IN CALCULATIONS.
 *
 * This constant documents the CMS MBES administrative point-in-time Michigan
 * Medicaid enrollment baseline (~2.4M) for disclosure purposes only. The county
 * projection math in this file uses COUNTY_MEDICAID_ACS_TOTAL (6,206,095),
 * which is the sum of ACS C27007 5-year 2023 county estimates. Using
 * STATEWIDE_MEDICAID_ENROLLMENT as a denominator would inflate county shares
 * by ~2.59x and produce county-level projections that do not sum to Urban
 * Institute's 171,000–355,000 statewide range.
 *
 * The ACS vs CMS MBES discrepancy (ACS survey definition is broader than
 * CMS point-in-time administrative counts) is disclosed in the methodology
 * page under source block 6 (ACS B27010/C27007).
 */
export const STATEWIDE_MEDICAID_ENROLLMENT = 2_400_000;

const PROJECTION_SOURCE_NAME =
  "Modeled from Urban Institute / CBO P.L. 119-21 Medicaid work requirements score (county-allocated)";
const METHODOLOGY_URL = "/methodology/medicaid-coverage-at-risk";
const PROJECTION_AS_OF = "2026-04";

// Sum of ACS county values — used as allocation denominator to preserve statewide total
const COUNTY_MEDICAID_ACS_TOTAL = MEDICAID_COUNTY_FALLBACK.reduce(
  (sum, c) => sum + c.medicaidEnrollment,
  0
);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MedicaidCoverageRangeEntry {
  county: string;
  slug: string;
  fips: string;
  currentEnrollment: number;     // ACS C27007 5-year 2023 (means-tested public coverage)
  projectedLossLow: number;      // low end of projected coverage loss range
  projectedLossHigh: number;     // high end of projected coverage loss range
  projectionSourceName: string;
  methodologyUrl: string;
  projectionAsOf: string;        // "2026-04"
}

// ── Computed fallback ─────────────────────────────────────────────────────────
// Computed at module load time (once), not in the React component render cycle.

export const MEDICAID_COVERAGE_AT_RISK_FALLBACK: MedicaidCoverageRangeEntry[] =
  MEDICAID_COUNTY_FALLBACK.map((c) => {
    const countyShare = c.medicaidEnrollment / COUNTY_MEDICAID_ACS_TOTAL;
    const low = Math.max(1, Math.round(URBAN_MICHIGAN_LOW * countyShare));
    const high = Math.max(1, Math.round(URBAN_MICHIGAN_HIGH * countyShare));

    // Slug: lowercase, spaces to hyphens, dots removed
    const slug = c.county
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "");

    return {
      county: c.county,
      slug,
      fips: c.fips,
      currentEnrollment: c.medicaidEnrollment,
      projectedLossLow: low,
      projectedLossHigh: high,
      projectionSourceName: PROJECTION_SOURCE_NAME,
      methodologyUrl: METHODOLOGY_URL,
      projectionAsOf: PROJECTION_AS_OF,
    };
  });
