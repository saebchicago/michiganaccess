/**
 * Rx Kids community coverage, program facts, and published outcomes.
 *
 * Rx Kids is a prenatal-to-infancy unconditional cash program founded by
 * Dr. Mona Hanna (Michigan State University College of Human Medicine) and
 * H. Luke Shaefer (University of Michigan Poverty Solutions), launched in
 * Flint (Genesee County) in January 2024 and expanded community by
 * community since. Each community's launch date and payment duration are
 * set locally, so they are recorded per row with their own source rather
 * than assumed uniform.
 *
 * Coverage list compiled from city/county government announcements
 * (fetch-verified as of mid-2026 - see each row's `source`). Aggregate
 * program-wide totals (families enrolled, dollars disbursed) are
 * deliberately NOT included here: at time of writing they were reported
 * only via secondary press coverage of the program's own dashboard, which
 * could not be independently verified. Add them once directly sourced.
 *
 * The $250M figure below is a legislative fact (an enacted state budget
 * appropriation), not a live program metric, and is cited as such.
 */

export type RxKidsCoverageType = "whole-county" | "partial";

export interface RxKidsCommunity {
  county: string;
  /** The specific community/communities live within the county. */
  community: string;
  coverageType: RxKidsCoverageType;
  /** Payment duration in months after birth, where confirmed per community. */
  durationMonths: 6 | 12 | null;
  /** ISO date (YYYY-MM) eligibility began, where confirmed. */
  eligibilityStart: string | null;
  source: string;
}

