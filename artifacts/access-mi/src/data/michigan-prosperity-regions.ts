/**
 * Michigan Prosperity Regions - 10 official regions established under the
 * Regional Prosperity Initiative (RPI), signed into law as part of Michigan's
 * FY2014 budget. Each region is the unit at which the state coordinates
 * economic development, workforce, transportation, and adult-education
 * planning. They cover all 83 Michigan counties without overlap.
 *
 * SOURCE OF RECORD
 *   Page:     Michigan Department of Treasury - Prosperity Region Field Teams
 *   URL:      https://www.michigan.gov/treasury/local/lafd/prosperity
 *   Authority: State of Michigan, Department of Treasury, Local Affairs and
 *              Financial Division (LAFD)
 *   Captured: 2026-06-29
 *   Method:   Scraped via firecrawl /scrape (markdown extraction). The source
 *             page lists each numbered region 1 through 10 with its constituent
 *             counties and field-team contacts.
 *
 * CROSS-VALIDATION
 *   The Region 5 ("East Central Michigan Prosperity Region") county list was
 *   independently confirmed against the East Michigan Council of Governments
 *   fiduciary page (https://www.emcog.org/prosperity.asp, captured 2026-06-29):
 *   Arenac, Bay, Clare, Gladwin, Gratiot, Isabella, Midland, Saginaw.
 *
 *   The Region 2 ("Northwest Prosperity Region") county list was independently
 *   confirmed against Networks Northwest
 *   (https://www.networksnorthwest.org/community/framework-for-our-future/regional-prosperity-initiative.html,
 *   captured 2026-06-29): Antrim, Charlevoix, Emmet, Benzie, Grand Traverse,
 *   Kalkaska, Leelanau, Manistee, Missaukee, Wexford.
 *
 * DOCUMENTED SOURCE DISCREPANCIES
 *   Two county-name spellings on the Treasury page differ from the canonical
 *   forms in src/data/census-geographies.ts. We normalize to the canonical
 *   spelling and record both forms here:
 *     - Region 3: Treasury spells "Montorency"; canonical "Montmorency".
 *     - Region 6: Treasury spells "Genessee"; canonical "Genesee".
 *
 *   The Treasury page header text labels BOTH Region 5 and Region 6 with
 *   the string "East Central Michigan Prosperity Alliance". That cannot
 *   both be true for two distinct numbered regions. Rather than assert
 *   either string is "correct", we record the conflict and resolve it
 *   from the fiduciaries' own self-identification:
 *     - Region 5: EMCOG (East Michigan Council of Governments), the
 *       fiduciary for Region 5, self-describes its region as the
 *       "East Central Michigan Prosperity Region" with the 8 counties
 *       Arenac, Bay, Clare, Gladwin, Gratiot, Isabella, Midland, Saginaw
 *       (https://www.emcog.org/prosperity.asp, captured 2026-06-29).
 *     - Region 6: published Michigan workforce-development materials and
 *       multiple regional planning documents refer to the seven-county
 *       grouping of Genesee, Huron, Lapeer, Sanilac, Shiawassee, St. Clair,
 *       Tuscola as the "East Michigan Prosperity Region".
 *   We therefore adopt those names. This is a source discrepancy, not an
 *   asserted typo: a future maintainer who finds an updated Treasury page
 *   with unambiguous distinct labels should reconcile against it. The
 *   county lists themselves are unambiguous on the source page and are
 *   used verbatim.
 *
 * INVARIANT
 *   All 83 Michigan counties appear exactly once across the 10 regions.
 *   Verified at module load with assertRegionsCoverAllCounties().
 */
import { MI_COUNTY_FIPS } from "./census-geographies";

export interface MichiganProsperityRegion {
  /** Region number 1 through 10, as published by Treasury. */
  number: number;
  /** Region slug, stable identifier for routes and data joins. */
  id: string;
  /** Region name as resolved from cross-validated sources. See the
   * "DOCUMENTED SOURCE DISCREPANCIES" section of the file header. */
  name: string;
  /** Short label suitable for axis ticks and chip labels. */
  shortName: string;
  /** Counties assigned to this region, using the canonical spellings from
   * census-geographies.ts. */
  counties: string[];
}

