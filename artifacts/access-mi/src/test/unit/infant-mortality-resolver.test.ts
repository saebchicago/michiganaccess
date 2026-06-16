/**
 * Unit tests for getInfantMortalityAtlas() vintage guard.
 *
 * The resolver must surface a rate only for rows where:
 *   - data_years === CANONICAL_INFANT_MORTALITY_VINTAGE ('2020-2024')
 *   - infant_mortality_rate is non-null
 *
 * Any other row resolves to null (suppressed, wrong vintage, absent county).
 * Supabase is mocked at the client module boundary; no network calls are made.
 */

import { vi, describe, it, expect, beforeEach } from "vitest";
import type { MaternalInfantHealth } from "@/types/data-layers";

// vi.hoisted ensures these fns exist when the vi.mock factory runs (which is
// hoisted to the top of the compiled output before any const initializers).
const { mockOrder, mockSelect, mockFrom } = vi.hoisted(() => {
  const mockOrder = vi.fn();
  const mockSelect = vi.fn(() => ({ order: mockOrder }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockOrder, mockSelect, mockFrom };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import {
  getInfantMortalityAtlas,
  CANONICAL_INFANT_MORTALITY_VINTAGE,
} from "@/lib/data-layers";

function makeRow(
  county: string,
  data_years: string,
  infant_mortality_rate: number | null,
): Partial<MaternalInfantHealth> {
  return { county, data_years, infant_mortality_rate };
}

function stubRows(rows: Partial<MaternalInfantHealth>[]) {
  mockOrder.mockResolvedValueOnce({ data: rows, error: null });
}

describe("CANONICAL_INFANT_MORTALITY_VINTAGE", () => {
  it("is the literal string '2020-2024'", () => {
    expect(CANONICAL_INFANT_MORTALITY_VINTAGE).toBe("2020-2024");
  });
});

describe("getInfantMortalityAtlas() vintage guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ order: mockOrder });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  it("surfaces a rate for a row at the canonical vintage with a non-null rate", async () => {
    stubRows([makeRow("Wayne", "2020-2024", 8.4)]);
    const result = await getInfantMortalityAtlas();
    expect(result["Wayne"]).toBe(8.4);
  });

  it("resolves null for a row with a different vintage ('2023' single-year)", async () => {
    stubRows([makeRow("Genesee", "2023", 7.1)]);
    const result = await getInfantMortalityAtlas();
    expect(result["Genesee"]).toBeUndefined();
  });

  it("resolves null for a row at the canonical vintage with a null rate (MDHHS suppression)", async () => {
    stubRows([makeRow("Keweenaw", "2020-2024", null)]);
    const result = await getInfantMortalityAtlas();
    expect(result["Keweenaw"]).toBeUndefined();
  });

  it("resolves null for an absent county", async () => {
    stubRows([makeRow("Wayne", "2020-2024", 8.4)]);
    const result = await getInfantMortalityAtlas();
    expect(result["Luce"]).toBeUndefined();
  });

  it("handles mixed rows - surfaces only canonical vintage with non-null rate", async () => {
    stubRows([
      makeRow("Wayne", "2020-2024", 8.4), // surfaced
      makeRow("Genesee", "2023", 7.1), // wrong vintage - suppressed
      makeRow("Keweenaw", "2020-2024", null), // null rate - suppressed
      makeRow("Saginaw", "2020-2024", 9.2), // surfaced
      makeRow("Oakland", "2018-2022", 4.8), // wrong vintage - suppressed
    ]);
    const result = await getInfantMortalityAtlas();
    expect(result["Wayne"]).toBe(8.4);
    expect(result["Saginaw"]).toBe(9.2);
    expect(result["Genesee"]).toBeUndefined();
    expect(result["Keweenaw"]).toBeUndefined();
    expect(result["Oakland"]).toBeUndefined();
  });

  it("returns an empty map when the table is empty (pre-seed state)", async () => {
    stubRows([]);
    const result = await getInfantMortalityAtlas();
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("returns an empty map when Supabase returns an error", async () => {
    mockOrder.mockResolvedValueOnce({
      data: null,
      error: { message: "relation does not exist" },
    });
    const result = await getInfantMortalityAtlas();
    expect(Object.keys(result)).toHaveLength(0);
  });
});
