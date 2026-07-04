/**
 * SNAP food-access family - benchmark math.
 *
 * Three benchmark tiers, each with a different provenance story:
 *
 *   1. State (Michigan). Retailer benchmarks: MI-wide currently-authorized
 *      retailer count from USDA SNAP Retailer Locator (December 31, 2025)
 *      over MI PEP V2024 population. Enrollment benchmarks: MI monthly
 *      persons + households from USDA FNA state tables (snap-persons-6.xlsx,
 *      snap-households-6.xlsx on fna.usda.gov), newest month with clean-
 *      integer US TOTAL row = February 2026 (Preliminary). Preliminary flag
 *      carried in provenance. All state tiers render MODELED per the
 *      fitted/aggregated rule in resolveCompositeLabel (numerator +
 *      denominator drawn from different sources).
 *
 *   2. Regional (Michigan Prosperity Region). Retailer aggregate:
 *      population-weighted rollup of county-native retailer counts + PEP
 *      V2024 population into the 10 Prosperity Regions. Regional
 *      enrollment: NOT-INGESTED. County SNAP enrollment is published only
 *      at FY2022; aggregating it against a Feb-2026 state/national line
 *      would blend vintages, so this benchmark is deliberately left as a
 *      visible gap with the reason string. All regional tiers that do
 *      render are labeled MODELED (aggregation from a different
 *      geography).
 *
 *   3. National. Retailer numerator restricted to the 51 PEP V2024
 *      jurisdictions (50 states + DC); Guam (260 rows) and USVI (88 rows)
 *      are excluded from the numerator to keep numerator geography ==
 *      denominator geography. Enrollment: US TOTAL row from the same USDA
 *      FNA xlsx as MI state, same month = February 2026 (Preliminary),
 *      preliminary flag carried. All national tiers render MODELED.
 *
 * All benchmark records carry: value (or null), label (VERIFIED / MODELED
 * / PROJECTED / null when not ingested), source name + URL, vintage, the
 * formula used, and the numerator + denominator that fed the computation.
 * Charts call buildBenchmarks(metricId) to get a uniform shape across
 * tiers; the methodology panel renders the formula verbatim.
 */
import { COUNTY_PROFILES } from "../../data/michigan-county-profiles";
import { COUNTY_SNAP_RETAILERS } from "../../data/county-snap-retailers";
import {
  MICHIGAN_PROSPERITY_REGIONS,
  type MichiganProsperityRegion,
} from "../../data/michigan-prosperity-regions";
import {
  SNAP_COUNTY_FALLBACK,
  SNAP_STATE_FALLBACK,
} from "../../data/snapMichiganFallback";
import {
  getSnapMetric,
  type SnapMetricDef,
} from "../../data/snapGranularityRegistry";
import { resolveCompositeLabel } from "../provenance/resolveCompositeLabel";
import type { ProvenanceLabel } from "../provenance/resolveCompositeLabel";

export interface BenchmarkRecord {
  /** Tier this record describes. */
  tier: "state" | "regional" | "national";
  /** The slug or numeric id of the specific region/state being benchmarked.
   * For state: "michigan". For regional: the region's slug. For national:
   * "us". */
  scope: string;
  /** Display label for the legend or chip. */
  scopeLabel: string;
  /** Computed value or null if the benchmark is not available. */
  value: number | null;
  /** Provenance label as propagated through the math. null when the
   * benchmark is not available (state = "not-ingested"). */
  label: ProvenanceLabel | null;
  /** Tier-level coverage state of the benchmark itself. */
  state: "present" | "not-ingested";
  /** Sources for the numerator and denominator. */
  sources: Array<{ name: string; url: string; vintage: string }>;
  /** Numerator value used in the math, or null when not available. */
  numerator: number | null;
  /** Denominator value used in the math, or null when not available. */
  denominator: number | null;
  /** Plain-language explanation of the computation. Rendered verbatim in
   * the methodology panel. */
  formula: string;
  /** Optional reason text when state is "not-ingested". */
  reason?: string;
}

const PEP_V2024_SOURCE = {
  name: "U.S. Census Bureau Population Estimates Program, Vintage 2024",
  url: "https://www.census.gov/programs-surveys/popest.html",
  vintage: "July 1, 2024",
};

