# Phase 1 Design: Environmental Justice Pathways + Service Area Intelligence

**Version**: 1.0 (June 29, 2026)  
**Use cases**: UC1 Phase 1, UC4 Phase 1  
**App root**: `artifacts/access-mi/`  
**Independence**: No named health systems, insurers, or media partners in UI copy or templates.

---

## Problem Statement

AccessMI has strong county-level environment and equity layers, a CHNA explorer with one live seed, and a custom service-area builder. It lacks:

1. A dedicated environmental justice hub with **verified causal pathways** (not over-claimed causality)
2. **Geographic service-area templates** analysts can load without hand-picking hundreds of ZIPs
3. A clear bridge from service-area selection to CHNA-aligned exports and deep maps

Phase 1 delivers analyst-facing scaffolding that honors the platform integrity rules: every number sourced, pathways use associative language unless multi-source evidence is documented, and templates are defined by geography only.

---

## Goals

| Goal | Success signal |
|---|---|
| Launch EJ pathway hub | `/environment/justice` prerendered, 2 pathways live |
| Confidence + provenance on every pathway step | IntegrityBadge on each step |
| Geographic templates on service-area builder | 4+ regions, zero org names |
| Link service area to downstream tools | Deep map, CHNA explorer, equity atlas |
| Pass CI gates | typecheck + vitest green |

## Non-Goals (Phase 1)

- Statewide MiEJScreen tract ingest (Phase A data spine - separate PR stack)
- Cohort builder persistence / Supabase workspaces
- Word/Tableau/Jupyter exports
- Predictive modeling or climate scenario engine
- Renaming existing CHNA seed identifiers (internal IDs may retain legacy names; user-facing copy stays geographic)

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Environmental Justice Hub                   │
│  EnvironmentalJusticePage (/environment/justice)              │
│    ├── CausalPathwayCard × N (from causalPathways.ts)       │
│    ├── Layer quick links → DeepMap, Equity Atlas            │
│    └── Methodology footer → /methodology, /data-sources      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              causalPathways.ts (SSOT for pathways)           │
│  CausalPathway { steps[], confidenceScore, sources[],         │
│                  languageStandard: associative | evidence }    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Service Area Builder (enhanced)              │
│  ServiceAreaPage (/service-area)                            │
│    ├── Template picker ← serviceAreaTemplates.ts            │
│    ├── Existing county/ZIP selection                        │
│    └── Quick actions → /chna-explorer, /map/layers, /equity │
└─────────────────────────────────────────────────────────────┘
```

### Data model: `CausalPathway`

```typescript
interface PathwaySource {
  name: string;
  url: string;
  vintage: string;
}

interface PathwayStep {
  id: string;
  label: string;
  description: string;
  integrityLabel: IntegrityLabel;
  sources: PathwaySource[]; // min 1; causal steps require 2+
}

