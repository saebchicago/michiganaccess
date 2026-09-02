import { describe, it, expect } from "vitest";
import { MI_COUNTY_FIPS } from "../census-geographies";
import {
  HUD_CHAS_COUNTY_PROVENANCE,
  HUD_CHAS_COUNTY_RECORDS,
  HUD_CHAS_IS_POPULATED,
  getChasForCountyFips,
  getChasForCountyName,
} from "../hud-chas-county";

describe("hud-chas-county", () => {
  it("covers all 83 Michigan counties (partition even when pending-ci)", () => {
    expect(HUD_CHAS_COUNTY_RECORDS).toHaveLength(83);
    const fipsSet = new Set(HUD_CHAS_COUNTY_RECORDS.map((r) => r.countyFips));
    expect(fipsSet.size).toBe(83);
    for (const [name, threeDigit] of Object.entries(MI_COUNTY_FIPS)) {
      const record = getChasForCountyFips(`26${threeDigit}`);
      expect(record, `missing record for ${name}`).not.toBeNull();
      expect(record?.countyName).toBe(name);
    }
  });

  it("labels every record with a known coverage state", () => {
    const valid = new Set(["populated", "pending-ci"]);
    for (const r of HUD_CHAS_COUNTY_RECORDS) {
      expect(valid.has(r.status), `${r.countyName}: ${r.status}`).toBe(true);
    }
  });

  it("carries a value_label consistent with the populated flag", () => {
    if (HUD_CHAS_IS_POPULATED) {
      expect(HUD_CHAS_COUNTY_PROVENANCE.value_label).toBe("VERIFIED");
      expect(HUD_CHAS_COUNTY_PROVENANCE.populated).toBe(true);
      expect(HUD_CHAS_COUNTY_PROVENANCE.vintage_window).toMatch(/^\d{4}-\d{4}$/);
      expect(HUD_CHAS_COUNTY_PROVENANCE.zip_sha256).toMatch(/^[0-9a-f]{64}$/);
    } else {
      expect(HUD_CHAS_COUNTY_PROVENANCE.value_label).toBe("PENDING");
      expect(HUD_CHAS_COUNTY_PROVENANCE.populated).toBe(false);
      expect(HUD_CHAS_COUNTY_PROVENANCE.pending_reason).toBeTruthy();
    }
  });

  it("provenance names HUD CHAS Table 8 on huduser.gov", () => {
    expect(HUD_CHAS_COUNTY_PROVENANCE.source_name).toMatch(/HUD.*CHAS/i);
    expect(HUD_CHAS_COUNTY_PROVENANCE.source_url).toMatch(
      /^https:\/\/www\.huduser\.gov\//,
    );
    expect(HUD_CHAS_COUNTY_PROVENANCE.table).toMatch(/Table 8/);
    expect(HUD_CHAS_COUNTY_PROVENANCE.candidate_vintages.length).toBeGreaterThan(0);
    expect(HUD_CHAS_COUNTY_PROVENANCE.notes).toMatch(/30%/);
    expect(HUD_CHAS_COUNTY_PROVENANCE.notes).toMatch(/50%/);
  });

  it("populated rows obey the burden ordering and percent ranges", () => {
    for (const r of HUD_CHAS_COUNTY_RECORDS) {
      if (r.status !== "populated") {
        expect(r.households).toBeNull();
        expect(r.costBurdened30Pct).toBeNull();
        expect(r.byIncomeBand).toBeNull();
        expect(r.pendingReason).toBeTruthy();
        continue;
      }
      expect(r.households!).toBeGreaterThan(0);
      expect(r.costBurdened50Households!).toBeLessThanOrEqual(
        r.costBurdened30Households!,
      );
      expect(r.costBurdened30Households!).toBeLessThanOrEqual(r.households!);
      for (const v of [
        r.costBurdened30Pct,
        r.costBurdened50Pct,
        r.ownerCostBurdened30Pct,
        r.renterCostBurdened30Pct,
      ]) {
        if (v === null) continue;
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
      expect(Object.keys(r.byIncomeBand!)).toEqual([
        "le30ami",
        "gt30le50ami",
        "gt50le80ami",
        "gt80le100ami",
        "gt100ami",
      ]);
      const bandSum = Object.values(r.byIncomeBand!).reduce(
        (s, b) => s + b.households,
        0,
      );
      expect(bandSum).toBe(r.households);
    }
  });

  it("populated flag matches per-record status", () => {
    const allPopulated = HUD_CHAS_COUNTY_RECORDS.every(
      (r) => r.status === "populated",
    );
    expect(HUD_CHAS_IS_POPULATED).toBe(allPopulated);
  });

  it("resolves records by FIPS and by name, with or without 'County'", () => {
    expect(getChasForCountyFips("26163")?.countyName).toBe("Wayne");
    expect(getChasForCountyFips("26999")).toBeNull();
    expect(getChasForCountyName("Wayne")?.countyFips).toBe("26163");
    expect(getChasForCountyName("Wayne County")?.countyFips).toBe("26163");
    expect(getChasForCountyName("Not A County")).toBeNull();
  });
});
