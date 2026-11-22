// Hand-typed insight figures must match the datasets they cite. Values are
// typed into insights.ts (not imported) to keep the datasets out of the main
// bundle; this test is the drift guard.
import { describe, expect, it } from "vitest";
import { WEEKLY_INSIGHTS } from "@/data/insights";
import { HRSA_HPSA_COUNTY_RECORDS, HRSA_HPSA_COUNTY_PROVENANCE } from "@/data/hrsa-hpsa-county";
import { ALICE_COUNTY_RECORDS, ALICE_STATEWIDE_RECORD } from "@/data/aliceData";

const byWeek = (w: number) => WEEKLY_INSIGHTS.find((i) => i.week === w)!;
const point = (w: number, label: string) => byWeek(w).dataPoints!.find((d) => d.label === label)!;

describe("insight figures match their datasets", () => {
  it("primary care HPSA county counts", () => {
    const without = HRSA_HPSA_COUNTY_RECORDS.filter((c) => !(c.disciplines.primaryCare.designatedHpsas > 0)).map((c) => c.countyName);
    const withCount = HRSA_HPSA_COUNTY_RECORDS.length - without.length;
    expect(byWeek(0).text).toContain(`${withCount} of Michigan's ${HRSA_HPSA_COUNTY_RECORDS.length} counties`);
    expect(point(0, "Counties with a primary care HPSA").value).toBe(`${withCount} of ${HRSA_HPSA_COUNTY_RECORDS.length}`);
    expect(point(0, "Counties without one").context).toBe(without.join(", "));
    const pc = HRSA_HPSA_COUNTY_PROVENANCE.per_discipline.find((d) => d.disciplineId === "primaryCare")!;
    expect(byWeek(0).source).toContain(pc.dwCreateDate);
  });

  it("ALICE statewide and highest-county figures", () => {
    const s = ALICE_STATEWIDE_RECORD;
    expect(point(1, "Below ALICE Threshold").value).toBe(`${s.belowAliceThresholdPct}%`);
    expect(point(1, "Survival budget").value).toBe(`$${s.survivalBudgetSingleAdult.toLocaleString("en-US")}`);
    expect(byWeek(1).text).toContain(`${Math.round(s.povertyPct)}% in poverty`);
    expect(byWeek(1).text).toContain(`${Math.round(s.alicePct)}% above the poverty line`);
    const top = [...ALICE_COUNTY_RECORDS].sort((a, b) => b.belowAliceThresholdPct - a.belowAliceThresholdPct)[0];
    expect(point(1, "Highest county").value).toBe(`${top.countyName} Co.`);
    expect(point(1, "Highest county").context).toBe(`${top.belowAliceThresholdPct}% below threshold`);
    expect(byWeek(1).counties).toEqual([top.countyName]);
  });
});