const USDA_FNA_STATE_TABLES = {
  name: "USDA FNA State Data Tables",
  url: "https://www.fna.usda.gov/pd/supplemental-nutrition-assistance-program-snap",
  vintage: "February 2026 (Preliminary)",
};

const USDA_RETAILER_LOCATOR = {
  name: "USDA SNAP Retailer Locator",
  url: "https://www.fna.usda.gov/snap/retailer/data",
  vintage: "December 31, 2025",
};

const USDA_FNA_NATIONAL_TABLES = {
  name: "USDA FNA National Data Tables",
  url: "https://www.fna.usda.gov/pd/supplemental-nutrition-assistance-program-snap",
  vintage: "February 2026 (Preliminary)",
};

const MICHIGAN_TOTAL_RETAILERS = 9225; // documented in county-snap-retailers.ts header

// National constants. Derivations:
//   NATIONAL_TOTAL_RETAILERS: from the same USDA Historical SNAP Retailer
//     Locator CSV (2005-2025 release, "as of December 31, 2025") that
//     powers MICHIGAN_TOTAL_RETAILERS. Filter identical to
//     scripts/refresh-snap-retailers.mjs (End Date blank) with the STATE=MI
//     restriction dropped, then reconciled to the 51 jurisdictions that
//     PEP V2024 covers (50 states + DC). All-codes total is 249,063;
//     Guam (260) and USVI (88) are excluded so the numerator geography
//     matches the denominator geography. Reconciled total: 248,715.
//   NATIONAL_TOTAL_POPULATION: sum of the 51 state-level POPESTIMATE2024
//     rows in co-est2024-alldata.csv (there is no STATE=00 US roll-up row
//     in this vintage of the county file). Identical vintage to the MI
//     population field used everywhere else in the platform.
//   NATIONAL_PERSONS_FEB26 / NATIONAL_HOUSEHOLDS_FEB26: TOTAL rows from
//     snap-persons-6.xlsx and snap-households-6.xlsx respectively,
//     "Data as of June 12, 2026", February 2026 Preliminary column. Both
//     files' TOTAL rows in this column are clean integers (no imputation);
//     March 2026 Initial was rejected because its TOTAL row carries
//     fractional cents from state-level imputation.
const NATIONAL_TOTAL_RETAILERS = 248_715;
const NATIONAL_TOTAL_POPULATION = 340_110_988;
const NATIONAL_PERSONS_FEB26 = 37_729_410;
const NATIONAL_HOUSEHOLDS_FEB26 = 20_502_831;

const NATIONAL_SCOPE_LABEL = "U.S. national";
const NATIONAL_RECONCILIATION_NOTE =
  "National retailer numerator restricted to 50 states + DC to match the PEP V2024 denominator; Guam (260 rows) and USVI (88 rows) excluded. All-codes current-authorized total 249,063; reconciled 248,715.";
const PRELIMINARY_NOTE =
  "USDA flags this month's figures as preliminary and subject to significant revision.";
const REGIONAL_ENROLLMENT_NOT_INGESTED_REASON =
  "county SNAP enrollment published only at FY2022; cannot aggregate to region at the state/national benchmark month without blending vintages.";

function michiganTotalPopulation(): number {
  let sum = 0;
  for (const profile of Object.values(COUNTY_PROFILES)) {
    sum += profile.population;
  }
  return sum;
}

function regionTotals(
  region: MichiganProsperityRegion,
  metric: SnapMetricDef,
): { numerator: number; denominator: number; missingCounties: string[] } {
  let numerator = 0;
  let denominator = 0;
  const missingCounties: string[] = [];

  for (const county of region.counties) {
    const profile = COUNTY_PROFILES[county];
    if (!profile || profile.population <= 0) {
      missingCounties.push(county);
      continue;
    }

    switch (metric.id) {
      case "enrollmentTotal":
      case "enrollmentHouseholds": {
        const row = SNAP_COUNTY_FALLBACK.find((r) => r.county === county);
        const v =
          metric.id === "enrollmentTotal"
            ? row?.enrollmentTotal
            : row?.enrollmentHouseholds;
        if (typeof v !== "number") {
          missingCounties.push(county);
          continue;
        }
        numerator += v;
        denominator += profile.population;
        break;
      }
      case "retailerCount": {
        const r = COUNTY_SNAP_RETAILERS[county];
        if (!r) {
          missingCounties.push(county);
          continue;
        }
        numerator += r.retailerCount;
        denominator += profile.population;
        break;
      }
      case "retailersPer10k": {
        const r = COUNTY_SNAP_RETAILERS[county];
        if (!r) {
          missingCounties.push(county);
          continue;
        }
        numerator += r.retailerCount;
        denominator += profile.population;
        break;
      }
      default:
        missingCounties.push(county);
    }
  }

  return { numerator, denominator, missingCounties };
}

