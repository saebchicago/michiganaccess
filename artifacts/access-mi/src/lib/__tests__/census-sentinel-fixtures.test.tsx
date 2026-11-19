import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  buildZIPDemographics,
  ZIP_ESTIMATE_VARS,
  type ZIPDemographics,
} from "@/hooks/useCensusDemographics";
import { parseCountyEconomicRow } from "@/hooks/useEconomicData";
import MoEBadge from "@/components/shared/MoEBadge";

const moeVars = ZIP_ESTIMATE_VARS.map((v) => v.replace(/E$/, "M"));
const headers = [...ZIP_ESTIMATE_VARS, ...moeVars];

/** One ZCTA row. `over` replaces cells by variable code. */
function row(over: Record<string, string> = {}): string[] {
  const base: Record<string, string> = {
    B01003_001E: "10000", B02001_002E: "6000", B02001_003E: "2000", B02001_005E: "500",
    B03003_003E: "800", B16001_001E: "9000", B16001_003E: "300", B16001_105E: "100",
    B02001_008E: "600", B19013_001E: "58000",
    B25003_001E: "4000", B25003_002E: "2500", B25003_003E: "1500",
  };
  for (const v of ZIP_ESTIMATE_VARS) base[v.replace(/E$/, "M")] = "100";
  return headers.map((h) => over[h] ?? base[h]);
}

