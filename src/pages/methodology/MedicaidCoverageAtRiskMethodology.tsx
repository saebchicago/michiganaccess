import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";

// Change log — every methodology update must be recorded here
// IMPORTANT: each entry must have a unique `id` field (not just `date`)
// to prevent React duplicate-key warnings when multiple entries share a date.
const CHANGE_LOG = [
  {
    id: "2026-04-09-initial",
    date: "2026-04-09",
    description:
      "Initial methodology published. Proportional county allocation from Urban Institute Michigan " +
      "projection (171,000–355,000). ACS C27007 5-year 2023 county enrollment shares used as " +
      "allocation denominator. Six sources cited: Urban Institute, KFF Dec 2025, CBO pub. 61570, " +
      "GAO-20-149, Sommers et al. NEJM 2019, ACS B27010/C27007.",
  },
];

export default function MedicaidCoverageAtRiskMethodology() {
  usePageMeta({
    title: "Methodology: Medicaid Coverage at Risk | accessmi.org",
    description:
      "How accessmi.org models county-level Medicaid exposure ranges under P.L. 119-21 work requirement provisions.",
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Data & Insights", href: "/data-and-insights" },
            { label: "Medicaid Coverage at Risk", href: "/data/medicaid-coverage-at-risk" },
            { label: "Methodology" },
          ]}
        />

        <header>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Methodology: Medicaid Coverage at Risk
          </h1>
          <p className="text-muted-foreground text-sm">
            How county-level Medicaid exposure ranges are computed under P.L. 119-21
          </p>
        </header>

        {/* ── Exposure ≠ Disenrollment ───────────────────────────────────────── */}
        <section className="rounded-lg border-2 border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20 px-6 py-5 space-y-3">
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-300">
            Exposure is not disenrollment
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This page identifies Michigan Medicaid enrollees who fall into categories that Urban
            Institute, CBO, and CBPP project may be affected by provisions of P.L. 119-21. Being
            in an affected category is not the same as losing coverage. Individual outcomes depend
            on state implementation decisions, work requirement compliance pathways, income and
            employment changes, and administrative factors that vary by county and over time. The
            ranges on this page describe populations at elevated exposure — they do not predict who
            will or will not retain Medicaid enrollment.
          </p>
        </section>

        {/* ── Source list ───────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Sources</h2>
          <div className="space-y-3 text-sm">

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                Urban Institute: Projected Reductions in Medicaid Expansion Enrollment Under
                OBBBA's Work Requirements
              </p>
              <p className="text-muted-foreground">
                Urban Institute, March 2026.{" "}
                <a
                  href="https://www.urban.org/research/publication/projected-reductions-medicaid-expansion-enrollment-under-obbbas-work"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  urban.org — Medicaid work requirements projection
                </a>{" "}
                — Post-enactment Michigan-specific projection: 171,000–355,000 Michigan adults
                in categories projected to be affected by P.L. 119-21 work requirement
                provisions by 2028. This is the primary state-level input to the county allocation model.
                This is the most current post-enactment Michigan-specific figure available as of
                April 2026. Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                KFF: Allocating CBO's Estimated Federal Medicaid Spending Reductions to States
                Under the Enacted One Big Beautiful Bill
              </p>
              <p className="text-muted-foreground">
                Kaiser Family Foundation, December 2025.{" "}
                <a
                  href="https://www.kff.org/medicaid/allocating-cbos-estimates-of-federal-medicaid-spending-reductions-across-the-states-enacted-reconciliation-package/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  kff.org — Federal Medicaid spending reductions by state
                </a>{" "}
                — Michigan 10-year federal Medicaid spending reduction: $31.6 billion under P.L.
                119-21. This is a spending figure, not an enrollment count. Used as statewide
                spending-context statistic; not used as the county allocation input. Accessed
                April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                CBO: Estimated Budgetary Effects of P.L. 119-21 — Medicaid Provisions
              </p>
              <p className="text-muted-foreground">
                Congressional Budget Office, July 2025 (pub. 61570).{" "}
                <a
                  href="https://www.cbo.gov/system/files/2025-07/61570-Medicaid.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  cbo.gov — pub. 61570 Medicaid scoring
                </a>{" "}
                — National baseline: 7.5 million coverage loss by 2034; $326 billion federal
                savings from work requirements specifically; $63 billion / 700,000 coverage loss
                from redetermination changes. Urban Institute's Michigan projection is grounded
                in this CBO national score. Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                GAO-20-149: Medicaid — Key Considerations for Work Requirement Policies
              </p>
              <p className="text-muted-foreground">
                U.S. Government Accountability Office, 2020.{" "}
                <a
                  href="https://www.gao.gov/products/gao-20-149"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  gao.gov/products/gao-20-149
                </a>{" "}
                — Canonical 25% Medicaid coverage loss benchmark from Arkansas work requirement
                implementation. Urban Institute's methodology is grounded in the same Arkansas
                evidence base. Cited here as a methodology reference, not as an independent
                uncertainty band input. Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                Sommers et al., NEJM 2019: Medicaid Work Requirements — Results from the First
                Year in Arkansas
              </p>
              <p className="text-muted-foreground">
                Benjamin D. Sommers, Alister D. Martin, Robert J. Blendon, E. John Orav, Arnold M.
                Epstein. New England Journal of Medicine 2019;381:1073–1082.{" "}
                <a
                  href="https://www.nejm.org/doi/full/10.1056/NEJMsr1901772"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  nejm.org — Arkansas work requirements study
                </a>{" "}
                — Peer-reviewed Arkansas study. Approximately 18,000 Arkansas adults lost Medicaid
                coverage during the first year of work requirement implementation (June 2018
                through April 2019), when a federal court halted the policy. Urban Institute's
                Michigan projection derives its loss rate partly from this Arkansas evidence.
                Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                ACS B27010 / C27007 (5-year 2023): Michigan County Medicaid Enrollment
              </p>
              <p className="text-muted-foreground">
                U.S. Census Bureau, American Community Survey 5-year 2023.{" "}
                <a
                  href="https://data.census.gov/table/ACSDT5Y2023.C27007"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  data.census.gov — ACS C27007
                </a>{" "}
                — County-level Medicaid/means-tested public coverage enrollment. ACS B27010 is the
                design-document denominator; ACS C27007 (Medicaid/Means-Tested Public Coverage by
                Sex by Age) was used as the implementable county-level equivalent. County
                proportional shares — not absolute ACS values — are used for county allocation. The
                ACS survey-based statewide total (~6.2M, broader "means-tested" definition) differs
                from the CMS MBES administrative enrollment (~2.4M point-in-time); the county
                proportion method preserves Urban Institute's statewide range regardless of this
                difference. Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium text-muted-foreground italic">
                Perspectives supporting P.L. 119-21 Medicaid work requirement provisions
              </p>
              <p className="text-muted-foreground">
                We searched for analyses from organizations that support the P.L. 119-21 Medicaid
                work requirement provisions, including Heritage Foundation, AEI, and CMS
                communications. As of April 2026, no published analyses were identified that provide
                Michigan-specific county-level projections comparable to the Urban Institute /
                CBO figures used here. The CBO score (source 3 above) is the enacted-law
                authoritative figure and is used here as a neutral baseline, not as an advocacy
                estimate. If such analyses are published, this methodology will cite them.
              </p>
            </div>

          </div>
        </section>

        {/* ── Projection methodology ────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Projection methodology</h2>

          <div className="space-y-3 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground">Plain language</h3>
            <p className="leading-relaxed">
              We take Urban Institute's Michigan-specific projection of 171,000–355,000 adults
              in affected categories under P.L. 119-21 work requirements by 2028 (March 2026)
              and apply it proportionally to each Michigan county based on each county's share of
              the state's total ACS-reported Medicaid enrollment. We use Urban's range directly —
              without adding a second uncertainty band — because Urban's low and high endpoints
              already encode their own implementation scenario modeling. We present the result as
              a range, never a point estimate.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">Technical steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Baseline county enrollment</strong> — County
                Medicaid enrollment is sourced from ACS 2023 5-year, table C27007 (Medicaid/
                Means-Tested Public Coverage by Sex by Age), variables C27007_003E (male) and
                C27007_012E (female) summed per county. All 83 Michigan counties returned clean
                values. Source: ACS B27010 / C27007 5-year 2023 (see Sources above).
              </li>
              <li>
                <strong className="text-foreground">Statewide calibration</strong> — The ACS
                county survey total (~6.2M statewide) differs from the CMS MBES administrative
                point-in-time enrollment (~2.4M). The ACS "means-tested public coverage"
                definition is broader, and the 5-year window averages PHE-era enrollment peaks.
                We do not apply a calibration multiplier to county values — doing so would
                require assumptions not supported by public data. The ACS county totals are used
                only for their relative distribution (shares), not as absolute enrollment counts.
                This is disclosed here and on every county row's tooltip.
              </li>
              <li>
                <strong className="text-foreground">State-level projection input</strong> — Urban
                Institute (March 2026) projects 171,000–355,000 Michigan adults are in categories
                at elevated exposure under work requirement provisions by 2028. This range is
                used directly as the state-level input. Urban's range already encodes
                implementation scenario uncertainty; no additional band is applied by
                accessmi.org.
              </li>
              <li>
                <strong className="text-foreground">County allocation</strong> — Each county's
                projected loss range is computed as:{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  county_loss = county_ACS_enrollment / sum(all_county_ACS_enrollments) × urban_state_figure
                </code>{" "}
                computed at both the low (171,000) and high (355,000) endpoints. This uses
                straight ACS enrollment share as a proxy for work-requirement-eligible adult
                share at the county level. A more precise allocation would require county-level
                PUMS microdata on Medicaid participation by age, household type, and employment
                status — not available in published tables.
              </li>
              <li>
                <strong className="text-foreground">Floor</strong> —{" "}
                <code className="bg-muted px-1 rounded text-xs">Math.max(1, ...)</code> applied
                to both endpoints. Prevents zero-displays for very small counties (Keweenaw,
                Luce, Schoolcraft) where the allocation would otherwise round to zero.
              </li>
              <li>
                <strong className="text-foreground">Display</strong> — Every county shows a
                low–high range. No point estimate is displayed. The "Projected loss low" and
                "Projected loss high" column headers each carry a "modeled range — not a point
                estimate" qualifier directly beneath the sort button. The page subtitle and the
                amber callout both repeat "Exposure is not disenrollment" and link to this page.
              </li>
            </ol>
          </div>
        </section>

        {/* ── Limitations ──────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Limitations</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>
              ACS enrollment values reflect means-tested public coverage (broader than
              administrative Medicaid enrollment) and include PHE-era enrollment peaks in the
              5-year window. County absolute values should not be cited as Michigan Medicaid
              enrollment counts; they are used only for proportional allocation.
            </li>
            <li>
              The work-requirements-only scope does not model separate coverage loss from
              redetermination changes ($63B / 700,000 nationally per CBO pub. 61570) or provider
              tax restrictions. Those provisions would increase projected coverage loss beyond
              this range. MDHHS (August 2025) cites &gt;500,000 Michiganders at risk across all
              P.L. 119-21 Medicaid provisions combined.
            </li>
            <li>
              For small counties (Keweenaw, Luce, Ontonagon, Schoolcraft), ACS margins of error
              are high relative to enrollment estimates. County-level projections for these
              counties carry elevated uncertainty and should be interpreted with caution.
            </li>
            <li>
              Urban Institute's March 2026 projection reflects enacted-law work requirement
              implementation. It incorporates Urban's assumptions about compliance rates, state
              administrative capacity, and partial exemptions. Michigan's actual outcomes will
              depend on MDHHS implementation decisions, legal challenges, and federal rule-making
              not yet finalized.
            </li>
          </ul>
        </section>

        {/* ── Why we publish ───────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why we publish this</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No public source currently provides county-level estimates of P.L. 119-21's Medicaid
            impact for Michigan. Urban Institute publishes a Michigan state range. CBO publishes
            national figures. Individual counties — which are responsible for implementing the
            law through local MDHHS offices, Federally Qualified Health Centers, and managed care
            contractors — have no public baseline for planning. accessmi.org publishes this model
            not as an advocacy document but as a planning input: a rough, sourced,
            range-bounded estimate that a county health department, hospital, or journalist can
            use to frame a question, not answer it. The methodology is public, the uncertainty is
            explicit, and the model will be updated when better data becomes available. We believe
            making the uncertainty visible is more useful than leaving a data vacuum.
          </p>
        </section>

        {/* ── Change log ───────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Change log</h2>
          <p className="text-xs text-muted-foreground mb-2">
            Every change to this methodology is recorded here with date and reason.
          </p>
          <div className="space-y-2">
            {CHANGE_LOG.map((entry) => (
              <div key={entry.id} className="flex gap-3 text-sm">
                <span className="shrink-0 font-mono text-muted-foreground text-xs mt-0.5">
                  {entry.date}
                </span>
                <span className="text-muted-foreground">{entry.description}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-2 border-t border-border">
          <Link
            to="/data/medicaid-coverage-at-risk"
            className="text-sm text-primary hover:underline"
          >
            ← Back to Medicaid Coverage at Risk
          </Link>
        </div>
      </div>
    </Layout>
  );
}
