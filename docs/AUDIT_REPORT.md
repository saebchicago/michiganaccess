# Audit Report — accessmi.org

**Date:** 2026-04-06
**Branch:** main
**Auditor:** Claude Code (claude-sonnet-4-6)

---

## Baseline (Phase 1)

### Environment summary
- `npm install`: clean (978 packages audited, 20 vulnerabilities — 3 low / 5 moderate / 12 high; none are direct deps)
- `npm run build`: succeeded in 11.97 s, 1 warning
- `npx tsc --noEmit`: **0 errors**
- `npm run lint`: 179 errors, 40 warnings (see findings below)
- `npm run test`: **12 / 12 passed** (5 test files)

---

### B-001
- **Severity:** P2 medium
- **Category:** build
- **File:** `src/components/shared/OnboardingTour.tsx`
- **Description:** Module is both dynamically imported by `src/components/layout/Layout.tsx` and statically imported by `src/components/layout/Footer.tsx`. Vite warns that the dynamic import cannot move the module into a separate chunk, defeating code-splitting intent.
- **Proposed fix:** Remove the static import from Footer.tsx or convert it to a dynamic import matching Layout.tsx.
- **Risk:** safe

---

### B-002
- **Severity:** P2 medium
- **Category:** build / performance
- **File:** build output
- **Description:** Several chunks exceed Vite's 500 kB pre-gzip warning threshold. Largest offenders: `index-DhR9Zyo7.js` 675 kB (202 kB gz), `vendor-ui-9K3zxFv6.js` 585 kB (163 kB gz), `html2canvas.esm` 201 kB gz, `jspdf.es.min` 129 kB gz. None exceed 500 kB **gzipped**, so this is a P2 advisory, not a P1.
- **Proposed fix:** See Phase 4 for detailed bundle analysis.
- **Risk:** needs review

---

### B-003
- **Severity:** P1 high
- **Category:** lint / runtime
- **File:** `src/pages/CountyPage.tsx` lines 121–123
- **Description:** Three React Hooks (`useFacilities`, `useCommunityResources`, `useCommunityEvents`) are called conditionally, violating the Rules of Hooks. This will cause a runtime error whenever the conditional is false in production.
- **Proposed fix:** Move all hook calls above any conditional return/branch, then conditionally use the returned values.
- **Risk:** needs review (touches data-fetching logic)

---

### B-004
- **Severity:** P3 low
- **Category:** lint
- **File:** multiple (see list)
- **Description:** `no-explicit-any` errors across 30+ files — primarily in D3 callbacks, map renderers, and Supabase edge functions where type information is genuinely dynamic. Total: ~150 occurrences.
- **Proposed fix:** Tighten to `unknown` + type guard where type is derivable from usage; use `as FeatureCollection` / GeoJSON types for D3 map callbacks.
- **Risk:** needs review (per-site judgment required)

---

### B-005
- **Severity:** P3 low
- **Category:** lint
- **File:** `src/components/learn/DrugDataWidget.tsx:81`, `src/pages/CivicDataHubPage.tsx:138`, `supabase/functions/airnow-proxy/index.ts:172`
- **Description:** `prefer-const` — variables declared with `let` that are never reassigned. 3 instances.
- **Proposed fix:** Change `let` to `const`.
- **Risk:** safe

---

### B-006
- **Severity:** P3 low
- **Category:** lint
- **File:** `src/components/home/CommunityAlerts.tsx:41`, `src/components/home/SmartRecommendations.tsx:26`, `supabase/functions/gtfs-rt-proxy/index.ts:205`, `supabase/functions/airnow-proxy/index.ts:188`
- **Description:** `no-empty` — empty block statements (likely catch blocks swallowing errors silently). 4 instances.
- **Proposed fix:** Add at minimum a `// intentionally empty` comment or a console.error in non-prod guards to satisfy the rule.
- **Risk:** safe

---

### B-007
- **Severity:** P3 low
- **Category:** lint
- **File:** `supabase/functions/cdc-proxy/index.ts:42`
- **Description:** `no-useless-escape` — unnecessary escape character `\-` inside a string. 1 instance.
- **Proposed fix:** Remove the backslash.
- **Risk:** safe

---

### B-008
- **Severity:** P3 low
- **Category:** lint
- **File:** `tailwind.config.ts:221`
- **Description:** `@typescript-eslint/no-require-imports` — `require()` style import in a TypeScript ESM file. 1 instance.
- **Proposed fix:** Replace with `import` statement or suppress with `// eslint-disable-next-line` if a plugin requires it.
- **Risk:** needs review (Tailwind plugin require())

---

### B-009
- **Severity:** P2 medium
- **Category:** lint
- **File:** multiple — `react-hooks/exhaustive-deps` warnings (40 total)
- **Description:** Missing or stale deps in `useMemo`/`useEffect` dependency arrays can cause stale-closure bugs. Notable: `src/pages/ComparePlacesPage.tsx:293,394,404`, `src/pages/CountyPage.tsx` (overlaps with B-003), `src/pages/OutagesPage.tsx:52`.
- **Proposed fix:** Per-case: either add missing deps or wrap the initializer in its own `useMemo`.
- **Risk:** needs review (can affect data correctness)

