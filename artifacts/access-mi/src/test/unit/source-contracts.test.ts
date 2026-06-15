/**
 * Source-contract tests.
 *
 * Each dataset that feeds the Health Equity Atlas must satisfy three invariants:
 *   1. Source attribution: the `source` field is non-empty and contains the expected org name
 *   2. Vintage: the source string includes a 4-digit year
 *   3. Value range: numeric fields fall within epidemiologically plausible bounds;
 *      null is allowed only where MDHHS/CDC suppression applies
 *
 * When a dataset is updated or a new county is added, these tests catch
 * out-of-range values before they reach the map.
 */

import { describe, it, expect } from "vitest";
import { MICHIGAN_ALICE } from "@/data/aliceData";
import {
  MICHIGAN_ENERGY_BURDEN,
  MICHIGAN_FEMA_NRI,
} from "@/data/environmentalData";
import { MICHIGAN_FOOD_ACCESS } from "@/hooks/useFoodAccess";
import { MICHIGAN_BROADBAND_SEED } from "@/hooks/useBroadbandData";
import { SOURCE_MANIFEST } from "@/data/sourceManifest";
import { SOURCES_BY_CATEGORY } from "@/data/sourcesRegistry";
import type { MetricValue } from "@/types/data-layers";
import { METRIC_CONTRACTS } from "./metricContracts";

// ── helpers ──────────────────────────────────────────────────────────────────

const YEAR_RE = /\d{4}/;

function expectSourceAttribution(
  source: string,
  expectedOrg: string,
  label: string,
) {
  expect(source, `${label}: source must be non-empty`).toBeTruthy();
  expect(
    YEAR_RE.test(source),
    `${label}: source must contain a 4-digit year`,
  ).toBe(true);
  expect(
    source.includes(expectedOrg),
    `${label}: source "${source}" must reference "${expectedOrg}"`,
  ).toBe(true);
}

function expectInRange(
  value: number | null,
  min: number,
  max: number,
  allowNull: boolean,
  label: string,
) {
  if (value === null) {
    expect(
      allowNull,
      `${label}: null value requires allow_null: true in contract`,
    ).toBe(true);
    return;
  }
  expect(value, `${label}: ${value} must be >= ${min}`).toBeGreaterThanOrEqual(
    min,
  );
  expect(value, `${label}: ${value} must be <= ${max}`).toBeLessThanOrEqual(
    max,
  );
}

// ── ALICE data ────────────────────────────────────────────────────────────────

describe("ALICE data - source contracts", () => {
  const contract = METRIC_CONTRACTS.alice_combined_hardship_pct;

  it("has at least one county record", () => {
    expect(MICHIGAN_ALICE.length).toBeGreaterThan(0);
  });

  it.each(MICHIGAN_ALICE.map((r) => [r.county, r]))(
    "%s: source attribution valid",
    (county, row) => {
      expectSourceAttribution(
        row.source,
        contract.source_org,
        `ALICE ${county}`,
      );
    },
  );

  it.each(MICHIGAN_ALICE.map((r) => [r.county, r]))(
    "%s: combinedHardshipPct in plausible range [%d, %d]",
    (county, row) => {
      expectInRange(
        row.combinedHardshipPct,
        contract.min,
        contract.max,
        contract.allow_null,
        `ALICE combinedHardshipPct ${county}`,
      );
    },
  );
});

// ── Energy burden data ────────────────────────────────────────────────────────

describe("Energy burden data - source contracts", () => {
  const contract = METRIC_CONTRACTS.energy_low_income_burden_pct;

  it("has at least one county record", () => {
    expect(MICHIGAN_ENERGY_BURDEN.length).toBeGreaterThan(0);
  });

  it.each(MICHIGAN_ENERGY_BURDEN.map((r) => [r.county, r]))(
    "%s: source attribution valid",
    (county, row) => {
      expectSourceAttribution(
        row.source,
        contract.source_org,
        `EnergyBurden ${county}`,
      );
    },
  );

  it.each(MICHIGAN_ENERGY_BURDEN.map((r) => [r.county, r]))(
    "%s: lowIncomeBurdenPct in plausible range [%d, %d]",
    (county, row) => {
      expectInRange(
        row.lowIncomeBurdenPct,
        contract.min,
        contract.max,
        contract.allow_null,
        `EnergyBurden lowIncomeBurdenPct ${county}`,
      );
    },
  );
});

