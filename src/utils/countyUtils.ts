import { MICHIGAN_COUNTIES, type MichiganCounty } from "@/contexts/CountyContext";

/** Convert county name to URL slug: "Grand Traverse" → "grand-traverse" */
export function countyToSlug(county: string): string {
  return county.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
}

/** Convert URL slug back to county name: "grand-traverse" → "Grand Traverse" */
export function slugToCounty(slug: string): MichiganCounty | null {
  const found = MICHIGAN_COUNTIES.find(
    (c) => countyToSlug(c) === slug.toLowerCase()
  );
  return found ?? null;
}

/** Get all county slugs for route generation */
export function getAllCountySlugs(): { slug: string; county: MichiganCounty }[] {
  return MICHIGAN_COUNTIES.map((c) => ({
    slug: countyToSlug(c),
    county: c,
  }));
}

/** County center coordinates for map focusing */
export const COUNTY_CENTERS: Record<string, [number, number]> = {
  Wayne: [42.2791, -83.2462],
  Oakland: [42.6615, -83.3862],
  Macomb: [42.6683, -82.9061],
  Kent: [43.0320, -85.5494],
  Genesee: [43.0235, -83.7065],
  Washtenaw: [42.2524, -83.8536],
  Ingham: [42.5973, -84.3734],
  Kalamazoo: [42.2453, -85.5314],
  Ottawa: [42.9843, -86.1186],
  Saginaw: [43.3266, -84.0558],
  "Grand Traverse": [44.6631, -85.5522],
  Marquette: [46.6553, -87.3953],
  Berrien: [41.9190, -86.4280],
  Monroe: [41.9196, -83.5441],
  Muskegon: [43.2688, -86.2386],
  "St. Clair": [42.9207, -82.6695],
  Livingston: [42.6020, -83.9116],
  Jackson: [42.2458, -84.4013],
  Calhoun: [42.2526, -85.0058],
  Eaton: [42.5956, -84.8383],
  Bay: [43.7413, -83.9855],
  Midland: [43.6428, -84.3675],
  Allegan: [42.5327, -85.8944],
  Lenawee: [41.8954, -84.0685],
  Clinton: [42.9438, -84.6010],
  Emmet: [45.5831, -84.9818],
  Isabella: [43.6413, -84.8457],
  Lapeer: [43.0819, -83.1620],
  Ionia: [42.9725, -85.0670],
  Alpena: [45.0617, -83.4571],
  Chippewa: [46.3282, -84.3679],
  Delta: [45.7907, -86.8571],
  Houghton: [46.9910, -88.5825],
};

/** Michigan geographic links by county */
export function getCountyLinks(county: string) {
  const slug = countyToSlug(county);
  return {
    michiganGov: `https://www.michigan.gov/som/about-michigan/michigan-counties/${slug}`,
    census: `https://data.census.gov/profile?g=050XX00US26${getCountyFIPS(county)}`,
    healthRankings: `https://www.countyhealthrankings.org/explore-health-rankings/michigan/${slug}`,
    unitedWay211: `https://www.211.org/get-help/zip-lookup`,
  };
}

function getCountyFIPS(county: string): string {
  const fipsMap: Record<string, string> = {
    Wayne: "163", Oakland: "125", Macomb: "099", Kent: "081", Genesee: "049",
    Washtenaw: "161", Ingham: "065", Kalamazoo: "077", Saginaw: "145", Ottawa: "139",
  };
  return fipsMap[county] || "000";
}
