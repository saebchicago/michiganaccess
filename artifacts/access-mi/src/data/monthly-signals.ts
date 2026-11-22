export interface Signal {
  id: string;
  date: string;
  text: string;
  category: "health" | "economic" | "environment" | "civic" | "safety";
  direction: "up" | "down" | "alert" | "stable";
  source: string;
  href: string;
}

// Dated notes, each rendered with its source and month. Do not add
// time-bound events (price spikes, advisories, outages): nothing expires
// them, and two March 2026 events (a gas price surge and a boil-water
// advisory) were still rotating as current in November. Removed 2026-11-22.
export const SIGNALS_2026_03: Signal[] = [
  { id: "s6", date: "2026-03", text: "MiHER home energy rebates: $211M allocated to Michigan", category: "economic", direction: "up", source: "EGLE", href: "/environment#programs" },
  { id: "s9", date: "2026-06", text: "40% of MI households below ALICE Threshold in 2024 (13.4% poverty + 26.3% ALICE)", category: "economic", direction: "alert", source: "United For ALICE 2026 Report (2024 data)", href: "/equity" },
  { id: "s12", date: "2025-07", text: "Recidivism at 21.0%, lowest on state record; prison population lowest since 1991", category: "civic", direction: "down", source: "MDOC", href: "/reentry" },
  { id: "s13", date: "2026-07", text: "350 PFAS sites identified statewide", category: "environment", direction: "alert", source: "EGLE / MPART", href: "/environment#water-safety" },
  { id: "s15", date: "2026-11", text: "76 of 83 counties contain a designated dental shortage area", category: "health", direction: "alert", source: "HRSA HPSA file, AccessMI rollup", href: "/equity" },
];