// ── Food access data ──────────────────────────────────────────────────────────

describe("Food access data - source contracts", () => {
  const contract = METRIC_CONTRACTS.food_low_access_pct;

  it("has at least one county record", () => {
    expect(MICHIGAN_FOOD_ACCESS.length).toBeGreaterThan(0);
  });

  it.each(MICHIGAN_FOOD_ACCESS.map((r) => [r.county, r]))(
    "%s: source attribution valid",
    (county, row) => {
      expectSourceAttribution(
        row.source,
        contract.source_org,
        `FoodAccess ${county}`,
      );
    },
  );

  it.each(MICHIGAN_FOOD_ACCESS.map((r) => [r.county, r]))(
    "%s: lowAccessPct in plausible range [%d, %d]",
    (county, row) => {
      expectInRange(
        row.lowAccessPct,
        contract.min,
        contract.max,
        contract.allow_null,
        `FoodAccess lowAccessPct ${county}`,
      );
    },
  );
});

// ── Broadband data ────────────────────────────────────────────────────────────

describe("Broadband data - source contracts", () => {
  const contract = METRIC_CONTRACTS.broadband_pct_25_3_covered;

  it("has at least one county record", () => {
    expect(MICHIGAN_BROADBAND_SEED.length).toBeGreaterThan(0);
  });

  it.each(MICHIGAN_BROADBAND_SEED.map((r) => [r.county, r]))(
    "%s: source attribution valid",
    (county, row) => {
      expectSourceAttribution(
        row.source,
        contract.source_org,
        `Broadband ${county}`,
      );
    },
  );

  it.each(MICHIGAN_BROADBAND_SEED.map((r) => [r.county, r]))(
    "%s: pct_25_3_covered in plausible range [%d, %d]",
    (county, row) => {
      expectInRange(
        row.pct_25_3_covered,
        contract.min,
        contract.max,
        contract.allow_null,
        `Broadband pct_25_3_covered ${county}`,
      );
    },
  );
});

// ── FEMA NRI data ─────────────────────────────────────────────────────────────

describe("FEMA NRI data - source contracts", () => {
  const contract = METRIC_CONTRACTS.fema_nri_composite_risk;

  it("has at least one county record", () => {
    expect(MICHIGAN_FEMA_NRI.length).toBeGreaterThan(0);
  });

  it.each(MICHIGAN_FEMA_NRI.map((r) => [r.county, r]))(
    "%s: source attribution valid",
    (county, row) => {
      expectSourceAttribution(
        row.source,
        contract.source_org,
        `FEMANRI ${county}`,
      );
    },
  );

  it.each(MICHIGAN_FEMA_NRI.map((r) => [r.county, r]))(
    "%s: compositeRisk in plausible range [%d, %d]",
    (county, row) => {
      expectInRange(
        row.compositeRisk,
        contract.min,
        contract.max,
        contract.allow_null,
        `FEMANRI compositeRisk ${county}`,
      );
    },
  );
});

// ── MetricValue structural contracts ─────────────────────────────────────────

