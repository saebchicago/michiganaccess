/**
 * Helpers for assembling per-county values for the SNAP slice charts.
 *
 * Charts call into here rather than directly into the SNAP data files so
 * that:
 *  - The cell's coverage state travels alongside the value. A missing
 *    value can be distinguished by the consumer as suppressed vs not
 *    ingested vs (in principle) modeled-estimate.
 *  - The granularity registry stays the only place that declares which
 *    fields of which data files map to which metric ids.
 */
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { COUNTY_SNAP_RETAILERS } from "@/data/county-snap-retailers";
import { SNAP_COUNTY_FALLBACK } from "@/data/snapMichiganFallback";
import {
  getCoverageState,
  type CoverageState,
} from "@/data/snapCoverageRegistry";
import { getSnapMetric } from "@/data/snapGranularityRegistry";
import {
  MICHIGAN_PROSPERITY_REGIONS,
  getProsperityRegionForCounty,
} from "@/data/michigan-prosperity-regions";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";

export interface CountyPoint {
  county: string;
  fips: string;
  population: number;
  regionNumber: number | null;
  regionShortName: string | null;
  /** Map from metric id to value. null when the metric has no value for
   * this county (the coverageStates entry says why). */
  values: Record<string, number | null>;
  /** Per-metric coverage state for this county. */
  coverageStates: Record<string, CoverageState>;
}

function readMetricValue(metricId: string, county: string): number | null {
  switch (metricId) {
    case "enrollmentTotal":
    case "enrollmentHouseholds": {
      const row = SNAP_COUNTY_FALLBACK.find((r) => r.county === county);
      if (!row) return null;
      const v =
        metricId === "enrollmentTotal"
          ? row.enrollmentTotal
          : row.enrollmentHouseholds;
      return typeof v === "number" && Number.isFinite(v) ? v : null;
    }
    case "retailerCount":
    case "retailersPer10k": {
      const r = COUNTY_SNAP_RETAILERS[county];
      if (!r) return null;
      const v = metricId === "retailerCount" ? r.retailerCount : r.ratePer10k;
      return typeof v === "number" && Number.isFinite(v) ? v : null;
    }
    default:
      return null;
  }
}

/**
 * Build a point-per-county dataset for an arbitrary set of metric ids.
 * All 83 counties are returned regardless of value presence; consumers
 * pick how to render the missing-coverage states.
 */
export function buildCountyPoints(metricIds: string[]): CountyPoint[] {
  // Validate metric ids up front.
  for (const id of metricIds) {
    if (!getSnapMetric(id)) {
      throw new Error(`buildCountyPoints: unknown metric "${id}"`);
    }
  }

  const counties = Object.keys(MI_COUNTY_FIPS).sort();
  return counties.map((county) => {
    const region = getProsperityRegionForCounty(county);
    const profile = COUNTY_PROFILES[county];
    const values: Record<string, number | null> = {};
    const coverageStates: Record<string, CoverageState> = {};
    for (const id of metricIds) {
      values[id] = readMetricValue(id, county);
      coverageStates[id] = getCoverageState(id, county).state;
    }
    return {
      county,
      fips: `26${MI_COUNTY_FIPS[county]}`,
      population: profile?.population ?? 0,
      regionNumber: region?.number ?? null,
      regionShortName: region?.shortName ?? null,
      values,
      coverageStates,
    };
  });
}

export const REGION_COLOR_PALETTE: Record<number, string> = {
  // Subset of a tonal blue/teal/amber palette, distinct per region but
  // tied to the platform's semantic colors so the dashboard stays on-brand.
  1: "#1B4F72", // navy
  2: "#1C7293", // teal-deep
  3: "#159A8C", // teal-bright
  4: "#0E7C66",
  5: "#3A8E50",
  6: "#7B8F1F",
  7: "#C99A2E",
  8: "#E0A33E", // amber
  9: "#B9542E",
  10: "#7E2E45",
};

export function regionColor(regionNumber: number | null): string {
  if (regionNumber === null) return "#94a3b8";
  return REGION_COLOR_PALETTE[regionNumber] ?? "#94a3b8";
}

export const ALL_REGION_LEGEND = MICHIGAN_PROSPERITY_REGIONS.map((r) => ({
  number: r.number,
  shortName: r.shortName,
  color: regionColor(r.number),
}));
