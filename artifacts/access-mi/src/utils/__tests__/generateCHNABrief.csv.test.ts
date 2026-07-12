import { describe, it, expect } from "vitest";
import { buildChnaBriefCsvContent } from "../generateCHNABrief";
import { HFH_SYSTEM, CHNA_PRIORITIES, CHNA_METRICS } from "@/data/chnaSeed";

const CHRONIC_DISEASE = CHNA_PRIORITIES.find((p) => p.id === "chronic-disease")!;

describe("buildChnaBriefCsvContent", () => {
  const csv = buildChnaBriefCsvContent(CHRONIC_DISEASE, HFH_SYSTEM);
  const lines = csv.split("\n");

  it("prefixes metadata lines with '#', naming the system, priority, and service area", () => {
    const metaLines = lines.filter((l) => l.startsWith("#"));
    expect(metaLines.length).toBeGreaterThan(0);
    expect(metaLines.some((l) => l.includes(HFH_SYSTEM.label))).toBe(true);
    expect(metaLines.some((l) => l.includes(CHRONIC_DISEASE.label))).toBe(true);
    expect(
      metaLines.some((l) => l.includes(HFH_SYSTEM.counties.join(", "))),
    ).toBe(true);
  });

  it("has a header row naming domain, label, value, unit, geography, integrity_label, source, vintage", () => {
    const headerLine = lines.find((l) => l.startsWith("domain,"));
    expect(headerLine).toBe(
      "domain,label,value,unit,geography,integrity_label,source,vintage",
    );
  });

  it("emits exactly one row per CHNA_METRICS entry that matches this priority", () => {
    const expectedCount = CHNA_METRICS.filter(
      (m) => m.priorityId === CHRONIC_DISEASE.id,
    ).length;
    const headerIdx = lines.findIndex((l) => l.startsWith("domain,"));
    const dataRows = lines.slice(headerIdx + 1);
    expect(expectedCount).toBeGreaterThan(0);
    expect(dataRows).toHaveLength(expectedCount);
  });

  it("carries a real integrity label per row, matching the seed data (not a placeholder)", () => {
    const metric = CHNA_METRICS.find(
      (m) => m.priorityId === CHRONIC_DISEASE.id,
    )!;
    expect(csv).toContain(metric.label);
    expect(csv).toContain(metric.integrityLabel);
    expect(csv).toContain(metric.source);
  });

  it("returns no data rows for a priority with no matching metrics", () => {
    const csvNoMatch = buildChnaBriefCsvContent(
      { id: "no-such-priority", label: "Nothing", scope: "enterprise" },
      HFH_SYSTEM,
    );
    const noMatchLines = csvNoMatch.split("\n");
    const headerIdx = noMatchLines.findIndex((l) => l.startsWith("domain,"));
    expect(noMatchLines.slice(headerIdx + 1)).toEqual([]);
  });
});