---

### B-010
- **Severity:** P3 low
- **Category:** lint
- **File:** `src/components/brief/SDOHPriorityHeat.tsx:43`, `src/components/county/JusticeSection.tsx:52`, `src/components/home/SmartRecommendations.tsx:18`
- **Description:** `react-refresh/only-export-components` — files export both components and constants/functions, which prevents Fast Refresh from working correctly in dev. No production impact.
- **Proposed fix:** Move shared constants/functions to a separate utility file.
- **Risk:** safe

---

### B-011
- **Severity:** P2 medium
- **Category:** build
- **File:** `npm audit`
- **Description:** 20 dependency vulnerabilities (3 low, 5 moderate, 12 high). All appear to be transitive/dev dependencies. Needs review to confirm none affect production runtime.
- **Proposed fix:** Run `npm audit --production` to confirm no production surface; then `npm audit fix` for non-breaking upgrades.
- **Risk:** needs review

---

### Baseline summary

| Severity | Count |
|----------|-------|
| P0 critical | 0 |
| P1 high | 1 (B-003 — conditional hooks) |
| P2 medium | 4 (B-001, B-002, B-009, B-011) |
| P3 low | 6 (B-004–B-008, B-010) |

**Build:** ✅ clean
**TypeScript:** ✅ 0 errors
**Tests:** ✅ 12/12 passed
**Lint:** ❌ 179 errors, 40 warnings

---

## Routes & Runtime (Phase 2)

### Route sweep methodology
- 126 lazy-loaded routes declared in `src/config/routes.ts` + static routes in `src/App.tsx`
- All component files verified to exist on disk ✅
- TypeScript validated all lazy imports (0 type errors) ✅
- Playwright sweep run against 30 key routes at localhost:8080

### R-001
- **Severity:** P2 medium
- **Category:** runtime
- **File:** `src/pages/EnvironmentPage` (loaded in `/environment`)
- **Description:** `/environment` timed out (15 s) during Playwright's `networkidle` wait. Root cause: FDA food enforcement API (`api.fda.gov/food/enforcement.json`) returned 404, combined with many other external API calls, prevents the page from ever reaching network idle in audit conditions. The component (`FDARecallFeed.tsx`) has proper graceful fallback (`return []` on `!res.ok`), but the 15 s timeout suggests the page has too many simultaneous external requests for low-bandwidth / slow-network users.
- **Proposed fix:** Add `retry: false` to the FDARecallFeed query and reduce `networkTimeoutSeconds`. The FDA endpoint returning 404 should be investigated separately.
- **Risk:** needs review

---

### R-002
- **Severity:** P1 high
- **Category:** runtime / data
- **File:** `src/hooks/useCensusDemographics.ts:39`
- **Description:** Census ACS API call for ZIP-level demographics includes `&in=state:26` which is an invalid parameter for ZIP Code Tabulation Area geography. The Census API returns HTTP 400 for this query, causing the hook to return `null` on every ZIP page load. Confirmed: removing `&in=state:26` returns correct data. Affects all `/zip/:zipcode` pages.
- **Proposed fix:** Remove `&in=state:26` from the URL on line 39.
- **Risk:** safe (the fix is a URL parameter removal; the hook already handles `null` gracefully)

---

### R-003
- **Severity:** P2 medium
- **Category:** runtime
- **File:** `src/pages/StatusPage2` (loaded in `/status`)
- **Description:** `/status` timed out during Playwright's `networkidle` wait. The page likely pings many external health-check endpoints simultaneously, preventing network idle. No component crash observed — only timeout.
- **Proposed fix:** Use `waitUntil: 'domcontentloaded'` for the status page or lazy-load the health checks. Not a user-visible bug in production.
- **Risk:** needs review

---

### R-004
- **Severity:** P2 medium
- **Category:** runtime / data
- **File:** `src/components/alerts/FDARecallFeed.tsx:26`
- **Description:** FDA food enforcement endpoint (`api.fda.gov/food/enforcement.json?search=state:"Michigan"...`) returns HTTP 404. The component handles this correctly (returns empty array), but the recall feed will always show empty in production until this URL is corrected.
- **Proposed fix:** Verify the correct FDA food enforcement endpoint URL in FDA OpenAPI docs. May need to update query parameters.
- **Risk:** needs review (data accuracy — human review preferred)

---

