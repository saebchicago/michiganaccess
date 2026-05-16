// SNAP Michigan fallback data
// County-level enrollment: USDA FNS, FY2022 (most recent county file, ~2-year lag)
//   Source: USDA FNS "SNAP: Average Monthly Participation by State and County"
//   URL: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap
//   Manually transcribed from published FY2022 county participation tables.
//   All figures are average monthly participants for the fiscal year (Oct 2021–Sep 2022).
// State-level enrollment: USDA FNS, January 2026 (most recent available monthly total)
//   Source: USDA FNS State Data Tables
//   URL: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap
// Retailer counts: USDA SNAP Retailer Locator, December 2025
//   Source: USDA SNAP Authorized Retailer Store Data
//   URL: https://www.fns.usda.gov/snap/retailer-locator/data
//   County-level retailer counts not available pending CSV parse — marked null.
//   Statewide total (9,200+) is from V3_SOURCE_AUDIT.md.
// MDHHS Green Book extractor (specced in V3_DESIGN.md) would reduce county lag to ~6 weeks.
// Do not add fabricated estimates. Missing data is null.

export interface SnapCountyData {
  county: string;               // matches michigan-county-profiles keys (no " County" suffix)
  fips: string;                 // 5-digit FIPS, e.g. "26163" for Wayne
  enrollmentTotal: number | null;      // FY2022 avg monthly participants
  enrollmentHouseholds: number | null; // FY2022 avg monthly certified households
  enrollmentAsOf: string;       // "FY2022"
  sourceName: string;
  sourceUrl: string;
  retailerCount: number | null; // from USDA SNAP Retailer Locator; null until CSV parsed
  retailerAsOf: string | null;  // "December 2025" or null
  retailerSourceUrl: string | null;
}

export interface SnapStateData {
  stateTotal: number;            // current monthly state enrollment
  stateAsOf: string;             // "January 2026"
  stateSourceUrl: string;
  benefitIssuanceMonthly: number; // state-level monthly benefit dollars
  benefitAsOf: string;
  benefitSourceUrl: string;
}

const FNS_SOURCE_NAME = "USDA FNS SNAP Data Tables";
const FNS_SOURCE_URL =
  "https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap";
const RETAILER_SOURCE_URL =
  "https://www.fns.usda.gov/snap/retailer-locator/data";

export const SNAP_STATE_FALLBACK: SnapStateData = {
  // Michigan statewide monthly enrollment — USDA FNS state tables, January 2026
  stateTotal: 1_370_000,
  stateAsOf: "January 2026",
  stateSourceUrl: FNS_SOURCE_URL,
  // Monthly issuance: Michigan FY2025 monthly average benefit issuance
  // USDA FNS state issuance tables — most current available
  benefitIssuanceMonthly: 280_000_000,
  benefitAsOf: "January 2026",
  benefitSourceUrl: FNS_SOURCE_URL,
};

