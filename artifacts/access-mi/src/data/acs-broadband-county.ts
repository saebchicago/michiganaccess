/**
 * Typed accessor for ACS county broadband subscription data. The JSON
 * payload lives in acs-broadband-county.generated.json so the fixture
 * is diffable and the vintage metadata can be read at build time
 * without touching this shim.
 *
 * This is the ADOPTION signal (Census ACS B28002: household broadband
 * subscription), not the AVAILABILITY signal (FCC BDC). The two
 * measure different phenomena; do not conflate.
 */
import raw from "./acs-broadband-county.generated.json";

/** One county's broadband subscription record. */
export interface AcsBroadbandCountyRecord {
  countyFips: string;
  countyName: string;
  /** "populated" when real values are present, "pending-ci" when the
   * ingest environment lacked CENSUS_API_KEY and CI must re-run, or
   * "no-data" when ACS returned nothing for the county. */
  status: "populated" | "pending-ci" | "no-data";
  /** ACS B28002_001E - total households (universe), or null. */
  households: number | null;
  /** ACS B28002_007E - households with any broadband subscription, or null. */
  householdsWithBroadband: number | null;
  /** Percent, 2 decimals, computed as broadband / households * 100, or null. */
  broadbandSubscriptionRate: number | null;
  /** Human-readable reason when the record is not populated. */
  pendingReason: string | null;
}

export interface AcsBroadbandCountyProvenance {
  source_name: string;
  source_url: string;
  acs_table_url: string;
  api_base: string;
  dataset: string;
  vintage_window: string;
  numerator_variable: string;
  numerator_label: string;
  universe_variable: string;
  universe_label: string;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "VERIFIED";
  /** True when this generated file carries real values, false when
   * every county is in "pending-ci" state. */
  populated: boolean;
  notes: string;
}

interface Payload {
  provenance: AcsBroadbandCountyProvenance;
  counties: AcsBroadbandCountyRecord[];
}

const payload = raw as Payload;

export const ACS_BROADBAND_COUNTY_PROVENANCE: AcsBroadbandCountyProvenance =
  payload.provenance;
export const ACS_BROADBAND_COUNTY_RECORDS: readonly AcsBroadbandCountyRecord[] =
  payload.counties;

const BY_FIPS = new Map<string, AcsBroadbandCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, AcsBroadbandCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

export function getAcsBroadbandForCountyFips(
  fips: string,
): AcsBroadbandCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getAcsBroadbandForCountyName(
  name: string,
): AcsBroadbandCountyRecord | null {
  return BY_NAME.get(name) ?? null;
}

/** True iff every county has a real broadband subscription rate. */
export const ACS_BROADBAND_IS_POPULATED = false;
