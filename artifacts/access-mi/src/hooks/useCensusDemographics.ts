// Census ACS 5-Year Estimates
// Focused on race/ethnicity, language, disability demographics by ZIP
// Docs: api.census.gov/data/{ACS5_YEAR}/acs/acs5 (see src/config/acsVintage.ts)

import { useQuery } from "@tanstack/react-query";
import { ACS5_LABEL, ACS5_YEAR } from "@/config/acsVintage";
import { parseAcsEstimate, parseAcsMoe } from "@/lib/censusValue";
import { ratioMoe } from "@/lib/reliability";

export type ZIPPctKey =
  | "white_alone_pct"
  | "black_alone_pct"
  | "asian_alone_pct"
  | "hispanic_pct"
  | "multiracial_pct"
  | "lep_pct"
  | "spanish_speakers_pct"
  | "arabic_speakers_pct"
  | "disability_pct"
  | "renter_pct"
  | "owner_pct";

export type ZIPFieldKey = ZIPPctKey | "totalPop" | "medianHouseholdIncome";

/** A figure is null when Census returned a sentinel, a blank, or when a
 * numerator or denominator it depends on is null. Never 0 or negative as a
 * stand-in. `unavailableReasons` says why, for the "Data unavailable" UI. */
export interface ZIPDemographics {
  zip: string;
  totalPop: number | null;
  white_alone_pct: number | null;
  black_alone_pct: number | null;
  asian_alone_pct: number | null;
  hispanic_pct: number | null;
  multiracial_pct: number | null;
  lep_pct: number | null;
  spanish_speakers_pct: number | null;
  arabic_speakers_pct: number | null;
  disability_pct: number | null;
  renter_pct: number | null;
  owner_pct: number | null;
  medianHouseholdIncome: number | null;
  source: string;
  /** Published ACS margins of error (90% confidence) per estimate variable
   * (e.g. "B19013_001E"). Variables with no usable MOE are omitted. */
  moe: Record<string, number>;
  /** Derived MOE for each percentage, in percentage points, from the Census
   * proportion formula (see ratioMoe in src/lib/reliability.ts). Null when
   * any input MOE is unavailable. */
  pctMoe: Record<ZIPPctKey, number | null>;
  unavailableReasons: Partial<Record<ZIPFieldKey, string>>;
}

export const ZIP_ESTIMATE_VARS = [
  "B01003_001E", "B02001_002E", "B02001_003E", "B02001_005E",
  "B03003_003E", "B16001_001E", "B16001_003E", "B16001_105E",
  "B02001_008E", "B19013_001E",
  "B25003_001E", "B25003_002E", "B25003_003E",
];

interface Cell { v: number | null; moe: number | null; note?: string }

/**
 * Pure builder: turns one Census response row into ZIPDemographics. Exported
 * for tests. Sentinels (-666666666 etc.) become null, never numbers.
 */
export function buildZIPDemographics(
  zip: string,
  headers: string[],
  values: (string | null)[],
): ZIPDemographics {
  const raw: Record<string, string | null> = {};
  headers.forEach((h, i) => { raw[h] = values[i] ?? null; });

  const cell = (code: string): Cell => {
    const e = parseAcsEstimate(raw[code]);
    return { v: e.value, moe: parseAcsMoe(raw[code.replace(/E$/, "M")]), note: e.note };
  };

  const reasons: Partial<Record<ZIPFieldKey, string>> = {};
  const pctMoe = {} as Record<ZIPPctKey, number | null>;
  const moe: Record<string, number> = {};
  for (const v of ZIP_ESTIMATE_VARS) {
    const m = parseAcsMoe(raw[v.replace(/E$/, "M")]);
    if (m !== null) moe[v] = m;
  }

  const pop = cell("B01003_001E");
  const housing = cell("B25003_001E");
  const speakers = cell("B16001_001E");

  const pct = (key: ZIPPctKey, num: Cell, den: Cell): number | null => {
    if (num.v === null || den.v === null || den.v === 0) {
      reasons[key] = num.v === null ? num.note ?? "Numerator unavailable"
        : den.v === null ? `Denominator unavailable: ${den.note ?? "missing"}`
        : "Denominator is zero";
      pctMoe[key] = null;
      return null;
    }
    const m = ratioMoe(num.v, num.moe, den.v, den.moe);
    pctMoe[key] = m === null ? null : m * 100;
    return (num.v / den.v) * 100;
  };

  const w = pct("white_alone_pct", cell("B02001_002E"), pop);
  const b = pct("black_alone_pct", cell("B02001_003E"), pop);
  const a = pct("asian_alone_pct", cell("B02001_005E"), pop);
  const h = pct("hispanic_pct", cell("B03003_003E"), pop);
  const sp = pct("spanish_speakers_pct", cell("B16001_003E"), speakers);
  const ar = pct("arabic_speakers_pct", cell("B16001_105E"), speakers);
  const profilePct = (key: ZIPPctKey, code: string): number | null => {
    const estimate = parseAcsEstimate(raw[code + "PE"]);
    if (estimate.value === null) reasons[key] = estimate.note;
    pctMoe[key] = parseAcsMoe(raw[code + "PM"]);
    return estimate.value;
  };
  const disability = profilePct("disability_pct", "DP02_0072");
  const lep = profilePct("lep_pct", "DP02_0115");
  const multi = pct("multiracial_pct", cell("B02001_008E"), pop);
  const renter = pct("renter_pct", cell("B25003_003E"), housing);
  const owner = pct("owner_pct", cell("B25003_002E"), housing);

  const income = cell("B19013_001E");
  if (pop.v === null) reasons.totalPop = pop.note;
  if (income.v === null) reasons.medianHouseholdIncome = income.note;

  return {
    zip, totalPop: pop.v,
    white_alone_pct: w, black_alone_pct: b, asian_alone_pct: a,
    hispanic_pct: h, multiracial_pct: multi,
    spanish_speakers_pct: sp, arabic_speakers_pct: ar,
    lep_pct: lep,
    disability_pct: disability,
    renter_pct: renter,
    owner_pct: owner,
    medianHouseholdIncome: income.v,
    source: `Census ${ACS5_LABEL}`,
    moe, pctMoe, unavailableReasons: reasons,
  };
}

export async function fetchZIPDemographics(zip: string): Promise<ZIPDemographics | null> {
  if (!/^\d{5}$/.test(zip)) return null;
  const geo = "zip code tabulation area";
  const read = async (dataset: string, variables: string[]) => {
    const params = new URLSearchParams({ get: variables.join(","), for: `${geo}:${zip}` });
    try {
      const res = await fetch(`https://api.census.gov/data/${ACS5_YEAR}/acs/${dataset}?${params}`);
      if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return null;
      const [headers, row] = await res.json();
      if (!Array.isArray(headers) || !Array.isArray(row) || row[headers.indexOf(geo)] !== zip) return null;
      return { headers, row };
    } catch {
      return null;
    }
  };
  const [detail, profile] = await Promise.all([
    read("acs5", [...ZIP_ESTIMATE_VARS, ...ZIP_ESTIMATE_VARS.map((v) => v.replace(/E$/, "M"))]),
    read("acs5/profile", ["DP02_0072PE", "DP02_0072PM", "DP02_0115PE", "DP02_0115PM"]),
  ]);
  if (!detail && !profile) return null;
  return buildZIPDemographics(zip, [...(detail?.headers ?? []), ...(profile?.headers ?? [])],
    [...(detail?.row ?? []), ...(profile?.row ?? [])]);
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
