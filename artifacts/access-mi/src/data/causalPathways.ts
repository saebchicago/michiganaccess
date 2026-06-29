/**
 * Environmental justice causal pathway registry (UC1 Phase 1).
 *
 * RULES:
 * - Every step has at least one named source with URL and vintage.
 * - languageStandard "associative" = correlation/linkage language only.
 * - languageStandard "evidence-backed" = final outcome step has 2+ independent sources.
 * - No em dashes in copy.
 */

import type { IntegrityLabel } from "@/types/chna";

export interface PathwaySource {
  name: string;
  url: string;
  vintage: string;
}

export interface PathwayStep {
  id: string;
  label: string;
  description: string;
  integrityLabel: IntegrityLabel;
  sources: PathwaySource[];
}

export interface CausalPathway {
  id: string;
  title: string;
  summary: string;
  /** Display-only confidence score 0-100. Not used in models. */
  confidenceScore: number;
  confidenceRationale: string;
  languageStandard: "associative" | "evidence-backed";
  steps: PathwayStep[];
  relatedRoutes: { label: string; href: string }[];
  /** ISO date of last editorial review */
  lastReviewed: string;
}

export const CAUSAL_PATHWAYS: CausalPathway[] = [
  {
    id: "air-respiratory",
    title: "Air Quality and Respiratory Burden",
    summary:
      "Fine particulate matter and ozone exposures are linked to higher asthma prevalence and respiratory-related utilization, especially where primary care access is limited.",
    confidenceScore: 72,
    confidenceRationale:
      "Multiple federal surveillance and monitoring sources document the exposure-outcome association. Local access modifiers are modeled from HRSA and ACS proxies.",
    languageStandard: "evidence-backed",
    lastReviewed: "2026-06-29",
    relatedRoutes: [
      { label: "Air Quality", href: "/environment/air" },
      { label: "Deep Map Layers", href: "/map/layers" },
      { label: "Health Equity Atlas", href: "/health-equity-atlas" },
    ],
    steps: [
      {
        id: "exposure",
        label: "Ambient air pollution exposure",
        description:
          "PM2.5 and ozone concentrations and traffic proximity burden vary across Michigan census tracts and urban cores.",
        integrityLabel: "VERIFIED",
        sources: [
          {
            name: "EPA EJScreen",
            url: "https://www.epa.gov/ejscreen",
            vintage: "2024 release",
          },
          {
            name: "EPA Air Quality System (AQS)",
            url: "https://www.epa.gov/aqs",
            vintage: "2023-2025",
          },
        ],
      },
      {
        id: "intermediate",
        label: "Respiratory vulnerability and SDOH stress",
        description:
          "Low-income and high-traffic neighborhoods show higher reported asthma prevalence and more limited preventive care access.",
        integrityLabel: "VERIFIED",
        sources: [
          {
            name: "CDC PLACES",
            url: "https://www.cdc.gov/places",
            vintage: "2024 release",
          },
          {
            name: "Census ACS",
            url: "https://data.census.gov",
            vintage: "2019-2023 5-Year",
          },
        ],
      },
      {
        id: "outcome",
        label: "Respiratory health access gap",
        description:
          "Areas with elevated pollution burden and high asthma prevalence often overlap with primary care shortages and higher uninsured rates.",
        integrityLabel: "MODELED",
        sources: [
          {
            name: "HRSA HPSA and GeoCare",
            url: "https://data.hrsa.gov",
            vintage: "2024",
          },
          {
            name: "CDC PLACES",
            url: "https://www.cdc.gov/places",
            vintage: "2024 release",
          },
        ],
      },
    ],
  },
  {
    id: "energy-chronic",
    title: "Energy Burden and Chronic Disease Management",
    summary:
      "High home energy cost burden is associated with trade-offs in food and medication spending, which can worsen chronic condition control.",
    confidenceScore: 65,
    confidenceRationale:
      "Energy burden metrics and chronic disease prevalence come from verified federal sources. The household trade-off linkage is literature-supported but modeled at the community level.",
    languageStandard: "associative",
    lastReviewed: "2026-06-29",
    relatedRoutes: [
      { label: "Energy Burden", href: "/energy-burden" },
      { label: "Energy Deep Dive", href: "/environment/energy" },
      { label: "Compare ZIPs", href: "/compare-zips" },
    ],
    steps: [
      {
        id: "exposure",
        label: "Household energy burden",
        description:
          "Share of income spent on home energy exceeds affordability thresholds in many Michigan counties, especially renter-heavy and older-housing areas.",
        integrityLabel: "VERIFIED",
        sources: [
          {
            name: "ACEEE Energy Burden Index",
            url: "https://www.aceee.org",
            vintage: "2020 baseline",
          },
          {
            name: "HUD CHAS",
            url: "https://www.huduser.gov/portal/datasets/chas.html",
            vintage: "2017-2021",
          },
        ],
      },
      {
        id: "intermediate",
        label: "Material hardship and care trade-offs",
        description:
          "High energy burden correlates with elevated poverty and housing cost stress, conditions linked to deferred care and medication non-adherence in population surveys.",
        integrityLabel: "MODELED",
        sources: [
          {
            name: "Census ACS",
            url: "https://data.census.gov",
            vintage: "2019-2023 5-Year",
          },
          {
            name: "CDC PLACES",
            url: "https://www.cdc.gov/places",
            vintage: "2024 release",
          },
        ],
      },
      {
        id: "outcome",
        label: "Chronic disease prevalence and control",
        description:
          "Diabetes, hypertension, and COPD prevalence are higher in counties with above-median energy burden, after accounting for age structure in county profiles.",
        integrityLabel: "VERIFIED",
        sources: [
          {
            name: "CDC PLACES",
            url: "https://www.cdc.gov/places",
            vintage: "2024 release",
          },
          {
            name: "County Health Rankings",
            url: "https://www.countyhealthrankings.org",
            vintage: "2024",
          },
        ],
      },
    ],
  },
  {
    id: "water-safety",
    title: "Drinking Water Safety and Health Access",
    summary:
      "Communities with elevated drinking water violation indicators and aging distribution infrastructure show overlapping gaps in preventive care and insurance coverage.",
    confidenceScore: 58,
    confidenceRationale:
      "EPA SDWIS violation records and Michigan community water system data document supply-side risk. Health access modifiers are county-allocated from HRSA and County Health Rankings.",
    languageStandard: "associative",
    lastReviewed: "2026-06-29",
    relatedRoutes: [
      { label: "Environment Hub", href: "/environment" },
      { label: "Deep Map Layers", href: "/map/layers" },
      { label: "Cohort Builder", href: "/cohort-builder" },
    ],
    steps: [
      {
        id: "exposure",
        label: "Drinking water system stress",
        description:
          "Public water systems with historical health-based violations or persistent monitoring exceedances are concentrated in older industrial and rural service areas.",
        integrityLabel: "VERIFIED",
        sources: [
          {
            name: "EPA SDWIS",
            url: "https://www.epa.gov/enviro/sdwis-model",
            vintage: "2024",
          },
          {
            name: "Michigan EGLE Drinking Water",
            url: "https://www.michigan.gov/egle",
            vintage: "2024",
          },
        ],
      },
      {
        id: "intermediate",
        label: "Household vulnerability and trust barriers",
        description:
          "Lower-income households in high-burden water areas report greater material hardship, a factor linked to deferred preventive visits in population health surveys.",
        integrityLabel: "MODELED",
        sources: [
          {
            name: "Census ACS",
            url: "https://data.census.gov",
            vintage: "2019-2023 5-Year",
          },
          {
            name: "HUD CHAS",
            url: "https://www.huduser.gov/portal/datasets/chas.html",
            vintage: "2017-2021",
          },
        ],
      },
      {
        id: "outcome",
        label: "Primary care and coverage gaps",
        description:
          "ZIPs in counties with water-system stress proxies overlap with higher uninsured rates and primary care shortage indicators in Michigan access datasets.",
        integrityLabel: "MODELED",
        sources: [
          {
            name: "County Health Rankings",
            url: "https://www.countyhealthrankings.org",
            vintage: "2024",
          },
          {
            name: "HRSA Data Warehouse",
            url: "https://data.hrsa.gov",
            vintage: "2024",
          },
        ],
      },
    ],
  },
  {
    id: "superfund-proximity",
    title: "Superfund Proximity and Long-Term Health Burden",
    summary:
      "Proximity to National Priorities List sites is associated with sustained environmental stress and elevated chronic disease prevalence in nearby legacy industrial communities.",
    confidenceScore: 61,
    confidenceRationale:
      "EPA NPL site locations are verified federal records. Chronic disease overlays use CDC PLACES and county health summaries; linkage language stays associative at ZIP level.",
    languageStandard: "associative",
    lastReviewed: "2026-06-29",
    relatedRoutes: [
      { label: "Environment Hub", href: "/environment" },
      { label: "Health Equity Atlas", href: "/health-equity-atlas" },
      { label: "Service Area Builder", href: "/service-area" },
    ],
    steps: [
      {
        id: "exposure",
        label: "Superfund and hazardous site proximity",
        description:
          "Michigan hosts multiple EPA National Priorities List sites and high-priority brownfield corridors with documented contamination histories.",
        integrityLabel: "VERIFIED",
        sources: [
          {
            name: "EPA Superfund NPL",
            url: "https://www.epa.gov/superfund",
            vintage: "2024",
          },
          {
            name: "EPA EJScreen (NPL proximity indicator)",
            url: "https://www.epa.gov/ejscreen",
            vintage: "2024 release",
          },
        ],
      },
      {
        id: "intermediate",
        label: "Persistent environmental and economic stress",
        description:
          "Communities near NPL sites often combine elevated poverty, older housing stock, and higher traffic-industrial pollution scores in federal screening tools.",
        integrityLabel: "VERIFIED",
        sources: [
          {
            name: "EPA EJScreen",
            url: "https://www.epa.gov/ejscreen",
            vintage: "2024 release",
          },
          {
            name: "Census ACS",
            url: "https://data.census.gov",
            vintage: "2019-2023 5-Year",
          },
        ],
      },
      {
        id: "outcome",
        label: "Chronic disease and utilization pressure",
        description:
          "Counties with legacy industrial contamination corridors show higher modeled rates of cardiovascular and respiratory chronic conditions in CDC PLACES summaries.",
        integrityLabel: "VERIFIED",
        sources: [
          {
            name: "CDC PLACES",
            url: "https://www.cdc.gov/places",
            vintage: "2024 release",
          },
          {
            name: "MDHHS County Health Statistics",
            url: "https://www.michigan.gov/mdhhs",
            vintage: "2023-2024",
          },
        ],
      },
    ],
  },
];

export function getPathwayById(id: string): CausalPathway | undefined {
  return CAUSAL_PATHWAYS.find((p) => p.id === id);
}