import { describe, expect, it } from "vitest";
import { selectRelatedFindings } from "@/components/county/CountyInsightLinks";
import type { WeeklyInsight } from "@/data/insights";
import type { DataStory } from "@/data/data-stories";

const INSIGHTS: WeeklyInsight[] = [
  { week: 0, text: "Statewide A", source: "S1", href: "/a" },
  { week: 1, text: "Wayne flood gap", source: "S2", href: "/b", counties: ["Wayne"] },
  { week: 2, text: "Oakland-Wayne income gap", source: "S3", href: "/c", counties: ["Oakland", "Wayne"] },
];

const STORIES: DataStory[] = [
  {
    id: "s1",
    title: "T",
    hook: "Statewide story",
    narrative: "",
    stat: { value: 1, label: "", suffix: "" },
    source: "S4",
    href: "/d",
    color: "#000",
  },
  {
    id: "s2",
    title: "T2",
    hook: "Midland dam story",
    narrative: "",
    stat: { value: 1, label: "", suffix: "" },
    source: "S5",
    href: "/e",
    color: "#000",
    counties: ["Midland"],
  },
];

describe("selectRelatedFindings", () => {
  it("puts county-specific findings first", () => {
    const result = selectRelatedFindings("Wayne", 2, INSIGHTS, STORIES);
    expect(result[0].countySpecific).toBe(true);
    expect(result.filter((f) => f.countySpecific)).toHaveLength(2);
    expect(result.map((f) => f.text)).toContain("Wayne flood gap");
    expect(result.map((f) => f.text)).toContain("Oakland-Wayne income gap");
  });

  it("tops up with statewide items so every county has findings", () => {
    const result = selectRelatedFindings("Keweenaw", 2, INSIGHTS, STORIES);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((f) => !f.countySpecific)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("caps the list at 4 and never drops county-specific items for statewide ones", () => {
    const result = selectRelatedFindings("Wayne", 4, INSIGHTS, STORIES);
    expect(result.length).toBeLessThanOrEqual(4);
    const specificCount = result.filter((f) => f.countySpecific).length;
    expect(specificCount).toBe(2);
  });

  it("works against the real datasets without throwing", () => {
    const result = selectRelatedFindings("Wayne");
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(4);
    for (const f of result) {
      expect(f.source.length).toBeGreaterThan(0);
      expect(f.href.startsWith("/")).toBe(true);
    }
  });
});
