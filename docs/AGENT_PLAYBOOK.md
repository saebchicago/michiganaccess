# Agent Playbook (MichiganAccess)

This repo runs on **Directed Autonomous Refactoring**.

## Non‑negotiables
- One PR = one system change
- Minimal file touch surface
- No hover-only navigation behavior
- Use `src/config/routes.ts` as the single source of truth for routes/nav/sitemap
- Preserve visual design unless explicitly changing it
- Use provenance everywhere you show data

## Execution prompts

### 1) Gap audit (do once per month)
Adopt the governing spec, do not implement changes, and produce only high-impact gaps grouped by:
- Navigation
- Home Experience
- Accessibility
- Performance
- Trust & Data
- Maintainability
- Design System

### 2) Navigation system
Refactor navigation for full keyboard + touch compatibility and route registry usage. Avoid visual redesign.

### 3) Home conversion
Refactor the home page into a decision interface (Crisis → Search/Pathways → Snapshot → Exploration). Preserve components; recompose flow.

### 4) Performance
Implement intent-based loading. Lazy-mount maps/dashboards/heavy sections using IntersectionObserver or equivalent. Optimize behavior only.

### 5) Trust infrastructure
Create/integrate `DataProvenance` consistently (source, last updated, methodology, feedback). Keep it institutional and restrained.

## Agent roles and prompt templates

### Repo Guardian
- Enforce routes registry
- Check keyboard nav + focus states
- Flag a11y regressions
- Flag performance hazards (eager heavy loads)
- Flag design-token drift / ad-hoc styles

### Surgical Refactor Agent
Creates a PR that changes **one system** only, outputs diff plan, then implements edits.

### UX Auditor
Audits the home page for cognitive load and recommends section order + deferrals without adding new features.

### Performance Agent
Targets LCP/hydration/bundle weight; reduces work without visual changes.

## Checklists

### Navigation
- All nav items derive from `routes.ts`
- Dropdown/menu opens via click/keyboard
- Arrow key support within menu
- Escape closes menu
- Works on touch devices

### Home Experience
- ≤ 3 primary actions above the fold
- Search and pathways are primary
- All heavy sections deferred/gated

### Accessibility
- Visible focus states everywhere
- One H1 per page
- Skip link present
- Reduced motion honored
- Announce route changes for screen readers

### Performance
- Defer map/dashboards until intent/viewport
- Avoid initial eager fetches for non-critical data

### Trust
- Provenance visible on every data surface
- Consistent format, restrained styling

## Branch & PR conventions
- Branch names: `feature/nav-accessible-menu`, `chore/route-registry`, `perf/lazy-index-sections`, etc.
- PR title: `System: <system name>`

## Definition of done (DoD)
- Fast, simple verification steps included in the PR description
- No unexpected visual regressions
- A11y + performance checklists satisfied
- Routes registry remains the single source of truth
