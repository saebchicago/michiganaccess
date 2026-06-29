import { describe, it, expect } from "vitest";
import {
  TABLEAU_COHORT_COLUMNS,
  buildTableauCohortCsv,
} from "@/utils/exportCohortTableau";
import { filterCohort } from "@/utils/cohortFilter";

describe("exportCohortTableau", () => {
  it("defines a documented flat schema for Tableau", () => {
    expect(TABLEAU_COHORT_COLUMNS.length).toBeGreaterThan(20);
    const keys = TABLEAU_COHORT_COLUMNS.map((c) => c.key);
    expect(keys).toContain("zip");
    expect(keys).toContain("ej_index");
    expect(keys).toContain("ej_index_integrity");
    expect(keys).toContain("cohort_name");
  });

  it("builds comment header and numeric measure rows", () => {
    const results = filterCohort({ minEjIndex: 70 });
    const csv = buildTableauCohortCsv({
      name: "Test cohort",
      criteria: { minEjIndex: 70 },
      results,
      exportedAt: "2026-06-29T12:00:00.000Z",
    });

    expect(csv).toContain("# AccessMI Cohort Export - Tableau Packaged CSV");
    expect(csv).toContain("# Schema version: accessmi-tableau-cohort-v1");
    expect(csv).toContain("zip,city,county,ej_index");
    expect(csv).toContain("Test cohort");
    expect(csv).toContain("2026-06-29T12:00:00.000Z");

    const dataLines = csv.split("\n").filter((l) => l && !l.startsWith("#"));
    expect(dataLines.length).toBe(results.length + 1);
    if (results.length > 0) {
      expect(dataLines[1]).toMatch(/^48/);
      expect(dataLines[1]).toContain("VERIFIED");
    }
  });
});