/**
 * Typed accessor for the CDC PLACES ZCTA generated data. The JSON payload
 * lives in cdc-places-zcta.generated.json so the fixture is diffable and
 * the vintage metadata can be read at build time without touching this
 * shim.
 */
import raw from "./cdc-places-zcta.generated.json";

/**
 * One published measure at one ZCTA. `crudePrevalence` is percent (0-100),
 * one decimal place; `ci95` is the source's 95% credible interval, or
 * null if PLACES suppressed the cell.
 */
export interface CdcPlacesMeasureValue {
  crudePrevalence: number | null;
  ci95: { low: number; high: number } | null;
}

/** All 17 measures for one ZCTA, keyed by the platform's stable measure id. */
export type CdcPlacesZctaMeasures = Record<string, CdcPlacesMeasureValue>;

/** One MI ZCTA's PLACES snapshot: 18+ population and 17 measures. */
export interface CdcPlacesZctaRecord {
  zcta5: string;
  totalPopulation: number | null;
  measures: CdcPlacesZctaMeasures;
}

/** Provenance block regenerated on every refresh. */
export interface CdcPlacesProvenance {
  source_name: string;
  dataset_id: string;
  source_url: string;
  socrata_metadata_url: string;
  socrata_rows_updated_at: string;
  release_label: string;
  release_description: string;
  ingested_at: string;
  ingest_script: string;
  michigan_zcta_registry: string;
  michigan_zcta_registry_size: number;
  michigan_zctas_suppressed_by_source: number;
  measure_count: number;
  value_units: string;
  value_label: "MODELED";
  weighting: string;
  notes: string;
}

/** Static description of one measure (stable id, category, PLACES field). */
export interface CdcPlacesMeasureDef {
  id: string;
  category: "chronic" | "behavioral" | "preventive" | "status";
  label: string;
  places_field: string;
  value_label: "MODELED";
}

interface Payload {
  provenance: CdcPlacesProvenance;
  measures: CdcPlacesMeasureDef[];
  zctas: CdcPlacesZctaRecord[];
}

const payload = raw as Payload;

export const CDC_PLACES_ZCTA_PROVENANCE: CdcPlacesProvenance =
  payload.provenance;
export const CDC_PLACES_MEASURES: readonly CdcPlacesMeasureDef[] =
  payload.measures;
export const CDC_PLACES_ZCTA_RECORDS: readonly CdcPlacesZctaRecord[] =
  payload.zctas;

const BY_ZCTA = new Map<string, CdcPlacesZctaRecord>(
  payload.zctas.map((r) => [r.zcta5, r]),
);

/** Look up one MI ZCTA's PLACES record, or null if not published. */
export function getPlacesForZcta(zcta5: string): CdcPlacesZctaRecord | null {
  return BY_ZCTA.get(zcta5) ?? null;
}

/** Look up one measure at one ZCTA, or null if the ZCTA has no record. */
export function getPlacesMeasure(
  zcta5: string,
  measureId: string,
): CdcPlacesMeasureValue | null {
  const record = BY_ZCTA.get(zcta5);
  if (!record) return null;
  return record.measures[measureId] ?? null;
}
