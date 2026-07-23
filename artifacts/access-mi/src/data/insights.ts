export interface InsightDataPoint {
  label: string;
  value: string;
  context: string;
}

export interface WeeklyInsight {
  week: number;  // 0-11
  text: string;
  source: string;
  href: string;
  dataPoints?: InsightDataPoint[];
  /** Counties this finding names directly (by county name, e.g. "Wayne").
   *  Omitted = statewide finding. Used for county-page cross-links. */
  counties?: string[];
}

export const WEEKLY_INSIGHTS: WeeklyInsight[] = [
  {
    week: 0,
    text: "Rural Michigan counties have 7x fewer PCPs per capita than urban counties - yet rural residents travel 3x further for specialty care.",
    source: "HRSA HPSA data + County Health Rankings & Roadmaps, 2025 edition",
    href: "/health-equity-atlas",
    dataPoints: [
      { label: "Rural PCP ratio", value: "1:3,200", context: "vs 1:460 urban" },
      { label: "Avg travel (rural)", value: "42 mi", context: "for specialty care" },
      { label: "Rural counties", value: "47 of 83", context: "below PCP threshold" },
    ],
  },
  {
    week: 1,
    text: "41% of Michigan households fall below the ALICE threshold - earning too much for aid but not enough for basics.",
    source: "United For ALICE 2023",
    href: "/equity",
    counties: ["Lake"],
    dataPoints: [
      { label: "ALICE households", value: "41%", context: "statewide" },
      { label: "Survival budget", value: "$27,156", context: "single adult/yr" },
      { label: "Worst county", value: "Lake Co.", context: "64% below ALICE" },
    ],
  },
  {
    week: 2,
    text: "Michigan set an 8 ppt PFOA drinking water standard in 2020; the EPA finalized a 4.0 ppt federal MCL for PFOA and PFOS in April 2024.",
    source: "EGLE MPART · EPA National Primary Drinking Water Regulations (April 2024)",
    href: "/environment",
    dataPoints: [
      { label: "MI PFOA standard", value: "8 ppt", context: "set Aug 2020" },
      { label: "EPA PFOA/PFOS MCL", value: "4.0 ppt", context: "April 2024 final rule" },
      { label: "Known sites", value: "250+", context: "PFAS contamination" },
    ],
  },
  {
    week: 3,
    text: "Wayne County has had 8,500 flood claims since 1978 but only 4,200 active flood insurance policies.",
    source: "FEMA NFIP",
    href: "/disaster-history",
    counties: ["Wayne"],
    dataPoints: [
      { label: "Flood claims", value: "8,500", context: "since 1978" },
      { label: "Active policies", value: "4,200", context: "coverage gap" },
      { label: "Avg claim", value: "$32,400", context: "per event" },
    ],
  },
  {
    week: 4,
    text: "Detroit's east side has the highest EITC claim rate in Michigan at 44.9% of tax filers.",
    source: "IRS SOI 2021",
    href: "/zip/48205",
    counties: ["Wayne"],
    dataPoints: [
      { label: "EITC rate (48205)", value: "44.9%", context: "highest in MI" },
      { label: "MI average", value: "17.6%", context: "EITC participation" },
      { label: "Avg AGI (48205)", value: "$21,200", context: "vs $56K state" },
    ],
  },
  {
    week: 5,
    text: "59 of 83 Michigan counties have dental health professional shortage areas.",
    source: "MDHHS, HRSA",
    href: "/equity",
    dataPoints: [
      { label: "Dental HPSAs", value: "59 of 83", context: "counties affected" },
      { label: "Dentists needed", value: "340+", context: "to close the gap" },
      { label: "Worst region", value: "UP", context: "1 dentist per 3,800" },
    ],
  },
  {
    week: 6,
    text: "Michigan's prison population dropped from 51,554 to 32,778 - the lowest since 1991.",
    source: "MDOC 2025",
    href: "/reentry",
    dataPoints: [
      { label: "Current pop.", value: "32,778", context: "lowest since 1991" },
      { label: "Peak pop.", value: "51,554", context: "2007 peak" },
      { label: "Decline", value: "36%", context: "over 17 years" },
    ],
  },
  {
    week: 7,
    text: "There are ~125,000 more children under 5 with working parents than licensed childcare slots in Michigan.",
    source: "BPC, LARA, Census ACS",
    href: "/equity",
    dataPoints: [
      { label: "Gap", value: "125,000", context: "children without slots" },
      { label: "Licensed slots", value: "284,000", context: "statewide capacity" },
      { label: "Worst region", value: "Northern MI", context: "0.3 slots/child" },
    ],
  },
  {
    week: 8,
    text: "$3.2 billion in SBA lending has flowed to Michigan small businesses since FY2020.",
    source: "SBA FOIA",
    href: "/sba-insights",
    counties: ["Wayne"],
    dataPoints: [
      { label: "Total lending", value: "$3.2B", context: "since FY2020" },
      { label: "Top county", value: "Wayne", context: "$680M in loans" },
      { label: "Avg loan", value: "$148K", context: "7(a) program" },
    ],
  },
  {
    week: 9,
    text: "Michigan averaged 12 federal disaster declarations per decade in the 1980s. In the 2020s, it's on pace for 25+.",
    source: "FEMA OpenFEMA",
    href: "/disaster-history",
    dataPoints: [
      { label: "1980s avg", value: "12/decade", context: "declarations" },
      { label: "2020s pace", value: "25+/decade", context: "accelerating" },
      { label: "Top hazard", value: "Severe storms", context: "58% of events" },
    ],
  },
  {
    week: 10,
    text: "76 of 83 Michigan counties have zero pedestrian infrastructure data. The gap itself is an equity crisis.",
    source: "SEMCOG",
    href: "/transportation",
    dataPoints: [
      { label: "No data", value: "76 of 83", context: "counties" },
      { label: "With data", value: "7 counties", context: "SE Michigan only" },
      { label: "Ped fatalities", value: "189/yr", context: "MI average" },
    ],
  },
  {
    week: 11,
    text: "Birmingham (48009) has an average AGI of $142,000 while Detroit East (48205) averages $21,200 - a 6.7x gap within 20 miles.",
    source: "IRS SOI 2021",
    href: "/zip/48009",
    counties: ["Oakland", "Wayne"],
    dataPoints: [
      { label: "Birmingham AGI", value: "$142,000", context: "48009" },
      { label: "Detroit East AGI", value: "$21,200", context: "48205" },
      { label: "Distance", value: "20 mi", context: "6.7x income gap" },
    ],
  },
  {
    week: 12,
    text: "Rx Kids, the nation's first community-wide cash-prescription program for pregnant residents and new parents, has grown from one city in 2024 to 28 of Michigan's 83 counties.",
    source: "Rx Kids community coverage, 2026",
    href: "/early-childhood",
    counties: ["Genesee"],
    dataPoints: [
      { label: "Counties covered", value: "28 of 83", context: "as of mid-2026" },
      { label: "Launched", value: "Jan 2024", context: "Flint, Genesee County" },
      { label: "State investment", value: "$250M", context: "over 3 years, FY2026 budget" },
    ],
  },
];
