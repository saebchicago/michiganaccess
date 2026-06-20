# Supabase Edge Functions - Implementation Plan (5 pending functions)

Status: planning only. No application code is modified by this document.
Author context: AccessMI V3 data layer. Today's date 2026-06-19.

## 0. Overview

Five React Query hooks currently return static `FALLBACK` data with a `TODO` to
swap in `supabase.functions.invoke("<name>")`. This plan specifies how to build
each backing edge function while preserving the existing return interfaces, so
the hooks change minimally (or not at all - they keep the fallback as the
stale-while-revalidate default).

### Key repository facts established during research

- The Supabase project lives at the **repo root**, not under `artifacts/access-mi/`:
  - Functions: `/home/user/michiganaccess/supabase/functions/<name>/index.ts`
  - Config: `/home/user/michiganaccess/supabase/config.toml` (only `project_id = "znahhtdbcgepezrxwnah"`; no per-function `[functions.*]` blocks yet)
  - Two existing functions: `census-acs-proxy/index.ts`, `chna-data-proxy/index.ts`
- The browser Supabase client is `artifacts/access-mi/src/integrations/supabase/client.ts`. It exports `supabase` and a `supabaseConfigured` boolean. Hooks must guard on `supabaseConfigured` (or catch the invoke error) and fall back to the static dataset - the design principle "components never show a broken state" (V3_DESIGN.md line 16) requires this.
- No hook currently calls `functions.invoke`; this would be the first such call in `src/hooks/`.
- The hardened proxy convention to copy is in `census-acs-proxy/index.ts` (3.0). `chna-data-proxy/index.ts` is the **older, un-hardened** style (`await resp.json()` with no content-type check) - do **not** copy it.

### The recurring "proportional model" (reconstructable from existing code)

Four of the five fallbacks already compute the model in TypeScript at module-load
time. The model is identical in shape across them:

```
countyShare        = countyMetric / sum(all county metrics)
allocatedValue     = round(STATE_LEVEL_CONSTANT * countyShare)
```

Each fallback file holds the per-county raw inputs, the state-level constant(s),
and (where applicable) uncertainty multipliers. The edge function's only new job
is to fetch **fresher** county shares / state constants from the upstream API and
re-run the exact same arithmetic. The model does **not** need to be re-derived
from the V3 spec - it is in the code.

---

## 1. Shared hardened-function template (skeleton)

Copy the conventions from `supabase/functions/census-acs-proxy/index.ts`:
CORS headers; required-key -> 500; content-type check -> 502; no silent
placeholder / no partial success; in-memory TTL cache; `VERSION` constant.

