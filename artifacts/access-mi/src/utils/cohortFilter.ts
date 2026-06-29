/**
 * Multi-criteria ZIP cohort filter (UC8 Phase 1).
 * Uses only metrics with named sources. County-allocated values are MODELED.
 */

import { ZIP_TO_COUNTY } from "@/data/michiganZips";
import { MICHIGAN_EJSCREEN } from "@/data/ejscreen";
import { MICHIGAN_ENERGY_BURDEN } from "@/data/environmentalData";
import { getCountyProfile } from "@/data/michigan-county-profiles";
import { getCountyCrossDomain } from "@/data/cross-domain-indicators";
import type { IntegrityLabel } from "@/types/chna";

export interface CohortMetricValue {
  value: number | null;
  display: string;
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
}

export interface ZipCohortProfile {
  zip: string;
  city: string;
  county: string;
  metrics: {
    ej_index: CohortMetricValue;
    pm25_percentile: CohortMetricValue;
    energy_burden_pct: CohortMetricValue;
    uninsured_rate: CohortMetricValue;
    pcp_ratio: CohortMetricValue;
    poverty_rate: CohortMetricValue;
  };
}

export interface CohortCriteria {
  counties?: string[];
  minEjIndex?: number;
  minPm25Percentile?: number;
  minEnergyBurdenPct?: number;
  minUninsuredRate?: number;
  minPcpRatio?: number;
  minPovertyRate?: number;
}

export interface CohortPreset {
  id: string;
  label: string;
  description: string;
  criteria: CohortCriteria;
}

