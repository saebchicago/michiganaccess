# One pass: real ingestors, resource bridge, real sign-in

Four workstreams. Each ends with data or access that is verifiable, not modeled.

## 1. Fix the two broken county feeds (SVI + overdose)

Both refresh scripts already exist and both currently write the 83-row `pending-ci` stub.

Verified now:
- The CDC/ATSDR SVI Michigan CSV responds 200 from a plain request, so the CI 403 is a request-header/CDN problem, not a dead source.
- The NCHS overdose Socrata id the script uses (`gb4e-bhi7`) returns 404. The live dataset is `gb4e-yj24` ("VSRR Provisional County-Level Drug Overdose Death Counts").

Work:
- Point the overdose script at `gb4e-yj24`, keep the title assertion so a future renumber still fails loudly, keep NCHS suppression as `null` + `status: "suppressed"` (never 0).
- Give both scripts a browser-style `User-Agent`/`Accept` and retry-with-backoff so the CI 403 stops, run them with `--apply --require-live`, and commit populated payloads.
- Restore the SVI and overdose rows in `BriefPage.tsx` (they are currently omitted while pending) and set the freshness registry back to real vintages instead of "awaiting first successful pull".
- Add a guard that fails the build if either generated file is `populated: false` while the freshness registry claims a vintage.

## 2. Ingestors for economic, health, and housing county data

Replace the hand-seeded fallbacks with real per-county pulls covering all 83 counties:
- Federal awards: `MICHIGAN_FEDERAL_SPENDING` in `src/data/federalSpending.ts` is 20 hand-entered counties. Replace with a USASpending.gov recipient-location county ingestor for all 83, keyed to FIPS.
- Facility counts: `countyFacilityReference.json` becomes a generated rollup from the verified facility dataset plus HRSA/CMS county files, so the "live directory vs static count" mismatch resolves to one sourced number.
- Health and housing: extend the existing CDC PLACES and HUD CHAS refreshers to cover the fields the county brief currently fills from estimates.
- Every new dataset gets provenance, a `dataCatalog` entry keyed to a `sourcesRegistry` feed, a `pending-ci` stub path, and a nightly workflow. Anything that stays derived keeps a MODELED badge; nothing gets promoted to VERIFIED without a publisher-native number.

## 3. Real resource bridge on county pages

When a county brief detects a shortage (provider shortage, uninsured, housing cost burden, food access, overdose), render a "What you can do here" block under that metric:
- Pulls matching rows from `community_resources` and `financial_programs` filtered to that county, plus statewide programs as backup.
- Each entry shows the program, who qualifies, how to apply (phone, walk-in, URL), and languages.
- Shortage-to-program mapping lives in one table module so the same rule drives every metric, with a seed migration for the state programs (MDHHS, MSHDA, 211, LIHEAP, Healthy Michigan, WIC) that currently have no rows.
- If no program matches, the block says so explicitly - no empty card, no invented referral.

## 4. Real sign-in protecting admin + partnership submissions

- Email/password sign-in plus Google, with a `profiles` table and a separate `user_roles` table (`admin`, `reviewer`, `user`) and a `has_role()` security-definer function. Roles never live on profiles.
- Recommendation: no public sign-up. Admin and reviewer accounts are provisioned; the sign-in page authenticates only, so a stranger cannot self-register into the review queue.
- `/admin` returns as a route guarded by role, not by obscurity: unauthenticated users get the sign-in page, signed-in non-admins get a clear denial.
- `partnership_submissions` and `resource_submissions` RLS tighten to: anonymous insert only (status forced pending), read/update restricted to `reviewer`/`admin`. The admin dashboard reads submissions and approves/rejects through those policies.

## Technical notes

- New ingestors follow the existing `scripts/refresh-*.mjs` shape: manifest-recorded fetch, county-FIPS registry as the join key, `--apply` / `--require-live`, never regress a populated file to the stub.
- Build-parity rule applies: any generator added to `artifacts/access-mi`'s build must be added to the repo-root build too, or `check-build-parity` fails.
- Sacrosanct files (`census-geographies.ts`, `sourcesRegistry.ts`, `dataCatalog.ts`, `dataFreshness.ts`, `verifiedHealthFacilities.json`) change only through their generators or through registry entries the guards require.
- Migrations create tables with GRANTs, then RLS, then policies, in that order.
- Order of execution: (1) feeds, (2) ingestors, (3) auth + RLS, (4) resource bridge, so the bridge is built against real seeded program rows.
- Verification per workstream: typecheck, unit tests, integrity guards, and an anonymous-access check confirming submissions and admin data are unreadable without a role.
