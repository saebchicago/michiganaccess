import raw from "./usda-sram-2025-mi.generated.json";

export interface UsdaSram2025MiRecord {
  tractGEOID: string;
  countyName: string;
  urban: 0 | 1 | null;
  population2020: number | null;
  lowIncomeTract: 0 | 1 | null;
  lowIncomeLowAccess1And10: 0 | 1 | null;
  lowIncomeLowAccessHalfAnd10: 0 | 1 | null;
  lowIncomeLowAccess1And20: 0 | 1 | null;
  lowIncomeLowAccessVehicleOr20: 0 | 1 | null;
  noVehicleHighLowAccessFlag: 0 | 1 | null;
  lowAccess1And10: 0 | 1 | null;
  lowAccessHalfAnd10: 0 | 1 | null;
  lowAccess1And20: 0 | 1 | null;
  lowAccessVehicleOr20: 0 | 1 | null;
  tractHouseholdsNoVehicle: number | null;
}

export interface UsdaSram2025MiProvenance {
  source_name: string;
  source_url: string;
  map_service: string;
  distance_method: "straight-line (Euclidean)";
  release_date: string;
  retailer_vintage: string;
  tract_geography: string;
  socioeconomic_context: string;
  ingested_at: string | null;
  ingest_script: string;
  value_label: "VERIFIED" | "PENDING";
  populated: boolean;
  record_count: number;
  notes: string;
}

interface Payload {
  provenance: UsdaSram2025MiProvenance;
  records: UsdaSram2025MiRecord[];
}

const payload = raw as Payload;

export const USDA_SRAM_2025_MI_PROVENANCE = payload.provenance;
export const USDA_SRAM_2025_MI_RECORDS: readonly UsdaSram2025MiRecord[] =
  payload.records;
export const USDA_SRAM_2025_MI_IS_POPULATED =
  payload.provenance.populated && payload.records.length > 0;

const BY_TRACT = new Map(
  payload.records.map((record) => [record.tractGEOID, record]),
);

export function getUsdaSram2025ForTract(
  tractGEOID: string,
): UsdaSram2025MiRecord | null {
  return BY_TRACT.get(tractGEOID) ?? null;
}

export function getUsdaSram2025ForCounty(
  countyName: string,
): UsdaSram2025MiRecord[] {
  return payload.records.filter(
    (record) => record.countyName.toLowerCase() === countyName.toLowerCase(),
  );
}