```ts
// supabase/functions/<name>/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FUNCTION_VERSION = "1.0";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // mirror the hook staleTime (24h)
const cache = new Map<string, { data: unknown; ts: number }>();

function cacheGet(key: string): unknown | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return e.data;
}

// Strict reader: reject non-OK and non-JSON upstream responses (no silent
// placeholder). Identical contract to census-acs-proxy readJsonStrict().
async function readJsonStrict(resp: Response):
  Promise<{ ok: true; data: unknown }
        | { ok: false; status: number; contentType: string; bodySnippet: string }> {
  const contentType = resp.headers.get("content-type") ?? "";
  const bodyText = await resp.text();
  if (!resp.ok || !contentType.toLowerCase().includes("application/json")) {
    return { ok: false, status: resp.status, contentType, bodySnippet: bodyText.slice(0, 200) };
  }
  try { return { ok: true, data: JSON.parse(bodyText) }; }
  catch (err) {
    return { ok: false, status: resp.status, contentType,
      bodySnippet: `JSON parse failed: ${err instanceof Error ? err.message : "unknown"}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // 1. Required-key guard (ONLY for functions that need a key) -> 500
  //    const key = Deno.env.get("<ENV_VAR>");
  //    if (!key) return json(500, { error: "<ENV_VAR> not configured", functionVersion: FUNCTION_VERSION });

  try {
    // 2. Serve cache if warm.
    // 3. fetch() upstream; readJsonStrict(); on !ok -> json(502, {error, upstreamStatus, bodySnippet}).
    // 4. Validate rows (e.g. persons >= 0; FIPS in Michigan 26xxx set). Reject -> 502.
    // 5. Re-run the proportional model -> shape EXACTLY the hook's return interface.
    // 6. cache.set(); return json(200, payload).
  } catch (err) {
    return json(500, { error: err instanceof Error ? err.message : "Unknown error", functionVersion: FUNCTION_VERSION });
  }
});

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
```

### Hook-side swap pattern (applies to all 5)

The function must return **exactly** the hook's `T` (or `T[]`), so the `queryFn`
becomes:

```ts
queryFn: async () => {
  if (!supabaseConfigured) return FALLBACK;
  const { data, error } = await supabase.functions.invoke("<name>");
  if (error || !data) return FALLBACK; // never show a broken state
  return data as T;
},
```

`initialData: FALLBACK` (already present on 3 of the hooks) keeps first paint
intact and avoids the Framer Motion repaint race noted in the hook comments.

### Shared Michigan-FIPS validation helper

All four county functions should validate against the 83-county Michigan FIPS
registry. The SSOT is the sacrosanct `artifacts/access-mi/src/data/census-geographies.ts`.
Because edge functions are Deno and live outside the app `src/`, embed a frozen
copy of the `26xxx` FIPS list inside each function (or a shared
`supabase/functions/_shared/michigan-fips.ts` module) rather than importing
across the app boundary.

---

## 2. Per-function sections

### 2.1 `usda-snap-county`  (Feature 1 - measured)

- **Hook:** `artifacts/access-mi/src/hooks/useSnapMichigan.ts` (TODO at line 23).
- **Fallback:** `artifacts/access-mi/src/data/snapMichiganFallback.ts`.
- **Return interface** (`useSnapMichigan.ts` lines 9-17):
  ```ts
  interface SnapMichiganData { counties: SnapCountyData[]; state: SnapStateData; }
  // SnapCountyData: snapMichiganFallback.ts lines 18-29
  //   county, fips, enrollmentTotal|null, enrollmentHouseholds|null, enrollmentAsOf,
  //   sourceName, sourceUrl, retailerCount|null, retailerAsOf|null, retailerSourceUrl|null
  // SnapStateData: lines 31-38
  //   stateTotal, stateAsOf, stateSourceUrl, benefitIssuanceMonthly, benefitAsOf, benefitSourceUrl
  ```
- **Upstream source:** USDA FNS SNAP Data Tables (county annual Excel + state monthly tables). See V3_DESIGN.md lines 124-130, 183-184. URLs already in fallback (`snapMichiganFallback.ts` lines 41-44).
- **API key needed:** **No** (USDA FNS files are public). No env var.
- **Model summary:** This is **measured data, not a proportional model** - the function transcribes USDA county rows and state totals into the interface. County annual is FY2022-vintage Excel; state is current-month-minus-2 monthly table.
- **Files to add/change:**
  - Add `supabase/functions/usda-snap-county/index.ts`.
  - Edit `useSnapMichigan.ts` queryFn (lines 22-27) to invoke + fallback.
  - Register in `supabase/config.toml` (add `[functions.usda-snap-county]` if per-function config is adopted).
  - Add a refresh workflow analogous to `.github/workflows/build-data.yml`.
- **Provenance/manifest updates:** `sourceName`/`sourceUrl` are emitted inside each row, so no `IntegrityBadge` change. Confirm USDA FNS is present in `artifacts/access-mi/src/data/sourcesRegistry.ts`; add the SNAP retailer / state-issuance entries to `sourceManifest.ts` if any rendered numeric figure (e.g. `9,200+` retailers, `1.4M` recipients) is not already anchored (the manifest already has `1,544,250` food-insecure and `$1.70` SNAP multiplier; verify the recipient/retailer counts).
- **Testing approach:** Unit test the row parser against a fixture USDA Excel slice (Michigan rows only) asserting 83 counties + FIPS validity + `persons >= 0`; assert returned shape deep-equals `SnapMichiganData`; assert state monthly fields populate. Run through `pnpm check:tests`, `pnpm typecheck`, `check-counts.mjs` / `check-provenance.mjs`.
- **Complexity: M.** XLSX parsing in Deno is the main lift (needs a Deno-compatible xlsx lib, e.g. `sheetjs` via esm.sh); two upstream artifacts (annual + monthly) to merge.

---

### 2.2 `snap-coverage-at-risk`  (Feature 2 - projected/modeled)

> **Status (2026-06-19): effectively satisfied - no separate function needed.**
> Feature 1 (`usda-snap-county`) was built as a scheduled ingest script that
> commits `snapCountyGenerated.json`, and `SNAP_COUNTY_FALLBACK` now flows from
> that file. `snapCoverageAtRiskFallback.ts` imports `SNAP_COUNTY_FALLBACK` and
> recomputes the MLPP/GAO projection at module load, so it **auto-derives from
> the refreshed county baseline** every build - which is exactly what an edge
> function here would do ("re-run the same arithmetic on fresher county shares").
> A dedicated `snap-coverage-at-risk` edge function would be redundant under this
> architecture. Build one only if you need the projection to update *between*
> data refreshes without a redeploy.

- **Hook:** `artifacts/access-mi/src/hooks/useSnapCoverageAtRisk.ts` (TODO line 13). Note: this hook has **no** `initialData` (only `staleTime`), unlike the medicaid/dual hooks.
- **Fallback:** `artifacts/access-mi/src/data/snapCoverageAtRiskFallback.ts`.
- **Return interface** (`SnapCoverageRangeEntry`, fallback lines 25-36): `county, fips, currentSnapEnrollment, currentSnapAsOf, projectedAffectedLow, projectedAffectedHigh, projectionSourceName, methodologyUrl, projectionAsOf, caveat` -> array.
- **Upstream source:** **None new.** The model consumes `SNAP_COUNTY_FALLBACK` (Feature 1's data) + static constants. Per V3_DESIGN.md lines 478-479: "Edge function: no new function; uses `usda-snap-county` data + static MLPP/CBO constants." This function is effectively a **derivation of `usda-snap-county`'s output**.
- **API key needed:** **No.**
- **Model summary (fully reconstructable from `snapCoverageAtRiskFallback.ts` lines 42-100):**
  - `MLPP_MICHIGAN_STATE_ESTIMATE = 74,000` (line 42).
  - `countyShare = enrollment / COUNTY_ENROLLMENT_TOTAL`; `midpoint = 74,000 * share`.
  - GAO-19-56 band: `low = round(midpoint * 0.60)`, `high = round(midpoint * 1.40)` (lines 45-46, 81-84).
  - Null-enrollment counties -> zeros + "cannot project" caveat.
- **Files to add/change:**
  - Add `supabase/functions/snap-coverage-at-risk/index.ts` (calls/ reuses `usda-snap-county` data, applies model). Simplest: have it re-fetch the same USDA county enrollment then run the model, OR invoke `usda-snap-county` internally.
  - Edit `useSnapCoverageAtRisk.ts` queryFn; consider adding `initialData: SNAP_COVERAGE_AT_RISK_FALLBACK` for paint-race parity.
- **Provenance/manifest updates:** Output already carries `projectionSourceName = "Modeled from MLPP/CBO P.L. 119-21 SNAP score (county-allocated)"` and `methodologyUrl = "/methodology/snap-coverage-at-risk"`. Must render with `IntegrityBadge` label **PROJECTED/MODELED** (CLAUDE.md lines 30-32). MLPP 74,000 and CBO 2.4M figures should be anchored in `sourceManifest.ts` (currently absent - the manifest has no MLPP/CBO P.L. 119-21 entry; **add it**). The `/methodology/snap-coverage-at-risk` page must exist (V3_DESIGN.md lines 352-357) - confirm before shipping.
- **Testing approach:** Pure-function unit test: given a known county-enrollment vector, assert `low/high` match `round(74000*share*0.60/1.40)` and that `low <= high`; assert null-enrollment branch. No network mock needed if model is isolated.
- **Complexity: S.** No new upstream, no key, no XLSX; pure arithmetic over Feature 1 data.

---

### 2.3 `medicaid-coverage-at-risk`  (V2/V3 cross - projected/modeled)

- **Hook:** `artifacts/access-mi/src/hooks/useMedicaidCoverageAtRisk.ts` (TODO line 13; has `initialData`).
- **Fallback:** `artifacts/access-mi/src/data/medicaidCoverageAtRiskFallback.ts`.
- **Return interface** (`MedicaidCoverageRangeEntry`, fallback lines 164-174): `county, slug, fips, currentEnrollment, projectedLossLow, projectedLossHigh, projectionSourceName, methodologyUrl, projectionAsOf` -> array.
- **Upstream source:** Census ACS 5-year table **C27007** (`C27007_003E + C27007_012E`) for county Medicaid shares. Fallback documents the exact API call (lines 12-14):
  `https://api.census.gov/data/2023/acs/acs5?get=NAME,C27007_003E,C27007_012E&for=county:*&in=state:26`.
  This can route through the **existing** `census-acs-proxy` (which already requires `CENSUS_API_KEY`) - but note `C27007` is **not in that proxy's `TABLE_VARIABLES` allowlist** (census-acs-proxy lines 55-105), so either add `C27007` variables there or have this function call the Census API directly.
