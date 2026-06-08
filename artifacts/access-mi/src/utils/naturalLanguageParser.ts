import { MICHIGAN_COUNTIES } from "@/contexts/CountyContext";
import { ZIP_TO_COUNTY, MICHIGAN_CITIES } from "@/data/michigan-county-seats";

/**
 * Natural Language Parser for hero search.
 * Parses complex queries like "affordable dental in Wayne" into structured intent.
 */

export interface ParsedIntent {
  service: string | null;
  modifiers: string[];
  county: string | null;
  category: string | null;
  resolvedHref: string;
  explanation: string;
}

/* ── Synonym map: common terms → canonical service + category ── */
const SERVICE_SYNONYMS: Record<string, { canonical: string; category: string }> = {
  // Healthcare
  doctor: { canonical: "doctor", category: "doctor" },
  physician: { canonical: "doctor", category: "doctor" },
  "primary care": { canonical: "primary care", category: "doctor" },
  dentist: { canonical: "dentist", category: "dentist" },
  dental: { canonical: "dental care", category: "dentist" },
  "dental care": { canonical: "dental care", category: "dentist" },
  therapist: { canonical: "mental health", category: "mental-health" },
  counselor: { canonical: "mental health", category: "mental-health" },
  psychiatrist: { canonical: "psychiatry", category: "mental-health" },
  "mental health": { canonical: "mental health", category: "mental-health" },
  clinic: { canonical: "clinic", category: "fqhc" },
  "health center": { canonical: "health center", category: "fqhc" },
  hospital: { canonical: "hospital", category: "doctor" },
  pharmacy: { canonical: "pharmacy", category: "doctor" },
  pediatrician: { canonical: "pediatrics", category: "doctor" },
  "ob/gyn": { canonical: "OB/GYN", category: "doctor" },
  obgyn: { canonical: "OB/GYN", category: "doctor" },
  // Programs
  snap: { canonical: "SNAP", category: "food" },
  "food stamps": { canonical: "SNAP", category: "food" },
  ebt: { canonical: "SNAP / EBT", category: "food" },
  mibridges: { canonical: "MiBridges", category: "financial" },
  wic: { canonical: "WIC", category: "food" },
  medicaid: { canonical: "Medicaid", category: "insurance" },
  "healthy michigan": { canonical: "Healthy Michigan Plan", category: "insurance" },
  medicare: { canonical: "Medicare", category: "insurance" },
  liheap: { canonical: "LIHEAP", category: "utility" },
  tanf: { canonical: "TANF", category: "financial" },
  ssi: { canonical: "SSI", category: "financial" },
  "section 8": { canonical: "Section 8 Housing", category: "housing" },
  // Basic needs
  "food pantry": { canonical: "food pantry", category: "food" },
  "food bank": { canonical: "food bank", category: "food" },
  food: { canonical: "food assistance", category: "food" },
  shelter: { canonical: "shelter", category: "housing" },
  housing: { canonical: "housing", category: "housing" },
  rent: { canonical: "rental assistance", category: "housing" },
  "rent help": { canonical: "rental assistance", category: "housing" },
  utility: { canonical: "utility assistance", category: "utility" },
  energy: { canonical: "energy assistance", category: "utility" },
  transportation: { canonical: "transportation", category: "transportation" },
  transit: { canonical: "public transit", category: "transportation" },
  bus: { canonical: "bus routes", category: "transportation" },
  // Other
  "legal aid": { canonical: "legal aid", category: "legal" },
  lawyer: { canonical: "legal aid", category: "legal" },
  insurance: { canonical: "health insurance", category: "insurance" },
  narcan: { canonical: "Narcan / Naloxone", category: "substance-use" },
  naloxone: { canonical: "Narcan / Naloxone", category: "substance-use" },
  addiction: { canonical: "addiction treatment", category: "substance-use" },
  rehab: { canonical: "substance use treatment", category: "substance-use" },
};

