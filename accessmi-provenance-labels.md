# AccessMI — Data Provenance Labeling System

## CONTEXT
Repo: saebchicago/MichiganAccess. Stack: React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Supabase + Netlify.
Conventions (non-negotiable): functional components only, named exports, no em dashes, Scope guard: NEVER modify /public/ without explicit confirmation.
After any data change: run `npm test && npm run test:a11y`.

The /civic-data page (src/pages/CivicDataPage.tsx) presents factual claims (FOIA volumes, state budget, voter turnout, elected officials, public meetings) with NO provenance labels. Some values appear to be fabricated placeholder data. This violates the platform's accuracy rules and is a partner-credibility risk. Existing good pattern to mirror: src/pages/LeanHealthcarePage.tsx (methodology-note card + per-block source footnotes).

## OBJECTIVE
1. Audit and classify every factual claim on /civic-data (Phase 0, STOP for human decisions).
2. Build one reusable provenance system: types + a DataProvenance badge component.
3. Apply it to CivicDataPage: label, source, and date-stamp every claim; remove or mark fabricated data.
4. (Optional) Soften "Independent" copy to "independent, nonpartisan."
5. Validate and stop before merge.

## CONSTRAINTS
MUST:
- Classify each claim as VERIFIED (confirmable primary source with URL), MODELED (derived/estimated), or PROJECTED (forward-looking target).
- For VERIFIED, cite a real primary source you can confirm (gov agency, federal dataset). Include the source name, URL, and an as-of date.
- Use named exports and functional components only.
- Run `npm test && npm run test:a11y` after data changes and report results.
- Match existing color tokens (michigan-forest, michigan-gold, michigan-teal, primary indigo).

MUST NOT:
- Invent, guess, or approximate a source for any claim. If you cannot confirm a primary source, mark it UNSOURCED and stop for a human decision. Do not relabel an unsourced number as VERIFIED.
- Modify /public/.
- Merge to main or push to main. Stay on branch civic-data-provenance.
- Add new dependencies.

## PHASE 0 — AUDIT (STOP-AND-ASK)
Read src/pages/CivicDataPage.tsx and any data it imports. Inventory every numeric or factual claim (budget figures, FOIA counts, turnout percentages, the electedOfficials array, the publicMeetings array, any stat cards).
For each, produce a row: claim | current value | proposed level (VERIFIED/MODELED/PROJECTED/UNSOURCED) | candidate primary source + URL (only if you can confirm it) | as-of date.
Write this table to ./provenance-audit.md (repo root, NOT /public) and print it.
Explicitly flag: (a) any UNSOURCED claim, (b) the publicMeetings array dates that are in the past relative to the current date.
Then STOP. Output: "PHASE 0 COMPLETE. Decisions needed on UNSOURCED items and stale meetings. Awaiting confirmation before changing any data values." Do not proceed to Phase 1 until the user replies with decisions.

## PHASE 1 — BUILD PROVENANCE SYSTEM
Create src/types/provenance.ts:
- export type ProvenanceLevel = 'verified' | 'modeled' | 'projected';
- export interface DataPoint { value: string | number; level: ProvenanceLevel; source: { name: string; url?: string }; asOf: string; note?: string; }
Create src/components/shared/DataProvenance.tsx (named export DataProvenance):
- Props: { level: ProvenanceLevel; source: { name: string; url?: string }; asOf: string; note?: string }
- Renders a small shadcn Badge color-coded by level (verified -> michigan-forest, modeled -> michigan-gold, projected -> primary/indigo) with an uppercase label, wrapped in a shadcn Tooltip that shows source name (linked if url present), "as of {asOf}", and note if present.
- Keyboard-accessible trigger, visible focus ring, aria-label describing the level and source.
Build and commit: "feat: reusable DataProvenance labeling system".

## PHASE 2 — APPLY TO CIVIC DATA PAGE
Using the Phase 0 decisions:
- Attach DataProvenance to each stat card and chart on CivicDataPage.
- For VERIFIED claims, add the confirmed source + asOf.
- For MODELED/PROJECTED, label accordingly with a one-line basis note.
- For items the user marked remove: delete them. For the publicMeetings array, replace the static past-dated list with sourced linkouts to the actual Michigan Open Meetings calendars unless the user chose otherwise.
- Add a methodology-note card at the top of /civic-data mirroring LeanHealthcarePage's pattern, explaining the labeling system.
Run `npm test && npm run test:a11y`. Build and commit: "feat: provenance labels on civic-data page".

## PHASE 3 — INDEPENDENCE COPY (OPTIONAL, SKIPPABLE)
Search the repo for user-facing "Independent" / "independent" in headings and taglines. Where it stands alone as a positioning claim, change to "independent, nonpartisan." Do not alter any text that is part of a data source name or legal citation. Build and commit: "copy: nonpartisan framing".

## PHASE 4 — VALIDATE AND HAND OFF
Run `npm test && npm run test:a11y` and report pass/fail.
Run `npm run build` and confirm zero errors.
Push the branch: `git push -u origin civic-data-provenance`.
Output a final summary: files changed, claims relabeled, claims removed, test results. Do NOT open a PR or merge. Tell the user the branch is ready for review.
