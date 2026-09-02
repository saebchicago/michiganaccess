/**
 * Typed accessor for county K-12 education indicators from MI School Data
 * (Michigan Department of Education / CEPI).
 *
 * Payload: mde-county.generated.json, built by scripts/build-mde-county.mjs
 * from a hand-dropped county-level report export (see that script for why
 * this is a manual drop rather than a scheduled fetch). County-level MDE
 * tabulations ship VERIFIED; district files are never rolled up here.
 *
 * MDE suppresses cells under 10 students. A suppressed measure is null and
 * named in `suppressed`; it is never 0.
 */
import raw from "./mde-county.generated.json";

export type MdeMeasureId =
  | "chronicAbsenteeismPct"
  | "grade3ElaProficientPct"
  | "gradRate4yr"
  | "economicallyDisadvantagedPct";

export interface MdeMeasure {
  id: MdeMeasureId;
  label: string;
  /** The MI School Data report the county export comes from. */
  report: string;
  unit: "percent";
  value_label: "VERIFIED";
}

export interface MdeCountyRecord {
  countyFips: string;
  countyName: string;
  /** "populated" = every measure present; "partial" = at least one MDE
   * suppression; "pending-ci" = no county export dropped yet. */
  status: "populated" | "partial" | "pending-ci";
  /** e.g. "2024-25", or null while pending. */
  schoolYear: string | null;
  values: Record<MdeMeasureId, number | null>;
  /** Measure ids MDE suppressed for this county (under 10 students). */
  suppressed: MdeMeasureId[];
  /** K-12 enrollment behind the rates, or null. */
  enrollment: number | null;
  pendingReason: string | null;
}

export interface MdeCountyProvenance {
  source_name: string;
  source_url: string;
  publisher: string;
  school_year: string | null;
  source_csv: string | null;
  download_url: string | null;
  download_date: string | null;
  file_sha256: string | null;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "VERIFIED" | "PENDING";
  populated: boolean;
  pending_reason: string | null;
  suppression_rule: string;
  notes: string;
}

interface Payload {
  provenance: MdeCountyProvenance;
  measures: MdeMeasure[];
  counties: MdeCountyRecord[];
}

const payload = raw as Payload;

export const MDE_COUNTY_PROVENANCE: MdeCountyProvenance = payload.provenance;
export const MDE_MEASURES: readonly MdeMeasure[] = payload.measures;
export const MDE_COUNTY_RECORDS: readonly MdeCountyRecord[] = payload.counties;

const BY_FIPS = new Map<string, MdeCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, MdeCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

export function getMdeForCountyFips(fips: string): MdeCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getMdeForCountyName(name: string): MdeCountyRecord | null {
  return BY_NAME.get(name.replace(/\s+County$/i, "").trim()) ?? null;
}

/** One measure for one county, or null when pending or suppressed. */
export function getMdeValue(
  countyName: string,
  measureId: MdeMeasureId,
): number | null {
  const rec = getMdeForCountyName(countyName);
  if (!rec || rec.status === "pending-ci") return null;
  return rec.values[measureId] ?? null;
}

/** Human-readable source line for provenance tags. */
export const MDE_SOURCE_LABEL = MDE_COUNTY_PROVENANCE.school_year
  ? `MDE / CEPI, MI School Data ${MDE_COUNTY_PROVENANCE.school_year}`
  : "MDE / CEPI, MI School Data";

/** True iff a county export has been dropped and built. */
export const MDE_IS_POPULATED = MDE_COUNTY_PROVENANCE.populated;