function buildStateBenchmark(metric: SnapMetricDef): BenchmarkRecord {
  const stateTotalPop = michiganTotalPopulation();

  switch (metric.id) {
    case "enrollmentTotal": {
      const numerator = SNAP_STATE_FALLBACK.stateTotal;
      const denominator = stateTotalPop;
      const value = numerator;
      return {
        tier: "state",
        scope: "michigan",
        scopeLabel: "Michigan total (state)",
        value,
        label: resolveCompositeLabel(["VERIFIED"], { isAggregated: true }),
        state: "present",
        sources: [USDA_FNA_STATE_TABLES, PEP_V2024_SOURCE],
        numerator,
        denominator,
        formula: `Michigan statewide monthly SNAP persons participating reported by USDA FNA, ${USDA_FNA_STATE_TABLES.vintage}. ${PRELIMINARY_NOTE} Denominator (PEP V2024 statewide population) is shown for context; the rendered benchmark is the raw state total.`,
      };
    }
    case "enrollmentHouseholds": {
      const numerator = SNAP_STATE_FALLBACK.stateHouseholds;
      const denominator = stateTotalPop;
      return {
        tier: "state",
        scope: "michigan",
        scopeLabel: "Michigan total (state)",
        value: numerator,
        label: resolveCompositeLabel(["VERIFIED"], { isAggregated: true }),
        state: "present",
        sources: [USDA_FNA_STATE_TABLES, PEP_V2024_SOURCE],
        numerator,
        denominator,
        formula: `Michigan statewide monthly SNAP households participating reported by USDA FNA, ${USDA_FNA_STATE_TABLES.vintage}. ${PRELIMINARY_NOTE} Denominator (PEP V2024 statewide population) is shown for context; the rendered benchmark is the raw state total.`,
      };
    }
    case "retailerCount": {
      const value = MICHIGAN_TOTAL_RETAILERS;
      return {
        tier: "state",
        scope: "michigan",
        scopeLabel: "Michigan total (state)",
        value,
        label: resolveCompositeLabel(["VERIFIED"], { isAggregated: true }),
        state: "present",
        sources: [USDA_RETAILER_LOCATOR],
        numerator: value,
        denominator: stateTotalPop,
        formula: `Total currently authorized SNAP retailers in Michigan, as of ${USDA_RETAILER_LOCATOR.vintage}, summed from the USDA Retailer Locator bulk CSV.`,
      };
    }
    case "retailersPer10k": {
      const numerator = MICHIGAN_TOTAL_RETAILERS;
      const denominator = stateTotalPop;
      const value = denominator > 0 ? (numerator / denominator) * 10000 : 0;
      return {
        tier: "state",
        scope: "michigan",
        scopeLabel: "Michigan rate (state)",
        value,
        label: resolveCompositeLabel(["VERIFIED", "VERIFIED"], {
          isAggregated: true,
        }),
        state: "present",
        sources: [USDA_RETAILER_LOCATOR, PEP_V2024_SOURCE],
        numerator,
        denominator,
        formula: `(${MICHIGAN_TOTAL_RETAILERS.toLocaleString()} MI retailers / ${denominator.toLocaleString()} MI population) * 10,000. Numerator vintage ${USDA_RETAILER_LOCATOR.vintage}; denominator vintage ${PEP_V2024_SOURCE.vintage}. Population-weighted by construction (single state denominator).`,
      };
    }
    default:
      return notIngested(metric, "state", "michigan", "Michigan total (state)");
  }
}

