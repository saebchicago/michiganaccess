# Performance Baseline

Generated 2026-04-05. Build stats from `npm run build` (Vite 5.4, SWC).

## Top 15 Chunks (raw / gzipped)

| Chunk | Raw | Gzipped | Notes |
| --- | ---: | ---: | --- |
| `index` (entry) | 674.79 kB | 201.41 kB | Main app bundle |
| `vendor-ui` | 585.09 kB | 163.28 kB | Radix UI + shadcn components |
| `jspdf.es.min` | 390.40 kB | 128.79 kB | Lazy-loaded (dynamic `import("jspdf")` in `generateCountyPDF.ts` and `CHNAExport.tsx`) |
| `vendor-radix` | 263.10 kB | 83.54 kB | Additional Radix primitives |
| `html2canvas.esm` | 201.42 kB | 48.03 kB | Transitive dep of jsPDF — loads only with PDF export |
| `vendor-map` | 198.89 kB | 59.98 kB | Leaflet — lazy on map routes |
| `index.es` (purify) | 150.87 kB | 51.63 kB | DOMPurify, sanitization |
| `EnvironmentPage` | 97.96 kB | 24.75 kB | Heaviest route page |
| `DownloadLocalInsights` | 91.01 kB | 25.50 kB | |
| `CountyPage` | 85.13 kB | 23.66 kB | |
| `CivicDataPage` | 69.75 kB | 17.47 kB | |
| `HealthMap` | 67.11 kB | 19.10 kB | Includes Leaflet glue |
| `TransportationPage` | 63.15 kB | 16.83 kB | |
| `ZipScorecardPage` | 63.11 kB | 16.77 kB | |
| `FindCarePage` | 56.44 kB | 15.66 kB | |

## Initial Payload (first visit, /)

- `index` + `vendor-ui` + `vendor-react` + `vendor-query` + `vendor-radix` + critical CSS
- Approximate gzipped initial JS: **~500 KB gzipped** (index 201 + vendor-ui 163 + vendor-radix 83 + vendor-react 8 + vendor-query 11 + misc)

This is above Google's recommended 170 KB gzipped initial budget for a median mobile connection. On LTE/5G it loads fast; on 3G it's noticeably slow.

## Already Good

- jsPDF is dynamically imported — only loaded on click
- html2canvas rides with jsPDF, same trigger
- Leaflet is in its own `vendor-map` chunk loaded by map routes
- All routes after `/` are lazy (`React.lazy`) per `src/config/routes.ts`
- Code splitting works: 100+ per-route chunks visible in build output
- Service worker pre-caches 344 entries totaling 7.5 MB for offline support

## Recommendations for Follow-up Perf Sprint

1. **`vendor-ui` is oversized (585 KB raw)** — the `manualChunks` config in `vite.config.ts` groups every Radix/shadcn component into one chunk. Splitting this into `vendor-ui-core` (Dialog, Sheet, Tabs, Button — used on every page) vs `vendor-ui-forms` (Select, Form, Combobox, Slider) and `vendor-ui-heavy` (Command, Carousel, charts) could cut initial payload ~100 KB gzipped.

2. **`index` entry chunk is 674 KB raw / 201 KB gzipped** — review what's imported synchronously in `App.tsx`, `main.tsx`, and top-level providers. Any context, hook, or util that isn't needed before first paint should be moved into the route-level lazy chunks.

3. **Chunk size warning on `vendor-ui` and `index`** — Vite is already emitting the 500 KB warning. Address before it grows further.

4. **Lighthouse CI not wired up** — `lighthouserc.json` exists with assertions configured, but `@lhci/cli` is not in package.json devDependencies. Install `@lhci/cli` and add `"lhci": "lhci autorun"` to npm scripts so `.github/workflows` (or Netlify build hooks) can enforce Performance ≥ 70, A11y ≥ 85 on PRs.

## Method

Bundle sizes come from Vite 5.4 build output. Lighthouse runs were not executed in this sprint (would require installing `@lhci/cli` and booting a preview server on SPA routes). Follow-up sprint should run `lhci autorun` on the five priority routes defined below.

## Suggested Lighthouse Routes

- `/` (homepage — cold start)
- `/zip/48201` (dynamic scorecard page, Detroit ZIP)
- `/compare` (interactive tool)
- `/health-map` (Leaflet-heavy)
- `/health-equity-atlas` (D3 choropleth)
