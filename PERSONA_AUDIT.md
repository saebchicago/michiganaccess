# PERSONA AUDIT — accessmi.org
*Generated: 2026-04-08 · Phase 0 (read-only)*

Target state: exactly **two** audience archetypes — **Citizen** (current: "resident") and **Systems** (current: "health-system"). Everything else is in scope for removal or merge.

---

## SECTION 1 — Audience Toggle / Switcher / View-Mode Controls

### 1.1 AudienceSelector component — **3-button toggle (in scope)**
`src/components/home/AudienceSelector.tsx:18-44`
Three audience buttons: `resident`, `health-system`, **`policymaker`** (labeled "Data & Research", badge "NEW").
The third button (`policymaker`) maps to `personaView: "professional"` and scrolls to `#community-health-equity`.
**Action:** Remove the policymaker entry from the `audienceIds` array.

### 1.2 CountyContext — Audience union type **(in scope)**
`src/contexts/CountyContext.tsx:21`
```ts
export type Audience = "resident" | "health-system" | "policymaker";
```
Includes `policymaker` as a valid audience value, persisted to `localStorage` under key `"mi-access-audience"`.
**Action:** Remove `"policymaker"` from the union. Add localStorage migration: if stored value === `"policymaker"`, coerce to `null` (unset).

### 1.3 aiService — generateCountyStory audience param **(borderline — internal AI prompt)**
`src/Services/aiService.ts:257`
```ts
audience: "resident" | "policymaker" | "health-system" = "resident"
```
This function formats AI prompts differently per audience (lines 261–263). The policymaker branch generates a "policy levers" narrative. This is called internally, not a user-facing toggle.
**Action:** Remove policymaker branch from this function; collapse to resident/health-system only.

### 1.4 PersonaView type — already 2-mode **(no action needed)**
`src/pages/Index.tsx:69`
```ts
export type PersonaView = "resident" | "professional";
```
Only two values. No "practitioner". ✅

### 1.5 ModeToggle (civic page mode) — **(not a persona toggle, no action needed)**
`src/components/civic/ModeToggle.tsx:3`
```ts
export type ViewMode = "resident" | "policy" | "nerd";
```
This is a data-presentation detail level toggle on civic pages, not an audience-selection surface. "policy" here means "show policy details" not "you are a policymaker". ✅

---

## SECTION 2 — Persona Content Arrays (3 entries)

### 2.1 ResearchPage — personas array: Maria / Dorothy / **Amina** **(in scope)**
`src/pages/ResearchPage.tsx:19-65`
Three persona cards:
- Line 19: **Maria, 34** — Uninsured Essential Worker, Detroit. Citizen.
- Line 36: **Dorothy, 72** — Rural Senior With Chronic Conditions, Alpena. Citizen.
- Line 50: **Amina, 41** — Refugee Community Health Worker, Grand Rapids. Third persona.

Amina's unique narrative value (multilingual needs, cultural competency indicators, trust signals for immigrant communities) should be merged into Maria's `barriers` and `implications` fields before removal.

### 2.2 ResearchPage — journeys array: CHW Crisis Navigation **(in scope)**
`src/pages/ResearchPage.tsx:98-113`
Third journey titled "Community Health Worker Crisis Navigation" (persona: Amina). Unique insight: language/cultural indicators, real-time mobile usability under stress, trust built through representation.
**Action:** Remove Amina's journey. Merge the key insight ("Language/cultural indicators must be first-class features") into Maria's journey insight text.

### 2.3 PersonaCarousel — PERSONAS array: Maria / Dorothy / **James** **(in scope)**
`src/components/appeals/PersonaCarousel.tsx:20-63`
Three scenarios:
- Line 21: **Maria** — Uninsured Essential Worker, Medicaid fair hearing. Citizen.
- Line 35: **Dorothy** — Rural Senior on Medicare, Medicare Advantage PT appeal. Citizen.
- Line 48: **James** — Employer Plan Worker, DIFS external review. Third persona.

James's unique value (employer-sponsored plan + DIFS external review pathway) can be absorbed into a note on Dorothy's card or in the surrounding copy about the external review process.

---

