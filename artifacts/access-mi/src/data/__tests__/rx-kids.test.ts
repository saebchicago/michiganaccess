import { describe, it, expect } from "vitest";
import { MICHIGAN_COUNTIES } from "@/contexts/CountyContext";
import {
  RX_KIDS_COMMUNITIES,
  RX_KIDS_COVERED_COUNTIES,
  RX_KIDS_OUTCOMES,
  RX_KIDS_PROGRAM_FACTS,
  isRxKidsActive,
  getRxKidsCommunities,
} from "../rx-kids";

const VALID_COUNTIES = new Set<string>(MICHIGAN_COUNTIES);

describe("rx-kids", () => {
  it("every community row names a real Michigan county with a source", () => {
    for (const row of RX_KIDS_COMMUNITIES) {
      expect(VALID_COUNTIES.has(row.county), `invalid county: ${row.county}`).toBe(true);
      expect(row.source.length).toBeGreaterThan(0);
      expect(row.community.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate county+community rows", () => {
    const keys = RX_KIDS_COMMUNITIES.map((r) => `${r.county}::${r.community}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("derives the covered-county list without duplicates", () => {
    expect(new Set(RX_KIDS_COVERED_COUNTIES).size).toBe(RX_KIDS_COVERED_COUNTIES.length);
    for (const county of RX_KIDS_COVERED_COUNTIES) {
      expect(VALID_COUNTIES.has(county)).toBe(true);
    }
    // Coverage is real and growing but still a minority of Michigan's 83 counties.
    expect(RX_KIDS_COVERED_COUNTIES.length).toBeGreaterThan(20);
    expect(RX_KIDS_COVERED_COUNTIES.length).toBeLessThan(83);
  });

  it("isRxKidsActive matches the covered-county list", () => {
    expect(isRxKidsActive("Genesee")).toBe(true);
    expect(isRxKidsActive("Marquette")).toBe(true);
    expect(isRxKidsActive(null)).toBe(false);
    // A county with no announced community is not active.
    const uncovered = MICHIGAN_COUNTIES.find((c) => !RX_KIDS_COVERED_COUNTIES.includes(c));
    expect(uncovered).toBeDefined();
    expect(isRxKidsActive(uncovered!)).toBe(false);
  });

  it("getRxKidsCommunities filters to the requested county", () => {
    const flint = getRxKidsCommunities("Genesee");
    expect(flint.length).toBeGreaterThan(0);
    expect(flint.every((c) => c.county === "Genesee")).toBe(true);
    expect(getRxKidsCommunities(null)).toEqual([]);
  });

  it("every outcome has a non-empty citation", () => {
    expect(RX_KIDS_OUTCOMES.length).toBeGreaterThan(0);
    for (const outcome of RX_KIDS_OUTCOMES) {
      expect(outcome.citation.length).toBeGreaterThan(0);
      expect(outcome.finding.length).toBeGreaterThan(0);
      expect(outcome.metric.length).toBeGreaterThan(0);
    }
  });

  it("program facts cite a named source for the state investment", () => {
    expect(RX_KIDS_PROGRAM_FACTS.stateInvestmentSource.length).toBeGreaterThan(0);
    expect(RX_KIDS_PROGRAM_FACTS.stateInvestment).toMatch(/\$/);
  });
});
