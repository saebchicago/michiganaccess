// Population data: US Census 2023 estimates; cities: largest municipalities per county
export interface CountyProfile {
  population: number;
  majorCities: string[];
  countyType: "urban" | "suburban" | "rural";
  healthHighlights: { label: string; value: string; trend?: "up" | "down" | "stable" }[];
}

export const COUNTY_PROFILES: Record<string, CountyProfile> = {
  Wayne: { population: 1793561, majorCities: ["Detroit", "Dearborn", "Livonia", "Westland"], countyType: "urban", healthHighlights: [{ label: "Uninsured rate", value: "7.2%", trend: "down" }, { label: "Primary care ratio", value: "1,090:1" }, { label: "Food insecurity", value: "17.4%", trend: "stable" }] },
  Oakland: { population: 1274395, majorCities: ["Troy", "Southfield", "Farmington Hills", "Royal Oak"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "4.8%", trend: "down" }, { label: "Primary care ratio", value: "810:1" }, { label: "Food insecurity", value: "10.2%", trend: "down" }] },
  Macomb: { population: 881217, majorCities: ["Warren", "Sterling Heights", "Clinton Twp", "Shelby Twp"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "5.6%", trend: "stable" }, { label: "Primary care ratio", value: "1,320:1" }, { label: "Food insecurity", value: "12.1%", trend: "stable" }] },
  Kent: { population: 664564, majorCities: ["Grand Rapids", "Wyoming", "Kentwood", "Walker"], countyType: "urban", healthHighlights: [{ label: "Uninsured rate", value: "6.8%", trend: "down" }, { label: "Primary care ratio", value: "960:1" }, { label: "Food insecurity", value: "13.5%", trend: "down" }] },
  Genesee: { population: 406211, majorCities: ["Flint", "Burton", "Davison", "Grand Blanc"], countyType: "urban", healthHighlights: [{ label: "Uninsured rate", value: "7.9%", trend: "stable" }, { label: "Primary care ratio", value: "1,480:1" }, { label: "Food insecurity", value: "19.1%", trend: "stable" }] },
  Washtenaw: { population: 372258, majorCities: ["Ann Arbor", "Ypsilanti", "Saline", "Dexter"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "3.9%", trend: "down" }, { label: "Primary care ratio", value: "620:1" }, { label: "Food insecurity", value: "9.8%", trend: "down" }] },
  Ottawa: { population: 302830, majorCities: ["Holland", "Grand Haven", "Zeeland", "Hudsonville"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "5.1%", trend: "down" }, { label: "Primary care ratio", value: "1,180:1" }, { label: "Food insecurity", value: "9.5%", trend: "stable" }] },
  Ingham: { population: 284900, majorCities: ["Lansing", "East Lansing", "Meridian Twp", "Holt"], countyType: "urban", healthHighlights: [{ label: "Uninsured rate", value: "6.5%", trend: "down" }, { label: "Primary care ratio", value: "750:1" }, { label: "Food insecurity", value: "15.2%", trend: "stable" }] },
  Kalamazoo: { population: 265066, majorCities: ["Kalamazoo", "Portage", "Oshtemo Twp", "Comstock Twp"], countyType: "urban", healthHighlights: [{ label: "Uninsured rate", value: "6.1%", trend: "down" }, { label: "Primary care ratio", value: "870:1" }, { label: "Food insecurity", value: "14.3%", trend: "stable" }] },
  Saginaw: { population: 190124, majorCities: ["Saginaw", "Saginaw Twp", "Thomas Twp", "Bridgeport"], countyType: "urban", healthHighlights: [{ label: "Uninsured rate", value: "7.4%", trend: "stable" }, { label: "Primary care ratio", value: "1,350:1" }, { label: "Food insecurity", value: "17.8%", trend: "stable" }] },
  Muskegon: { population: 175824, majorCities: ["Muskegon", "Norton Shores", "Muskegon Heights"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "7.6%", trend: "stable" }, { label: "Primary care ratio", value: "1,540:1" }, { label: "Food insecurity", value: "16.2%", trend: "stable" }] },
  "St. Clair": { population: 160383, majorCities: ["Port Huron", "Marysville", "Fort Gratiot"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "6.3%", trend: "stable" }, { label: "Primary care ratio", value: "1,680:1" }, { label: "Food insecurity", value: "13.9%", trend: "stable" }] },
  Livingston: { population: 193866, majorCities: ["Howell", "Brighton", "Hartland"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "4.2%", trend: "down" }, { label: "Primary care ratio", value: "1,490:1" }, { label: "Food insecurity", value: "7.8%", trend: "down" }] },
  Monroe: { population: 154809, majorCities: ["Monroe", "Dundee", "Temperance"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "5.8%", trend: "stable" }, { label: "Primary care ratio", value: "2,010:1" }, { label: "Food insecurity", value: "12.5%", trend: "stable" }] },
  Jackson: { population: 160248, majorCities: ["Jackson", "Summit Twp", "Blackman Twp"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "6.7%", trend: "stable" }, { label: "Primary care ratio", value: "1,710:1" }, { label: "Food insecurity", value: "14.6%", trend: "stable" }] },
  Berrien: { population: 153401, majorCities: ["St. Joseph", "Benton Harbor", "Niles"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "7.3%", trend: "stable" }, { label: "Primary care ratio", value: "1,420:1" }, { label: "Food insecurity", value: "15.8%", trend: "stable" }] },
  Calhoun: { population: 134159, majorCities: ["Battle Creek", "Marshall", "Albion"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "7.1%", trend: "stable" }, { label: "Primary care ratio", value: "1,390:1" }, { label: "Food insecurity", value: "16.4%", trend: "stable" }] },
  "Grand Traverse": { population: 99513, majorCities: ["Traverse City", "Garfield Twp"], countyType: "rural", healthHighlights: [{ label: "Uninsured rate", value: "8.2%", trend: "stable" }, { label: "Primary care ratio", value: "990:1" }, { label: "Food insecurity", value: "11.3%", trend: "down" }] },
  Marquette: { population: 66017, majorCities: ["Marquette", "Ishpeming", "Negaunee"], countyType: "rural", healthHighlights: [{ label: "Uninsured rate", value: "6.4%", trend: "down" }, { label: "Primary care ratio", value: "940:1" }, { label: "Food insecurity", value: "13.1%", trend: "stable" }] },
  Eaton: { population: 111902, majorCities: ["Charlotte", "Delta Twp", "Grand Ledge"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "5.3%", trend: "down" }, { label: "Primary care ratio", value: "1,850:1" }, { label: "Food insecurity", value: "10.7%", trend: "stable" }] },
  Bay: { population: 103126, majorCities: ["Bay City", "Essexville", "Hampton Twp"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "6.6%", trend: "stable" }, { label: "Primary care ratio", value: "1,560:1" }, { label: "Food insecurity", value: "14.9%", trend: "stable" }] },
  Lapeer: { population: 88619, majorCities: ["Lapeer", "Imlay City", "Dryden"], countyType: "rural", healthHighlights: [{ label: "Uninsured rate", value: "5.9%", trend: "stable" }, { label: "Primary care ratio", value: "2,390:1" }, { label: "Food insecurity", value: "11.8%", trend: "stable" }] },
  Allegan: { population: 120502, majorCities: ["Allegan", "Plainwell", "Wayland"], countyType: "rural", healthHighlights: [{ label: "Uninsured rate", value: "7.5%", trend: "stable" }, { label: "Primary care ratio", value: "2,120:1" }, { label: "Food insecurity", value: "11.4%", trend: "stable" }] },
  Lenawee: { population: 98451, majorCities: ["Adrian", "Tecumseh", "Blissfield"], countyType: "rural", healthHighlights: [{ label: "Uninsured rate", value: "6.8%", trend: "stable" }, { label: "Primary care ratio", value: "2,050:1" }, { label: "Food insecurity", value: "12.9%", trend: "stable" }] },
  Midland: { population: 83156, majorCities: ["Midland", "Coleman", "Sanford"], countyType: "suburban", healthHighlights: [{ label: "Uninsured rate", value: "5.0%", trend: "down" }, { label: "Primary care ratio", value: "1,270:1" }, { label: "Food insecurity", value: "10.9%", trend: "stable" }] },
  Clinton: { population: 79595, majorCities: ["St. Johns", "DeWitt", "Bath"], countyType: "rural", healthHighlights: [{ label: "Uninsured rate", value: "4.5%", trend: "down" }, { label: "Primary care ratio", value: "2,280:1" }, { label: "Food insecurity", value: "8.9%", trend: "down" }] },
  Emmet: { population: 34029, majorCities: ["Petoskey", "Harbor Springs"], countyType: "rural", healthHighlights: [{ label: "Uninsured rate", value: "8.5%", trend: "stable" }, { label: "Primary care ratio", value: "1,080:1" }, { label: "Food insecurity", value: "12.0%", trend: "stable" }] },
  Isabella: { population: 64917, majorCities: ["Mt. Pleasant", "Shepherd"], countyType: "rural", healthHighlights: [{ label: "Uninsured rate", value: "7.8%", trend: "stable" }, { label: "Primary care ratio", value: "1,150:1" }, { label: "Food insecurity", value: "16.7%", trend: "stable" }] },
  Ionia: { population: 64697, majorCities: ["Ionia", "Portland", "Belding"], countyType: "rural", healthHighlights: [{ label: "Uninsured rate", value: "7.0%", trend: "stable" }, { label: "Primary care ratio", value: "3,210:1" }, { label: "Food insecurity", value: "13.2%", trend: "stable" }] },
};

// Default profile for counties without specific data
export const DEFAULT_PROFILE: CountyProfile = {
  population: 0,
  majorCities: [],
  countyType: "rural",
  healthHighlights: [
    { label: "Uninsured rate", value: "~6.5%" },
    { label: "Primary care ratio", value: "Varies" },
    { label: "Food insecurity", value: "~13%" },
  ],
};

export function getCountyProfile(county: string): CountyProfile {
  return COUNTY_PROFILES[county] || DEFAULT_PROFILE;
}