describe("MetricValue type - structural contract", () => {
  const VALID_LABELS: MetricValue["label"][] = [
    "VERIFIED",
    "MODELED",
    "PROJECTED",
  ];

  const SAMPLE_METRIC_VALUES: MetricValue[] = [
    {
      value: 6.3,
      ci_lower: 5.8,
      ci_upper: 6.9,
      source: "MDHHS Vital Stats",
      vintage: "2019-2023",
      label: "VERIFIED",
    },
    {
      value: null,
      source: "MDHHS Vital Stats",
      vintage: "2019-2023",
      label: "VERIFIED",
    },
    {
      value: 41.0,
      source: "United Way ALICE 2025",
      vintage: "2023",
      label: "VERIFIED",
    },
  ];

  it.each(SAMPLE_METRIC_VALUES.map((m, i) => [i, m]))(
    "sample[%d]: source is non-empty and contains a year",
    (_, m) => {
      expect(
        m.source.trim().length,
        "source must be non-empty",
      ).toBeGreaterThan(0);
      expect(
        YEAR_RE.test(m.vintage),
        "vintage must contain a 4-digit year",
      ).toBe(true);
    },
  );

  it.each(SAMPLE_METRIC_VALUES.map((m, i) => [i, m]))(
    "sample[%d]: label is one of VERIFIED | MODELED | PROJECTED",
    (_, m) => {
      expect(VALID_LABELS).toContain(m.label);
    },
  );

  it.each(
    SAMPLE_METRIC_VALUES.filter((m) => m.value !== null).map((m, i) => [i, m]),
  )("sample[%d] (non-null): CI bounds are ordered or absent", (_, m) => {
    if (m.ci_lower !== undefined && m.ci_upper !== undefined) {
      expect(m.ci_lower).toBeLessThanOrEqual(m.value as number);
      expect(m.ci_upper).toBeGreaterThanOrEqual(m.value as number);
    }
  });

  it("suppressed value (null) is a valid MetricValue when allow_null is true", () => {
    const contract = METRIC_CONTRACTS.infant_mortality_per_1k;
    const suppressed: MetricValue = {
      value: null,
      source: "MDHHS Vital Stats",
      vintage: "2019-2023",
      label: "VERIFIED",
    };
    expect(contract.allow_null).toBe(true);
    expectInRange(
      suppressed.value,
      contract.min,
      contract.max,
      contract.allow_null,
      "suppressed IMR",
    );
  });
});

// ── Source registry completeness ──────────────────────────────────────────────

describe("Source registry - completeness contracts", () => {
  const ALL_SOURCES = Object.values(SOURCES_BY_CATEGORY).flat();
  const SOURCE_ORG_NAMES = ALL_SOURCES.map((s) => s.org);

  it("sourcesRegistry contains at least one entry per atlas data org", () => {
    const requiredOrgs = ["USDA", "FCC", "FEMA", "CDC"];
    for (const org of requiredOrgs) {
      expect(
        SOURCE_ORG_NAMES.some((n) => n.includes(org)),
        `sourcesRegistry must have at least one entry for org: ${org}`,
      ).toBe(true);
    }
  });

  it("every source entry has a non-empty name, org, url, and powers", () => {
    for (const entry of ALL_SOURCES) {
      expect(
        entry.name.trim().length,
        `${entry.org}: name must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        entry.org.trim().length,
        `${entry.name}: org must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        entry.url.trim().length,
        `${entry.name}: url must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        entry.powers.trim().length,
        `${entry.name}: powers must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });
});

// ── Source manifest - verified claim integrity ────────────────────────────────

describe("Source manifest - verified claim integrity", () => {
  it("every claim has a non-empty value, context, source, and url", () => {
    for (const claim of SOURCE_MANIFEST) {
      expect(
        claim.value.trim().length,
        `context="${claim.context}": value must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        claim.context.trim().length,
        `value="${claim.value}": context must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        claim.source.trim().length,
        `value="${claim.value}": source must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        claim.url.trim().length,
        `value="${claim.value}": url must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("no claim notes 'not independently verified' while verified:true", () => {
    for (const claim of SOURCE_MANIFEST) {
      if (claim.verified && claim.notes) {
        expect(
          claim.notes.includes("not independently verified"),
          `claim "${claim.value}" is verified:true but notes say "not independently verified"`,
        ).toBe(false);
      }
    }
  });

  it("claims with verified:false have notes explaining why", () => {
    const unverified = SOURCE_MANIFEST.filter((c) => !c.verified);
    for (const claim of unverified) {
      expect(
        (claim.notes ?? "").trim().length,
        `unverified claim "${claim.value}" must have a notes field explaining the gap`,
      ).toBeGreaterThan(0);
    }
  });
});
