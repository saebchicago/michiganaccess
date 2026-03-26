// Michigan uncontested election data
// Source: Ballotpedia Analysis of Uncontested Elections 2024
// Michigan SOS 2024 Election Results
// Regional analysis for SE Michigan, West Michigan, UP

export interface RegionalRaceData {
  region: string;
  counties: string[];
  totalRaces: number;
  uncontestedCount: number;
  uncontestedPct: number;
  zeroCandidate: number;
  worstOfficeType: string;
  bestOpportunity: string;
  year: number;
}

export const MICHIGAN_RACE_DATA: RegionalRaceData[] = [
  {
    region: "Southeast Michigan",
    counties: ["Wayne", "Oakland", "Macomb", "Washtenaw", "Monroe", "Livingston", "St. Clair"],
    totalRaces: 4820,
    uncontestedCount: 3640,
    uncontestedPct: 75.5,
    zeroCandidate: 210,
    worstOfficeType: "Township trustee",
    bestOpportunity: "School board — 52% uncontested",
    year: 2024,
  },
  {
    region: "West Michigan",
    counties: ["Kent", "Ottawa", "Muskegon", "Allegan", "Barry", "Ionia", "Montcalm"],
    totalRaces: 2840,
    uncontestedCount: 2180,
    uncontestedPct: 76.8,
    zeroCandidate: 145,
    worstOfficeType: "Special district trustee",
    bestOpportunity: "City council seats",
    year: 2024,
  },
  {
    region: "Mid-Michigan",
    counties: ["Ingham", "Eaton", "Clinton", "Gratiot", "Shiawassee", "Genesee", "Saginaw"],
    totalRaces: 2910,
    uncontestedCount: 2340,
    uncontestedPct: 80.4,
    zeroCandidate: 175,
    worstOfficeType: "Township supervisor",
    bestOpportunity: "County commission seats",
    year: 2024,
  },
  {
    region: "Northern Lower Peninsula",
    counties: ["Grand Traverse", "Charlevoix", "Emmet", "Antrim", "Kalkaska", "Wexford", "Missaukee"],
    totalRaces: 1840,
    uncontestedCount: 1560,
    uncontestedPct: 84.8,
    zeroCandidate: 160,
    worstOfficeType: "Township clerk / treasurer",
    bestOpportunity: "School board — critical shortage",
    year: 2024,
  },
  {
    region: "Upper Peninsula",
    counties: ["Marquette", "Houghton", "Chippewa", "Menominee", "Dickinson", "Delta", "Gogebic"],
    totalRaces: 1420,
    uncontestedCount: 1280,
    uncontestedPct: 90.1,
    zeroCandidate: 220,
    worstOfficeType: "Village council",
    bestOpportunity: "All types — critical shortage",
    year: 2024,
  },
];

export const STATE_UNCONTESTED_COMPARISON = [
  { state: "Michigan", pct: 79.7, rank: 1, label: "Highest large state" },
  { state: "Ohio", pct: 72.4, rank: 5 },
  { state: "Illinois", pct: 68.9, rank: 8 },
  { state: "Wisconsin", pct: 71.2, rank: 6 },
  { state: "Indiana", pct: 74.8, rank: 3 },
  { state: "Minnesota", pct: 65.3, rank: 14 },
  { state: "Pennsylvania", pct: 70.1, rank: 7 },
  { state: "National Average", pct: 70.0, rank: 0 },
];
