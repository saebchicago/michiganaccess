import { MICHIGAN_COUNTIES } from "@/contexts/CountyContext";

/* ── Keyword dictionary for autocomplete & fuzzy correction ── */

const KEYWORD_SUGGESTIONS: { term: string; label: string; href: string; category: string }[] = [
  // Programs
  { term: "wic", label: "WIC (Women, Infants & Children)", href: "/find-care?q=WIC", category: "program" },
  { term: "snap", label: "SNAP / Food Assistance", href: "/financial-help", category: "program" },
  { term: "medicaid", label: "Medicaid / Healthy Michigan", href: "/financial-help", category: "program" },
  { term: "medicare", label: "Medicare", href: "/financial-help", category: "program" },
  { term: "liheap", label: "LIHEAP (Heating Assistance)", href: "/financial-help", category: "program" },
  { term: "section 8", label: "Section 8 Housing", href: "/resources", category: "program" },
  { term: "tanf", label: "TANF (Cash Assistance)", href: "/financial-help", category: "program" },
  { term: "ssi", label: "SSI / Disability Benefits", href: "/financial-help", category: "program" },
  // Services
  { term: "food pantry", label: "Food Pantries", href: "/resources", category: "service" },
  { term: "food bank", label: "Food Banks", href: "/resources", category: "service" },
  { term: "shelter", label: "Emergency Shelters", href: "/resources", category: "service" },
  { term: "housing", label: "Housing Assistance", href: "/resources", category: "service" },
  { term: "dental", label: "Dental Care", href: "/find-care", category: "service" },
  { term: "mental health", label: "Mental Health Services", href: "/find-care", category: "service" },
  { term: "substance abuse", label: "Substance Abuse Treatment", href: "/find-care", category: "service" },
  { term: "transportation", label: "Transportation Services", href: "/transportation", category: "service" },
  { term: "legal aid", label: "Legal Aid Services", href: "/resources", category: "service" },
  { term: "insurance", label: "Insurance Help", href: "/health/insurance-appeals", category: "service" },
  { term: "prescription", label: "Prescription Assistance", href: "/financial-help", category: "service" },
  { term: "pharmacy", label: "Pharmacy", href: "/find-care", category: "service" },
  { term: "urgent care", label: "Urgent Care", href: "/find-care", category: "service" },
  { term: "clinic", label: "Community Clinics", href: "/find-care", category: "service" },
  { term: "doctor", label: "Find a Doctor", href: "/find-care", category: "service" },
  { term: "pediatrics", label: "Pediatrics", href: "/find-care", category: "service" },
  { term: "ob/gyn", label: "OB/GYN", href: "/find-care", category: "service" },
  { term: "energy", label: "Energy Assistance", href: "/financial-help", category: "service" },
  { term: "utility", label: "Utility Help", href: "/financial-help", category: "service" },
  { term: "outage", label: "Utility Outages", href: "/outages", category: "service" },
  { term: "air quality", label: "Air Quality", href: "/environment", category: "service" },
  // Topics
  { term: "covid", label: "COVID-19 Resources", href: "/conditions", category: "topic" },
  { term: "diabetes", label: "Diabetes Resources", href: "/conditions", category: "topic" },
  { term: "cancer", label: "Cancer Resources", href: "/conditions", category: "topic" },
  { term: "heart", label: "Heart Health", href: "/conditions", category: "topic" },
  { term: "asthma", label: "Asthma Resources", href: "/conditions", category: "topic" },
  { term: "addiction", label: "Addiction & Recovery", href: "/find-care", category: "topic" },
  { term: "narcan", label: "Narcan / Naloxone Locator", href: "/find-care", category: "topic" },
];

const POPULAR_SEARCHES = [
  { label: "Find a Doctor", href: "/find-care" },
  { label: "Food Assistance", href: "/resources" },
  { label: "Medicaid / Insurance Help", href: "/financial-help" },
  { label: "Utility Outages", href: "/outages" },
  { label: "Mental Health", href: "/find-care" },
  { label: "Transportation", href: "/transportation" },
];

