// Population data: U.S. Census Bureau Population Estimates Program (PEP),
//   Vintage 2024 (POPESTIMATE2024). One vintage, one source, file-wide.
//   Refreshed via scripts/refresh-county-population.mjs from the public
//   co-est2024-alldata.csv release at census.gov. Do not edit individual
//   values by hand  -  re-run the script.
// Cities: largest municipalities per county.
// Health data: County Health Rankings & Roadmaps 2025 original release.
//   Uninsured rate:     Census Bureau SAHIE 2022 (CHR measure 85, primary federal source).
//   Primary care ratio: HRSA Area Health Resource File 2021 (CHR measure 4,
//                       primary federal source).
//   Food insecurity:    Feeding America Map the Meal Gap 2022 (CHR measure 139,
//                       a modeled estimate, not a primary federal source like
//                       SAHIE or AHRF).
//   Refreshed via scripts/refresh-county-health.mjs from the CHR public
//   measures API. Do not edit individual values by hand  -  re-run the script.
//   Trend arrows are only set when explicitly sourced from a multi-year
//   comparison. Values regenerated from a single CHR snapshot do not carry
//   a trend, by design.
import { MI_COUNTY_FIPS } from "@/data/census-geographies";

/**
 * Canonical population provenance label per D5. Use anywhere a
 * county.population value renders so readers can see the vintage at
 * point of use.
 */
export const COUNTY_POPULATION_SOURCE =
  "U.S. Census Bureau Population Estimates, Vintage 2024 [verified]";

/** Per-measure health source labels with real underlying vintages. */
export const COUNTY_UNINSURED_SOURCE =
  "County Health Rankings 2025 (SAHIE 2022)";
export const COUNTY_PCP_SOURCE = "County Health Rankings 2025 (AHRF 2021)";
export const COUNTY_FOOD_INSECURITY_SOURCE =
  "County Health Rankings 2025 (Map the Meal Gap 2022, modeled)";

export interface CountyProfile {
  population: number;
  majorCities: string[];
  countyType: "urban" | "suburban" | "rural";
  healthHighlights: {
    label: string;
    value: string;
    trend?: "up" | "down" | "stable";
  }[];
}

const h = (
  uninsured: string,
  pcratio: string,
  food: string,
  ut?: "up" | "down" | "stable",
  ft?: "up" | "down" | "stable",
): CountyProfile["healthHighlights"] => [
  { label: "Uninsured rate", value: uninsured, trend: ut },
  { label: "Primary care ratio", value: pcratio },
  { label: "Food insecurity", value: food, trend: ft },
];