## SECTION 3 — Navigation Labels (third-persona framing)

### 3.1 No "For Health Workers" / "For Practitioners" nav links found ✅
Search of `src/config/routes.ts` NAV_GROUPS and Footer.tsx: no nav items with "practitioner," "health worker," or "for-provider" labels. The only third-party-facing nav items are "For Health Systems" (Systems persona — keep).

### 3.2 Footer "For Health Systems" **(out of scope — keep)**
`src/components/layout/Footer.tsx:132`
```ts
{ label: "For Health Systems", href: "/for-health-systems" },
```
Systems persona. Do not touch.

### 3.3 SiteSearch "For Health Systems" **(out of scope — keep)**
`src/components/shared/SiteSearch.tsx:51`
Systems persona. Do not touch.

---

## SECTION 4 — Routes

### 4.1 No `/practitioner`, `/health-worker`, `/for-practitioners`, `/for-providers` routes found ✅
Full search of `src/config/routes.ts`: none of these paths exist.

### 4.2 `/provider-data` route **(data route — no action needed)**
`src/config/routes.ts` (line ~267)
```ts
{ path: "/provider-data", component: pages.ProviderDataPage, label: "Provider Data" }
```
This page surfaces provider directory data, not a "this site is for providers" audience surface. ✅

### 4.3 `/for-health-systems`, `/partnerships/health-systems`, `/partnerships/health-systems/one-pager` **(out of scope — keep)**
Systems persona pages. Do not touch per instructions.

---

## SECTION 5 — Page Titles / Headings / Hero Copy with Audience Framing

### 5.1 ImpactDashboardPage — "Community Health Worker" use-case tile **(borderline — data, not toggle)**
`src/pages/ImpactDashboardPage.tsx:35`
```ts
{ icon: Heart, title: "Community Health Worker", desc: "Quickly locates food pantries, housing assistance, and transportation for clients using ZIP-level search.", color: "text-destructive" },
```
This is in a "who can use this platform" array that illustrates use cases. It describes CHWs as *users* of the platform (data context), not as a named audience mode. However, it does imply a third persona. **Recommend removing this tile and replacing with a Citizen-framed tile.**

### 5.2 ResearchPage testing note — "4 community health workers" **(data — no action needed)**
`src/i18n/locales/en.json:462`
```
"testingNote": "Testing conducted with 12 participants: 4 uninsured individuals, 4 seniors, 4 community health workers."
```
Describes who participated in usability testing. This is a methodology note, not an audience surface.

### 5.3 TechnicalPage FHIR reference — "Practitioner, PractitionerRole" **(data label — no action needed)**
`src/pages/TechnicalPage.tsx:86`
FHIR R4 resource type names (`Practitioner`, `PractitionerRole`) — these are HL7 standard names for data model entities, not audience descriptors. ✅

### 5.4 PortfolioPage — "clinicians, researchers, and executives" **(internal page — no action needed)**
`src/pages/PortfolioPage.tsx:47,131`
Portfolio/about copy listing audiences of a separate product. Not a site-wide persona surface.

---

## SECTION 6 — i18n Keys (en.json + es.json)

### 6.1 `audience.provider` + `audience.provider_desc` **(in scope — orphaned keys)**
`src/i18n/locales/en.json:547-548`
```json
"provider": "Provider",
"provider_desc": "Referral tools & gap data"
```
`src/i18n/locales/es.json:546-547`
```json
"provider": "Proveedor",
"provider_desc": "Herramientas de derivación y datos de brecha"
```
These keys are NOT referenced by the current AudienceSelector (which only uses "resident", "health-system", "policymaker"). They are orphaned leftover keys. No component currently consumes them.
**Action:** Delete from both files.

### 6.2 `audience.policymaker` + `audience.policymaker_desc` **(in scope — policymaker audience removed)**
`src/i18n/locales/en.json:551-552`
```json
"policymaker": "Policymaker",
"policymaker_desc": "Equity metrics & impact data"
```
`src/i18n/locales/es.json:550-551`
```json
"policymaker": "Responsable de políticas",
"policymaker_desc": "Métricas de equidad y datos de impacto"
```
Used in ContextBar's label display for the policymaker audience chip.
**Action:** Delete from both files after removing all consumers.