- **API key needed:** **Yes - `CENSUS_API_KEY`** (same secret the census proxy uses; census-acs-proxy lines 194-207).
- **Model summary (reconstructable from fallback lines 131-202):**
  - `URBAN_MICHIGAN_LOW = 171,000`, `URBAN_MICHIGAN_HIGH = 355,000` (Urban Institute, March 2026).
  - Denominator is the **ACS C27007 county sum (6,206,095)**, NOT the CMS MBES 2.4M (the file aggressively warns against using `STATEWIDE_MEDICAID_ENROLLMENT` as a denominator - lines 134-149).
  - `share = county / 6,206,095`; `low = max(1, round(171000*share))`; `high = max(1, round(355000*share))`.
  - `slug` = lowercase, spaces->hyphens, dots removed (lines 185-189).
- **Files to add/change:**
  - Add `supabase/functions/medicaid-coverage-at-risk/index.ts`.
  - Optionally extend `census-acs-proxy` `TABLE_VARIABLES` with `C27007` rather than duplicating Census fetch logic.
  - Edit `useMedicaidCoverageAtRisk.ts` queryFn.
- **Provenance/manifest updates:** Output carries `projectionSourceName` + `methodologyUrl = "/methodology/medicaid-coverage-at-risk"`; render with **PROJECTED/MODELED** `IntegrityBadge`. Add Urban Institute (171k-355k) and CBO 61570 anchors to `sourceManifest.ts` if not present (manifest currently has none). Methodology page `/methodology/medicaid-coverage-at-risk` must exist.
- **Testing approach:** Mock the Census array-of-arrays response (or census-acs-proxy JSON); assert 83 rows, FIPS validity, `share` sums ~= 1, and `sum(low) ~= 171,000` / `sum(high) ~= 355,000` within rounding tolerance; assert slug formatting.
- **Complexity: M.** Live Census dependency + key + the subtle denominator rule that must not regress; arithmetic itself is simple.

