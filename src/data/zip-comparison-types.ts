/**
 * ZIP Code Comparison — Data interfaces & real indicator catalog.
 * Metrics are resolved from county-level curated data (cross-domain indicators
 * and county profiles) via zipToCounty(). Where no data exists, null is used.
 */

import { zipToCounty } from "@/data/michigan-county-seats";
import { getCountyCrossDomain, MI_STATE_AVERAGES } from "@/data/cross-domain-indicators";
import { getCountyProfile } from "@/data/michigan-county-profiles";

// ── Core types ──────────────────────────────────────────────────────────────

export type ZipCodeId = string; // 5-digit ZIP

export type MetricGroupId =
  | "health_coverage"
  | "income_housing"
  | "utilities_energy"
  | "water_environment"
  | "transport_safety"
  | "value_performance";

export type MetricId = string;

export interface MetricDefinition {
  id: MetricId;
  groupId: MetricGroupId;
  label: string;
  subtext?: string;
  tooltip?: string;
  unit?: string;
  asOfYear?: number;
  sourceShort: string;
}

export interface MetricValue {
  metricId: MetricId;
  zip: ZipCodeId;
  value: number | null;
  displayValue?: string;
}

export type DataCoverageLevel = "high" | "medium" | "limited";

export interface ZipComparisonSummary {
  zips: ZipCodeId[];
  metricDefinitions: MetricDefinition[];
  values: MetricValue[];
  dataCoverage: DataCoverageLevel;
  lastUpdated: string;
  globalSources: string[];
}

// ── Metric catalog (v1 — curated) ───────────────────────────────────────────

export const METRIC_GROUPS: { id: MetricGroupId; title: string; iconName: string }[] = [
  { id: "health_coverage", title: "Health & Coverage", iconName: "Heart" },
  { id: "income_housing", title: "Income & Housing Stability", iconName: "Home" },
  { id: "utilities_energy", title: "Utilities & Energy", iconName: "Zap" },
  { id: "water_environment", title: "Water & Environment", iconName: "Droplets" },
  { id: "transport_safety", title: "Transportation & Safety", iconName: "Bus" },
  { id: "value_performance", title: "Value & Performance", iconName: "Activity" },
];

const DEFINITIONS: MetricDefinition[] = [
  // ── Health & Coverage ──
  {
    id: "uninsured_rate", groupId: "health_coverage",
    label: "Uninsured rate",
    subtext: "Share of residents without health insurance.",
    tooltip: "From County Health Rankings 2024, allocated to ZIP via county mapping. Reflects civilian noninstitutionalized population.",
    unit: "%", asOfYear: 2024, sourceShort: "County Health Rankings",
  },
  {
    id: "poverty_rate", groupId: "health_coverage",
    label: "Poverty rate",
    subtext: "Share of residents below the federal poverty level.",
    tooltip: "ACS 5-year estimate via county cross-domain indicators. Federal poverty thresholds vary by household size.",
    unit: "%", asOfYear: 2022, sourceShort: "Census ACS",
  },
  {
    id: "food_insecurity", groupId: "health_coverage",
    label: "Food insecurity rate",
    subtext: "Share of residents who are food insecure.",
    tooltip: "From USDA Food Environment Atlas and County Health Rankings 2024, mapped to ZIP via county.",
    unit: "%", asOfYear: 2024, sourceShort: "USDA, CHR",
  },

  // ── Income & Housing ──
  {
    id: "median_income", groupId: "income_housing",
    label: "Median household income",
    subtext: "Middle-point household earnings.",
    tooltip: "ACS 5-year estimate. Inflation-adjusted to survey year dollars.",
    unit: "$", asOfYear: 2022, sourceShort: "Census ACS",
  },
  {
    id: "median_rent", groupId: "income_housing",
    label: "Median gross rent",
    subtext: "Typical monthly rent including utilities.",
    tooltip: "ACS 5-year estimate. Includes contract rent plus utility costs.",
    unit: "$", asOfYear: 2022, sourceShort: "Census ACS",
  },
  {
    id: "rent_burden", groupId: "income_housing",
    label: "Rent-burdened households",
    subtext: "Share of renters paying ≥30% of income on housing.",
    tooltip: "ACS estimate. A standard HUD threshold for affordability stress.",
    unit: "%", asOfYear: 2022, sourceShort: "Census ACS, HUD",
  },

  // ── Utilities & Energy ──
  {
    id: "unemployment", groupId: "utilities_energy",
    label: "Unemployment rate",
    subtext: "Share of labor force that is unemployed.",
    tooltip: "BLS Local Area Unemployment Statistics 2024, mapped to ZIP via county.",
    unit: "%", asOfYear: 2024, sourceShort: "BLS LAUS",
  },

  // ── Water & Environment ──
  {
    id: "water_compliance", groupId: "water_environment",
    label: "Drinking water compliance",
    subtext: "Share of water system tests meeting standards.",
    tooltip: "From EPA SDWIS database via county cross-domain indicators. Higher is better.",
    unit: "%", asOfYear: 2024, sourceShort: "EPA SDWIS",
  },
  {
    id: "violent_crime", groupId: "water_environment",
    label: "Violent crime rate",
    subtext: "Violent crimes per 100,000 residents.",
    tooltip: "FBI UCR data via county cross-domain indicators. Some rural counties may have incomplete reporting.",
    unit: "per 100k", asOfYear: 2022, sourceShort: "FBI UCR",
  },

  // ── Transportation & Safety ──
  {
    id: "vehicle_access", groupId: "transport_safety",
    label: "Households with vehicle access",
    subtext: "Share of households with at least one vehicle.",
    tooltip: "ACS 5-year estimate. Lower rates may indicate transit dependency.",
    unit: "%", asOfYear: 2022, sourceShort: "Census ACS",
  },
  {
    id: "commute_time", groupId: "transport_safety",
    label: "Average commute time",
    subtext: "Mean travel time to work in minutes.",
    tooltip: "ACS 5-year estimate. Includes all modes of transportation.",
    unit: "min", asOfYear: 2022, sourceShort: "Census ACS",
  },

  // ── Value & Performance ──
  {
    id: "hs_grad_rate", groupId: "value_performance",
    label: "High school graduation rate",
    subtext: "Share of adults 25+ with at least a high school diploma.",
    tooltip: "ACS / MI DOE data via county cross-domain indicators.",
    unit: "%", asOfYear: 2023, sourceShort: "MI DOE, Census",
  },
];

