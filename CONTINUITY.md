# Continuity: AccessMI

What someone else needs to keep AccessMI running, or to freeze it safely, if the founder is unavailable. Names and procedures only; no secret values.

## Status

Maintenance mode: quarterly data refresh, corrections acknowledged in 7 days and fixed in 30, feature freeze except safety, accuracy and breakage fixes.

## Where it runs

| Item | Value |
|---|---|
| Public address | https://accessmi.org |
| Hosting | Netlify site `accessmi`; Supabase functions deployed separately (sources in `.migration-backup/`, which must not be deleted) |
| Source | GitHub `saebchicago/michiganaccess` |
| Analytics | Analytics Hub (Lovable project `f8e0d78c`), loaded through the same-origin `/_ah/` proxy. |

## How production changes

Production publishes through the GitHub Actions workflow "Publish production release", which makes a `chore(release):` commit. Package manager is pnpm only. Before merging: `pnpm check:tests`, `pnpm typecheck` and `pnpm build` from `artifacts/access-mi/`.

## Recurring upkeep

- Data refresh workflows in `.github/workflows/` (dataset, facility, SNAP, opportunity data, source-link check).
- Data-integrity guards run in `pnpm build`; never edit the sacrosanct files listed in CLAUDE.md except through their scripts.

## Secrets (names only)

Set in the hosting provider's environment settings. Rotate any that leak; see the hosting provider's environment settings, then redeploy.

`AIRNOW_API_KEY`, `CENSUS_API_KEY`, `EIA_API_KEY`, `SAM_API_KEY`, `MISTRAL_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_ANON_KEY`, `DATABASE_URL`

## Cleanup note

`VITE_MISTRAL_API_KEY` appears only in the archived `.migration-backup/` sources. If it is still set in any host's environment, delete it: variables prefixed `VITE_` are compiled into public JavaScript when code references them.

## If the founder is unavailable

| Days of silence | Action by the trusted contact |
|---|---|
| 30 | Turn on a site-wide notice: "This site is frozen as of <date>. Content is not being updated." No other changes. |
| 90 | Replace the site with a static snapshot of the last production build, keep the domain renewing, and link to the Internet Archive copy. |
| 365 | Decide with the founder's family whether to transfer the project to a named steward or let the domain lapse after archiving. |

The trusted contact needs delegated (not shared) access to the domain registrar, the hosting account and the GitHub organization. Who that person is, and how to reach them, lives in the owner's password manager, not in this public file.

## Owner fill-in (keep private values out of this file)

- [ ] Domain registrar and renewal date: record in the password manager; confirm auto-renew is on.
- [ ] Trusted contact named and given delegated access to registrar, hosting and GitHub.
- [ ] Secret values stored only in the hosting provider and the password manager. This file lists names only.

Last reviewed: 2026-10-24. Review again whenever hosting, deploy rules or secrets change.
