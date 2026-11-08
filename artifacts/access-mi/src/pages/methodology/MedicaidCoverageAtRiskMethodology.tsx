import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";

// Change log - every methodology update must be recorded here
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
  {
    id: "2026-11-08-variable-correction",
    date: "2026-11-08",
    description:
      "CORRECTION (method 2.0). The county allocation basis used C27007_003E + C27007_012E, " +
      "which Census defines as 'Male: Under 19 years' and 'Female:' (all coverage types): " +
      "population totals, not Medicaid counts (statewide sum 6,206,095). Replaced with " +
      "C27007_007E + C27007_017E, adults 19-64 with Medicaid/means-tested coverage " +
      "(1,192,197 statewide, ACS 2024 5-year), read from the Census Summary File by a script that asserts " +
      "Census metadata labels. County shares changed (e.g. Wayne 18.3% to 27.0%); the " +
      "statewide 171,000-355,000 range did not. All county ranges and CSV exports from " +
      "2026-04-09 to 2026-11-08 are superseded. Margins of error now shown per county.",
  },
  {
    id: "2026-11-08-scope-correction",
    date: "2026-11-08",
    description:
      "CORRECTION. The Urban Institute range was described as 'work requirement provisions " +
      "only'. Urban's report covers work requirements and six-month redeterminations combined, " +
      "as a reduction in 2028 Medicaid expansion enrollment versus its no-change baseline; " +
      "low/high are mitigation scenarios, not a confidence interval. The limitation that said " +
      "redetermination losses would add to this range was removed: they are already inside it.",
  },
];

