# Partner Demo Readiness — accessmi.org

**Assessed:** 2026-04-06
**Branch:** main
**Audit conducted by:** Claude Code (claude-sonnet-4-6)

---

## Overall Verdict: READY WITH YELLOW FLAGS

The platform is demo-ready. No P0 critical issues were found. One P1 data bug was auto-fixed. Two P1 items remain that require human awareness before the demo.

---

## ✅ Green — Working and verified

| Area | Status |
|------|--------|
| Production build | Clean — 0 errors |
| TypeScript types | 0 errors across entire codebase |
| Unit/component tests | 12/12 passing |
| All 126 route component files | Present and valid |
| All internal navigation links | Valid — no dead links found |
| Alt text on all images | Complete — no missing alt attributes |
| /story page | Loads cleanly, no runtime errors |
| /for-health-systems | Loads cleanly, no runtime errors |
| /partnerships/health-systems | Loads cleanly, no runtime errors |
| /detection-gap | Loads cleanly, no runtime errors |
| /chna-explorer | Loads cleanly, no runtime errors |
| /domain-dashboard (all personas) | Loads cleanly, no runtime errors |
| /equity (scorecard) | Loads cleanly, no runtime errors |
| ZIP demographic data (/zip/:zipcode) | **Fixed** — was returning null due to invalid Census API parameter |

---

## 🟡 Yellow — Auto-fixed before demo

These issues were found and automatically repaired.

| Fix | Impact |
|-----|--------|
| **Census ACS ZIP demographics** — `&in=state:26` invalid param caused HTTP 400 on all ZIP pages | All `/zip/:zipcode` pages now load real demographic data |
| Removed 2 orphaned lazy-loaded pages from route table | Slightly smaller module graph (3 fewer precached files) |
| Removed debug `console.log` from `/health-map` | No longer leaks coordinates to browser console in production |
| Fixed 3 `let` → `const` lint errors | Lint count reduced |
| Added comments to 4 empty catch blocks | Lint count reduced; intent now documented |
| Fixed useless regex escape in cdc-proxy | Minor edge case safety |

---

## 🔴 Red — Requires human review before demo

### P1: Conditional React Hooks in CountyPage
- **File:** `src/pages/CountyPage.tsx` lines 121–123
- **Risk:** If the conditional branch is hit during a demo on a county page, the page will crash (React hooks invariant violation)
- **Recommendation:** Test `/county/wayne` and `/county/kent` during your demo prep. If they load without crashing, the conditional may not be triggered in normal use. A developer should fix this before wider rollout.

### P1: FDA Food Recall Endpoint Returns 404
- **File:** `src/components/alerts/FDARecallFeed.tsx:26`
- **Risk:** The FDA food enforcement API endpoint (`/food/enforcement.json?search=state:"Michigan"`) returns 404. The component handles this gracefully (shows empty state rather than erroring), so it will not crash the page. However, the Recall Feed section of any page that includes it will always show empty.
- **Recommendation:** Before the demo, either remove the FDARecallFeed component from prominent pages or update the API endpoint URL. The component is used on the `/environment` page.

---

## P2 advisory items (no demo risk, but worth noting)

- **Large PWA precache (7.5 MB):** First-visit install on a slow connection may be slow. Not visible during a demo on WiFi.
- **/environment page slow to load:** The page makes many simultaneous external API calls. On a slow connection it may time out. On demo WiFi it should be fine.
- **/status page slow to load:** Same issue as /environment. Consider skipping this page in the demo flow.
- **20 npm dependency vulnerabilities:** All appear to be in build-time tools (rollup, workbox). No known production surface. A developer should run `npm audit fix` before the next release.
- **Rules of Hooks warnings (eslint):** 40 `react-hooks/exhaustive-deps` warnings exist across the codebase. No immediate user impact, but they indicate potential stale-data bugs that could surface under specific interaction patterns.

---

## Demo script recommendations

1. Start at the homepage (`/`) — loads cleanly
2. Demo the partner funnel: `/for-health-systems` → `/partnerships/health-systems` → `/chna-explorer`
3. Show the Systems dashboard: `/domain-dashboard` (Wayne County selected)
4. Show the Detection Gap: `/detection-gap`
5. Show the ZIP intelligence: `/zip/48214` (Census demographics now fixed)
6. Show a county page: `/county/wayne` — verify it loads before the live demo
7. Avoid: `/environment` (may be slow), `/status` (may timeout)
8. Story page (`/story`) is taste-sensitive and not touched by this audit — human review recommended before featuring prominently

---

*Full findings: `docs/AUDIT_REPORT.md`*