function parseRate(val: string): number | null {
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parsePcpRatio(val: string): number | null {
  const n = parseInt(val.split(":")[0].replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

const ENERGY_LOOKUP = Object.fromEntries(
  MICHIGAN_ENERGY_BURDEN.map((e) => [e.county, e.avgBurdenPct]),
);

export function buildZipCohortProfile(zip: string): ZipCohortProfile | null {
  const lookup = ZIP_TO_COUNTY[zip];
  if (!lookup) return null;

  const ej = MICHIGAN_EJSCREEN[zip];
  const profile = getCountyProfile(lookup.county);
  const cross = getCountyCrossDomain(lookup.county);

  const uninsuredRaw = profile?.healthHighlights[0]?.value;
  const pcpRaw = profile?.healthHighlights[1]?.value;
  const uninsured = uninsuredRaw ? parseRate(uninsuredRaw) : null;
  const pcp = pcpRaw ? parsePcpRatio(pcpRaw) : null;
  const energy = ENERGY_LOOKUP[lookup.county] ?? null;

  return {
    zip,
    city: lookup.city,
    county: lookup.county,
    metrics: {
      ej_index: {
        value: ej?.ej_index ?? null,
        display: ej ? String(ej.ej_index) : "-",
        integrityLabel: ej ? "VERIFIED" : "MODELED",
        source: ej ? "EPA EJScreen" : "Not available at ZIP",
        vintage: ej ? String(ej.data_year) : "N/A",
      },
      pm25_percentile: {
        value: ej?.pm25_percentile ?? null,
        display: ej ? String(ej.pm25_percentile) : "-",
        integrityLabel: ej ? "VERIFIED" : "MODELED",
        source: ej ? "EPA EJScreen" : "Not available at ZIP",
        vintage: ej ? String(ej.data_year) : "N/A",
      },
      energy_burden_pct: {
        value: energy,
        display: energy != null ? `${energy}%` : "-",
        integrityLabel: energy != null ? "VERIFIED" : "MODELED",
        source: "ACEEE LEAD Tool / DOE",
        vintage: "2023",
      },
      uninsured_rate: {
        value: uninsured,
        display: uninsured != null ? `${uninsured}%` : "-",
        integrityLabel: "MODELED",
        source: "County Health Rankings (SAHIE)",
        vintage: "2022",
      },
      pcp_ratio: {
        value: pcp,
        display: pcp != null ? `${pcp}:1` : "-",
        integrityLabel: "MODELED",
        source: "County Health Rankings (AHRF)",
        vintage: "2021",
      },
      poverty_rate: {
        value: cross?.povertyRate ?? null,
        display: cross?.povertyRate != null ? `${cross.povertyRate}%` : "-",
        integrityLabel: "MODELED",
        source: "Census ACS",
        vintage: "2022",
      },
    },
  };
}

function meetsThreshold(
  value: number | null,
  min: number | undefined,
  requireVerifiedOnly = false,
  integrity: IntegrityLabel = "MODELED",
): boolean {
  if (min === undefined) return true;
  if (value === null) return false;
  if (requireVerifiedOnly && integrity !== "VERIFIED") return false;
  return value >= min;
}

function hasActiveNumericFilters(criteria: CohortCriteria): boolean {
  return (
    criteria.minEjIndex !== undefined ||
    criteria.minPm25Percentile !== undefined ||
    criteria.minEnergyBurdenPct !== undefined ||
    criteria.minUninsuredRate !== undefined ||
    criteria.minPcpRatio !== undefined ||
    criteria.minPovertyRate !== undefined
  );
}

export function filterCohort(criteria: CohortCriteria): ZipCohortProfile[] {
  if (!hasActiveNumericFilters(criteria)) return [];

  const countySet = criteria.counties?.length
    ? new Set(criteria.counties.map((c) => c.toLowerCase()))
    : null;

  const results: ZipCohortProfile[] = [];

  for (const zip of Object.keys(ZIP_TO_COUNTY)) {
    const profile = buildZipCohortProfile(zip);
    if (!profile) continue;
    if (countySet && !countySet.has(profile.county.toLowerCase())) continue;

    const m = profile.metrics;
    if (
      !meetsThreshold(
        m.ej_index.value,
        criteria.minEjIndex,
        true,
        m.ej_index.integrityLabel,
      )
    )
      continue;
    if (
      !meetsThreshold(
        m.pm25_percentile.value,
        criteria.minPm25Percentile,
        true,
        m.pm25_percentile.integrityLabel,
      )
    )
      continue;
    if (!meetsThreshold(m.energy_burden_pct.value, criteria.minEnergyBurdenPct))
      continue;
    if (!meetsThreshold(m.uninsured_rate.value, criteria.minUninsuredRate))
      continue;
    if (!meetsThreshold(m.pcp_ratio.value, criteria.minPcpRatio)) continue;
    if (!meetsThreshold(m.poverty_rate.value, criteria.minPovertyRate)) continue;

    results.push(profile);
  }

  return results.sort((a, b) => a.zip.localeCompare(b.zip));
}

export const COHORT_PRESETS: CohortPreset[] = [
  {
    id: "respiratory-access",
    label: "High pollution + access gap",
    description:
      "ZIPs with elevated PM2.5 burden (EJScreen) plus high uninsured rate or primary care shortage.",
    criteria: {
      minPm25Percentile: 65,
      minUninsuredRate: 10,
    },
  },
  {
    id: "energy-chronic",
    label: "Energy burden + poverty",
    description:
      "ZIPs in counties with above-average energy burden and elevated poverty.",
    criteria: {
      minEnergyBurdenPct: 4.5,
      minPovertyRate: 15,
    },
  },
  {
    id: "ej-compound",
    label: "High EJ index",
    description: "ZIPs with direct EJScreen composite index at or above 70.",
    criteria: { minEjIndex: 70 },
  },
];

export function criteriaToSearchParams(criteria: CohortCriteria): URLSearchParams {
  const p = new URLSearchParams();
  if (criteria.counties?.length) p.set("counties", criteria.counties.join(","));
  if (criteria.minEjIndex != null) p.set("ej", String(criteria.minEjIndex));
  if (criteria.minPm25Percentile != null)
    p.set("pm25", String(criteria.minPm25Percentile));
  if (criteria.minEnergyBurdenPct != null)
    p.set("energy", String(criteria.minEnergyBurdenPct));
  if (criteria.minUninsuredRate != null)
    p.set("uninsured", String(criteria.minUninsuredRate));
  if (criteria.minPcpRatio != null) p.set("pcp", String(criteria.minPcpRatio));
  if (criteria.minPovertyRate != null)
    p.set("poverty", String(criteria.minPovertyRate));
  return p;
}

export function criteriaFromSearchParams(
  params: URLSearchParams,
): CohortCriteria {
  const counties = params.get("counties");
  const num = (key: string) => {
    const v = params.get(key);
    if (!v) return undefined;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    counties: counties
      ? counties.split(",").map((c) => c.trim()).filter(Boolean)
      : undefined,
    minEjIndex: num("ej"),
    minPm25Percentile: num("pm25"),
    minEnergyBurdenPct: num("energy"),
    minUninsuredRate: num("uninsured"),
    minPcpRatio: num("pcp"),
    minPovertyRate: num("poverty"),
  };
}