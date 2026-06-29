import { describe, it, expect } from "vitest";
import { CLIMATE_SCENARIOS, getClimateScenarioById } from "@/data/climateScenarios";
import {
  projectClimateScenario,
  buildAllCountyClimateBaselines,
  computeResilienceRoi,
} from "@/utils/climateScenarioModel";
import { generateClimatePreparednessReportText } from "@/utils/generateClimatePreparednessReport";

describe("climateScenarios", () => {
  it("defines five climate scenarios with sources", () => {
    expect(CLIMATE_SCENARIOS.length).toBe(5);
    for (const s of CLIMATE_SCENARIOS) {
      expect(s.sources.length).toBeGreaterThanOrEqual(2);
      expect(s.confidenceBandPct).toBeGreaterThan(0);
      for (const src of s.sources) {
        expect(src.url).toMatch(/^https:\/\//);
      }
    }
  });

  it("projects county vulnerability with confidence bands", () => {
    const baselines = buildAllCountyClimateBaselines();
    expect(baselines.length).toBeGreaterThan(80);

    const projections = projectClimateScenario("heat-wave", "severe");
    expect(projections.length).toBe(baselines.length);
    const top = projections[0];
    expect(top.projectedVulnerability).toBeGreaterThanOrEqual(top.baselineVulnerability);
    expect(top.edIncreasePct.integrityLabel).toBe("PROJECTED");
    expect(top.edIncreasePct.high).toBeGreaterThanOrEqual(top.edIncreasePct.mid);
  });

  it("scopes projections to a service area template", () => {
    const scoped = projectClimateScenario("air-quality-event", "moderate", [
      "Wayne",
      "Oakland",
    ]);
    expect(scoped.every((p) => ["Wayne", "Oakland"].includes(p.county))).toBe(true);
  });

  it("projects flood and Great Lakes scenarios", () => {
    const flood = projectClimateScenario("flood-event", "severe");
    expect(flood.length).toBeGreaterThan(80);
    const lakes = projectClimateScenario("great-lakes-level", "moderate");
    const coastal = lakes.filter((p) =>
      ["Wayne", "Macomb", "Muskegon", "Ottawa"].includes(p.county),
    );
    expect(coastal.some((p) => p.vulnerabilityDelta > 0)).toBe(true);
  });

  it("computes resilience ROI with projected bands", () => {
    const roi = computeResilienceRoi({
      investmentUsd: 2_000_000,
      scenarioId: "heat-wave",
      severity: "moderate",
      counties: ["Wayne", "Genesee"],
    });
    expect(roi.countiesTargeted).toBe(2);
    expect(roi.integrityLabel).toBe("PROJECTED");
    expect(roi.avoidedEdVisitsHigh).toBeGreaterThanOrEqual(roi.avoidedEdVisitsLow);
  });

  it("generates preparedness report text", () => {
    const text = generateClimatePreparednessReportText("compound-heat-air", "severe");
    expect(text).toContain(getClimateScenarioById("compound-heat-air")?.title ?? "");
    expect(text).toContain("PROJECTED");
    expect(text).toContain("accessmi.org");
  });
});