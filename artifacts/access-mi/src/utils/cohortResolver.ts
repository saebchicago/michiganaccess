/**
 * ZIP-level cohort metric resolver (UC8 Phase 1).
 *
 * Direct ZIP readings are VERIFIED. County-allocated values are MODELED.
 * Null means the metric cannot be sourced for that ZIP without fabrication.
 */

import { ZIP_TO_COUNTY } from "@/data/michiganZips";
import { MICHIGAN_EJSCREEN } from "@/data/ejscreen";
import { getCountyProfile } from "@/data/michigan-county-profiles";
import { getCountyCrossDomain } from "@/data/cross-domain-indicators";
import { MICHIGAN_ENERGY_BURDEN } from "@/data/environmentalData";
import type { IntegrityLabel } from "@/types/chna";

export type CohortMetricKey =
  | "ej_index"
  | "pm25_percentile"
  | "energy_burden_pct"
  | "uninsured_rate"
  | "pcp_ratio"
  | "poverty_rate";

export interface CohortMetricValue {
  key: CohortMetricKey;
  value: number | null;
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
}

export interface CohortZipRecord {
  zip: string;
  city: string;
  county: string;
  metrics: Record<CohortMetricKey, CohortMetricValue>;
}

function parseRate(val: string): number | null {
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parsePcpRatio(val: string): number | null {
  const n = parseInt(val.split(":")[0].replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function metric(
  key: CohortMetricKey,
  value: number | null,
  integrityLabel: IntegrityLabel,
  source: string,
  vintage: string,
): CohortMetricValue {
  return { key, value, integrityLabel, source, vintage };
}

export function resolveCohortZip(zip: string): CohortZipRecord | null {
  const lookup = ZIP_TO_COUNTY[zip];
  if (!lookup) return null;

  const ej = MICHIGAN_EJSCREEN[zip];
  const profile = getCountyProfile(lookup.county);
  const cross = getCountyCrossDomain(lookup.county);
  const energy = MICHIGAN_ENERGY_BURDEN.find((e) => e.county === lookup.county);

  const uninsuredRaw = profile?.healthHighlights.find((h) =>
    h.label.toLowerCase().includes("uninsured"),
  )?.value;
  const pcpRaw = profile?.healthHighlights.find((h) =>
    h.label.toLowerCase().includes("primary care"),
  )?.value;

  return {
    zip,
    city: lookup.city,
    county: lookup.county,
    metrics: {
      ej_index: metric(
        "ej_index",
        ej?.ej_index ?? null,
        ej ? "VERIFIED" : "MODELED",
        "EPA EJScreen v2.3",
        "2023",
      ),
      pm25_percentile: metric(
        "pm25_percentile",
        ej?.pm25_percentile ?? null,
        ej ? "VERIFIED" : "MODELED",
        "EPA EJScreen v2.3",
        "2023",
      ),
      energy_burden_pct: metric(
        "energy_burden_pct",
        energy?.avgBurdenPct ?? null,
        energy ? "MODELED" : "MODELED",
        "ACEEE LEAD Tool / DOE",
        "2023",
      ),
      uninsured_rate: metric(
        "uninsured_rate",
        uninsuredRaw ? parseRate(uninsuredRaw) : null,
        "MODELED",
        "County Health Rankings (SAHIE 2022)",
        "2025 CHR release",
      ),
      pcp_ratio: metric(
        "pcp_ratio",
        pcpRaw ? parsePcpRatio(pcpRaw) : null,
        "MODELED",
        "County Health Rankings (AHRF 2021)",
        "2025 CHR release",
      ),
      poverty_rate: metric(
        "poverty_rate",
        cross?.povertyRate ?? null,
        "MODELED",
        "Census ACS 5-Year",
        "2019-2023",
      ),
    },
  };
}

export interface CohortFilterCriteria {
  enabled: Partial<Record<CohortMetricKey, boolean>>;
  thresholds: Partial<Record<CohortMetricKey, number>>;
  /** If non-empty, only ZIPs in these counties */
  counties?: string[];
}

/** Higher pcp_ratio and higher burden/rates = worse access/burden */
const HIGHER_IS_WORSE: Set<CohortMetricKey> = new Set([
  "ej_index",
  "pm25_percentile",
  "energy_burden_pct",
  "uninsured_rate",
  "pcp_ratio",
  "poverty_rate",
]);

export function matchesCohortFilters(
  record: CohortZipRecord,
  criteria: CohortFilterCriteria,
): boolean {
  if (criteria.counties && criteria.counties.length > 0) {
    if (!criteria.counties.includes(record.county)) return false;
  }

  for (const key of Object.keys(criteria.enabled ?? {}) as CohortMetricKey[]) {
    if (!criteria.enabled?.[key]) continue;
    const threshold = criteria.thresholds?.[key];
    if (threshold === undefined) continue;

    const m = record.metrics[key];
    if (m.value === null) return false;

    if (HIGHER_IS_WORSE.has(key)) {
      if (m.value < threshold) return false;
    } else if (m.value > threshold) {
      return false;
    }
  }

  return true;
}

export function filterCohortZips(criteria: CohortFilterCriteria): CohortZipRecord[] {
  const zips = Object.keys(ZIP_TO_COUNTY);
  const results: CohortZipRecord[] = [];

  for (const zip of zips) {
    const record = resolveCohortZip(zip);
    if (!record) continue;
    if (matchesCohortFilters(record, criteria)) results.push(record);
  }

  return results.sort((a, b) => a.zip.localeCompare(b.zip));
}

export const COHORT_METRIC_META: Record<
  CohortMetricKey,
  { label: string; unit: string; defaultThreshold: number; description: string }
> = {
  ej_index: {
    label: "EJ Index",
    unit: "score",
    defaultThreshold: 60,
    description: "EPA EJScreen composite burden (0-100, higher = more burdened). Direct data for sample ZIPs only.",
  },
  pm25_percentile: {
    label: "PM2.5 percentile",
    unit: "%ile",
    defaultThreshold: 65,
    description: "National PM2.5 exposure percentile from EJScreen.",
  },
  energy_burden_pct: {
    label: "Energy burden",
    unit: "%",
    defaultThreshold: 4,
    description: "County-average share of income spent on energy (ACEEE), allocated to ZIP.",
  },
  uninsured_rate: {
    label: "Uninsured rate",
    unit: "%",
    defaultThreshold: 10,
    description: "County uninsured rate allocated to ZIP via CHR/SAHIE.",
  },
  pcp_ratio: {
    label: "Primary care ratio",
    unit: ":1",
    defaultThreshold: 1500,
    description: "Population per primary care provider. Higher = worse access.",
  },
  poverty_rate: {
    label: "Poverty rate",
    unit: "%",
    defaultThreshold: 18,
    description: "County poverty rate from ACS, allocated to ZIP.",
  },
};

export const COHORT_PRESETS: {
  id: string;
  label: string;
  description: string;
  criteria: CohortFilterCriteria;
}[] = [
  {
    id: "respiratory-access-gap",
    label: "High pollution + access gap",
    description:
      "ZIPs with elevated PM2.5 burden and primary care ratios above 1,500:1.",
    criteria: {
      enabled: { pm25_percentile: true, pcp_ratio: true },
      thresholds: { pm25_percentile: 65, pcp_ratio: 1500 },
    },
  },
  {
    id: "energy-poverty",
    label: "Energy burden + poverty",
    description: "ZIPs with energy burden at or above 4% and poverty at or above 18%.",
    criteria: {
      enabled: { energy_burden_pct: true, poverty_rate: true },
      thresholds: { energy_burden_pct: 4, poverty_rate: 18 },
    },
  },
  {
    id: "ej-uninsured",
    label: "EJ burden + uninsured",
    description: "ZIPs with EJ index at or above 60 and uninsured rate at or above 10%.",
    criteria: {
      enabled: { ej_index: true, uninsured_rate: true },
      thresholds: { ej_index: 60, uninsured_rate: 10 },
    },
  },
];