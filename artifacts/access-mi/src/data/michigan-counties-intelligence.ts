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

// Placeholder calibration ratios keep the scaffold internally consistent until
// domain-specific source feeds replace these generated values.
const ESTIMATED_DIABETES_FROM_FOOD_INSECURITY_RATIO = 0.72;
const ESTIMATED_OPIOID_DEATHS_FROM_ER_VISITS_RATIO = 0.11;
const ESTIMATED_MATERNAL_MORTALITY_FROM_POVERTY_RATIO = 0.9;
const ESTIMATED_OBESITY_FROM_FOOD_INSECURITY_RATIO = 2.1;
const ESTIMATED_CANCER_MORTALITY_FROM_POVERTY_RATIO = 9.5;
const ESTIMATED_SNAP_PARTICIPATION_FROM_POVERTY_RATIO = 2.3;
const ESTIMATED_WIC_PARTICIPATION_FROM_POVERTY_RATIO = 1.1;
const ESTIMATED_CHILD_FOOD_INSECURITY_RATIO = 1.18;
const ESTIMATED_ENERGY_BURDEN_FROM_POVERTY_RATIO = 0.58;
const ESTIMATED_HOUSEHOLD_DISCONNECTIONS_FROM_POVERTY_RATIO = 95;
const ESTIMATED_UTILITY_SHUTOFFS_FROM_POVERTY_RATIO = 74;
const ESTIMATED_WEATHERIZATION_FROM_POVERTY_RATIO = 61;
const ESTIMATED_AVERAGE_MONTHLY_BILL_FROM_RENT_RATIO = 0.19;
const ESTIMATED_RENEWABLE_ACCESS_FROM_WATER_COMPLIANCE_RATIO = 0.72;
const ESTIMATED_GRID_RESILIENCE_FROM_WATER_COMPLIANCE_RATIO = 0.88;
const ESTIMATED_LEGAL_AID_CASES_FROM_POVERTY_RATIO = 130;
const ESTIMATED_EVICTION_CASES_FROM_RENT_BURDEN_RATIO = 42;
const ESTIMATED_INCARCERATION_FROM_VIOLENT_CRIME_RATIO = 1.6;
const ESTIMATED_RECIDIVISM_FROM_VIOLENT_CRIME_RATIO = 28;
const ESTIMATED_DOMESTIC_VIOLENCE_INCIDENTS_FROM_VIOLENT_CRIME_RATIO = 0.42;
const ESTIMATED_EXPUNGEMENT_FROM_POVERTY_RATIO = 38;
const ESTIMATED_CIVIL_CASE_BACKLOG_FROM_POVERTY_RATIO = 52;
const ESTIMATED_PUBLIC_DEFENDER_ACCESS_FROM_VEHICLE_ACCESS_RATIO = 0.84;
const ESTIMATED_SNAP_BENEFIT_FROM_RENT_RATIO = 0.36;
const ESTIMATED_TANF_CASELOAD_FROM_POVERTY_RATIO = 44;
const ESTIMATED_DENIAL_RATE_FROM_POVERTY_RATIO = 0.52;
const ESTIMATED_MEDICAID_CHURN_FROM_UNEMPLOYMENT_RATIO = 2.7;
const ESTIMATED_BENEFIT_PROCESSING_TIME_FROM_POVERTY_RATIO = 1.7;
const ESTIMATED_CHILDCARE_UPTAKE_FROM_POVERTY_RATIO = 1.5;
const ESTIMATED_TRANSIT_ACCESS_FROM_VEHICLE_ACCESS_RATIO = 0.88;
const ESTIMATED_WALKABILITY_BASELINE = 110;
const ESTIMATED_WALKABILITY_FROM_COMMUTE_RATIO = 2;
const ESTIMATED_TRAFFIC_FATALITIES_FROM_VIOLENT_CRIME_RATIO = 0.08;
const ESTIMATED_ELDER_TRANSPORT_FROM_VEHICLE_ACCESS_RATIO = 0.79;
const ESTIMATED_PARATRANSIT_FROM_VEHICLE_ACCESS_RATIO = 0.7;
const ESTIMATED_BIKE_NETWORK_FROM_COMMUTE_RATIO = 1.7;
const ESTIMATED_AQI_BASELINE = 38;
const ESTIMATED_AQI_FROM_VIOLENT_CRIME_RATIO = 28;
const ESTIMATED_TOXIC_RELEASES_FROM_VIOLENT_CRIME_RATIO = 30;
const ESTIMATED_LEAD_EXPOSURE_FROM_POVERTY_RATIO = 0.7;
const ESTIMATED_ENVIRONMENTAL_JUSTICE_FROM_POVERTY_RATIO = 2.9;
const ESTIMATED_TREE_CANOPY_FROM_VEHICLE_ACCESS_RATIO = 0.46;
const ESTIMATED_HEAT_RISK_FROM_COMMUTE_RATIO = 1.4;
const ESTIMATED_PROPERTY_CRIME_FROM_VIOLENT_CRIME_RATIO = 2.9;
const ESTIMATED_RESPONSE_TIME_FROM_COMMUTE_RATIO = 3.2;
const ESTIMATED_DOMESTIC_VIOLENCE_RATE_FROM_VIOLENT_CRIME_RATIO = 0.34;
const ESTIMATED_TRAFFIC_INJURY_FROM_VIOLENT_CRIME_RATIO = 0.52;
const ESTIMATED_YOUTH_INCIDENTS_FROM_POVERTY_RATIO = 16;
const ESTIMATED_FIRE_COVERAGE_FROM_VEHICLE_ACCESS_RATIO = 0.82;
const ESTIMATED_COMMUNITY_TRUST_FROM_WATER_COMPLIANCE_RATIO = 0.74;
const ESTIMATED_DISABILITY_RATE_FROM_POVERTY_RATIO = 0.86;
const ESTIMATED_DISABLED_EMPLOYMENT_FROM_HS_GRAD_RATIO = 0.62;
const ESTIMATED_ACCESSIBLE_HOUSING_BASELINE = 64;
const ESTIMATED_ACCESSIBLE_HOUSING_MIN = 12;
const ESTIMATED_ACCESSIBLE_HOUSING_FROM_RENT_BURDEN_RATIO = 1.3;
const ESTIMATED_ADA_COMPLIANCE_FROM_WATER_COMPLIANCE_RATIO = 0.91;
const ESTIMATED_VOC_REHAB_FROM_POVERTY_RATIO = 23;
const ESTIMATED_DIGITAL_ACCESS_CAP = 99;
const ESTIMATED_DIGITAL_ACCESS_FROM_INCOME_RATIO = 900;
const ESTIMATED_BENEFITS_NAVIGATION_FROM_HS_GRAD_RATIO = 0.84;

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
      diabetes_prevalence: foodInsecurity
        ? Number((foodInsecurity * ESTIMATED_DIABETES_FROM_FOOD_INSECURITY_RATIO).toFixed(1))
        : null,
      life_expectancy: intelligence.lifeExpectancy,
      uninsured_rate: uninsuredRate,
      primary_care_access: primaryCareRatio,
      mental_health_access: intelligence.mentalHealthAccess,
      opioid_crisis_deaths: intelligence.erVisitRate
        ? Math.round(intelligence.erVisitRate * ESTIMATED_OPIOID_DEATHS_FROM_ER_VISITS_RATIO)
        : null,
      maternal_mortality: crossDomain?.povertyRate
        ? Number((crossDomain.povertyRate * ESTIMATED_MATERNAL_MORTALITY_FROM_POVERTY_RATIO).toFixed(1))
        : null,
      obesity_rate: foodInsecurity
        ? Number((foodInsecurity * ESTIMATED_OBESITY_FROM_FOOD_INSECURITY_RATIO).toFixed(1))
        : null,
      cancer_mortality: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_CANCER_MORTALITY_FROM_POVERTY_RATIO)
        : null,
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
      snap_participation: crossDomain?.povertyRate
        ? Number((crossDomain.povertyRate * ESTIMATED_SNAP_PARTICIPATION_FROM_POVERTY_RATIO).toFixed(1))
        : null,
      food_desert_pct: crossDomain?.vehicleAccess ? Number((100 - crossDomain.vehicleAccess).toFixed(1)) : null,
      wic_participation: crossDomain?.povertyRate
        ? Number((crossDomain.povertyRate * ESTIMATED_WIC_PARTICIPATION_FROM_POVERTY_RATIO).toFixed(1))
        : null,
      foodbank_capacity: crossDomain?.medianIncome ? Math.round(crossDomain.medianIncome / 450) : null,
      school_meal_access: crossDomain?.povertyRate ? Number((55 + crossDomain.povertyRate).toFixed(1)) : null,
      grocery_access_score: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.9).toFixed(1)) : null,
      child_food_insecurity_rate: foodInsecurity
        ? Number((foodInsecurity * ESTIMATED_CHILD_FOOD_INSECURITY_RATIO).toFixed(1))
        : null,
    }),
    energy: createMetricSet("energy", {
      energy_burden_rate: crossDomain?.povertyRate
        ? Number((crossDomain.povertyRate * ESTIMATED_ENERGY_BURDEN_FROM_POVERTY_RATIO).toFixed(1))
        : null,
      household_disconnections: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_HOUSEHOLD_DISCONNECTIONS_FROM_POVERTY_RATIO)
        : null,
      utility_shutoffs: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_UTILITY_SHUTOFFS_FROM_POVERTY_RATIO)
        : null,
      outage_frequency: crossDomain?.commuteTime ? Number((crossDomain.commuteTime / 6).toFixed(1)) : null,
      low_income_weatherization: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_WEATHERIZATION_FROM_POVERTY_RATIO)
        : null,
      average_monthly_bill: crossDomain?.medianRent
        ? Math.round(crossDomain.medianRent * ESTIMATED_AVERAGE_MONTHLY_BILL_FROM_RENT_RATIO)
        : null,
      renewable_access_score: crossDomain?.drinkingWaterCompliance
        ? Number((crossDomain.drinkingWaterCompliance * ESTIMATED_RENEWABLE_ACCESS_FROM_WATER_COMPLIANCE_RATIO).toFixed(1))
        : null,
      grid_resilience_index: crossDomain?.drinkingWaterCompliance
        ? Number((crossDomain.drinkingWaterCompliance * ESTIMATED_GRID_RESILIENCE_FROM_WATER_COMPLIANCE_RATIO).toFixed(1))
        : null,
    }),
    "legal-aid": createMetricSet("legal-aid", {
      legal_aid_cases_served: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_LEGAL_AID_CASES_FROM_POVERTY_RATIO)
        : null,
      eviction_cases: crossDomain?.rentBurden
        ? Math.round(crossDomain.rentBurden * ESTIMATED_EVICTION_CASES_FROM_RENT_BURDEN_RATIO)
        : null,
      incarceration_rate: crossDomain?.violentCrimeRate
        ? Math.round(crossDomain.violentCrimeRate * ESTIMATED_INCARCERATION_FROM_VIOLENT_CRIME_RATIO)
        : null,
      recidivism_rate: crossDomain?.violentCrimeRate
        ? Number((crossDomain.violentCrimeRate / ESTIMATED_RECIDIVISM_FROM_VIOLENT_CRIME_RATIO).toFixed(1))
        : null,
      domestic_violence_incidents: crossDomain?.violentCrimeRate
        ? Math.round(crossDomain.violentCrimeRate * ESTIMATED_DOMESTIC_VIOLENCE_INCIDENTS_FROM_VIOLENT_CRIME_RATIO)
        : null,
      expungement_filings: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_EXPUNGEMENT_FROM_POVERTY_RATIO)
        : null,
      civil_case_backlog: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_CIVIL_CASE_BACKLOG_FROM_POVERTY_RATIO)
        : null,
      public_defender_access: crossDomain?.vehicleAccess
        ? Number((crossDomain.vehicleAccess * ESTIMATED_PUBLIC_DEFENDER_ACCESS_FROM_VEHICLE_ACCESS_RATIO).toFixed(1))
        : null,
    }),
    benefits: createMetricSet("benefits", {
      snap_benefit_avg: crossDomain?.medianRent
        ? Math.round(crossDomain.medianRent * ESTIMATED_SNAP_BENEFIT_FROM_RENT_RATIO)
        : null,
      tanf_caseload: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_TANF_CASELOAD_FROM_POVERTY_RATIO)
        : null,
      unemployment_rate: crossDomain?.unemploymentRate ?? null,
      eligible_uncovered_rate: uninsuredRate,
      denial_rate: crossDomain?.povertyRate
        ? Number((crossDomain.povertyRate * ESTIMATED_DENIAL_RATE_FROM_POVERTY_RATIO).toFixed(1))
        : null,
      medicaid_churn_rate: crossDomain?.unemploymentRate
        ? Number((crossDomain.unemploymentRate * ESTIMATED_MEDICAID_CHURN_FROM_UNEMPLOYMENT_RATIO).toFixed(1))
        : null,
      benefits_processing_time: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_BENEFIT_PROCESSING_TIME_FROM_POVERTY_RATIO)
        : null,
      childcare_subsidy_uptake: crossDomain?.povertyRate
        ? Number((crossDomain.povertyRate * ESTIMATED_CHILDCARE_UPTAKE_FROM_POVERTY_RATIO).toFixed(1))
        : null,
    }),
    transportation: createMetricSet("transportation", {
      transit_access_score: crossDomain?.vehicleAccess
        ? Number((crossDomain.vehicleAccess * ESTIMATED_TRANSIT_ACCESS_FROM_VEHICLE_ACCESS_RATIO).toFixed(1))
        : null,
      walkability_score: crossDomain?.commuteTime
        ? Math.round(ESTIMATED_WALKABILITY_BASELINE - crossDomain.commuteTime * ESTIMATED_WALKABILITY_FROM_COMMUTE_RATIO)
        : null,
      traffic_fatalities: crossDomain?.violentCrimeRate
        ? Math.round(crossDomain.violentCrimeRate * ESTIMATED_TRAFFIC_FATALITIES_FROM_VIOLENT_CRIME_RATIO)
        : null,
      elderly_transportation_access: crossDomain?.vehicleAccess
        ? Number((crossDomain.vehicleAccess * ESTIMATED_ELDER_TRANSPORT_FROM_VEHICLE_ACCESS_RATIO).toFixed(1))
        : null,
      vehicle_availability_rate: crossDomain?.vehicleAccess ?? null,
      average_commute_minutes: crossDomain?.commuteTime ?? null,
      paratransit_coverage: crossDomain?.vehicleAccess
        ? Number((crossDomain.vehicleAccess * ESTIMATED_PARATRANSIT_FROM_VEHICLE_ACCESS_RATIO).toFixed(1))
        : null,
      bike_network_coverage: crossDomain?.commuteTime
        ? Number((crossDomain.commuteTime * ESTIMATED_BIKE_NETWORK_FROM_COMMUTE_RATIO).toFixed(1))
        : null,
    }),
    environment: createMetricSet("environment", {
      air_quality_index: crossDomain?.violentCrimeRate
        ? Math.round(ESTIMATED_AQI_BASELINE + crossDomain.violentCrimeRate / ESTIMATED_AQI_FROM_VIOLENT_CRIME_RATIO)
        : null,
      water_quality_score: crossDomain?.drinkingWaterCompliance ?? null,
      toxic_release_sites: crossDomain?.violentCrimeRate
        ? Math.round(crossDomain.violentCrimeRate / ESTIMATED_TOXIC_RELEASES_FROM_VIOLENT_CRIME_RATIO)
        : null,
      lead_exposure_rate: crossDomain?.povertyRate
        ? Number((crossDomain.povertyRate * ESTIMATED_LEAD_EXPOSURE_FROM_POVERTY_RATIO).toFixed(1))
        : null,
      environmental_justice_score: crossDomain?.povertyRate
        ? Number((crossDomain.povertyRate * ESTIMATED_ENVIRONMENTAL_JUSTICE_FROM_POVERTY_RATIO).toFixed(1))
        : null,
      tree_canopy_pct: crossDomain?.vehicleAccess
        ? Number((crossDomain.vehicleAccess * ESTIMATED_TREE_CANOPY_FROM_VEHICLE_ACCESS_RATIO).toFixed(1))
        : null,
      heat_risk_days: crossDomain?.commuteTime
        ? Math.round(crossDomain.commuteTime * ESTIMATED_HEAT_RISK_FROM_COMMUTE_RATIO)
        : null,
      drinking_water_compliance: crossDomain?.drinkingWaterCompliance ?? null,
    }),
    "public-safety": createMetricSet("public-safety", {
      violent_crime_rate: crossDomain?.violentCrimeRate ?? null,
      property_crime_rate: crossDomain?.violentCrimeRate
        ? Math.round(crossDomain.violentCrimeRate * ESTIMATED_PROPERTY_CRIME_FROM_VIOLENT_CRIME_RATIO)
        : null,
      emergency_response_time: crossDomain?.commuteTime
        ? Number((crossDomain.commuteTime / ESTIMATED_RESPONSE_TIME_FROM_COMMUTE_RATIO).toFixed(1))
        : null,
      domestic_violence_rate: crossDomain?.violentCrimeRate
        ? Math.round(crossDomain.violentCrimeRate * ESTIMATED_DOMESTIC_VIOLENCE_RATE_FROM_VIOLENT_CRIME_RATIO)
        : null,
      traffic_injury_rate: crossDomain?.violentCrimeRate
        ? Math.round(crossDomain.violentCrimeRate * ESTIMATED_TRAFFIC_INJURY_FROM_VIOLENT_CRIME_RATIO)
        : null,
      youth_incident_rate: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_YOUTH_INCIDENTS_FROM_POVERTY_RATIO)
        : null,
      fire_coverage_score: crossDomain?.vehicleAccess
        ? Number((crossDomain.vehicleAccess * ESTIMATED_FIRE_COVERAGE_FROM_VEHICLE_ACCESS_RATIO).toFixed(1))
        : null,
      community_trust_index: crossDomain?.drinkingWaterCompliance
        ? Number((crossDomain.drinkingWaterCompliance * ESTIMATED_COMMUNITY_TRUST_FROM_WATER_COMPLIANCE_RATIO).toFixed(1))
        : null,
    }),
    "disability-access": createMetricSet("disability-access", {
      disability_rate: crossDomain?.povertyRate
        ? Number((crossDomain.povertyRate * ESTIMATED_DISABILITY_RATE_FROM_POVERTY_RATIO).toFixed(1))
        : null,
      employment_rate_disabled: crossDomain?.hsGradRate
        ? Number((crossDomain.hsGradRate * ESTIMATED_DISABLED_EMPLOYMENT_FROM_HS_GRAD_RATIO).toFixed(1))
        : null,
      accessible_housing_pct: crossDomain?.rentBurden
        ? Number((
          Math.max(
            ESTIMATED_ACCESSIBLE_HOUSING_MIN,
            ESTIMATED_ACCESSIBLE_HOUSING_BASELINE - crossDomain.rentBurden / ESTIMATED_ACCESSIBLE_HOUSING_FROM_RENT_BURDEN_RATIO,
          )
        ).toFixed(1))
        : null,
      ada_compliance_score: crossDomain?.drinkingWaterCompliance
        ? Number((crossDomain.drinkingWaterCompliance * ESTIMATED_ADA_COMPLIANCE_FROM_WATER_COMPLIANCE_RATIO).toFixed(1))
        : null,
      voc_rehab_caseload: crossDomain?.povertyRate
        ? Math.round(crossDomain.povertyRate * ESTIMATED_VOC_REHAB_FROM_POVERTY_RATIO)
        : null,
      paratransit_access_score: crossDomain?.vehicleAccess ? Number((crossDomain.vehicleAccess * 0.76).toFixed(1)) : null,
      digital_access_index: crossDomain?.medianIncome
        ? Number((Math.min(ESTIMATED_DIGITAL_ACCESS_CAP, crossDomain.medianIncome / ESTIMATED_DIGITAL_ACCESS_FROM_INCOME_RATIO)).toFixed(1))
        : null,
      benefits_navigation_access: crossDomain?.hsGradRate
        ? Number((crossDomain.hsGradRate * ESTIMATED_BENEFITS_NAVIGATION_FROM_HS_GRAD_RATIO).toFixed(1))
        : null,
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
