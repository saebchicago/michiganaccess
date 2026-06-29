import { describe, it, expect } from "vitest";
import {
  ANALYST_DASHBOARDS,
  dashboardsByGroup,
} from "@/data/analystDashboardRegistry";
import { rankCountyInvestmentGaps } from "@/utils/investmentGapModel";

describe("analystDashboardRegistry", () => {
  it("registers core analyst surfaces", () => {
    const ids = ANALYST_DASHBOARDS.map((d) => d.id);
    expect(ids).toContain("cohort-builder");
    expect(ids).toContain("scenario-studio");
    expect(ids).toContain("investment-impact");
    expect(ANALYST_DASHBOARDS.length).toBeGreaterThanOrEqual(10);
  });

  it("groups dashboards by use-case family", () => {
    const cohort = dashboardsByGroup("cohort");
    expect(cohort.some((d) => d.href === "/cohort-builder")).toBe(true);
    const scenario = dashboardsByGroup("scenario");
    expect(scenario.some((d) => d.href === "/scenario-studio")).toBe(true);
  });
});

describe("investmentGapModel", () => {
  it("ranks counties by modeled investment gap", () => {
    const gaps = rankCountyInvestmentGaps();
    expect(gaps.length).toBeGreaterThan(10);
    expect(gaps[0].gapScore).toBeGreaterThanOrEqual(gaps[gaps.length - 1].gapScore);
    expect(gaps[0].integrityLabel).toBe("MODELED");
  });
});