describe("ZIP demographics with Census sentinels", () => {
  it("a -666666666 estimate yields null, never a negative or zero", () => {
    const d = buildZIPDemographics("48201", headers, row({ B02001_003E: "-666666666" }));
    expect(d.black_alone_pct).toBeNull();
    expect(d.unavailableReasons.black_alone_pct).toMatch(/Suppressed/);
    // Two or more races has its own published count.
    expect(d.multiracial_pct).toBe(6);
    for (const v of Object.values(d)) {
      if (typeof v === "number") expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it("reads profile percentages and published percentage-point uncertainty directly", () => {
    const d = buildZIPDemographics("48201", [...headers, "DP02_0072PE", "DP02_0072PM", "DP02_0115PE", "DP02_0115PM"],
      [...row(), "12.3", "1.5", "0", "-222222222"]);
    expect([d.disability_pct, d.pctMoe.disability_pct]).toEqual([12.3, 1.5]);
    expect([d.lep_pct, d.pctMoe.lep_pct]).toEqual([0, null]);
    expect(d.spanish_speakers_pct).toBeCloseTo(300 / 9000 * 100);
    expect(d.arabic_speakers_pct).toBeCloseTo(100 / 9000 * 100);
  });

  it("a sentinel denominator makes every dependent percentage null", () => {
    const d = buildZIPDemographics("48201", headers, row({ B01003_001E: "-666666666" }));
    expect(d.totalPop).toBeNull();
    expect(d.white_alone_pct).toBeNull();
    expect(d.hispanic_pct).toBeNull();
    expect(d.unavailableReasons.white_alone_pct).toMatch(/Denominator unavailable/);
    // Percentages on other denominators are unaffected.
    expect(d.renter_pct).toBeCloseTo(37.5, 5);
  });

  it("a blank cell is missing, not 0", () => {
    const d = buildZIPDemographics("48201", headers, row({ B25003_003E: "" }));
    expect(d.renter_pct).toBeNull();
  });

  it("a real zero stays 0", () => {
    const d = buildZIPDemographics("48201", headers, row({ B02001_005E: "0" }));
    expect(d.asian_alone_pct).toBe(0);
  });

  it("a sentinel median income is null", () => {
    const d = buildZIPDemographics("48201", headers, row({ B19013_001E: "-666666666" }));
    expect(d.medianHouseholdIncome).toBeNull();
    expect(d.unavailableReasons.medianHouseholdIncome).toBeTruthy();
  });

  it("a sentinel MOE leaves the percentage and nulls its MOE", () => {
    const d = buildZIPDemographics("48201", headers, row({ B02001_002M: "-222222222" }));
    expect(d.white_alone_pct).toBeCloseTo(60, 5);
    expect(d.pctMoe.white_alone_pct).toBeNull();
    expect(d.moe["B02001_002E"]).toBeUndefined();
  });

  it("computes a percentage MOE from the proportion formula", () => {
    const d = buildZIPDemographics("48201", headers, row());
    // sqrt(100^2 - 0.6^2 * 100^2) / 10000 * 100 = 0.8 points
    expect(d.pctMoe.white_alone_pct).toBeCloseTo(0.8, 6);
  });

  it("a large MOE renders the MoEBadge", () => {
    const d: ZIPDemographics = buildZIPDemographics(
      "48201", headers, row({ B02001_005E: "40", B02001_005M: "60" }),
    );
    render(<MoEBadge estimate={d.asian_alone_pct} moe={d.pctMoe.asian_alone_pct} />);
    expect(screen.getByText(/Unreliable|High Margin of Error/)).toBeTruthy();
  });

  it("a small MOE renders no badge", () => {
    const d = buildZIPDemographics("48201", headers, row());
    const { container } = render(
      <MoEBadge estimate={d.white_alone_pct} moe={d.pctMoe.white_alone_pct} />,
    );
    expect(container.textContent).toBe("");
  });
});

describe("county economic rows with Census sentinels", () => {
  // NAME, B19013, B17001_002, B17001_001, B23025_005, B23025_003, B25077, B25064, state, county
  const ok = ["Wayne County, Michigan", "50000", "100", "1000", "50", "500", "150000", "900", "1500", "26", "163"];

  it("parses a normal row", () => {
    const r = parseCountyEconomicRow(ok);
    expect(r).toMatchObject({ county: "Wayne", fips: "26163", medianIncome: 50000, povertyRate: 10, unemploymentRate: 10 });
  });

  it("a sentinel population gives a null poverty rate, not a divide by 1", () => {
    const r = parseCountyEconomicRow(ok.map((v, i) => (i === 3 ? "-666666666" : v)));
    expect(r?.povertyRate).toBeNull();
    expect(r?.unemploymentRate).toBe(10);
  });

  it("a sentinel labor force gives a null unemployment rate", () => {
    const r = parseCountyEconomicRow(ok.map((v, i) => (i === 5 ? "-666666666" : v)));
    expect(r?.unemploymentRate).toBeNull();
  });

  it("sentinel rent or home value is null, never $0 or negative", () => {
    const r = parseCountyEconomicRow(ok.map((v, i) => (i >= 6 && i <= 7 ? "-666666666" : v)));
    expect(r?.medianHomeValue).toBeNull();
    expect(r?.medianRent).toBeNull();
  });

  it("a sentinel median income drops the row", () => {
    expect(parseCountyEconomicRow(ok.map((v, i) => (i === 1 ? "-666666666" : v)))).toBeNull();
  });
});

vi.mock("@/hooks/useEconomicData", async (orig) => {
  const actual = await orig<typeof import("@/hooks/useEconomicData")>();
  return {
    ...actual,
    useEconomicData: () => ({
      isLoading: false,
      data: {
        isFallback: false,
        counties: [
          {
            county: "Alcona", fips: "26001", medianIncome: 50000,
            incomeInterval: [], povertyInterval: [], povertyRate: null, unemploymentRate: null, medianHomeValue: null, medianRent: null,
          },
        ],
      },
    }),
  };
});

describe("EconomicVitalityDashboard with sentinel-derived nulls", () => {
  it("renders Data unavailable, never a negative or $0", async () => {
    const { default: Dashboard } = await import("@/components/civic/EconomicVitalityDashboard");
    const { container } = render(<Dashboard />);
    expect(screen.getAllByText("Data unavailable").length).toBeGreaterThanOrEqual(4);
    expect(container.textContent).not.toMatch(/-\d{5,}|\$0\b|\$-/);
  });
});
