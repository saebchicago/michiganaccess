export interface Signal {
  id: string;
  date: string;
  text: string;
  category: "health" | "economic" | "environment" | "civic" | "safety";
  direction: "up" | "down" | "alert" | "stable";
  source: string;
  href: string;
}

export const SIGNALS_2026_03: Signal[] = [
  { id: "s1", date: "2026-03", text: "Gas prices surging: Michigan avg $3.92/gal, up 80¢ in 3 weeks", category: "economic", direction: "up", source: "AAA / GasBuddy", href: "/environment#energy" },
  { id: "s2", date: "2026-03", text: "Oakland County boil water advisory after GLWA main break", category: "safety", direction: "alert", source: "Oakland County WRC", href: "/environment#water-safety" },
  { id: "s3", date: "2026-03", text: "MDHHS launches Public Health Data Dashboard for legislative districts", category: "civic", direction: "up", source: "MDHHS", href: "/data-and-insights" },
  { id: "s4", date: "2026-03", text: "Michigan infant mortality declined 14% over past decade (6.1/1K)", category: "health", direction: "down", source: "March of Dimes", href: "/maternal-health" },
  { id: "s5", date: "2026-03", text: "BEAD broadband: Michigan awarded $1.559B for 492K unserved homes", category: "civic", direction: "up", source: "NTIA / MIHI", href: "/civic-data" },
  { id: "s6", date: "2026-03", text: "MiHER energy rebates: $211M available, up to $34K/household", category: "economic", direction: "up", source: "EGLE", href: "/environment#programs" },
  { id: "s7", date: "2026-03", text: "76 of 83 counties have zero pedestrian infrastructure data", category: "safety", direction: "alert", source: "SEMCOG / GATIS", href: "/transportation#active-transport" },
  { id: "s8", date: "2026-03", text: "Opioid deaths down 7.5% from 2022 peak — first decline in 4 years", category: "health", direction: "down", source: "MDHHS / CDC WONDER", href: "/data" },
  { id: "s9", date: "2026-03", text: "41% of MI households below ALICE Threshold — 100K+ increase since 2019", category: "economic", direction: "alert", source: "United For ALICE 2023", href: "/equity" },
  { id: "s10", date: "2026-03", text: "Michigan has 2,247 pharmacies — chains declined 7.4% in 5 years", category: "health", direction: "down", source: "NCPDP 2024", href: "/equity" },
  { id: "s11", date: "2026-03", text: "298K Spanish + 172K Arabic households — Michigan's 2nd language is Arabic", category: "civic", direction: "stable", source: "Census ACS 2024", href: "/equity" },
  { id: "s12", date: "2026-03", text: "MDOC recidivism at historic low; prison population lowest since 1991", category: "civic", direction: "down", source: "MDOC 2025", href: "/reentry" },
  { id: "s13", date: "2026-03", text: "102 'Do Not Eat' water bodies for PFAS — nation's most aggressive monitoring", category: "environment", direction: "alert", source: "EGLE MPART / MDHHS", href: "/environment#water-safety" },
  { id: "s14", date: "2026-03", text: "27.9% chronic absenteeism statewide — 38.6% for economically disadvantaged", category: "civic", direction: "alert", source: "MDE 2024-25", href: "/data-and-insights" },
  { id: "s15", date: "2026-03", text: "59 of 83 counties designated dental health professional shortage areas", category: "health", direction: "alert", source: "MDHHS / HRSA", href: "/equity" },
  { id: "s16", date: "2026-03", text: "31,211 experienced homelessness in 2024; Black households 3.6× more likely", category: "safety", direction: "alert", source: "HUD PIT 2024", href: "/equity" },
  { id: "s17", date: "2026-03", text: "~19.2% of eligible MI taxpayers don't claim EITC — millions left unclaimed", category: "economic", direction: "alert", source: "IRS", href: "/financial-help" },
];
