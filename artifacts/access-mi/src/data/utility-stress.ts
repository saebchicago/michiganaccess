/**
 * Utility Customer Stress - county-level summary types and stub data.
 * Based on MPSC quarterly utility data patterns.
 * All current values are ILLUSTRATIVE - real MPSC data integration pending.
 */

export type UtilityStressLevel = "low" | "medium" | "high" | "unknown";

export interface CountyUtilityStressSummary {
  countyId: string;
  disconnectionLevel: UtilityStressLevel;
  arrearsLevel: UtilityStressLevel;
  assistanceParticipationLevel: UtilityStressLevel;
  asOfQuarter?: string;
  sourceShort: string;
}

// Illustrative stub data - clearly labeled as example-only
const STUB_DATA: Record<string, Omit<CountyUtilityStressSummary, "countyId" | "sourceShort">> = {
  Wayne:     { disconnectionLevel: "high", arrearsLevel: "high", assistanceParticipationLevel: "high", asOfQuarter: "Q4 2024" },
  Oakland:   { disconnectionLevel: "low", arrearsLevel: "low", assistanceParticipationLevel: "medium", asOfQuarter: "Q4 2024" },
  Macomb:    { disconnectionLevel: "medium", arrearsLevel: "medium", assistanceParticipationLevel: "medium", asOfQuarter: "Q4 2024" },
  Genesee:   { disconnectionLevel: "high", arrearsLevel: "high", assistanceParticipationLevel: "high", asOfQuarter: "Q4 2024" },
  Kent:      { disconnectionLevel: "medium", arrearsLevel: "medium", assistanceParticipationLevel: "medium", asOfQuarter: "Q4 2024" },
  Washtenaw: { disconnectionLevel: "low", arrearsLevel: "low", assistanceParticipationLevel: "low", asOfQuarter: "Q4 2024" },
  Ingham:    { disconnectionLevel: "medium", arrearsLevel: "medium", assistanceParticipationLevel: "medium", asOfQuarter: "Q4 2024" },
  Kalamazoo: { disconnectionLevel: "medium", arrearsLevel: "medium", assistanceParticipationLevel: "medium", asOfQuarter: "Q4 2024" },
  Saginaw:   { disconnectionLevel: "high", arrearsLevel: "high", assistanceParticipationLevel: "high", asOfQuarter: "Q4 2024" },
  Muskegon:  { disconnectionLevel: "medium", arrearsLevel: "high", assistanceParticipationLevel: "medium", asOfQuarter: "Q4 2024" },
};

export function getCountyUtilityStressSummary(countyId: string): CountyUtilityStressSummary {
  const stub = STUB_DATA[countyId];
  if (stub) {
    return { countyId, ...stub, sourceShort: "MPSC quarterly utility data (illustrative)" };
  }
  return {
    countyId,
    disconnectionLevel: "unknown",
    arrearsLevel: "unknown",
    assistanceParticipationLevel: "unknown",
    sourceShort: "MPSC quarterly utility data (not yet mapped)",
  };
}

export function stressLevelColor(level: UtilityStressLevel): string {
  switch (level) {
    case "low": return "text-michigan-forest-deep";
    case "medium": return "text-amber-600";
    case "high": return "text-destructive";
    default: return "text-muted-foreground";
  }
}

export function stressLevelBg(level: UtilityStressLevel): string {
  switch (level) {
    case "low": return "bg-michigan-forest/10";
    case "medium": return "bg-amber-100 dark:bg-amber-950/30";
    case "high": return "bg-destructive/10";
    default: return "bg-muted/30";
  }
}