/* ── Modifier keywords ── */
const MODIFIER_KEYWORDS = [
  "free", "affordable", "low-cost", "low cost", "cheap", "sliding scale",
  "walk-in", "walk in", "urgent", "emergency", "24/7", "bilingual",
  "spanish", "arabic", "wheelchair", "ada", "accessible",
  "no insurance", "uninsured", "accepting patients",
];

/* ── Location prepositions ── */
const LOCATION_PREPS = ["in", "near", "around", "for"];

/**
 * Parse a natural language query into structured intent.
 */
export function parseNaturalLanguage(query: string): ParsedIntent {
  const raw = query.trim();
  if (!raw) return { service: null, modifiers: [], county: null, category: null, resolvedHref: "/find-care", explanation: "" };

  let q = raw.toLowerCase();
  const modifiers: string[] = [];
  let county: string | null = null;
  let service: string | null = null;
  let category: string | null = null;

  // 0. Extract ZIP code and resolve to county (full 5-digit match first, then 3-digit prefix)
  const zipMatch = q.match(/\b(\d{5})\b/);
  if (zipMatch) {
    const zip = zipMatch[1];
    // Try exact city match first (more accurate than prefix)
    const cityMatch = MICHIGAN_CITIES.find(c => c.zip === zip);
    if (cityMatch) {
      county = cityMatch.county;
    } else {
      const zipCounty = ZIP_TO_COUNTY[zip.slice(0, 3)];
      if (zipCounty) county = zipCounty;
    }
    q = q.replace(zip, " ").replace(/\s+/g, " ").trim();
  }

  // 1. Extract modifiers
  for (const mod of MODIFIER_KEYWORDS) {
    if (q.includes(mod)) {
      modifiers.push(mod);
      q = q.replace(mod, " ").replace(/\s+/g, " ").trim();
    }
  }

  // 2. Extract county (e.g., "in Wayne", "near Oakland") - skip if already found via ZIP
  if (!county) {
    for (const prep of LOCATION_PREPS) {
      for (const c of MICHIGAN_COUNTIES) {
        const pattern = new RegExp(`\\b${prep}\\s+${c.toLowerCase()}(?:\\s+county)?\\b`, "i");
        if (pattern.test(q)) {
          county = c;
          q = q.replace(pattern, " ").replace(/\s+/g, " ").trim();
          break;
        }
      }
      if (county) break;
    }
  }

  // Also check for bare county name at the end
  if (!county) {
    for (const c of MICHIGAN_COUNTIES) {
      const cl = c.toLowerCase();
      if (q.endsWith(` ${cl}`) || q === cl) {
        county = c;
        q = q.replace(new RegExp(`\\b${cl}\\b$`), "").trim();
        break;
      }
    }
  }

  // 3. Match service terms (longest match first)
  const sortedKeys = Object.keys(SERVICE_SYNONYMS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (q.includes(key)) {
      service = SERVICE_SYNONYMS[key].canonical;
      category = SERVICE_SYNONYMS[key].category;
      break;
    }
  }

  // 4. Build resolved href
  let resolvedHref: string;
  const countySlug = county?.toLowerCase().replace(/[\s.]+/g, "-");

  if (county && service) {
    if (category && ["food", "housing", "utility", "transportation", "insurance", "financial", "legal"].includes(category)) {
      resolvedHref = `/resources?category=${category}&county=${encodeURIComponent(county)}`;
    } else {
      resolvedHref = `/find-care?county=${encodeURIComponent(county)}&q=${encodeURIComponent(service)}`;
    }
  } else if (county) {
    resolvedHref = `/place/${countySlug}-county`;
  } else if (category && ["food", "housing", "utility", "transportation", "insurance", "financial", "legal"].includes(category)) {
    resolvedHref = `/resources?category=${category}`;
  } else {
    resolvedHref = `/find-care?q=${encodeURIComponent(raw)}`;
  }

  // 5. Build explanation
  const parts: string[] = [];
  if (service) parts.push(service);
  if (modifiers.length) parts.push(`(${modifiers.join(", ")})`);
  if (county) parts.push(`in ${county} County`);
  const explanation = parts.length > 0 ? `Searching for ${parts.join(" ")}` : "";

  return { service, modifiers, county, category, resolvedHref, explanation };
}
