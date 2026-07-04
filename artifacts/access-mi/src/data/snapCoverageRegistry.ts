/**
 * SNAP food-access family - coverage registry.
 *
 * Each cell is a (metric x geography) pair tagged with its coverage state.
 * The four coverage states are kept visually distinct in the UI so a user
 * can tell at a glance whether a missing value is a federal-rule
 * suppression, a not-yet-ingested field, or a runtime aggregation:
 *
 *   - "present"          The cell has a county-native value read directly
 *                        from the source data file. No transformation.
 *   - "suppressed"       The source publishes the indicator but federal /
 *                        state small-cell rules block the cell. The reason
 *                        field cites the rule that triggered suppression.
 *   - "not-ingested"     The source publishes the indicator at the cell's
 *                        resolution but our pipeline does not yet load it.
 *                        Visible as a distinct state so users do not
 *                        confuse it with a real absence.
 *   - "modeled-estimate" The cell's value is computed at runtime from data
 *                        at a different resolution (e.g. tract-to-county
 *                        aggregation). Carries MODELED label propagation.
 *
 * For the SNAP slice, all four core metrics have full 83/83 county coverage
 * from the primary source. The registry therefore records only the
 * exceptions: nothing for the core metrics (they are all 'present'), one
 * entry per advertised-but-not-ingested optional metric, and a synthetic
 * rule for runtime-aggregated cross-overlays (covered by helpers below).
 */
import { MI_COUNTY_FIPS } from "./census-geographies";
import { COUNTY_SNAP_RETAILERS } from "./county-snap-retailers";
import { SNAP_COUNTY_FALLBACK } from "./snapMichiganFallback";
import {
  SNAP_FAMILY_METRICS,
  getSnapMetric,
  type SnapMetricDef,
} from "./snapGranularityRegistry";

export type CoverageState =
  | "present"
  | "suppressed"
  | "not-ingested"
  | "modeled-estimate";

export interface CoverageCell {
  metricId: string;
  county: string;
  state: CoverageState;
  /** When state is not "present", why. Free-text, kept short. */
  reason?: string;
}

export interface CoverageSummary {
  metricId: string;
  totalCounties: number;
  present: number;
  suppressed: number;
  notIngested: number;
  modeledEstimate: number;
}

const ALL_COUNTIES = Object.keys(MI_COUNTY_FIPS);

/**
 * Optional metrics in the SNAP family that the platform knows about but
 * has not yet ingested. Listing these explicitly is more honest than
 * leaving them invisible: the UI can advertise the gap to users (and to
 * future maintainers).
 */
export const SNAP_NOT_INGESTED: Array<{
  id: string;
  label: string;
  nativeResolution: "county" | "state";
  source: { name: string; url: string };
  reason: string;
}> = [
  {
    id: "monthlyParticipation",
    label: "Monthly SNAP participation (per county, per month)",
    nativeResolution: "county",
    source: {
      name: "USDA FNA FNS-388A monthly tables",
      url: "https://www.fna.usda.gov/pd/supplemental-nutrition-assistance-program-snap",
    },
    reason:
      "Pipeline currently ingests the FY2022 annual average only. Monthly county tables are published but not yet parsed.",
  },
];

/**
 * Sparse list of cells whose state is not "present". For SNAP this is
 * empty: all 83 counties of all 4 core metrics have direct county-native
 * values. The shape is retained so other families (e.g. FARS, which
 * suppresses Gogebic) can populate it.
 */
export const SNAP_EXCEPTIONS: CoverageCell[] = [];

const EXCEPTION_INDEX = new Map<string, CoverageCell>();
for (const cell of SNAP_EXCEPTIONS) {
  EXCEPTION_INDEX.set(`${cell.metricId}:${cell.county}`, cell);
}

function readPresentValue(metric: SnapMetricDef, county: string): boolean {
  switch (metric.id) {
    case "enrollmentTotal":
    case "enrollmentHouseholds": {
      const row = SNAP_COUNTY_FALLBACK.find((r) => r.county === county);
      if (!row) return false;
      const v =
        metric.id === "enrollmentTotal"
          ? row.enrollmentTotal
          : row.enrollmentHouseholds;
      return typeof v === "number" && Number.isFinite(v);
    }
    case "retailerCount":
    case "retailersPer10k": {
      const r = COUNTY_SNAP_RETAILERS[county];
      if (!r) return false;
      const v = metric.id === "retailerCount" ? r.retailerCount : r.ratePer10k;
      return typeof v === "number" && Number.isFinite(v);
    }
    default:
      return false;
  }
}

/**
 * Return the coverage state for (metricId, county). Reads:
 *   1. The sparse SNAP_EXCEPTIONS list first (suppressed / not-ingested
 *      overrides take priority over data presence checks).
 *   2. The data files themselves to confirm "present".
 *   3. Falls back to "not-ingested" with a generic reason if the metric
 *      exists in the registry but no value can be read.
 */
export function getCoverageState(
  metricId: string,
  county: string,
): CoverageCell {
  const exception = EXCEPTION_INDEX.get(`${metricId}:${county}`);
  if (exception) return exception;

  const metric = getSnapMetric(metricId);
  if (!metric) {
    return {
      metricId,
      county,
      state: "not-ingested",
      reason: `Unknown metric "${metricId}".`,
    };
  }

  if (readPresentValue(metric, county)) {
    return { metricId, county, state: "present" };
  }

  return {
    metricId,
    county,
    state: "not-ingested",
    reason: `No value for ${metric.label} in ${county} County in the bundled dataset.`,
  };
}

/** Tally coverage states across all 83 counties for a metric. */
export function summarizeCoverage(metricId: string): CoverageSummary {
  let present = 0;
  let suppressed = 0;
  let notIngested = 0;
  let modeledEstimate = 0;
  for (const county of ALL_COUNTIES) {
    const cell = getCoverageState(metricId, county);
    switch (cell.state) {
      case "present":
        present += 1;
        break;
      case "suppressed":
        suppressed += 1;
        break;
      case "not-ingested":
        notIngested += 1;
        break;
      case "modeled-estimate":
        modeledEstimate += 1;
        break;
    }
  }
  return {
    metricId,
    totalCounties: ALL_COUNTIES.length,
    present,
    suppressed,
    notIngested,
    modeledEstimate,
  };
}

/** Return summaries for every metric in the family, in display order. */
export function summarizeFamilyCoverage(): CoverageSummary[] {
  return SNAP_FAMILY_METRICS.map((m) => summarizeCoverage(m.id));
}

/**
 * Build a coverage cell that records a runtime-derived value. Used by the
 * regional/state aggregator: the cell's state is always "modeled-estimate"
 * regardless of input coverage, because the value is computed, not
 * directly read.
 */
export function modeledEstimateCell(
  metricId: string,
  county: string,
  reason: string,
): CoverageCell {
  return { metricId, county, state: "modeled-estimate", reason };
}
