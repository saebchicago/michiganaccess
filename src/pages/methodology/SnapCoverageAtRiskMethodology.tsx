import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";

// Change log — every methodology update must be recorded here
const CHANGE_LOG = [
  {
    id: "2026-04-09-initial",
    date: "2026-04-09",
    description:
      "Initial methodology published. Proportional county allocation from MLPP/CBO state estimate. GAO-19-56 uncertainty band ±40%.",
  },
  {
    id: "2026-04-09-source-corrections",
    date: "2026-04-09",
    description:
      "Source corrections: removed KFF citation (original URL 404, no equivalent live article found); updated USDA FNS E&T URL to fns.usda.gov/snap-et; removed ACS B22002 citation (not a model input — county allocation denominator is USDA FNS FY2022 data from Feature 1); updated technical step 3 to name the correct denominator source.",
  },
  {
    id: "2026-04-09-browser-qa",
    date: "2026-04-09",
    description:
      "Browser QA corrections: removed opacity-60 from supporting-perspectives source block; replaced trending-down icon with neutral users icon on state estimate card; added 'modeled range' qualifier directly to column headers; renamed 'Republican-aligned analyses' section to 'Perspectives supporting P.L. 119-21 work requirement provisions'; added inline MLPP sourcing notes for 123,000 and $410M contextual figures; named MLPP and CBPP explicitly on data page in place of 'independent analysts.'",
  },
  {
    id: "2026-04-09-rereview-fixes",
    date: "2026-04-09",
    description:
      "Second browser QA pass corrections: removed stale KFF reference from data page source list (inconsistency with methodology); named MLPP and CBPP on methodology page callout to match data page; corrected the 83-county stat card from (Modeled estimate) to measured count; replaced snapMichiganFallback.ts code reference with direct USDA FNS citation in technical step 3; removed the unsourced Michigan ~3.3% share parenthetical; replaced 'bear the practical weight' with 'are responsible for' in the 'Why we publish this' section.",
  },
];

