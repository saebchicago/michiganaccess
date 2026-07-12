import { describe, it, expect } from "vitest";
import { buildBriefCsvContent } from "../generateBriefCSV";
import type { BriefPDFInput } from "../generateBriefPDF";

const BASE_INPUT: BriefPDFInput = {
  countyName: "Wayne",
  countySlug: "wayne",
  citeText:
    "AccessMI (independent civic data project). Wayne County Brief. accessmi.org/brief?county=wayne. Retrieved July 4, 2026.",
  retrievedDate: "July 4, 2026",
  stats: [
    {
      label: "Population",
      value: "1,749,343",
      badge: "VERIFIED",
      source: "Census Bureau PEP",
      vintage: "Vintage 2024",
    },
    {
      label: "Civic Insight Score",
      value: "72/100",
      badge: "MODELED",
      source: "AccessMI derived",
      vintage: "Computed from verified inputs",
    },
    {
      label: "Health Facilities",
      value: "no data",
      badge: "no data",
      source: "CMS + HRSA",
      vintage: "Jul 4, 2026",
    },
  ],
};

describe("buildBriefCsvContent", () => {
  const csv = buildBriefCsvContent(BASE_INPUT);
  const lines = csv.split("\n");

  it("prefixes metadata lines with '#', including the county name, generated date, and cite text", () => {
    const metaLines = lines.filter((l) => l.startsWith("#"));
    expect(metaLines.length).toBeGreaterThan(0);
    expect(metaLines.some((l) => l.includes("Wayne County Brief"))).toBe(true);
    expect(metaLines.some((l) => l.includes("July 4, 2026"))).toBe(true);
    expect(metaLines.some((l) => l.includes(BASE_INPUT.citeText))).toBe(true);
  });

  it("has a header row naming label, value, integrity_label, source, vintage", () => {
    const headerLine = lines.find((l) => l.startsWith("label,"));
    expect(headerLine).toBe("label,value,integrity_label,source,vintage");
  });

  it("emits one data row per stat, in order, with the badge as integrity_label", () => {
    expect(csv).toContain("Population,\"1,749,343\",VERIFIED,Census Bureau PEP,Vintage 2024");
    expect(csv).toContain(
      "Civic Insight Score,72/100,MODELED,AccessMI derived,Computed from verified inputs",
    );
    expect(csv).toContain("Health Facilities,no data,no data,CMS + HRSA,");
  });

  it("produces no rows at all for an empty stats array", () => {
    const empty = buildBriefCsvContent({ ...BASE_INPUT, stats: [] });
    const emptyLines = empty.split("\n");
    const headerIdx = emptyLines.findIndex((l) => l.startsWith("label,"));
    expect(emptyLines.slice(headerIdx + 1)).toEqual([]);
  });
});
