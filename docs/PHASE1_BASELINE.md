# Phase 1 Baseline Snapshot

**Date:** 2026-04-06
**Branch:** main (up to date with origin)
**Working tree:** clean (only untracked .audit-screenshots/)

## npm install
Clean. 20 vulnerabilities (3 low, 5 moderate, 12 high) — all transitive/build deps.

## npm run build
✅ Build succeeded in ~36s.
- 341 precache entries (7,475 kB)
- Chunk size advisory: index-DQhoDSoJ.js 675 kB (202 kB gz) — no chunk exceeds 500 kB gzipped

## tsc --noEmit
✅ 0 errors

## npm run lint
❌ 211 problems (171 errors, 40 warnings)
- Primary issues: no-explicit-any (~150), react-hooks/rules-of-hooks (CountyPage), prefer-const, no-empty, exhaustive-deps
- Previously fixed in prior audit: console.log removed, orphaned imports removed, empty catch blocks commented

## Note on CREDIBILITY_AUDIT_2026-04-06.md
File not found in docs/. Superprompt itself is the authoritative source for corrected values.