function buildRegionalBenchmarks(metric: SnapMetricDef): BenchmarkRecord[] {
  // Regional enrollment (persons + households) is intentionally not-ingested.
  // County SNAP enrollment is published only at FY2022; aggregating that up
  // to a Prosperity Region and rendering it alongside a state/national
  // benchmark drawn from a Feb 2026 monthly file would blend vintages
  // silently. The visible "not-ingested" state carries the reason to the
  // provenance panel.
  if (metric.id === "enrollmentTotal" || metric.id === "enrollmentHouseholds") {
    return MICHIGAN_PROSPERITY_REGIONS.map((region) => ({
      tier: "regional",
      scope: region.id,
      scopeLabel: `Region ${region.number} - ${region.shortName}`,
      value: null,
      label: null,
      state: "not-ingested",
      sources: [USDA_FNA_STATE_TABLES],
      numerator: null,
      denominator: null,
      formula: `Regional ${metric.label} deliberately not aggregated: ${REGIONAL_ENROLLMENT_NOT_INGESTED_REASON}`,
      reason: REGIONAL_ENROLLMENT_NOT_INGESTED_REASON,
    }));
  }

  return MICHIGAN_PROSPERITY_REGIONS.map((region) => {
    const { numerator, denominator, missingCounties } = regionTotals(
      region,
      metric,
    );

    if (missingCounties.length === region.counties.length) {
      return {
        tier: "regional",
        scope: region.id,
        scopeLabel: `Region ${region.number} - ${region.shortName}`,
        value: null,
        label: null,
        state: "not-ingested",
        sources: [],
        numerator: null,
        denominator: null,
        formula:
          "Regional rollup unavailable: no county in this Prosperity Region has a value for this metric.",
        reason: `All ${region.counties.length} counties in this region lack a value for ${metric.label}.`,
      } satisfies BenchmarkRecord;
    }

    let value: number;
    let formula: string;
    switch (metric.id) {
      case "retailerCount":
        value = numerator;
        formula = `Sum of county-native retailer counts across ${region.counties.length - missingCounties.length} counties in Region ${region.number} - ${region.shortName}. Retailer vintage ${USDA_RETAILER_LOCATOR.vintage}; population-weighted denominator vintage ${PEP_V2024_SOURCE.vintage}.`;
        break;
      case "retailersPer10k":
        value = denominator > 0 ? (numerator / denominator) * 10000 : 0;
        formula = `(sum of retailers / sum of PEP V2024 population) * 10,000 across ${region.counties.length - missingCounties.length} counties in Region ${region.number} - ${region.shortName}. Population-weighted - larger counties contribute proportionally to the regional rate. Numerator vintage ${USDA_RETAILER_LOCATOR.vintage}; denominator vintage ${PEP_V2024_SOURCE.vintage}.`;
        break;
      default:
        value = 0;
        formula = "Unsupported metric.";
    }

    return {
      tier: "regional",
      scope: region.id,
      scopeLabel: `Region ${region.number} - ${region.shortName}`,
      value,
      label: resolveCompositeLabel(["VERIFIED"], { isAggregated: true }),
      state: "present",
      sources: [USDA_RETAILER_LOCATOR, PEP_V2024_SOURCE],
      numerator,
      denominator,
      formula:
        missingCounties.length === 0
          ? formula
          : `${formula} Missing: ${missingCounties.join(", ")}.`,
    } satisfies BenchmarkRecord;
  });
}