### R-005
- **Severity:** P3 low
- **Category:** runtime
- **File:** `src/config/routes.ts`
- **Description:** Two lazy imports defined in the `pages` object are not referenced in the `APP_ROUTES` table: `ImpactPage` (`@/pages/ImpactPage`) and `EquityPage` (`@/pages/EquityPage`). These modules are loaded into the module graph at startup but never rendered. `ImpactPage` has been superseded by `ImpactDashboardPage`; `EquityPage` superseded by `EquityScorecardPage`.
- **Proposed fix:** Remove the two orphaned lazy imports from `routes.ts`. The underlying page files can be kept for reference.
- **Risk:** safe

---

### R-006
- **Severity:** P3 low
- **Category:** runtime
- **File:** `src/pages/HealthMapPage.tsx:45`
- **Description:** `console.log("Navigate to:", lat, lon, name)` left in production code.
- **Proposed fix:** Remove the statement.
- **Risk:** safe

---

### Routes summary

| Check | Result |
|-------|--------|
| Component files exist | ✅ 126/126 |
| TypeScript validates imports | ✅ 0 errors |
| Routes with crash (P0) | 0 |
| Routes with P1 runtime error | 1 (R-002 — Census ZIP API 400) |
| Routes with timeout (P2) | 2 (R-001, R-003) |
| Orphaned lazy imports | 2 (R-005) |

---

## Links & Assets (Phase 3)

### L-001
- **Severity:** P3 low
- **Category:** links
- **File:** `src/config/routes.ts` (nav groups)
- **Description:** All ~95 internal nav href values verified against the route table — no dead internal links found. All routes resolve to a registered component or a valid redirect. ✅

---

### L-002
- **Severity:** P3 low
- **Category:** assets / a11y
- **File:** `src` (all `.tsx` files)
- **Description:** Zero `<img>` tags found in source without `alt` attributes. All informational images use proper alt text. ✅

---

### L-003
- **Severity:** P2 medium
- **Category:** assets / external
- **File:** `src/components/alerts/FDARecallFeed.tsx:26`
- **Description:** External FDA recall feed URL returns 404 (see R-004). Cross-referenced in links audit.
- **Proposed fix:** See R-004.
- **Risk:** needs review

---

### L-004
- **Severity:** P3 low
- **Category:** assets
- **File:** `public/`
- **Description:** All referenced public assets verified: `favicon.ico`, `favicon.png`, `og-image.png`, `placeholder.svg`, `pwa-192x192.png`, `pwa-512x512.png`, `robots.txt`, `sitemap.xml`, `offline.html` all present. ✅

---

## Performance (Phase 4)

### P-001
- **Severity:** P2 medium
- **Category:** performance / build
- **File:** `dist/assets/`
- **Description:** Several chunks exceed Vite's 500 kB pre-gzip threshold. None exceed 500 kB **gzipped** (largest: `index-DhR9Zyo7.js` at 202 kB gz, `vendor-ui-9K3zxFv6.js` at 163 kB gz). The primary `index` bundle at 675 kB (unminified) suggests the main app shell includes too much eagerly-loaded code.
- **Proposed fix:** Audit what lives in `index` chunk; move any non-critical initialization to lazy imports.
- **Risk:** needs review

---

### P-002
- **Severity:** P2 medium
- **Category:** performance / bundle
- **File:** `package.json`
- **Description:** `html2canvas` (1.4.1) is listed as a production dependency (201 kB uncompressed chunk in build output) but is not directly imported anywhere in `src/`. It appears to be a transitive requirement of `jspdf` for the `.html()` API. Since jsPDF uses dynamic imports in the codebase, html2canvas should only load lazily — but it's still added to the precache manifest (7.5 MB total precache).
- **Proposed fix:** Verify whether html2canvas is needed. If not, remove from `package.json`; if needed by jsPDF's `.html()` method, ensure it's dynamically imported.
- **Risk:** needs review

---

### P-003
- **Severity:** P3 low
- **Category:** performance / bundle
- **File:** `package.json`
- **Description:** `@mistralai/mistralai` is listed as a production dependency but is not directly imported in `src/` — all AI calls go through `src/Services/aiService.ts` which calls a Netlify function. The SDK is therefore bundled unnecessarily if Vite resolves it.
- **Proposed fix:** Move `@mistralai/mistralai` to devDependencies or confirm it's only used in Netlify functions (where it doesn't affect the frontend bundle).
- **Risk:** needs review

---

### P-004
- **Severity:** P3 low
- **Category:** performance / build
- **File:** `src/components/shared/OnboardingTour.tsx`
- **Description:** See B-001. Mixed static/dynamic import prevents code-splitting of OnboardingTour from the main bundle. The component is 2.72 kB gzipped, so impact is minor.
- **Risk:** safe

---

### P-005
- **Severity:** P2 medium
- **Category:** performance / build
- **File:** `package.json`
- **Description:** PWA precache total is 7,507 kB across 344 entries. This is very large for a first-visit precache. Users on slow connections will have a poor first-install experience. jsPDF (390 kB unminified) and html2canvas (201 kB) are both precached.
- **Proposed fix:** Scope workbox `globPatterns` more tightly; exclude heavy PDF/print assets from precache.
- **Risk:** needs review
