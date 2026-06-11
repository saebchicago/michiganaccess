# A11Y Baseline - First Scan

**Branch:** a11y-gate
**Date:** 2026-06-11
**Tool:** vitest-axe 0.1.0 / axe-core 4.12.1
**Surfaces tested:** Header, Footer, CHNAExplorerPage, CountyPage, HealthConditionsPage

---

## Results summary

| Surface | Status | Violations |
|---------|--------|------------|
| App shell (Header) | PASS | 0 |
| App shell (Footer) | PASS | 0 |
| CHNAExplorerPage | PASS | 0 |
| CountyPage | PASS | 0 |
| HealthConditionsPage | PASS (resolved) | 0 |

---

## Violations

### HealthConditionsPage

| Field | Value |
|-------|-------|
| Rule ID | `heading-order` |
| Impact | moderate |
| Node count | 1 reported (first offending node) |
| Offending node | `<h3 class="font-semibold text-foreground">Diabetes Care</h3>` |
| axe selector | `.ring-2 > .p-4.sm\:p-6.sm\:pt-0 > div:nth-child(2) > h3` |
| **Status** | **RESOLVED** |

**Description:** Heading levels should only increase by one. The page hero renders `<h1>` but the pathway selection cards use `<h3>` without an intervening `<h2>`, violating the heading-order rule.

**Root cause (source location):** `src/pages/HealthConditionsPage.tsx:286` - pathway card headings were `<h3>` with no `<h2>` section heading above them.

**Resolution:** Demoted pathway card headings from `<h3>` to `<h2>` at `src/pages/HealthConditionsPage.tsx:286`, preserving all Tailwind classes. Committed in "fix: heading-order violation on HealthConditionsPage".

---

## Test files

- `src/test/a11y/layout.a11y.test.tsx`
- `src/test/a11y/chna-explorer.a11y.test.tsx`
- `src/test/a11y/county-page.a11y.test.tsx`
- `src/test/a11y/conditions-page.a11y.test.tsx`

Run with: `pnpm test:a11y`
