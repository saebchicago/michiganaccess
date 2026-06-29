/**
 * SDOH risk stratification engine (UC3 Phase 1).
 * County-level composite index with user-adjustable dimension weights.
 */

import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { COUNTY_CROSS_DOMAIN, MI_STATE_AVERAGES } from "@/data/cross-domain-indicators";
import type { IntegrityLabel } from "@/types/chna";

export interface SdohDimension {
  key: string;
  label: string;
  description: string;
  source: string;
  vintage: string;
  integrityLabel: IntegrityLabel;
}

export const SDOH_DIMENSIONS: SdohDimension[] = [
  {
    key: "healthcare",
    label: "Healthcare Access",
    description: "Uninsured rate and primary care ratio",
    source: "County Health Rankings / HRSA",
    vintage: "2024",
    integrityLabel: "MODELED",
  },
  {
    key: "economic",
    label: "Economic Stress",
    description: "Poverty and unemployment",
    source: "ACS 5-Year, BLS LAUS",
    vintage: "2022-2024",
    integrityLabel: "VERIFIED",
  },
  {
    key: "housing",
    label: "Housing Instability",
    description: "Rent burden and affordability",
    source: "ACS 5-Year",
    vintage: "2022",
    integrityLabel: "VERIFIED",
  },
  {
    key: "food",
    label: "Food Security",
    description: "Food insecurity and vehicle access",
    source: "County Health Rankings, ACS",
    vintage: "2024",
    integrityLabel: "MODELED",
  },
  {
    key: "transportation",
    label: "Transportation",
    description: "Commute time and vehicle access",
    source: "ACS 5-Year",
    vintage: "2022",
    integrityLabel: "VERIFIED",
  },
  {
    key: "isolation",
    label: "Social Isolation",
    description: "Education gap and rural isolation",
    source: "ACS 5-Year, NCES",
    vintage: "2022-2023",
    integrityLabel: "MODELED",
  },
];

export const DEFAULT_SDOH_WEIGHTS = [17, 17, 17, 17, 16, 16];

export type RiskTier = "Critical" | "High" | "Moderate" | "Low";

export interface CountySdohRisk {
  county: string;
  composite: number;
  tier: RiskTier;
  dimensions: Record<string, number>;
}

function extractDimensionScore(key: string, county: string): number {
  const p = COUNTY_PROFILES[county];
  const cd = COUNTY_CROSS_DOMAIN[county];
  if (!p || !cd) return 50;

  switch (key) {
    case "healthcare": {
      const uninsured = parseFloat(p.healthHighlights[0]?.value || "6");
      const pcpStr = p.healthHighlights[1]?.value || "1500:1";
      const pcp = parseInt(pcpStr.replace(/[^0-9]/g, ""), 10) || 1500;
      return Math.min(100, (uninsured / 12) * 50 + (pcp / 8000) * 50);
    }
    case "economic":
      return Math.min(
        100,
        ((cd.povertyRate ?? 14) / 30) * 60 + ((cd.unemploymentRate ?? 4) / 10) * 40,
      );
    case "housing": {
      const rentBurden = cd.rentBurden ?? 47;
      const income = cd.medianIncome ?? 55000;
      const rent = cd.medianRent ?? 800;
      const ratio = (rent * 12) / income;
      return Math.min(100, (rentBurden / 60) * 50 + (ratio / 0.5) * 50);
    }
    case "food": {
      const food = parseFloat(p.healthHighlights[2]?.value || "13");
      const vehicle = cd.vehicleAccess ?? 92;
      return Math.min(100, (food / 22) * 60 + ((100 - vehicle) / 20) * 40);
    }
    case "transportation": {
      const commute = cd.commuteTime ?? 25;
      const vehicle = cd.vehicleAccess ?? 92;
      return Math.min(100, (commute / 40) * 50 + ((100 - vehicle) / 20) * 50);
    }
    case "isolation": {
      const hsGap = 100 - (cd.hsGradRate ?? 82);
      const rural = p.countyType === "rural" ? 20 : p.countyType === "suburban" ? 10 : 0;
      return Math.min(100, (hsGap / 30) * 60 + rural * 2);
    }
    default:
      return 50;
  }
}

export function tierFromComposite(score: number): RiskTier {
  if (score >= 75) return "Critical";
  if (score >= 55) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}

export function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return weights.map(() => Math.round(100 / weights.length));
  return weights.map((w) => Math.round((w / sum) * 100));
}

export function computeCountySdohRisk(
  county: string,
  weights: number[],
): CountySdohRisk | null {
  if (!COUNTY_CROSS_DOMAIN[county]) return null;

  const normalized = normalizeWeights(weights);
  const dimensions: Record<string, number> = {};
  let composite = 0;

  SDOH_DIMENSIONS.forEach((dim, i) => {
    const score = Math.round(extractDimensionScore(dim.key, county));
    dimensions[dim.key] = score;
    composite += score * (normalized[i] / 100);
  });

  const rounded = Math.round(composite * 10) / 10;
  return {
    county,
    composite: rounded,
    tier: tierFromComposite(rounded),
    dimensions,
  };
}

export function rankCountiesBySdohRisk(weights: number[]): CountySdohRisk[] {
  return Object.keys(COUNTY_CROSS_DOMAIN)
    .map((c) => computeCountySdohRisk(c, weights))
    .filter((r): r is CountySdohRisk => r != null)
    .sort((a, b) => b.composite - a.composite);
}

export function stateAverageRisk(weights: number[]): number {
  const rows = rankCountiesBySdohRisk(weights);
  if (!rows.length) return 0;
  return Math.round(
    (rows.reduce((s, r) => s + r.composite, 0) / rows.length) * 10,
  ) / 10;
}

export { MI_STATE_AVERAGES };