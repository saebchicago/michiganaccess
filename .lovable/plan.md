## Plan: A11y + SEO review

Active app is `artifacts/access-mi/`. Prior a11y baseline (A11Y_VIOLATIONS.md) shows 0 critical/serious violations across 10 priority routes. SEO findings list is empty — needs fresh scan.

### 1. SEO review
- Trigger a fresh SEO scan (requires your approval).
- Results land in the SEO & AI search tab in ~1 minute.
- I'll fix any failing findings once they appear (meta, canonical, JSON-LD, sitemap, robots, headings).

Note: sitemap.xml and robots.txt currently advertise `michiganaccess.lovable.app`, but `index.html` canonical uses `accessmi.org`. I'll reconcile to the project's canonical domain (`accessmi.org` per the head meta) as part of the fix pass.

### 2. Accessibility audit
Read through `artifacts/access-mi/src/` (pages, layout, shared components) and check:

- **Critical**: missing `alt`, icon-only buttons without `aria-label`, unlabeled inputs, `onClick` on non-interactive elements, focus traps, `aria-hidden` over focusable children.
- **Warning**: heading order, single `<main>`, focus-visible, 44×44 tap targets, `h-screen` → `h-dvh`, color-only signaling.
- **Info**: decorative `alt=""`, redundant ARIA, `aria-live` regions, semantic lists, `<html lang>` (already set to `en`).

Report findings grouped by severity, then fix critical → warning → info, using Radix/shadcn primitives where possible. No speculative refactors.

### Order
1. Trigger SEO scan (your approval needed).
2. While it runs, audit a11y in code and report findings.
3. Fix a11y critical issues.
4. When SEO results land, fix failing findings and mark them resolved.

No code changes until you approve.
