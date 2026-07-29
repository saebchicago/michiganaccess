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

/**
 * NOT ADDITIVE - read before aggregating anything below.
 *
 * HRSA HPSA designations are facility-based and their service areas overlap:
 * several designations in the same county routinely cover the same residents
 * and the same clinicians. The four sum-derived fields here are therefore
 * already inflated at the county level and inflate further if summed across
 * counties. Measured on the June 2026 files:
 *
 *   - Wayne County holds 310 primary-care designations whose
 *     designationPopulation sums to 32,678,471 against a county population of
 *     roughly 1.79 million (about 18x).
 *   - Summing estimatedUnderservedPopulation statewide yields 24,282,165
 *     "underserved residents" against a state population of roughly 10.1
 *     million.
 *   - Summing shortageFte statewide yields 8,114 primary-care FTE "still
 *     needed" against a whole-state baseline need of roughly 2,879 FTE at the
 *     conventional 1:3500 ratio.
 *
 * Safe to aggregate: designatedHpsas (a count of records), a count of
 * counties with at least one designation, and maxHpsaScore (a maximum, not a
 * sum). Everything else is meaningful only for a single designation.
 * See docs/audit-2026-07.md (D8) and NeedCapacityCard.tsx.
 */
export interface HpsaDisciplineMetrics {
  /** Number of designated HPSAs in this county for this discipline. Safe to sum. */
  designatedHpsas: number;
  /** Max HPSA Score across designations, or null if none. Higher = more severe. Safe to max. */
  maxHpsaScore: number | null;
  /** NOT ADDITIVE. Sum of HPSA Designation Population across overlapping designations. */
  designationPopulation: number;
  /** NOT ADDITIVE. Sum of HPSA Estimated Underserved Population across overlapping designations. */
  estimatedUnderservedPopulation: number;
  /** NOT ADDITIVE. Sum of HPSA FTE (provider FTEs in place) across overlapping designations. */
  providerFte: number;
  /** NOT ADDITIVE. Sum of HPSA Shortage (provider FTEs still needed) across overlapping designations. */
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
  /**
   * Leaf field names that must never be summed or rendered as counts of
   * people or clinicians. Enforced by scripts/check-plausibility.mjs.
   */
  non_additive_fields: string[];
  non_additive_reason: string;
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
