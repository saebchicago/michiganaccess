/**
 * County-level climate-health scenario projections (UC2 Phase 1).
 * All utilization and vulnerability deltas are PROJECTED with confidence bands.
 */

import { COUNTY_CROSS_DOMAIN } from "@/data/cross-domain-indicators";
import {
  COUNTY_PROFILES,
  getCountyProfile,
} from "@/data/michigan-county-profiles";
import {
  MICHIGAN_ENERGY_BURDEN,
  MICHIGAN_FEMA_NRI,
} from "@/data/environmentalData";
import countyFacilityReference from "@/data/countyFacilityReference.json";
import {
  getClimateScenarioById,
  GREAT_LAKES_COASTAL_COUNTIES,
  type ClimateScenarioSeverity,
} from "@/data/climateScenarios";
import type { IntegrityLabel } from "@/types/chna";

const FACILITY_COUNTS = (countyFacilityReference as { counts: Record<string, number> })
  .counts;

const ENERGY_LOOKUP = Object.fromEntries(
  MICHIGAN_ENERGY_BURDEN.map((e) => [e.county, e.avgBurdenPct]),
);

const FEMA_LOOKUP = Object.fromEntries(
  MICHIGAN_FEMA_NRI.map((n) => [n.county, n]),
);

function parseRate(val: string): number | null {
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parsePcpRatio(val: string): number | null {
  const n = parseInt(val.split(":")[0].replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export interface CountyClimateBaseline {
  county: string;
  population: number;
  socialVulnerability: number;
  socialVulnerabilityIntegrity: IntegrityLabel;
  communityResilience: number;
  resilienceIntegrity: IntegrityLabel;
  energyBurdenPct: number | null;
  energyBurdenIntegrity: IntegrityLabel;
  povertyRate: number | null;
  uninsuredRate: number | null;
  pcpRatio: number | null;
  facilityCount: number;
  floodRisk: number | null;
}

export interface ProjectionBand {
  low: number;
  mid: number;
  high: number;
  integrityLabel: IntegrityLabel;
}

export interface CountyClimateProjection {
  county: string;
  population: number;
  baselineVulnerability: number;
  projectedVulnerability: number;
  vulnerabilityDelta: number;
  edIncreasePct: ProjectionBand;
  accessGapScore: number;
  facilityStressScore: number;
  facilityCount: number;
}

function modeledSocialVulnerability(povertyRate: number | null): number {
  if (povertyRate == null) return 50;
  return Math.min(100, Math.round(povertyRate * 2.8));
}

function modeledResilience(povertyRate: number | null): number {
  if (povertyRate == null) return 50;
  return Math.max(10, Math.min(90, Math.round(100 - povertyRate * 2.2)));
}

export function buildCountyClimateBaseline(county: string): CountyClimateBaseline | null {
  const cross = COUNTY_CROSS_DOMAIN[county];
  if (!cross) return null;

  const profile = getCountyProfile(county);
  const fema = FEMA_LOOKUP[county];
  const energy = ENERGY_LOOKUP[county] ?? null;

  const uninsuredRaw = profile?.healthHighlights[0]?.value;
  const pcpRaw = profile?.healthHighlights[1]?.value;

  return {
    county,
    population: profile?.population ?? COUNTY_PROFILES[county]?.population ?? 0,
    socialVulnerability: fema?.socialVulnerability ?? modeledSocialVulnerability(cross.povertyRate),
    socialVulnerabilityIntegrity: fema ? "VERIFIED" : "MODELED",
    communityResilience: fema?.communityResilience ?? modeledResilience(cross.povertyRate),
    resilienceIntegrity: fema ? "VERIFIED" : "MODELED",
    energyBurdenPct: energy,
    energyBurdenIntegrity: energy != null ? "VERIFIED" : "MODELED",
    povertyRate: cross.povertyRate,
    uninsuredRate: uninsuredRaw ? parseRate(uninsuredRaw) : null,
    pcpRatio: pcpRaw ? parsePcpRatio(pcpRaw) : null,
    facilityCount: FACILITY_COUNTS[county] ?? 0,
    floodRisk: fema?.floodRisk ?? null,
  };
}

export function buildAllCountyClimateBaselines(): CountyClimateBaseline[] {
  return Object.keys(COUNTY_CROSS_DOMAIN)
    .map(buildCountyClimateBaseline)
    .filter((b): b is CountyClimateBaseline => b != null)
    .sort((a, b) => a.county.localeCompare(b.county));
}

function baselineVulnerabilityScore(b: CountyClimateBaseline): number {
  const sv = b.socialVulnerability;
  const resGap = 100 - b.communityResilience;
  const energy = (b.energyBurdenPct ?? 3.5) * 8;
  const uninsured = (b.uninsuredRate ?? 8) * 4;
  const poverty = (b.povertyRate ?? 14) * 1.5;
  return Math.min(
    100,
    Math.round(sv * 0.35 + resGap * 0.2 + energy * 0.2 + uninsured * 0.15 + poverty * 0.1),
  );
}

function accessGapScore(b: CountyClimateBaseline): number {
  const pcp = b.pcpRatio ?? 1200;
  const uninsured = b.uninsuredRate ?? 8;
  const pcpComponent = Math.min(100, (pcp / 2000) * 100);
  const uninsComponent = Math.min(100, uninsured * 8);
  return Math.round(pcpComponent * 0.55 + uninsComponent * 0.45);
}

function facilityStressScore(b: CountyClimateBaseline): number {
  if (b.facilityCount === 0) return 85;
  const popPerFacility = b.population / Math.max(1, b.facilityCount);
  return Math.min(100, Math.round(120000 / Math.max(1, popPerFacility) * 40));
}

function scenarioStressMultiplier(
  scenarioId: string,
  severity: ClimateScenarioSeverity,
  b: CountyClimateBaseline,
): number {
  const severe = severity === "severe";
  const energy = (b.energyBurdenPct ?? 4) / 5;
  const poverty = (b.povertyRate ?? 14) / 20;

  if (scenarioId === "heat-wave") {
    return 1 + (severe ? 0.38 : 0.24) * Math.min(1.4, energy);
  }
  if (scenarioId === "air-quality-event") {
    return 1 + (severe ? 0.32 : 0.2) * Math.min(1.3, poverty);
  }
  if (scenarioId === "compound-heat-air") {
    const heat = (severe ? 0.28 : 0.18) * Math.min(1.2, energy);
    const air = (severe ? 0.24 : 0.15) * Math.min(1.2, poverty);
    return 1 + Math.min(0.55, heat + air * 0.85);
  }
  if (scenarioId === "flood-event") {
    const flood = (b.floodRisk ?? 30) / 50;
    const resGap = (100 - b.communityResilience) / 100;
    return 1 + (severe ? 0.42 : 0.28) * Math.min(1.5, flood * 0.7 + resGap * 0.5);
  }
  if (scenarioId === "great-lakes-level") {
    const coastal = GREAT_LAKES_COASTAL_COUNTIES.some(
      (c) => c.toLowerCase() === b.county.toLowerCase(),
    );
    if (!coastal) return 1;
    const resGap = (100 - b.communityResilience) / 100;
    return 1 + (severe ? 0.35 : 0.22) * Math.min(1.2, 0.6 + resGap * 0.4);
  }
  return 1;
}

export interface ResilienceRoiInput {
  investmentUsd: number;
  scenarioId: string;
  severity: ClimateScenarioSeverity;
  counties?: string[];
  /** Share of investment assumed to reduce vulnerability (0-1). Default 0.65 */
  effectiveness?: number;
}

export interface ResilienceRoiResult {
  countiesTargeted: number;
  totalPopulation: number;
  baselineVulnerabilityAvg: number;
  projectedVulnerabilityAvg: number;
  vulnerabilityReductionPts: number;
  avoidedEdVisitsLow: number;
  avoidedEdVisitsHigh: number;
  costPerAvoidedVisitLow: number;
  costPerAvoidedVisitHigh: number;
  paybackYearsLow: number;
  paybackYearsHigh: number;
  integrityLabel: IntegrityLabel;
  assumptions: string[];
}

const ED_VISITS_PER_1000_ANNUAL = 420;
const AVG_ED_COST_USD = 1850;

/**
 * Conservative resilience ROI model (UC2 Phase 2). All outputs PROJECTED.
 */
export function computeResilienceRoi(input: ResilienceRoiInput): ResilienceRoiResult {
  const effectiveness = input.effectiveness ?? 0.65;
  const projections = projectClimateScenario(
    input.scenarioId,
    input.severity,
    input.counties,
  );

  const baselineAvg =
    projections.reduce((s, p) => s + p.baselineVulnerability, 0) /
    Math.max(1, projections.length);
  const projectedAvg =
    projections.reduce((s, p) => s + p.projectedVulnerability, 0) /
    Math.max(1, projections.length);

  const rawReduction = Math.max(0, projectedAvg - baselineAvg);
  const vulnerabilityReductionPts = Math.round(
    rawReduction * effectiveness * 0.35,
  );

  const totalPop = projections.reduce((s, p) => s + p.population, 0);
  const edBaseline = (totalPop / 1000) * ED_VISITS_PER_1000_ANNUAL;
  const reductionRate = vulnerabilityReductionPts / 100;
  const avoidedMid = Math.round(edBaseline * reductionRate * 0.08);
  const band = 0.35;
  const avoidedLow = Math.max(0, Math.round(avoidedMid * (1 - band)));
  const avoidedHigh = Math.round(avoidedMid * (1 + band));

  const costPerAvoidedVisitLow =
    avoidedHigh > 0 ? Math.round(input.investmentUsd / avoidedHigh) : 0;
  const costPerAvoidedVisitHigh =
    avoidedLow > 0 ? Math.round(input.investmentUsd / avoidedLow) : 0;

  const annualSavingsLow = avoidedLow * AVG_ED_COST_USD;
  const annualSavingsHigh = avoidedHigh * AVG_ED_COST_USD;
  const paybackYearsLow =
    annualSavingsHigh > 0
      ? Math.round((input.investmentUsd / annualSavingsHigh) * 10) / 10
      : 99;
  const paybackYearsHigh =
    annualSavingsLow > 0
      ? Math.round((input.investmentUsd / annualSavingsLow) * 10) / 10
      : 99;

  return {
    countiesTargeted: projections.length,
    totalPopulation: totalPop,
    baselineVulnerabilityAvg: Math.round(baselineAvg),
    projectedVulnerabilityAvg: Math.round(projectedAvg),
    vulnerabilityReductionPts,
    avoidedEdVisitsLow: avoidedLow,
    avoidedEdVisitsHigh: avoidedHigh,
    costPerAvoidedVisitLow,
    costPerAvoidedVisitHigh,
    paybackYearsLow,
    paybackYearsHigh,
    integrityLabel: "PROJECTED",
    assumptions: [
      `Effectiveness factor ${Math.round(effectiveness * 100)}% applied to scenario delta.`,
      `ED utilization proxy: ${ED_VISITS_PER_1000_ANNUAL} visits per 1,000 population annually (MODELED).`,
      `Average ED cost: $${AVG_ED_COST_USD.toLocaleString()} (CMS benchmark, MODELED).`,
    ],
  };
}

function projectEdBand(
  baseline: number,
  multiplier: number,
  bandPct: number,
): ProjectionBand {
  const mid = Math.min(45, Math.round(baseline * (multiplier - 1) * 0.35));
  const spread = Math.round(mid * (bandPct / 100));
  return {
    mid,
    low: Math.max(0, mid - spread),
    high: Math.min(60, mid + spread),
    integrityLabel: "PROJECTED",
  };
}

export function projectClimateScenario(
  scenarioId: string,
  severity: ClimateScenarioSeverity = "moderate",
  counties?: string[],
): CountyClimateProjection[] {
  const scenario = getClimateScenarioById(scenarioId);
  if (!scenario) return [];

  const countySet = counties?.length
    ? new Set(counties.map((c) => c.toLowerCase()))
    : null;

  const results: CountyClimateProjection[] = [];

  for (const baseline of buildAllCountyClimateBaselines()) {
    if (countySet && !countySet.has(baseline.county.toLowerCase())) continue;

    const baseScore = baselineVulnerabilityScore(baseline);
    const multiplier = scenarioStressMultiplier(scenarioId, severity, baseline);
    const projected = Math.min(100, Math.round(baseScore * multiplier));

    results.push({
      county: baseline.county,
      population: baseline.population,
      baselineVulnerability: baseScore,
      projectedVulnerability: projected,
      vulnerabilityDelta: projected - baseScore,
      edIncreasePct: projectEdBand(baseScore, multiplier, scenario.confidenceBandPct),
      accessGapScore: accessGapScore(baseline),
      facilityStressScore: facilityStressScore(baseline),
      facilityCount: baseline.facilityCount,
    });
  }

  return results.sort((a, b) => b.projectedVulnerability - a.projectedVulnerability);
}