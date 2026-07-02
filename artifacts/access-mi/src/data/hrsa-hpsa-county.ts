/**
 * Typed accessor for the HRSA HPSA county rollup. The JSON payload
 * lives in hrsa-hpsa-county.generated.json so the fixture is diffable
 * and the vintage metadata (per-discipline "Data Warehouse Record
 * Create Date") can be read at build time without touching this shim.
 *
 * HRSA does not publish a county-level HPSA summary; the values here
 * are aggregations from the three facility-detail files (Primary Care,
 * Dental Health, Mental Health) and are labeled MODELED accordingly.
 */
import raw from "./hrsa-hpsa-county.generated.json";

export interface HpsaDisciplineMetrics {
  /** Number of designated HPSAs in this county for this discipline. */
  designatedHpsas: number;
  /** Max HPSA Score across designations, or null if none. Higher = more severe. */
  maxHpsaScore: number | null;
  /** Sum of HPSA Designation Population across designations. */
  designationPopulation: number;
  /** Sum of HPSA Estimated Underserved Population across designations. */
  estimatedUnderservedPopulation: number;
  /** Sum of HPSA FTE (provider FTEs currently in place). */
  providerFte: number;
  /** Sum of HPSA Shortage (provider FTEs still needed). */
  shortageFte: number;
}

export type HpsaDisciplineId = "primaryCare" | "dental" | "mental";

export type HpsaDisciplineMap = Record<HpsaDisciplineId, HpsaDisciplineMetrics>;

export interface HpsaCountyRecord {
  countyFips: string;
  countyName: string;
  disciplines: HpsaDisciplineMap;
}

export interface HpsaDisciplineVintage {
  disciplineId: HpsaDisciplineId;
  label: string;
  file: string;
  dwCreateDate: string | null;
  miDesignatedHpsas: number;
  miWithdrawnHpsas: number;
  miOtherStatusHpsas: number;
}

export interface HpsaProvenance {
  source_name: string;
  source_url: string;
  download_base_url: string;
  per_discipline: HpsaDisciplineVintage[];
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "MODELED";
  rollup_method: string;
  notes: string;
}

interface Payload {
  provenance: HpsaProvenance;
  counties: HpsaCountyRecord[];
}

const payload = raw as Payload;

export const HRSA_HPSA_COUNTY_PROVENANCE: HpsaProvenance = payload.provenance;
export const HRSA_HPSA_COUNTY_RECORDS: readonly HpsaCountyRecord[] =
  payload.counties;

const BY_FIPS = new Map<string, HpsaCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, HpsaCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

export function getHpsaForCountyFips(fips: string): HpsaCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getHpsaForCountyName(name: string): HpsaCountyRecord | null {
  return BY_NAME.get(name) ?? null;
}
