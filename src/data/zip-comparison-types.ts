/**
 * ZIP Code Comparison — Data interfaces & mock stub.
 * Wire to real data later; all mock values are clearly marked.
 */

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
  unit?: string; // e.g. "%", "per 10,000", "index"
  asOfYear?: number;
  sourceShort: string; // e.g. "MDHHS, Census"
}

export interface MetricValue {
  metricId: MetricId;
  zip: ZipCodeId;
  value: number | null; // null = data not available
  displayValue?: string;
}

export type DataCoverageLevel = "high" | "medium" | "limited";

export interface ZipComparisonSummary {
  zips: ZipCodeId[];
  metricDefinitions: MetricDefinition[];
  values: MetricValue[];
  dataCoverage: DataCoverageLevel;
  lastUpdated: string; // ISO date
  globalSources: string[];
}

// ── Metric catalog ──────────────────────────────────────────────────────────

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
  { id: "uninsured_rate", groupId: "health_coverage", label: "Uninsured rate", subtext: "Share of residents without health insurance.", tooltip: "Estimated from ACS 5-year data (Table B27001). Reflects civilian noninstitutionalized population.", unit: "%", asOfYear: 2023, sourceShort: "Census ACS" },
  { id: "pcp_access", groupId: "health_coverage", label: "Primary care access (proxy)", subtext: "Primary care clinics and FQHCs per 10,000 residents.", tooltip: "Count of clinics and FQHC locations mapped to this ZIP's catchment, using HRSA and CMS data. See methodology for details.", unit: "per 10,000", asOfYear: 2024, sourceShort: "HRSA, CMS" },
  { id: "medicaid_enrollment", groupId: "health_coverage", label: "Medicaid enrollment rate", subtext: "Estimated share of residents enrolled in Medicaid.", tooltip: "From MDHHS enrollment files, allocated to ZIPs. Approximate; see methodology.", unit: "%", asOfYear: 2024, sourceShort: "MDHHS" },
  { id: "poverty_rate", groupId: "health_coverage", label: "Poverty rate", subtext: "Share of residents below the federal poverty level.", tooltip: "ACS 5-year estimate (Table B17001). Federal poverty thresholds vary by household size.", unit: "%", asOfYear: 2023, sourceShort: "Census ACS" },

  // ── Income & Housing ──
  { id: "median_income", groupId: "income_housing", label: "Median household income", subtext: "Middle-point household earnings.", tooltip: "ACS 5-year estimate (Table B19013). Inflation-adjusted to survey year dollars.", unit: "$", asOfYear: 2023, sourceShort: "Census ACS" },
  { id: "median_rent", groupId: "income_housing", label: "Median gross rent", subtext: "Typical monthly rent including utilities.", tooltip: "ACS 5-year estimate (Table B25064). Includes contract rent plus utility costs.", unit: "$", asOfYear: 2023, sourceShort: "Census ACS" },
  { id: "homeownership", groupId: "income_housing", label: "Homeownership rate", subtext: "Share of occupied units that are owner-occupied.", tooltip: "ACS 5-year estimate (Table B25003). Higher rates may indicate greater housing stability.", unit: "%", asOfYear: 2023, sourceShort: "Census ACS" },
  { id: "cost_burdened", groupId: "income_housing", label: "Housing cost-burdened households", subtext: "Share paying more than 30% of income on housing.", tooltip: "ACS 5-year estimate. A standard HUD threshold for affordability stress.", unit: "%", asOfYear: 2023, sourceShort: "Census ACS, HUD" },

  // ── Utilities & Energy ──
  { id: "energy_burden", groupId: "utilities_energy", label: "Energy burden (proxy)", subtext: "Estimated share of income spent on energy.", tooltip: "Modeled from DOE LEAD tool and HUD data. Approximate for ZIP-level geographies.", unit: "%", asOfYear: 2023, sourceShort: "DOE, HUD" },
  { id: "outage_burden", groupId: "utilities_energy", label: "Recent outage burden", subtext: "Average customer outage events in major storms over 3–5 years.", tooltip: "Based on MPSC and outage datasets where available. Counts may be approximate for some ZIPs; see methodology.", unit: "events", asOfYear: 2024, sourceShort: "MPSC" },
  { id: "utility_shutoffs", groupId: "utilities_energy", label: "Utility shutoff risk", subtext: "Proxy for households at risk of energy disconnection.", tooltip: "Modeled from arrearage and assistance program data. Not a count of actual shutoffs.", unit: "index", asOfYear: 2024, sourceShort: "MPSC, LARA" },

  // ── Water & Environment ──
  { id: "water_violations", groupId: "water_environment", label: "Drinking water violations", subtext: "SDWA violations in service area (past 3 years).", tooltip: "From EPA SDWIS database, mapped to ZIP by water system service areas. Some ZIPs span multiple systems.", unit: "count", asOfYear: 2024, sourceShort: "EPA SDWIS" },
  { id: "air_quality", groupId: "water_environment", label: "Air quality (AQI proxy)", subtext: "Typical air quality index for the area.", tooltip: "Based on nearest AirNow monitoring station. May not reflect hyper-local conditions.", unit: "AQI", asOfYear: 2024, sourceShort: "EPA AirNow" },
  { id: "brownfields", groupId: "water_environment", label: "Known contaminated sites", subtext: "Count of Part 201/213 sites within or near this ZIP.", tooltip: "From EGLE environmental database. Includes active and historic sites.", unit: "count", asOfYear: 2024, sourceShort: "EGLE" },

  // ── Transportation & Safety ──
  { id: "commute_time", groupId: "transport_safety", label: "Average commute time", subtext: "Mean travel time to work in minutes.", tooltip: "ACS 5-year estimate. Includes all modes of transportation.", unit: "min", asOfYear: 2023, sourceShort: "Census ACS" },
  { id: "no_vehicle", groupId: "transport_safety", label: "Households without a vehicle", subtext: "Share of households with zero vehicles available.", tooltip: "ACS 5-year estimate. Higher rates may indicate transit dependency.", unit: "%", asOfYear: 2023, sourceShort: "Census ACS" },
  { id: "crash_rate", groupId: "transport_safety", label: "Traffic crash rate", subtext: "Crashes per 1,000 residents annually.", tooltip: "From Michigan Traffic Crash Facts. Rates may vary with road type and traffic volume.", unit: "per 1,000", asOfYear: 2023, sourceShort: "NHTSA, MSP" },

  // ── Value & Performance ──
  { id: "civic_score", groupId: "value_performance", label: "Civic Insight Score", subtext: "Composite index of community vulnerability and access friction.", tooltip: "Weighted index: Community Vulnerability (40%) + Access Friction (60%). Higher = better overall civic conditions. See methodology for full breakdown.", unit: "index (0–100)", asOfYear: 2024, sourceShort: "Access Michigan" },
  { id: "health_rank", groupId: "value_performance", label: "County health ranking", subtext: "Relative rank of the mapped county among Michigan's 83 counties.", tooltip: "From County Health Rankings & Roadmaps. Lower = healthier. ZIP mapped to county.", unit: "rank", asOfYear: 2024, sourceShort: "CHR&R" },
  { id: "broadband_access", groupId: "value_performance", label: "Broadband access", subtext: "Share of households with broadband internet subscription.", tooltip: "ACS 5-year estimate. Broadband defined as high-speed connections (cable, fiber, DSL).", unit: "%", asOfYear: 2023, sourceShort: "Census ACS, FCC" },
];

