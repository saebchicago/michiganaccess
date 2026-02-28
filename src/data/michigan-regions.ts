import type { MichiganCounty } from "@/contexts/CountyContext";

export interface MichiganRegion {
  id: string;
  name: string;
  description: string;
  counties: MichiganCounty[];
  center: [number, number];
  zoom: number;
  color: string;
}

export const MICHIGAN_REGIONS: MichiganRegion[] = [
  {
    id: "southeast",
    name: "Southeast Michigan",
    description: "Metro Detroit region — the state's largest population center with major health systems and urban services.",
    counties: ["Wayne", "Oakland", "Macomb", "Washtenaw", "Livingston", "Monroe", "St. Clair", "Lenawee", "Lapeer"],
    center: [42.45, -83.35],
    zoom: 9,
    color: "hsl(215, 72%, 30%)",
  },
  {
    id: "south-central",
    name: "South Central Michigan",
    description: "Lansing–Jackson–Kalamazoo corridor with university health networks and mid-size metro services.",
    counties: ["Ingham", "Kalamazoo", "Calhoun", "Jackson", "Eaton", "Barry", "Branch", "Hillsdale", "Ionia", "Clinton", "Shiawassee", "Gratiot"],
    center: [42.55, -84.55],
    zoom: 9,
    color: "hsl(174, 60%, 34%)",
  },
  {
    id: "west",
    name: "West Michigan",
    description: "Grand Rapids region — growing metro area with strong community health and nonprofit networks.",
    counties: ["Kent", "Ottawa", "Muskegon", "Allegan", "Berrien", "Van Buren", "Cass", "St. Joseph", "Newaygo", "Oceana", "Mason", "Manistee", "Lake", "Osceola", "Mecosta", "Montcalm"],
    center: [43.1, -85.9],
    zoom: 8,
    color: "hsl(122, 42%, 29%)",
  },
  {
    id: "east-central",
    name: "East Central / Thumb",
    description: "Flint–Saginaw–Bay City tri-cities and the Thumb region with rural health access challenges.",
    counties: ["Genesee", "Saginaw", "Bay", "Midland", "Tuscola", "Huron", "Sanilac", "Arenac", "Gladwin", "Isabella", "Clare", "Gratiot"],
    center: [43.4, -83.8],
    zoom: 9,
    color: "hsl(32, 88%, 46%)",
  },
  {
    id: "northwest",
    name: "Northern Lower Michigan",
    description: "Traverse City region and northern communities — resort areas with seasonal healthcare demand.",
    counties: ["Grand Traverse", "Emmet", "Charlevoix", "Antrim", "Benzie", "Leelanau", "Kalkaska", "Wexford", "Missaukee", "Roscommon", "Otsego", "Crawford", "Ogemaw", "Iosco", "Alpena", "Montmorency", "Oscoda", "Presque Isle", "Cheboygan", "Alcona"],
    center: [44.8, -85.0],
    zoom: 8,
    color: "hsl(205, 80%, 33%)",
  },
  {
    id: "upper-peninsula",
    name: "Upper Peninsula",
    description: "Michigan's UP — vast rural territory with critical access hospitals and frontier health challenges.",
    counties: ["Marquette", "Chippewa", "Delta", "Houghton", "Dickinson", "Menominee", "Baraga", "Gogebic", "Iron", "Keweenaw", "Luce", "Mackinac", "Ontonagon", "Schoolcraft", "Alger"],
    center: [46.3, -86.5],
    zoom: 7,
    color: "hsl(200, 65%, 40%)",
  },
];

/** Find which region a county belongs to */
export function getRegionForCounty(county: string): MichiganRegion | null {
  return MICHIGAN_REGIONS.find(r => r.counties.includes(county as MichiganCounty)) ?? null;
}

/** Convert region id to URL slug */
export function regionToSlug(id: string): string {
  return id;
}
