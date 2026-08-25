/**
 * Typed accessor for the CDC PLACES County generated data. The JSON
 * payload lives in cdc-places-county.generated.json so the fixture is
 * diffable and the vintage metadata can be read at build time without
 * touching this shim.
 *
 * County-level companion to cdc-places-zcta.ts. The 17 measure ids match
 * one-for-one with the ZCTA shim so a county view and a ZCTA view can be
 * built against a single measure catalog.
 */
import raw from "./cdc-places-county.generated.json";

export interface CdcPlacesCountyMeasureValue {
  crudePrevalence: number | null;
  ci95: { low: number; high: number } | null;
}

export type CdcPlacesCountyMeasures = Record<
  string,
  CdcPlacesCountyMeasureValue
>;

export interface CdcPlacesCountyRecord {
  countyFips: string;
  countyName: string;
  year: string | null;
  totalPop18Plus: number | null;
  measures: CdcPlacesCountyMeasures;
}

export interface CdcPlacesCountyProvenance {
  source_name: string;
  dataset_id: string;
  source_url: string;
  socrata_metadata_url: string;
  socrata_rows_updated_at: string;
  release_label: string;
  release_description: string;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  measure_count: number;
  value_units: string;
  value_label: "MODELED";
  weighting: string;
  notes: string;
}

export interface CdcPlacesCountyMeasureDef {
  id: string;
  category: "chronic" | "behavioral" | "preventive" | "status";
  label: string;
  places_measureid: string;
  value_label: "MODELED";
}

interface Payload {
  provenance: CdcPlacesCountyProvenance;
  measures: CdcPlacesCountyMeasureDef[];
  counties: CdcPlacesCountyRecord[];
}

const payload = raw as Payload;

export const CDC_PLACES_COUNTY_PROVENANCE: CdcPlacesCountyProvenance =
  payload.provenance;
export const CDC_PLACES_COUNTY_MEASURES: readonly CdcPlacesCountyMeasureDef[] =
  payload.measures;
export const CDC_PLACES_COUNTY_RECORDS: readonly CdcPlacesCountyRecord[] =
  payload.counties;

const BY_FIPS = new Map<string, CdcPlacesCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, CdcPlacesCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

/** Look up one MI county's PLACES record by 5-digit FIPS, or null. */
export function getPlacesForCountyFips(
  fips: string,
): CdcPlacesCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

/** Look up one MI county's PLACES record by canonical name, or null. */
export function getPlacesForCountyName(
  name: string,
): CdcPlacesCountyRecord | null {
  return BY_NAME.get(name) ?? null;
}

/** Look up one measure at one county, or null if the county has no record. */
export function getPlacesCountyMeasure(
  countyFips: string,
  measureId: string,
): CdcPlacesCountyMeasureValue | null {
  const record = BY_FIPS.get(countyFips);
  if (!record) return null;
  return record.measures[measureId] ?? null;
}
