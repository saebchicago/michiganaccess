// Population data: US Census 2023 estimates; cities: largest municipalities per county
// Health data: County Health Rankings & Roadmaps 2024, USDA Food Environment Atlas
export interface CountyProfile {
  population: number;
  majorCities: string[];
  countyType: "urban" | "suburban" | "rural";
  healthHighlights: { label: string; value: string; trend?: "up" | "down" | "stable" }[];
}

const h = (uninsured: string, pcratio: string, food: string, ut?: "up"|"down"|"stable", ft?: "up"|"down"|"stable"): CountyProfile["healthHighlights"] => [
  { label: "Uninsured rate", value: uninsured, trend: ut || "stable" },
  { label: "Primary care ratio", value: pcratio },
  { label: "Food insecurity", value: food, trend: ft || "stable" },
];

export const COUNTY_PROFILES: Record<string, CountyProfile> = {
  // ── Metro / Urban ──
  Wayne:           { population: 1793561, majorCities: ["Detroit", "Dearborn", "Livonia", "Westland"], countyType: "urban", healthHighlights: h("7.2%","1,090:1","17.4%","down") },
  Oakland:         { population: 1274395, majorCities: ["Troy", "Southfield", "Farmington Hills", "Royal Oak", "West Bloomfield Twp"], countyType: "suburban", healthHighlights: h("4.8%","810:1","10.2%","down","down") },
  Macomb:          { population: 881217, majorCities: ["Warren", "Sterling Heights", "Clinton Twp", "Shelby Twp"], countyType: "suburban", healthHighlights: h("5.6%","1,320:1","12.1%") },
  Kent:            { population: 664564, majorCities: ["Grand Rapids", "Wyoming", "Kentwood", "Walker"], countyType: "urban", healthHighlights: h("6.8%","960:1","13.5%","down","down") },
  Genesee:         { population: 406211, majorCities: ["Flint", "Burton", "Davison", "Grand Blanc"], countyType: "urban", healthHighlights: h("7.9%","1,480:1","19.1%") },
  Washtenaw:       { population: 372258, majorCities: ["Ann Arbor", "Ypsilanti", "Saline", "Dexter"], countyType: "suburban", healthHighlights: h("3.9%","620:1","9.8%","down","down") },
  Ingham:          { population: 284900, majorCities: ["Lansing", "East Lansing", "Meridian Twp", "Holt"], countyType: "urban", healthHighlights: h("6.5%","750:1","15.2%","down") },
  Kalamazoo:       { population: 265066, majorCities: ["Kalamazoo", "Portage", "Oshtemo Twp", "Comstock Twp"], countyType: "urban", healthHighlights: h("6.1%","870:1","14.3%","down") },
  Saginaw:         { population: 190124, majorCities: ["Saginaw", "Saginaw Twp", "Thomas Twp", "Bridgeport"], countyType: "urban", healthHighlights: h("7.4%","1,350:1","17.8%") },

  // ── Suburban ──
  Ottawa:          { population: 302830, majorCities: ["Holland", "Grand Haven", "Zeeland", "Hudsonville"], countyType: "suburban", healthHighlights: h("5.1%","1,180:1","9.5%","down") },
  Muskegon:        { population: 175824, majorCities: ["Muskegon", "Norton Shores", "Muskegon Heights"], countyType: "suburban", healthHighlights: h("7.6%","1,540:1","16.2%") },
  "St. Clair":     { population: 160383, majorCities: ["Port Huron", "Marysville", "Fort Gratiot"], countyType: "suburban", healthHighlights: h("6.3%","1,680:1","13.9%") },
  Livingston:      { population: 193866, majorCities: ["Howell", "Brighton", "Hartland"], countyType: "suburban", healthHighlights: h("4.2%","1,490:1","7.8%","down","down") },
  Monroe:          { population: 154809, majorCities: ["Monroe", "Dundee", "Temperance"], countyType: "suburban", healthHighlights: h("5.8%","2,010:1","12.5%") },
  Jackson:         { population: 160248, majorCities: ["Jackson", "Summit Twp", "Blackman Twp"], countyType: "suburban", healthHighlights: h("6.7%","1,710:1","14.6%") },
  Berrien:         { population: 153401, majorCities: ["St. Joseph", "Benton Harbor", "Niles"], countyType: "suburban", healthHighlights: h("7.3%","1,420:1","15.8%") },
  Calhoun:         { population: 134159, majorCities: ["Battle Creek", "Marshall", "Albion"], countyType: "suburban", healthHighlights: h("7.1%","1,390:1","16.4%") },
  Eaton:           { population: 111902, majorCities: ["Charlotte", "Delta Twp", "Grand Ledge"], countyType: "suburban", healthHighlights: h("5.3%","1,850:1","10.7%","down") },
  Bay:             { population: 103126, majorCities: ["Bay City", "Essexville", "Hampton Twp"], countyType: "suburban", healthHighlights: h("6.6%","1,560:1","14.9%") },
  Midland:         { population: 83156, majorCities: ["Midland", "Coleman", "Sanford"], countyType: "suburban", healthHighlights: h("5.0%","1,270:1","10.9%","down") },
  "Van Buren":     { population: 75677, majorCities: ["South Haven", "Paw Paw", "Hartford"], countyType: "rural", healthHighlights: h("8.2%","2,450:1","14.1%") },
  Shiawassee:      { population: 68094, majorCities: ["Owosso", "Durand", "Corunna"], countyType: "rural", healthHighlights: h("6.4%","3,010:1","13.5%") },
  Barry:           { population: 62009, majorCities: ["Hastings", "Nashville", "Middleville"], countyType: "rural", healthHighlights: h("6.1%","3,670:1","11.2%") },
  Gratiot:         { population: 40714, majorCities: ["Alma", "Ithaca", "St. Louis"], countyType: "rural", healthHighlights: h("7.2%","2,540:1","14.8%") },
  Tuscola:         { population: 52774, majorCities: ["Caro", "Vassar", "Cass City"], countyType: "rural", healthHighlights: h("6.8%","3,290:1","13.7%") },

  // ── Rural / Northern / UP ──
  "Grand Traverse": { population: 99513, majorCities: ["Traverse City", "Garfield Twp"], countyType: "rural", healthHighlights: h("8.2%","990:1","11.3%","stable","down") },
  Marquette:       { population: 66017, majorCities: ["Marquette", "Ishpeming", "Negaunee"], countyType: "rural", healthHighlights: h("6.4%","940:1","13.1%","down") },
  Lapeer:          { population: 88619, majorCities: ["Lapeer", "Imlay City", "Dryden"], countyType: "rural", healthHighlights: h("5.9%","2,390:1","11.8%") },
  Allegan:         { population: 120502, majorCities: ["Allegan", "Plainwell", "Wayland"], countyType: "rural", healthHighlights: h("7.5%","2,120:1","11.4%") },
  Lenawee:         { population: 98451, majorCities: ["Adrian", "Tecumseh", "Blissfield"], countyType: "rural", healthHighlights: h("6.8%","2,050:1","12.9%") },
  Clinton:         { population: 79595, majorCities: ["St. Johns", "DeWitt", "Bath"], countyType: "rural", healthHighlights: h("4.5%","2,280:1","8.9%","down","down") },
  Emmet:           { population: 34029, majorCities: ["Petoskey", "Harbor Springs"], countyType: "rural", healthHighlights: h("8.5%","1,080:1","12.0%") },
  Isabella:        { population: 64917, majorCities: ["Mt. Pleasant", "Shepherd"], countyType: "rural", healthHighlights: h("7.8%","1,150:1","16.7%") },
  Ionia:           { population: 64697, majorCities: ["Ionia", "Portland", "Belding"], countyType: "rural", healthHighlights: h("7.0%","3,210:1","13.2%") },
  Alcona:          { population: 10519, majorCities: ["Harrisville", "Lincoln"], countyType: "rural", healthHighlights: h("9.1%","5,260:1","15.3%") },
  Alger:           { population: 9108, majorCities: ["Munising", "Chatham"], countyType: "rural", healthHighlights: h("8.3%","4,550:1","14.2%") },
  Alpena:          { population: 28408, majorCities: ["Alpena", "Ossineke"], countyType: "rural", healthHighlights: h("7.5%","1,890:1","14.6%") },
  Antrim:          { population: 23505, majorCities: ["Bellaire", "Elk Rapids", "Mancelona"], countyType: "rural", healthHighlights: h("9.0%","3,920:1","13.8%") },
  Arenac:          { population: 14706, majorCities: ["Standish", "Omer"], countyType: "rural", healthHighlights: h("8.7%","7,350:1","15.9%") },
  Baraga:          { population: 8209, majorCities: ["Baraga", "L'Anse"], countyType: "rural", healthHighlights: h("7.6%","4,100:1","14.5%") },
  Benzie:          { population: 17877, majorCities: ["Beulah", "Frankfort", "Benzonia"], countyType: "rural", healthHighlights: h("9.4%","3,580:1","13.1%") },
  Branch:          { population: 43584, majorCities: ["Coldwater", "Bronson", "Quincy"], countyType: "rural", healthHighlights: h("8.4%","3,960:1","15.6%") },
  Cass:            { population: 51820, majorCities: ["Dowagiac", "Cassopolis", "Edwardsburg"], countyType: "rural", healthHighlights: h("7.9%","3,740:1","14.0%") },
  Charlevoix:      { population: 26774, majorCities: ["Charlevoix", "Boyne City", "East Jordan"], countyType: "rural", healthHighlights: h("8.6%","2,680:1","12.4%") },
  Cheboygan:       { population: 25276, majorCities: ["Cheboygan", "Indian River"], countyType: "rural", healthHighlights: h("9.2%","3,150:1","15.1%") },
  Chippewa:        { population: 37349, majorCities: ["Sault Ste. Marie", "Kinross"], countyType: "rural", healthHighlights: h("8.0%","2,490:1","15.4%") },
  Clare:           { population: 31353, majorCities: ["Clare", "Harrison"], countyType: "rural", healthHighlights: h("9.3%","3,130:1","17.2%") },
  Crawford:        { population: 14478, majorCities: ["Grayling", "Roscommon"], countyType: "rural", healthHighlights: h("9.5%","7,240:1","16.8%") },
  Delta:           { population: 35947, majorCities: ["Escanaba", "Gladstone"], countyType: "rural", healthHighlights: h("7.2%","2,390:1","13.6%") },
  Dickinson:       { population: 25239, majorCities: ["Iron Mountain", "Kingsford"], countyType: "rural", healthHighlights: h("6.8%","2,100:1","12.3%") },
  Gladwin:         { population: 25315, majorCities: ["Gladwin", "Beaverton"], countyType: "rural", healthHighlights: h("9.0%","4,220:1","16.5%") },
  Gogebic:         { population: 13975, majorCities: ["Ironwood", "Bessemer", "Wakefield"], countyType: "rural", healthHighlights: h("7.8%","3,490:1","14.7%") },
  Hillsdale:       { population: 45746, majorCities: ["Hillsdale", "Jonesville", "Litchfield"], countyType: "rural", healthHighlights: h("8.1%","3,820:1","14.3%") },
  Houghton:        { population: 36360, majorCities: ["Houghton", "Hancock", "Calumet"], countyType: "rural", healthHighlights: h("7.0%","1,810:1","15.0%") },
  Huron:           { population: 30981, majorCities: ["Bad Axe", "Harbor Beach", "Caseville"], countyType: "rural", healthHighlights: h("7.4%","3,440:1","12.8%") },
  Iosco:           { population: 25127, majorCities: ["Tawas City", "East Tawas", "Oscoda"], countyType: "rural", healthHighlights: h("8.8%","4,190:1","15.7%") },
  Iron:            { population: 11211, majorCities: ["Iron River", "Crystal Falls"], countyType: "rural", healthHighlights: h("7.5%","5,610:1","13.4%") },
  Kalkaska:        { population: 18210, majorCities: ["Kalkaska", "Rapid City"], countyType: "rural", healthHighlights: h("10.1%","6,070:1","16.3%") },
  Keweenaw:        { population: 2116, majorCities: ["Mohawk", "Ahmeek"], countyType: "rural", healthHighlights: h("8.9%","—","13.8%") },
  Lake:            { population: 12010, majorCities: ["Baldwin", "Luther"], countyType: "rural", healthHighlights: h("11.2%","6,010:1","19.5%") },
  Leelanau:        { population: 22301, majorCities: ["Leland", "Suttons Bay", "Empire"], countyType: "rural", healthHighlights: h("7.6%","3,720:1","9.7%","stable","down") },
  Luce:            { population: 6286, majorCities: ["Newberry", "McMillan"], countyType: "rural", healthHighlights: h("8.4%","6,290:1","16.1%") },
  Mackinac:        { population: 10799, majorCities: ["St. Ignace", "Mackinac Island"], countyType: "rural", healthHighlights: h("9.6%","5,400:1","14.9%") },
  Manistee:        { population: 24558, majorCities: ["Manistee", "Onekama"], countyType: "rural", healthHighlights: h("8.8%","3,510:1","14.4%") },
  Mason:           { population: 29268, majorCities: ["Ludington", "Scottville"], countyType: "rural", healthHighlights: h("8.3%","2,930:1","13.9%") },
  Mecosta:         { population: 43898, majorCities: ["Big Rapids", "Morley", "Stanwood"], countyType: "rural", healthHighlights: h("8.5%","2,930:1","16.9%") },
  Menominee:       { population: 22780, majorCities: ["Menominee", "Stephenson"], countyType: "rural", healthHighlights: h("7.7%","3,800:1","12.6%") },
  Missaukee:       { population: 15339, majorCities: ["Lake City", "McBain"], countyType: "rural", healthHighlights: h("9.8%","5,110:1","15.2%") },
  Montcalm:        { population: 64465, majorCities: ["Greenville", "Stanton", "Howard City"], countyType: "rural", healthHighlights: h("8.0%","4,030:1","15.5%") },
  Montmorency:     { population: 9328, majorCities: ["Atlanta", "Hillman"], countyType: "rural", healthHighlights: h("10.3%","9,330:1","16.0%") },
  Newaygo:         { population: 49645, majorCities: ["Newaygo", "Fremont", "White Cloud"], countyType: "rural", healthHighlights: h("8.7%","4,960:1","15.1%") },
  Oceana:          { population: 27000, majorCities: ["Hart", "Shelby", "Pentwater"], countyType: "rural", healthHighlights: h("10.5%","4,500:1","15.8%") },
  Ogemaw:          { population: 20997, majorCities: ["West Branch", "Rose City"], countyType: "rural", healthHighlights: h("9.4%","5,250:1","16.6%") },
  Ontonagon:       { population: 5720, majorCities: ["Ontonagon", "White Pine"], countyType: "rural", healthHighlights: h("8.1%","5,720:1","14.0%") },
  Osceola:         { population: 23460, majorCities: ["Reed City", "Evart", "Hersey"], countyType: "rural", healthHighlights: h("9.6%","5,870:1","16.4%") },
  Oscoda:          { population: 8231, majorCities: ["Mio", "Comins"], countyType: "rural", healthHighlights: h("10.8%","8,230:1","17.5%") },
  Otsego:          { population: 25330, majorCities: ["Gaylord", "Johannesburg"], countyType: "rural", healthHighlights: h("8.9%","2,530:1","13.7%") },
  "Presque Isle":  { population: 12622, majorCities: ["Rogers City", "Onaway"], countyType: "rural", healthHighlights: h("9.2%","6,310:1","14.8%") },
  Roscommon:       { population: 24019, majorCities: ["Roscommon", "Houghton Lake", "Prudenville"], countyType: "rural", healthHighlights: h("9.7%","4,800:1","17.1%") },
  Sanilac:         { population: 41170, majorCities: ["Sandusky", "Croswell", "Marlette"], countyType: "rural", healthHighlights: h("7.9%","4,120:1","13.3%") },
  Schoolcraft:     { population: 8047, majorCities: ["Manistique", "Germfask"], countyType: "rural", healthHighlights: h("8.2%","8,050:1","15.6%") },
  "St. Joseph":    { population: 60964, majorCities: ["Sturgis", "Three Rivers", "Centreville"], countyType: "rural", healthHighlights: h("8.6%","2,710:1","14.5%") },
  Wexford:         { population: 34508, majorCities: ["Cadillac", "Manton"], countyType: "rural", healthHighlights: h("9.1%","2,300:1","15.3%") },
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
