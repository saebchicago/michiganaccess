export interface WeeklyInsight {
  week: number;  // 0-11
  text: string;
  source: string;
  href: string;
}

export const WEEKLY_INSIGHTS: WeeklyInsight[] = [
  { week: 0, text: "Rural Michigan counties have 7x fewer PCPs per capita than urban counties — yet rural residents travel 3x further for specialty care.", source: "HRSA HPSA data + County Health Rankings 2024", href: "/health-equity-atlas" },
  { week: 1, text: "41% of Michigan households fall below the ALICE threshold — earning too much for aid but not enough for basics.", source: "United For ALICE 2023", href: "/equity" },
  { week: 2, text: "Michigan has the strictest PFAS drinking water standard in the nation at 8 parts per trillion.", source: "EGLE MPART", href: "/environment" },
  { week: 3, text: "Wayne County has had 8,500 flood claims since 1978 but only 4,200 active flood insurance policies.", source: "FEMA NFIP", href: "/disaster-history" },
  { week: 4, text: "Detroit's east side has the highest EITC claim rate in Michigan at 44.9% of tax filers.", source: "IRS SOI 2021", href: "/zip/48205" },
  { week: 5, text: "59 of 83 Michigan counties have dental health professional shortage areas.", source: "MDHHS, HRSA", href: "/equity" },
  { week: 6, text: "Michigan's prison population dropped from 51,554 to 32,778 — the lowest since 1991.", source: "MDOC 2025", href: "/reentry" },
  { week: 7, text: "There are ~125,000 more children under 5 with working parents than licensed childcare slots in Michigan.", source: "BPC, LARA, Census ACS", href: "/equity" },
  { week: 8, text: "$3.2 billion in SBA lending has flowed to Michigan small businesses since FY2020.", source: "SBA FOIA", href: "/sba-insights" },
  { week: 9, text: "Michigan averaged 12 federal disaster declarations per decade in the 1980s. In the 2020s, it's on pace for 25+.", source: "FEMA OpenFEMA", href: "/disaster-history" },
  { week: 10, text: "76 of 83 Michigan counties have zero pedestrian infrastructure data. The gap itself is an equity crisis.", source: "SEMCOG", href: "/transportation" },
  { week: 11, text: "Birmingham (48009) has an average AGI of $142,000 while Detroit East (48205) averages $21,200 — a 6.7x gap within 20 miles.", source: "IRS SOI 2021", href: "/zip/48009" },
];