### 6.3 `audience.resident`, `audience.health_system` **(keep)**
Keep these. They represent the two surviving personas.

---

## SECTION 7 — Analytics Events / Data Attributes

### 7.1 No persona-tagged analytics events found ✅
`src/utils/searchAnalytics.ts`: logs search terms only, no persona field.
No PostHog, Mixpanel, or Google Analytics persona tracking calls found in src/.
The Supabase `search_analytics` table schema does not include a persona/audience column.

---

## SECTION 8 — Components with Policymaker-Audience Branching Logic

### 8.1 SpotlightTabs — PERSONA_CATEGORIES includes policymaker **(in scope)**
`src/components/shared/SpotlightTabs.tsx:282-283`
```ts
"health-system": ["Community", "Energy", "Education", "Transportation", "Veterans & Seniors"],
policymaker: ["Legal & Civic", "Environment", "Energy", "Disaster Prep"],
```
Lines 321 and 426–428 branch on `audience === "policymaker"`.
**Action:** Remove the `policymaker` key from `PERSONA_CATEGORIES` and all branches checking for it.

### 8.2 SmartRecommendations — policymaker default category **(in scope)**
`src/components/home/SmartRecommendations.tsx:71,127`
```ts
policymaker: "civic",
```
Line 127: renders label "Suggested for policymakers" when audience is policymaker.
**Action:** Remove policymaker entry and display branch.

### 8.3 ContextBar — policymaker label **(in scope)**
`src/components/shared/ContextBar.tsx:19,215`
```ts
policymaker: "Policymaker",
```
Line 215: constructs filter summary string with "for Policymakers".
**Action:** Remove policymaker entry from `AUDIENCE_LABELS` map.

### 8.4 CommunityResourcesPage — PERSONA_PRIORITY includes policymaker **(in scope)**
`src/pages/CommunityResourcesPage.tsx:140,368`
```ts
policymaker: ["environment", "info_referral", "disaster_prep", "education"],
```
Line 368: renders "Recommended for Policymakers" label.
**Action:** Remove policymaker key from `PERSONA_PRIORITY` and the ternary label.

### 8.5 ZIPNarratives — NarrativeRole includes policymaker **(in scope)**
`src/components/zip/ZIPNarratives.tsx:5,24,31,39,40,78`
```ts
type NarrativeRole = "resident" | "strategist" | "policymaker";
```
Generates a third AI narrative tab "For Policymakers" alongside resident and strategist.
**Action:** Remove "policymaker" from NarrativeRole. Remove the tab and the policymaker prompt. The "strategist" role maps naturally to Systems persona.

---

## SUMMARY TABLE

