# AccessMI FIXLOG

## Standing decisions (ratified audit/claims-vs-code, 2026-06-11)

### a. Sacrosanct files

Files in these categories are protected from modification by any sprint unless the
sprint prompt names the file explicitly as a named exception.

| File / pattern | Category | Reason |
|---|---|---|
| `src/components/shared/QuickExitBar.tsx` | Crisis affordance | DV/trauma safety exit; behavior changes could endanger users |
| `src/components/shared/CrisisBar.tsx` | Crisis affordance | 988 / 211 / Quick Exit; any copy or behavior change requires explicit exception |
| `src/data/verifiedHealthFacilities.json` | Source data | CMS+HRSA statewide facility dataset; regenerate via script only |
| `src/data/census-geographies.ts` | Source data | 83-county FIPS registry; authoritative for all county lookups |
| `src/data/sourcesRegistry.ts` | Source data | Platform source-org registry; build asserts against it |
| `src/data/sourceManifest.ts` | Source data | Numeric claim anchor manifest |
| `src/config/platformConstants.ts` | Source data | SSOT for all site-wide factual figures; build-asserted |
| `scripts/build-facility-dataset.mjs` | Ingestion script | Regenerates verifiedHealthFacilities; no hand edits |
| `scripts/refresh-county-population.mjs` | Ingestion script | Regenerates county population values; no hand edits |
| Any file in `scripts/check-*.mjs` | Guard script | Data-integrity guards wired into build; change only to tighten, never to loosen |

### b. Post-merge review model

Identical to prior sprints:

1. Agent captures screenshots (1280 + 375px) of changed copy surfaces to
   `/tmp/review-shots-<branch>/` before pushing.
2. Branch merges autonomously once all gates are green (typecheck + vitest + build).
3. Saeb reviews production async after deploy.
4. Defects fixed on a dedicated fix branch.
5. Two consecutive reverts from the same sprint reinstate the pre-merge gate
   (sprint must gain explicit approval before future autonomous merges).

### c. No fabricated or unlabeled data

- Every rendered number must carry a named source and vintage.
- Modeled or estimated values are labeled with the integrity pill (VERIFIED /
  MODELED / PROJECTED / PENDING).
- No em dashes (—) in code or copy; use hyphens or spaced en dashes.

---

## Phase 0 discovery (2026-06-11)

### Stack

| Concern | Value |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Package manager | npm |
| Routing | React Router v7 + Wouter (mixed) |
| State | Zustand 5 |
| Data fetching | TanStack React Query |
| AI chat backend | Mistral AI via `/.netlify/functions/chat-mistral` |
| AI appeal backend | Mistral / `${SUPABASE_URL}/functions/v1/appeal-generator` |
| Real-time AQI proxy | `${SUPABASE_URL}/functions/v1/airnow-proxy` |
| Deploy host | Netlify (`netlify.toml` at repo root) |

### Build command

```
npm run build
```
Runs: generate-sitemap → check-links → check-counts → check-zip-population →
check-county-facilities → check-trend-series → check-chna-mapping → vite build →
prerender-meta

Build-time assertions: `platformConstants.ts` throws if SOURCES_TOTAL ≠ 41 or
breakdown drifts; `check-chna-mapping.mjs` validates CHNA gap mapping integrity.

### Test runner

Vitest v3.2.4. Live run (2026-06-11):
- Test files: 33 run (2 failing pre-existing — `localStorage.clear()` in
  `DomainDashboard.test.tsx` and `CivicIntelligenceHub.test.tsx`)
- Tests: 541 total — **537 passing**, 3 failing, 1 skipped

Pre-existing failures are unrelated to this sprint.

### Page inventory

~130 page files in `src/pages/`. Audited pages for this sprint:
`Index.tsx`, `AboutPage.tsx`, `PrivacyPage.tsx`, `DataSourcesPage.tsx`,
`MethodologyPage.tsx` (+ `src/pages/methodology/` directory).
Components in scope: every component rendered on audited pages.

### Reviewer-premise reconciliation