export default function SnapCoverageAtRiskMethodology() {
  usePageMeta({
    title: "Methodology: SNAP Coverage at Risk | accessmi.org",
    description:
      "How accessmi.org models county-level SNAP exposure ranges under P.L. 119-21 work requirement provisions.",
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Data & Insights", href: "/data-and-insights" },
            { label: "SNAP Coverage at Risk", href: "/data/snap-coverage-at-risk" },
            { label: "Methodology" },
          ]}
        />

        <header>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Methodology: SNAP Coverage at Risk
          </h1>
          <p className="text-muted-foreground text-sm">
            How county-level SNAP exposure ranges are computed under P.L. 119-21
          </p>
        </header>

        {/* ── Exposure ≠ Loss ───────────────────────────────────────────────── */}
        <section className="rounded-lg border-2 border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20 px-6 py-5 space-y-3">
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-300">
            Exposure does not equal loss
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This page identifies Michigan SNAP participants who fall into categories that CBO,
            MLPP, and CBPP project may be affected by provisions of P.L. 119-21. Being in
            an affected category is not the same as losing benefits. Individual outcomes depend
            on state implementation, work requirement compliance pathways, employment status, and
            administrative factors that vary by county and over time. The ranges on this page
            describe populations at elevated exposure — they do not predict who will or will not
            retain SNAP enrollment.
          </p>
        </section>

        {/* ── Source list ───────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Sources</h2>
          <div className="space-y-3 text-sm">

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                CBO: Estimated Budgetary Effects of P.L. 119-21 on SNAP Participation
              </p>
              <p className="text-muted-foreground">
                Congressional Budget Office, August 2025.{" "}
                <a
                  href="https://www.cbo.gov/system/files/2025-08/61367-SNAP.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  cbo.gov/system/files/2025-08/61367-SNAP.pdf
                </a>{" "}
                — Provides the enacted-law national projection of 2.4 million/month average
                SNAP participation reduction over FY2025–2034. This is the primary numeric
                input to the state and county models. Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">CBPP: SNAP Fact Sheet — Michigan</p>
              <p className="text-muted-foreground">
                Center on Budget and Policy Priorities, 2025.{" "}
                <a
                  href="https://www.cbpp.org/snap-state-factsheets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  cbpp.org/snap-state-factsheets
                </a>{" "}
                — Michigan-specific SNAP participation context and analysis of P.L. 119-21
                impact. Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">MLPP: The Cost of the Federal Megabill — Food Assistance</p>
              <p className="text-muted-foreground">
                Michigan League for Public Policy, November 2025.{" "}
                <a
                  href="https://mlpp.org/the-cost-of-the-federal-megabill-food-assistance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  mlpp.org — Food Assistance analysis
                </a>{" "}
                — Michigan-specific analysis citing 74,000 Michigan adults in affected
                categories, 123,000 total Michiganders in affected households, and an
                estimated $410M in new annual state costs. Sourced from CBO/CBPP/FNS.
                Accessed April 2026. Note: the 123,000 household figure and $410M state-cost
                figure are cited here for context and are not independently modeled by
                accessmi.org. Only the 74,000 adult figure is used as the state-level input
                to the county allocation model.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                GAO-19-56: SNAP — Improved Monitoring of States' Use of Work-Related
                Exemptions and Reporting of Work Requirements
              </p>
              <p className="text-muted-foreground">
                U.S. Government Accountability Office, 2019.{" "}
                <a
                  href="https://www.gao.gov/products/gao-19-56"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  gao.gov/products/gao-19-56
                </a>{" "}
                — Historical analysis of SNAP work requirement implementation across states,
                including actual vs. projected participation loss. Provides the basis for
                the ±40% uncertainty band used in county range estimates. Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">USDA FNS: SNAP Employment and Training</p>
              <p className="text-muted-foreground">
                U.S. Department of Agriculture Food and Nutrition Service.{" "}
                <a
                  href="https://www.fns.usda.gov/snap-et"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  fns.usda.gov/snap-et
                </a>{" "}
                — SNAP E&T program overview, including state plan requirements and
                participation data. Used to contextualize the gap between work requirement
                imposition and actual E&T slot availability. Accessed April 2026.
              </p>
            </div>

            <div className="border-l-2 border-border pl-4">
              <p className="font-medium text-muted-foreground italic">
                Perspectives supporting P.L. 119-21 work requirement provisions
              </p>
              <p className="text-muted-foreground">
                We searched for analyses from organizations that support the P.L. 119-21 work
                requirement expansion, including Heritage Foundation, AEI, and CMS
                communications. As of April 2026, no published analyses were identified that
                provide Michigan-specific county-level projections comparable to the MLPP/CBPP
                figures used here. The CBO score (source 1 above) is the enacted-law
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
              We take CBO's national projection of 2.4 million monthly SNAP participant
              reductions under P.L. 119-21 and apply it proportionally to each Michigan county
              based on each county's share of the state's total SNAP enrollment (the most
              current available county-level data, USDA FNS FY2022). We then apply Michigan's
              share of the national projection using MLPP's Michigan-specific estimate of 74,000
              adults in affected categories. We present the result as a range — never a point
              estimate — using an uncertainty band derived from GAO's historical study of work
              requirement implementation, which found actual participation losses ranging from
              approximately 60% to 140% of projected amounts.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">Technical steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">National CBO projection</strong> — P.L. 119-21
                is projected to reduce SNAP participation by an average of 2.4 million
                persons/month over FY2025–2034, primarily through expansion of ABAWD (Able-Bodied
                Adults Without Dependents) work requirements to ages 55–64 and adults with
                children 14+, and through tightening of categorical eligibility. Source: CBO
                pub. 61367, August 2025.
              </li>
              <li>
                <strong className="text-foreground">Michigan state estimate</strong> — MLPP derives
                a Michigan-specific estimate of 74,000 adults at risk (39,000 ages 55–64; 35,000
                with children age 14+) in households totaling 123,000 people. This figure is
                sourced from CBO/CBPP/FNS. We use MLPP's 74,000 as the state-level input
                rather than applying Michigan's enrollment share to the national 2.4M directly,
                because MLPP has already accounted for Michigan's ABAWD-eligible population mix.
              </li>
              <li>
                <strong className="text-foreground">County allocation</strong> — Each county's
                projected range midpoint is computed as:{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  county_enrollment / sum(all_county_enrollments) × 74,000
                </code>
                . The enrollment figures are USDA FNS FY2022 county-level annual average
                monthly participants, sourced from USDA Food and Nutrition Service published
                county data tables (see Sources). These figures are surfaced on accessmi.org's
                Feature 1 dashboard at{" "}
                <a href="/data/snap-michigan" className="underline hover:text-primary">
                  /data/snap-michigan
                </a>
                . This uses straight enrollment share as a proxy for
                adult ABAWD share at the county level. The simplification is documented here:
                the FNS county-level data (FY2022) does not break enrollment down by ABAWD
                eligibility category. A more precise allocation would require county-level ACS
                PUMS microdata on SNAP participation by age, household type, and employment
                status. That data is not publicly available at county level in published tables.
              </li>
              <li>
                <strong className="text-foreground">Uncertainty band</strong> — GAO-19-56 examined
                historical SNAP work requirement implementations and found that actual
                participation losses ranged widely relative to projections. We apply a ±40%
                uncertainty band:{" "}
                <code className="bg-muted px-1 rounded text-xs">low = midpoint × 0.60</code>,{" "}
                <code className="bg-muted px-1 rounded text-xs">high = midpoint × 1.40</code>.
                Both bounds are rounded to the nearest whole person. All results are displayed
                as ranges; the midpoint is never shown in isolation.
              </li>
              <li>
                <strong className="text-foreground">Display</strong> — Every county shows a
                low–high range. No point estimate is displayed. The "At-risk low" and
                "At-risk high" column headers each carry a "(modeled range — not a point
                estimate)" qualifier directly beneath the sort button. A section subtitle
                above the table repeats the qualifier. The page-level disclaimer repeats
                "Exposure does not equal loss" and links to this methodology page.
              </li>
            </ol>
          </div>
        </section>

        {/* ── What this does not do ─────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What this does not do</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>Does not predict individual benefit outcomes</li>
            <li>
              Does not account for state-level implementation choices — for example, Michigan
              could expand E&T program capacity, negotiate waivers, or implement exemptions
              that reduce the affected population below the modeled range
            </li>
            <li>
              Does not model the separate participation loss from administrative burden
              increases (tightened redetermination frequency, eligibility verification costs) —
              CBO projects these cause additional losses beyond work requirement impact, but they
              are not modeled at county level from public data
            </li>
            <li>Does not substitute for MDHHS operational guidance or legal advice</li>
            <li>
              Does not include second-order effects on food insecurity rates, authorized retailer
              viability, or emergency food network load
            </li>
            <li>
              Does not model geographic variation in E&T program slot availability, rural
              transportation access, or employer density — all factors that affect compliance
              capacity
            </li>
            <li>
              Does not use county-level ABAWD eligibility data — such data is not publicly
              available from FNS at county level; straight enrollment share is used instead
              (documented above)
            </li>
          </ul>
        </section>

        {/* ── Why we publish ───────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why we publish this</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No public source currently provides county-level estimates of P.L. 119-21's SNAP
            impact for Michigan. CBO publishes national figures. MLPP publishes a state total.
            Individual counties — which are responsible for implementing the law through local
            MDHHS offices, food banks, and E&T providers — have no public baseline for planning.
            accessmi.org publishes this model not as an advocacy document but as a planning
            input: a rough, sourced, uncertainty-bounded estimate that a county health
            department, food pantry network, or journalist can use to frame a question, not
            answer it. The methodology is public, the uncertainty is explicit, and the model
            will be updated when better data becomes available. We believe making the
            uncertainty visible is more useful than leaving a data vacuum.
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
            to="/data/snap-coverage-at-risk"
            className="text-sm text-primary hover:underline"
          >
            ← Back to SNAP Coverage at Risk
          </Link>
        </div>
      </div>
    </Layout>
  );
}
