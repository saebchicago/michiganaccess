/**
 * Serializes all Michigan ZIP cohort profiles for the analyst query API.
 */

import { ZIP_TO_COUNTY } from "@/data/michiganZips";
import { buildZipCohortProfile } from "@/utils/cohortFilter";

export interface CohortApiZipRecord {
  zip: string;
  city: string;
  county: string;
  ej_index: number | null;
  pm25_percentile: number | null;
  energy_burden_pct: number | null;
  uninsured_rate: number | null;
  pcp_ratio: number | null;
  poverty_rate: number | null;
  ej_index_integrity: string;
  pm25_percentile_integrity: string;
}

export interface CohortApiBundle {
  schemaVersion: "accessmi-cohort-api-v1";
  generatedAt: string;
  zipCount: number;
  profiles: CohortApiZipRecord[];
}

export function buildCohortApiBundle(): CohortApiBundle {
  const profiles: CohortApiZipRecord[] = [];

  for (const zip of Object.keys(ZIP_TO_COUNTY).sort()) {
    const p = buildZipCohortProfile(zip);
    if (!p) continue;
    profiles.push({
      zip: p.zip,
      city: p.city,
      county: p.county,
      ej_index: p.metrics.ej_index.value,
      pm25_percentile: p.metrics.pm25_percentile.value,
      energy_burden_pct: p.metrics.energy_burden_pct.value,
      uninsured_rate: p.metrics.uninsured_rate.value,
      pcp_ratio: p.metrics.pcp_ratio.value,
      poverty_rate: p.metrics.poverty_rate.value,
      ej_index_integrity: p.metrics.ej_index.integrityLabel,
      pm25_percentile_integrity: p.metrics.pm25_percentile.integrityLabel,
    });
  }

  return {
    schemaVersion: "accessmi-cohort-api-v1",
    generatedAt: new Date().toISOString(),
    zipCount: profiles.length,
    profiles,
  };
}

export function filterCohortApiBundle(
  bundle: CohortApiBundle,
  criteria: {
    counties?: string[];
    minEjIndex?: number;
    minPm25Percentile?: number;
    minEnergyBurdenPct?: number;
    minUninsuredRate?: number;
    minPcpRatio?: number;
    minPovertyRate?: number;
  },
): CohortApiZipRecord[] {
  const hasNumeric =
    criteria.minEjIndex != null ||
    criteria.minPm25Percentile != null ||
    criteria.minEnergyBurdenPct != null ||
    criteria.minUninsuredRate != null ||
    criteria.minPcpRatio != null ||
    criteria.minPovertyRate != null;

  if (!hasNumeric) return [];

  const countySet = criteria.counties?.length
    ? new Set(criteria.counties.map((c) => c.toLowerCase()))
    : null;

  return bundle.profiles.filter((p) => {
    if (countySet && !countySet.has(p.county.toLowerCase())) return false;
    if (criteria.minEjIndex != null) {
      if (p.ej_index == null || p.ej_index_integrity !== "VERIFIED") return false;
      if (p.ej_index < criteria.minEjIndex) return false;
    }
    if (criteria.minPm25Percentile != null) {
      if (p.pm25_percentile == null || p.pm25_percentile_integrity !== "VERIFIED") return false;
      if (p.pm25_percentile < criteria.minPm25Percentile) return false;
    }
    if (criteria.minEnergyBurdenPct != null) {
      if (p.energy_burden_pct == null || p.energy_burden_pct < criteria.minEnergyBurdenPct)
        return false;
    }
    if (criteria.minUninsuredRate != null) {
      if (p.uninsured_rate == null || p.uninsured_rate < criteria.minUninsuredRate) return false;
    }
    if (criteria.minPcpRatio != null) {
      if (p.pcp_ratio == null || p.pcp_ratio < criteria.minPcpRatio) return false;
    }
    if (criteria.minPovertyRate != null) {
      if (p.poverty_rate == null || p.poverty_rate < criteria.minPovertyRate) return false;
    }
    return true;
  });
}