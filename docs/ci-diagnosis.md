# CI Diagnosis

**Branch:** ci-test-harness
**Date:** 2026-06-11
**Auditor:** Claude Sonnet 4.6

---

## Failing workflow summary

| Workflow | Failing Step | Root Cause | Proposed Fix | Confidence |
|---|---|---|---|---|
| `facility-refresh.yml` | YAML parse (workflow never starts) | "Create PR" step `run: \|` block contains `gh pr create --body "..."` whose markdown table rows (`\| Metric \| ...`) appear at column 0 of the file (lines 109-115). YAML literal block scalars terminate when a line has less indentation than the block baseline. The zero-indented table rows terminate the block early, leaving raw markdown as top-level YAML content. Confirmed by `npx js-yaml` failure at line 109: `YAMLException: end of the stream or a document separator is expected`. | Replace `--body "..."` with `--body-file /tmp/pr-body.md`. Write the body via a shell heredoc (all lines at 10-space YAML indent, de-indented to column 0 by YAML processing). Use unquoted heredoc terminator so `$OLD_TOTAL` / `$NEW_TOTAL` / `$OLD_DATE` / `$NEW_DATE` still expand. | HIGH - parse error reproduced and root-cause line confirmed locally |
| `build-data.yml` | "Build open-data files" (`node scripts/build-data.mjs`) | Census ACS API at `https://api.census.gov/data/2023/acs/acs5?get=NAME&for=county:*` returned non-200 on June 8 (02:59 and 11:21 runs); script exits 1 after 3 retries. | NONE NEEDED - self-resolved. `_illustrative: true` was added to `census_acs_county` in `data-sources.json` between the June 8 failure and the June 8 16:57 success run. The skip path confirmed by log: "skipping illustrative placeholder: worldbank_health_exp" runs but `census_acs_county` is also flagged. | HIGH - June 8 16:57 run succeeded; current `data-sources.json` confirms `_illustrative: true` on that source |

---

## Secondary finding (not blocking)

`actions/checkout@v4` and `actions/setup-node@v4` in both workflows use Node.js 20, which is deprecated. GitHub will force Node.js 24 by default starting June 16, 2026 and will remove Node.js 20 on September 16, 2026. Both actions should be bumped to a version that declares `node20: false` before June 16. This is a warning today, not a failure, but will become one in 5 days.

---

## Verification commands run

```
npx js-yaml .github/workflows/facility-refresh.yml
# YAMLException: end of the stream or a document separator is expected (109:1)

grep -n "" .github/workflows/facility-refresh.yml | grep "^10[5-9]\|^11[0-5]"
# Confirmed: lines 109-115 are markdown table rows at column 0

gh run view 27134217630 --log | grep -E "census|exit|skip"
# "skipping illustrative placeholder: worldbank_health_exp"
# "-> census_acs_county (census)" -> exit 1

cat data-sources.json | python3 -m json.tool | grep -A5 census_acs_county
# "_illustrative": true confirmed present
```
