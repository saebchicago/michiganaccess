import { describe, it, expect } from "vitest";
import {
  rankCountiesBySdohRisk,
  computeCountySdohRisk,
  DEFAULT_SDOH_WEIGHTS,
  stateAverageRisk,
} from "@/utils/sdohRiskModel";

describe("sdohRiskModel", () => {
  it("ranks all 83 counties", () => {
    const rows = rankCountiesBySdohRisk(DEFAULT_SDOH_WEIGHTS);
    expect(rows.length).toBe(83);
    expect(rows[0].composite).toBeGreaterThanOrEqual(rows[1].composite);
  });

  it("assigns risk tiers", () => {
    const wayne = computeCountySdohRisk("Wayne", DEFAULT_SDOH_WEIGHTS);
    expect(wayne?.tier).toBeDefined();
    expect(wayne?.dimensions.healthcare).toBeGreaterThan(0);
  });

  it("computes state average", () => {
    const avg = stateAverageRisk(DEFAULT_SDOH_WEIGHTS);
    expect(avg).toBeGreaterThan(20);
    expect(avg).toBeLessThan(80);
  });
});