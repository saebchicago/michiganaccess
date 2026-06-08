import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, AlertTriangle, Users, MapPin, Activity, Download } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProvenanceDisclaimer } from "@/components/shared/ProvenanceDisclaimer";
import { DataProvenance } from "@/components/shared/DataProvenance";
import { useDualEligibleExposure } from "@/hooks/useDualEligibleExposure";
import { usePageMeta } from "@/hooks/usePageMeta";
import { exportDualEligibleExposureCsv } from "@/lib/csv-export";
import type { DualEligibleCountyEntry } from "@/data/dualEligibleExposureFallback";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = "county" | "acsDualEstimate" | "allocatedLow" | "allocatedHigh";
type SortDir = "asc" | "desc";

// ── Constants ─────────────────────────────────────────────────────────────────

const METHODOLOGY_URL = "/methodology/dual-eligible-exposure";

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

export default function DualEligibleExposurePage() {
  usePageMeta({
    title: "Dual-Eligible Exposure in Michigan | accessmi.org",
    description:
      "County-level view of Michiganders enrolled in both Medicare and Medicaid. Dual-eligibles are exempt from P.L. 119-21 work requirements. This map shows where they live.",
    path: "/data/dual-eligible-exposure",
    jsonLd: {
      "@type": "Dataset",
      "name": "Michigan Dual-Eligible Exposure Map - Medicare + Medicaid County Distribution",
      "description":
        "County-level view of Michigan residents enrolled in both Medicare and Medicaid simultaneously. ACS B27010 county shares applied to MACPAC 2022 / KFF 2024–2025 statewide range (335,000–405,000). Dual-eligible residents are exempt from P.L. 119-21 work requirements.",
      "url": "https://accessmi.org/data/dual-eligible-exposure",
      "creator": { "@type": "Organization", "name": "accessmi.org", "url": "https://accessmi.org" },
      "datePublished": "2026-04-09",
      "dateModified": "2026-04-09",
      "spatialCoverage": "Michigan",
      "temporalCoverage": "2023",
      "keywords": ["dual-eligible", "Medicare", "Medicaid", "Michigan", "P.L. 119-21", "§71119", "county map"],
      "measurementTechnique":
        "Proportional county allocation from MACPAC/KFF statewide range using ACS B27010 5-year 2023 county shares",
    },
  });

  const { data, isLoading } = useDualEligibleExposure();

  const [sortKey, setSortKey] = useState<SortKey>("allocatedHigh");
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

  // Median county ACS dual estimate: 875 (Hillsdale - 42nd of 83 when sorted by value)
  const medianAcsDualEstimate = useMemo(() => {
    if (!entries.length) return 0;
    const sorted_by_acs = [...entries].map((e) => e.acsDualEstimate).sort((a, b) => a - b);
    return sorted_by_acs[Math.floor(sorted_by_acs.length / 2)];
  }, [entries]);

  return (
    <Layout>
      <div className="container max-w-5xl py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Data & Insights", href: "/data-and-insights" },
            { label: "Dual-Eligible Exposure" },
          ]}
        />

        {/* ── Hero ── */}
        <section>
          <div className="flex items-start gap-3 mb-3">
            <Badge variant="outline" className="mt-1 shrink-0">V3</Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dual-Eligible Exposure in Michigan</h1>
              <p className="text-muted-foreground mt-1">
                County-level view of Michiganders enrolled in both Medicare and Medicaid.{" "}
                Dual-eligible residents are exempt from P.L. 119-21 work requirements. This map shows where they live.
              </p>
            </div>
          </div>
          <ProvenanceDisclaimer />
        </section>

        {/* ── Anchor callout ── */}
        <section className="rounded-lg border-2 border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20 px-6 py-5 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-2">
              <h2 data-testid="dual-callout-heading" className="text-xl font-semibold text-amber-900 dark:text-amber-300">
                Dual-eligible residents are exempt from P.L. 119-21 work requirements. This map shows where they live.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dual-eligible individuals enroll in Medicaid through the aged (65+) or disabled
                pathway - not through ACA expansion. P.L. 119-21 §71119 work requirements apply
                exclusively to expansion enrollees ages 19–64. Michigan's approximately 335,000–405,000
                dual-eligible residents are categorically exempt from these provisions. This feature
                shows the geographic distribution of this protected population, providing context for
                the county-level Medicaid and SNAP coverage-at-risk maps.{" "}
                <Link to={METHODOLOGY_URL} className="underline hover:text-primary">
                  Full methodology →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ── Stat cards ── */}
        <section>
          <h2 className="sr-only">Statewide dual-eligible population</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              testId="dual-stat-macpac"
              icon={<Users className="h-5 w-5" />}
              value={isLoading ? "…" : "~335,000–405,000"}
              label="Michigan dual-eligible residents enrolled in both Medicare and Medicaid (range from MACPAC 2022, KFF 2024/2025)"
              scope="Statewide totals across multiple sources and years"
              provenance={
                <DataProvenance
                  sourceName="MACPAC Data Book December 2025"
                  sourceUrl="https://www.macpac.gov/wp-content/uploads/2025/12/Dec25_MedPAC_MACPAC_DualsDataBook-WEB508-FINAL.pdf"
                  asOfDate="CY 2022 (MACPAC) / 2024–2025 (KFF)"
                  cadence="Updated when MACPAC or KFF publish revised Michigan figures"
                  dataKind="measured"
                  methodologyUrl={METHODOLOGY_URL}
                  compact
                />
              }
            />
            <StatCard
              testId="dual-stat-counties"
              icon={<MapPin className="h-5 w-5" />}
              value={isLoading ? "…" : "83"}
              label="Michigan counties with dual-eligible data (ACS B27010 5-year 2023)"
              scope="Complete statewide coverage"
              provenance={
                <DataProvenance
                  sourceName="U.S. Census Bureau ACS B27010 5-year 2023"
                  sourceUrl="https://data.census.gov/table/ACSDT5Y2023.B27010"
                  asOfDate="2023"
                  cadence="Updated with each ACS 5-year release"
                  dataKind="measured"
                  compact
                />
              }
            />
            <StatCard
              testId="dual-stat-median"
              icon={<Activity className="h-5 w-5" />}
              value={isLoading ? "…" : `~${fmtN(medianAcsDualEstimate)}`}
              label="Median Michigan county dual-eligible population (ACS)"
              scope="Half of Michigan counties have more, half have fewer"
              provenance={
                <DataProvenance
                  sourceName="U.S. Census Bureau ACS B27010 5-year 2023"
                  sourceUrl="https://data.census.gov/table/ACSDT5Y2023.B27010"
                  asOfDate="2023"
                  cadence="Updated with each ACS 5-year release"
                  dataKind="measured"
                  methodologyUrl={METHODOLOGY_URL}
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
                Proportional allocation from state range
              </p>
              <button
                data-testid="dual-csv-download"
                onClick={() => exportDualEligibleExposureCsv(entries)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border border-border rounded px-2.5 py-1.5"
                title="Download county data as CSV"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-x-auto">
            <table data-testid="dual-county-table" className="w-full text-sm">
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
                      col="acsDualEstimate"
                      label="ACS dual-eligible count"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground text-xs font-medium">
                    <div className="flex flex-col items-end gap-0.5">
                      <SortButton
                        col="allocatedLow"
                        label="Allocated low"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <span className="text-[9px] text-muted-foreground/70 font-normal">
                        Proportional allocation from state range
                      </span>
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground text-xs font-medium">
                    <div className="flex flex-col items-end gap-0.5">
                      <SortButton
                        col="allocatedHigh"
                        label="Allocated high"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <span className="text-[9px] text-muted-foreground/70 font-normal">
                        Proportional allocation from state range
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
                  sorted.map((entry: DualEligibleCountyEntry) => (
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
                        {fmtN(entry.acsDualEstimate)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-amber-700 dark:text-amber-400">
                        {fmtN(entry.allocatedLow)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-amber-700 dark:text-amber-400">
                        {fmtN(entry.allocatedHigh)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t border-border bg-muted/20">
                <tr>
                  <td colSpan={4} className="px-4 py-3">
                    <DataProvenance
                      sourceName="ACS B27010 5-year 2023 × MACPAC/KFF statewide range (335,000–405,000)"
                      sourceUrl="https://data.census.gov/table/ACSDT5Y2023.B27010"
                      asOfDate="2023"
                      cadence="Updated when MACPAC or KFF publish revised Michigan figures"
                      dataKind="measured"
                      methodologyUrl={METHODOLOGY_URL}
                      compact
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      ACS dual-eligible count: B27010_046E (ages 35–64) + B27010_062E (ages 65+) per county.
                      Allocated low/high: county ACS share × statewide range endpoints (335,000 / 405,000).
                      ACS statewide total used as denominator: 216,635.{" "}
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
              <Link data-testid="dual-snap-crosslink" to="/data/snap-coverage-at-risk" className="text-primary hover:underline font-medium">
                SNAP Coverage at Risk
              </Link>
              {" "}- county-level exposure to P.L. 119-21 ABAWD provisions{" "}
              <Link to="/methodology/snap-coverage-at-risk" className="text-xs text-muted-foreground hover:underline">
                (methodology)
              </Link>
            </li>
            <li>
              <Link data-testid="dual-medicaid-crosslink" to="/data/medicaid-coverage-at-risk" className="text-primary hover:underline font-medium">
                Medicaid Coverage at Risk
              </Link>
              {" "}- county-level exposure to P.L. 119-21 work requirement provisions{" "}
              <Link to="/methodology/medicaid-coverage-at-risk" className="text-xs text-muted-foreground hover:underline">
                (methodology)
              </Link>
            </li>
          </ul>
        </section>

        {/* ── Methodology link ── */}
        <div className="pt-2 border-t border-border flex items-center justify-between gap-4">
          <Link
            data-testid="dual-methodology-link"
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
