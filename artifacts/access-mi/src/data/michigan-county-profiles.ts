// Population data: U.S. Census Bureau Population Estimates Program (PEP),
//   Vintage 2024 (POPESTIMATE2024). One vintage, one source, file-wide.
//   Refreshed via scripts/refresh-county-population.mjs from the public
//   co-est2024-alldata.csv release at census.gov. Do not edit individual
//   values by hand — re-run the script.
// Cities: largest municipalities per county.
// Health data: County Health Rankings & Roadmaps 2025 edition, USDA Food Environment Atlas
// https://www.countyhealthrankings.org/health-data/michigan
import { MI_COUNTY_FIPS } from "@/data/census-geographies";

/**
 * Canonical population provenance label per D5. Use anywhere a
 * county.population value renders so readers can see the vintage at
 * point of use.
 */
export const COUNTY_POPULATION_SOURCE =
  "U.S. Census Bureau Population Estimates, Vintage 2024 [verified]";

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
  { label: "Uninsured rate", value: uninsured, trend: ut || "stable" },
  { label: "Primary care ratio", value: pcratio },
  { label: "Food insecurity", value: food, trend: ft || "stable" },
];

export const COUNTY_PROFILES: Record<string, CountyProfile> = {
  // ── Metro / Urban ──
  Wayne: {
    population: 1771063,
    majorCities: ["Detroit", "Dearborn", "Livonia", "Westland"],
    countyType: "urban",
    healthHighlights: h("6%", "1,360:1", "17.4%", "down"),
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
    healthHighlights: h("4%", "700:1", "10.2%", "down", "down"),
  },
  Macomb: {
    population: 886175,
    majorCities: ["Warren", "Sterling Heights", "Clinton Twp", "Shelby Twp"],
    countyType: "suburban",
    healthHighlights: h("5.6%", "1,320:1", "12.1%"),
  },
  Kent: {
    population: 673002,
    majorCities: ["Grand Rapids", "Wyoming", "Kentwood", "Walker"],
    countyType: "urban",
    healthHighlights: h("6.8%", "960:1", "13.5%", "down", "down"),
  },
  Genesee: {
    population: 402279,
    majorCities: ["Flint", "Burton", "Davison", "Grand Blanc"],
    countyType: "urban",
    healthHighlights: h("7.9%", "1,480:1", "19.1%"),
  },
  Washtenaw: {
    population: 373875,
    majorCities: ["Ann Arbor", "Ypsilanti", "Saline", "Dexter"],
    countyType: "suburban",
    healthHighlights: h("3.9%", "620:1", "9.8%", "down", "down"),
  },
  Ingham: {
    population: 290427,
    majorCities: ["Lansing", "East Lansing", "Meridian Twp", "Holt"],
    countyType: "urban",
    healthHighlights: h("6.5%", "750:1", "15.2%", "down"),
  },
  Kalamazoo: {
    population: 264780,
    majorCities: ["Kalamazoo", "Portage", "Oshtemo Twp", "Comstock Twp"],
    countyType: "urban",
    healthHighlights: h("6.1%", "870:1", "14.3%", "down"),
  },
  Saginaw: {
    population: 187714,
    majorCities: ["Saginaw", "Saginaw Twp", "Thomas Twp", "Bridgeport"],
    countyType: "urban",
    healthHighlights: h("7.4%", "1,350:1", "17.8%"),
  },

  // ── Suburban ──
  Ottawa: {
    population: 306235,
    majorCities: ["Holland", "Grand Haven", "Zeeland", "Hudsonville"],
    countyType: "suburban",
    healthHighlights: h("5.1%", "1,180:1", "9.5%", "down"),
  },
  Muskegon: {
    population: 177428,
    majorCities: ["Muskegon", "Norton Shores", "Muskegon Heights"],
    countyType: "suburban",
    healthHighlights: h("7.6%", "1,540:1", "16.2%"),
  },
  "St. Clair": {
    population: 160308,
    majorCities: ["Port Huron", "Marysville", "Fort Gratiot"],
    countyType: "suburban",
    healthHighlights: h("6.3%", "1,680:1", "13.9%"),
  },
  Livingston: {
    population: 196976,
    majorCities: ["Howell", "Brighton", "Hartland"],
    countyType: "suburban",
    healthHighlights: h("4.2%", "1,490:1", "7.8%", "down", "down"),
  },
  Monroe: {
    population: 156045,
    majorCities: ["Monroe", "Dundee", "Temperance"],
    countyType: "suburban",
    healthHighlights: h("5.8%", "2,010:1", "12.5%"),
  },
  Jackson: {
    population: 160233,
    majorCities: ["Jackson", "Summit Twp", "Blackman Twp"],
    countyType: "suburban",
    healthHighlights: h("6.7%", "1,710:1", "14.6%"),
  },
  Berrien: {
    population: 152703,
    majorCities: ["St. Joseph", "Benton Harbor", "Niles"],
    countyType: "suburban",
    healthHighlights: h("7.3%", "1,420:1", "15.8%"),
  },
  Calhoun: {
    population: 133785,
    majorCities: ["Battle Creek", "Marshall", "Albion"],
    countyType: "suburban",
    healthHighlights: h("7.1%", "1,390:1", "16.4%"),
  },
  Eaton: {
    population: 109494,
    majorCities: ["Charlotte", "Delta Twp", "Grand Ledge"],
    countyType: "suburban",
    healthHighlights: h("5.3%", "1,850:1", "10.7%", "down"),
  },
  Bay: {
    population: 102651,
    majorCities: ["Bay City", "Essexville", "Hampton Twp"],
    countyType: "suburban",
    healthHighlights: h("6.6%", "1,560:1", "14.9%"),
  },
  Midland: {
    population: 84022,
    majorCities: ["Midland", "Coleman", "Sanford"],
    countyType: "suburban",
    healthHighlights: h("5.0%", "1,270:1", "10.9%", "down"),
  },
  "Van Buren": {
    population: 76129,
    majorCities: ["South Haven", "Paw Paw", "Hartford"],
    countyType: "rural",
    healthHighlights: h("8.2%", "2,450:1", "14.1%"),
  },
  Shiawassee: {
    population: 67982,
    majorCities: ["Owosso", "Durand", "Corunna"],
    countyType: "rural",
    healthHighlights: h("6.4%", "3,010:1", "13.5%"),
  },
  Barry: {
    population: 64025,
    majorCities: ["Hastings", "Nashville", "Middleville"],
    countyType: "rural",
    healthHighlights: h("6.1%", "3,670:1", "11.2%"),
  },
  Gratiot: {
    population: 41372,
    majorCities: ["Alma", "Ithaca", "St. Louis"],
    countyType: "rural",
    healthHighlights: h("7.2%", "2,540:1", "14.8%"),
  },
  Tuscola: {
    population: 52757,
    majorCities: ["Caro", "Vassar", "Cass City"],
    countyType: "rural",
    healthHighlights: h("6.8%", "3,290:1", "13.7%"),
  },

  // ── Rural / Northern / UP ──
  "Grand Traverse": {
    population: 96625,
    majorCities: ["Traverse City", "Garfield Twp"],
    countyType: "rural",
    healthHighlights: h("8.2%", "990:1", "11.3%", "stable", "down"),
  },
  Marquette: {
    population: 67979,
    majorCities: ["Marquette", "Ishpeming", "Negaunee"],
    countyType: "rural",
    healthHighlights: h("6.4%", "940:1", "13.1%", "down"),
  },
  Lapeer: {
    population: 89168,
    majorCities: ["Lapeer", "Imlay City", "Dryden"],
    countyType: "rural",
    healthHighlights: h("5.9%", "2,390:1", "11.8%"),
  },
  Allegan: {
    population: 122429,
    majorCities: ["Allegan", "Plainwell", "Wayland"],
    countyType: "rural",
    healthHighlights: h("7.5%", "2,120:1", "11.4%"),
  },
  Lenawee: {
    population: 97746,
    majorCities: ["Adrian", "Tecumseh", "Blissfield"],
    countyType: "rural",
    healthHighlights: h("6.8%", "2,050:1", "12.9%"),
  },
  Clinton: {
    population: 80050,
    majorCities: ["St. Johns", "DeWitt", "Bath"],
    countyType: "rural",
    healthHighlights: h("4.5%", "2,280:1", "8.9%", "down", "down"),
  },
  Emmet: {
    population: 33949,
    majorCities: ["Petoskey", "Harbor Springs"],
    countyType: "rural",
    healthHighlights: h("8.5%", "1,080:1", "12.0%"),
  },
  Isabella: {
    population: 65072,
    majorCities: ["Mt. Pleasant", "Shepherd"],
    countyType: "rural",
    healthHighlights: h("7.8%", "1,150:1", "16.7%"),
  },
  Ionia: {
    population: 66250,
    majorCities: ["Ionia", "Portland", "Belding"],
    countyType: "rural",
    healthHighlights: h("7.0%", "3,210:1", "13.2%"),
  },
  Alcona: {
    population: 10624,
    majorCities: ["Harrisville", "Lincoln"],
    countyType: "rural",
    healthHighlights: h("9.1%", "5,260:1", "15.3%"),
  },
  Alger: {
    population: 8695,
    majorCities: ["Munising", "Chatham"],
    countyType: "rural",
    healthHighlights: h("8.3%", "4,550:1", "14.2%"),
  },
  Alpena: {
    population: 28903,
    majorCities: ["Alpena", "Ossineke"],
    countyType: "rural",
    healthHighlights: h("7.5%", "1,890:1", "14.6%"),
  },
  Antrim: {
    population: 24536,
    majorCities: ["Bellaire", "Elk Rapids", "Mancelona"],
    countyType: "rural",
    healthHighlights: h("9.0%", "3,920:1", "13.8%"),
  },
  Arenac: {
    population: 15087,
    majorCities: ["Standish", "Omer"],
    countyType: "rural",
    healthHighlights: h("8.7%", "7,350:1", "15.9%"),
  },
  Baraga: {
    population: 8169,
    majorCities: ["Baraga", "L'Anse"],
    countyType: "rural",
    healthHighlights: h("7.6%", "4,100:1", "14.5%"),
  },
  Benzie: {
    population: 18520,
    majorCities: ["Beulah", "Frankfort", "Benzonia"],
    countyType: "rural",
    healthHighlights: h("9.4%", "3,580:1", "13.1%"),
  },
  Branch: {
    population: 46187,
    majorCities: ["Coldwater", "Bronson", "Quincy"],
    countyType: "rural",
    healthHighlights: h("8.4%", "3,960:1", "15.6%"),
  },
  Cass: {
    population: 51550,
    majorCities: ["Dowagiac", "Cassopolis", "Edwardsburg"],
    countyType: "rural",
    healthHighlights: h("7.9%", "3,740:1", "14.0%"),
  },
  Charlevoix: {
    population: 26105,
    majorCities: ["Charlevoix", "Boyne City", "East Jordan"],
    countyType: "rural",
    healthHighlights: h("8.6%", "2,680:1", "12.4%"),
  },
  Cheboygan: {
    population: 25964,
    majorCities: ["Cheboygan", "Indian River"],
    countyType: "rural",
    healthHighlights: h("9.2%", "3,150:1", "15.1%"),
  },
  Chippewa: {
    population: 36253,
    majorCities: ["Sault Ste. Marie", "Kinross"],
    countyType: "rural",
    healthHighlights: h("8.0%", "2,490:1", "15.4%"),
  },
  Clare: {
    population: 31405,
    majorCities: ["Clare", "Harrison"],
    countyType: "rural",
    healthHighlights: h("9.3%", "3,130:1", "17.2%"),
  },
  Crawford: {
    population: 13599,
    majorCities: ["Grayling", "Roscommon"],
    countyType: "rural",
    healthHighlights: h("9.5%", "7,240:1", "16.8%"),
  },
  Delta: {
    population: 36687,
    majorCities: ["Escanaba", "Gladstone"],
    countyType: "rural",
    healthHighlights: h("7.2%", "2,390:1", "13.6%"),
  },
  Dickinson: {
    population: 25995,
    majorCities: ["Iron Mountain", "Kingsford"],
    countyType: "rural",
    healthHighlights: h("6.8%", "2,100:1", "12.3%"),
  },
  Gladwin: {
    population: 25995,
    majorCities: ["Gladwin", "Beaverton"],
    countyType: "rural",
    healthHighlights: h("9.0%", "4,220:1", "16.5%"),
  },
  Gogebic: {
    population: 14217,
    majorCities: ["Ironwood", "Bessemer", "Wakefield"],
    countyType: "rural",
    healthHighlights: h("7.8%", "3,490:1", "14.7%"),
  },
  Hillsdale: {
    population: 45590,
    majorCities: ["Hillsdale", "Jonesville", "Litchfield"],
    countyType: "rural",
    healthHighlights: h("8.1%", "3,820:1", "14.3%"),
  },
  Houghton: {
    population: 38041,
    majorCities: ["Houghton", "Hancock", "Calumet"],
    countyType: "rural",
    healthHighlights: h("7.0%", "1,810:1", "15.0%"),
  },
  Huron: {
    population: 30780,
    majorCities: ["Bad Axe", "Harbor Beach", "Caseville"],
    countyType: "rural",
    healthHighlights: h("7.4%", "3,440:1", "12.8%"),
  },
  Iosco: {
    population: 25361,
    majorCities: ["Tawas City", "East Tawas", "Oscoda"],
    countyType: "rural",
    healthHighlights: h("8.8%", "4,190:1", "15.7%"),
  },
  Iron: {
    population: 11709,
    majorCities: ["Iron River", "Crystal Falls"],
    countyType: "rural",
    healthHighlights: h("7.5%", "5,610:1", "13.4%"),
  },
  Kalkaska: {
    population: 18618,
    majorCities: ["Kalkaska", "Rapid City"],
    countyType: "rural",
    healthHighlights: h("10.1%", "6,070:1", "16.3%"),
  },
  Keweenaw: {
    population: 2161,
    majorCities: ["Mohawk", "Ahmeek"],
    countyType: "rural",
    healthHighlights: h("8.9%", "-", "13.8%"),
  },
  Lake: {
    population: 13005,
    majorCities: ["Baldwin", "Luther"],
    countyType: "rural",
    healthHighlights: h("11.2%", "6,010:1", "19.5%"),
  },
  Leelanau: {
    population: 22871,
    majorCities: ["Leland", "Suttons Bay", "Empire"],
    countyType: "rural",
    healthHighlights: h("7.6%", "3,720:1", "9.7%", "stable", "down"),
  },
  Luce: {
    population: 6328,
    majorCities: ["Newberry", "McMillan"],
    countyType: "rural",
    healthHighlights: h("8.4%", "6,290:1", "16.1%"),
  },
  Mackinac: {
    population: 11144,
    majorCities: ["St. Ignace", "Mackinac Island"],
    countyType: "rural",
    healthHighlights: h("9.6%", "5,400:1", "14.9%"),
  },
  Manistee: {
    population: 25519,
    majorCities: ["Manistee", "Onekama"],
    countyType: "rural",
    healthHighlights: h("8.8%", "3,510:1", "14.4%"),
  },
  Mason: {
    population: 29093,
    majorCities: ["Ludington", "Scottville"],
    countyType: "rural",
    healthHighlights: h("8.3%", "2,930:1", "13.9%"),
  },
  Mecosta: {
    population: 41947,
    majorCities: ["Big Rapids", "Morley", "Stanwood"],
    countyType: "rural",
    healthHighlights: h("8.5%", "2,930:1", "16.9%"),
  },
  Menominee: {
    population: 23050,
    majorCities: ["Menominee", "Stephenson"],
    countyType: "rural",
    healthHighlights: h("7.7%", "3,800:1", "12.6%"),
  },
  Missaukee: {
    population: 15239,
    majorCities: ["Lake City", "McBain"],
    countyType: "rural",
    healthHighlights: h("9.8%", "5,110:1", "15.2%"),
  },
  Montcalm: {
    population: 69314,
    majorCities: ["Greenville", "Stanton", "Howard City"],
    countyType: "rural",
    healthHighlights: h("8.0%", "4,030:1", "15.5%"),
  },
  Montmorency: {
    population: 9828,
    majorCities: ["Atlanta", "Hillman"],
    countyType: "rural",
    healthHighlights: h("10.3%", "9,330:1", "16.0%"),
  },
  Newaygo: {
    population: 51504,
    majorCities: ["Newaygo", "Fremont", "White Cloud"],
    countyType: "rural",
    healthHighlights: h("8.7%", "4,960:1", "15.1%"),
  },
  Oceana: {
    population: 27014,
    majorCities: ["Hart", "Shelby", "Pentwater"],
    countyType: "rural",
    healthHighlights: h("10.5%", "4,500:1", "15.8%"),
  },
  Ogemaw: {
    population: 20985,
    majorCities: ["West Branch", "Rose City"],
    countyType: "rural",
    healthHighlights: h("9.4%", "5,250:1", "16.6%"),
  },
  Ontonagon: {
    population: 5824,
    majorCities: ["Ontonagon", "White Pine"],
    countyType: "rural",
    healthHighlights: h("8.1%", "5,720:1", "14.0%"),
  },
  Osceola: {
    population: 23484,
    majorCities: ["Reed City", "Evart", "Hersey"],
    countyType: "rural",
    healthHighlights: h("9.6%", "5,870:1", "16.4%"),
  },
  Oscoda: {
    population: 8596,
    majorCities: ["Mio", "Comins"],
    countyType: "rural",
    healthHighlights: h("10.8%", "8,230:1", "17.5%"),
  },
  Otsego: {
    population: 26083,
    majorCities: ["Gaylord", "Johannesburg"],
    countyType: "rural",
    healthHighlights: h("8.9%", "2,530:1", "13.7%"),
  },
  "Presque Isle": {
    population: 13230,
    majorCities: ["Rogers City", "Onaway"],
    countyType: "rural",
    healthHighlights: h("9.2%", "6,310:1", "14.8%"),
  },
  Roscommon: {
    population: 23932,
    majorCities: ["Roscommon", "Houghton Lake", "Prudenville"],
    countyType: "rural",
    healthHighlights: h("9.7%", "4,800:1", "17.1%"),
  },
  Sanilac: {
    population: 40293,
    majorCities: ["Sandusky", "Croswell", "Marlette"],
    countyType: "rural",
    healthHighlights: h("7.9%", "4,120:1", "13.3%"),
  },
  Schoolcraft: {
    population: 8178,
    majorCities: ["Manistique", "Germfask"],
    countyType: "rural",
    healthHighlights: h("8.2%", "8,050:1", "15.6%"),
  },
  "St. Joseph": {
    population: 61171,
    majorCities: ["Sturgis", "Three Rivers", "Centreville"],
    countyType: "rural",
    healthHighlights: h("8.6%", "2,710:1", "14.5%"),
  },
  Wexford: {
    population: 34460,
    majorCities: ["Cadillac", "Manton"],
    countyType: "rural",
    healthHighlights: h("9.1%", "2,300:1", "15.3%"),
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
