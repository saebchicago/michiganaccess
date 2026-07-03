import { lazy, Suspense, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  AlertTriangle,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProvenanceDisclaimer } from "@/components/shared/ProvenanceDisclaimer";
import { DataProvenance } from "@/components/shared/DataProvenance";
import { useClosureWatch } from "@/hooks/useClosureWatch";
import type { ClosureEntry } from "@/data/closureWatchFallback";

const ClosureMap = lazy(() => import("@/components/closure/ClosureMap"));

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ClosureEntry["closureType"], string> = {
  "full-closure": "Full Closure",
  "service-line-elimination": "Service Line Eliminated",
  merger: "Merger / Transfer",
  conversion: "Conversion",
};

const TYPE_COLORS: Record<ClosureEntry["closureType"], string> = {
  "full-closure": "destructive",
  "service-line-elimination": "default",
  merger: "secondary",
  conversion: "outline",
};

// ── Helper ───────────────────────────────────────────────────────────────────

function getYear(isoDate: string): string {
  return isoDate.slice(0, 4);
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Stat card ────────────────────────────────────────────────────────────────

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
          <div className="mt-0.5 text-primary">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {value}
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              {label}
            </p>
            <div className="mt-1">{provenance}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Entry row ────────────────────────────────────────────────────────────────

function EntryRow({ entry }: { entry: ClosureEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-4 space-y-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground text-sm leading-snug">
            {entry.facilityName}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>
              {entry.city}, {entry.county} County
            </span>
            <span>·</span>
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formatDate(entry.closureDate)}</span>
          </div>
        </div>
        <Badge
          variant={
            TYPE_COLORS[entry.closureType] as
              | "destructive"
              | "default"
              | "secondary"
              | "outline"
          }
          className="text-[10px] shrink-0"
        >
          {TYPE_LABELS[entry.closureType]}
        </Badge>
      </div>

      {entry.serviceLineAffected && (
        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
          Affected: {entry.serviceLineAffected}
        </p>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        {entry.summary}
      </p>

      <div className="flex flex-wrap gap-3 pt-1">
        {entry.sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Source ${i + 1}: ${source.name}`}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
            {source.name}
          </a>
        ))}
      </div>
    </motion.div>
  );
}

// ── Methodology ──────────────────────────────────────────────────────────────

function MethodologySection() {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-lg border border-border bg-muted/30 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold text-foreground"
        aria-expanded={open}
      >
        <span>How we verify closures</span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {open && (
        <div className="mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Two-source rule.</strong> Every
            entry displayed on this page carries at least two independent source
            citations. Acceptable sources include: the Sheps Center Rural
            Hospital Closures Database, AHA Hospital Closure Tracker, MDHHS
            licensure actions, Becker's Hospital Review, Bridge Michigan,
            Crain's Detroit Business, Modern Healthcare, and Fierce Healthcare.
          </p>
          <p>
            <strong className="text-foreground">Neutrality.</strong> Entry copy
            describes what happened and cites sources. This tracker does not
            characterize closures as good or bad and does not use editorializing
            language.
          </p>
          <p>
            <strong className="text-foreground">Scope.</strong> Entries cover
            full hospital closures, service-line eliminations (including OB/L&D
            units, emergency departments, and inpatient acute care), system
            mergers and ownership transfers, and Rural Emergency Hospital (REH)
            conversions. FQHC site changes are included when verifiable with two
            named sources.
          </p>
          <p>
            <strong className="text-foreground">Pending entries.</strong>{" "}
            Candidates with only one confirmed source are held in a
            non-displayed research queue until a second independent source is
            located. Entries with a future projected date are displayed with the
            announcement date and a note that the closure has not yet occurred.
          </p>
          <p>
            <strong className="text-foreground">Data currency.</strong> The
            Sheps Center publishes its rural hospital closure database as an
            Excel download (not a machine-readable feed); this tracker is
            manually updated when Sheps, AHA, or major health news sources
            report a new Michigan closure.
          </p>
        </div>
      )}
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ClosureWatchPage() {
  usePageMeta({
    title: "Michigan Closure Watch",
    description:
      "Hospital, service line, and FQHC closures in Michigan since 2020, two-source verified.",
    path: "/closure-watch",
    jsonLd: {
      "@type": "WebPage",
      name: "Michigan Closure Watch - Access Michigan",
      url: "https://accessmi.org/closure-watch",
    },
  });

  const { data: entries = [], isLoading } = useClosureWatch();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterCounty, setFilterCounty] = useState<string>("all");

  // ── Derived data ──────────────────────────────────────────────────────────
  const verified = useMemo(
    () => entries.filter((e) => e.status === "verified"),
    [entries],
  );

  const obLost = useMemo(
    () =>
      verified.filter(
        (e) =>
          e.closureType === "service-line-elimination" &&
          e.serviceLineAffected?.toLowerCase().includes("obstetric"),
      ).length,
    [verified],
  );

  const countiesAffected = useMemo(
    () => new Set(verified.map((e) => e.county)).size,
    [verified],
  );

  const mostRecentAsOf = useMemo(() => {
    if (!verified.length) return "-";
    const latest = verified.reduce((a, b) => (a.asOf > b.asOf ? a : b));
    return formatDate(latest.asOf);
  }, [verified]);

  const years = useMemo(() => {
    const ys = [...new Set(verified.map((e) => getYear(e.closureDate)))]
      .sort()
      .reverse();
    return ys;
  }, [verified]);

  const counties = useMemo(() => {
    return [...new Set(verified.map((e) => e.county))].sort();
  }, [verified]);

  const filtered = useMemo(() => {
    return verified.filter((e) => {
      if (filterType !== "all" && e.closureType !== filterType) return false;
      if (filterYear !== "all" && getYear(e.closureDate) !== filterYear)
        return false;
      if (filterCounty !== "all" && e.county !== filterCounty) return false;
      return true;
    });
  }, [verified, filterType, filterYear, filterCounty]);

  const grouped = useMemo(() => {
    const map = new Map<string, ClosureEntry[]>();
    for (const entry of filtered) {
      const yr = getYear(entry.closureDate);
      if (!map.has(yr)) map.set(yr, []);
      map.get(yr)!.push(entry);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="container max-w-4xl py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Data & Insights", href: "/data-and-insights" },
            { label: "Closure Watch" },
          ]}
        />

        {/* Hero */}
        <section className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-2 text-xs uppercase tracking-wider border-primary/30 text-primary"
            >
              V2 · Civic Intelligence
            </Badge>
            <h1 className="text-3xl font-bold text-foreground">
              What's closing, and when it closed.
            </h1>
            <p className="text-muted-foreground mt-1">
              Hospitals, service lines, and FQHCs since 2020. Two sources per
              entry.
            </p>
          </motion.div>
          <ProvenanceDisclaimer />
        </section>

        {/* Stats */}
        <section>
          <h2 className="sr-only">Summary statistics</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Building2 className="h-5 w-5" />}
              value={isLoading ? "…" : verified.length}
              label="Verified entries since 2020"
              provenance={
                <DataProvenance
                  sourceName="Sheps Center · Becker's · Bridge MI"
                  sourceUrl="https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/"
                  asOfDate="April 2026"
                  cadence="Manual update"
                  dataKind="measured"
                  compact
                />
              }
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5" />}
              value={isLoading ? "…" : obLost}
              label="OB / Labor & Delivery units eliminated since 2020"
              provenance={
                <DataProvenance
                  sourceName="Sheps Center · Becker's Hospital Review"
                  sourceUrl="https://www.beckershospitalreview.com"
                  asOfDate="April 2026"
                  cadence="Manual update"
                  dataKind="measured"
                  compact
                />
              }
            />
            <StatCard
              icon={<MapPin className="h-5 w-5" />}
              value={isLoading ? "…" : countiesAffected}
              label="Michigan counties affected"
              provenance={
                <DataProvenance
                  sourceName="accessmi.org derived from entry data"
                  sourceUrl="https://accessmi.org/closure-watch"
                  asOfDate="April 2026"
                  cadence="With each new entry"
                  dataKind="measured"
                  compact
                />
              }
            />
            <StatCard
              icon={<Calendar className="h-5 w-5" />}
              value={isLoading ? "…" : mostRecentAsOf}
              label="Most recent verification"
              provenance={
                <DataProvenance
                  sourceName="accessmi.org Closure Watch"
                  sourceUrl="https://accessmi.org/closure-watch"
                  asOfDate="April 2026"
                  cadence="Manual update"
                  dataKind="measured"
                  compact
                />
              }
            />
          </div>
        </section>

        {/* Map */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Verified closures - Michigan map
          </h2>
          <Suspense
            fallback={
              <div className="flex h-[420px] items-center justify-center rounded-lg border border-border bg-muted/30">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            }
          >
            <ClosureMap entries={verified} height="420px" />
          </Suspense>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Click any marker for facility details and source citations. Legend:
            red = full closure, orange = service line eliminated, blue =
            merger/transfer, purple = conversion.
          </p>
        </section>

        {/* Filter bar */}
        <section
          aria-label="Filter closures"
          className="flex flex-wrap gap-2 items-center"
        >
          <span className="text-xs font-medium text-muted-foreground mr-1">
            Filter:
          </span>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by closure type"
          >
            <option value="all">All types</option>
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by year"
          >
            <option value="all">All years</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <select
            value={filterCounty}
            onChange={(e) => setFilterCounty(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by county"
          >
            <option value="all">All counties</option>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(filterType !== "all" ||
            filterYear !== "all" ||
            filterCounty !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setFilterType("all");
                setFilterYear("all");
                setFilterCounty("all");
              }}
            >
              Clear filters
            </Button>
          )}

          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {verified.length} entries
          </span>
        </section>

        {/* Year-grouped list */}
        <section aria-label="Closure entries" className="space-y-8">
          {grouped.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No entries match the current filters.
            </p>
          )}
          {grouped.map(([year, yearEntries]) => (
            <div key={year}>
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                {year}
                <Badge variant="outline" className="text-[10px]">
                  {yearEntries.length}
                </Badge>
              </h2>
              <div className="space-y-3">
                {yearEntries
                  .sort((a, b) => b.closureDate.localeCompare(a.closureDate))
                  .map((entry) => (
                    <EntryRow key={entry.id} entry={entry} />
                  ))}
              </div>
            </div>
          ))}
        </section>

        {/* Methodology */}
        <MethodologySection />

        {/* Page-level DataProvenance */}
        <DataProvenance
          sourceName="Sheps Center Rural Hospital Closures Database · Becker's Hospital Review · Bridge Michigan · Modern Healthcare"
          sourceUrl="https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/"
          asOfDate="April 2026"
          cadence="Manual update when sources report new Michigan closures"
          dataKind="measured"
        />
      </div>
    </Layout>
  );
}
