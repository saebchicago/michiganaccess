/**
 * Michigan languages spoken at home, population age 5 and older (9,536,435).
 * Source: Census ACS 5-year 2020-2024, table B16001, Michigan. Top ten single
 * languages; the residual "Other Indo-European languages" group is omitted.
 * pctOfPop = speakers / population age 5+. "Somali/Amharic*" is the Census
 * group "Amharic, Somali, or other Afro-Asiatic languages".
 * LANGUAGE_HOTSPOTS: Data USA and AAPI Vote Michigan county profiles.
 */

export const MI_LANGUAGES = [
  { code: "es", name: "Spanish", speakers: 298830, pctOfPop: 3.1 },
  { code: "ar", name: "Arabic", speakers: 172609, pctOfPop: 1.8 },
  { code: "zh", name: "Chinese", speakers: 46756, pctOfPop: 0.5 },
  { code: "de", name: "German", speakers: 30618, pctOfPop: 0.3 },
  { code: "bn", name: "Bengali", speakers: 29564, pctOfPop: 0.3 },
  { code: "so", name: "Somali/Amharic*", speakers: 29447, pctOfPop: 0.3 },
  { code: "fr", name: "French", speakers: 20857, pctOfPop: 0.2 },
  { code: "hi", name: "Hindi", speakers: 20783, pctOfPop: 0.2 },
  { code: "ko", name: "Korean", speakers: 16978, pctOfPop: 0.2 },
  { code: "tl", name: "Tagalog", speakers: 16539, pctOfPop: 0.2 },
];

export const LANGUAGE_HOTSPOTS: Record<string, string[]> = {
  "Wayne": ["Arabic", "Spanish", "Bengali", "Somali"],
  "Oakland": ["Arabic", "Chinese", "Hindi", "Spanish"],
  "Washtenaw": ["Chinese", "Korean", "Spanish", "Arabic"],
  "Kent": ["Spanish", "Somali", "Vietnamese", "Burmese"],
  "Ingham": ["Spanish", "Chinese", "Arabic", "Korean"],
  "Kalamazoo": ["Spanish", "Chinese", "Arabic", "Vietnamese"],
  "Genesee": ["Spanish", "Arabic", "Somali"],
  "Ottawa": ["Spanish"],
  "Macomb": ["Arabic", "Polish", "Albanian"],
  "Calhoun": ["Spanish", "Burmese", "Karen"],
};
