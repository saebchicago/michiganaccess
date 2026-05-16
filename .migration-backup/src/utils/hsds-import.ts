/**
 * HSDS v3.x Import Utility
 *
 * Accepts HSDS-compliant CSV/JSON data packages from 211 systems and maps
 * them to the Access Michigan Supabase schema.
 *
 * Open Referral HSDS: https://docs.openreferral.org/
 * Michigan 211 partnership contact: Shelby Lummis, slummis@uwmich.org
 *
 * This is a foundation stub — full implementation requires HSDS data samples
 * from Michigan 211.
 */

export interface HsdsOrganization {
  id: string;
  name: string;
  description?: string;
  url?: string;
  email?: string;
  tax_status?: string;
  tax_id?: string;
  year_incorporated?: string;
}

export interface HsdsService {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  url?: string;
  email?: string;
  status: string;
  interpretation_services?: string;
  application_process?: string;
  fees_description?: string;
  eligibility_description?: string;
}

export interface HsdsLocation {
  id: string;
  organization_id: string;
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  transportation?: string;
}

export interface HsdsPhone {
  id: string;
  location_id?: string;
  service_id?: string;
  organization_id?: string;
  number: string;
  extension?: string;
  type?: string;
  description?: string;
}

export interface HsdsAddress {
  id: string;
  location_id: string;
  address_1: string;
  address_2?: string;
  city: string;
  region: string;
  state_province: string;
  postal_code: string;
  country: string;
  address_type: string;
}

export interface HsdsServiceArea {
  id: string;
  service_id: string;
  name?: string;
  description?: string;
}

/**
 * Validates an HSDS data package for required fields.
 */
export function validateHsdsPackage(data: {
  organizations?: HsdsOrganization[];
  services?: HsdsService[];
  locations?: HsdsLocation[];
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.organizations?.length) errors.push("No organizations found");
  if (!data.services?.length) errors.push("No services found");
  if (!data.locations?.length) errors.push("No locations found");

  data.organizations?.forEach((org, i) => {
    if (!org.id) errors.push(`Organization ${i}: missing id`);
    if (!org.name) errors.push(`Organization ${i}: missing name`);
  });

  data.services?.forEach((svc, i) => {
    if (!svc.id) errors.push(`Service ${i}: missing id`);
    if (!svc.organization_id) errors.push(`Service ${i}: missing organization_id`);
    if (!svc.name) errors.push(`Service ${i}: missing name`);
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Maps HSDS data to the Access Michigan community_resources format.
 * Stub — expand when real HSDS data is available from Michigan 211.
 */
export function mapHsdsToResources(data: {
  organizations: HsdsOrganization[];
  services: HsdsService[];
  locations: HsdsLocation[];
  addresses?: HsdsAddress[];
  phones?: HsdsPhone[];
}) {
  const addressMap = new Map((data.addresses || []).map((a) => [a.location_id, a]));
  const phoneMap = new Map((data.phones || []).map((p) => [p.service_id || p.organization_id || "", p]));

  return data.services.map((svc) => {
    const org = data.organizations.find((o) => o.id === svc.organization_id);
    const loc = data.locations.find((l) => l.organization_id === svc.organization_id);
    const addr = loc ? addressMap.get(loc.id) : undefined;
    const phone = phoneMap.get(svc.id) || phoneMap.get(svc.organization_id);

    return {
      name: svc.name,
      description: svc.description || org?.description || "",
      organization: org?.name || "",
      address: addr ? `${addr.address_1}, ${addr.city}, ${addr.state_province} ${addr.postal_code}` : "",
      city: addr?.city || "",
      state: addr?.state_province || "MI",
      zip: addr?.postal_code || "",
      phone: phone?.number || "",
      url: svc.url || org?.url || "",
      latitude: loc?.latitude || null,
      longitude: loc?.longitude || null,
      eligibility: svc.eligibility_description || "",
      fees: svc.fees_description || "",
      application_process: svc.application_process || "",
      hsds_organization_id: svc.organization_id,
      hsds_service_id: svc.id,
      hsds_location_id: loc?.id || null,
    };
  });
}
