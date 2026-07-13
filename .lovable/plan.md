# Plan: Homepage redesign — Civic Journal Masthead

## Scope
Replace the homepage (`artifacts/access-mi/src/pages/Index.tsx`) with the selected editorial layout. Frontend/presentation only — no changes to routing, data hooks, backend, i18n keys, or content pages beyond the homepage.

## Design system (locked)
- Palette: cream `#f5f0e0`, deep emerald `#064e3b`, mid emerald `#0d7a5f`, warm gold `#c9a84c`
- Type: DM Serif Display (headlines, italic accent), Fira Sans (body/UI)
- Motion: fade + rise only; underline reveal on card hover; count-up on featured metric
- Very light SVG grain overlay on the cream background (per user note)

## Homepage structure (top to bottom)
1. **Slim utility rail** — small crisis anchor (988 / 211 text link, kept prominent), methodology link, "Updated {date}" italic, quick-exit button. Single line, no stacked opaque alert bars.
2. **Editorial masthead** — "AccessMI" wordmark in DM Serif Display + kicker "The Civic Intelligence Journal of Michigan"; right side: Resident / Analyst mode toggle.
3. **Hero (7/5 grid)**
   - Left: standfirst "Local data for _public_ good." + one-paragraph explainer of the intelligence + bridge role.
   - Right: emerald ZIP panel with a floating gold "Updated" chip, ZIP/county input styled in DM Serif, primary submit action, "View methodology & data integrity" link.
4. **Featured intelligence card** — one editorial lead below the hero: a single labeled county-pulse showing 2–3 metrics with VERIFIED / MODELED / PROJECTED chips. Proves the intelligence layer without a wall of dashboards.
5. **Four primary paths (magazine grid, I–IV)** — Policy & investment · Health & coverage · Explore your area · Learn about benefits. Editorial numeral, provenance chip, kicker, serif title, one-line description, animated gold underline on hover.
6. **Bridge-to-resources band** — warm inline chip row (Find care, Benefits, Community resources, Housing, Food) so the "help now" path is close at hand without dominating the hero.
7. **Provenance strip** — compact explainer of VERIFIED / MODELED / PROJECTED with a link to methodology. Anchors the trust architecture.
8. **Progressive-disclosure alert row** — single collapsed line with a small count ("2 active advisories · view") that expands on click. Replaces the two stacked bars currently above the fold.

## Copy
- Hero H1: "Local data for _public_ good."
- Standfirst: "AccessMI turns public records into civic intelligence for Michigan's 83 counties — so residents can find help, and analysts can trace every number to its source."
- ZIP label: "Explore your community"
- Featured card kicker: "This week in Michigan"
- Path titles preserved as-is.
- Bridge band label: "Need help right now?"
- Provenance strip: "Every number carries a label." with three inline chips + one-line definitions.

## Files
- `artifacts/access-mi/src/pages/Index.tsx` — rewrite composition; use existing hooks (ZIP entry, county select, mode toggle) so behavior is preserved.
- `artifacts/access-mi/src/pages/index/` (new folder for section components):
  - `EditorialMasthead.tsx`
  - `EditorialHero.tsx`
  - `FeaturedIntelligenceCard.tsx`
  - `PrimaryPathsGrid.tsx`
  - `ResourceBridgeBand.tsx`
  - `ProvenanceStrip.tsx`
  - `CollapsedAlertsRail.tsx`
  - `GrainOverlay.tsx` (fixed, pointer-events-none, ~4% opacity noise SVG)
- `artifacts/access-mi/src/index.css` — add semantic tokens for the emerald palette (HSL vars: `--civic-cream`, `--civic-emerald`, `--civic-emerald-mid`, `--civic-gold`) so components use tokens, not hex literals. Extend `tailwind.config.ts` colors accordingly.
- Fonts: add `@fontsource/dm-serif-display` and `@fontsource/fira-sans` via pnpm, import in `src/main.tsx`, register in `tailwind.config.ts` under `fontFamily.serif` / `fontFamily.sans`. No `<link>` tags, no CSS `@import`.

## Preserved behavior
- ZIP submit → existing route/handler
- County picker + "Browse every county"
- Resident/Analyst mode toggle
- Crisis + Quick Exit bars retained (compacted into utility rail; QuickExitBar and CrisisBar components untouched per sacrosanct-file rule — reused, not modified)
- Language switcher, footer, existing nav
- Updated-date chip continues to read from build timestamp
- All existing alert/advisory data sources — same data, new collapsed presentation
- i18n: existing `t()` keys for hero standfirst and path titles reused where present; new strings added to English locale and mirrored placeholder-ready in other locales

## Accessibility
- Single `<main>` retained from Layout (no nested `<main>`)
- Provenance chips have visible text (not color-only)
- ZIP input keeps a real `<label>` (visually the "Explore your community" kicker), 44px min tap target on submit
- Mode toggle is a `<div role="tablist">` with two `<button role="tab">`
- Contrast: emerald `#064e3b` on cream `#f5f0e0` = 10.4:1 (AAA); gold `#c9a84c` used only as accent chips/rules on emerald backgrounds where contrast ≥ 4.5:1
- Grain overlay `aria-hidden`, `pointer-events-none`

## No-go
- No changes to `QuickExitBar.tsx`, `CrisisBar.tsx`, `platformConstants.ts`, or any sacrosanct file
- No em dashes in new copy
- No fabricated metrics on the featured card — reuse existing verified county-pulse data source; if none is available for the default state view, render an empty-state variant that still shows the labels
- No new backend, no schema changes
- No route or nav changes

## Verification
- `pnpm typecheck` and `pnpm check:tests` from `artifacts/access-mi/`
- `pnpm test:a11y`
- Playwright screenshot of `/` at 1440×900 and 402×717 to confirm the new hero and card grid render as intended