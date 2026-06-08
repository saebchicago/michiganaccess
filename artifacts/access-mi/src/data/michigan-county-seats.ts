/** Maps Michigan county names to their county seat / largest city for NPI API queries */
export const COUNTY_SEATS: Record<string, string> = {
  "Alcona": "Harrisville", "Alger": "Munising", "Allegan": "Allegan", "Alpena": "Alpena",
  "Antrim": "Bellaire", "Arenac": "Standish", "Baraga": "L'Anse", "Barry": "Hastings",
  "Bay": "Bay City", "Benzie": "Beulah", "Berrien": "St. Joseph", "Branch": "Coldwater",
  "Calhoun": "Battle Creek", "Cass": "Cassopolis", "Charlevoix": "Charlevoix", "Cheboygan": "Cheboygan",
  "Chippewa": "Sault Ste. Marie", "Clare": "Harrison", "Clinton": "St. Johns", "Crawford": "Grayling",
  "Delta": "Escanaba", "Dickinson": "Iron Mountain", "Eaton": "Charlotte", "Emmet": "Petoskey",
  "Genesee": "Flint", "Gladwin": "Gladwin", "Gogebic": "Bessemer", "Grand Traverse": "Traverse City",
  "Gratiot": "Ithaca", "Hillsdale": "Hillsdale", "Houghton": "Houghton", "Huron": "Bad Axe",
  "Ingham": "Lansing", "Ionia": "Ionia", "Iosco": "Tawas City", "Iron": "Crystal Falls",
  "Isabella": "Mt. Pleasant", "Jackson": "Jackson", "Kalamazoo": "Kalamazoo", "Kalkaska": "Kalkaska",
  "Kent": "Grand Rapids", "Keweenaw": "Eagle River", "Lake": "Baldwin", "Lapeer": "Lapeer",
  "Leelanau": "Leland", "Lenawee": "Adrian", "Livingston": "Howell", "Luce": "Newberry",
  "Mackinac": "St. Ignace", "Macomb": "Mt. Clemens", "Manistee": "Manistee", "Marquette": "Marquette",
  "Mason": "Ludington", "Mecosta": "Big Rapids", "Menominee": "Menominee", "Midland": "Midland",
  "Missaukee": "Lake City", "Monroe": "Monroe", "Montcalm": "Stanton", "Montmorency": "Atlanta",
  "Muskegon": "Muskegon", "Newaygo": "White Cloud", "Oakland": "Pontiac", "Oceana": "Hart",
  "Ogemaw": "West Branch", "Ontonagon": "Ontonagon", "Osceola": "Reed City", "Oscoda": "Mio",
  "Otsego": "Gaylord", "Ottawa": "Grand Haven", "Presque Isle": "Rogers City", "Roscommon": "Roscommon",
  "Saginaw": "Saginaw", "St. Clair": "Port Huron", "St. Joseph": "Centreville", "Sanilac": "Sandusky",
  "Schoolcraft": "Manistique", "Shiawassee": "Corunna", "Tuscola": "Caro", "Van Buren": "Paw Paw",
  "Washtenaw": "Ann Arbor", "Wayne": "Detroit", "Wexford": "Cadillac",
};

/** All 83 Michigan counties */
export const MICHIGAN_COUNTY_NAMES = Object.keys(COUNTY_SEATS);

/** Major Michigan cities with county and representative ZIP */
export interface MichiganCity {
  city: string;
  county: string;
  zip: string;
}