// ── Value formatting ────────────────────────────────────────────────────────

function formatValue(val: number, unit?: string): string {
  if (!unit) return val.toLocaleString();
  switch (unit) {
    case "%": return `${val}%`;
    case "$": return `$${val.toLocaleString()}`;
    case "min": return `${val} min`;
    case "per 100k": return val.toLocaleString();
    default: return `${val} ${unit}`;
  }
}

// ── Metric resolver (county-backed) ─────────────────────────────────────────

/**
 * Resolves metric values for a ZIP by looking up its county, then pulling from
 * county cross-domain indicators and county health profiles.
 * Returns null for any metric we genuinely cannot source.
 */
function resolveMetric(metricId: string, county: string | null): number | null {
  if (!county) return null;

  const cd = getCountyCrossDomain(county);
  const profile = getCountyProfile(county);

  switch (metricId) {
    case "uninsured_rate": {
      const raw = profile.healthHighlights.find(h => h.label.toLowerCase().includes("uninsured"))?.value;
      if (!raw) return null;
      const n = parseFloat(raw);
      return isNaN(n) ? null : n;
    }
    case "poverty_rate": return cd.povertyRate;
    case "food_insecurity": {
      const raw = profile.healthHighlights.find(h => h.label.toLowerCase().includes("food"))?.value;
      if (!raw) return null;
      const n = parseFloat(raw);
      return isNaN(n) ? null : n;
    }
    case "median_income": return cd.medianIncome;
    case "median_rent": return cd.medianRent;
    case "rent_burden": return cd.rentBurden;
    case "unemployment": return cd.unemploymentRate;
    case "water_compliance": return cd.drinkingWaterCompliance;
    case "violent_crime": return cd.violentCrimeRate;
    case "vehicle_access": return cd.vehicleAccess;
    case "commute_time": return cd.commuteTime;
    case "hs_grad_rate": return cd.hsGradRate;
    default: return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Build a ZipComparisonSummary using real curated county-level data.
 * ZIPs are mapped to counties via zipToCounty(). Metrics with no data show null.
 */
export function getZipComparisonSummary(zips: ZipCodeId[]): ZipComparisonSummary {
  const values: MetricValue[] = [];
  let populated = 0;
  let total = 0;

  for (const def of DEFINITIONS) {
    for (const zip of zips) {
      total++;
      const county = zipToCounty(zip);
      const val = resolveMetric(def.id, county);
      if (val !== null) populated++;
      values.push({
        metricId: def.id,
        zip,
        value: val,
        displayValue: val !== null ? formatValue(val, def.unit) : undefined,
      });
    }
  }

  const coverage = populated / total;
  const dataCoverage: DataCoverageLevel =
    coverage >= 0.75 ? "high" : coverage >= 0.4 ? "medium" : "limited";

  return {
    zips,
    metricDefinitions: DEFINITIONS,
    values,
    dataCoverage,
    lastUpdated: "2026-03-01T00:00:00Z",
    globalSources: ["Census ACS", "County Health Rankings", "USDA", "BLS", "EPA SDWIS", "FBI UCR", "MI DOE", "HUD"],
  };
}
