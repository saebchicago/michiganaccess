import { describe, it, expect } from "vitest";
import {
  compareScenarioSlots,
  runSeveritySensitivity,
  scenarioSlotsFromSearchParams,
  scenarioStudioShareUrl,
  defaultScenarioSlot,
} from "@/utils/scenarioStudioModel";

describe("scenarioStudioModel", () => {
  it("compares two scenario slots", () => {
    const summary = compareScenarioSlots(
      defaultScenarioSlot("heat-wave", "moderate"),
      defaultScenarioSlot("flood-event", "severe"),
    );
    expect(summary.avgDeltaA).toBeGreaterThanOrEqual(0);
    expect(summary.integrityLabel).toBe("PROJECTED");
    expect(summary.countyOverlap).toBeGreaterThan(80);
  });

  it("runs severity sensitivity", () => {
    const points = runSeveritySensitivity("compound-heat-air");
    expect(points).toHaveLength(2);
    expect(points[1].avgDelta).toBeGreaterThanOrEqual(points[0].avgDelta);
  });

  it("round-trips URL search params", () => {
    const params = new URLSearchParams();
    params.set("a", "heat-wave");
    params.set("aSev", "severe");
    params.set("b", "air-quality-event");
    params.set("bSev", "moderate");
    params.set("counties", "Wayne,Oakland");
    const { slotA, slotB } = scenarioSlotsFromSearchParams(params);
    expect(slotA.scenarioId).toBe("heat-wave");
    expect(slotB.scenarioId).toBe("air-quality-event");
    expect(slotA.counties).toEqual(["Wayne", "Oakland"]);
  });

  it("builds share URL", () => {
    const url = scenarioStudioShareUrl(
      defaultScenarioSlot("flood-event"),
      defaultScenarioSlot("great-lakes-level"),
    );
    expect(url).toContain("/scenario-studio");
    expect(url).toContain("flood-event");
  });
});