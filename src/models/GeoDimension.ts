/**
 * Geo Dimension — Shared geography spine for all pillars.
 *
 * Every dataset links to at least one key: ZIP, county FIPS, or census tract GEOID.
 * This model normalizes geography across health, environment, mobility, and economic pillars.
 */

import { MI_COUNTY_FIPS, MI_STATE_FIPS } from "@/data/census-geographies";
import { COUNTY_PROFILES, type CountyProfile } from "@/data/michigan-county-profiles";

export type GeographyLevel = "state" | "region" | "county" | "zip" | "tract";

export interface GeoDimension {
  /** State FIPS (always "26" for Michigan) */
  stateFips: string;
  /** County name */
  countyName: string | null;
  /** 3-digit county FIPS within state */
  countyFips: string | null;
  /** Full 5-digit FIPS (state + county) */
  fullCountyFips: string | null;
  /** ZIP code */
  zip: string | null;
  /** Census tract GEOID (11-digit) */
  tractGeoid: string | null;
  /** Region name */
  region: string | null;
  /** Population from county profiles */
  population: number | null;
  /** County type */
  countyType: "urban" | "suburban" | "rural" | null;
}

/**
 * Resolve a GeoDimension from whatever keys are available.
 * At least one of countyName, countyFips, or zip should be provided.
 */
export function resolveGeoDimension(params: {
  countyName?: string;
  countyFips?: string;
  zip?: string;
  tractGeoid?: string;
  region?: string;
}): GeoDimension {
  let countyName = params.countyName ?? null;
  let countyFips = params.countyFips ?? null;

  // Resolve county name from FIPS if needed
  if (!countyName && countyFips) {
    for (const [name, fips] of Object.entries(MI_COUNTY_FIPS)) {
      if (fips === countyFips) {
        countyName = name;
        break;
      }
    }
  }

  // Resolve county FIPS from name if needed
  if (countyName && !countyFips) {
    countyFips = MI_COUNTY_FIPS[countyName] ?? null;
  }

  const profile: CountyProfile | undefined = countyName ? COUNTY_PROFILES[countyName] : undefined;

  return {
    stateFips: MI_STATE_FIPS,
    countyName,
    countyFips,
    fullCountyFips: countyFips ? `${MI_STATE_FIPS}${countyFips}` : null,
    zip: params.zip ?? null,
    tractGeoid: params.tractGeoid ?? null,
    region: params.region ?? null,
    population: profile?.population ?? null,
    countyType: profile?.countyType ?? null,
  };
}

/** Compute a rate per N residents */
export function ratePer(count: number, population: number, per = 10000): number {
  if (population <= 0) return 0;
  return Math.round((count / population) * per * 100) / 100;
}

/** Compute percentile rank of a value within an array */
export function percentileRank(value: number, distribution: number[]): number {
  if (distribution.length === 0) return 0;
  const sorted = [...distribution].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < value).length;
  return Math.round((below / sorted.length) * 100);
}
