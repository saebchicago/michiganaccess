import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  Bus,
  HandCoins,
  HeartPulse,
  Home,
  Leaf,
  Scale,
  ShieldAlert,
  Soup,
  Zap,
} from "lucide-react";

export type IntelligenceDomainSlug =
  | "health"
  | "housing"
  | "food-security"
  | "energy"
  | "legal-aid"
  | "benefits"
  | "transportation"
  | "environment"
  | "public-safety"
  | "disability-access";

export interface IntelligenceDomain {
  name: string;
  icon: LucideIcon;
  slug: IntelligenceDomainSlug;
  updateFrequency: "Monthly" | "Quarterly" | "Annual";
  dataSource: string;
  metrics: readonly string[];
}

export const INTELLIGENCE_DOMAINS = [
  {
    name: "Health",
    icon: HeartPulse,
    slug: "health",
    updateFrequency: "Annual",
    dataSource: "MDHHS / CDC / CMS",
    metrics: [
      "diabetes_prevalence",
      "life_expectancy",
      "uninsured_rate",
      "primary_care_access",
      "mental_health_access",
      "opioid_crisis_deaths",
      "maternal_mortality",
      "obesity_rate",
      "cancer_mortality",
    ],
  },
  {
    name: "Housing",
    icon: Home,
    slug: "housing",
    updateFrequency: "Annual",
    dataSource: "HUD / County Assessors",
    metrics: [
      "median_home_price",
      "renter_burden_rate",
      "eviction_filings",
      "homeless_count",
      "substandard_housing_pct",
      "affordability_index",
      "housing_cost_growth",
      "vacancy_rate",
    ],
  },
  {
    name: "Food Security",
    icon: Soup,
    slug: "food-security",
    updateFrequency: "Annual",
    dataSource: "USDA / Feeding America",
    metrics: [
      "food_insecurity_rate",
      "snap_participation",
      "food_desert_pct",
      "wic_participation",
      "foodbank_capacity",
      "school_meal_access",
      "grocery_access_score",
      "child_food_insecurity_rate",
    ],
  },
  {
    name: "Energy",
    icon: Zap,
    slug: "energy",
    updateFrequency: "Quarterly",
    dataSource: "MPSC / DOE",
    metrics: [
      "energy_burden_rate",
      "household_disconnections",
      "utility_shutoffs",
      "outage_frequency",
      "low_income_weatherization",
      "average_monthly_bill",
      "renewable_access_score",
      "grid_resilience_index",
    ],
  },
  {
    name: "Legal Aid",
    icon: Scale,
    slug: "legal-aid",
    updateFrequency: "Quarterly",
    dataSource: "Michigan Legal Services / Courts",
    metrics: [
      "legal_aid_cases_served",
      "eviction_cases",
      "incarceration_rate",
      "recidivism_rate",
      "domestic_violence_incidents",
      "expungement_filings",
      "civil_case_backlog",
      "public_defender_access",
    ],
  },
  {
    name: "Benefits",
    icon: HandCoins,
    slug: "benefits",
    updateFrequency: "Monthly",
    dataSource: "MDHHS / DOL",
    metrics: [
      "snap_benefit_avg",
      "tanf_caseload",
      "unemployment_rate",
      "eligible_uncovered_rate",
      "denial_rate",
      "medicaid_churn_rate",
      "benefits_processing_time",
      "childcare_subsidy_uptake",
    ],
  },
  {
    name: "Transportation",
    icon: Bus,
    slug: "transportation",
    updateFrequency: "Annual",
    dataSource: "MDOT / Census",
    metrics: [
      "transit_access_score",
      "walkability_score",
      "traffic_fatalities",
      "elderly_transportation_access",
      "vehicle_availability_rate",
      "average_commute_minutes",
      "paratransit_coverage",
      "bike_network_coverage",
    ],
  },
  {
    name: "Environment",
    icon: Leaf,
    slug: "environment",
    updateFrequency: "Monthly",
    dataSource: "MDEQ / EPA",
    metrics: [
      "air_quality_index",
      "water_quality_score",
      "toxic_release_sites",
      "lead_exposure_rate",
      "environmental_justice_score",
      "tree_canopy_pct",
      "heat_risk_days",
      "drinking_water_compliance",
    ],
  },
  {
    name: "Public Safety",
    icon: ShieldAlert,
    slug: "public-safety",
    updateFrequency: "Quarterly",
    dataSource: "MSP / FBI UCR",
    metrics: [
      "violent_crime_rate",
      "property_crime_rate",
      "emergency_response_time",
      "domestic_violence_rate",
      "traffic_injury_rate",
      "youth_incident_rate",
      "fire_coverage_score",
      "community_trust_index",
    ],
  },
  {
    name: "Disability Access",
    icon: Accessibility,
    slug: "disability-access",
    updateFrequency: "Annual",
    dataSource: "ADA / MDHHS",
    metrics: [
      "disability_rate",
      "employment_rate_disabled",
      "accessible_housing_pct",
      "ada_compliance_score",
      "voc_rehab_caseload",
      "paratransit_access_score",
      "digital_access_index",
      "benefits_navigation_access",
    ],
  },
] as const satisfies readonly IntelligenceDomain[];

export const INTELLIGENCE_DOMAIN_MAP: Record<IntelligenceDomainSlug, IntelligenceDomain> = Object.fromEntries(
  INTELLIGENCE_DOMAINS.map((domain) => [domain.slug, domain]),
) as Record<IntelligenceDomainSlug, IntelligenceDomain>;

export function getIntelligenceDomain(slug: string | undefined): IntelligenceDomain {
  if (slug && slug in INTELLIGENCE_DOMAIN_MAP) {
    return INTELLIGENCE_DOMAIN_MAP[slug as IntelligenceDomainSlug];
  }

  return INTELLIGENCE_DOMAIN_MAP.health;
}

export function formatMetricName(metricKey: string) {
  return metricKey
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
