// Live water quality data from multiple public APIs
// No API keys required for any of these endpoints

import { useQuery } from "@tanstack/react-query";

// ── EPA Safe Drinking Water Information System (SDWIS) ──

export interface DrinkingWaterViolation {
  pwsid: string;
  pwsName: string;
  county: string;
  violationCode: string;
  violationDescription: string;
  violationCategory: string;
  compliancePeriodBegin: string;
  compliancePeriodEnd: string;
  isHealthBased: boolean;
  source: string;
}

export async function fetchDrinkingWaterViolations(
  county: string
): Promise<DrinkingWaterViolation[]> {
  try {
    const url = `https://enviro.epa.gov/enviro/efservice/` +
      `WATER_SYSTEM_SUMMARY/STATE_CODE/MI/` +
      `COUNTY_SERVED/${encodeURIComponent(county.toUpperCase())}/` +
      `VIOLATION_EXISTS/Y/JSON`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).slice(0, 20).map((d: Record<string, string>) => ({
      pwsid: d.PWSID ?? "",
      pwsName: d.PWS_NAME ?? "",
      county,
      violationCode: d.VIOLATION_CODE ?? "",
      violationDescription: d.VIOLATION_DESC ?? "",
      violationCategory: d.VIOLATION_CATEGORY_CODE ?? "",
      compliancePeriodBegin: d.COMPL_PER_BEGIN_DATE ?? "",
      compliancePeriodEnd: d.COMPL_PER_END_DATE ?? "",
      isHealthBased: d.IS_HEALTH_BASED_IND === "Y",
      source: "EPA Safe Drinking Water Information System",
    }));
  } catch {
    return [];
  }
}

export function useDrinkingWaterViolations(county: string | null) {
  return useQuery({
    queryKey: ["water-violations", county],
    queryFn: () => county
      ? fetchDrinkingWaterViolations(county)
      : Promise.resolve([]),
    enabled: !!county,
    staleTime: 1000 * 60 * 60 * 6,
    retry: 1,
  });
}
