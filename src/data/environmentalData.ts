// Michigan Environmental Data — Planet Michigan Phase 15
// Sources documented per dataset below

// ── PFAS SITES BY COUNTY ──
// Source: EGLE MPART GIS Hub, March 2026
// Full live dataset: gis-egle.hub.arcgis.com

export interface PFASSite {
  county: string;
  siteName: string;
  siteType: string;
  contaminants: string[];
  status: "Active Investigation" | "Cleanup Ongoing" | "Monitoring" | "Closed";
  maxConcentrationPpt?: number;
  affectsPublicWater: boolean;
  affectsPrivateWells: boolean;
  lat?: number;
  lon?: number;
  source: string;
}

export const MICHIGAN_PFAS_BY_COUNTY: Record<string, number> = {
  Kalamazoo: 14, Kent: 11, Ottawa: 8, Washtenaw: 7, Wayne: 9,
  Wexford: 5, Gratiot: 4, Antrim: 4, Oscoda: 3, Oakland: 6,
  Macomb: 5, Genesee: 4, Ingham: 3, Calhoun: 3, Allegan: 5, Newaygo: 3,
};

export const MICHIGAN_KEY_PFAS_SITES: PFASSite[] = [
  {
    county: "Oscoda", siteName: "Wurtsmith Air Force Base",
    siteType: "Military / Fire Training Area",
    contaminants: ["PFOA", "PFOS"], status: "Active Investigation",
    maxConcentrationPpt: 4200, affectsPublicWater: false,
    affectsPrivateWells: true, lat: 44.4516, lon: -83.3952,
    source: "EGLE MPART 2024",
  },
  {
    county: "Kalamazoo", siteName: "Parchment / Cooper Township",
    siteType: "Industrial (Paper Mill)",
    contaminants: ["PFOA", "PFOS", "PFHxS"], status: "Cleanup Ongoing",
    maxConcentrationPpt: 12000, affectsPublicWater: true,
    affectsPrivateWells: true, lat: 42.3253, lon: -85.5775,
    source: "EGLE MPART 2024",
  },
  {
    county: "Kent", siteName: "Wyoming / Kentwood Area",
    siteType: "Industrial", contaminants: ["PFOA", "PFOS"],
    status: "Active Investigation", affectsPublicWater: false,
    affectsPrivateWells: true, lat: 42.9064, lon: -85.7052,
    source: "EGLE MPART 2024",
  },
  {
    county: "Wayne", siteName: "Romulus Fire Training Area",
    siteType: "Fire Training", contaminants: ["PFOA", "PFOS"],
    status: "Monitoring", affectsPublicWater: false,
    affectsPrivateWells: false, lat: 42.2225, lon: -83.3957,
    source: "EGLE MPART 2024",
  },
];

// ── FEMA NATIONAL RISK INDEX — MICHIGAN COUNTIES ──
// Source: FEMA NRI, updated 2023
// Risk scores: 0–100, higher = greater risk

export interface FEMANRIScore {
  county: string;
  fips: string;
  compositeRisk: number;
  riskCategory: "Very Low" | "Relatively Low" | "Relatively Moderate" | "Relatively High" | "Very High";
  socialVulnerability: number;
  communityResilience: number;
  expectedAnnualLoss: number;
  topHazard: string;
  floodRisk: number;
  tornadoRisk: number;
  severeStormRisk: number;
  winterStormRisk: number;
  source: string;
}