---

### 2.4 `dual-eligible-exposure`  (Feature 3 - modeled)

- **Hook:** `artifacts/access-mi/src/hooks/useDualEligibleExposure.ts` (TODO line 13; has `initialData`).
- **Fallback:** `artifacts/access-mi/src/data/dualEligibleExposureFallback.ts`.
- **Return interface** (`DualEligibleCountyEntry`, fallback lines 156-163): `county, slug, fips, acsDualEstimate, allocatedLow, allocatedHigh` -> array.
- **Upstream source:** Census ACS 5-year **B27010** (`B27010_046E + B27010_062E` = simultaneous Medicare+Medicaid, ages 35-64 and 65+). Exact API in fallback lines 15-16:
  `https://api.census.gov/data/2023/acs/acs5?get=NAME,B27010_046E,B27010_062E&for=county:*&in=state:26`.
  V3_DESIGN.md (lines 162-166, 399-403) ties this to the planned `acs-snap-county` function and the existing `acs-medicaid-county`/`census-acs-proxy` pattern. `B27010` is **not** in `census-acs-proxy` `TABLE_VARIABLES` either - same add-or-direct-fetch decision as 2.3.
- **API key needed:** **Yes - `CENSUS_API_KEY`.**
- **Model summary (reconstructable from fallback lines 49-193):**
  - `DISPLAY_RANGE_LOW = 335,000`, `DISPLAY_RANGE_HIGH = 405,000` (MACPAC 2025 / KFF blend; constants lines 49-53).
  - Denominator = ACS B27010 county sum (216,635).
  - `share = county / 216,635`; `allocatedLow = max(1, round(335000*share))`; `allocatedHigh = max(1, round(405000*share))`.
  - Note the **framing anchor** (lines 5-11): dual-eligibles are EXEMPT from P.L. 119-21 work requirements; do not frame as additive risk. Copy guards (`check-copy.mjs`) may police "vulnerable"/"at risk" usage.
- **Files to add/change:** Add `supabase/functions/dual-eligible-exposure/index.ts`; edit `useDualEligibleExposure.ts` queryFn; optionally extend census proxy allowlist with `B27010`.
- **Provenance/manifest updates:** Render with **MODELED** `IntegrityBadge`, `methodologyUrl="/methodology/dual-eligible-exposure"` (page must exist; V3_DESIGN.md lines 435-442 / 519-529). Add MACPAC 405,000 and KFF dual-eligible anchors to `sourceManifest.ts`. Ensure `check-copy.mjs` "exposure does not equal loss" / tone constraints (V3_DESIGN.md lines 455-458) pass.
- **Testing approach:** Mirror 2.3 - mock Census B27010 rows; assert 83 counties, `sum(allocatedLow) ~= 335,000`, `sum(allocatedHigh) ~= 405,000`, slug formatting, small-county `max(1,...)` floor.
- **Complexity: M.** Same Census+key profile as 2.3, plus heavier copy/tone provenance constraints.

