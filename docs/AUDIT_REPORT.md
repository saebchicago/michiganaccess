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

_To be populated._

---

## Links & Assets (Phase 3)

_To be populated._

---

## Performance (Phase 4)

_To be populated._
