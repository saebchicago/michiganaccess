/** Michigan language access data. Source: Census ACS 2022-2024, Data USA, AAPI Vote Michigan */

export const MI_LANGUAGES = [
  { code: "es", name: "Spanish", speakers: 298830, pctOfPop: 3.0 },
  { code: "ar", name: "Arabic", speakers: 172609, pctOfPop: 1.7 },
  { code: "zh", name: "Chinese", speakers: 46756, pctOfPop: 0.5 },
  { code: "de", name: "German", speakers: 32254, pctOfPop: 0.3 },
  { code: "so", name: "Somali/Amharic", speakers: 30293, pctOfPop: 0.3 },
  { code: "bn", name: "Bengali", speakers: 21627, pctOfPop: 0.2 },
  { code: "fr", name: "French", speakers: 21522, pctOfPop: 0.2 },
  { code: "hi", name: "Hindi", speakers: 20831, pctOfPop: 0.2 },
  { code: "pl", name: "Polish", speakers: 18036, pctOfPop: 0.2 },
  { code: "tl", name: "Tagalog", speakers: 15674, pctOfPop: 0.2 },
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
