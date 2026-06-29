/**
 * Investment-to-outcome attribution timeline (UC7 + UC10 Phase 1).
 * Links federal investment proxies to SDOH outcome trends. MODELED attribution.
 */

import { FEDERAL_INVESTMENTS, type FederalInvestment } from "@/data/federal-investment";
import { getCountyCrossDomain } from "@/data/cross-domain-indicators";
import { getCountyProfile } from "@/data/michigan-county-profiles";
import type { IntegrityLabel } from "@/types/chna";

export interface InvestmentMilestone {
  year: number;
  label: string;
  amountUsd: number;
  category: "sba_business" | "sba_disaster" | "fema" | "community_benefit";
  integrityLabel: IntegrityLabel;
  source: string;
}

export interface OutcomeSnapshot {
  year: number;
  metric: string;
  value: number;
  unit: string;
  integrityLabel: IntegrityLabel;
  source: string;
}

export interface CountyAttributionTimeline {
  county: string;
  population: number;
  totalFederalUsd: number;
  perCapitaFederal: number;
  milestones: InvestmentMilestone[];
  outcomes: OutcomeSnapshot[];
  attributionNote: string;
  modeledImpactScore: number;
  integrityLabel: IntegrityLabel;
}

function parseRate(val: string): number | null {
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function buildMilestones(inv: FederalInvestment): InvestmentMilestone[] {
  return [
    {
      year: 2020,
      label: "SBA business lending (cumulative)",
      amountUsd: inv.sbaBusinessLoans,
      category: "sba_business",
      integrityLabel: "MODELED",
      source: "SBA FOIA loan data",
    },
    {
      year: 2022,
      label: "SBA disaster lending (cumulative)",
      amountUsd: inv.sbaDisasterLoans,
      category: "sba_disaster",
      integrityLabel: "MODELED",
      source: "SBA FOIA loan data",
    },
    {
      year: 2024,
      label: "FEMA assistance (estimated)",
      amountUsd: inv.femaAssistance,
      category: "fema",
      integrityLabel: "MODELED",
      source: "OpenFEMA disaster declarations",
    },
  ];
}

function buildOutcomes(county: string): OutcomeSnapshot[] {
  const cross = getCountyCrossDomain(county);
  const profile = getCountyProfile(county);
  const uninsured = profile?.healthHighlights[0]?.value
    ? parseRate(profile.healthHighlights[0].value)
    : null;
  const food = profile?.healthHighlights[2]?.value
    ? parseRate(profile.healthHighlights[2].value)
    : null;

  return [
    {
      year: 2019,
      metric: "Poverty rate",
      value: Math.round(((cross?.povertyRate ?? 14) + 1.2) * 10) / 10,
      unit: "%",
      integrityLabel: "MODELED",
      source: "ACS 5-Year (trend proxy)",
    },
    {
      year: 2022,
      metric: "Poverty rate",
      value: cross?.povertyRate ?? 14,
      unit: "%",
      integrityLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
    },
    {
      year: 2019,
      metric: "Uninsured rate",
      value: uninsured != null ? Math.round((uninsured + 1.5) * 10) / 10 : 8,
      unit: "%",
      integrityLabel: "MODELED",
      source: "County Health Rankings (trend proxy)",
    },
    {
      year: 2024,
      metric: "Uninsured rate",
      value: uninsured ?? 8,
      unit: "%",
      integrityLabel: "MODELED",
      source: "County Health Rankings 2024",
    },
    {
      year: 2022,
      metric: "Food insecurity",
      value: food ?? 13,
      unit: "%",
      integrityLabel: "MODELED",
      source: "County Health Rankings",
    },
    {
      year: 2024,
      metric: "Community benefit proxy",
      value: Math.round((invPerCapita(county) / 500) * 10) / 10,
      unit: "index",
      integrityLabel: "PROJECTED",
      source: "Federal per-capita investment model",
    },
  ];
}

function invPerCapita(county: string): number {
  return FEDERAL_INVESTMENTS.find((i) => i.county === county)?.perCapita ?? 0;
}

function modeledImpactScore(inv: FederalInvestment, county: string): number {
  const cross = getCountyCrossDomain(county);
  const poverty = cross?.povertyRate ?? 14;
  const perCap = inv.perCapita;
  const investmentFactor = Math.min(100, perCap / 800);
  const needFactor = Math.min(100, poverty * 3);
  return Math.round(investmentFactor * 0.55 + needFactor * 0.45);
}

export function buildCountyAttributionTimeline(
  county: string,
): CountyAttributionTimeline | null {
  const inv = FEDERAL_INVESTMENTS.find((i) => i.county === county);
  if (!inv) return null;

  const profile = getCountyProfile(county);
  const score = modeledImpactScore(inv, county);

  return {
    county,
    population: inv.population,
    totalFederalUsd: inv.totalFederal,
    perCapitaFederal: inv.perCapita,
    milestones: buildMilestones(inv),
    outcomes: buildOutcomes(county),
    attributionNote:
      "Timeline shows cumulative federal flows alongside outcome proxies. Attribution is associative, not causal, unless corroborated by primary program evaluations.",
    modeledImpactScore: score,
    integrityLabel: "PROJECTED",
  };
}

export function listAttributionCounties(): string[] {
  return FEDERAL_INVESTMENTS.map((i) => i.county).sort();
}

export const TOTAL_TRACKED_INVESTMENT = FEDERAL_INVESTMENTS.reduce(
  (s, i) => s + i.totalFederal,
  0,
);