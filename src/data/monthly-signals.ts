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
];