| # | File | Lines | Surface Type | In Scope? | Proposed Action |
|---|------|-------|-------------|-----------|-----------------|
| 1 | `src/components/home/AudienceSelector.tsx` | 36–43 | 3rd audience button (policymaker) | ✅ YES | Remove policymaker entry |
| 2 | `src/contexts/CountyContext.tsx` | 21 | Audience type includes policymaker | ✅ YES | Remove "policymaker" from union; add localStorage migration |
| 3 | `src/Services/aiService.ts` | 257–263 | AI prompt policymaker audience branch | ✅ YES | Remove policymaker branch |
| 4 | `src/pages/ResearchPage.tsx` | 50–64 | Amina (3rd persona card) | ✅ YES | Remove; merge multilingual/cultural insights into Maria |
| 5 | `src/pages/ResearchPage.tsx` | 99–113 | Amina CHW journey map (3rd journey) | ✅ YES | Remove; merge language/cultural insight into Maria's journey |
| 6 | `src/components/appeals/PersonaCarousel.tsx` | 48–63 | James (3rd scenario) | ✅ YES | Remove; optionally note DIFS external review in Dorothy card |
| 7 | `src/i18n/locales/en.json` | 547–548 | `audience.provider` + `_desc` | ✅ YES | Delete (orphaned) |
| 8 | `src/i18n/locales/en.json` | 551–552 | `audience.policymaker` + `_desc` | ✅ YES | Delete after removing consumers |
| 9 | `src/i18n/locales/es.json` | 546–547 | `audience.provider` + `_desc` | ✅ YES | Delete (orphaned) |
| 10 | `src/i18n/locales/es.json` | 550–551 | `audience.policymaker` + `_desc` | ✅ YES | Delete after removing consumers |
| 11 | `src/components/shared/SpotlightTabs.tsx` | 282–283, 321, 426–428 | PERSONA_CATEGORIES policymaker branch | ✅ YES | Remove policymaker key and branch |
| 12 | `src/components/home/SmartRecommendations.tsx` | 71, 127 | policymaker default category + label | ✅ YES | Remove policymaker entry |
| 13 | `src/components/shared/ContextBar.tsx` | 19, 215 | AUDIENCE_LABELS policymaker + label text | ✅ YES | Remove policymaker entry |
| 14 | `src/pages/CommunityResourcesPage.tsx` | 140, 368 | PERSONA_PRIORITY policymaker + label | ✅ YES | Remove policymaker key and ternary |
| 15 | `src/components/zip/ZIPNarratives.tsx` | 5, 24, 31, 39, 40, 78 | NarrativeRole policymaker + tab | ✅ YES | Remove policymaker from type and tab |
| 16 | `src/pages/ImpactDashboardPage.tsx` | 35 | "Community Health Worker" use-case tile | ⚠️ BORDERLINE | Recommend removing (implies 3rd persona as audience) |

---

## OUT-OF-SCOPE HITS (no action, justified)

| File | Match | Justification |
|------|-------|---------------|
| `src/data/findhelp-specialties.ts:89` | "Nurse Practitioner" | Specialty data label for provider directory |
| `src/pages/TechnicalPage.tsx:86` | "Practitioner, PractitionerRole" | HL7 FHIR R4 resource type names (data model) |
| `src/pages/PortfolioPage.tsx:47,131` | "clinicians, researchers" | Portfolio copy describing separate product audiences |
| `src/components/appeals/DoctorKit.tsx:166` | "Provider Portal" | Link to external payer portal (not site audience toggle) |
| `src/pages/BDFinancialModelPage.tsx:687,910` | "Community health workers (CHW)" | Program delivery mechanism selector (financial model data) |
| `src/pages/HealthSystemsPage.tsx:37` | "community health workers" | Data/solution description in Systems-persona page (out of scope) |
| `src/components/tools/PolicySimulator.tsx:80` | "CHW Reimbursement" | Policy lever data in simulator tool |
| `src/pages/LeanHealthcarePage.tsx` (multiple) | "CHW" | Data citations/statistics |
| `src/pages/ClinicalTrialsPage.tsx:90,93` | "Community Health Worker" | Clinical trial data label |
| `src/pages/HealthConditionsPage.tsx:46` | "Community Health Workers" | Support services data list |
| `src/pages/HealthNewsPage.tsx:58` | "community health workers" | News article summary text |
| `src/pages/ComparePlacesPage.tsx:70` | "Community health workers" | User-submitted review text (county data) |
| `src/i18n/locales/en.json:462` | "4 community health workers" | Usability testing methodology note |
| `src/components/civic/ModeToggle.tsx:3` | ViewMode "policy" | Data-detail level toggle, not audience selection |
| `src/components/zip/ZIPNarratives.tsx` "strategist" role | N/A | "Strategist" maps to Systems persona — keep |
| `src/pages/CommunityResourcesPage.tsx` | "health-system" entries | Systems persona — keep |
| All `ForHealthSystemsPage.tsx`, `HealthSystemsPage.tsx`, `PartnershipOnePager.tsx` | Various | Explicitly out of scope |

---

## NO ROUTES NEED REDIRECTS

No `/practitioner`, `/for-practitioners`, `/health-worker`, `/for-health-workers`, or `/provider-portal` routes exist in the current codebase. No `netlify.toml` redirect entries are needed for removed routes.

No sitemap entries need to be removed for persona-specific pages (none were added for practitioner/health-worker destinations).

---

*End of Phase 0 audit. Awaiting approval to proceed to Phase 1.*