function buildNationalBenchmark(metric: SnapMetricDef): BenchmarkRecord {
  switch (metric.id) {
    case "enrollmentTotal": {
      const numerator = NATIONAL_PERSONS_FEB26;
      const denominator = NATIONAL_TOTAL_POPULATION;
      return {
        tier: "national",
        scope: "us",
        scopeLabel: NATIONAL_SCOPE_LABEL,
        value: numerator,
        label: resolveCompositeLabel(["VERIFIED"], { isAggregated: true }),
        state: "present",
        sources: [USDA_FNA_NATIONAL_TABLES, PEP_V2024_SOURCE],
        numerator,
        denominator,
        formula: `U.S. national monthly SNAP persons participating from the USDA FNA xlsx TOTAL row, ${USDA_FNA_NATIONAL_TABLES.vintage}. ${PRELIMINARY_NOTE} Denominator (PEP V2024 U.S. population, sum of 51 state-level rows in co-est2024-alldata.csv) is shown for context; the rendered benchmark is the raw national total.`,
      };
    }
    case "enrollmentHouseholds": {
      const numerator = NATIONAL_HOUSEHOLDS_FEB26;
      const denominator = NATIONAL_TOTAL_POPULATION;
      return {
        tier: "national",
        scope: "us",
        scopeLabel: NATIONAL_SCOPE_LABEL,
        value: numerator,
        label: resolveCompositeLabel(["VERIFIED"], { isAggregated: true }),
        state: "present",
        sources: [USDA_FNA_NATIONAL_TABLES, PEP_V2024_SOURCE],
        numerator,
        denominator,
        formula: `U.S. national monthly SNAP households participating from the USDA FNA xlsx TOTAL row, ${USDA_FNA_NATIONAL_TABLES.vintage}. ${PRELIMINARY_NOTE} Denominator (PEP V2024 U.S. population) is shown for context; the rendered benchmark is the raw national total.`,
      };
    }
    case "retailerCount": {
      const numerator = NATIONAL_TOTAL_RETAILERS;
      const denominator = NATIONAL_TOTAL_POPULATION;
      return {
        tier: "national",
        scope: "us",
        scopeLabel: NATIONAL_SCOPE_LABEL,
        value: numerator,
        label: resolveCompositeLabel(["VERIFIED"], { isAggregated: true }),
        state: "present",
        sources: [USDA_RETAILER_LOCATOR, PEP_V2024_SOURCE],
        numerator,
        denominator,
        formula: `U.S. currently authorized SNAP retailers, ${USDA_RETAILER_LOCATOR.vintage}, summed from the USDA Retailer Locator bulk CSV using the identical "End Date blank" filter refresh-snap-retailers.mjs applies to Michigan. ${NATIONAL_RECONCILIATION_NOTE}`,
      };
    }
    case "retailersPer10k": {
      const numerator = NATIONAL_TOTAL_RETAILERS;
      const denominator = NATIONAL_TOTAL_POPULATION;
      const value = denominator > 0 ? (numerator / denominator) * 10000 : 0;
      return {
        tier: "national",
        scope: "us",
        scopeLabel: "U.S. rate (national)",
        value,
        label: resolveCompositeLabel(["VERIFIED", "VERIFIED"], {
          isAggregated: true,
        }),
        state: "present",
        sources: [USDA_RETAILER_LOCATOR, PEP_V2024_SOURCE],
        numerator,
        denominator,
        formula: `(${numerator.toLocaleString()} U.S. retailers / ${denominator.toLocaleString()} U.S. population) * 10,000. Numerator vintage ${USDA_RETAILER_LOCATOR.vintage}; denominator vintage ${PEP_V2024_SOURCE.vintage}. Population-weighted as sum(numerator) / sum(denominator) on totals, not the mean of state-level rates. ${NATIONAL_RECONCILIATION_NOTE}`,
      };
    }
    default:
      return notIngested(metric, "national", "us", NATIONAL_SCOPE_LABEL);
  }
}

function notIngested(
  metric: SnapMetricDef,
  tier: BenchmarkRecord["tier"],
  scope: string,
  scopeLabel: string,
): BenchmarkRecord {
  return {
    tier,
    scope,
    scopeLabel,
    value: null,
    label: null,
    state: "not-ingested",
    sources: [],
    numerator: null,
    denominator: null,
    formula: `No benchmark math implemented for metric "${metric.id}" at tier "${tier}".`,
    reason: `Benchmark not implemented for ${metric.label}.`,
  };
}

export interface BenchmarkBundle {
  metricId: string;
  state: BenchmarkRecord;
  regional: BenchmarkRecord[];
  national: BenchmarkRecord;
}

/** Build all three benchmark tiers for a metric. */
export function buildBenchmarks(metricId: string): BenchmarkBundle | null {
  const metric = getSnapMetric(metricId);
  if (!metric) return null;
  return {
    metricId,
    state: buildStateBenchmark(metric),
    regional: buildRegionalBenchmarks(metric),
    national: buildNationalBenchmark(metric),
  };
}
