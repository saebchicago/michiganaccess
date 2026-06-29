import { describe, it, expect } from "vitest";
import { buildExcelCohortCsv } from "@/utils/exportCohortExcel";
import { buildPowerBiCohortPackage } from "@/utils/exportCohortPowerBi";
import { filterCohort } from "@/utils/cohortFilter";

describe("cohort export formats", () => {
  it("excel export prefixes UTF-8 BOM", () => {
    const results = filterCohort({ minEjIndex: 70 });
    const csv = buildExcelCohortCsv({
      name: "Excel test",
      criteria: { minEjIndex: 70 },
      results,
    });
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("zip,city,county");
  });

  it("power bi package includes table schema and rows", () => {
    const results = filterCohort({ minEnergyBurdenPct: 4 });
    const pkg = buildPowerBiCohortPackage({
      name: "Power BI test",
      criteria: { minEnergyBurdenPct: 4 },
      results,
    });
    expect(pkg.schemaVersion).toBe("accessmi-powerbi-cohort-v1");
    expect(pkg.tables[0].name).toBe("CohortZips");
    expect(pkg.tables[0].columns.length).toBeGreaterThan(10);
    expect(pkg.tables[0].rows.length).toBe(results.length);
  });
});