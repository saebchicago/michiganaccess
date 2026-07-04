import { MICHIGAN_COUNTIES } from "@/contexts/CountyContext";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";
import { COUNTY_CROSS_DOMAIN } from "@/data/cross-domain-indicators";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import {
  INTELLIGENCE_DOMAINS,
  INTELLIGENCE_DOMAIN_MAP,
  type IntelligenceDomainSlug,
} from "@/data/intelligence-domains";

export type CountyMetricValue = number | null;
export type CountyMetricSet = Record<string, CountyMetricValue>;

export interface CountyCityBreakdown {
  name: string;
  zipCodes: string[];
  domainMetrics: Record<IntelligenceDomainSlug, CountyMetricSet>;
}

export interface MichiganCountyIntelligenceRecord {
  name: string;
  fips: string;
  population: number;
  domainMetrics: Record<IntelligenceDomainSlug, CountyMetricSet>;
  cityBreakdowns: CountyCityBreakdown[];
}

const PRIORITY_COUNTY_ZIPS: Partial<Record<(typeof MICHIGAN_COUNTIES)[number], string[]>> = {
  Wayne: ["48201", "48226", "48126"],
  Oakland: ["48340", "48084", "48302"],
  Macomb: ["48088", "48093", "48044"],
  Kent: ["49503", "49507", "49525"],
  Genesee: ["48502", "48507", "48439"],
  Washtenaw: ["48104", "48105", "48197"],
  Ingham: ["48910", "48823", "48864"],
};

const PRIORITY_COUNTIES = new Set<keyof typeof PRIORITY_COUNTY_ZIPS>([
  "Wayne",
  "Oakland",
  "Macomb",
  "Kent",
  "Genesee",
  "Washtenaw",
  "Ingham",
]);

function createMetricSet(slug: IntelligenceDomainSlug, overrides: Partial<CountyMetricSet> = {}): CountyMetricSet {
  return Object.fromEntries(
    INTELLIGENCE_DOMAIN_MAP[slug].metrics.map((metric) => [metric, overrides[metric] ?? null]),
  ) as CountyMetricSet;
}

function createPlaceholderDomainMetrics() {
  return Object.fromEntries(
    INTELLIGENCE_DOMAINS.map((domain) => [domain.slug, createMetricSet(domain.slug)]),
  ) as Record<IntelligenceDomainSlug, CountyMetricSet>;
}

/**
 * Every value here is a direct pass-through of a real, already-ingested
 * field - no invented multiplier, no fabricated KPI. See FIXLOG.md for the
 * prior version's ESTIMATED_*_RATIO scaffold that this replaced.
 */
function buildPriorityDomainMetrics(county: keyof typeof PRIORITY_COUNTY_ZIPS) {
  const profile = COUNTY_PROFILES[county];
  const crossDomain = COUNTY_CROSS_DOMAIN[county];
  const primaryCareRatio = Number.parseInt(profile.healthHighlights[1]?.value.replace(/[^0-9]/g, ""), 10) || null;
  const foodInsecurity = Number.parseFloat(profile.healthHighlights[2]?.value.replace(/[^0-9.]/g, "")) || null;
  const uninsuredRate = Number.parseFloat(profile.healthHighlights[0]?.value.replace(/[^0-9.]/g, "")) || null;

  return {
    health: createMetricSet("health", {
      uninsured_rate: uninsuredRate,
      primary_care_access: primaryCareRatio,
    }),
    housing: createMetricSet("housing", {
      renter_burden_rate: crossDomain?.rentBurden ?? null,
    }),
    "food-security": createMetricSet("food-security", {
      food_insecurity_rate: foodInsecurity,
    }),
  } satisfies Record<IntelligenceDomainSlug, CountyMetricSet>;
}

function buildCityBreakdowns(county: (typeof MICHIGAN_COUNTIES)[number], domainMetrics: Record<IntelligenceDomainSlug, CountyMetricSet>) {
  const profile = COUNTY_PROFILES[county];
  const cities = profile.majorCities.slice(0, 2);
  const zipCodes = PRIORITY_COUNTY_ZIPS[county] ?? [];

  if (cities.length === 0) {
    return [];
  }

  return cities.map((city, index) => ({
    name: city,
    zipCodes: zipCodes.slice(index, index + 2),
    domainMetrics,
  }));
}

export const MICHIGAN_COUNTIES_INTELLIGENCE: MichiganCountyIntelligenceRecord[] = MICHIGAN_COUNTIES.map((county) => {
  const profile = COUNTY_PROFILES[county];
  const domainMetrics = PRIORITY_COUNTIES.has(county)
    ? buildPriorityDomainMetrics(county as keyof typeof PRIORITY_COUNTY_ZIPS)
    : createPlaceholderDomainMetrics();

  return {
    name: county,
    fips: `26${MI_COUNTY_FIPS[county]}`,
    population: profile.population,
    domainMetrics,
    cityBreakdowns: buildCityBreakdowns(county, domainMetrics),
  };
});

export const MICHIGAN_COUNTIES_INTELLIGENCE_MAP = Object.fromEntries(
  MICHIGAN_COUNTIES_INTELLIGENCE.map((county) => [county.name, county]),
) as Record<string, MichiganCountyIntelligenceRecord>;

export function getCountyIntelligenceRecord(county: string) {
  return MICHIGAN_COUNTIES_INTELLIGENCE_MAP[county] ?? null;
}
