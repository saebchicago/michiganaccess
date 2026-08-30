import { describe, expect, it } from "vitest";
import {
  ALICE_COUNTY_COVERAGE,
  ALICE_COUNTY_PROVENANCE,
  ALICE_COUNTY_RECORDS,
  ALICE_STATEWIDE_RECORD,
  getALICEByCounty,
  MICHIGAN_ALICE,
  MICHIGAN_ALICE_STATEWIDE,
} from "@/data/aliceData";
import { MI_COUNTY_FIPS } from "@/data/census-geographies";

describe("ALICE 83-county coverage", () => {
  it("covers every Michigan county FIPS", () => {
    expect(ALICE_COUNTY_COVERAGE).toBe(83);
    expect(ALICE_COUNTY_RECORDS).toHaveLength(83);
    expect(MICHIGAN_ALICE).toHaveLength(83);
    const fips = new Set(ALICE_COUNTY_RECORDS.map((r) => r.countyFips));
    for (const code of Object.values(MI_COUNTY_FIPS)) {
      const full = `26${code}`;
      expect(fips.has(full), `missing ALICE row for FIPS ${full}`).toBe(true);
    }
  });

  it("county sums match the published statewide totals", () => {
    const hh = ALICE_COUNTY_RECORDS.reduce((s, r) => s + r.households, 0);
    const pov = ALICE_COUNTY_RECORDS.reduce(
      (s, r) => s + r.povertyHouseholds,
      0,
    );
    const alice = ALICE_COUNTY_RECORDS.reduce(
      (s, r) => s + r.aliceHouseholds,
      0,
    );
    expect(hh).toBe(4_109_904);
    expect(pov).toBe(551_257);
    expect(alice).toBe(1_079_772);
    expect(ALICE_STATEWIDE_RECORD.households).toBe(hh);
    expect(ALICE_STATEWIDE_RECORD.povertyHouseholds).toBe(pov);
    expect(ALICE_STATEWIDE_RECORD.aliceHouseholds).toBe(alice);
    expect(MICHIGAN_ALICE_STATEWIDE.combinedHardshipPct).toBe(39.7);
  });

  it("looks up rural and metro counties instead of returning null", () => {
    expect(getALICEByCounty("Clare")?.combinedHardshipPct).toBe(55.4);
    expect(getALICEByCounty("Clare County")?.combinedHardshipPct).toBe(55.4);
    expect(getALICEByCounty("Livingston")?.combinedHardshipPct).toBe(28.9);
    expect(getALICEByCounty("Wayne")?.combinedHardshipPct).toBe(50.4);
    expect(getALICEByCounty("Keweenaw")).not.toBeNull();
    expect(getALICEByCounty("Michigan")?.combinedHardshipPct).toBe(39.7);
  });

  it("labels the series MODELED and cites United Way ALICE", () => {
    expect(ALICE_COUNTY_PROVENANCE.value_label).toBe("MODELED");
    expect(ALICE_COUNTY_PROVENANCE.source_name).toMatch(/United For ALICE/);
    for (const row of MICHIGAN_ALICE) {
      expect(row.valueLabel).toBe("MODELED");
      expect(row.source).toMatch(/United Way ALICE/);
      expect(row.source).toMatch(/2024/);
    }
  });

  it("keeps official poles: Clare highest, Livingston lowest", () => {
    const sorted = [...ALICE_COUNTY_RECORDS].sort(
      (a, b) => b.belowAliceThresholdPct - a.belowAliceThresholdPct,
    );
    expect(sorted[0].countyName).toBe("Clare");
    expect(sorted[sorted.length - 1].countyName).toBe("Livingston");
  });
});