// ── Mock stub ───────────────────────────────────────────────────────────────

const MOCK_SEED: Record<string, number[]> = {
  uninsured_rate: [8.2, 12.7, 6.1, 10.4],
  pcp_access: [4.3, 2.1, 6.8, 3.5],
  medicaid_enrollment: [22.1, 34.6, 15.3, 28.9],
  poverty_rate: [14.3, 22.8, 9.1, 17.6],
  median_income: [52400, 38200, 71500, 44800],
  median_rent: [1050, 880, 1340, 960],
  homeownership: [62.1, 48.3, 74.5, 55.7],
  cost_burdened: [32.4, 41.7, 24.1, 36.9],
  energy_burden: [6.8, 9.2, 4.5, 7.6],
  outage_burden: [3.2, 4.8, 1.9, 3.7],
  utility_shutoffs: [42, 67, 28, 53],
  water_violations: [2, 5, 0, 3],
  air_quality: [38, 45, 32, 41],
  brownfields: [1, 4, 0, 2],
  commute_time: [24.3, 28.7, 21.1, 26.5],
  no_vehicle: [6.4, 14.2, 3.1, 9.8],
  crash_rate: [4.2, 6.1, 3.5, 5.3],
  civic_score: [72, 54, 81, 63],
  health_rank: [28, 52, 12, 41],
  broadband_access: [86.3, 72.1, 92.4, 79.8],
};

/**
 * Returns a mock ZipComparisonSummary for demonstration.
 * All values are placeholder — clearly labeled in the UI as "Example data – not real yet."
 */
export function getZipComparisonSummary(zips: ZipCodeId[]): ZipComparisonSummary {
  const values: MetricValue[] = [];
  for (const def of DEFINITIONS) {
    const seeds = MOCK_SEED[def.id] ?? [null, null, null, null];
    zips.forEach((zip, i) => {
      const raw = seeds[i % seeds.length] ?? null;
      values.push({
        metricId: def.id,
        zip,
        value: raw,
        displayValue: raw != null ? formatMockValue(raw, def.unit) : undefined,
      });
    });
  }

  return {
    zips,
    metricDefinitions: DEFINITIONS,
    values,
    dataCoverage: "medium",
    lastUpdated: "2026-03-01T00:00:00Z",
    globalSources: ["MDHHS", "CMS", "HUD", "EGLE", "MPSC", "NHTSA", "Census", "DOE", "EPA", "FCC"],
  };
}

function formatMockValue(val: number, unit?: string): string {
  if (!unit) return val.toLocaleString();
  switch (unit) {
    case "%": return `${val}%`;
    case "$": return `$${val.toLocaleString()}`;
    case "min": return `${val} min`;
    case "index": return val.toString();
    case "index (0–100)": return `${val}/100`;
    case "rank": return `#${val}`;
    case "count": return val.toString();
    case "events": return `~${val}`;
    case "AQI": return val.toString();
    default: return `${val} ${unit}`;
  }
}
