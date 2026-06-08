import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, AlertTriangle, Users, Download } from "lucide-react";
import Layout from "@/components/layout/Layout";
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

type SortKey = "county" | "currentEnrollment" | "projectedLossLow" | "projectedLossHigh";
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
          <div className="mt-0.5 text-amber-600 dark:text-amber-400">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground leading-tight">{label}</p>
            {scope && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{scope}</p>
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
  return (
    <button
      onClick={() => onSort(col)}
      className={`flex items-center gap-1 text-left text-xs font-medium hover:text-primary transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
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
      "County-level modeled ranges of Michigan Medicaid enrollees in categories affected by P.L. 119-21 work requirement provisions. Not a point estimate. Exposure is not disenrollment.",
    path: "/data/medicaid-coverage-at-risk",
    jsonLd: {
      "@type": "Dataset",
      "name": "Michigan Medicaid Coverage at Risk - P.L. 119-21 County Projections",
      "description":
        "County-level modeled ranges of Michigan Medicaid enrollees in categories affected by P.L. 119-21 work requirement provisions. Urban Institute Michigan projection (171,000–355,000) allocated proportionally by ACS C27007 5-year 2023 county enrollment share.",
      "url": "https://accessmi.org/data/medicaid-coverage-at-risk",
      "creator": { "@type": "Organization", "name": "accessmi.org", "url": "https://accessmi.org" },
      "datePublished": "2026-04-09",
      "dateModified": "2026-04-09",
      "spatialCoverage": "Michigan",
      "temporalCoverage": "2023/2028",
      "keywords": ["Medicaid", "Michigan", "P.L. 119-21", "work requirements", "county projections"],
      "measurementTechnique":
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
    sourceName: "Urban Institute / CBO P.L. 119-21 Medicaid work requirements score",
    sourceUrl:
      "https://www.urban.org/research/publication/projected-reductions-medicaid-expansion-enrollment-under-obbbas-work",
    asOfDate: "March 2026",
    cadence: "Updated when Urban Institute, CBPP, or MLPP publish new Michigan estimates",
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
            <Badge variant="outline" className="mt-1 shrink-0">V2</Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Medicaid Coverage at Risk</h1>
              <p className="text-muted-foreground mt-1">
                Michigan county-level estimates of Medicaid enrollees in categories affected by
                P.L. 119-21 work requirement provisions (Urban Institute, March 2026). All figures
                are modeled ranges - not point estimates. Exposure is not disenrollment.
              </p>
            </div>
          </div>
          <ProvenanceDisclaimer />
        </section>

        {/* ── Exposure ≠ Disenrollment callout ── */}
        <section className="rounded-lg border-2 border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20 px-6 py-5 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-2">
              <h2 data-testid="medicaid-callout-heading" className="text-xl font-semibold text-amber-900 dark:text-amber-300">
                Exposure is not disenrollment
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These figures identify Michigan Medicaid enrollees who fall into categories that
                Urban Institute, CBO, and CBPP project may be affected by P.L. 119-21 work
                requirement provisions. Being in an affected category is not the same as losing
                coverage. Individual outcomes depend on state implementation decisions, work
                requirement compliance pathways, income and employment changes, and administrative
                factors. The ranges describe populations at elevated exposure - they do not predict
                who will or will not retain Medicaid enrollment.{" "}
                <Link to={METHODOLOGY_URL} className="underline hover:text-primary">
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
              label="Michigan adults in categories affected by P.L. 119-21 work requirement provisions (Urban Institute projection, 2028 horizon)"
              scope="Work requirement provisions only"
              provenance={
                <DataProvenance
                  sourceName="Urban Institute - P.L. 119-21 Medicaid work requirements"
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
              value={isLoading ? "…" : "83"}
              label="Michigan counties - complete statewide coverage (all 83)"
              scope="Statewide coverage"
              provenance={
                <DataProvenance
                  sourceName="U.S. Census Bureau county list"
                  sourceUrl="https://www.census.gov/library/reference/code-lists/ansi.html"
                  asOfDate="2026"
                  cadence="Static - 83 Michigan counties"
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
            <table data-testid="medicaid-county-table" className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3">
                    <SortButton
                      col="county"
                      label="County"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="text-right px-4 py-3">
                    <SortButton
                      col="currentEnrollment"
                      label="Current Medicaid enrollment"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground text-xs font-medium">
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
                  <th className="text-right px-4 py-3 text-muted-foreground text-xs font-medium">
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
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Loading…
                    </td>
                  </tr>
                ) : (
                  sorted.map((entry: MedicaidCoverageRangeEntry) => (
                    <tr key={entry.fips} className="hover:bg-muted/30 transition-colors">
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
                        {fmtN(entry.currentEnrollment)}
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
                    <DataProvenance
                      {...modeled_provenance_props}
                      compact
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Current enrollment: ACS 2023 5-year C27007 (means-tested public coverage,
                      county-level estimates). Projected loss range: Urban Institute Michigan
                      projection (171,000–355,000) × county ACS enrollment share.{" "}
                      <Link to={METHODOLOGY_URL} className="underline hover:text-primary">
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
        <section className="rounded-lg border border-border bg-muted/20 px-5 py-4 space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Related coverage-at-risk analyses</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <Link data-testid="medicaid-snap-crosslink" to="/data/snap-coverage-at-risk" className="text-primary hover:underline font-medium">
                SNAP Coverage at Risk
              </Link>
              {" "}- county-level exposure to P.L. 119-21 ABAWD provisions{" "}
              <Link to="/methodology/snap-coverage-at-risk" className="text-xs text-muted-foreground hover:underline">
                (methodology)
              </Link>
            </li>
          </ul>
        </section>

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