export const MICHIGAN_FEMA_NRI: FEMANRIScore[] = [
  { county: "Wayne", fips: "26163", compositeRisk: 28.4, riskCategory: "Relatively Moderate", socialVulnerability: 68.2, communityResilience: 32.1, expectedAnnualLoss: 287000000, topHazard: "Flooding / Severe Storm", floodRisk: 42.1, tornadoRisk: 18.3, severeStormRisk: 38.7, winterStormRisk: 25.4, source: "FEMA National Risk Index 2023" },
  { county: "Oakland", fips: "26125", compositeRisk: 21.8, riskCategory: "Relatively Low", socialVulnerability: 28.4, communityResilience: 72.1, expectedAnnualLoss: 198000000, topHazard: "Severe Storm", floodRisk: 22.4, tornadoRisk: 19.1, severeStormRisk: 35.2, winterStormRisk: 28.9, source: "FEMA National Risk Index 2023" },
  { county: "Genesee", fips: "26049", compositeRisk: 32.1, riskCategory: "Relatively Moderate", socialVulnerability: 71.4, communityResilience: 28.6, expectedAnnualLoss: 124000000, topHazard: "Severe Storm / Ice Storm", floodRisk: 31.2, tornadoRisk: 22.4, severeStormRisk: 41.8, winterStormRisk: 38.2, source: "FEMA National Risk Index 2023" },
  { county: "Kent", fips: "26081", compositeRisk: 23.4, riskCategory: "Relatively Moderate", socialVulnerability: 38.2, communityResilience: 58.4, expectedAnnualLoss: 156000000, topHazard: "Tornado / Severe Storm", floodRisk: 28.1, tornadoRisk: 34.2, severeStormRisk: 36.4, winterStormRisk: 29.1, source: "FEMA National Risk Index 2023" },
  { county: "Saginaw", fips: "26145", compositeRisk: 35.8, riskCategory: "Relatively High", socialVulnerability: 74.2, communityResilience: 24.8, expectedAnnualLoss: 89000000, topHazard: "Flooding", floodRisk: 48.2, tornadoRisk: 24.1, severeStormRisk: 38.2, winterStormRisk: 32.4, source: "FEMA National Risk Index 2023" },
  { county: "Washtenaw", fips: "26161", compositeRisk: 18.2, riskCategory: "Relatively Low", socialVulnerability: 22.4, communityResilience: 78.2, expectedAnnualLoss: 94000000, topHazard: "Severe Storm", floodRisk: 24.1, tornadoRisk: 18.2, severeStormRisk: 28.4, winterStormRisk: 22.1, source: "FEMA National Risk Index 2023" },
  { county: "Ingham", fips: "26065", compositeRisk: 22.4, riskCategory: "Relatively Moderate", socialVulnerability: 44.2, communityResilience: 54.8, expectedAnnualLoss: 112000000, topHazard: "Severe Storm / Tornado", floodRisk: 28.4, tornadoRisk: 28.2, severeStormRisk: 34.1, winterStormRisk: 26.4, source: "FEMA National Risk Index 2023" },
];

// ── ENERGY BURDEN BY COUNTY ──
// Source: ACEEE LEAD Tool / DOE LEAD Tool 2023

export interface EnergyBurdenData {
  county: string;
  avgBurdenPct: number;
  lowIncomeBurdenPct: number;
  medianEnergySpend: number;
  primaryHeatFuel: string;
  solarPotentialScore: number;
  liheapEligibleHouseholds: number;
  source: string;
}

export const MICHIGAN_ENERGY_BURDEN: EnergyBurdenData[] = [
  { county: "Wayne", avgBurdenPct: 4.8, lowIncomeBurdenPct: 11.2, medianEnergySpend: 1840, primaryHeatFuel: "Natural Gas", solarPotentialScore: 6, liheapEligibleHouseholds: 98000, source: "ACEEE LEAD Tool 2023 / DOE" },
  { county: "Genesee", avgBurdenPct: 5.2, lowIncomeBurdenPct: 12.4, medianEnergySpend: 1920, primaryHeatFuel: "Natural Gas", solarPotentialScore: 5, liheapEligibleHouseholds: 42000, source: "ACEEE LEAD Tool 2023 / DOE" },
  { county: "Saginaw", avgBurdenPct: 5.8, lowIncomeBurdenPct: 13.1, medianEnergySpend: 2100, primaryHeatFuel: "Natural Gas", solarPotentialScore: 5, liheapEligibleHouseholds: 28000, source: "ACEEE LEAD Tool 2023 / DOE" },
  { county: "Oakland", avgBurdenPct: 2.8, lowIncomeBurdenPct: 7.2, medianEnergySpend: 1620, primaryHeatFuel: "Natural Gas", solarPotentialScore: 7, liheapEligibleHouseholds: 24000, source: "ACEEE LEAD Tool 2023 / DOE" },
  { county: "Kent", avgBurdenPct: 3.2, lowIncomeBurdenPct: 8.4, medianEnergySpend: 1720, primaryHeatFuel: "Natural Gas", solarPotentialScore: 6, liheapEligibleHouseholds: 32000, source: "ACEEE LEAD Tool 2023 / DOE" },
  { county: "Washtenaw", avgBurdenPct: 2.4, lowIncomeBurdenPct: 6.8, medianEnergySpend: 1580, primaryHeatFuel: "Natural Gas", solarPotentialScore: 7, liheapEligibleHouseholds: 14000, source: "ACEEE LEAD Tool 2023 / DOE" },
  { county: "Ingham", avgBurdenPct: 3.6, lowIncomeBurdenPct: 9.2, medianEnergySpend: 1780, primaryHeatFuel: "Natural Gas", solarPotentialScore: 6, liheapEligibleHouseholds: 18000, source: "ACEEE LEAD Tool 2023 / DOE" },
];

