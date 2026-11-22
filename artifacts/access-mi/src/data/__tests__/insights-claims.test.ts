// Hand-typed figures with a "dataset" review record (claimReviews.ts) must
// match the committed datasets they cite. Values are typed into the claim
// collections (not imported) to keep the datasets out of the main bundle;
// this file is the drift guard.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { WEEKLY_INSIGHTS } from "@/data/insights";
import { DATA_STORIES } from "@/data/data-stories";
import { SIGNALS_2026_03 } from "@/data/monthly-signals";
import { QUESTIONS } from "@/components/tools/MichiganQuiz";
import { ROTATING_STATS } from "@/components/home/HeroSection";
import { HRSA_HPSA_COUNTY_RECORDS, HRSA_HPSA_COUNTY_PROVENANCE, type HpsaDisciplineId } from "@/data/hrsa-hpsa-county";
import { ALICE_COUNTY_RECORDS, ALICE_STATEWIDE_RECORD } from "@/data/aliceData";
import { RX_KIDS_COVERED_COUNTIES, RX_KIDS_PROGRAM_FACTS } from "@/data/rx-kids";

const byWeek = (w: number) => WEEKLY_INSIGHTS.find((i) => i.week === w)!;
const point = (w: number, label: string) => byWeek(w).dataPoints!.find((d) => d.label === label)!;
const story = (id: string) => DATA_STORIES.find((s) => s.id === id)!;
const signal = (id: string) => SIGNALS_2026_03.find((s) => s.id === id)!;
const quiz = (needle: string) => QUESTIONS.find((q) => q.q.includes(needle))!;
const answer = (needle: string) => quiz(needle).options[quiz(needle).answer];

const TOTAL = HRSA_HPSA_COUNTY_RECORDS.length;
const countiesWith = (d: HpsaDisciplineId) => HRSA_HPSA_COUNTY_RECORDS.filter((c) => c.disciplines[d].designatedHpsas > 0);
const fileDate = (d: HpsaDisciplineId) => HRSA_HPSA_COUNTY_PROVENANCE.per_discipline.find((p) => p.disciplineId === d)!.dwCreateDate;

describe("HRSA shortage-area counts", () => {
  it("primary care: insight, quiz and homepage stat", () => {
    const n = countiesWith("primaryCare").length;
    const without = HRSA_HPSA_COUNTY_RECORDS.filter((c) => !(c.disciplines.primaryCare.designatedHpsas > 0)).map((c) => c.countyName);
    expect(byWeek(0).text).toContain(`${n} of Michigan's ${TOTAL} counties`);
    expect(point(0, "Counties with a primary care HPSA").value).toBe(`${n} of ${TOTAL}`);
    expect(point(0, "Counties without one").context).toBe(without.join(", "));
    expect(byWeek(0).source).toContain(fileDate("primaryCare"));
    expect(answer("primary care shortage area")).toBe(String(n));
    expect(quiz("primary care shortage area").fact).toContain(`${n} of ${TOTAL} counties`);
    expect(ROTATING_STATS.some((h) => h.text.startsWith(`${n} of ${TOTAL} Michigan counties contain a primary care shortage area`))).toBe(true);
  });

  it("dental: insight, story, signal and quiz", () => {
    const n = countiesWith("dental").length;
    expect(byWeek(5).text).toContain(`${n} of Michigan's ${TOTAL} counties`);
    expect(point(5, "Counties with a dental HPSA").value).toBe(`${n} of ${TOTAL}`);
    expect(byWeek(5).source).toContain(fileDate("dental"));
    expect(story("dental-desert").stat.value).toBe(n);
    expect(story("dental-desert").hook).toContain(`${n} of ${TOTAL} counties`);
    expect(story("dental-desert").narrative).toContain(`${n} of Michigan's ${TOTAL} counties`);
    expect(story("dental-desert").source).toContain(fileDate("dental"));
    expect(signal("s15").text).toContain(`${n} of ${TOTAL} counties`);
    expect(answer("dental shortage area")).toBe(String(n));
    expect(quiz("dental shortage area").fact).toContain(`${n} of ${TOTAL} counties`);
  });
});

describe("ALICE figures", () => {
  const s = ALICE_STATEWIDE_RECORD;
  const rounded = Math.round(s.belowAliceThresholdPct);

  it("insight", () => {
    expect(point(1, "Below ALICE Threshold").value).toBe(`${s.belowAliceThresholdPct}%`);
    expect(point(1, "Survival budget").value).toBe(`$${s.survivalBudgetSingleAdult.toLocaleString("en-US")}`);
    expect(byWeek(1).text).toContain(`${rounded}% of Michigan households`);
    expect(byWeek(1).text).toContain(`${Math.round(s.povertyPct)}% in poverty`);
    expect(byWeek(1).text).toContain(`${Math.round(s.alicePct)}% above the poverty line`);
    const top = [...ALICE_COUNTY_RECORDS].sort((a, b) => b.belowAliceThresholdPct - a.belowAliceThresholdPct)[0];
    expect(point(1, "Highest county").value).toBe(`${top.countyName} Co.`);
    expect(point(1, "Highest county").context).toBe(`${top.belowAliceThresholdPct}% below threshold`);
    expect(byWeek(1).counties).toEqual([top.countyName]);
  });

  it("story, signal, quiz and homepage stat", () => {
    expect(story("alice-gap").stat.value).toBe(rounded);
    expect(signal("s9").text).toContain(`${rounded}% of MI households`);
    expect(signal("s9").text).toContain(`${s.povertyPct}% poverty + ${s.alicePct}% ALICE`);
    expect(answer("ALICE Threshold")).toBe(`${rounded}%`);
    expect(quiz("ALICE Threshold").fact).toContain(`${Math.round(s.povertyPct)}% in poverty and ${Math.round(s.alicePct)}% above`);
    expect(ROTATING_STATS.some((h) => h.text.startsWith(`${rounded}% of Michigan households were below the ALICE Threshold in ${s.year}`))).toBe(true);
  });
});

describe("Rx Kids coverage", () => {
  it("insight and quiz match the community list", () => {
    const n = RX_KIDS_COVERED_COUNTIES.length;
    expect(byWeek(12).text).toContain(`${n} of Michigan's ${TOTAL} counties`);
    expect(point(12, "Counties with a community").value).toBe(`${n} of ${TOTAL}`);
    expect(RX_KIDS_PROGRAM_FACTS.launchDate).toBe("January 2024");
    expect(point(12, "Launched").value).toBe("Jan 2024");
    expect(answer("Rx Kids")).toBe(String(n));
    expect(quiz("Rx Kids").fact).toContain(`${n} of ${TOTAL} counties`);
  });
});

describe("SAIPE statewide poverty", () => {
  it("quiz matches the published export", () => {
    const saipe = JSON.parse(readFileSync(path.resolve(__dirname, "../../../public/data/michigan-county-income-poverty.json"), "utf8"));
    expect(answer("SAIPE")).toBe(`${saipe.provenance.statewide.povertyPct}%`);
    expect(quiz("SAIPE").q).toContain(`in ${saipe.provenance.estimate_year}`);
    expect(saipe.provenance.value_label).toBe("MODELED");
  });
});