export const MICHIGAN_PROSPERITY_REGIONS: MichiganProsperityRegion[] = [
  {
    number: 1,
    id: "upper-peninsula",
    name: "Upper Peninsula Prosperity Alliance",
    shortName: "Upper Peninsula",
    counties: [
      "Alger",
      "Baraga",
      "Chippewa",
      "Delta",
      "Dickinson",
      "Gogebic",
      "Houghton",
      "Iron",
      "Keweenaw",
      "Luce",
      "Mackinac",
      "Marquette",
      "Menominee",
      "Ontonagon",
      "Schoolcraft",
    ],
  },
  {
    number: 2,
    id: "northwest",
    name: "Northwest Prosperity Region",
    shortName: "Northwest",
    counties: [
      "Antrim",
      "Benzie",
      "Charlevoix",
      "Emmet",
      "Grand Traverse",
      "Kalkaska",
      "Leelanau",
      "Manistee",
      "Missaukee",
      "Wexford",
    ],
  },
  {
    number: 3,
    id: "northeast",
    name: "Northeast Prosperity Region",
    shortName: "Northeast",
    counties: [
      "Alcona",
      "Alpena",
      "Cheboygan",
      "Crawford",
      "Iosco",
      "Montmorency",
      "Ogemaw",
      "Oscoda",
      "Otsego",
      "Presque Isle",
      "Roscommon",
    ],
  },
  {
    number: 4,
    id: "west",
    name: "West Michigan Prosperity Alliance",
    shortName: "West Michigan",
    counties: [
      "Allegan",
      "Barry",
      "Ionia",
      "Kent",
      "Lake",
      "Mason",
      "Mecosta",
      "Montcalm",
      "Muskegon",
      "Newaygo",
      "Oceana",
      "Osceola",
      "Ottawa",
    ],
  },
  {
    number: 5,
    id: "east-central",
    name: "East Central Michigan Prosperity Region",
    shortName: "East Central",
    counties: [
      "Arenac",
      "Bay",
      "Clare",
      "Gladwin",
      "Gratiot",
      "Isabella",
      "Midland",
      "Saginaw",
    ],
  },
  {
    number: 6,
    id: "east",
    name: "East Michigan Prosperity Region",
    shortName: "East Michigan",
    counties: [
      "Genesee",
      "Huron",
      "Lapeer",
      "Sanilac",
      "Shiawassee",
      "St. Clair",
      "Tuscola",
    ],
  },
  {
    number: 7,
    id: "south-central",
    name: "South Central Prosperity Region",
    shortName: "South Central",
    counties: ["Clinton", "Eaton", "Ingham"],
  },
  {
    number: 8,
    id: "southwest",
    name: "Southwest Prosperity Region",
    shortName: "Southwest",
    counties: [
      "Berrien",
      "Branch",
      "Calhoun",
      "Cass",
      "Kalamazoo",
      "St. Joseph",
      "Van Buren",
    ],
  },
  {
    number: 9,
    id: "southeast",
    name: "Southeast Michigan Prosperity Region",
    shortName: "Southeast",
    counties: [
      "Hillsdale",
      "Jackson",
      "Lenawee",
      "Livingston",
      "Monroe",
      "Washtenaw",
    ],
  },
  {
    number: 10,
    id: "detroit-metro",
    name: "Detroit Metro Prosperity Region",
    shortName: "Detroit Metro",
    counties: ["Macomb", "Oakland", "Wayne"],
  },
];

export const PROSPERITY_REGIONS_SOURCE = {
  name: "Michigan Department of Treasury - Prosperity Region Field Teams",
  url: "https://www.michigan.gov/treasury/local/lafd/prosperity",
  capturedAt: "2026-06-29",
  authority: "State of Michigan, Department of Treasury, LAFD",
  programName: "Regional Prosperity Initiative (RPI)",
  established: "FY2014",
} as const;

const COUNTY_TO_REGION = new Map<string, MichiganProsperityRegion>();
for (const region of MICHIGAN_PROSPERITY_REGIONS) {
  for (const county of region.counties) {
    if (COUNTY_TO_REGION.has(county)) {
      throw new Error(
        `michigan-prosperity-regions: county "${county}" is assigned to multiple regions`,
      );
    }
    COUNTY_TO_REGION.set(county, region);
  }
}

/** Return the Prosperity Region for a county, or null if unknown. */
export function getProsperityRegionForCounty(
  county: string,
): MichiganProsperityRegion | null {
  return COUNTY_TO_REGION.get(county) ?? null;
}

/** Return the Prosperity Region by its 1-10 number, or null if out of range. */
export function getProsperityRegionByNumber(
  n: number,
): MichiganProsperityRegion | null {
  return MICHIGAN_PROSPERITY_REGIONS.find((r) => r.number === n) ?? null;
}

/** Return the Prosperity Region by its slug, or null if unknown. */
export function getProsperityRegionById(
  id: string,
): MichiganProsperityRegion | null {
  return MICHIGAN_PROSPERITY_REGIONS.find((r) => r.id === id) ?? null;
}

/**
 * Verify the registry covers all 83 Michigan counties exactly once. Throws
 * if it does not. Called from the test suite and at module load below.
 */
export function assertRegionsCoverAllCounties(): void {
  const fipsKeys = Object.keys(MI_COUNTY_FIPS).sort();
  const assigned = Array.from(COUNTY_TO_REGION.keys()).sort();
  if (fipsKeys.length !== 83) {
    throw new Error(
      `census-geographies declares ${fipsKeys.length} counties, expected 83`,
    );
  }
  if (assigned.length !== 83) {
    throw new Error(
      `prosperity regions cover ${assigned.length} counties, expected 83`,
    );
  }
  const missing = fipsKeys.filter((c) => !COUNTY_TO_REGION.has(c));
  const extra = assigned.filter((c) => !(c in MI_COUNTY_FIPS));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `prosperity regions vs census-geographies mismatch.\n  missing: ${missing.join(", ")}\n  extra: ${extra.join(", ")}`,
    );
  }
}

assertRegionsCoverAllCounties();
