/**
 * SNAP food-access family - benchmark math.
 *
 * Three benchmark tiers, each with a different provenance story:
 *
 *   1. State. Computed from Michigan-wide enrollment (USDA FNS state
 *      tables, January 2026) and Michigan-wide retailer count (USDA SNAP
 *      Retailer Locator, December 2025) over the state's PEP V2024
 *      population. Inputs are VERIFIED. The rate itself is a runtime
 *      computation (numerator and denominator from different sources at
 *      different vintages), so it propagates to MODELED per the
 *      fitted/aggregated rule in resolveCompositeLabel.
 *
 *   2. Regional (Michigan Prosperity Region). Population-weighted rollup
 *      of county-native values into the 10 Prosperity Regions. All inputs
 *      are county-level VERIFIED; the rollup itself is an aggregation
 *      from a different geography than the rendered one (county) and is
 *      always MODELED.
 *
 *   3. National. Not yet bundled in the repo. The platform's no-fabricate
 *      rule blocks us from inventing a number. The benchmark returns a
 *      NOT_INGESTED descriptor that the UI renders as a distinct state,
 *      with a pointer to the source URL where the figure lives. This is
 *      visible-by-design: it shows users that the absence is a known gap,
 *      not a silent failure.
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
  vintage: "2024",
};

const USDA_FNS_STATE_TABLES = {
  name: "USDA FNS State Data Tables",
  url: "https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap",
  vintage: "January 2026",
};

const USDA_RETAILER_LOCATOR = {
  name: "USDA SNAP Retailer Locator",
  url: "https://www.fns.usda.gov/snap/retailer/data",
  vintage: "2025-12",
};

const USDA_FNS_NATIONAL_TABLES = {
  name: "USDA FNS National Data Tables",
  url: "https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap",
  vintage: "pending ingest",
};

const MICHIGAN_TOTAL_RETAILERS = 9225; // documented in county-snap-retailers.ts header

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
        sources: [USDA_FNS_STATE_TABLES, PEP_V2024_SOURCE],
        numerator,
        denominator,
        formula: `Michigan statewide monthly SNAP participants reported by USDA FNS, ${USDA_FNS_STATE_TABLES.vintage}. Denominator (PEP V2024 statewide population) is shown for context; the rendered benchmark is the raw state total.`,
      };
    }
    case "enrollmentHouseholds": {
      return {
        tier: "state",
        scope: "michigan",
        scopeLabel: "Michigan total (state)",
        value: null,
        label: null,
        state: "not-ingested",
        sources: [USDA_FNS_STATE_TABLES],
        numerator: null,
        denominator: null,
        formula:
          "Statewide certified-households count is not in the bundled state table; only county-level FY2022 figures are available in this build.",
        reason:
          "State household total not ingested - pending FNS state household table parse.",
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
      case "enrollmentTotal":
      case "enrollmentHouseholds":
        value = numerator;
        formula = `Sum of county-native values across ${region.counties.length - missingCounties.length} counties in Region ${region.number} - ${region.shortName}.`;
        break;
      case "retailerCount":
        value = numerator;
        formula = `Sum of county-native retailer counts across ${region.counties.length - missingCounties.length} counties in Region ${region.number} - ${region.shortName}.`;
        break;
      case "retailersPer10k":
        value = denominator > 0 ? (numerator / denominator) * 10000 : 0;
        formula = `(sum of retailers / sum of PEP V2024 population) * 10,000 across ${region.counties.length - missingCounties.length} counties in Region ${region.number} - ${region.shortName}. Population-weighted - larger counties contribute proportionally to the regional rate.`;
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
      sources:
        metric.id === "retailersPer10k"
          ? [USDA_RETAILER_LOCATOR, PEP_V2024_SOURCE]
          : [{ ...metric.source, vintage: metric.vintage }],
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
  return {
    tier: "national",
    scope: "us",
    scopeLabel: "U.S. national",
    value: null,
    label: null,
    state: "not-ingested",
    sources: [USDA_FNS_NATIONAL_TABLES],
    numerator: null,
    denominator: null,
    formula: `National SNAP figures are published by USDA FNS at the linked data page, but the population-weighted national benchmark for ${metric.label} is not yet bundled in this build. The Food Access Explorer shows this as a distinct "not ingested" state rather than hiding the row, so users can see the gap and the source.`,
    reason:
      "National figure not ingested in this build. See USDA FNS National Data Tables.",
  };
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
