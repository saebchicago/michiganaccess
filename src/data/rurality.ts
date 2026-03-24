/**
 * USDA ERS Rural-Urban Commuting Area (RUCA) Codes.
 * Source: ers.usda.gov
 * Classification of Michigan ZIP codes by rurality.
 */

export type RuralityClass = "Urban" | "Suburban" | "Small Town" | "Rural";

export function getRuralityClass(ruca: number): RuralityClass {
  if (ruca <= 3) return "Urban";
  if (ruca <= 6) return "Suburban";
  if (ruca <= 9) return "Small Town";
  return "Rural";
}

export const RURALITY_ICONS: Record<RuralityClass, string> = {
  Urban: "\u{1F3D9}\u{FE0F}",      // city
  Suburban: "\u{1F3D8}\u{FE0F}",   // houses
  "Small Town": "\u{1F3E1}",       // house with garden
  Rural: "\u{1F33E}",              // sheaf of rice
};

export interface ZipRuca {
  ruca: number;
  class: RuralityClass;
}

export const ZIP_RUCA: Record<string, ZipRuca> = {
  // Metro Urban (RUCA 1)
  "48201": { ruca: 1, class: "Urban" },
  "48126": { ruca: 1, class: "Urban" },
  "48075": { ruca: 1, class: "Urban" },
  "48084": { ruca: 1, class: "Urban" },
  "48103": { ruca: 1, class: "Urban" },
  "49503": { ruca: 1, class: "Urban" },
  "48823": { ruca: 1, class: "Urban" },
  "48502": { ruca: 1, class: "Urban" },
  "48601": { ruca: 1, class: "Urban" },
  "49001": { ruca: 1, class: "Urban" },
  "48154": { ruca: 1, class: "Urban" },
  "48067": { ruca: 1, class: "Urban" },
  "48310": { ruca: 1, class: "Urban" },
  "48009": { ruca: 1, class: "Urban" },
  "48375": { ruca: 1, class: "Urban" },
  "48197": { ruca: 1, class: "Urban" },
  "48146": { ruca: 1, class: "Urban" },
  "48180": { ruca: 1, class: "Urban" },
  "48335": { ruca: 1, class: "Urban" },
  "48228": { ruca: 1, class: "Urban" },
  "48205": { ruca: 1, class: "Urban" },
  "49508": { ruca: 1, class: "Urban" },
  "48170": { ruca: 1, class: "Urban" },
  "48085": { ruca: 1, class: "Urban" },
  "48912": { ruca: 1, class: "Urban" },
  "48043": { ruca: 1, class: "Urban" },
  "48071": { ruca: 1, class: "Urban" },
  "49546": { ruca: 1, class: "Urban" },
  // Suburban (RUCA 4)
  "49684": { ruca: 4, class: "Suburban" },
  "49855": { ruca: 4, class: "Suburban" },
  // Small Town (RUCA 7)
  "49770": { ruca: 7, class: "Small Town" },
  "49801": { ruca: 7, class: "Small Town" },
  "48801": { ruca: 7, class: "Small Town" },
  // Rural (RUCA 10)
  "49783": { ruca: 10, class: "Rural" },
  "49938": { ruca: 10, class: "Rural" },
};