export const RX_KIDS_COMMUNITIES: RxKidsCommunity[] = [
  { county: "Genesee", community: "City of Flint", coverageType: "partial", durationMonths: 12, eligibilityStart: "2024-01", source: "MSU Public Health - program launch, Jan 2024" },
  { county: "Kalamazoo", community: "City of Kalamazoo", coverageType: "partial", durationMonths: null, eligibilityStart: "2025-02", source: "Rx Kids - Kalamazoo launch, Feb 2025" },
  { county: "Alger", community: "Countywide (Eastern Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2025-03", source: "Rx Kids - Eastern UP expansion, Mar 2025" },
  { county: "Chippewa", community: "Countywide (Eastern Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2025-03", source: "Rx Kids - Eastern UP expansion, Mar 2025" },
  { county: "Luce", community: "Countywide (Eastern Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2025-03", source: "Rx Kids - Eastern UP expansion, Mar 2025" },
  { county: "Mackinac", community: "Countywide (Eastern Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2025-03", source: "Rx Kids - Eastern UP expansion, Mar 2025" },
  { county: "Schoolcraft", community: "Countywide (Eastern Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2025-03", source: "Rx Kids - Eastern UP expansion, Mar 2025" },
  { county: "Oakland", community: "City of Pontiac", coverageType: "partial", durationMonths: null, eligibilityStart: "2025-05", source: "Rx Kids - Pontiac launch, May 2025" },
  { county: "Oakland", community: "Royal Oak Township", coverageType: "partial", durationMonths: null, eligibilityStart: null, source: "Rx Kids communities list" },
  { county: "Clare", community: "Countywide", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2025-08", source: "Michigan Public - Clare County launch, Aug 2025" },
  { county: "Marquette", community: "Countywide", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Wayne", community: "River Rouge, Hamtramck, Highland Park, Inkster, Melvindale, Dearborn", coverageType: "partial", durationMonths: null, eligibilityStart: "2025-11", source: "MSUToday - Wayne County launch (6 cities), Nov 2025" },
  { county: "Wayne", community: "City of Detroit", coverageType: "partial", durationMonths: 6, eligibilityStart: "2026-01", source: "City of Detroit - Rx Kids Detroit launch, Jan 2026" },
  { county: "Washtenaw", community: "City of Ypsilanti", coverageType: "partial", durationMonths: null, eligibilityStart: "2025-12", source: "City of Ypsilanti - program page" },
  { county: "Saginaw", community: "City of Saginaw, Bridgeport Township, Buena Vista Township", coverageType: "partial", durationMonths: null, eligibilityStart: "2026-01", source: "City of Saginaw - program page, Jan 2026" },
  { county: "Berrien", community: "Benton Harbor, Niles, Buchanan, Benton Charter Township", coverageType: "partial", durationMonths: null, eligibilityStart: "2026-01", source: "Berrien County - news release, Jan 2026" },
  { county: "Lake", community: "Countywide", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-01", source: "Rx Kids communities list, Jan 2026" },
  { county: "Baraga", community: "Countywide (Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Delta", community: "Countywide (Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Dickinson", community: "Countywide (Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Gogebic", community: "Countywide (Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Houghton", community: "Countywide (Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Iron", community: "Countywide (Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Keweenaw", community: "Countywide (Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Menominee", community: "Countywide (Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Ontonagon", community: "Countywide (Upper Peninsula)", coverageType: "whole-county", durationMonths: null, eligibilityStart: "2026-03", source: "MSUToday - Upper Peninsula expansion, Mar 2026" },
  { county: "Kalamazoo", community: "Galesburg, Oshtemo Township, Wakeshma Township", coverageType: "partial", durationMonths: 12, eligibilityStart: "2026-06", source: "Public Media Network - Kalamazoo County expansion, Jun 2026" },
  { county: "Calhoun", community: "Battle Creek, Albion, Springfield, Sheridan Township", coverageType: "partial", durationMonths: null, eligibilityStart: "2026-07", source: "Battle Creek Community Foundation - program launch" },
  { county: "Jackson", community: "City of Jackson, Blackman Charter Township", coverageType: "partial", durationMonths: null, eligibilityStart: null, source: "Rx Kids expansion announcement, summer 2026" },
  { county: "Muskegon", community: "City of Muskegon, Muskegon Heights", coverageType: "partial", durationMonths: null, eligibilityStart: null, source: "Rx Kids expansion announcement, summer 2026" },
  { county: "Kent", community: "Grand Rapids (ZIP 49507)", coverageType: "partial", durationMonths: null, eligibilityStart: null, source: "Rx Kids expansion announcement, summer 2026" },
];

/** Unique counties with at least one active or announced Rx Kids community. */
export const RX_KIDS_COVERED_COUNTIES: readonly string[] = Array.from(
  new Set(RX_KIDS_COMMUNITIES.map((c) => c.county)),
);

export function isRxKidsActive(county: string | null): boolean {
  return county !== null && RX_KIDS_COVERED_COUNTIES.includes(county);
}

export function getRxKidsCommunities(county: string | null): RxKidsCommunity[] {
  if (county === null) return [];
  return RX_KIDS_COMMUNITIES.filter((c) => c.county === county);
}

export interface RxKidsOutcome {
  finding: string;
  metric: string;
  studyPopulation: string;
  citation: string;
}

/**
 * Findings from peer-reviewed evaluations of the Flint program - the only
 * site with enough enrollment history for a published outcomes study as of
 * this writing. Newer communities are too recent to have outcome data yet.
 */
export const RX_KIDS_OUTCOMES: RxKidsOutcome[] = [
  {
    finding: "Fewer preterm births",
    metric: "about 18% reduction",
    studyPopulation: "Flint births, Jan 2021 - Jun 2025, vs. comparison cities",
    citation: "Lancet Public Health, May 2026",
  },
  {
    finding: "Fewer low-birthweight births",
    metric: "about 27% reduction",
    studyPopulation: "Flint births, Jan 2021 - Jun 2025, vs. comparison cities",
    citation: "Lancet Public Health, May 2026",
  },
  {
    finding: "Fewer NICU admissions",
    metric: "about 29% reduction",
    studyPopulation: "Flint births, Jan 2021 - Jun 2025, vs. comparison cities",
    citation: "Lancet Public Health, May 2026",
  },
  {
    finding: "Earlier and more adequate prenatal care",
    metric: "increased utilization",
    studyPopulation: "Flint enrollees",
    citation: "JAMA Network Open, 2025",
  },
  {
    finding: "Fewer infant maltreatment investigations",
    metric: "significant reduction",
    studyPopulation: "Flint enrollees",
    citation: "JAMA Pediatrics, 2026",
  },
  {
    finding: "Fewer positive postpartum depression screens",
    metric: "14.0 percentage-point reduction",
    studyPopulation: "Flint enrollees",
    citation: "American Journal of Public Health, 2025",
  },
];

export const RX_KIDS_PROGRAM_FACTS = {
  founders: "Dr. Mona Hanna (Michigan State University) and H. Luke Shaefer (University of Michigan Poverty Solutions)",
  operator: "MSU-Hurley Children's Hospital Pediatric Public Health Initiative, with University of Michigan Poverty Solutions",
  launchDate: "January 2024",
  launchLocation: "Flint, Michigan (Genesee County)",
  prenatalPayment: 1500,
  monthlyPayment: 500,
  paymentDurationNote: "6 or 12 months after birth, chosen by each community based on funds raised",
  stateInvestment: "$250 million over three years",
  stateInvestmentSource: "State of Michigan, enacted FY2026 budget",
} as const;