export const MICHIGAN_CITIES: MichiganCity[] = [
  { city: "Detroit", county: "Wayne", zip: "48201" },
  { city: "Grand Rapids", county: "Kent", zip: "49503" },
  { city: "Lansing", county: "Ingham", zip: "48933" },
  { city: "Ann Arbor", county: "Washtenaw", zip: "48104" },
  { city: "Flint", county: "Genesee", zip: "48502" },
  { city: "Kalamazoo", county: "Kalamazoo", zip: "49001" },
  { city: "Dearborn", county: "Wayne", zip: "48124" },
  { city: "Sterling Heights", county: "Macomb", zip: "48310" },
  { city: "Warren", county: "Macomb", zip: "48089" },
  { city: "Pontiac", county: "Oakland", zip: "48341" },
  { city: "Saginaw", county: "Saginaw", zip: "48601" },
  { city: "Muskegon", county: "Muskegon", zip: "49440" },
  { city: "Traverse City", county: "Grand Traverse", zip: "49684" },
  { city: "Marquette", county: "Marquette", zip: "49855" },
  { city: "Royal Oak", county: "Oakland", zip: "48067" },
  { city: "Troy", county: "Oakland", zip: "48083" },
  { city: "Auburn Hills", county: "Oakland", zip: "48326" },
  { city: "Southfield", county: "Oakland", zip: "48075" },
  { city: "Oak Park", county: "Oakland", zip: "48237" },
  { city: "Farmington Hills", county: "Oakland", zip: "48334" },
  { city: "Ypsilanti", county: "Washtenaw", zip: "48197" },
  { city: "Jackson", county: "Jackson", zip: "49201" },
  { city: "Bay City", county: "Bay", zip: "48706" },
  { city: "Midland", county: "Midland", zip: "48640" },
  { city: "Holland", county: "Ottawa", zip: "49423" },
  { city: "Battle Creek", county: "Calhoun", zip: "49017" },
  { city: "Mt. Pleasant", county: "Isabella", zip: "48858" },
  { city: "Alpena", county: "Alpena", zip: "49707" },
  { city: "Livonia", county: "Wayne", zip: "48150" },
  { city: "Canton", county: "Wayne", zip: "48187" },
  { city: "Wyoming", county: "Kent", zip: "49509" },
  { city: "Rochester Hills", county: "Oakland", zip: "48309" },
  { city: "Novi", county: "Oakland", zip: "48375" },
  { city: "Taylor", county: "Wayne", zip: "48180" },
  { city: "Westland", county: "Wayne", zip: "48185" },
  { city: "St. Clair Shores", county: "Macomb", zip: "48080" },
  { city: "Portage", county: "Kalamazoo", zip: "49002" },
  { city: "East Lansing", county: "Ingham", zip: "48823" },
  { city: "Roseville", county: "Macomb", zip: "48066" },
  { city: "Clinton Township", county: "Macomb", zip: "48035" },
  { city: "West Bloomfield", county: "Oakland", zip: "48322" },
  { city: "West Bloomfield Township", county: "Oakland", zip: "48322" },
];

/** ZIP prefix → county mapping for common Michigan ZIP codes */
export const ZIP_TO_COUNTY: Record<string, string> = {
  "480": "Wayne", "481": "Wayne", "482": "Wayne",
  "483": "Oakland", "484": "Genesee",
  "485": "Ingham", "486": "Saginaw", "487": "Bay",
  "488": "Gratiot", "489": "Kalamazoo",
  "490": "Kalamazoo", "491": "Kent",
  "492": "Jackson", "493": "Calhoun",
  "494": "Muskegon", "495": "Kent",
  "496": "Grand Traverse", "497": "Marquette",
  "498": "Chippewa", "499": "Iron",
};

/** Resolve a location input to NPI API params */
export function resolveLocation(input: string): { postal_code?: string; city?: string } {
  const trimmed = input.trim();
  if (!trimmed) return {};

  // 5-digit ZIP
  if (/^\d{5}$/.test(trimmed)) {
    return { postal_code: trimmed };
  }

  // County name match (case-insensitive)
  const countyMatch = MICHIGAN_COUNTY_NAMES.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase() ||
           `${c.toLowerCase()} county` === trimmed.toLowerCase()
  );
  if (countyMatch) {
    return { city: COUNTY_SEATS[countyMatch] };
  }

  // City name match - check MICHIGAN_CITIES first (includes suburbs)
  const cityLower = trimmed.toLowerCase();
  const cityMatch = MICHIGAN_CITIES.find(
    (c) => c.city.toLowerCase() === cityLower
  );
  if (cityMatch) {
    return { city: cityMatch.city };
  }

  // Partial city match against county seats
  const seatValues = Object.values(COUNTY_SEATS);
  const seatMatch = seatValues.find(
    (s) => s.toLowerCase().includes(cityLower) || cityLower.includes(s.toLowerCase())
  );
  if (seatMatch) {
    return { city: seatMatch };
  }

  // Partial city match against MICHIGAN_CITIES
  const partialCity = MICHIGAN_CITIES.find(
    (c) => c.city.toLowerCase().includes(cityLower) || cityLower.includes(c.city.toLowerCase())
  );
  if (partialCity) {
    return { city: partialCity.city };
  }

  // Default: treat as city
  return { city: trimmed };
}

/** Look up county from a ZIP code (full 5-digit match first, then 3-digit prefix) */
export function zipToCounty(zip: string): string | null {
  // Try exact city match first for accuracy
  const cityMatch = MICHIGAN_CITIES.find(c => c.zip === zip);
  if (cityMatch) return cityMatch.county;
  const prefix3 = zip.slice(0, 3);
  return ZIP_TO_COUNTY[prefix3] || null;
}
