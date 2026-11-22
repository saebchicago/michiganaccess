# Releasing AccessMI to production

Production (https://accessmi.org, Netlify site `accessmi`) builds only for a `chore(release): publish production` commit on `main` (`scripts/netlify-ignore-build.mjs`). Deploy previews and branch deploys build automatically.

A green Netlify build is not proof that the right tree is live. A release is verified only when `scripts/verify-release.mjs` passes against production.

## 1. Before dispatching

- Every PR going into the release merged to `main` with the `ci` workflow green.
- Optional local rehearsal from the repo root:
  ```bash
  pnpm install --frozen-lockfile
  (cd artifacts/access-mi && pnpm typecheck && pnpm check:tests)
  node --test scripts/release.test.mjs
  pnpm run build
  CONTEXT=production COMMIT_REF=$(git rev-parse HEAD) DEPLOY_ID=local node scripts/write-build-manifest.mjs
  node scripts/serve-dist.mjs dist 4173 &
  node scripts/verify-release.mjs --base http://localhost:4173
  (cd artifacts/access-mi && node scripts/check-agent-readiness.mjs --base http://localhost:4173)
  ```
  The build regenerates timestamps in `public/sitemap.xml` and the source catalog. Discard them with `git checkout --` and do not commit them.

## 2. Dispatch

GitHub → Actions → **Publish production release** → Run workflow on `main` (optional reason). The workflow:

1. Reads `https://accessmi.org/.well-known/build.json` and refuses to release if the deployed commit is not an ancestor of `main`. `force` overrides this only after a manual review.
2. Installs, typechecks, runs unit and release tests, and runs the full root build (all integrity guards) on `HEAD`.
3. Creates the empty release marker commit and confirms that its tree equals the tested tree.
4. Polls production for up to 20 minutes, then runs `verify-release.mjs`. The report is uploaded as the `release-verification` artifact.

## 3. What verification checks

| Check | Passes when |
|---|---|
| `manifest.*` | `build.json` schema v2, commit equals the release marker, context `production`, deploy id present, critical datasets present and populated |
| `home.*` | `/` returns 200, has an H1 in the initial HTML and no placeholder copy, and its bytes match `entry_html_sha256` (otherwise a module script must be present, and the report says the bytes differ) |
| `county.wayne` | `/county/wayne/` returns 200 and names Wayne County |
| `data.*` | Source catalog, SAIPE export and data index parse and have the expected shape |
| `route*` | `llms.txt`, `robots.txt`, `sitemap.xml`, `/methodology`, `/data-sources` return 200, and an unknown path returns 404 |

Manual follow-up: `node scripts/verify-release.mjs --base https://accessmi.org --expect <marker sha>`.

## 4. If verification fails

- **Commit mismatch after 20 minutes.** Open the Netlify deploy log. The ignore step may have skipped the build, or the build may have failed. `write-build-manifest.mjs` now fails production builds whose commit or critical data cannot be verified.
- **HTML hash mismatch only.** A CDN or Netlify post-processing step changed `index.html`. Confirm that the module script name matches `dist/index.html` from the tested build.
- **Rollback.** In Netlify Deploys, publish the previous deploy (the "Prior production" id recorded in the release commit message).

## Other deployment surfaces

- **Lovable** (project "Michigan Access"): two-way synced with `main`, and its latest commit matched `main` on 2026-11-22. It commits directly to `main` without PR or CI, as it did with `bun.lock`, `drizzle/` and root `src/` on 2026-11-20. Review its commits before each release.
- **Replit**: `artifacts/access-mi/.replit-artifact/artifact.toml` serves `artifacts/access-mi/dist`. It has not been verified on a live Replit deployment.
- **Supabase** (project `znahhtdbcgepezrxwnah`): functions deploy out-of-band from `.migration-backup/` and `supabase/functions/`. They are not covered by `build.json`.
