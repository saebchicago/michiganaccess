# AccessMI

**AccessMI is an independent Michigan civic-intelligence project and public-data journal.** It organizes sourced local data and service-navigation context across all 83 Michigan counties for residents, analysts, journalists, planners, and civic partners.

Live site: https://accessmi.org

## What AccessMI is

- An independent civic-data project focused on Michigan.
- A public-data journal that connects local indicators to source context.
- A resident-facing navigation layer for care, food, housing, benefits, crisis, and other community pathways.
- An analyst-facing layer for county, ZIP, comparison, mapping, export, and source-tracing workflows.

## What AccessMI is not

AccessMI is **not** a government agency or official Michigan portal, health system, benefits administrator, 211 provider, nonprofit organization, or software vendor to government. Eligibility content is educational; applications and final determinations remain with the relevant official programs.

## Evidence and provenance

Quantitative outputs use explicit provenance states where applicable:

- **VERIFIED** — directly supported by an identified source or authoritative dataset.
- **MODELED** — derived through a documented model or transformation.
- **PROJECTED** — forward-looking estimate or scenario, labeled as such.
- **PENDING** — evidence or refresh work is not yet complete.

The site exposes its source catalog, methodology, limitations, update history, and correction path. Claims should not be treated as official statistics merely because they appear on AccessMI.

## Accountability

- Project identity and methodology: https://accessmi.org/about
- Data sources: https://accessmi.org/data-sources
- Corrections and feedback: https://accessmi.org/feedback
- Privacy: https://accessmi.org/privacy
- Press and directory kit: https://accessmi.org/press

The repository is publicly viewable. No repository-level open-source license is currently asserted here; public source availability should not be interpreted as a grant of reuse rights beyond rights otherwise provided by law or applicable third-party licenses.

## Local development

This workspace uses pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Production-equivalent root build:

```bash
pnpm build
```

The production build includes static integrity checks and a structured-data guard that prevents AccessMI from being emitted as the provider of a `GovernmentService`.

## Deployment

The production site is hosted on Netlify. Production releases are intentionally gated to reduce unnecessary build usage; deploy previews and validation are used before an explicit production release.

## Project status

AccessMI should be described publicly as an **independent civic-intelligence project / public-data journal**, not as a civic-tech organization. Institutional status, partnerships, citations, and external recognition should be stated only when independently verifiable.
