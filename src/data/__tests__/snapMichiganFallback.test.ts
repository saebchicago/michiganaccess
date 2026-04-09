import { describe, it, expect } from "vitest";
import {
  SNAP_COUNTY_FALLBACK,
  SNAP_STATE_FALLBACK,
} from "../snapMichiganFallback";

// All 83 Michigan county names (no " County" suffix)
const MICHIGAN_COUNTIES = new Set([
  "Alcona", "Alger", "Allegan", "Alpena", "Antrim", "Arenac",
  "Baraga", "Barry", "Bay", "Benzie", "Berrien", "Branch",
  "Calhoun", "Cass", "Charlevoix", "Cheboygan", "Chippewa", "Clare",
  "Clinton", "Crawford", "Delta", "Dickinson", "Eaton", "Emmet",
  "Genesee", "Gladwin", "Gogebic", "Grand Traverse", "Gratiot",
  "Hillsdale", "Houghton", "Huron", "Ingham", "Ionia", "Iosco",
  "Iron", "Isabella", "Jackson", "Kalamazoo", "Kalkaska", "Kent",
  "Keweenaw", "Lake", "Lapeer", "Leelanau", "Lenawee", "Livingston",
  "Luce", "Mackinac", "Macomb", "Manistee", "Marquette", "Mason",
  "Mecosta", "Menominee", "Midland", "Missaukee", "Monroe", "Montcalm",
  "Montmorency", "Muskegon", "Newaygo", "Oakland", "Oceana", "Ogemaw",
  "Ontonagon", "Osceola", "Oscoda", "Otsego", "Ottawa", "Presque Isle",
  "Roscommon", "Saginaw", "Sanilac", "Schoolcraft", "Shiawassee",
  "St. Clair", "St. Joseph", "Tuscola", "Van Buren", "Washtenaw",
  "Wayne", "Wexford",
]);

const VALID_URL = /^https:\/\//;

describe("snapMichiganFallback", () => {
  it("SNAP_COUNTY_FALLBACK contains entries for all 83 Michigan counties", () => {
    expect(SNAP_COUNTY_FALLBACK.length).toBe(83);
  });

  it("every county name is a valid Michigan county", () => {
    for (const entry of SNAP_COUNTY_FALLBACK) {
      expect(
        MICHIGAN_COUNTIES.has(entry.county),
        `"${entry.county}" is not a recognized Michigan county name`
      ).toBe(true);
    }
  });

  it("no duplicate county names", () => {
    const names = SNAP_COUNTY_FALLBACK.map((e) => e.county);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("no duplicate FIPS codes", () => {
    const fips = SNAP_COUNTY_FALLBACK.map((e) => e.fips);
    const unique = new Set(fips);
    expect(unique.size).toBe(fips.length);
  });

  it("every FIPS code is a 5-digit Michigan FIPS (26xxx)", () => {
    for (const entry of SNAP_COUNTY_FALLBACK) {
      expect(
        /^26\d{3}$/.test(entry.fips),
        `${entry.county} FIPS "${entry.fips}" is not a valid Michigan county FIPS`
      ).toBe(true);
    }
  });

  it("every enrollmentTotal is a positive integer or null", () => {
    for (const entry of SNAP_COUNTY_FALLBACK) {
      if (entry.enrollmentTotal !== null) {
        expect(
          Number.isInteger(entry.enrollmentTotal) && entry.enrollmentTotal > 0,
          `${entry.county} enrollmentTotal ${entry.enrollmentTotal} is not a positive integer`
        ).toBe(true);
      }
    }
  });

  it("every enrollmentHouseholds is a positive integer or null", () => {
    for (const entry of SNAP_COUNTY_FALLBACK) {
      if (entry.enrollmentHouseholds !== null) {
        expect(
          Number.isInteger(entry.enrollmentHouseholds) && entry.enrollmentHouseholds > 0,
          `${entry.county} enrollmentHouseholds ${entry.enrollmentHouseholds} is invalid`
        ).toBe(true);
      }
    }
  });

  it("every sourceUrl is a valid https URL", () => {
    for (const entry of SNAP_COUNTY_FALLBACK) {
      expect(
        VALID_URL.test(entry.sourceUrl),
        `${entry.county} sourceUrl "${entry.sourceUrl}" is not a valid URL`
      ).toBe(true);
    }
  });

  it("enrollmentAsOf is set on every entry", () => {
    for (const entry of SNAP_COUNTY_FALLBACK) {
      expect(entry.enrollmentAsOf.trim().length).toBeGreaterThan(0);
    }
  });

  it("households are less than total persons on every non-null entry", () => {
    for (const entry of SNAP_COUNTY_FALLBACK) {
      if (entry.enrollmentTotal !== null && entry.enrollmentHouseholds !== null) {
        expect(
          entry.enrollmentHouseholds < entry.enrollmentTotal,
          `${entry.county}: households (${entry.enrollmentHouseholds}) >= persons (${entry.enrollmentTotal})`
        ).toBe(true);
      }
    }
  });

  it("Wayne County has the largest enrollment", () => {
    const wayne = SNAP_COUNTY_FALLBACK.find((e) => e.county === "Wayne");
    expect(wayne).toBeDefined();
    for (const entry of SNAP_COUNTY_FALLBACK) {
      if (entry.enrollmentTotal !== null && wayne!.enrollmentTotal !== null) {
        expect(wayne!.enrollmentTotal).toBeGreaterThanOrEqual(entry.enrollmentTotal);
      }
    }
  });

  it("SNAP_STATE_FALLBACK has required fields", () => {
    expect(SNAP_STATE_FALLBACK.stateTotal).toBeGreaterThan(0);
    expect(SNAP_STATE_FALLBACK.stateAsOf.trim().length).toBeGreaterThan(0);
    expect(VALID_URL.test(SNAP_STATE_FALLBACK.stateSourceUrl)).toBe(true);
    expect(SNAP_STATE_FALLBACK.benefitIssuanceMonthly).toBeGreaterThan(0);
    expect(SNAP_STATE_FALLBACK.benefitAsOf.trim().length).toBeGreaterThan(0);
    expect(VALID_URL.test(SNAP_STATE_FALLBACK.benefitSourceUrl)).toBe(true);
  });

  it("state total is greater than any single county total", () => {
    for (const entry of SNAP_COUNTY_FALLBACK) {
      if (entry.enrollmentTotal !== null) {
        expect(
          SNAP_STATE_FALLBACK.stateTotal,
          `State total should exceed ${entry.county} (${entry.enrollmentTotal})`
        ).toBeGreaterThan(entry.enrollmentTotal);
      }
    }
  });
});