---

### 2.5 `sheps-closures`  (Closure Watch - measured, BLOCKED)

- **Hook:** `artifacts/access-mi/src/hooks/useClosureWatch.ts` (TODO line 16). The hook's own docstring (lines 6-10) states the function "has not been built because the Sheps Center publishes Excel-only (no JSON/CSV/RSS API)."
- **Fallback:** `artifacts/access-mi/src/data/closureWatchFallback.ts`.
- **Return interface** (`ClosureEntry`, fallback lines 19-40): `id, facilityName, facilityType, serviceLineAffected?, address, city, county, latitude, longitude, closureDate, closureType, summary, sources[{name,url,accessedDate,verified}], status, asOf` -> array. The two-source rule (each `verified` entry has `sources.length >= 2`) is part of the contract.
- **Upstream source:** Cecil G. Sheps Center Rural Hospital Closures - **Excel (.xlsx) download only, no API** (fallback lines 4-10). Secondary corroboration is human-curated news (Bridge MI, Becker's, etc.).
- **API key needed:** **No** - but there is **no machine-readable feed**, so a scheduled JSON fetch is impossible.
- **Model summary:** No proportional model. This is a curated, two-source-verified dataset. An edge function would have to (a) download the Sheps XLSX, (b) filter Michigan rows, (c) parse + geocode (lat/lon are hand-entered in the fallback), and (d) satisfy the two-source rule - which the Sheps file alone cannot (it is one source). The two-source verification is inherently a human editorial step.
- **Files to add/change:** **Defer the edge function.** If/when built: `supabase/functions/sheps-closures/index.ts` as an XLSX ingest, plus a scheduled workflow; the geocoding + second-source steps likely remain a script-assisted human pipeline rather than a pure function. Hook already has the swap-in comment ready (lines 17-21).
- **Provenance/manifest updates:** Sheps + the news outlets already exist in `sourcesRegistry.ts` scope; closure-specific anchors (e.g. Sturgis REH date, "17+ OB closures") are already in `sourceManifest.ts` (lines 29-30). No new badge type.
- **Complexity: L (and blocked for full automation).** XLSX-only source, no API, lat/lon geocoding, and an editorial two-source rule that cannot be fully automated.

- **SHIPPED - freshness watcher (the tractable slice of the value):** `scripts/check-sheps-closures.mjs` + `src/test/unit/sheps-closures-freshness.test.ts` + `.github/workflows/sheps-closures-watch.yml`. Rather than generate data it can't verify, this downloads the Sheps workbook (reusing the SNAP ingest's audited OOXML reader), filters Michigan rows, and diffs them against the curated fallback's facility/city pairs - classifying each as `tracked`, `review` (same city, different facility), or `new`. The monthly workflow runs it `--strict` and opens / refreshes a curation **issue** on drift (not a PR - the second-source + geocode + summary remain human steps). This removes the "did we miss a closure?" risk while leaving the editorial contract intact. Run `pnpm check:sheps-closures --file <downloaded.xlsx>` locally; the Sheps `.xlsx` link has no stable filename, so set `SHEPS_XLSX_URL` (repo variable or `--file`).

---

## 3. Recommended build sequence

Build the simplest measured/derived functions first to establish the template,
defer the blocked one.

1. **`usda-snap-county` (M)** - build **first** as the canonical hardened
   template even though it has an XLSX wrinkle, because three other features
   depend on its data conceptually and the V3 build order puts Feature 1 first
   (V3_DESIGN.md lines 470-474). It needs **no key**, so it exercises the
   template without the Census-key path.
2. **`snap-coverage-at-risk` (S)** - build **second**. Pure derivation of #1's
   data + static constants; zero new upstream. Fastest to validate the
   model-re-run + `IntegrityBadge` PROJECTED path. Depends on #1.
3. **`medicaid-coverage-at-risk` (M)** - build **third**. Introduces the
   `CENSUS_API_KEY` path and the C27007 denominator rule. Independent of #1/#2.
