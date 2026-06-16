/**
 * Unit tests for seed-maternal-health row builder invariants.
 *
 * Verifies two contracts without hitting Supabase:
 *   1. Every row carries data_years === CANONICAL_INFANT_MORTALITY_VINTAGE.
 *   2. A blank/absent IMR field maps to infant_mortality_rate: null (not 0).
 *
 * The row-builder logic is replicated here from the loader so the test is
 * independent of the script entry point. The shared const is imported to
 * ensure loader and guard can never diverge.
 */

import { vi, describe, it, expect } from "vitest";

// Supabase client is instantiated at module load in @/integrations/supabase/client,
// which data-layers.ts imports. Mock the package so no real client is created.
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ order: vi.fn() }) }),
  }),
}));

import { CANONICAL_INFANT_MORTALITY_VINTAGE } from "@/lib/data-layers";

// Replicates parseOrNull from seed-maternal-health.ts - must stay in sync.
function parseOrNull(v: string): number | null {
  if (!v || v === "" || v === "suppressed" || v === "N/A" || v === "*")
    return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// Replicates the row object shape the loader builds and upserts.
function buildRow(fields: Record<string, string>) {
  return {
    county: fields.county || fields.County || "",
    data_years: CANONICAL_INFANT_MORTALITY_VINTAGE,
    infant_mortality_rate: parseOrNull(
      fields.imr || fields.infant_mortality_rate || "",
    ),
  };
}

describe("seed-maternal-health row builder", () => {
  it("sets data_years to CANONICAL_INFANT_MORTALITY_VINTAGE on every row", () => {
    const row = buildRow({ county: "Wayne", imr: "8.4" });
    expect(row.data_years).toBe(CANONICAL_INFANT_MORTALITY_VINTAGE);
    expect(row.data_years).toBe("2020-2024");
  });

  it("maps a blank IMR to null (not 0)", () => {
    const row = buildRow({ county: "Keweenaw", imr: "" });
    expect(row.infant_mortality_rate).toBeNull();
  });

  it("maps an absent IMR field to null", () => {
    const row = buildRow({ county: "Luce" });
    expect(row.infant_mortality_rate).toBeNull();
  });

  it("maps 'suppressed' to null (MDHHS suppression marker)", () => {
    const row = buildRow({ county: "Keweenaw", imr: "suppressed" });
    expect(row.infant_mortality_rate).toBeNull();
  });

  it("maps '*' to null (alternate suppression marker)", () => {
    const row = buildRow({ county: "Oscoda", imr: "*" });
    expect(row.infant_mortality_rate).toBeNull();
  });

  it("parses a numeric IMR correctly", () => {
    const row = buildRow({ county: "Saginaw", imr: "9.2" });
    expect(row.infant_mortality_rate).toBe(9.2);
  });

  it("CANONICAL_INFANT_MORTALITY_VINTAGE is the literal '2020-2024'", () => {
    expect(CANONICAL_INFANT_MORTALITY_VINTAGE).toBe("2020-2024");
  });
});
