// Census ACS 5-Year Estimates — direct public API, no key required
// Focused on race/ethnicity, language, disability demographics by ZIP
// Docs: api.census.gov/data/2022/acs/acs5

import { useQuery } from "@tanstack/react-query";

export interface ZIPDemographics {
  zip: string;
  totalPop: number;
  white_alone_pct: number;
  black_alone_pct: number;
  asian_alone_pct: number;
  hispanic_pct: number;
  multiracial_pct: number;
  lep_pct: number;
  spanish_speakers_pct: number;
  arabic_speakers_pct: number;
  disability_pct: number;
  renter_pct: number;
  owner_pct: number;
  medianHouseholdIncome: number;
  miStateWhitePct: number;
  miStateBlackPct: number;
  miStateHispanicPct: number;
  miStateDisabilityPct: number;
  miStateLEPPct: number;
  source: string;
}

export async function fetchZIPDemographics(zip: string): Promise<ZIPDemographics | null> {
  try {
    const vars = [
      "B01003_001E", "B02001_002E", "B02001_003E", "B02001_005E",
      "B03003_003E", "B16001_001E", "B16001_004E", "B16001_024E",
      "B18101_001E", "B18101_004E", "B19013_001E",
      "B25003_001E", "B25003_002E", "B25003_003E",
    ].join(",");

    const url = `https://api.census.gov/data/2022/acs/acs5?get=${vars}&for=zip%20code%20tabulation%20area:${zip}&in=state:26`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length < 2) return null;

    const headers = data[0] as string[];
    const values = data[1] as string[];
    const r: Record<string, number> = {};
    headers.forEach((h, i) => { r[h] = parseFloat(values[i]) || 0; });

    const pop = r["B01003_001E"] || 1;
    const housing = r["B25003_001E"] || 1;
    const speakers = r["B16001_001E"] || 1;
    const disUniverse = r["B18101_001E"] || 1;

    const w = (r["B02001_002E"] / pop) * 100;
    const b = (r["B02001_003E"] / pop) * 100;
    const a = (r["B02001_005E"] / pop) * 100;
    const h = (r["B03003_003E"] / pop) * 100;
    const sp = (r["B16001_004E"] / speakers) * 100;
    const ar = (r["B16001_024E"] / speakers) * 100;

    return {
      zip, totalPop: pop,
      white_alone_pct: w, black_alone_pct: b, asian_alone_pct: a,
      hispanic_pct: h, multiracial_pct: Math.max(0, 100 - w - b - a - h),
      spanish_speakers_pct: sp, arabic_speakers_pct: ar,
      lep_pct: sp + ar,
      disability_pct: (r["B18101_004E"] / disUniverse) * 100,
      renter_pct: (r["B25003_003E"] / housing) * 100,
      owner_pct: (r["B25003_002E"] / housing) * 100,
      medianHouseholdIncome: r["B19013_001E"],
      miStateWhitePct: 78.8, miStateBlackPct: 13.9,
      miStateHispanicPct: 5.6, miStateDisabilityPct: 15.2, miStateLEPPct: 5.8,
      source: "Census ACS 5-Year Estimates 2022",
    };
  } catch {
    return null;
  }
}

export function useZIPDemographics(zip: string | null) {
  return useQuery({
    queryKey: ["census-demographics", zip],
    queryFn: () => zip ? fetchZIPDemographics(zip) : null,
    enabled: !!zip,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}
