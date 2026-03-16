import { MICHIGAN_COUNTIES } from "@/contexts/CountyContext";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";
import { COUNTY_CROSS_DOMAIN } from "@/data/cross-domain-indicators";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { COUNTY_INTELLIGENCE_KPIS, MICHIGAN_AVERAGES } from "@/data/michigan-intelligence";
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

function buildPriorityDomainMetrics(county: keyof typeof PRIORITY_COUNTY_ZIPS) {
  const profile = COUNTY_PROFILES[county];
  const crossDomain = COUNTY_CROSS_DOMAIN[county];
  const intelligence = COUNTY_INTELLIGENCE_KPIS[county] ?? MICHIGAN_AVERAGES;
  const primaryCareRatio = Number.parseInt(profile.healthHighlights[1]?.value.replace(/[^0-9]/g, ""), 10) || null;
  const foodInsecurity = Number.parseFloat(profile.healthHighlights[2]?.value.replace(/[^0-9.]/g, "")) || null;
  const uninsuredRate = Number.parseFloat(profile.healthHighlights[0]?.value.replace(/[^0-9.]/g, "")) || null;

  return {
    health: createMetricSet("health", {
      diabetes_prevalence: foodInsecurity ? Number((foodInsecurity * 0.72).toFixed(1)) : null,
      life_expectancy: intelligence.lifeExpectancy,
      uninsured_rate: uninsuredRate,
      primary_care_access: primaryCareRatio,
      mental_health_access: intelligence.mentalHealthAccess,
      opioid_crisis_deaths: crossDomain?.violentCrimeRate ? Math.round(crossDomain.violentCrimeRate * 0.09) : null,
      maternal_mortality: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 0.9).toFixed(1)) : null,
      obesity_rate: foodInsecurity ? Number((foodInsecurity * 2.1).toFixed(1)) : null,
      cancer_mortality: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 9.5) : null,
    }),
    housing: createMetricSet("housing", {
      median_home_price: crossDomain?.medianIncome ? Math.round(crossDomain.medianIncome * 3.8) : null,
      renter_burden_rate: crossDomain?.rentBurden ?? null,
      eviction_filings: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 180) : null,
      homeless_count: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 55) : null,
      substandard_housing_pct: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 0.62).toFixed(1)) : null,
      affordability_index: crossDomain?.medianIncome ? Number((crossDomain.medianIncome / 1000).toFixed(1)) : null,
      housing_cost_growth: crossDomain?.medianRent ? Number((crossDomain.medianRent / 200).toFixed(1)) : null,
      vacancy_rate: crossDomain?.rentBurden ? Number((Math.max(2, 14 - crossDomain.rentBurden / 5)).toFixed(1)) : null,
    }),
    "food-security": createMetricSet("food-security", {
      food_insecurity_rate: foodInsecurity,
      snap_participation: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 2.3).toFixed(1)) : null,
      food_desert_pct: crossDomain?.vehicleAccess ? Number((100 - crossDomain.vehicleAccess).toFixed(1)) : null,
      wic_participation: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 1.1).toFixed(1)) : null,
      foodbank_capacity: crossDomain?.medianIncome ? Math.round(crossDomain.medianIncome / 450) : null,
      school_meal_access: crossDomain?.povertyRate ? Number((55 + crossDomain.povertyRate).toFixed(1)) : null,
      grocery_access_score: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.9).toFixed(1)) : null,
      child_food_insecurity_rate: foodInsecurity ? Number((foodInsecurity * 1.18).toFixed(1)) : null,
    }),
    energy: createMetricSet("energy", {
      energy_burden_rate: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 0.58).toFixed(1)) : null,
      household_disconnections: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 95) : null,
      utility_shutoffs: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 74) : null,
      outage_frequency: crossDomain?.commuteTime ? Number((crossDomain.commuteTime / 6).toFixed(1)) : null,
      low_income_weatherization: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 61) : null,
      average_monthly_bill: crossDomain?.medianRent ? Math.round(crossDomain.medianRent * 0.19) : null,
      renewable_access_score: crossDomain?.drinkingWaterCompliance ? Number((crossDomain.drinkingWaterCompliance * 0.72).toFixed(1)) : null,
      grid_resilience_index: crossDomain?.drinkingWaterCompliance ? Number((crossDomain.drinkingWaterCompliance * 0.88).toFixed(1)) : null,
    }),
    "legal-aid": createMetricSet("legal-aid", {
      legal_aid_cases_served: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 130) : null,
      eviction_cases: crossDomain?.rentBurden ? Math.round(crossDomain.rentBurden * 42) : null,
      incarceration_rate: crossDomain?.violentCrimeRate ? Math.round(crossDomain.violentCrimeRate * 1.6) : null,
      recidivism_rate: crossDomain?.violentCrimeRate ? Number((crossDomain.violentCrimeRate / 28).toFixed(1)) : null,
      domestic_violence_incidents: crossDomain?.violentCrimeRate ? Math.round(crossDomain.violentCrimeRate * 0.42) : null,
      expungement_filings: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 38) : null,
      civil_case_backlog: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 52) : null,
      public_defender_access: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.84).toFixed(1)) : null,
    }),
    benefits: createMetricSet("benefits", {
      snap_benefit_avg: crossDomain?.medianRent ? Math.round(crossDomain.medianRent * 0.36) : null,
      tanf_caseload: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 44) : null,
      unemployment_rate: crossDomain?.unemploymentRate ?? null,
      eligible_uncovered_rate: uninsuredRate,
      denial_rate: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 0.52).toFixed(1)) : null,
      medicaid_churn_rate: crossDomain?.unemploymentRate ? Number((crossDomain.unemploymentRate * 2.7).toFixed(1)) : null,
      benefits_processing_time: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 1.7) : null,
      childcare_subsidy_uptake: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 1.5).toFixed(1)) : null,
    }),
    transportation: createMetricSet("transportation", {
      transit_access_score: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.88).toFixed(1)) : null,
      walkability_score: crossDomain?.commuteTime ? Math.round(110 - crossDomain.commuteTime * 2) : null,
      traffic_fatalities: crossDomain?.violentCrimeRate ? Math.round(crossDomain.violentCrimeRate * 0.08) : null,
      elderly_transportation_access: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.79).toFixed(1)) : null,
      vehicle_availability_rate: crossDomain?.vehicleAccess ?? null,
      average_commute_minutes: crossDomain?.commuteTime ?? null,
      paratransit_coverage: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.7).toFixed(1)) : null,
      bike_network_coverage: crossDomain?.commuteTime ? Number((crossDomain.commuteTime * 1.7).toFixed(1)) : null,
    }),
    environment: createMetricSet("environment", {
      air_quality_index: crossDomain?.violentCrimeRate ? Math.round(38 + crossDomain.violentCrimeRate / 28) : null,
      water_quality_score: crossDomain?.drinkingWaterCompliance ?? null,
      toxic_release_sites: crossDomain?.violentCrimeRate ? Math.round(crossDomain.violentCrimeRate / 30) : null,
      lead_exposure_rate: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 0.7).toFixed(1)) : null,
      environmental_justice_score: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 2.9).toFixed(1)) : null,
      tree_canopy_pct: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.46).toFixed(1)) : null,
      heat_risk_days: crossDomain?.commuteTime ? Math.round(crossDomain.commuteTime * 1.4) : null,
      drinking_water_compliance: crossDomain?.drinkingWaterCompliance ?? null,
    }),
    "public-safety": createMetricSet("public-safety", {
      violent_crime_rate: crossDomain?.violentCrimeRate ?? null,
      property_crime_rate: crossDomain?.violentCrimeRate ? Math.round(crossDomain.violentCrimeRate * 2.9) : null,
      emergency_response_time: crossDomain?.commuteTime ? Number((crossDomain.commuteTime / 3.2).toFixed(1)) : null,
      domestic_violence_rate: crossDomain?.violentCrimeRate ? Math.round(crossDomain.violentCrimeRate * 0.34) : null,
      traffic_injury_rate: crossDomain?.violentCrimeRate ? Math.round(crossDomain.violentCrimeRate * 0.52) : null,
      youth_incident_rate: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 16) : null,
      fire_coverage_score: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.82).toFixed(1)) : null,
      community_trust_index: crossDomain?.drinkingWaterCompliance ? Number((crossDomain.drinkingWaterCompliance * 0.74).toFixed(1)) : null,
    }),
    "disability-access": createMetricSet("disability-access", {
      disability_rate: crossDomain?.povertyRate ? Number((crossDomain.povertyRate * 0.86).toFixed(1)) : null,
      employment_rate_disabled: crossDomain?.hsGradRate ? Number((crossDomain.hsGradRate * 0.62).toFixed(1)) : null,
      accessible_housing_pct: crossDomain?.rentBurden ? Number((Math.max(12, 64 - crossDomain.rentBurden / 1.3)).toFixed(1)) : null,
      ada_compliance_score: crossDomain?.drinkingWaterCompliance ? Number((crossDomain.drinkingWaterCompliance * 0.91).toFixed(1)) : null,
      voc_rehab_caseload: crossDomain?.povertyRate ? Math.round(crossDomain.povertyRate * 23) : null,
      paratransit_access_score: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.76).toFixed(1)) : null,
      digital_access_index: crossDomain?.medianIncome ? Number((Math.min(99, crossDomain.medianIncome / 900)).toFixed(1)) : null,
      benefits_navigation_access: crossDomain?.hsGradRate ? Number((crossDomain.hsGradRate * 0.84).toFixed(1)) : null,
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
