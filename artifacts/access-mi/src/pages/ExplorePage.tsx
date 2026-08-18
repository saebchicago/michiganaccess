import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SUBJECTS, type SubjectId } from "@/config/routeTaxonomy";
import {
  getPageSearchIndex,
  matchesPageQuery,
  type PageSearchEntry,
} from "@/utils/pageSearchIndex";
import { cn } from "@/lib/utils";

/**
 * The library: every curated destination on the platform in one
 * searchable, subject-filterable index.
 *
 * Deliberately contains NO destination data of its own. The list is
 * `getPageSearchIndex()` (derived from the route manifest) filtered to
 * entries the taxonomy curates, so this page can never disagree with
 * the router, the prerender metadata, or the search palette. All counts
 * are computed from the same array at render time - never typed in.
 *
 * getPageSearchIndex() must only be called inside the component (never
 * at module scope): see the TDZ note in src/utils/pageSearchIndex.ts.
 */

const SUBJECT_CHIP_STYLES: Record<SubjectId, string> = {
  health: "bg-emerald-100 text-emerald-800",
  money: "bg-amber-100 text-amber-800",
  home: "bg-sky-100 text-sky-800",
  env: "bg-teal-100 text-teal-800",
  food: "bg-orange-100 text-orange-800",
  civic: "bg-indigo-100 text-indigo-800",
  follow: "bg-slate-200 text-slate-800",
  tools: "bg-blue-100 text-blue-800",
};

function subjectLabel(id: SubjectId): string {
  return SUBJECTS.find((s) => s.id === id)?.label ?? id;
}

function DestinationCard({ entry }: { entry: PageSearchEntry }) {
  const primarySubject = entry.subjects?.[0];
  return (
    <Link
      to={entry.href}
      className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        {primarySubject && (
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              SUBJECT_CHIP_STYLES[primarySubject],
            )}
          >
            {subjectLabel(primarySubject)}
          </span>
        )}
        {entry.featured && (
          <Badge variant="secondary" className="text-[10px]">
            Featured
          </Badge>
        )}
      </div>
      <h2 className="text-base font-semibold leading-snug text-foreground">
        {entry.label}
      </h2>
      {entry.description && (
        <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted-foreground">
          {entry.description}
        </p>
      )}
      <span className="mt-3 font-mono text-[11px] text-muted-foreground/60">
        {entry.href}
      </span>
    </Link>
  );
}

export default function ExplorePage() {
  usePageMeta({
    title: "Explore - Access Michigan",
    description:
      "Every destination on the platform in one searchable index: health, money, housing, environment, food, civic power, public spending, and analyst tools.",
    path: "/explore",
  });

  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">("all");

  // Derived inside render, never at module scope (TDZ note above).
  const library = useMemo(
    () => getPageSearchIndex().filter((e) => e.subjects?.length),
    [],
  );

  const subjectCounts = useMemo(() => {
    const counts = new Map<SubjectId, number>();
    for (const entry of library) {
      for (const id of entry.subjects ?? []) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return counts;
  }, [library]);

  const visible = useMemo(() => {
    return library.filter((entry) => {
      const inSubject =
        subject === "all" || (entry.subjects ?? []).includes(subject);
      const inQuery = !query.trim() || matchesPageQuery(entry, query) >= 0;
      return inSubject && inQuery;
    });
  }, [library, subject, query]);

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-5xl">
          <Breadcrumbs items={[{ label: "Explore" }]} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Everything on the platform, in one place.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              {library.length} destinations, grouped by subject, each with a
              plain-language line on what it answers. Search by what you want
              to know, not by which agency publishes it.
            </p>
            <div className="relative mt-6 max-w-xl">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: water, closures, candidates, SNAP, contracts"
                aria-label="Search the library"
                className="h-12 pl-9 pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl pb-14">
        <div
          className="sticky top-0 z-10 -mx-4 flex flex-wrap gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm"
          role="group"
          aria-label="Filter by subject"
        >
          <button
            type="button"
            onClick={() => setSubject("all")}
            aria-pressed={subject === "all"}
            className={cn(
              "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              subject === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            All
            <span className="text-[10px] tabular-nums opacity-70">
              {library.length}
            </span>
          </button>
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSubject(s.id)}
              aria-pressed={subject === s.id}
              className={cn(
                "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                subject === s.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted",
              )}
            >
              {s.label}
              <span className="text-[10px] tabular-nums opacity-70">
                {subjectCounts.get(s.id) ?? 0}
              </span>
            </button>
          ))}
        </div>

        <p className="py-4 text-sm text-muted-foreground" aria-live="polite">
          <strong className="text-foreground">{visible.length}</strong>{" "}
          {visible.length === 1 ? "destination" : "destinations"}
          {subject !== "all" && <> in {subjectLabel(subject)}</>}
          {query.trim() && <> matching your search</>}
        </p>

        {visible.length > 0 ? (
          <ul
            role="list"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((entry) => (
              <li key={entry.href}>
                <DestinationCard entry={entry} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Nothing matches that yet.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a broader word, or clear the subject filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubject("all");
              }}
              className="mt-4 inline-flex h-10 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