4. **`dual-eligible-exposure` (M)** - build **fourth**. Reuses the exact
   Census-key + B27010 pattern from #3; adds the tone/copy provenance load.
   Pairs naturally with #3 (both extend the census-acs-proxy allowlist).
5. **`sheps-closures` (L, blocked)** - **last / deferred** until a CSV/API
   appears or an XLSX ingest pipeline is funded.

Dependencies:
- #2 depends on #1's data (county enrollment shares).
- #3 and #4 share the Census-API/key plumbing - do #3 then #4 to reuse it.
- Consider one shared change: extend `census-acs-proxy` `TABLE_VARIABLES`
  with `C27007` and `B27010` once, used by both #3 and #4.

---

## 4. Blockers / open questions

1. **`sheps-closures` has no machine-readable source (full automation BLOCKED;
   freshness watcher SHIPPED).** Sheps Center is XLSX-only; the two-source
   verification + lat/lon geocoding are editorial. Confirmed by both the hook
   docstring (`useClosureWatch.ts` lines 6-10) and the fallback header
   (`closureWatchFallback.ts` lines 4-10). **Resolved the tractable part:** rather
   than an ingest that emits unverifiable rows, `scripts/check-sheps-closures.mjs`
   + the `sheps-closures-watch` workflow now diff Sheps's Michigan rows against
   the curated fallback monthly and file a curation issue on drift (see 2.5). The
   one remaining input is operational, not architectural: the Sheps `.xlsx` link
   has no stable filename, so a maintainer sets `SHEPS_XLSX_URL` (repo variable).
   A full XLSX->Supabase ingest with an automated second source remains out of
   scope and is not recommended.

2. **XLSX parsing in Deno for `usda-snap-county`.** The USDA FNS county file is
   Excel. Need a Deno-compatible parser (e.g. SheetJS via esm.sh) and a stable
   URL for the "latest available" county Excel - V3_DESIGN.md says "Azure CDN"
   (line 126) but no concrete URL is in the repo. **Open: the exact download URL
   for the FNS annual county Excel and the state monthly table.** The fallback
   only cites the FNS landing page, not a direct file URL.

3. **`CENSUS_API_KEY` availability.** #3 and #4 require it. It is already
   required by `census-acs-proxy`, so presumably configured in the Supabase
   project - but **confirm the secret is set** before building, since the
   function returns 500 without it (no fallback at the function layer; the hook
   falls back instead).

4. **Census proxy allowlist gap.** `C27007` (medicaid) and `B27010` (dual) are
   **not** in `census-acs-proxy` `TABLE_VARIABLES` (lines 55-105). Decision:
   extend the allowlist (preferred, keeps one auditable Census path) vs. each
   function calling the Census API directly with its own key handling.

5. **Methodology pages must pre-exist.** V3_DESIGN.md requires
   `/methodology/snap-coverage-at-risk`, `/methodology/medicaid-coverage-at-risk`,
   and `/methodology/dual-eligible-exposure` to ship before the features that
   cite them (the `methodologyUrl` fields point at these). **Open: confirm these
   routes exist** (search `src/pages` for the methodology routes); a broken
   `methodologyUrl` would fail `check-links.mjs`.

6. **`sourceManifest.ts` anchors for the projection constants.** The manifest
   (sacrosanct file) currently contains **no** entries for Urban Institute
   (171k-355k), MLPP (74k), CBO P.L. 119-21 (2.4M / $186.7B), or MACPAC dual
   (405k). If any of these numbers render on screen, `check-counts.mjs` /
   `check-fabrication.mjs` may require a manifest anchor. **Open: confirm which
   of these figures are user-visible and add anchors via the manifest's
   regenerate path** (do not hand-edit sacrosanct files without the named
   exception per CLAUDE.md lines 18-28).

7. **Statelessness of in-memory cache.** Supabase edge functions are not
   guaranteed to be a single warm instance; the `cache` Map is best-effort only
   (same caveat already accepted in `census-acs-proxy`). For truly fresh data the
   real persistence is the V3 Supabase tables (`snap_county_annual`, etc.,
   V3_DESIGN.md lines 44-113) - **open: are those tables provisioned?** The MCP
   `list_tables` was not run (no app code/deploy per task scope). If the design's
   stale-while-revalidate-from-DB pattern is intended, the functions should
   upsert to and read from those tables rather than recompute from the live API
   each call.

8. **Hook interface parity for `snap-coverage-at-risk`.** Its hook lacks
   `initialData` (unlike the medicaid/dual hooks). Minor, but to avoid the
   documented first-paint repaint race, add `initialData` when wiring the invoke.
