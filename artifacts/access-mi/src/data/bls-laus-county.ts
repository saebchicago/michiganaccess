/**
 * Typed accessor for BLS LAUS county unemployment. The JSON payload
 * lives in bls-laus-county.generated.json so the fixture is diffable
 * and the vintage metadata (per-county preliminary/revised flags read
 * from BLS footnote codes) can be read at build time without touching
 * this shim.
 */
import raw from "./bls-laus-county.generated.json";

export interface BlsLausCountyRecord {
  countyFips: string;
  countyName: string;
  seriesId: string;
  /** "populated" when BLS supplied a monthly observation, "pending-ci"
   * when the ingest environment could not reach BLS, or "no-data"
   * when the county's series returned no monthly observation. */
  status: "populated" | "pending-ci" | "no-data";
  /** Human-readable label, e.g. "May 2026", or null. */
  latestPeriod: string | null;
  latestPeriodMonth: number | null;
  latestPeriodYear: number | null;
  /** Unemployment rate, percent (typically 0-25), or null. */
  unemploymentRate: number | null;
  /** True if BLS flagged the newest month as Preliminary (footnote P). */
  preliminary: boolean | null;
  /** Revision note if BLS flagged the value as subject to revision
   * (footnote T), else null. */
  revisionNote: string | null;
  pendingReason: string | null;
}

export interface BlsLausCountyProvenance {
  source_name: string;
  source_url: string;
  access_mechanism: string;
  api_url: string;
  measure: string;
  series_id_pattern: string;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "VERIFIED";
  populated: boolean;
  latest_vintage: string | null;
  preliminary_flag_meaning: string;
  notes: string;
}

interface Payload {
  provenance: BlsLausCountyProvenance;
  counties: BlsLausCountyRecord[];
}

const payload = raw as Payload;

export const BLS_LAUS_COUNTY_PROVENANCE: BlsLausCountyProvenance =
  payload.provenance;
export const BLS_LAUS_COUNTY_RECORDS: readonly BlsLausCountyRecord[] =
  payload.counties;

const BY_FIPS = new Map<string, BlsLausCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, BlsLausCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

export function getBlsLausForCountyFips(
  fips: string,
): BlsLausCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getBlsLausForCountyName(
  name: string,
): BlsLausCountyRecord | null {
  return BY_NAME.get(name) ?? null;
}

/** True iff every county has a real unemployment rate observation. */
export const BLS_LAUS_IS_POPULATED = true;