interface CausalPathway {
  id: string;
  title: string;
  summary: string;
  confidenceScore: number; // 0-100 display only
  confidenceRationale: string;
  languageStandard: "associative" | "evidence-backed";
  steps: PathwayStep[];
  relatedRoutes: { label: string; href: string }[];
  lastReviewed: string; // ISO date
}
```

**Language rule**: `associative` pathways use "linked", "associated with", "correlates with". `evidence-backed` requires >=2 independent sources on the final outcome step and may use "documented relationship" - never "proven cause".

### Data model: `ServiceAreaTemplate`

```typescript
interface ServiceAreaTemplate {
  id: string;
  label: string;           // geographic name only
  description: string;
  counties: string[];      // Michigan county names
  region: string;          // e.g. "Southeast", "West Michigan"
}
```

Templates expand to ZIPs via existing `zipsForCounty()` helper on `ServiceAreaPage`.

---

## UI Specification

### Environmental Justice Page

**Route**: `/environment/justice`  
**Nav**: Linked from Environment hub and Data & Insights sitemap section

**Sections**:

1. Hero - "Environmental Justice Pathways" + independence disclaimer
2. Coverage note - EJScreen sparse ZCTA coverage until Phase A ingest
3. Pathway cards (accordion) - 2 Phase 1 pathways:
   - Air quality and respiratory burden
   - Energy burden and chronic disease management
4. Map layer shortcuts - cards linking to `/map/layers`, `/health-equity-atlas`
5. Provenance footer - `DataProvenance` component

### Service Area Template Picker

Insert above "Add to Service Area" on `/service-area`:

- Horizontal scroll or grid of template chips
- Click loads all county ZIPs (replaces or merges - **replace** for clarity in Phase 1)
- Toast confirmation: "Loaded [geographic label] template"
- "Related tools" row when selection non-empty:
  - Open in Deep Map
  - CHNA Explorer
  - Health Equity Atlas

---

## Key Decisions

| Decision | Rationale |
|---|---|
| Static TypeScript pathway registry vs database | Faster to ship; pathways change infrequently; build guards can validate source URLs |
| Geographic templates only | Preserves platform independence; any org can map their service area manually |
| County-to-ZIP expansion client-side | Reuses proven `ZIP_TO_COUNTY` join; no new ETL for Phase 1 |
| Confidence score as display metric | Matches spec; not used in downstream models until Phase 2 |
| Leaflet deep map retained | Mapbox migration is out of scope; existing layers sufficient for Phase 1 |
| No new Supabase tables in Phase 1 | Cohort persistence deferred to UC8 Phase 1 |

---

## Testing Strategy

| Test | Type |
|---|---|
| `causal-pathways.test.ts` - every pathway has >=2 steps, sources, confidence 0-100 | vitest unit |
| `service-area-templates.test.ts` - all counties in FIPS registry | vitest unit |
| A11y smoke on `/environment/justice` | optional follow-up PR |

---

## PR Plan

### PR1: Documentation foundation

**Title**: `docs: add use-case specs, gap analysis, and Phase 1 design`

**Files**:
- `docs/use-case-technical-specs.md`
- `docs/use-case-gap-analysis.md`
- `docs/design/phase1-ej-service-area-design.md`

**Dependencies**: none

---

### PR2: Causal pathway data layer

**Title**: `feat(data): add verified environmental justice pathway registry`

**Files**:
- `artifacts/access-mi/src/data/causalPathways.ts` (new)
- `artifacts/access-mi/src/test/unit/causal-pathways.test.ts` (new)

**Changes**:
- Define 2 Phase 1 pathways with EPA, CDC, ACEEE, HUD sources
- Export `CAUSAL_PATHWAYS`, `getPathwayById`

**Dependencies**: PR1 (optional, can merge independently)

---

### PR3: Causal pathway UI component

**Title**: `feat(ui): add CausalPathwayCard with integrity provenance`

**Files**:
- `artifacts/access-mi/src/components/ej/CausalPathwayCard.tsx` (new)

**Changes**:
- Accordion card with step timeline, IntegrityBadge per step, external source links
- Confidence meter (visual bar, not color-only - labeled percentage)

**Dependencies**: PR2

---

### PR4: Environmental Justice hub page

**Title**: `feat(pages): add /environment/justice pathway hub`

**Files**:
- `artifacts/access-mi/src/pages/EnvironmentalJusticePage.tsx` (new)
- `artifacts/access-mi/src/config/routes.ts`
- `artifacts/access-mi/src/config/routeMeta.ts`

**Changes**:
- Register route before catch-all slug routes
- Prerender meta entry
- EJScreen coverage disclaimer

**Dependencies**: PR3

---

### PR5: Service area geographic templates

**Title**: `feat(service-area): add geographic region templates and tool links`

**Files**:
- `artifacts/access-mi/src/data/serviceAreaTemplates.ts` (new)
- `artifacts/access-mi/src/test/unit/service-area-templates.test.ts` (new)
- `artifacts/access-mi/src/pages/ServiceAreaPage.tsx`

**Changes**:
- 5 geographic templates (Southeast 4-county, West Michigan, Capital area, Northern Lower, Upper Peninsula sample)
- Template picker UI
- Related tools link row

**Dependencies**: none (parallel with PR2-4)

---

### PR6: MiEJScreen tract ingest (Phase A - follow-on stack)

**Title**: `feat(data): ingest MiEJScreen tract layer statewide`

**Files**:
- `scripts/ingest-mieJscreen.mjs` (new)
- `artifacts/access-mi/src/data/mieJscreen.ts` or Supabase table
- `pillarRegistry.ts` status flip to `live`
- `DeepMapPage`, `CHNATractMap` wiring

**Dependencies**: PR4 (pathway hub should exist before expanding EJ layers)

**Note**: Requires data engineering sprint; not part of this implementation batch.

---

### PR7: Cohort builder MVP (UC8 Phase 1) - SHIPPED

**Title**: `feat(tools): multi-criteria ZIP cohort builder with share URL`

**Files**:
- `src/utils/cohortFilter.ts`
- `src/pages/CohortBuilderPage.tsx`
- `src/test/unit/cohort-filter.test.ts`
- Route: `/cohort-builder`

**Dependencies**: PR6 deferred (EJScreen filters use existing 15-ZCTA seed; county metrics MODELED)

---

## Rollout

1. Merge PR1-5 as a single branch or stacked PRs
2. Run `pnpm typecheck` + `pnpm check:tests` from `artifacts/access-mi/`
3. Spot-check `/environment/justice` and `/service-area` at 1280px and 375px
4. Schedule PR6 data spine sprint separately

---

## Open Questions (deferred)

1. Mapbox vs Leaflet migration timeline?
2. Supabase schema for saved cohorts - single table vs normalized filters?
3. RAG index source - `sourceManifest.ts` only or full `pillarRegistry`?

---

*Design approved for implementation: June 29, 2026*