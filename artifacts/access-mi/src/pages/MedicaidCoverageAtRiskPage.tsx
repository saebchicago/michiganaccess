import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, AlertTriangle, Users, Download } from "lucide-react";
import { COUNTIES_COVERED } from "@/config/platformConstants";
import Layout from "@/components/layout/Layout";
import KeepExploring from "@/components/shared/KeepExploring";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProvenanceDisclaimer } from "@/components/shared/ProvenanceDisclaimer";
import { DataProvenance } from "@/components/shared/DataProvenance";
import { useMedicaidCoverageAtRisk } from "@/hooks/useMedicaidCoverageAtRisk";
import { usePageMeta } from "@/hooks/usePageMeta";
import { exportMedicaidCoverageAtRiskCsv } from "@/lib/csv-export";
import type { MedicaidCoverageRangeEntry } from "@/data/medicaidCoverageAtRiskFallback";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey =
  | "county"
  | "acsAdultMedicaid"
  | "projectedLossLow"
  | "projectedLossHigh";
type SortDir = "asc" | "desc";

// ── Constants ─────────────────────────────────────────────────────────────────

const METHODOLOGY_URL = "/methodology/medicaid-coverage-at-risk";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtN(n: number | null | undefined): string {
  if (n == null) return "-";
  return n.toLocaleString();
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  scope,
  provenance,
  testId,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  scope?: string;
  provenance: React.ReactNode;
  testId?: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-amber-600 dark:text-amber-400">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {value}
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              {label}
            </p>
            {scope && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                {scope}
              </p>
            )}
            <div className="mt-1">{provenance}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Column header button ───────────────────────────────────────────────────────

