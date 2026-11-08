# AccessMI 2027 readiness register

Source: external readiness assessment (2026-10-31) checked against the repo
and primary sources on 2026-11-08. Labels: **Verified** (checked against the
authoritative source this session), **Not verified** (could not reach or
confirm), **Fixed** (in PR for branch `claude/accessmi-2027-readiness-4cfxuu`).

## P0/P1 findings

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | Medicaid county allocation used C27007_003E + C27007_012E (population totals) | Verified, Fixed | Census metadata `api.census.gov/data/2023/acs/acs5/groups/C27007.json`; Summary File reproduces 6,206,095 |
| 2 | Urban range described as work requirements only | Verified, Fixed | Urban executive summary title names "Work Requirements and Six-Month Redeterminations" |
| 3 | SNAP ±40% attributed to GAO-19-56 | Attribution not substantiated, Fixed (relabeled) | gao.gov unreachable from this session; no page/table on file |
| 4 | Closure data mixes closures, transfers, announced events | Verified, Fixed | `eventStatus` field, counts restricted to occurred losses |
| 5 | Tawas record named "MyMichigan Medical Center West Branch" | Verified, Fixed | MyMichigan location page: "MyMichigan Medical Center Tawas", 200 Hemlock St |
| 6 | Grayling OB July 2026 event vs April verification | Verified, Fixed | Munson pages: OMH deliveries moved to Grayling Aug 2025; Gaylord move slated fall 2026 (single source, reverify) |
| 7 | Michigan Urban figures 171,000/355,000 | Not verified | urban.org and michiganpublic.org blocked by session network; figures carried as previously cited |
| 8 | Homepage claims lack claim-level records | Open | Needs claim register (sourceManifest.ts covers numeric anchors only) |
| 9 | Opportunity Atlas pending layers | Open | Existing PENDING label; add domain-completeness meter |
| 10 | Observation period vs update date | Open | Freshness registry has vintage; surface observation period on county pages |

## Not changed, flagged

- Dual-eligible model (B27010_046E + _062E) is semantically correct but omits
  duals under 35 (_013E, _029E). Small share; fix with same Summary File recipe.
- The app no longer calls the `medicaid-coverage-at-risk` Supabase function
  (2026-11-08, cost and reliability); it serves the committed static dataset.
  The function source is kept, corrected, as a reference; no redeploy needed.
- Preferred Medicaid basis is MDHHS county Healthy Michigan Plan enrollment;
  ACS adults 19-64 is a labeled proxy.

## Next sequence (proposed)

1. Claim register: every homepage/brief number -> table, field, vintage, owner.
2. Evidence contract: split VERIFIED/MODELED/PROJECTED/PENDING into measurement
   type, verification, freshness, event status (Closure Watch now models the last).
3. HMP policy record: versioned rules, application vs renewal timing (renewals on
   or after 2027-03-01 per Georgetown CCF tracker, search summary, not re-verified), official handoffs.
4. Access Gap Brief prototype: one service line (outpatient behavioral health or
   primary care) x 2-3 county clusters with a design partner.
5. Semantic guard: assert every Census variable used in `src/` and
   `supabase/functions/` against Census group metadata (generalize the test
   added for C27007).

Defer: chatbot redesign, universal access score, live capacity claims,
autonomous eligibility guidance, national expansion.