External AI reviews (Comet, Gemini) made the following site-state claims.
Verdict from code:

| Reviewer claim | Code verdict | Evidence |
|---|---|---|
| "41 public data sources" | CONFIRMED | `platformConstants.ts:27` build-asserts `SOURCES_TOTAL === 41` |
| "Ask Access Michigan conversational agent" | CONFIRMED | `AccessChat.tsx:245` renders `CardTitle` "Ask Access Michigan"; calls `/.netlify/functions/chat-mistral` |
| "verified low latency" / "Sub-3-second loads on 3G" | STALE / REMEDIATED | `MethodologyPage.tsx` trust log records prior false claim replaced Mar 2026 |
| "automated weekly pulls" | STALE / REMEDIATED | Same trust log entry; no automated pull scheduler in code |
| "zero-cookie architecture" | CONFIRMED with caveat | GA removed per `index.html:4-13`; no ad/tracking scripts; `localStorage` used but disclosed in `PrivacyPage.tsx:107` |
| CMS data layer | CONFIRMED | `verifiedHealthFacilities.json` CMS Hospital General Information source |
| HRSA data layer | CONFIRMED | `verifiedHealthFacilities.json` HRSA Health Center Sites source |
| CDC PLACES data layer | CONFIRMED | `sourcesRegistry.ts:29`, `dataFreshness.ts:56` |
| EPA EJScreen data layer | PARTIAL | `ejscreen.ts` has ~15 ZCTAs; not statewide-comprehensive; labeled as sparse in `data_year: 2023` entries |

Zero reviewer premises imported as fact before code verification.

---

## Findings applied in this sprint

### F-1: PrivacyPage PHI/client-side false claim (FIXED, Phase 2)

**Claim:** `PrivacyPage.tsx:67` — "Health-related tools (AI appeals generator, benefits wizard,
symptom information) process data **client-side**. We do not **store, transmit**, or retain
any health information you enter."

**Evidence of falsity:** `AIAppealGenerator.tsx:65` fetches
`${supabaseUrl}/functions/v1/appeal-generator` — a server-side Supabase Edge Function.
Data IS transmitted to a server. "client-side" is false; "do not transmit" is false.

**Fix:** Replaced with "are processed via secure server functions that do not store
your inputs after the response is returned."

**Category:** PRIVACY

---

### F-2: QuickExitBar ESC key false claim (LOGGED, fix blocked by sacrosanct rule)

**Claim:** `QuickExitBar.tsx:31` aria-label — "Quick exit - leave this site immediately
**(also press Escape)**"; `QuickExitBar.tsx:32` title — "**Press ESC to quickly leave
this page**"; `QuickExitBar.tsx:36-40` — `<kbd>ESC</kbd>` visual hint and "Press ESC
to quickly leave this page" span rendered in the UI.

**Evidence of falsity:** `QuickExitBar.tsx:19` comment — "Quick Exit is button-only -
Escape key closes modals/dropdowns, not Quick Exit." No `keydown` / `useEffect`
Escape handler in the component. ESC does NOT trigger Quick Exit.

**Fix blocked:** `QuickExitBar.tsx` is a sacrosanct crisis affordance. Correcting
the false ESC copy requires an explicit named exception in a future sprint prompt.

**Category:** PRIVACY (safety-critical false affordance)

---

## Future work (not in scope of this sprint)

- EJScreen sparse coverage: `ejscreen.ts` has only ~15 ZCTAs. If EJScreen is
  claimed as a statewide layer, coverage should be expanded or the disclaimer
  clarified. Requires data-ingestion work.
- CHNA chnaSeed.ts D5 audit: 35 metrics labeled VERIFIED but sourced from HFH 2022
  CHNA document (secondary source). Relabeling to MODELED deferred to a named
  Phase 4 of the CHNA gap analysis sprint.
- AI privacy claims (no conversation logging, no PHI storage after response): these
  are server-side behavioral claims that cannot be verified from client code alone.
  Verification requires Supabase/Netlify function review.
