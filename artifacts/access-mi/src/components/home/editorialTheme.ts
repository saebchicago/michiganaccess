// Editorial palette (locked from the homepage redesign direction).
// Applied as inline values so the look stays scoped to the homepage and
// its sections, without disturbing the site-wide token system. Shared
// here so every homepage section draws from one definition.
export const EDITORIAL = {
  cream: "#f5f0e0",
  emerald: "#064e3b",
  emeraldMid: "#0d7a5f",
  gold: "#c9a84c",
  // Text-safe variants. #c9a84c is a background/accent tone: as text it
  // reads ~2.5:1 on cream and ~4.25:1 on emerald, both under the WCAG AA
  // 4.5:1 minimum (axe color-contrast, serious). goldInk (darker) is for
  // gold text on cream; goldBright (lighter) for gold text on emerald;
  // emeraldInk for text on the gold badge itself.
  goldInk: "#8a6516",
  goldBright: "#d6b45c",
  emeraldInk: "#04301f",
} as const;
