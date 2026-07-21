/**
 * Shared chart theme - single source of truth for data-viz colors.
 *
 * Every value resolves through the CSS custom properties defined in
 * src/index.css, so charts follow light / dark / high-contrast themes
 * automatically. Use these instead of raw hex or Tailwind palette
 * literals in any chart, legend, sparkline, or map key.
 */

/** Categorical series colors, in slot order. Matches --chart-1..5. */
export const CHART_SERIES = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const;

/**
 * Semantic outcome colors. "Good" and "bad" are about civic outcomes,
 * not raw direction - callers decide which direction is good.
 * These match SnapshotCard's sparkline convention (michigan-forest /
 * michigan-coral) so trends read identically across the site.
 */
export const TREND_GOOD = "hsl(var(--forest-green))";
export const TREND_BAD = "hsl(var(--coral))";
export const TREND_NEUTRAL = "hsl(var(--muted-foreground))";

/** Text-safe variants for labels on light backgrounds (AA tuned). */
export const TREND_GOOD_TEXT = "hsl(var(--forest-green-deep))";
export const TREND_BAD_TEXT = "hsl(var(--coral-deep))";

/**
 * Three-stop sequential ramp for legends and simple choropleth keys
 * (low -> mid -> high). Brand-harmonised replacement for ad-hoc
 * green/yellow/red gradients.
 */
export const SEQUENTIAL_RAMP = [
  "hsl(var(--color-cloud))",
  "hsl(var(--color-teal))",
  "hsl(var(--color-navy))",
] as const;

/** Shared axis / grid / tooltip styling for recharts-based charts. */
export const CHART_AXIS = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 12,
} as const;

export const CHART_GRID = {
  stroke: "hsl(var(--border))",
  strokeDasharray: "3 3",
} as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  color: "hsl(var(--foreground))",
  fontSize: "12px",
} as const;