export const COUNTY_PROFILES: Record<string, CountyProfile> = {
  // ── Metro / Urban ──
  Wayne: {
    population: 1771063,
    majorCities: ["Detroit", "Dearborn", "Livonia", "Westland"],
    countyType: "urban",
    healthHighlights: h("5.7%", "1,426:1", "15.4%"),
  },
  Oakland: {
    population: 1296888,
    majorCities: [
      "Troy",
      "Southfield",
      "Farmington Hills",
      "Royal Oak",
      "West Bloomfield Twp",
    ],
    countyType: "suburban",
    healthHighlights: h("4.7%", "726:1", "11.0%"),
  },
  Macomb: {
    population: 886175,
    majorCities: ["Warren", "Sterling Heights", "Clinton Twp", "Shelby Twp"],
    countyType: "suburban",
    healthHighlights: h("5.5%", "1,842:1", "12.6%"),
  },
  Kent: {
    population: 673002,
    majorCities: ["Grand Rapids", "Wyoming", "Kentwood", "Walker"],
    countyType: "urban",
    healthHighlights: h("5.5%", "1,068:1", "12.4%"),
  },
  Genesee: {
    population: 402279,
    majorCities: ["Flint", "Burton", "Davison", "Grand Blanc"],
    countyType: "urban",
    healthHighlights: h("5.2%", "1,207:1", "16.0%"),
  },
  Washtenaw: {
    population: 373875,
    majorCities: ["Ann Arbor", "Ypsilanti", "Saline", "Dexter"],
    countyType: "suburban",
    healthHighlights: h("4.3%", "563:1", "12.5%"),
  },
  Ingham: {
    population: 290427,
    majorCities: ["Lansing", "East Lansing", "Meridian Twp", "Holt"],
    countyType: "urban",
    healthHighlights: h("5.8%", "866:1", "14.9%"),
  },
  Kalamazoo: {
    population: 264780,
    majorCities: ["Kalamazoo", "Portage", "Oshtemo Twp", "Comstock Twp"],
    countyType: "urban",
    healthHighlights: h("5.1%", "1,012:1", "13.5%"),
  },
  Saginaw: {
    population: 187714,
    majorCities: ["Saginaw", "Saginaw Twp", "Thomas Twp", "Bridgeport"],
    countyType: "urban",
    healthHighlights: h("5.5%", "1,156:1", "16.5%"),
  },

  // ── Suburban ──
  Ottawa: {
    population: 306235,
    majorCities: ["Holland", "Grand Haven", "Zeeland", "Hudsonville"],
    countyType: "suburban",
    healthHighlights: h("4.6%", "1,511:1", "10.9%"),
  },
  Muskegon: {
    population: 177428,
    majorCities: ["Muskegon", "Norton Shores", "Muskegon Heights"],
    countyType: "suburban",
    healthHighlights: h("5.1%", "1,783:1", "14.1%"),
  },
  "St. Clair": {
    population: 160308,
    majorCities: ["Port Huron", "Marysville", "Fort Gratiot"],
    countyType: "suburban",
    healthHighlights: h("4.9%", "2,286:1", "14.4%"),
  },
  Livingston: {
    population: 196976,
    majorCities: ["Howell", "Brighton", "Hartland"],
    countyType: "suburban",
    healthHighlights: h("3.8%", "2,031:1", "10.1%"),
  },
  Monroe: {
    population: 156045,
    majorCities: ["Monroe", "Dundee", "Temperance"],
    countyType: "suburban",
    healthHighlights: h("4.9%", "2,823:1", "14.0%"),
  },
  Jackson: {
    population: 160233,
    majorCities: ["Jackson", "Summit Twp", "Blackman Twp"],
    countyType: "suburban",
    healthHighlights: h("5.6%", "2,320:1", "14.3%"),
  },
  Berrien: {
    population: 152703,
    majorCities: ["St. Joseph", "Benton Harbor", "Niles"],
    countyType: "suburban",
    healthHighlights: h("6.9%", "1,255:1", "14.9%"),
  },
  Calhoun: {
    population: 133785,
    majorCities: ["Battle Creek", "Marshall", "Albion"],
    countyType: "suburban",
    healthHighlights: h("6.2%", "1,738:1", "15.1%"),
  },
  Eaton: {
    population: 109494,
    majorCities: ["Charlotte", "Delta Twp", "Grand Ledge"],
    countyType: "suburban",
    healthHighlights: h("4.8%", "3,026:1", "12.8%"),
  },
  Bay: {
    population: 102651,
    majorCities: ["Bay City", "Essexville", "Hampton Twp"],
    countyType: "suburban",
    healthHighlights: h("5.7%", "2,239:1", "16.2%"),
  },
  Midland: {
    population: 84022,
    majorCities: ["Midland", "Coleman", "Sanford"],
    countyType: "suburban",
    healthHighlights: h("4.8%", "994:1", "13.7%"),
  },
  "Van Buren": {
    population: 76129,
    majorCities: ["South Haven", "Paw Paw", "Hartford"],
    countyType: "rural",
    healthHighlights: h("7.3%", "1,991:1", "15.0%"),
  },
  Shiawassee: {
    population: 67982,
    majorCities: ["Owosso", "Durand", "Corunna"],
    countyType: "rural",
    healthHighlights: h("5.5%", "2,715:1", "14.7%"),
  },
  Barry: {
    population: 64025,
    majorCities: ["Hastings", "Nashville", "Middleville"],
    countyType: "rural",
    healthHighlights: h("5.5%", "3,315:1", "12.5%"),
  },
  Gratiot: {
    population: 41372,
    majorCities: ["Alma", "Ithaca", "St. Louis"],
    countyType: "rural",
    healthHighlights: h("5.1%", "2,077:1", "15.3%"),
  },
  Tuscola: {
    population: 52757,
    majorCities: ["Caro", "Vassar", "Cass City"],
    countyType: "rural",
    healthHighlights: h("5.9%", "3,307:1", "15.7%"),
  },

  // ── Rural / Northern / UP ──
  "Grand Traverse": {
    population: 96625,
    majorCities: ["Traverse City", "Garfield Twp"],
    countyType: "rural",
    healthHighlights: h("5.7%", "755:1", "13.4%"),
  },
  Marquette: {
    population: 67979,
    majorCities: ["Marquette", "Ishpeming", "Negaunee"],
    countyType: "rural",
    healthHighlights: h("5.9%", "870:1", "15.0%"),
  },
  Lapeer: {
    population: 89168,
    majorCities: ["Lapeer", "Imlay City", "Dryden"],
    countyType: "rural",
    healthHighlights: h("5.7%", "2,766:1", "13.4%"),
  },
  Allegan: {
    population: 122429,
    majorCities: ["Allegan", "Plainwell", "Wayland"],
    countyType: "rural",
    healthHighlights: h("5.7%", "4,838:1", "12.1%"),
  },
  Lenawee: {
    population: 97746,
    majorCities: ["Adrian", "Tecumseh", "Blissfield"],
    countyType: "rural",
    healthHighlights: h("5.4%", "4,498:1", "13.8%"),
  },
  Clinton: {
    population: 80050,
    majorCities: ["St. Johns", "DeWitt", "Bath"],
    countyType: "rural",
    healthHighlights: h("4.4%", "3,309:1", "12.2%"),
  },
  Emmet: {
    population: 33949,
    majorCities: ["Petoskey", "Harbor Springs"],
    countyType: "rural",
    healthHighlights: h("6.5%", "856:1", "13.7%"),
  },
  Isabella: {
    population: 65072,
    majorCities: ["Mt. Pleasant", "Shepherd"],
    countyType: "rural",
    healthHighlights: h("6.6%", "2,025:1", "17.6%"),
  },
  Ionia: {
    population: 66250,
    majorCities: ["Ionia", "Portland", "Belding"],
    countyType: "rural",
    healthHighlights: h("5.8%", "3,953:1", "13.3%"),
  },
  Alcona: {
    population: 10624,
    majorCities: ["Harrisville", "Lincoln"],
    countyType: "rural",
    healthHighlights: h("7.1%", "2,047:1", "18.1%"),
  },
  Alger: {
    population: 8695,
    majorCities: ["Munising", "Chatham"],
    countyType: "rural",
    healthHighlights: h("6.0%", "1,260:1", "15.6%"),
  },
  Alpena: {
    population: 28903,
    majorCities: ["Alpena", "Ossineke"],
    countyType: "rural",
    healthHighlights: h("6.2%", "1,313:1", "17.6%"),
  },
  Antrim: {
    population: 24536,
    majorCities: ["Bellaire", "Elk Rapids", "Mancelona"],
    countyType: "rural",
    healthHighlights: h("6.8%", "1,488:1", "14.0%"),
  },
  Arenac: {
    population: 15087,
    majorCities: ["Standish", "Omer"],
    countyType: "rural",
    healthHighlights: h("6.4%", "2,496:1", "17.3%"),
  },
  Baraga: {
    population: 8169,
    majorCities: ["Baraga", "L'Anse"],
    countyType: "rural",
    healthHighlights: h("6.6%", "1,369:1", "16.6%"),
  },
  Benzie: {
    population: 18520,
    majorCities: ["Beulah", "Frankfort", "Benzonia"],
    countyType: "rural",
    healthHighlights: h("6.8%", "1,657:1", "14.1%"),
  },
  Branch: {
    population: 46187,
    majorCities: ["Coldwater", "Bronson", "Quincy"],
    countyType: "rural",
    healthHighlights: h("8.2%", "2,812:1", "15.3%"),
  },
  Cass: {
    population: 51550,
    majorCities: ["Dowagiac", "Cassopolis", "Edwardsburg"],
    countyType: "rural",
    healthHighlights: h("6.9%", "4,680:1", "14.6%"),
  },
  Charlevoix: {
    population: 26105,
    majorCities: ["Charlevoix", "Boyne City", "East Jordan"],
    countyType: "rural",
    healthHighlights: h("6.2%", "1,186:1", "13.3%"),
  },
  Cheboygan: {
    population: 25964,
    majorCities: ["Cheboygan", "Indian River"],
    countyType: "rural",
    healthHighlights: h("7.5%", "1,839:1", "17.0%"),
  },
  Chippewa: {
    population: 36253,
    majorCities: ["Sault Ste. Marie", "Kinross"],
    countyType: "rural",
    healthHighlights: h("7.5%", "1,416:1", "17.4%"),
  },
  Clare: {
    population: 31405,
    majorCities: ["Clare", "Harrison"],
    countyType: "rural",
    healthHighlights: h("8.3%", "3,452:1", "20.6%"),
  },
  Crawford: {
    population: 13599,
    majorCities: ["Grayling", "Roscommon"],
    countyType: "rural",
    healthHighlights: h("6.1%", "1,320:1", "17.7%"),
  },
  Delta: {
    population: 36687,
    majorCities: ["Escanaba", "Gladstone"],
    countyType: "rural",
    healthHighlights: h("6.3%", "1,228:1", "16.3%"),
  },
  Dickinson: {
    population: 25995,
    majorCities: ["Iron Mountain", "Kingsford"],
    countyType: "rural",
    healthHighlights: h("5.1%", "1,357:1", "14.0%"),
  },
  Gladwin: {
    population: 25995,
    majorCities: ["Gladwin", "Beaverton"],
    countyType: "rural",
    healthHighlights: h("7.7%", "6,371:1", "16.8%"),
  },
  Gogebic: {
    population: 14217,
    majorCities: ["Ironwood", "Bessemer", "Wakefield"],
    countyType: "rural",
    healthHighlights: h("6.1%", "1,197:1", "16.0%"),
  },
  Hillsdale: {
    population: 45590,
    majorCities: ["Hillsdale", "Jonesville", "Litchfield"],
    countyType: "rural",
    healthHighlights: h("6.6%", "5,061:1", "15.6%"),
  },
  Houghton: {
    population: 38041,
    majorCities: ["Houghton", "Hancock", "Calumet"],
    countyType: "rural",
    healthHighlights: h("6.3%", "1,435:1", "15.0%"),
  },
  Huron: {
    population: 30780,
    majorCities: ["Bad Axe", "Harbor Beach", "Caseville"],
    countyType: "rural",
    healthHighlights: h("7.0%", "1,736:1", "14.7%"),
  },
  Iosco: {
    population: 25361,
    majorCities: ["Tawas City", "East Tawas", "Oscoda"],
    countyType: "rural",
    healthHighlights: h("6.4%", "3,171:1", "17.8%"),
  },
  Iron: {
    population: 11709,
    majorCities: ["Iron River", "Crystal Falls"],
    countyType: "rural",
    healthHighlights: h("7.7%", "1,454:1", "17.2%"),
  },
  Kalkaska: {
    population: 18618,
    majorCities: ["Kalkaska", "Rapid City"],
    countyType: "rural",
    healthHighlights: h("7.3%", "4,495:1", "16.6%"),
  },
  Keweenaw: {
    population: 2161,
    majorCities: ["Mohawk", "Ahmeek"],
    countyType: "rural",
    healthHighlights: h("4.8%", "-", "12.8%"),
  },
  Lake: {
    population: 13005,
    majorCities: ["Baldwin", "Luther"],
    countyType: "rural",
    healthHighlights: h("7.6%", "12,308:1", "19.8%"),
  },
  Leelanau: {
    population: 22871,
    majorCities: ["Leland", "Suttons Bay", "Empire"],
    countyType: "rural",
    healthHighlights: h("6.6%", "2,262:1", "11.8%"),
  },
  Luce: {
    population: 6328,
    majorCities: ["Newberry", "McMillan"],
    countyType: "rural",
    healthHighlights: h("6.4%", "758:1", "18.5%"),
  },
  Mackinac: {
    population: 11144,
    majorCities: ["St. Ignace", "Mackinac Island"],
    countyType: "rural",
    healthHighlights: h("10.8%", "1,558:1", "18.7%"),
  },
  Manistee: {
    population: 25519,
    majorCities: ["Manistee", "Onekama"],
    countyType: "rural",
    healthHighlights: h("7.0%", "1,950:1", "15.3%"),
  },
  Mason: {
    population: 29093,
    majorCities: ["Ludington", "Scottville"],
    countyType: "rural",
    healthHighlights: h("5.5%", "1,278:1", "15.9%"),
  },
  Mecosta: {
    population: 41947,
    majorCities: ["Big Rapids", "Morley", "Stanwood"],
    countyType: "rural",
    healthHighlights: h("6.8%", "2,107:1", "16.6%"),
  },
  Menominee: {
    population: 23050,
    majorCities: ["Menominee", "Stephenson"],
    countyType: "rural",
    healthHighlights: h("6.3%", "2,912:1", "14.5%"),
  },
  Missaukee: {
    population: 15239,
    majorCities: ["Lake City", "McBain"],
    countyType: "rural",
    healthHighlights: h("8.1%", "5,043:1", "15.3%"),
  },
  Montcalm: {
    population: 69314,
    majorCities: ["Greenville", "Stanton", "Howard City"],
    countyType: "rural",
    healthHighlights: h("7.3%", "3,201:1", "14.7%"),
  },
  Montmorency: {
    population: 9828,
    majorCities: ["Atlanta", "Hillman"],
    countyType: "rural",
    healthHighlights: h("7.7%", "1,328:1", "20.2%"),
  },
  Newaygo: {
    population: 51504,
    majorCities: ["Newaygo", "Fremont", "White Cloud"],
    countyType: "rural",
    healthHighlights: h("7.0%", "2,794:1", "16.2%"),
  },
  Oceana: {
    population: 27014,
    majorCities: ["Hart", "Shelby", "Pentwater"],
    countyType: "rural",
    healthHighlights: h("7.4%", "2,063:1", "16.4%"),
  },
  Ogemaw: {
    population: 20985,
    majorCities: ["West Branch", "Rose City"],
    countyType: "rural",
    healthHighlights: h("7.4%", "6,909:1", "18.8%"),
  },
  Ontonagon: {
    population: 5824,
    majorCities: ["Ontonagon", "White Pine"],
    countyType: "rural",
    healthHighlights: h("7.1%", "2,934:1", "17.3%"),
  },
  Osceola: {
    population: 23484,
    majorCities: ["Reed City", "Evart", "Hersey"],
    countyType: "rural",
    healthHighlights: h("6.7%", "3,301:1", "16.7%"),
  },
  Oscoda: {
    population: 8596,
    majorCities: ["Mio", "Comins"],
    countyType: "rural",
    healthHighlights: h("9.7%", "8,311:1", "18.3%"),
  },
  Otsego: {
    population: 26083,
    majorCities: ["Gaylord", "Johannesburg"],
    countyType: "rural",
    healthHighlights: h("6.7%", "1,150:1", "15.1%"),
  },
  "Presque Isle": {
    population: 13230,
    majorCities: ["Rogers City", "Onaway"],
    countyType: "rural",
    healthHighlights: h("6.4%", "6,547:1", "16.7%"),
  },
  Roscommon: {
    population: 23932,
    majorCities: ["Roscommon", "Houghton Lake", "Prudenville"],
    countyType: "rural",
    healthHighlights: h("6.7%", "2,148:1", "19.6%"),
  },
  Sanilac: {
    population: 40293,
    majorCities: ["Sandusky", "Croswell", "Marlette"],
    countyType: "rural",
    healthHighlights: h("6.7%", "3,116:1", "16.6%"),
  },
  Schoolcraft: {
    population: 8178,
    majorCities: ["Manistique", "Germfask"],
    countyType: "rural",
    healthHighlights: h("7.2%", "1,338:1", "18.5%"),
  },
  "St. Joseph": {
    population: 61171,
    majorCities: ["Sturgis", "Three Rivers", "Centreville"],
    countyType: "rural",
    healthHighlights: h("7.7%", "3,574:1", "15.3%"),
  },
  Wexford: {
    population: 34460,
    majorCities: ["Cadillac", "Manton"],
    countyType: "rural",
    healthHighlights: h("6.9%", "1,169:1", "15.8%"),
  },
};

// Default profile for any unlisted county
export const DEFAULT_PROFILE: CountyProfile = {
  population: 0,
  majorCities: [],
  countyType: "rural",
  healthHighlights: h("~6.5%", "Varies", "~13%"),
};

export function getCountyProfile(county: string): CountyProfile {
  return COUNTY_PROFILES[county] || DEFAULT_PROFILE;
}

/** Structured county record used by data-integrity tests and analytics. */
export interface MichiganCountyProfileEntry {
  name: string;
  fips: string;
  health: { diabetes_prevalence: number | null };
}

/** Array of all 83 Michigan counties with FIPS codes and basic health stub. */
export const MICHIGAN_COUNTY_PROFILES: MichiganCountyProfileEntry[] =
  Object.keys(COUNTY_PROFILES).map((name) => ({
    name,
    fips: `26${MI_COUNTY_FIPS[name] ?? "000"}`,
    health: { diabetes_prevalence: null },
  }));

/** Michigan statewide averages for reference comparisons. */
export const MI_AVERAGE: MichiganCountyProfileEntry = {
  name: "Michigan",
  fips: "26",
  health: { diabetes_prevalence: 10.7 },
};
