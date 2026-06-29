/**
 * Unified scenario comparison and sensitivity (UC9 Phase 1).
 * Combines climate scenarios with adjustable severity for side-by-side views.
 */

import { CLIMATE_SCENARIOS, getClimateScenarioById } from "@/data/climateScenarios";
import {
  projectClimateScenario,
  type CountyClimateProjection,
} from "@/utils/climateScenarioModel";
import type { ClimateScenarioSeverity } from "@/data/climateScenarios";
import type { IntegrityLabel } from "@/types/chna";

export type ScenarioDomain = "climate";

export interface ScenarioSlot {
  domain: ScenarioDomain;
  scenarioId: string;
  severity: ClimateScenarioSeverity;
  counties?: string[];
  label?: string;
}

export interface ScenarioComparisonSummary {
  slotA: ScenarioSlot;
  slotB: ScenarioSlot;
  countyOverlap: number;
  avgDeltaA: number;
  avgDeltaB: number;
  topCountyA: string | null;
  topCountyB: string | null;
  integrityLabel: IntegrityLabel;
}

export interface SensitivityPoint {
  severity: ClimateScenarioSeverity;
  avgProjected: number;
  avgDelta: number;
}

export function defaultScenarioSlot(
  scenarioId = CLIMATE_SCENARIOS[0].id,
  severity: ClimateScenarioSeverity = "moderate",
): ScenarioSlot {
  return { domain: "climate", scenarioId, severity };
}

export function compareScenarioSlots(
  slotA: ScenarioSlot,
  slotB: ScenarioSlot,
): ScenarioComparisonSummary {
  const projA = projectClimateScenario(slotA.scenarioId, slotA.severity, slotA.counties);
  const projB = projectClimateScenario(slotB.scenarioId, slotB.severity, slotB.counties);

  const avgDelta = (rows: CountyClimateProjection[]) =>
    rows.length
      ? rows.reduce((s, p) => s + p.vulnerabilityDelta, 0) / rows.length
      : 0;

  const countiesA = new Set(projA.map((p) => p.county));
  const overlap = projB.filter((p) => countiesA.has(p.county)).length;

  return {
    slotA,
    slotB,
    countyOverlap: overlap,
    avgDeltaA: Math.round(avgDelta(projA) * 10) / 10,
    avgDeltaB: Math.round(avgDelta(projB) * 10) / 10,
    topCountyA: projA[0]?.county ?? null,
    topCountyB: projB[0]?.county ?? null,
    integrityLabel: "PROJECTED",
  };
}

export function runSeveritySensitivity(
  scenarioId: string,
  counties?: string[],
): SensitivityPoint[] {
  const severities: ClimateScenarioSeverity[] = ["moderate", "severe"];
  return severities.map((severity) => {
    const rows = projectClimateScenario(scenarioId, severity, counties);
    const avgProjected =
      rows.reduce((s, p) => s + p.projectedVulnerability, 0) / Math.max(1, rows.length);
    const avgDelta =
      rows.reduce((s, p) => s + p.vulnerabilityDelta, 0) / Math.max(1, rows.length);
    return {
      severity,
      avgProjected: Math.round(avgProjected),
      avgDelta: Math.round(avgDelta * 10) / 10,
    };
  });
}

export function scenarioSlotsToSearchParams(
  slotA: ScenarioSlot,
  slotB: ScenarioSlot,
): URLSearchParams {
  const p = new URLSearchParams();
  p.set("a", slotA.scenarioId);
  p.set("aSev", slotA.severity);
  p.set("b", slotB.scenarioId);
  p.set("bSev", slotB.severity);
  if (slotA.counties?.length) p.set("counties", slotA.counties.join(","));
  return p;
}

export function scenarioSlotsFromSearchParams(params: URLSearchParams): {
  slotA: ScenarioSlot;
  slotB: ScenarioSlot;
} {
  const a = params.get("a") ?? CLIMATE_SCENARIOS[0].id;
  const b = params.get("b") ?? CLIMATE_SCENARIOS[1]?.id ?? a;
  const aSev = (params.get("aSev") as ClimateScenarioSeverity) ?? "moderate";
  const bSev = (params.get("bSev") as ClimateScenarioSeverity) ?? "moderate";
  const countiesRaw = params.get("counties");
  const counties = countiesRaw
    ? countiesRaw.split(",").map((c) => c.trim()).filter(Boolean)
    : undefined;

  const validSev = (s: string): ClimateScenarioSeverity =>
    s === "severe" ? "severe" : "moderate";

  return {
    slotA: {
      domain: "climate",
      scenarioId: getClimateScenarioById(a) ? a : CLIMATE_SCENARIOS[0].id,
      severity: validSev(aSev),
      counties,
    },
    slotB: {
      domain: "climate",
      scenarioId: getClimateScenarioById(b) ? b : CLIMATE_SCENARIOS[1]?.id ?? a,
      severity: validSev(bSev),
      counties,
    },
  };
}

export function scenarioStudioShareUrl(slotA: ScenarioSlot, slotB: ScenarioSlot): string {
  const params = scenarioSlotsToSearchParams(slotA, slotB);
  return `/scenario-studio?${params.toString()}`;
}