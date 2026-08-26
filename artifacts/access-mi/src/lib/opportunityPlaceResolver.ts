import { MI_COUNTY_FIPS, getCountyFromFips } from "@/data/census-geographies";
import { PROPERTY_TAX_RATES } from "@/data/michigan-taxes";
import { getPrimaryCountyForZcta } from "@/data/zcta-county-crosswalk";
import type { OpportunityPlace } from "@/data/opportunityAtlas";

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ");

const slugify = (value: string) =>
  normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const fullCountyFips = (countyName: string): string | null => {
  const countyCode = MI_COUNTY_FIPS[countyName];
  return countyCode ? `26${countyCode}` : null;
};

const COUNTY_BY_NORMALIZED = new Map(
  Object.keys(MI_COUNTY_FIPS).map((name) => [normalize(name), name]),
);
const CITY_BY_NORMALIZED = new Map(
  Object.entries(PROPERTY_TAX_RATES).map(([city, data]) => [
    normalize(city),
    { city, countyName: data.county },
  ]),
);

/**
 * Resolve only canonical public Michigan geographies.
 *
 * - County IDs always use the full five-digit county FIPS (state 26 + county).
 * - ZIP input is resolved through the existing Census 2020 ZCTA-to-county
 *   crosswalk and explicitly remains county-context unless a native ZIP/ZCTA
 *   metric is rendered.
 * - Raw street addresses are intentionally unsupported so free-text locations
 *   do not need to be persisted or placed in analytics/share URLs.
 */
export function resolveOpportunityPlace(
  input: string,
): OpportunityPlace | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d{5}$/.test(trimmed)) {
    const primary = getPrimaryCountyForZcta(trimmed);
    if (!primary || !/^26\d{3}$/.test(primary.countyFips)) return null;
    return {
      id: `zcta-${trimmed}`,
      geographyType: "zcta",
      label: `ZIP ${trimmed}`,
      countyName: primary.countyName,
      countyFips: primary.countyFips,
      resolutionNote: `ZIP ${trimmed} spans Census ZCTA geography. Current brief metrics below are county-context values for ${primary.countyName} County, resolved using the Census 2020 ZCTA-to-county largest land-area overlap; they are not represented as ZIP-level measurements.`,
    };
  }

  const key = normalize(trimmed.replace(/\s+county$/i, ""));
  const countyName = COUNTY_BY_NORMALIZED.get(key);
  if (countyName) {
    const countyFips = fullCountyFips(countyName);
    if (!countyFips) return null;
    return {
      id: `county-${countyFips}`,
      geographyType: "county",
      label: `${countyName} County`,
      countyName,
      countyFips,
      resolutionNote:
        "Selected geography and displayed brief metrics are both county-level.",
    };
  }

  const city = CITY_BY_NORMALIZED.get(key);
  if (city) {
    const countyFips = fullCountyFips(city.countyName);
    if (!countyFips) return null;
    return {
      id: `city-${slugify(city.city)}`,
      geographyType: "city",
      label: city.city,
      countyName: city.countyName,
      countyFips,
      resolutionNote: `${city.city} is resolved to ${city.countyName} County for the current brief. The displayed metrics are county-context values unless a finer native geography is explicitly shown.`,
    };
  }

  return null;
}

export function resolveOpportunityPlaceId(
  id: string,
): OpportunityPlace | null {
  if (/^zcta-\d{5}$/.test(id)) return resolveOpportunityPlace(id.slice(5));
  if (/^county-26\d{3}$/.test(id)) {
    const countyName = getCountyFromFips(id.slice(-3));
    return countyName ? resolveOpportunityPlace(countyName) : null;
  }
  if (id.startsWith("city-")) {
    const slug = id.slice(5);
    const city = Object.keys(PROPERTY_TAX_RATES).find(
      (candidate) => slugify(candidate) === slug,
    );
    return city ? resolveOpportunityPlace(city) : null;
  }
  return null;
}
