# AccessMI Use Case Gap Analysis

**Version**: 1.0 (June 29, 2026)  
**Scope**: Maps ten use-case specifications against the current `artifacts/access-mi/` codebase.  
**Independence**: This analysis uses stakeholder *categories* only. No named health systems, insurers, or media outlets.

---

## Executive Summary

AccessMI has a strong civic data foundation: 130+ pages, integrity labeling, county/ZIP geography, CHNA explorer seed, layered maps, and PDF export primitives. Roughly **30-35% of the full ten-use-case vision is partially built**. The largest gaps are tract-level ETL, persisted cohort/scenario workspaces, analyst APIs, and multi-source investment flow ingestion.

**Highest-leverage next steps**

1. Statewide MiEJScreen / tract spatial join pipeline (unblocks UC1, UC2, UC3)
2. Causal pathway module with confidence scoring and strict language gates (UC1 Phase 1)
3. Geographic service-area templates + CHNA data pack hardening (UC4 Phase 1)
4. Cohort builder persistence and verified-claims RAG for Ask AccessMI (UC8 Phase 1)

---

## Maturity by Use Case

| UC | Title | Maturity | Primary existing surfaces |
|---|---|---|---|
| 1 | Environmental Justice Deep Dive | ~25% | `/environment`, `/map/layers`, `/health-equity-atlas`, `/energy-burden` |
| 2 | Climate + Health Command Center | ~15% | `/environment/disaster`, `/disaster-history`, `/environment/air` |
| 3 | SDOH Risk Stratification | ~40% | `/health-equity-atlas`, `SDOHIndexBuilder`, `/compare-places`, `/compare-zips` |
| 4 | Service Area Intelligence | ~50% | `/chna-explorer`, `/service-area`, CHNA PDF export |
| 5 | Workforce + Economic Transition | ~5% | ACS poverty/unemployment only |
| 6 | Maternal/Child/Behavioral Equity | ~30% | `/maternal-health`, `/behavioral-health`, infant mortality atlas layer |
| 7 | Resource Gap + Investment | ~20% | `/public-investment`, `/transparency/money` |
| 8 | Analyst Self-Service | ~25% | `/data-explorer`, Ask AccessMI chat, `/brief` PDF |
| 9 | Scenario Planning Studio | ~35% | `BDFinancialModelPage`, `PolicySimulator`, exposure methodology pages |
| 10 | Community Benefit Tracking | ~15% | `/impact`, illustrative case studies (properly labeled) |

---

## Platform Foundations (Ready)

| Capability | Location | Notes |
|---|---|---|
| Integrity labeling | `IntegrityBadge`, `sourceManifest.ts` | VERIFIED / MODELED / PROJECTED / PENDING |
| Source registry | `sourcesRegistry.ts`, `CLAIMS.md` | 41-source build assertion |
| Geography spine | County/ZIP/place pages, `census-geographies.ts` | 83 counties |
| Dataset registry | `pillarRegistry.ts` | Live vs pending ingestion contract |
| Map layers | `HealthEquityAtlasPage`, `DeepMapPage` | County-level; tract partial |
| CHNA module | `/chna-explorer`, `chna-data-proxy` | One live system template |
| PDF exports | `generateCHNABriefPDF`, `generateBriefPDF` | No Word/BI/Jupyter yet |
| AI assistant | `aiService.ts`, AccessChat | Not yet RAG-over-verified-claims |

---

## UC1: Environmental Justice Deep Dive

### Built

- Multi-layer environment hub (`/environment`) with air, water, energy widgets
- `DeepMapPage` (`/map/layers`): PFAS, FEMA NRI, energy burden, food access, broadband
- `HealthEquityAtlasPage`: EJ index, energy burden, compound deficit
- Detroit open data in pillar registry (blight, demolitions)
- Sparse EPA EJScreen ZCTA seed (`ejscreen.ts`, ~15 ZCTAs)

### Gaps

- MiEJScreen tract ingestion (Michigan-specific EJ screen)
- Causal pathway cards with multi-source corroboration gates
- Advanced multi-criteria cohort builder at ZIP/tract level
- Story maps and narrative Word exports with audit trails
- Statewide tract spatial joins

### Data blockers

- `env-ejscreen` marked `pending` in `pillarRegistry.ts`
- EJScreen coverage disclaimer required until statewide ingest completes

---

## UC2: Climate and Health Vulnerability

### Built

- FEMA National Risk Index on deep map
- Real-time AQI proxy (`airnow-proxy`)
- Disaster history and Great Lakes level widgets

### Gaps

- NOAA downscaled climate projections
- Scenario selector (heat, flood, compound events)
- Health facility vulnerability scorecard
- Resilience ROI calculator
- Before/after projection maps with confidence bands

---

## UC3: SDOH + Health Access Risk Engine

### Built

- `SDOHIndexBuilder` with adjustable weight sliders (county level)
- `computeCompoundDeficit` utility
- Compare tools and ZIP/county scorecards

### Gaps

- ZIP/tract-level composite index
- Saved custom weight models
- Predictive utilization/outcome scoring
- Population health API

---

## UC4: Service Area Intelligence Hub

### Built

