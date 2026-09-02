import { describe, expect, it } from "vitest";
import {
  MDE_COUNTY_PROVENANCE,
  MDE_COUNTY_RECORDS,
  MDE_IS_POPULATED,
  MDE_MEASURES,
  MDE_SOURCE_LABEL,
  getMdeForCountyName,
  getMdeValue,
} from "@/data/mde-county";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";

describe("MDE county education coverage", () => {
  it("covers every Michigan county FIPS", () => {
    expect(MDE_COUNTY_RECORDS).toHaveLength(83);
    const fips = new Set(MDE_COUNTY_RECORDS.map((r) => r.countyFips));
    for (const [name, code] of Object.entries(MI_COUNTY_FIPS)) {
      const full = `26${code}`;
      expect(fips.has(full), `missing MDE row for ${name} (${full})`).toBe(true);
      expect(getMdeForCountyName(name)?.countyFips).toBe(full);
    }
  });

  it("declares the four county measures, each VERIFIED", () => {
    expect(MDE_MEASURES.map((m) => m.id)).toEqual([
      "chronicAbsenteeismPct",
      "grade3ElaProficientPct",
      "gradRate4yr",
      "economicallyDisadvantagedPct",
    ]);
    for (const m of MDE_MEASURES) {
      expect(m.value_label).toBe("VERIFIED");
      expect(m.report.length).toBeGreaterThan(0);
    }
  });

  it("cites MDE / CEPI on mischooldata.org and states the suppression rule", () => {
    expect(MDE_COUNTY_PROVENANCE.source_name).toMatch(/MDE|Michigan Department of Education/);
    expect(MDE_COUNTY_PROVENANCE.source_name).toMatch(/CEPI/);
    expect(MDE_COUNTY_PROVENANCE.source_url).toBe("https://www.mischooldata.org/");
    expect(MDE_COUNTY_PROVENANCE.suppression_rule).toMatch(/under 10/);
    expect(MDE_SOURCE_LABEL).toMatch(/MDE \/ CEPI/);
  });

  it("label and populated flag agree, and pending rows are honest nulls", () => {
    if (MDE_IS_POPULATED) {
      expect(MDE_COUNTY_PROVENANCE.value_label).toBe("VERIFIED");
      expect(MDE_COUNTY_PROVENANCE.school_year).toMatch(/^\d{4}-\d{2}$/);
      expect(MDE_COUNTY_PROVENANCE.file_sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(MDE_COUNTY_PROVENANCE.download_url).toMatch(/^https:\/\//);
      for (const r of MDE_COUNTY_RECORDS) {
        expect(["populated", "partial"]).toContain(r.status);
        expect(r.schoolYear).toBe(MDE_COUNTY_PROVENANCE.school_year);
        for (const [id, val] of Object.entries(r.values)) {
          if (val === null) {
            expect(r.suppressed, `${r.countyName} ${id} null but not suppressed`).toContain(id);
          } else {
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(100);
          }
        }
        if (r.status === "populated") expect(r.suppressed).toHaveLength(0);
      }
    } else {
      expect(MDE_COUNTY_PROVENANCE.value_label).toBe("PENDING");
      expect(MDE_COUNTY_PROVENANCE.pending_reason).toMatch(/mde-county-/);
      for (const r of MDE_COUNTY_RECORDS) {
        expect(r.status).toBe("pending-ci");
        for (const val of Object.values(r.values)) expect(val).toBeNull();
        expect(r.enrollment).toBeNull();
      }
      expect(getMdeValue("Wayne", "chronicAbsenteeismPct")).toBeNull();
    }
  });

  it("never renders a suppressed cell as zero", () => {
    for (const r of MDE_COUNTY_RECORDS) {
      for (const id of r.suppressed) {
        expect(r.values[id]).toBeNull();
      }
    }
  });
});
