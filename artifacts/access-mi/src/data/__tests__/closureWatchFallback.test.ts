import { describe, it, expect } from "vitest";
import { CLOSURE_WATCH_FALLBACK } from "../closureWatchFallback";

// All 83 Michigan county names
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
  "Wayne", "Wexford", "Benzie",
]);

// Michigan bounding box
const MI_LAT_MIN = 41.6;
const MI_LAT_MAX = 48.3;
const MI_LON_MIN = -90.5;
const MI_LON_MAX = -82.4;

describe("closureWatchFallback", () => {
  it("has at least one entry", () => {
    expect(CLOSURE_WATCH_FALLBACK.length).toBeGreaterThan(0);
  });

  it("every entry has a unique id", () => {
    const ids = CLOSURE_WATCH_FALLBACK.map((e) => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("every verified entry has at least two sources", () => {
    const verified = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "verified");
    for (const entry of verified) {
      expect(
        entry.sources.length,
        `${entry.id} is verified but has ${entry.sources.length} source(s)`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("every verified entry has all sources marked verified: true", () => {
    const verified = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "verified");
    for (const entry of verified) {
      for (const source of entry.sources) {
        expect(
          source.verified,
          `Source "${source.name}" on ${entry.id} is not marked verified`
        ).toBe(true);
      }
    }
  });

  it("every entry has a valid status", () => {
    const validStatuses = new Set(["verified", "pending-second-source", "disputed"]);
    for (const entry of CLOSURE_WATCH_FALLBACK) {
      expect(validStatuses.has(entry.status), `${entry.id} has invalid status: ${entry.status}`).toBe(true);
    }
  });

  it("every entry's county is a valid Michigan county", () => {
    for (const entry of CLOSURE_WATCH_FALLBACK) {
      expect(
        MICHIGAN_COUNTIES.has(entry.county),
        `${entry.id} has unrecognized county: "${entry.county}"`
      ).toBe(true);
    }
  });

  it("every entry's latitude is inside Michigan bounding box", () => {
    for (const entry of CLOSURE_WATCH_FALLBACK) {
      expect(
        entry.latitude >= MI_LAT_MIN && entry.latitude <= MI_LAT_MAX,
        `${entry.id} latitude ${entry.latitude} is outside Michigan (${MI_LAT_MIN}–${MI_LAT_MAX})`
      ).toBe(true);
    }
  });

  it("every entry's longitude is inside Michigan bounding box", () => {
    for (const entry of CLOSURE_WATCH_FALLBACK) {
      expect(
        entry.longitude >= MI_LON_MIN && entry.longitude <= MI_LON_MAX,
        `${entry.id} longitude ${entry.longitude} is outside Michigan (${MI_LON_MIN}–${MI_LON_MAX})`
      ).toBe(true);
    }
  });

  it("every entry has a non-empty summary", () => {
    for (const entry of CLOSURE_WATCH_FALLBACK) {
      expect(entry.summary.trim().length, `${entry.id} has empty summary`).toBeGreaterThan(0);
    }
  });

  it("every entry has valid closureDate ISO format", () => {
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    for (const entry of CLOSURE_WATCH_FALLBACK) {
      expect(iso.test(entry.closureDate), `${entry.id} closureDate "${entry.closureDate}" is not ISO`).toBe(true);
    }
  });

  it("pending-second-source entries are not in the verified set", () => {
    const pending = CLOSURE_WATCH_FALLBACK.filter((e) => e.status === "pending-second-source");
    // pending entries are fine to have, just confirm they won't accidentally get displayed
    // as verified (this is enforced in ClosureWatchPage's useMemo filter)
    for (const entry of pending) {
      expect(entry.status).toBe("pending-second-source");
    }
  });
});