export default function MedicaidCoverageAtRiskMethodology() {
  usePageMeta({
    title: "Methodology: Medicaid Coverage at Risk | accessmi.org",
    description:
      "How accessmi.org allocates Urban Institute's Michigan 2028 Medicaid expansion range (work requirements + six-month redeterminations) to counties. Method 2.0, corrected November 2026.",
    path: "/methodology/medicaid-coverage-at-risk",
    jsonLd: {
      "@type": "TechArticle",
      "headline": "Methodology: Medicaid Coverage at Risk - Michigan County Projections",
      "description":
        "Proportional county allocation of Urban Institute's Michigan 2028 range (work requirements and six-month redeterminations combined) using ACS 2024 5-year adults 19-64 with Medicaid/means-tested coverage (C27007_007E + C27007_017E).",
      "url": "https://accessmi.org/methodology/medicaid-coverage-at-risk",
      "datePublished": "2026-04-09",
      "dateModified": "2026-04-09",
      "author": { "@type": "Organization", "name": "accessmi.org", "url": "https://accessmi.org" },
      "about": "Medicaid coverage exposure under P.L. 119-21 work requirement provisions",
    },
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
            ranges on this page describe populations at elevated exposure - they do not predict who
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
                  urban.org - Medicaid work requirements projection
                </a>{" "}
                - Report title: "Projected Reductions in Medicaid Expansion Enrollment Under
                OBBBA's Work Requirements and Six-Month Redeterminations." Michigan range:
                171,000-355,000 fewer Medicaid expansion enrollees in 2028 than Urban's
                no-change baseline, with both policies combined. Low and high are mitigation
                scenarios (how well the state and enrollees manage compliance), not a
                statistical confidence interval. This is the primary state-level input to the county allocation model.
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
                  kff.org - Federal Medicaid spending reductions by state
                </a>{" "}
                - Michigan 10-year federal Medicaid spending reduction: $31.6 billion under P.L.
                119-21. This is a spending figure, not an enrollment count. Used as statewide
                spending-context statistic; not used as the county allocation input. Accessed
                April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                CBO: Estimated Budgetary Effects of P.L. 119-21 - Medicaid Provisions
              </p>
              <p className="text-muted-foreground">
                Congressional Budget Office, July 2025 (pub. 61570).{" "}
                <a
                  href="https://www.cbo.gov/publication/61570"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  cbo.gov - pub. 61570 publication landing page
                </a>{" "}
                - National baseline: 7.5 million coverage loss by 2034; $326 billion federal
                savings from work requirements specifically; $63 billion / 700,000 coverage loss
                from redetermination changes. Urban Institute's Michigan projection is grounded
                in this CBO national score. Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                GAO-20-149: Medicaid - Actions Needed to Address Weaknesses in Oversight of
                Costs to Administer Work Requirements
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
                - GAO-20-149 documents the administrative costs Arkansas and other states incurred
                to implement Medicaid work requirements. Cited here for context on implementation
                burden, not as a source for coverage loss estimates. Coverage loss figures
                (approximately 18,000 Arkansas disenrollees) come from Sommers et al. NEJM 2019
                (source 5 below). Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                Sommers et al., NEJM 2019: Medicaid Work Requirements - Results from the First
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
                  nejm.org - Arkansas work requirements study
                </a>{" "}
                - Peer-reviewed Arkansas study. Approximately 18,000 Arkansas adults lost Medicaid
                coverage during the first year of work requirement implementation (June 2018
                through April 2019), when a federal court halted the policy. Urban Institute's
                Michigan projection derives its loss rate partly from this Arkansas evidence.
                Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                ACS C27007 (5-year 2024): adults 19-64 with Medicaid/means-tested coverage
              </p>
              <p className="text-muted-foreground">
                U.S. Census Bureau, American Community Survey 5-year 2024 (2020-2024).{" "}
                <a
                  href="https://data.census.gov/table/ACSDT5Y2024.C27007"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  data.census.gov - ACS C27007
                </a>{" "}
                - Variables C27007_007E (Male: 19 to 64 years: With Medicaid/means-tested
                public coverage) and C27007_017E (the female equivalent), with 90% margins of
                error, read from the Census table-based Summary File. Statewide sum: 1,192,197 (ACS 2024 5-year, 2020-2024).
                This is a survey proxy for Healthy Michigan Plan enrollment: it also counts
                traditional-Medicaid adults and self-reported means-tested coverage, and it is
                not an administrative count. County shares - not absolute values - drive the
                allocation. ACS surveys are known to undercount low-income, non-citizen, and
                highly mobile populations. Preferred future basis: MDHHS county-level Healthy
                Michigan Plan enrollment. Reproduce with{" "}
                <code className="bg-muted px-0.5 rounded text-xs">
                  node scripts/refresh-medicaid-adult-county.mjs
                </code>
                . Ingested November 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium text-muted-foreground italic">
                Perspectives supporting P.L. 119-21 Medicaid work requirement provisions
              </p>
              <p className="text-muted-foreground">
                The Trump administration and P.L. 119-21 proponents frame work requirements as
                promoting self-sufficiency and labor force participation. CMS has issued guidance
                supporting Section 1115 demonstration waiver programs that include work
                requirements as a condition of Medicaid eligibility (see{" "}
                <a
                  href="https://www.medicaid.gov/medicaid/section-1115-demonstrations/about-section-1115-demonstrations/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  CMS Section 1115 demonstration waivers
                </a>
                ). Heritage Foundation and AEI have published analyses arguing that work
                requirements increase employment among Medicaid enrollees and reduce long-term
                dependency on public assistance. As of April 2026, no published analyses from
                these organizations provide Michigan-specific county-level enrollment projections
                comparable to the Urban Institute / CBO figures used here. The CBO score (source
                3 above) is the enacted-law authoritative figure and is used here as a neutral
                baseline. If Michigan-specific analyses from any perspective are published,
                this methodology will cite them.
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
              We take Urban Institute's Michigan range of 171,000-355,000 fewer Medicaid
              expansion enrollees in 2028 (work requirements and six-month redeterminations
              combined, March 2026) and split it across counties by each county's share of
              Michigan adults ages 19-64 who report Medicaid coverage in the ACS. We use Urban's range directly -
              without adding a second uncertainty band - because Urban's low and high endpoints
              already encode their own implementation scenario modeling. We present the result as
              a range, never a point estimate.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">Technical steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Allocation basis</strong> - ACS 2024 5-year
                table C27007, C27007_007E + C27007_017E (adults 19-64 with Medicaid/means-tested
                coverage) per county. The ingest script checks both variable labels against
                Census metadata and refuses to write on a mismatch. All 83 counties returned
                unsuppressed values.
              </li>
              <li>
                <strong className="text-foreground">No calibration</strong> - The ACS adult
                total (1,192,197) is a survey estimate and differs from administrative HMP
                enrollment. No calibration multiplier is applied. ACS values are used only for
                relative county shares.
              </li>
              <li>
                <strong className="text-foreground">State-level projection input</strong> - Urban
                Institute (March 2026) projects 171,000-355,000 fewer Michigan Medicaid expansion
                enrollees in 2028 under work requirements and six-month redeterminations
                combined. This range is
                used directly as the state-level input. Urban's range already encodes
                implementation scenario uncertainty; no additional band is applied by
                accessmi.org.
              </li>
              <li>
                <strong className="text-foreground">County allocation</strong> - Each county's
                projected loss range is computed as:{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  county_loss = county_ACS_enrollment / sum(all_county_ACS_enrollments) × urban_state_figure
                </code>{" "}
                computed at both the low (171,000) and high (355,000) endpoints. This uses each
                county's share of adults with Medicaid as a proxy for its share of expansion
                adults subject to both policies. Counties with more exempt adults (disability,
                caregiving) will be overstated. A more precise allocation would require county-level
                PUMS microdata on Medicaid participation by age, household type, and employment
                status - not available in published tables.
              </li>
              <li>
                <strong className="text-foreground">Floor</strong> -{" "}
                <code className="bg-muted px-1 rounded text-xs">Math.max(1, ...)</code> applied
                to both endpoints. Prevents zero-displays for very small counties (Keweenaw,
                Luce, Schoolcraft) where the allocation would otherwise round to zero.
              </li>
              <li>
                <strong className="text-foreground">Display</strong> - Every county shows a
                low–high range. No point estimate is displayed. The "Projected loss low" and
                "Projected loss high" column headers each carry a "modeled range - not a point
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
              ACS values reflect self-reported Medicaid/means-tested coverage among adults 19-64
              (broader than HMP enrollment) averaged over 2020-2024, including public-health-
              emergency enrollment peaks. Do not cite them as HMP enrollment counts.
            </li>
            <li>
              Urban's range already includes six-month redeterminations. Do not add CBO's
              separate redetermination estimate to it. It does not model provider tax or
              state-directed payment changes, which could affect coverage through other
              channels.{" "}
              <a
                href="https://www.michigan.gov/mdhhs/-/media/Project/Websites/mdhhs/Assistance-Programs/Medicaid/MDHHS-Presentation---SNAPMA---HR1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                MDHHS (August 2025)
              </a>{" "}
              estimates &gt;500,000 Michiganders at risk across all P.L. 119-21 Medicaid
              provisions combined. That is a different measure (people at risk, all provisions)
              and should not be compared directly with Urban's range.
            </li>
            <li>
              Small-county estimates are imprecise. Keweenaw County's basis is 213 ± 54 adults
              (90% MOE), so its allocated range carries that uncertainty on top of Urban's
              scenarios. Each county's MOE is shown on the data page and in the CSV. Source
              table:{" "}
              <a
                href="https://data.census.gov/table/ACSDT5Y2024.C27007"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                data.census.gov table C27007
              </a>
              . The <code className="bg-muted px-0.5 rounded text-xs">Math.max(1, ...)</code> floor
              prevents zero-display for these counties.
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
            national figures. Individual counties - which are responsible for implementing the
            law through local MDHHS offices, Federally Qualified Health Centers, and managed care
            contractors - have no public baseline for planning. accessmi.org publishes this model
            not as an advocacy document but as a planning input: a rough, sourced,
            range-bounded estimate that a county health department, hospital, or journalist can
            use to frame a question, not answer it. The methodology is public, the uncertainty is
            explicit, and the model will be updated when better data becomes available. Making the
            uncertainty visible is more useful than leaving this question unanswered in public
            planning records.
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
