## What you triggered

You invoked three skills together. Here's how I'd handle each:

### 1. SEO review — already running
Fresh scan is in progress (prior findings list was empty). Results appear in the SEO & AI search tab in ~1 minute. Once they land, I'll fix any failing findings (meta tags, canonical, JSON-LD, sitemap/robots, heading structure).

```xml
<presentation-actions>
<presentation-open-seo-review>Open SEO tab to view results</presentation-open-seo-review>
</presentation-actions>
```

### 2. Accessibility audit
I'll read the live `src/` tree (note: a lot of the codebase referenced in context lives under `.migration-backup/` and `artifacts/access-mi/` — I need to confirm which is the active app first) and audit for:

- **Critical**: missing `alt`, icon-only buttons without `aria-label`, unlabeled form inputs, `onClick` on non-interactive elements, focus traps, `aria-hidden` over focusable children
- **Warning**: heading order, single `<main>`, focus-visible indicators, 44×44 tap targets, `h-screen` vs `h-dvh`, color-only signaling
- **Info**: decorative `alt=""`, redundant ARIA, `aria-live` regions, semantic lists, `<html lang>`

I'll report findings grouped by severity, then fix critical issues first, one at a time, using Radix/shadcn primitives where possible.

### 3. Video creator — need direction
The video-creator skill generates a short AI video from a text prompt. I don't see an obvious place this fits (no hero video slot, no marketing landing surface currently calling for one). Before spending credits on generation I need to know:

- Is there a specific page/section you want a video for (e.g. homepage hero, About page)?
- What should the video show (Michigan landscape, data visualization motion, civic imagery)?
- Or should I skip this one for now?

### Order of operations once approved
1. Confirm which directory is the active app (`src/` at root vs `artifacts/access-mi/src/`)
2. Wait for SEO scan results, fix failing findings
3. Run accessibility audit, report, then fix critical → warning → info
4. Handle video only after you answer the questions above

No code changes yet — approve to proceed.