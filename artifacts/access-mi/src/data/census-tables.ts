/**
 * ACS Table Catalog — curated Census tables with human-readable metadata.
 * Used by useCensusACS hook and Data Explorer UI.
 */

export type CensusDomain =
  | "demographics"
  | "economics"
  | "housing"
  | "education"
  | "health"
  | "transportation"
  | "language";

export interface CensusTableDef {
  id: string;
  label: string;
  description: string;
  domain: CensusDomain;
  keyVariables: { code: string; label: string; unit: "count" | "percent" | "dollars" | "minutes" | "ratio" }[];
  /** Whether this table supports margin of error (MOE) */
  hasMOE: boolean;
}

export const CENSUS_TABLES: CensusTableDef[] = [
  // ── Demographics ──
  {
    id: "B01001",
    label: "Age & Sex",
    description: "Population by age group and sex",
    domain: "demographics",
    hasMOE: true,
    keyVariables: [
      { code: "B01001_001E", label: "Total Population", unit: "count" },
      { code: "B01001_002E", label: "Male", unit: "count" },
      { code: "B01001_026E", label: "Female", unit: "count" },
    ],
  },
  {
    id: "B02001",
    label: "Race",
    description: "Population by race category",
    domain: "demographics",
    hasMOE: true,
    keyVariables: [
      { code: "B02001_001E", label: "Total", unit: "count" },
      { code: "B02001_002E", label: "White alone", unit: "count" },
      { code: "B02001_003E", label: "Black or African American", unit: "count" },
      { code: "B02001_004E", label: "American Indian / Alaska Native", unit: "count" },
      { code: "B02001_005E", label: "Asian", unit: "count" },
      { code: "B02001_006E", label: "Native Hawaiian / Pacific Islander", unit: "count" },
      { code: "B02001_007E", label: "Some other race", unit: "count" },
      { code: "B02001_008E", label: "Two or more races", unit: "count" },
    ],
  },
  {
    id: "B03003",
    label: "Hispanic/Latino Origin",
    description: "Hispanic or Latino origin by race",
    domain: "demographics",
    hasMOE: true,
    keyVariables: [
      { code: "B03003_001E", label: "Total", unit: "count" },
      { code: "B03003_002E", label: "Not Hispanic or Latino", unit: "count" },
      { code: "B03003_003E", label: "Hispanic or Latino", unit: "count" },
    ],
  },

  // ── Economics ──
  {
    id: "B19013",
    label: "Median Household Income",
    description: "Median household income in the past 12 months (inflation-adjusted)",
    domain: "economics",
    hasMOE: true,
    keyVariables: [
      { code: "B19013_001E", label: "Median Household Income", unit: "dollars" },
    ],
  },
  {
    id: "B17001",
    label: "Poverty Status",
    description: "Poverty status in the past 12 months by sex and age",
    domain: "economics",
    hasMOE: true,
    keyVariables: [
      { code: "B17001_001E", label: "Total (poverty universe)", unit: "count" },
      { code: "B17001_002E", label: "Below poverty level", unit: "count" },
    ],
  },
  {
    id: "B23025",
    label: "Employment Status",
    description: "Employment status for population 16 years and over",
    domain: "economics",
    hasMOE: true,
    keyVariables: [
      { code: "B23025_001E", label: "Total population 16+", unit: "count" },
      { code: "B23025_002E", label: "In labor force", unit: "count" },
      { code: "B23025_003E", label: "In civilian labor force", unit: "count" },
      { code: "B23025_004E", label: "Employed", unit: "count" },
      { code: "B23025_005E", label: "Unemployed", unit: "count" },
      { code: "B23025_007E", label: "Not in labor force", unit: "count" },
    ],
  },

  // ── Housing ──
  {
    id: "B25064",
    label: "Median Gross Rent",
    description: "Median gross rent (dollars)",
    domain: "housing",
    hasMOE: true,
    keyVariables: [
      { code: "B25064_001E", label: "Median Gross Rent", unit: "dollars" },
    ],
  },
  {
    id: "B25001",
    label: "Housing Units",
    description: "Total housing units",
    domain: "housing",
    hasMOE: true,
    keyVariables: [
      { code: "B25001_001E", label: "Total Housing Units", unit: "count" },
    ],
  },
  {
    id: "B25003",
    label: "Tenure (Own vs Rent)",
    description: "Occupied housing units by tenure",
    domain: "housing",
    hasMOE: true,
    keyVariables: [
      { code: "B25003_001E", label: "Total Occupied Units", unit: "count" },
      { code: "B25003_002E", label: "Owner-occupied", unit: "count" },
      { code: "B25003_003E", label: "Renter-occupied", unit: "count" },
    ],
  },

  // ── Education ──
  {
    id: "B15003",
    label: "Educational Attainment",
    description: "Educational attainment for population 25 years and over",
    domain: "education",
    hasMOE: true,
    keyVariables: [
      { code: "B15003_001E", label: "Total 25+", unit: "count" },
      { code: "B15003_017E", label: "High school diploma", unit: "count" },
      { code: "B15003_021E", label: "Associate's degree", unit: "count" },
      { code: "B15003_022E", label: "Bachelor's degree", unit: "count" },
      { code: "B15003_023E", label: "Master's degree", unit: "count" },
      { code: "B15003_025E", label: "Doctorate degree", unit: "count" },
    ],
  },

  // ── Health ──
  {
    id: "B27001",
    label: "Health Insurance Coverage",
    description: "Health insurance coverage status by sex and age",
    domain: "health",
    hasMOE: true,
    keyVariables: [
      { code: "B27001_001E", label: "Total", unit: "count" },
    ],
  },

  // ── Transportation ──
  {
    id: "B08301",
    label: "Commute Mode",
    description: "Means of transportation to work",
    domain: "transportation",
    hasMOE: true,
    keyVariables: [
      { code: "B08301_001E", label: "Total workers 16+", unit: "count" },
      { code: "B08301_002E", label: "Car, truck, or van", unit: "count" },
      { code: "B08301_010E", label: "Public transportation", unit: "count" },
      { code: "B08301_019E", label: "Walked", unit: "count" },
      { code: "B08301_021E", label: "Worked from home", unit: "count" },
    ],
  },

  // ── Language ──
  {
    id: "B16001",
    label: "Language Spoken at Home",
    description: "Language spoken at home for population 5 years and over",
    domain: "language",
    hasMOE: true,
    keyVariables: [
      { code: "B16001_001E", label: "Total 5+", unit: "count" },
      { code: "B16001_002E", label: "English only", unit: "count" },
      { code: "B16001_003E", label: "Spanish", unit: "count" },
    ],
  },
];

/** Get tables by domain */
export function getTablesByDomain(domain: CensusDomain): CensusTableDef[] {
  return CENSUS_TABLES.filter((t) => t.domain === domain);
}

/** Get a single table definition */
export function getTableDef(tableId: string): CensusTableDef | undefined {
  return CENSUS_TABLES.find((t) => t.id === tableId);
}

/** All unique domains */
export const CENSUS_DOMAINS: { id: CensusDomain; label: string; icon: string }[] = [
  { id: "demographics", label: "Demographics", icon: "Users" },
  { id: "economics", label: "Economics", icon: "DollarSign" },
  { id: "housing", label: "Housing", icon: "Home" },
  { id: "education", label: "Education", icon: "GraduationCap" },
  { id: "health", label: "Health", icon: "Heart" },
  { id: "transportation", label: "Transportation", icon: "Car" },
  { id: "language", label: "Language", icon: "Globe" },
];