- `/chna-explorer` with priority/driver mapping and tract map
- `chna-data-proxy` edge function (four-county southeast Michigan scope)
- `/service-area` custom builder with share URL + CSV export
- `generateCHNABriefPDF`
- `/market-intelligence` regional facility counts

### Gaps

- Multiple expandable geographic templates (beyond one live CHNA seed)
- Collaboration workspaces and versioned report history
- Internal analytics API
- Full audit of CHNA seed metric transcription against primary documents

---

## UC5: Workforce Health and Economic Transition

### Built

- ACS poverty/unemployment via census proxy
- Limited economic pulse components

### Gaps

- BLS industry ingestion
- Network graph visualizations
- Talent retention scoring
- Climate/economic transition forecasting

---

## UC6: Maternal, Child, Behavioral Health

### Built

- Dedicated maternal and behavioral health pages
- Infant mortality atlas layer
- CHNA domains covering related priorities

### Gaps

- MDHHS maternal/infant integration
- Disparity decomposition
- Coalition collaboration features
- Predictive intervention modeling

---

## UC7: Resource Gap and Investment Intelligence

### Built

- Public investment page scaffold
- Michigan lobbying transparency (`/transparency/money`)

### Gaps

- USAspending and philanthropic flow ingestion
- Need vs investment dual maps
- Sankey/flow diagrams
- Gap scoring and ROI estimation

---

## UC8: Analyst Self-Service Platform

### Built

- Data explorer, dataset explorer, brief PDF export
- Ask AccessMI conversational agent
- Download center and compare utilities

### Gaps

- NL cohort builder grounded in verified claims only
- Save/share/version history for analyses
- Tableau/Power BI/Excel/Jupyter exports
- Team workspaces with audit logs

---

## UC9: Predictive Scenario Studio

### Built

- BD financial scenario modeler with localStorage resume
- Policy simulator on equity atlas
- Exposure pages with methodology and uncertainty bands

### Gaps

- Unified scenario studio across domains
- Side-by-side multi-scenario comparison
- Sensitivity analysis UI
- Shareable/versioned scenario artifacts

---

## UC10: Community Benefit and Impact Tracking

### Built

- Impact dashboard (platform-level stats)
- Illustrative scenarios with explicit labeling on case study pages

### Gaps

- Investment-to-outcome timeline attribution
- Community benefit portfolio tracking
- Regulatory-grade impact reports with traceable methodology

---

## Cross-Cutting Data Blockers

| Blocker | Affected UCs | Severity |
|---|---|---|
| Tract/ZIP ETL pipeline | 1, 2, 3, 4, 8 | Critical |
| MiEJScreen / statewide EJScreen | 1, 2 | Critical |
| Cohort/scenario persistence (Supabase) | 1, 3, 8, 9 | High |
| Analyst API surface | 4, 8, 9 | High |
| USAspending + philanthropic flows | 7, 10 | Medium |
| BLS workforce by industry | 5 | Medium |

---

## Integrity and Trust Risks

Items that must stay clean before scaling analyst or CHNA features:

1. **Sparse EJScreen** must not be marketed as statewide until ingest completes
2. **CHNA seed metrics** need primary-document transcription audit
3. **Partnership integrity audit** flagged fabricated news items and unlabeled illustrative outcomes on some partner surfaces; remediate before external diligence
4. **Causal language** must use associative framing unless multiple corroborating sources are linked in pathway metadata

---

## Recommended Build Sequence

```text
Phase A (Data spine)
  -> MiEJScreen tract ingest + spatial join tables

Phase B (UC1 + UC4 Phase 1)  [current implementation sprint]
  -> Causal pathway module (/environment/justice)
  -> Geographic service-area templates on /service-area
  -> CHNA data pack export hardening

Phase C (UC8 Phase 1)
  -> Multi-filter cohort builder
  -> Verified-claims RAG for Ask AccessMI

Phase D (UC2 + UC9)
  -> Climate scenario selector
  -> Unified scenario studio

Phase E (UC7 + UC10)
  -> Investment flows + attribution timelines
```

---

## Success Criteria for Phase B (Current Sprint)

- [x] `/environment/justice` live with 2+ verified pathways and confidence scores
- [x] Service area templates load counties/ZIPs without naming any health system
- [x] Every pathway step shows source, vintage, and integrity label
- [x] `/cohort-builder` multi-criteria ZIP filter with share URL and CSV export
- [x] Cohort localStorage library (save/load, 20 cohort cap)
- [x] JSON export for BI tooling
- [x] Ask AccessMI verified-claims RAG over sourceManifest + pathways
- [x] `netlify/functions/chat-mistral.js` restored for production
- [ ] MiEJScreen statewide ZCTA ingest (blocked: EPA ArcGIS endpoint returning 404 as of 2026-06-29)
- [x] Supabase cloud cohort publish + share URL (`?share=<uuid>`)
- [x] EJ pathway PDF + Word narrative exports with audit trail
- [ ] Supabase migration deploy required for cloud publish in production
- [x] `pnpm check:tests` and `pnpm typecheck` pass

---

*AccessMI remains an independent civic intelligence platform. This gap analysis describes technical state only.*