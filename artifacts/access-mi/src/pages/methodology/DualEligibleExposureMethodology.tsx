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
      "Initial methodology published. ACS B27010 5-year 2023 county shares (B27010_046E + B27010_062E) " +
      "applied to MACPAC 2022 / KFF 2024–2025 statewide range (335,000–405,000). Seven sources cited: " +
      "MACPAC Dec 2025 Data Book, KFF 2024/2025 state fact sheets, ACS B27010, Justice in Aging §71119 " +
      "analysis, CBO pub. 61570, KFF MSP/LIS provision analysis, MACPAC dual-eligible enrollment pathways.",
  },
];

export default function DualEligibleExposureMethodology() {
  usePageMeta({
    title: "Methodology: Dual-Eligible Exposure in Michigan | accessmi.org",
    description:
      "How accessmi.org maps county-level dual-eligible (Medicare + Medicaid) population distribution and explains P.L. 119-21 exemption status.",
    path: "/methodology/dual-eligible-exposure",
    jsonLd: {
      "@type": "TechArticle",
      "headline": "Methodology: Dual-Eligible Exposure in Michigan - County Distribution Map",
      "description":
        "How county-level Medicare + Medicaid dual-eligible population distribution is computed using ACS B27010 county shares and MACPAC/KFF statewide figures. Includes §71119 exemption explanation and MSP §71101 provision context.",
      "url": "https://accessmi.org/methodology/dual-eligible-exposure",
      "datePublished": "2026-04-09",
      "dateModified": "2026-04-09",
      "author": { "@type": "Organization", "name": "accessmi.org", "url": "https://accessmi.org" },
      "about": "Dual-eligible (Medicare + Medicaid) population distribution in Michigan under P.L. 119-21 context",
    },
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Data & Insights", href: "/data-and-insights" },
            { label: "Dual-Eligible Exposure", href: "/data/dual-eligible-exposure" },
            { label: "Methodology" },
          ]}
        />

        <header>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Methodology: Dual-Eligible Exposure in Michigan
          </h1>
          <p className="text-muted-foreground text-sm">
            How the county-level Medicare + Medicaid dual-eligible distribution is computed
            and why dual-eligible residents are exempt from P.L. 119-21 work requirements
          </p>
        </header>

        {/* ── Anchor callout ── */}
        <section className="rounded-lg border-2 border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20 px-6 py-5 space-y-3">
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-300">
            Dual-eligible residents are exempt from P.L. 119-21 work requirements. This map shows where they live.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This page describes how the county-level dual-eligible distribution is computed and
            documents the provision-by-provision analysis supporting the exemption finding.
            Dual-eligible individuals qualify for Medicaid through the aged (65+) or disabled
            pathway - not through the ACA expansion group to which P.L. 119-21 §71119 work
            requirements apply. The feature documents geographic concentration, not coverage-loss
            exposure.
          </p>
        </section>

        {/* ── Source list ───────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Sources</h2>
          <div className="space-y-3 text-sm">

            {/* Source a - MACPAC */}
            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                MACPAC Data Book December 2025 - Michigan Dual-Eligible Population
              </p>
              <p className="text-muted-foreground">
                MedPAC/MACPAC, December 2025.{" "}
                <a
                  href="https://www.macpac.gov/wp-content/uploads/2025/12/Dec25_MedPAC_MACPAC_DualsDataBook-WEB508-FINAL.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  macpac.gov - December 2025 Duals Data Book (PDF)
                </a>{" "}
                - Michigan dual-eligible population: 405,000 total (360,000 full-benefit;
                45,000 partial-benefit), CY 2022. This is the most recent administratively-derived
                figure published in a peer-reviewed government data book with a direct Michigan
                row. Used as the statewide range high endpoint. Accessed April 2026.
              </p>
            </div>

            {/* Source b - KFF */}
            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                KFF State Health Facts - Number of Dual-Eligible Individuals (2024 and 2025)
              </p>
              <p className="text-muted-foreground">
                Kaiser Family Foundation, 2024/2025.{" "}
                <a
                  href="https://www.kff.org/state-health-policy-data/state-indicator/number-of-dual-eligible-individuals/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  kff.org - Number of Dual-Eligible Individuals by State
                </a>{" "}
                - Michigan: 353,820 total (2024, March enrollment); 334,716 total (2025,
                January enrollment). The KFF 2024/2025 figures are lower than MACPAC 2022
                partly due to post-PHE Medicaid redetermination effects. Both figures are
                cited to establish the statewide range (DISPLAY_RANGE_LOW = 335,000 from
                KFF 2025; DISPLAY_RANGE_HIGH = 405,000 from MACPAC 2022). Accessed April 2026.
              </p>
            </div>

            {/* Source c - ACS B27010 */}
            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                ACS B27010 5-year 2023 - County-Level Simultaneous Medicare + Medicaid Coverage
              </p>
              <p className="text-muted-foreground">
                U.S. Census Bureau, American Community Survey 5-year 2023.{" "}
                <a
                  href="https://data.census.gov/table/ACSDT5Y2023.B27010"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  data.census.gov - ACS B27010 5-year 2023
                </a>{" "}
                - Variables: B27010_046E (ages 35–64: With two or more types of health insurance
                including Medicare and Medicaid/means-tested public coverage) and B27010_062E
                (ages 65+: same). Sum of both variables per county = county acsDualEstimate.
                ACS API:{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  /data/2023/acs/acs5?get=NAME,B27010_046E,B27010_062E&for=county:*&in=state:26
                </code>
                . All 83 Michigan counties returned clean values. Statewide ACS total: 216,635
                (denominator for county shares). Small-county ACS values (Keweenaw, Luce,
                Ontonagon, Schoolcraft) have high relative margins of error and should be treated
                as illustrative. Accessed April 2026.
              </p>
            </div>

            {/* Source d - Justice in Aging §71119 */}
            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                Justice in Aging - How P.L. 119-21 Impacts People Dually Eligible for Medicare and Medicaid
              </p>
              <p className="text-muted-foreground">
                Justice in Aging, 2025.{" "}
                <a
                  href="https://justiceinaging.org/how-h-r-1-impacts-people-dually-eligible-for-medicare-and-medicaid/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  justiceinaging.org - P.L. 119-21 impact on dual-eligible individuals
                </a>{" "}
                - Authoritative analysis of which P.L. 119-21 provisions apply to dual-eligible
                individuals. Key finding: "Work requirements only apply to adults ages 19–64
                enrolled in the Medicaid Expansion program. People dually eligible are not subject
                to work requirements." (§71119 scope). Also identifies retroactive coverage period
                reduction (3 months → 2 months for non-expansion, i.e., predominantly dual-eligible,
                population) and flags administrative disruption risk from §71107 redeterminations.
                Accessed April 2026.
              </p>
            </div>

            {/* Source e - CBO pub. 61570 */}
            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                CBO: Estimated Budgetary Effects of P.L. 119-21 (pub. 61570)
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
                - National baseline for all P.L. 119-21 Medicaid provisions. Dual-eligible
                individuals are not subject to work requirements but are affected by the
                MSP streamlining rule delay (§71101): CBO estimated the blocked rule would
                have added approximately 860,000 new MSP enrollees nationally. Accessed April 2026.
              </p>
            </div>

            {/* Source f - MSP §71101 */}
            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                KFF: Medicaid Changes in P.L. 119-21 Would Increase Costs for 1.3 Million
                Low-Income Medicare Beneficiaries (§71101 MSP streamlining rule delay)
              </p>
              <p className="text-muted-foreground">
                Kaiser Family Foundation, 2025.{" "}
                <a
                  href="https://www.kff.org/medicaid/medicaid-changes-in-house-reconciliation-bill-would-increase-costs-for-1-3-million-low-income-medicare-beneficiaries/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  kff.org - MSP/LIS changes affecting 1.3 million low-income Medicare beneficiaries
                </a>{" "}
                - P.L. 119-21 §71101 prohibits CMS from implementing the September 2023 Medicare
                Savings Program (MSP) streamlining final rule until October 1, 2034. The blocked
                rule would have automatically enrolled SSI recipients into MSPs. KFF estimates
                1.3 million current low-income Medicare beneficiaries nationwide face higher
                Medicare cost-sharing as a result.{" "}
                <strong>Michigan proportional estimate (derived, not published):</strong> Michigan
                has approximately 4% of the national dual-eligible population (405,000 / ~12M
                national). Applying 4% to the 860,000 national MSP enrollment gain blocked by CBO:
                approximately <strong>34,000 Michigan residents</strong> who would have been newly
                enrolled in MSP are not enrolled due to §71101. This is a proportional derivation
                from national figures - no Michigan-specific figure has been published by CMS,
                KFF, MACPAC, or MDHHS for this provision. It is disclosed here as a scoped,
                labeled estimate and does not appear on the data page. Accessed April 2026.
              </p>
            </div>

            {/* Source g - MACPAC enrollment pathways */}
            <div className="border-l-2 border-border pl-4">
              <p className="font-medium">
                MACPAC: Dual-Eligible Enrollment Pathways - Aged and Disabled Medicaid Eligibility
              </p>
              <p className="text-muted-foreground">
                MACPAC, December 2025 Data Book (Exhibit 27 and context chapters).{" "}
                <a
                  href="https://www.macpac.gov/wp-content/uploads/2025/12/Dec25_MedPAC_MACPAC_DualsDataBook-WEB508-FINAL.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  macpac.gov - December 2025 Duals Data Book
                </a>{" "}
                - Documents that dual-eligible individuals qualify for Medicaid through the aged
                (65+) pathway or through SSI/SSDI (disability). These pathways are distinct from
                the ACA Medicaid expansion group (adults ages 19–64 up to 138% FPL) that P.L.
                119-21 §71119 work requirements target. Of Michigan's 405,000 dual-eligibles:
                360,000 are full-benefit duals (predominantly aged/disabled) and 45,000 are
                partial-benefit duals (QMB, SLMB, QI - Medicare cost-sharing assistance only).
                Accessed April 2026.
              </p>
            </div>

          </div>
        </section>

        {/* ── Technical steps ───────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Technical steps</h2>

          <div className="space-y-3 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground">Plain language</h3>
            <p className="leading-relaxed">
              We combine three published sources - MACPAC's CY 2022 administrative count (405,000),
              KFF's 2024 enrollment count (353,820), and KFF's 2025 enrollment count (334,716) -
              into a statewide display range of approximately 335,000–405,000 Michigan dual-eligible
              residents. We then distribute that range to all 83 Michigan counties using each
              county's share of the ACS B27010 5-year 2023 statewide simultaneous Medicare +
              Medicaid survey estimate. The result is a geographic distribution of a protected
              population - not a projection of coverage loss.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">Technical steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">State-level input range</strong> - Display
                range endpoints: DISPLAY_RANGE_LOW = 335,000 (rounded from KFF 2025 figure of
                334,716); DISPLAY_RANGE_HIGH = 405,000 (MACPAC CY 2022). Both figures are
                administratively-derived enrollment counts cited directly to their sources.
                The range spans post-PHE redetermination variation (KFF 2025) to the most recent
                pre-redetermination administrative peak (MACPAC 2022).
              </li>
              <li>
                <strong className="text-foreground">County denominator</strong> - ACS B27010
                5-year 2023 variables B27010_046E (ages 35–64) and B27010_062E (ages 65+) are
                summed per county to produce each county's{" "}
                <code className="bg-muted px-1 rounded text-xs">acsDualEstimate</code>.
                Statewide ACS total: 216,635 (sum of all 83 county estimates). This is used
                as the denominator for county shares - not as the absolute enrollment total.
              </li>
              <li>
                <strong className="text-foreground">Allocation formula</strong> - Each county's
                range is computed as:{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  county_share = county_acsDualEstimate / 216,635
                </code>{" "}
                then{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  allocatedLow = Math.max(1, Math.round(335,000 × county_share))
                </code>{" "}
                and{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  allocatedHigh = Math.max(1, Math.round(405,000 × county_share))
                </code>
                . The{" "}
                <code className="bg-muted px-1 rounded text-xs">Math.max(1, ...)</code> floor
                prevents zero-display for very small counties (Keweenaw: ACS estimate = 50).
              </li>
              <li>
                <strong className="text-foreground">Exemption explanation</strong> - Dual-eligible
                individuals are enrolled in Medicaid through the aged (65+) or disabled pathway,
                not through ACA expansion. P.L. 119-21 §71119 work requirements apply exclusively
                to the ACA expansion group (adults ages 19–64 enrolled up to 138% FPL). Dual-eligible
                individuals are categorically exempt regardless of age, income, or employment status.
                The Justice in Aging analysis (source d above) is the primary authority cited for
                this determination.
              </li>
              <li>
                <strong className="text-foreground">MSP §71101 scoped exposure finding</strong> -
                While dual-eligible individuals are exempt from work requirements, P.L. 119-21
                §71101 delays the Medicare Savings Program (MSP) streamlining final rule until
                October 1, 2034. CBO estimates the blocked rule would have added 860,000 new MSP
                enrollees nationally. Michigan's proportional share (~4% of national dual-eligible
                population) implies approximately 34,000 Michigan residents who would have gained
                MSP enrollment are not enrolled due to this delay. This finding is documented on
                this methodology page only - it is a derived national-to-state estimate and does
                not appear as a figure on the data page, consistent with the editorial discipline
                applied to all V3 features.
              </li>
            </ol>
          </div>
        </section>

        {/* ── What this does not do ─────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What this does not do</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>
              Does not model §71101 (MSP streamlining rule delay) county-level impact.
              No Michigan-specific published source quantifies this by county; the ~34,000
              state figure is a proportional derivation from national CBO data.
            </li>
            <li>
              Does not distinguish full-benefit dual-eligible individuals from partial-benefit
              duals (QMB, SLMB, QI). Full-benefit duals (360,000 in MACPAC CY 2022) have
              Medicaid coverage for services; partial-benefit duals (45,000) receive only
              Medicare cost-sharing assistance.
            </li>
            <li>
              Does not separately capture dual-eligible individuals enrolled in Medicare
              Advantage Dual-Eligible Special Needs Plans (D-SNPs). D-SNP enrollment is a
              subset of full-benefit duals and is not separately identifiable in ACS B27010.
            </li>
            <li>
              ACS B27010 survey estimates capture simultaneous self-reported coverage, not the
              CMS administrative "dual-eligible" category. The ACS statewide total (216,635)
              is approximately 53% of the MACPAC administrative figure (405,000), reflecting
              ACS undercounting of low-income and Medicaid-enrolled populations. County shares,
              not absolute ACS values, drive the allocation.
            </li>
            <li>
              Small county ACS margins of error apply. For Keweenaw (50), Luce (186),
              Ontonagon (189), and Schoolcraft (198), ACS B27010 coefficients of variation
              are high (typically 30–60%). County-level allocations for these counties should
              be treated as illustrative only. Exact margins of error are available at{" "}
              <a
                href="https://data.census.gov/table/ACSDT5Y2023.B27010"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                data.census.gov table B27010
              </a>
              .
            </li>
            <li>
              Does not capture state-specific Michigan Medicaid waiver programs or
              MI Health Link enrollment arrangements that may expand or alter the practical
              dual-eligible definition for Michigan-specific policy analysis.
            </li>
          </ul>
        </section>

        {/* ── Why we publish ───────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why we publish this</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Michigan's dual-eligible population - residents enrolled in both Medicare and Medicaid
            simultaneously - is not evenly distributed across the state. Counties with high
            concentrations of dual-eligible individuals often face compounding resource questions:
            these residents disproportionately use long-term care services, HCBS programs, and
            nursing facility beds whose funding is under pressure from provider tax restrictions
            in P.L. 119-21 (§71115, §71117). No public source currently provides county-level
            estimates of Michigan's dual-eligible population distribution in a single accessible
            view. accessmi.org publishes this map as a planning input - a sourced, range-bounded
            distribution that a county health department, hospital administrator, or journalist
            can use to frame geographic questions. The exemption from work requirements is made
            explicit because misreading the coverage-at-risk maps to imply dual-eligible individuals
            face compounding work-requirement exposure would be incorrect. The methodology is
            public, the uncertainty is explicit, and the model will be updated when better data
            becomes available.
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
            to="/data/dual-eligible-exposure"
            className="text-sm text-primary hover:underline"
          >
            ← Back to Dual-Eligible Exposure
          </Link>
        </div>
      </div>
    </Layout>
  );
}
