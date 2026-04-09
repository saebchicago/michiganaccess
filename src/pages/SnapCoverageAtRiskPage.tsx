import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, AlertTriangle, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProvenanceDisclaimer } from "@/components/shared/ProvenanceDisclaimer";
import { DataProvenance } from "@/components/shared/DataProvenance";
import { useSnapCoverageAtRisk } from "@/hooks/useSnapCoverageAtRisk";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { SnapCoverageRangeEntry } from "@/data/snapCoverageAtRiskFallback";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = "county" | "currentSnapEnrollment" | "projectedAffectedLow" | "projectedAffectedHigh";
type SortDir = "asc" | "desc";

// ── Constants ─────────────────────────────────────────────────────────────────

// Statewide range from MLPP 74,000 × GAO uncertainty band (×0.60 / ×1.40)
const STATE_RANGE_LOW = 44_400;   // 74,000 × 0.60
const STATE_RANGE_HIGH = 103_600; // 74,000 × 1.40
const MLPP_STATE_ESTIMATE = 74_000;
const METHODOLOGY_URL = "/methodology/snap-coverage-at-risk";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtN(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  provenance,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  provenance: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-amber-600 dark:text-amber-400">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground leading-tight">{label}</p>
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

export default function SnapCoverageAtRiskPage() {
  usePageMeta({
    title: "SNAP Coverage at Risk | accessmi.org",
    description:
      "County-level modeled ranges of Michigan SNAP participants in categories affected by P.L. 119-21 work requirement provisions. Not a point estimate. Exposure does not equal loss.",
  });

  const { data, isLoading } = useSnapCoverageAtRisk();

  const [sortKey, setSortKey] = useState<SortKey>("projectedAffectedHigh");
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
    sourceName: "MLPP/CBO P.L. 119-21 SNAP score",
    sourceUrl: "https://mlpp.org/the-cost-of-the-federal-megabill-food-assistance/",
    asOfDate: "April 2026",
    cadence: "Updated when source estimates change",
    dataKind: "modeled" as const,
    methodologyUrl: METHODOLOGY_URL,
  };

  return (
    <Layout>
      <div className="container max-w-5xl py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Data & Insights", href: "/data-and-insights" },
            { label: "SNAP in Michigan", href: "/data/snap-michigan" },
            { label: "Coverage at Risk" },
          ]}
        />

        {/* ── Hero ── */}
        <section>
          <div className="flex items-start gap-3 mb-3">
            <Badge variant="outline" className="mt-1 shrink-0">V3</Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">SNAP Coverage at Risk</h1>
              <p className="text-muted-foreground mt-1">
                Michigan county-level estimates of SNAP participants in categories affected by
                P.L. 119-21 work requirement provisions. All figures are modeled ranges —
                not point estimates. Exposure does not equal loss.
              </p>
            </div>
          </div>
          <ProvenanceDisclaimer />
        </section>

        {/* ── Exposure ≠ Loss callout ── */}
        <section className="rounded-lg border-2 border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20 px-6 py-5 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-300">
                Exposure does not equal loss
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These figures identify Michigan SNAP participants who fall into categories
                that CBO, MLPP, and CBPP project may be affected by P.L. 119-21.
                Individual outcomes depend on state implementation, work requirement compliance
                pathways, employment status, and administrative factors. The ranges describe
                populations at elevated exposure — they do not predict who will or will not
                retain SNAP enrollment.{" "}
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
              icon={<Users className="h-5 w-5" />}
              value={isLoading ? "…" : fmtN(MLPP_STATE_ESTIMATE)}
              label="Michigan adults in affected ABAWD categories (MLPP state estimate)"
              provenance={
                <DataProvenance
                  sourceName="MLPP — Federal Megabill Food Assistance"
                  sourceUrl="https://mlpp.org/the-cost-of-the-federal-megabill-food-assistance/"
                  asOfDate="November 2025"
                  cadence="Updated as legislation develops"
                  dataKind="modeled"
                  methodologyUrl={METHODOLOGY_URL}
                  compact
                />
              }
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              value={isLoading ? "…" : fmtN(STATE_RANGE_LOW) + "–" + fmtN(STATE_RANGE_HIGH)}
              label="Statewide modeled range (±40% GAO uncertainty band) — not a point estimate"
              provenance={
                <DataProvenance
                  {...modeled_provenance_props}
                  compact
                />
              }
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              value={isLoading ? "…" : "83"}
              label="Michigan counties with county-allocated modeled range"
              provenance={
                <DataProvenance
                  sourceName="County allocation from USDA FNS FY2022 enrollment share"
                  sourceUrl="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap"
                  asOfDate="FY2022"
                  cadence="Refreshed when FNS county data updates"
                  dataKind="modeled"
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
            <p className="text-xs text-muted-foreground">
              Modeled range — not a point estimate
            </p>
          </div>

          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm">
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
                      col="currentSnapEnrollment"
                      label="Current SNAP enrollment"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground text-xs font-medium">
                    <div className="flex flex-col items-end gap-0.5">
                      <SortButton
                        col="projectedAffectedLow"
                        label="At-risk low"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <span className="text-[9px] text-muted-foreground/70 font-normal">
                        modeled range — not a point estimate
                      </span>
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground text-xs font-medium">
                    <div className="flex flex-col items-end gap-0.5">
                      <SortButton
                        col="projectedAffectedHigh"
                        label="At-risk high"
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <span className="text-[9px] text-muted-foreground/70 font-normal">
                        modeled range — not a point estimate
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
                  sorted.map((entry: SnapCoverageRangeEntry) => (
                    <tr key={entry.fips} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium">
                        <Link
                          to={`/county/${entry.county.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "")}`}
                          className="hover:text-primary hover:underline"
                        >
                          {entry.county}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {fmtN(entry.currentSnapEnrollment)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-amber-700 dark:text-amber-400">
                        {fmtN(entry.projectedAffectedLow)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-amber-700 dark:text-amber-400">
                        {fmtN(entry.projectedAffectedHigh)}
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
                      County enrollment: USDA FNS FY2022 (annual average monthly participants).
                      At-risk range: MLPP 74,000 × county enrollment share, ±40% GAO-19-56
                      uncertainty band. Low = midpoint × 0.60, High = midpoint × 1.40.
                    </p>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ── Methodology link ── */}
        <div className="pt-2 border-t border-border flex items-center justify-between gap-4">
          <Link
            to={METHODOLOGY_URL}
            className="text-sm text-primary hover:underline"
          >
            Full methodology: sources, steps, limitations →
          </Link>
          <Link
            to="/data/snap-michigan"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← SNAP in Michigan
          </Link>
        </div>
      </div>
    </Layout>
  );
}
