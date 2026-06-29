/**
 * Natural-language cohort query resolver (UC8 cross-cutting).
 * Maps chat-style questions to /cohort-builder deep links with criteria.
 */

import {
  criteriaToSearchParams,
  type CohortCriteria,
} from "@/utils/cohortFilter";

const MI_COUNTIES = [
  "Alcona", "Alger", "Allegan", "Alpena", "Antrim", "Arenac", "Baraga", "Barry",
  "Bay", "Benzie", "Berrien", "Branch", "Calhoun", "Cass", "Charlevoix",
  "Cheboygan", "Chippewa", "Clare", "Clinton", "Crawford", "Delta", "Dickinson",
  "Eaton", "Emmet", "Genesee", "Gladwin", "Gogebic", "Grand Traverse", "Gratiot",
  "Hillsdale", "Houghton", "Huron", "Ingham", "Ionia", "Iosco", "Iron", "Isabella",
  "Jackson", "Kalamazoo", "Kalkaska", "Kent", "Keweenaw", "Lake", "Lapeer",
  "Leelanau", "Lenawee", "Livingston", "Luce", "Mackinac", "Macomb", "Manistee",
  "Marquette", "Mason", "Mecosta", "Menominee", "Midland", "Missaukee", "Monroe",
  "Montcalm", "Montmorency", "Muskegon", "Newaygo", "Oakland", "Oceana", "Ogemaw",
  "Ontonagon", "Osceola", "Oscoda", "Otsego", "Ottawa", "Presque Isle",
  "Roscommon", "Saginaw", "Sanilac", "Schoolcraft", "Shiawassee", "St. Clair",
  "St. Joseph", "Tuscola", "Van Buren", "Washtenaw", "Wayne", "Wexford",
];

export interface CohortNlResult {
  matched: boolean;
  confidence: number;
  criteria: CohortCriteria;
  summary: string;
  href: string;
}

const COHORT_INTENT_PATTERNS = [
  /\b(zip|zips|cohort|filter|find)\b/i,
  /\b(high|elevated|above)\b.+\b(pm2\.?5|pollution|ej|energy|uninsured|poverty|pcp)\b/i,
  /\bwhich\b.+\b(zip|county|counties)\b/i,
  /\bpm2\.?5\b.+\b(primary care|uninsured|access)\b/i,
  /\benergy burden\b.+\b(poverty|zip)\b/i,
];

function detectCounties(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const county of MI_COUNTIES) {
    if (lower.includes(county.toLowerCase())) found.push(county);
  }
  return found;
}

function hasCohortIntent(text: string): boolean {
  return COHORT_INTENT_PATTERNS.some((re) => re.test(text));
}

/**
 * Resolve a natural-language query into cohort builder criteria.
 * Returns matched=false when the query does not look like a cohort request.
 */
export function resolveCohortFromNaturalLanguage(query: string): CohortNlResult {
  const trimmed = query.trim();
  const empty: CohortNlResult = {
    matched: false,
    confidence: 0,
    criteria: {},
    summary: "",
    href: "/cohort-builder",
  };

  if (!trimmed || !hasCohortIntent(trimmed)) return empty;

  const lower = trimmed.toLowerCase();
  const criteria: CohortCriteria = {};
  let signals = 0;

  const counties = detectCounties(trimmed);
  if (counties.length) {
    criteria.counties = counties;
    signals++;
  }

  if (
    /\b(pm2\.?5|particulate|air pollution|pollution)\b/.test(lower) &&
    /\b(high|elevated|worst|above)\b/.test(lower)
  ) {
    criteria.minPm25Percentile = 65;
    signals++;
  }

  if (/\b(ej\s*index|environmental justice|ej burden)\b/.test(lower)) {
    criteria.minEjIndex = 70;
    signals++;
  }

  if (/\benergy burden\b/.test(lower)) {
    criteria.minEnergyBurdenPct = 4.5;
    signals++;
  }

  if (/\b(uninsured|no insurance|coverage gap)\b/.test(lower)) {
    criteria.minUninsuredRate = 10;
    signals++;
  }

  if (/\b(poverty|low income)\b/.test(lower)) {
    criteria.minPovertyRate = 15;
    signals++;
  }

  if (/\b(pcp|primary care|doctor shortage|provider shortage)\b/.test(lower)) {
    criteria.minPcpRatio = 1500;
    signals++;
  }

  if (signals === 0) return empty;

  const parts: string[] = [];
  if (criteria.counties?.length) parts.push(`counties: ${criteria.counties.join(", ")}`);
  if (criteria.minPm25Percentile != null) parts.push(`PM2.5 >= ${criteria.minPm25Percentile}th pct`);
  if (criteria.minEjIndex != null) parts.push(`EJ index >= ${criteria.minEjIndex}`);
  if (criteria.minEnergyBurdenPct != null) parts.push(`energy burden >= ${criteria.minEnergyBurdenPct}%`);
  if (criteria.minUninsuredRate != null) parts.push(`uninsured >= ${criteria.minUninsuredRate}%`);
  if (criteria.minPovertyRate != null) parts.push(`poverty >= ${criteria.minPovertyRate}%`);
  if (criteria.minPcpRatio != null) parts.push(`PCP ratio >= ${criteria.minPcpRatio}:1`);

  const params = criteriaToSearchParams(criteria);
  const href = `/cohort-builder?${params.toString()}`;
  const confidence = Math.min(1, 0.35 + signals * 0.2);

  return {
    matched: true,
    confidence,
    criteria,
    summary: parts.join("; "),
    href,
  };
}