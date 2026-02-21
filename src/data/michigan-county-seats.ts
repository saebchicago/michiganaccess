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

  // Default: treat as city
  return { city: trimmed };
}