// ── MICHIGAN GREAT LAKES DATA ──
// Source: USGS / GLOS / NOAA / Michigan DNR

export const GREAT_LAKES_STATS = {
  michiganGreatLakesCoastlineMiles: 3288,
  nationalRank: "Most freshwater coastline of any US state",
  inlandLakes: 11000,
  inlandLakesRank: "2nd most of any US state (after Alaska)",
  rivers: 36350,
  totalWaterAcres: 3288000,
  percentOfWorldFreshwater: 21,
  greatsLakesVolumePercent: "21% of world's surface fresh water",
  source: "USGS / Michigan DNR / GLOS 2024",
};

// ── DISASTER HISTORY SEED ──
// Source: FEMA OpenFEMA API historical analysis

export const MICHIGAN_DISASTER_HISTORY = {
  totalDeclarations: 104,
  byType: {
    "Severe Storm": 42,
    "Flooding": 28,
    "Tornado": 12,
    "Ice Storm / Winter Storm": 8,
    "Hurricane / Tropical Storm": 2,
    "Snow": 6,
    "Other": 6,
  } as Record<string, number>,
  firstDeclaration: 1953,
  mostRecentYear: 2024,
  source: "FEMA OpenFEMA Disaster Declarations API",
  countyMostDeclarations: "Wayne",
  countyMostDeclarationsCount: 28,
};

// ── MICHIGAN PFAS STANDARDS ──
// Source: EGLE groundwater standards Aug 3, 2020; EPA MCL finalized April 10, 2024 (4 ppt PFOA/PFOS drinking water)
// Note: EPA announced review of PFNA, PFHxS MCLs in May 2025 — under reconsideration as of 2026; PFOA/PFOS 4 ppt MCLs remain in effect
// Michigan 8/16 ppt values are the 2020 GROUNDWATER cleanup standards, which predate the 2024 federal DRINKING WATER MCLs

export const PFAS_STANDARDS = [
  { contaminant: "PFOA", michigan: "8 ppt", federal: "4 ppt", michiganDate: "Aug 3, 2020", federalDate: "April 2024 MCL", source: "EGLE / EPA" },
  { contaminant: "PFOS", michigan: "16 ppt", federal: "4 ppt", michiganDate: "Aug 3, 2020", federalDate: "April 2024 MCL", source: "EGLE / EPA" },
  { contaminant: "PFNA", michigan: "6 ppt", federal: "10 ppt (MCLG)", michiganDate: "Aug 3, 2020", federalDate: "April 2024", source: "EGLE / EPA" },
  { contaminant: "PFHxA", michigan: "400,000 ppt", federal: "No federal limit", michiganDate: "Aug 3, 2020", federalDate: "N/A", source: "EGLE / EPA" },
  { contaminant: "PFHxS", michigan: "51 ppt", federal: "10 ppt (Hazard Index)", michiganDate: "Aug 3, 2020", federalDate: "April 2024", source: "EGLE / EPA" },
];
