/**
 * Michigan ZIP-to-County lookup — ~100 major ZIPs.
 * Sources: USPS, Census Bureau ZCTA-to-County crosswalk.
 */

export const ZIP_TO_COUNTY: Record<string, { city: string; county: string }> = {
  // ── From zip-quickstats.ts (30 ZIPs) ──
  "48201": { city: "Detroit", county: "Wayne" },
  "48126": { city: "Dearborn", county: "Wayne" },
  "48075": { city: "Southfield", county: "Oakland" },
  "48084": { city: "Troy", county: "Oakland" },
  "48154": { city: "Livonia", county: "Wayne" },
  "48067": { city: "Royal Oak", county: "Oakland" },
  "48103": { city: "Ann Arbor", county: "Washtenaw" },
  "49503": { city: "Grand Rapids", county: "Kent" },
  "49001": { city: "Kalamazoo", county: "Kalamazoo" },
  "48823": { city: "East Lansing", county: "Ingham" },
  "48912": { city: "Lansing", county: "Ingham" },
  "48502": { city: "Flint", county: "Genesee" },
  "48601": { city: "Saginaw", county: "Saginaw" },
  "49684": { city: "Traverse City", county: "Grand Traverse" },
  "49855": { city: "Marquette", county: "Marquette" },
  "48310": { city: "Sterling Heights", county: "Macomb" },
  "48009": { city: "Birmingham", county: "Oakland" },
  "48375": { city: "Novi", county: "Oakland" },
  "48197": { city: "Ypsilanti", county: "Washtenaw" },
  "49508": { city: "Wyoming", county: "Kent" },
  "48060": { city: "Port Huron", county: "St. Clair" },
  "49441": { city: "Muskegon", county: "Muskegon" },
  "49017": { city: "Battle Creek", county: "Calhoun" },
  "49201": { city: "Jackson", county: "Jackson" },
  "49423": { city: "Holland", county: "Ottawa" },
  "48640": { city: "Midland", county: "Midland" },
  "48162": { city: "Monroe", county: "Monroe" },
  "48340": { city: "Pontiac", county: "Oakland" },
  "48706": { city: "Bay City", county: "Bay" },
  "48203": { city: "Highland Park", county: "Wayne" },

  // ── Additional 70 major Michigan ZIPs ──
  // Wayne County
  "48124": { city: "Dearborn Heights", county: "Wayne" },
  "48146": { city: "Lincoln Park", county: "Wayne" },
  "48180": { city: "Taylor", county: "Wayne" },
  "48170": { city: "Plymouth", county: "Wayne" },
  "48228": { city: "Detroit (Westside)", county: "Wayne" },
  "48205": { city: "Detroit (Eastside)", county: "Wayne" },
  "48219": { city: "Detroit (Redford)", county: "Wayne" },
  "48235": { city: "Detroit (Northwest)", county: "Wayne" },
  "48185": { city: "Westland", county: "Wayne" },
  "48174": { city: "Romulus", county: "Wayne" },
  "48239": { city: "Redford Township", county: "Wayne" },
  "48122": { city: "Melvindale", county: "Wayne" },
  "48150": { city: "Livonia (West)", county: "Wayne" },

  // Oakland County
  "48335": { city: "Farmington Hills", county: "Oakland" },
  "48085": { city: "Rochester Hills", county: "Oakland" },
  "48071": { city: "Madison Heights", county: "Oakland" },
  "48034": { city: "Southfield (North)", county: "Oakland" },
  "48302": { city: "Bloomfield Hills", county: "Oakland" },
  "48328": { city: "Waterford", county: "Oakland" },
  "48346": { city: "Clarkston", county: "Oakland" },
  "48359": { city: "Lake Orion", county: "Oakland" },
  "48326": { city: "Auburn Hills", county: "Oakland" },
  "48390": { city: "Walled Lake", county: "Oakland" },

  // Macomb County
  "48043": { city: "Mt. Clemens", county: "Macomb" },
  "48035": { city: "Clinton Township", county: "Macomb" },
  "48038": { city: "Clinton Township (South)", county: "Macomb" },
  "48312": { city: "Sterling Heights (East)", county: "Macomb" },
  "48044": { city: "Macomb Township", county: "Macomb" },
  "48066": { city: "Roseville", county: "Macomb" },
  "48015": { city: "Center Line", county: "Macomb" },
  "48080": { city: "St. Clair Shores", county: "Macomb" },

  // Washtenaw County
  "48104": { city: "Ann Arbor (Central)", county: "Washtenaw" },
  "48105": { city: "Ann Arbor (North)", county: "Washtenaw" },
  "48176": { city: "Saline", county: "Washtenaw" },
  "48118": { city: "Chelsea", county: "Washtenaw" },

  // Kent County
  "49504": { city: "Grand Rapids (West)", county: "Kent" },
  "49546": { city: "Kentwood", county: "Kent" },
  "49525": { city: "Grand Rapids (North)", county: "Kent" },
  "49301": { city: "Ada", county: "Kent" },

  // Genesee County
  "48503": { city: "Flint (South)", county: "Genesee" },
  "48507": { city: "Flint (Southwest)", county: "Genesee" },
  "48439": { city: "Grand Blanc", county: "Genesee" },
  "48420": { city: "Davison", county: "Genesee" },

  // Ingham County
  "48910": { city: "Lansing (South)", county: "Ingham" },
  "48911": { city: "Lansing (Southwest)", county: "Ingham" },

  // Kalamazoo County
  "49007": { city: "Kalamazoo (West)", county: "Kalamazoo" },
  "49008": { city: "Kalamazoo (WMU)", county: "Kalamazoo" },
  "49024": { city: "Portage", county: "Kalamazoo" },

  // Ottawa County
  "49417": { city: "Grand Haven", county: "Ottawa" },
  "49464": { city: "Zeeland", county: "Ottawa" },

  // Berrien County
  "49022": { city: "Benton Harbor", county: "Berrien" },
  "49085": { city: "St. Joseph", county: "Berrien" },

  // Saginaw County
  "48602": { city: "Saginaw (West)", county: "Saginaw" },
  "48604": { city: "Saginaw Township", county: "Saginaw" },

  // Other notable cities
  "48801": { city: "Alma", county: "Gratiot" },
  "49770": { city: "Petoskey", county: "Emmet" },
  "49801": { city: "Iron Mountain", county: "Dickinson" },
  "49783": { city: "Sault Ste. Marie", county: "Chippewa" },
  "49938": { city: "Ironwood", county: "Gogebic" },
  "48653": { city: "Roscommon", county: "Roscommon" },
  "49686": { city: "Traverse City (East)", county: "Grand Traverse" },
  "48857": { city: "Owosso", county: "Shiawassee" },
  "48446": { city: "Lapeer", county: "Lapeer" },
  "49660": { city: "Manistee", county: "Manistee" },
  "49931": { city: "Houghton", county: "Houghton" },
  "48733": { city: "Frankenmuth", county: "Saginaw" },
  "48879": { city: "St. Johns", county: "Clinton" },
  "48813": { city: "Charlotte", county: "Eaton" },
  "49707": { city: "Alpena", county: "Alpena" },
  "48647": { city: "Mio", county: "Oscoda" },
  "49837": { city: "Gladstone", county: "Delta" },
  "48723": { city: "Caro", county: "Tuscola" },
  "49858": { city: "Menominee", county: "Menominee" },
};
