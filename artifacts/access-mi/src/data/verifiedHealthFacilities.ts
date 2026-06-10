// Verified statewide health-facility dataset under Definition B
// (CMS-certified hospital OR HRSA-active health center service site).
// Source data, provenance header, and per-county counts live in the
// companion JSON files alongside this module; regenerate both via
// `node scripts/build-facility-dataset.mjs`. Do not hand-edit.
import facilitiesData from "./verifiedHealthFacilities.json";
import countyReference from "./countyFacilityReference.json";

export type VerifiedFacilityType = "hospital" | "fqhc";

export interface VerifiedFacilitySourceRef {
  source: "CMS_HOSPITAL_GENERAL_INFO" | "HRSA_HEALTH_CENTER_SITES";
  source_id: string;
  source_url: string;
}

export interface VerifiedHealthFacility extends VerifiedFacilitySourceRef {
  id: string;
  name: string;
  type: VerifiedFacilityType;
  subtype: string | null;
  address: string | null;
  city: string | null;
  county: string;
  zip: string | null;
  phone: string | null;
  has_emergency: boolean;
  ownership: string | null;
  operator_org?: string | null;
  location_setting?: string | null;
  lat: number | null;
  lng: number | null;
}

interface ProvenanceSource {
  name: string;
  url: string;
  mi_rows: number;
  dataset_id?: string;
  filter?: string;
  dedupe_key: string;
}

export interface VerifiedFacilityProvenance {
  definition: string;
  sources: ProvenanceSource[];
  fetched_at: string;
  transform_script: string;
  counties_covered: number;
  counties_total: number;
  expected_zero_counties: string[];
  mi_total: number;
}

const payload = facilitiesData as {
  provenance: VerifiedFacilityProvenance;
  facilities: VerifiedHealthFacility[];
};
const refPayload = countyReference as {
  provenance: VerifiedFacilityProvenance & { note: string };
  counts: Record<string, number>;
};

export const VERIFIED_HEALTH_FACILITIES: VerifiedHealthFacility[] =
  payload.facilities;

export const VERIFIED_FACILITY_PROVENANCE: VerifiedFacilityProvenance =
  payload.provenance;

export const COUNTY_FACILITY_COUNTS: Record<string, number> = refPayload.counts;

/**
 * D5-style label used by IntegrityBadge wherever a verified facility
 * count renders. Pinned to the dataset vintage so a stale display can
 * be spotted at point of use.
 */
export const VERIFIED_FACILITY_SOURCE_LABEL = (() => {
  const date = new Date(VERIFIED_FACILITY_PROVENANCE.fetched_at)
    .toISOString()
    .slice(0, 10);
  return `CMS Hospital General Information + HRSA Health Center Sites [verified ${date}]`;
})();

export function countFacilitiesForCounty(county: string): number {
  return COUNTY_FACILITY_COUNTS[county] ?? 0;
}
