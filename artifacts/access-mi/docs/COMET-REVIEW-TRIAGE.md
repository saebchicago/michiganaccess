# Triage: External UX/Credibility Review (Perplexity Comet)

A two-part external browser-agent review of accessmi.org raised a large set
of IA, UX, and provenance concerns. Per the same discipline used for prior
browser-feedback sweeps (see `FIXLOG.md`), every claim was verified against
the actual source before acting on it - the review is a third-party
observation, not ground truth, and several of its claims turned out to be
stale or already addressed.

## Verified stale / already handled - no action taken

- **"Footer dumps 20-30 links flat."** False as of this pass - `Footer.tsx`
  already caps each long section at 7 links with a "Show all N" toggle
  (progressive disclosure, shipped in an earlier pass).
- **"Resident/Analyst segmentation is implied but not structured into
  actual modes."** False - `Index.tsx`'s persona toggle is wired and
  functional: Analyst mode reorders the homepage doors to lead with
  Visualize, Resident mode leads with Understand (shipped in an earlier
  pass).
- **"No quick path to composite ZIP score weights, buried in
  methodology."** False - `ZipScorecardPage.tsx` already surfaces the exact
  weighting (Health 45% / Economic 35% / Environment 20%) directly next to
  the score, not just in methodology.
- **"For Health Systems / Partners / Executive Summary / Case Studies are
  redundant pages."** Not confirmed - each has a distinct H1 and purpose
  (tool pitch / usage-metrics dashboard / executive narrative / illustrative
  scenarios). They share an audience and cross-link heavily, which likely
  produced the redundancy impression, but the content itself isn't
  duplicated. No action taken; flagged below if the owner wants a genuine
  consolidation pass.

## Verified real, fixed in this pass (low-risk, no new features)

1. **Name confusion with other "Access"-branded organizations** - `AboutPage.tsx`
   only had generic independence language, no explicit disambiguation.
   Added one sentence naming the specific orgs the review flagged (ACCESS /
   Arab Community Center for Economic and Social Services, Access Health,
   Access Michigan LLC) and stating no affiliation.
2. **Quick Exit behavior undocumented** - confirmed via `QuickExitBar.tsx`
   (sacrosanct, read-only) that it hides the page and does
   `location.replace()` to a neutral site, which swaps the current history
   entry but does not clear full browsing history. Neither `PrivacyPage.tsx`
   nor `AccessibilityPage.tsx` explained this. Added a factual "3e. Crisis
   Resources and Quick Exit" subsection to `PrivacyPage.tsx` describing
   exactly what it does and recommending private browsing for full device
   safety - describes existing sacrosanct behavior, does not modify it.
3. **No privacy statement about crisis-resource page views** - confirmed
   `PrivacyPage.tsx` never addressed whether visits to 988/741741/211-related
   content are tracked any differently than other pages. Added a sentence to
   the same new subsection clarifying they're measured identically to any
   other page view under the existing aggregate, non-identifying GA4 setup
   (Section 3b) - describes existing configuration, does not change GA4
   setup or add new tracking.
4. **Inconsistent provenance disclosure on the 79.7% uncontested-races
   statistic** - the homepage's door tile for this exact statistic already
   self-discloses "Formal provenance label pending" (a deliberate,
   documented choice - see the code comment at `Index.tsx:34-41`), but
   `CivicPowerPage.tsx`'s primary display of the same number had no
   disclosure at all. Matched the existing disclosure text so the same
   number reads consistently everywhere it appears. No new claim was added;
   the underlying data source documentation (`src/data/uncontestedRaces.ts`)
   already discloses its own regional-coverage scope (~13,830 of 15,139
   statewide races).

## Real concerns, NOT acted on - need an owner decision

These are legitimate points from the review, but each is a genuine product/
IA decision or a multi-page feature build, not a verifiable bug fix. Per the
established split (see `FIXLOG.md`'s PR-H1/PR-H2 pattern), these should be
scoped and prioritized separately rather than built unilaterally:

- **Global navigation restructuring** (task-based nav, e.g. "Find Help" /
  "Data & Insights" / "Civic Power" / "About & Methods") - a real IA
  proposal, but changing primary nav is a significant, highly visible
  change that affects every page and the existing 3-pillar taxonomy
  (Understand/Visualize/Belong) was itself a deliberate, recent redesign.
- **Dedicated `/resident` and `/analyst` hub pages** with curated task
  lists - new pages, not a fix to an existing one.
- **Homepage above-the-fold CTA reduction** - confirmed there are ~8 link/
  button CTAs across UtilityRail/Masthead/Hero/ResourceBridgeBand before the
  Three Doors grid. Reducing this means deciding which CTAs to cut or
  relocate - a design call, not a mechanical fix.
- **A dedicated "coverage status" / "coverage confidence" dashboard**
  (per-feature, per-county completeness indicators) - a genuinely useful
  trust feature, but a new page/component, not a fix.
- **A structured "trust log" page** with per-metric status (Verified/In
  Review/Deprecated) and reviewer/date fields - a new feature requiring a
  data model decision (where do statuses live, who updates them), not
  something to improvise into existing docs.
- **Full legend + label (VERIFIED/MODELED/PROJECTED) on every chart/map**
  - `docs/AUDIT.md` from the SEO/a11y pass already identified specific
  charts missing `role="img"`/accessible labels (SNAP multivariable charts,
  ComparePlacesPage radar/bar charts); rolling out a legend convention to
  *every* chart sitewide is the right idea but a larger, separate sweep.
- **"Entry console" / guided wizard for residents** (ask ZIP + need +
  urgency, then route) - new interactive feature, not a fix.
- **MOE ("margin of error") wording** - the review suggested clarifying
  "MOE unavailable" as "not yet integrated into our pipeline" rather than "we
  chose not to show it." Not changed: asserting a specific reason (pipeline
  gap vs. genuinely unavailable from the source for that query) would be a
  factual claim about the data pipeline that wasn't verified in this pass,
  and zero-fabrication rules mean it shouldn't be guessed at. If the real
  reason is confirmed, this is a one-line copy fix in
  `src/components/shared/ReliabilityNote.tsx`.
- **"Wayne County (Health System)" audience-lens label** - confirmed this
  string is the sr-only `ContextBar` announcement when the "Health System"
  professional-audience filter is active; it's a persona/lens label (like
  "Resident"), not an affiliation claim, and the platform's non-affiliation
  language already appears elsewhere on the same page (Footer, homepage
  independence statement). Reworded further only if the owner still finds
  it ambiguous after this context - didn't want to re-touch `ContextBar.tsx`
  (already revised once this session for a related grammar bug) without a
  concrete replacement wording to propose.