function SortButton({
  col,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  col: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === col;
  // aria-sort lives on the wrapping <th> (the only element the ARIA spec
  // allows it on); the button is purely the click/label affordance.
  return (
    <button
      onClick={() => onSort(col)}
      className={`flex items-center gap-1 text-left text-xs font-medium hover:text-primary transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
    >
      {label}
      <ArrowUpDown className="h-3 w-3 shrink-0" />
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MedicaidCoverageAtRiskPage() {
  usePageMeta({
    title: "Medicaid Coverage at Risk | accessmi.org",
    description:
      "County-allocated modeled ranges of projected 2028 Medicaid expansion enrollment reduction in Michigan under P.L. 119-21 work requirements and six-month redeterminations. Not a point estimate.",
    path: "/data/medicaid-coverage-at-risk",
    jsonLd: {
      "@type": "Dataset",
      name: "Michigan Medicaid Coverage at Risk - P.L. 119-21 County Projections",
      description:
        "Urban Institute Michigan 2028 projection (171,000-355,000; work requirements and six-month redeterminations combined) allocated to counties by ACS 2024 5-year adults 19-64 with Medicaid/means-tested coverage (C27007_007E + C27007_017E). Method 2.0, corrected 2026-11-08.",
      url: "https://accessmi.org/data/medicaid-coverage-at-risk",
      creator: {
        "@type": "Organization",
        name: "accessmi.org",
        url: "https://accessmi.org",
      },
      datePublished: "2026-04-09",
      dateModified: "2026-11-08",
      spatialCoverage: "Michigan",
      temporalCoverage: "2020/2028",
      keywords: [
        "Medicaid",
        "Michigan",
        "P.L. 119-21",
        "work requirements",
        "county projections",
      ],
      measurementTechnique:
        "Proportional county allocation from Urban Institute Michigan statewide projection (March 2026)",
    },
  });

  const { data, isLoading } = useMedicaidCoverageAtRisk();

  const [sortKey, setSortKey] = useState<SortKey>("projectedLossHigh");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const entries = useMemo(() => data ?? [], [data]);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (sortKey === "county") {
        const cmp = a.county.localeCompare(b.county);
        return sortDir === "asc" ? cmp : -cmp;
      }
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [entries, sortKey, sortDir]);

  function handleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir(col === "county" ? "asc" : "desc");
    }
  }

  const modeled_provenance_props = {
    sourceName:
      "Urban Institute - work requirements + six-month redeterminations (Michigan, 2028)",
    sourceUrl:
      "https://www.urban.org/research/publication/projected-reductions-medicaid-expansion-enrollment-under-obbbas-work",
    asOfDate: "March 2026",
    cadence:
      "Updated when Urban Institute, CBPP, or MLPP publish new Michigan estimates",
    dataKind: "modeled" as const,
    methodologyUrl: METHODOLOGY_URL,
  };

  return (
    <Layout>
      <div className="container max-w-5xl py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Data & Insights", href: "/data-and-insights" },
            { label: "Medicaid Coverage at Risk" },
          ]}
        />

        {/* ── Hero ── */}
        <section>
          <div className="flex items-start gap-3 mb-3">
            <Badge variant="outline" className="mt-1 shrink-0">
              V2
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Who could lose Medicaid.
              </h1>
              <p className="text-muted-foreground mt-1">
                County-allocated 2028 range under P.L. 119-21 work requirements
                and six-month redeterminations. MODELED. Urban Institute, March
                2026.
              </p>
            </div>
          </div>
          <ProvenanceDisclaimer />
        </section>

        {/* ── Correction notice (method 2.0) ── */}
        <section
          data-testid="medicaid-correction-notice"
          className="rounded-lg border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground"
        >
          <p className="font-semibold text-foreground">Correction, November 8, 2026</p>
          <p className="mt-1 leading-relaxed">
            County ranges published April 9 to November 8, 2026 used the wrong
            Census cells (C27007_003E + C27007_012E, which are population
            totals, not Medicaid counts). They are now allocated by adults
            19-64 with Medicaid coverage. The statewide range did not change;
            county shares did. The scope label also now names both policies the
            Urban range covers. Discard earlier county figures and exports.{" "}
            <Link to={METHODOLOGY_URL} className="underline hover:text-primary">
              What changed →
            </Link>
          </p>
        </section>

        {/* ── Exposure ≠ Disenrollment callout ── */}
        <section className="rounded-lg border-2 border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20 px-6 py-5 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-2">
              <h2
                data-testid="medicaid-callout-heading"
                className="text-xl font-semibold text-amber-900 dark:text-amber-300"
              >
                Exposure is not disenrollment
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These are people in affected categories, per Urban Institute,
                CBO, and CBPP. Not a forecast of who loses coverage. Outcomes
                depend on state rules, compliance paths, income, and admin
                factors.{" "}
                <Link
                  to={METHODOLOGY_URL}
                  className="underline hover:text-primary"
                >
                  Full methodology →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── Stat cards ── */}
        <section>
          <h2 className="sr-only">Statewide projection</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              testId="medicaid-stat-urban"
              icon={<Users className="h-5 w-5" />}
              value={isLoading ? "…" : "171,000–355,000"}
              label="Projected reduction in Michigan Medicaid expansion enrollment in 2028, vs. Urban's no-change baseline (low/high = mitigation scenarios, not a confidence interval)"
              scope="Work requirements + six-month redeterminations combined"
              provenance={
                <DataProvenance
                  sourceName="Urban Institute - work requirements and six-month redeterminations"
                  sourceUrl="https://www.urban.org/research/publication/projected-reductions-medicaid-expansion-enrollment-under-obbbas-work"
                  asOfDate="March 2026"
                  cadence="Updated when Urban Institute publishes revised Michigan estimates"
                  dataKind="modeled"
                  methodologyUrl={METHODOLOGY_URL}
                  compact
                />
              }
            />
            <StatCard
              testId="medicaid-stat-kff"
              icon={<Users className="h-5 w-5" />}
              value={isLoading ? "…" : "$31.6 billion"}
              label="Michigan federal Medicaid spending reduction over 10 years under P.L. 119-21 (KFF, December 2025)"
              scope="All P.L. 119-21 Medicaid provisions"
              provenance={
                <DataProvenance
                  sourceName="KFF - Allocating CBO's Federal Medicaid Spending Reductions"
                  sourceUrl="https://www.kff.org/medicaid/allocating-cbos-estimates-of-federal-medicaid-spending-reductions-across-the-states-enacted-reconciliation-package/"
                  asOfDate="December 2025"
                  cadence="Updated as CBO revises national scoring"
                  dataKind="projected"
                  methodologyUrl={METHODOLOGY_URL}
                  compact
                />
              }
            />
            <StatCard
              testId="medicaid-stat-counties"
              icon={<Users className="h-5 w-5" />}
              value={isLoading ? "…" : String(COUNTIES_COVERED)}
              label="Statewide coverage. Every Michigan county."
              scope="Statewide coverage"
              provenance={
                <DataProvenance
                  sourceName="U.S. Census Bureau county list"
                  sourceUrl="https://www.census.gov/library/reference/code-lists/ansi.html"
                  asOfDate="2026"
                  cadence="Static - statewide"
                  dataKind="measured"
                  compact
                />
              }
            />
          </div>
        </section>

        {/* ── County table ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">County breakdown</h2>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground hidden sm:block">
                Modeled range - not a point estimate
              </p>
              <button
                data-testid="medicaid-csv-download"
                onClick={() => exportMedicaidCoverageAtRiskCsv(entries)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border border-border rounded px-2.5 py-1.5"
                title="Download county data as CSV"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-x-auto">
            <table
              data-testid="medicaid-county-table"
              className="w-full text-sm"
            >
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3" aria-sort={sortKey === "county" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}>
                    <SortButton
                      col="county"
                      label="County"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="text-right px-4 py-3" aria-sort={sortKey === "acsAdultMedicaid" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}>
                    <SortButton
                      col="acsAdultMedicaid"
                      label="Adults 19-64 with Medicaid (ACS, ±MOE)"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground text-xs font-medium" aria-sort={sortKey === "projectedLossLow" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}>
                    <div className="flex flex-col items-end gap-0.5">
                      <SortButton
                        col="projectedLossLow"
                        label="Projected loss low"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <span className="text-[9px] text-muted-foreground/70 font-normal">
                        modeled range - not a point estimate
                      </span>
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground text-xs font-medium" aria-sort={sortKey === "projectedLossHigh" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}>
                    <div className="flex flex-col items-end gap-0.5">
                      <SortButton
                        col="projectedLossHigh"
                        label="Projected loss high"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <span className="text-[9px] text-muted-foreground/70 font-normal">
                        modeled range - not a point estimate
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground text-sm"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : (
                  sorted.map((entry: MedicaidCoverageRangeEntry) => (
                    <tr
                      key={entry.fips}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium">
                        <Link
                          to={`/county/${entry.slug}`}
                          aria-label={`${entry.county} County data`}
                          className="hover:text-primary hover:underline"
                        >
                          {entry.county}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {fmtN(entry.acsAdultMedicaid)}
                        <span className="block text-[10px] text-muted-foreground/70">
                          ±{fmtN(entry.acsAdultMedicaidMoe)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-amber-700 dark:text-amber-400">
                        {fmtN(entry.projectedLossLow)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-amber-700 dark:text-amber-400">
                        {fmtN(entry.projectedLossHigh)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t border-border bg-muted/20">
                <tr>
                  <td colSpan={4} className="px-4 py-3">
                    <DataProvenance {...modeled_provenance_props} compact />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Allocation basis: ACS 2024 5-year C27007_007E +
                      C27007_017E, adults 19-64 with Medicaid/means-tested
                      coverage (survey proxy for Healthy Michigan Plan
                      enrollment; ±90% MOE). Projected range: Urban Institute
                      Michigan 2028 range (171,000-355,000, work requirements +
                      six-month redeterminations) × county share.{" "}
                      <Link
                        to={METHODOLOGY_URL}
                        className="underline hover:text-primary"
                      >
                        Full methodology →
                      </Link>
                    </p>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ── Related analyses ── */}
        <KeepExploring
          currentPath="/data/medicaid-coverage-at-risk"
          heading="Related coverage-at-risk analyses"
        />

        {/* ── Methodology link ── */}
        <div className="pt-2 border-t border-border flex items-center justify-between gap-4">
          <Link
            data-testid="medicaid-methodology-link"
            to={METHODOLOGY_URL}
            className="text-sm text-primary hover:underline"
          >
            Full methodology: sources, steps, limitations →
          </Link>
          <Link
            to="/data-and-insights"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Data & Insights
          </Link>
        </div>
      </div>
    </Layout>
  );
}