/* ── Common misspellings → corrections ── */
const MISSPELLINGS: Record<string, string> = {
  wick: "wic", whic: "wic", wik: "wic",
  medcaid: "medicaid", medicad: "medicaid", medicaide: "medicaid", medacaid: "medicaid",
  medcare: "medicare", medicar: "medicare",
  snapp: "snap", snaap: "snap",
  sheltor: "shelter", sheltter: "shelter",
  hosptial: "hospital", hosptal: "hospital", hopital: "hospital",
  dentel: "dental", dentl: "dental",
  perscription: "prescription", presciption: "prescription", prescripion: "prescription",
  pharamcy: "pharmacy", pharmcy: "pharmacy", pharmasy: "pharmacy",
  transportion: "transportation", transportaion: "transportation",
  insurence: "insurance", insuranse: "insurance", insurnace: "insurance",
  docter: "doctor", docotr: "doctor",
  pediactrics: "pediatrics", pedatrics: "pediatrics",
  substanse: "substance", substence: "substance",
  mentl: "mental", mentall: "mental",
  enegy: "energy", enrgy: "energy",
  utilty: "utility", utlity: "utility",
  housin: "housing", houseing: "housing",
  legall: "legal", leagal: "legal",
  urgant: "urgent", urgnet: "urgent",
  clinc: "clinic", clinik: "clinic",
  addiciton: "addiction", addicton: "addiction",
  diabetis: "diabetes", diabeties: "diabetes",
  cancr: "cancer", caner: "cancer",
  asthama: "asthma", asthm: "asthma",
  outag: "outage", outages: "outage",
};

/* ── Levenshtein distance for fuzzy matching ── */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

export interface SearchSuggestion {
  label: string;
  href: string;
  category: "keyword" | "county" | "popular" | "correction";
  matchedTerm?: string;
}

/**
 * Autocomplete: given partial input, return matching suggestions.
 * Handles misspelling correction, county matching, keyword matching.
 */
export function getSearchSuggestions(query: string, maxResults = 8): SearchSuggestion[] {
  if (!query || query.length < 2) return [];
  const rawQ = query.toLowerCase().trim();
  const { term: parsedTerm, county: comboCounty } = parseComboQuery(rawQ);
  // Search both the raw query and parsed term (for combo queries like "food pantry wayne")
  const q = rawQ;
  const altQ = comboCounty ? parsedTerm : null;
  const results: SearchSuggestion[] = [];

  // 1. Direct keyword matches (check both raw and parsed term)
  for (const kw of KEYWORD_SUGGESTIONS) {
    if (kw.term.includes(q) || kw.label.toLowerCase().includes(q) ||
        (altQ && (kw.term.includes(altQ) || kw.label.toLowerCase().includes(altQ)))) {
      const label = comboCounty ? `${kw.label} in ${comboCounty} County` : kw.label;
      const href = comboCounty ? `/county/${comboCounty.toLowerCase().replace(/[\s.]+/g, "-")}` : kw.href;
      results.push({ label, href, category: "keyword" });
    }
  }

  // 2. County matches
  for (const county of MICHIGAN_COUNTIES) {
    if (county.toLowerCase().includes(q)) {
      results.push({
        label: `${county} County`,
        href: `/county/${county.toLowerCase().replace(/[\s.]+/g, "-")}`,
        category: "county",
      });
    }
  }

  // 3. If few results, try misspelling correction
  if (results.length < 3) {
    const correction = MISSPELLINGS[q];
    if (correction) {
      const corrected = KEYWORD_SUGGESTIONS.find((kw) => kw.term === correction);
      if (corrected && !results.some((r) => r.label === corrected.label)) {
        results.unshift({
          label: corrected.label,
          href: corrected.href,
          category: "correction",
          matchedTerm: correction,
        });
      }
    }

    // Fuzzy match keywords (Levenshtein ≤ 2)
    if (results.length < 3 && q.length >= 3) {
      for (const kw of KEYWORD_SUGGESTIONS) {
        if (results.some((r) => r.label === kw.label)) continue;
        if (levenshtein(q, kw.term) <= 2) {
          results.push({
            label: kw.label,
            href: kw.href,
            category: "correction",
            matchedTerm: kw.term,
          });
        }
        if (results.length >= maxResults) break;
      }
    }
  }

  return results.slice(0, maxResults);
}

/**
 * Parse combo queries like "food pantry wayne" into { term, county }.
 */
export function parseComboQuery(query: string): { term: string; county: string | null } {
  const q = query.toLowerCase().trim();
  for (const county of MICHIGAN_COUNTIES) {
    const cl = county.toLowerCase();
    if (q.includes(cl)) {
      const term = q.replace(cl, "").replace(/\s+/g, " ").trim();
      return { term: term || q, county };
    }
  }
  return { term: q, county: null };
}

/**
 * Get popular/fallback suggestions when search is empty.
 */
export function getPopularSuggestions(): SearchSuggestion[] {
  return POPULAR_SEARCHES.map((s) => ({ ...s, category: "popular" as const }));
}

/**
 * Check if a query looks like a misspelling and return the correction.
 */
export function getMisspellingCorrection(query: string): string | null {
  const q = query.toLowerCase().trim();
  if (MISSPELLINGS[q]) return MISSPELLINGS[q];
  // Check first word
  const firstWord = q.split(/\s+/)[0];
  if (firstWord && MISSPELLINGS[firstWord]) return MISSPELLINGS[firstWord];
  return null;
}