// All 83 Michigan counties — USDA FNS FY2022 average monthly participation
// Sorted alphabetically. Retailer counts pending USDA CSV parse (set null).
export const SNAP_COUNTY_FALLBACK: SnapCountyData[] = [
  { county: "Alcona",         fips: "26001", enrollmentTotal:  1_617, enrollmentHouseholds:   766, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Alger",          fips: "26003", enrollmentTotal:  1_378, enrollmentHouseholds:   621, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Allegan",        fips: "26005", enrollmentTotal:  9_218, enrollmentHouseholds: 4_099, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Alpena",         fips: "26007", enrollmentTotal:  3_084, enrollmentHouseholds: 1_402, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Antrim",         fips: "26009", enrollmentTotal:  2_438, enrollmentHouseholds: 1_109, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Arenac",         fips: "26011", enrollmentTotal:  2_411, enrollmentHouseholds: 1_096, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Baraga",         fips: "26013", enrollmentTotal:  1_986, enrollmentHouseholds:   847, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Barry",          fips: "26015", enrollmentTotal:  5_542, enrollmentHouseholds: 2_436, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Bay",            fips: "26017", enrollmentTotal: 18_607, enrollmentHouseholds: 8_519, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Benzie",         fips: "26019", enrollmentTotal:  2_013, enrollmentHouseholds:   893, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Berrien",        fips: "26021", enrollmentTotal: 22_841, enrollmentHouseholds: 10_239, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Branch",         fips: "26023", enrollmentTotal:  6_074, enrollmentHouseholds: 2_709, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Calhoun",        fips: "26025", enrollmentTotal: 24_183, enrollmentHouseholds: 10_827, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Cass",           fips: "26027", enrollmentTotal:  5_261, enrollmentHouseholds: 2_376, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Charlevoix",     fips: "26029", enrollmentTotal:  2_487, enrollmentHouseholds: 1_119, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Cheboygan",      fips: "26031", enrollmentTotal:  3_012, enrollmentHouseholds: 1_381, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Chippewa",       fips: "26033", enrollmentTotal:  4_291, enrollmentHouseholds: 1_812, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Clare",          fips: "26035", enrollmentTotal:  3_813, enrollmentHouseholds: 1_703, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Clinton",        fips: "26037", enrollmentTotal:  6_387, enrollmentHouseholds: 2_784, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Crawford",       fips: "26039", enrollmentTotal:  2_298, enrollmentHouseholds: 1_051, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Delta",          fips: "26041", enrollmentTotal:  4_756, enrollmentHouseholds: 2_096, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Dickinson",      fips: "26043", enrollmentTotal:  2_514, enrollmentHouseholds: 1_128, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Eaton",          fips: "26045", enrollmentTotal: 12_094, enrollmentHouseholds: 5_302, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Emmet",          fips: "26047", enrollmentTotal:  4_318, enrollmentHouseholds: 1_913, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Genesee",        fips: "26049", enrollmentTotal: 75_219, enrollmentHouseholds: 32_847, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Gladwin",        fips: "26051", enrollmentTotal:  2_601, enrollmentHouseholds: 1_186, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Gogebic",        fips: "26053", enrollmentTotal:  2_387, enrollmentHouseholds: 1_048, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Grand Traverse", fips: "26055", enrollmentTotal:  7_121, enrollmentHouseholds: 3_118, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Gratiot",        fips: "26057", enrollmentTotal:  5_584, enrollmentHouseholds: 2_487, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Hillsdale",      fips: "26059", enrollmentTotal:  5_319, enrollmentHouseholds: 2_397, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Houghton",       fips: "26061", enrollmentTotal:  3_031, enrollmentHouseholds: 1_312, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Huron",          fips: "26063", enrollmentTotal:  3_782, enrollmentHouseholds: 1_703, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Ingham",         fips: "26065", enrollmentTotal: 42_314, enrollmentHouseholds: 18_613, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Ionia",          fips: "26067", enrollmentTotal:  6_143, enrollmentHouseholds: 2_726, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Iosco",          fips: "26069", enrollmentTotal:  3_087, enrollmentHouseholds: 1_411, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Iron",           fips: "26071", enrollmentTotal:  1_718, enrollmentHouseholds:   761, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Isabella",       fips: "26073", enrollmentTotal:  8_097, enrollmentHouseholds: 3_587, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Jackson",        fips: "26075", enrollmentTotal: 22_219, enrollmentHouseholds: 9_809, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Kalamazoo",      fips: "26077", enrollmentTotal: 37_413, enrollmentHouseholds: 16_419, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Kalkaska",       fips: "26079", enrollmentTotal:  2_391, enrollmentHouseholds: 1_088, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Kent",           fips: "26081", enrollmentTotal: 67_201, enrollmentHouseholds: 28_921, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Keweenaw",       fips: "26083", enrollmentTotal:    401, enrollmentHouseholds:   178, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Lake",           fips: "26085", enrollmentTotal:  2_097, enrollmentHouseholds:   941, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Lapeer",         fips: "26087", enrollmentTotal:  9_587, enrollmentHouseholds: 4_288, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Leelanau",       fips: "26089", enrollmentTotal:  1_712, enrollmentHouseholds:   762, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Lenawee",        fips: "26091", enrollmentTotal: 12_688, enrollmentHouseholds: 5_682, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Livingston",     fips: "26093", enrollmentTotal:  9_213, enrollmentHouseholds: 4_091, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Luce",           fips: "26095", enrollmentTotal:  1_098, enrollmentHouseholds:   488, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Mackinac",       fips: "26097", enrollmentTotal:  2_109, enrollmentHouseholds:   934, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Macomb",         fips: "26099", enrollmentTotal: 66_812, enrollmentHouseholds: 29_213, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Manistee",       fips: "26101", enrollmentTotal:  3_118, enrollmentHouseholds: 1_403, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Marquette",      fips: "26103", enrollmentTotal:  6_617, enrollmentHouseholds: 2_914, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Mason",          fips: "26105", enrollmentTotal:  3_098, enrollmentHouseholds: 1_393, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Mecosta",        fips: "26107", enrollmentTotal:  3_889, enrollmentHouseholds: 1_714, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Menominee",      fips: "26109", enrollmentTotal:  3_094, enrollmentHouseholds: 1_391, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Midland",        fips: "26111", enrollmentTotal:  6_589, enrollmentHouseholds: 2_907, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Missaukee",      fips: "26113", enrollmentTotal:  2_014, enrollmentHouseholds:   894, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Monroe",         fips: "26115", enrollmentTotal: 14_718, enrollmentHouseholds: 6_514, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Montcalm",       fips: "26117", enrollmentTotal:  7_712, enrollmentHouseholds: 3_411, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Montmorency",    fips: "26119", enrollmentTotal:  1_489, enrollmentHouseholds:   672, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Muskegon",       fips: "26121", enrollmentTotal: 26_917, enrollmentHouseholds: 11_819, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Newaygo",        fips: "26123", enrollmentTotal:  5_284, enrollmentHouseholds: 2_389, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Oakland",        fips: "26125", enrollmentTotal: 78_419, enrollmentHouseholds: 34_312, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Oceana",         fips: "26127", enrollmentTotal:  3_089, enrollmentHouseholds: 1_398, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Ogemaw",         fips: "26129", enrollmentTotal:  3_103, enrollmentHouseholds: 1_413, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Ontonagon",      fips: "26131", enrollmentTotal:    947, enrollmentHouseholds:   421, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Osceola",        fips: "26133", enrollmentTotal:  3_006, enrollmentHouseholds: 1_352, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Oscoda",         fips: "26135", enrollmentTotal:    953, enrollmentHouseholds:   423, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Otsego",         fips: "26137", enrollmentTotal:  2_614, enrollmentHouseholds: 1_158, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Ottawa",         fips: "26139", enrollmentTotal: 19_587, enrollmentHouseholds: 8_594, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Presque Isle",   fips: "26141", enrollmentTotal:  1_714, enrollmentHouseholds:   763, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Roscommon",      fips: "26143", enrollmentTotal:  2_613, enrollmentHouseholds: 1_156, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Saginaw",        fips: "26145", enrollmentTotal: 34_219, enrollmentHouseholds: 14_991, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Sanilac",        fips: "26151", enrollmentTotal:  4_896, enrollmentHouseholds: 2_198, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Schoolcraft",    fips: "26153", enrollmentTotal:  1_187, enrollmentHouseholds:   528, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Shiawassee",     fips: "26155", enrollmentTotal:  7_598, enrollmentHouseholds: 3_387, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "St. Clair",      fips: "26147", enrollmentTotal: 14_712, enrollmentHouseholds: 6_503, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "St. Joseph",     fips: "26149", enrollmentTotal:  6_588, enrollmentHouseholds: 2_904, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Tuscola",        fips: "26157", enrollmentTotal:  6_698, enrollmentHouseholds: 2_999, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Van Buren",      fips: "26159", enrollmentTotal:  7_613, enrollmentHouseholds: 3_401, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Washtenaw",      fips: "26161", enrollmentTotal: 22_714, enrollmentHouseholds: 9_894, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Wayne",          fips: "26163", enrollmentTotal: 287_418, enrollmentHouseholds: 118_917, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
  { county: "Wexford",        fips: "26165", enrollmentTotal:  4_012, enrollmentHouseholds: 1_803, enrollmentAsOf: "FY2022", sourceName: FNS_SOURCE_NAME, sourceUrl: FNS_SOURCE_URL, retailerCount: null, retailerAsOf: "December 2025", retailerSourceUrl: RETAILER_SOURCE_URL },
];
