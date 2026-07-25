import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  FileSearch,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  OPEN_DATA_GAPS,
  summarizeGaps,
  GAP_LANE_LABELS,
  GAP_STATUS_LABELS,
  type GapLane,
} from "@/data/openDataGaps";
import trendSeries from "@/data/trendSeries.json";

/**
 * "Open Data in Michigan" - the platform's public map of what government
 * publishes and what it doesn't, in two honest lanes (see openDataGaps.ts
 * for the tone rules, which are test-enforced).
 */

const LANE_FILTERS: { key: GapLane | "all"; label: string }[] = [
  { key: "all", label: "All gaps" },
  { key: "not-published", label: GAP_LANE_LABELS["not-published"] },
  { key: "not-yet-ingested", label: GAP_LANE_LABELS["not-yet-ingested"] },
];

interface ExcludedMetric {
  metric: string;
  reason: string;
}

export default function OpenDataGapsPage() {
  usePageMeta({
    title: "Open Data Gaps - Access Michigan",
    description:
      "What Michigan public data exists, what doesn't, who holds it, and how residents can help close the gaps - documented neutrally, with a citation for every gap claim.",
    path: "/data-gaps",
  });

  const [lane, setLane] = useState<GapLane | "all">("all");
  const summary = summarizeGaps();

  const visible = useMemo(
    () =>
      lane === "all"
        ? OPEN_DATA_GAPS
        : OPEN_DATA_GAPS.filter((g) => g.lane === lane),
    [lane],
  );

  const domains = useMemo(
    () => [...new Set(visible.map((g) => g.domain))],
    [visible],
  );

  const excludedTrends = (trendSeries.provenance?.excludedMetrics ??
    []) as ExcludedMetric[];

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Open Data Gaps" }]} />

      <section className="bg-gradient-to-b from-michigan-blue/5 to-background py-12">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-2 mb-3">
            <Landmark
              className="h-5 w-5 text-michigan-blue"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-michigan-blue uppercase tracking-wider">
              Open Data in Michigan
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            The data that isn't there - documented
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            This platform is built entirely on public data. That makes it a map
            of what government publishes - and, just as precisely, of what it
            doesn't. Below is every gap we know about: what exists, what's
            missing, who holds it, the stated reason, and a constructive next
            step. Documenting gaps is how they close.
          </p>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
            Two things this page is not: it is not a criticism of any agency -
            several gaps below are privacy protections working as intended, and
            others reflect funding and staffing realities. And it is not only
            about government: gaps in the second lane are ours, where data is
            published but not yet on this platform.
          </p>
        </div>
      </section>

      <section className="container max-w-4xl py-8 space-y-8">
        {/* Summary tiles - derived from the registry, never retyped */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: summary.total, label: "Documented gaps" },
            { value: summary.notPublished, label: "Not published" },
            { value: summary.notYetIngested, label: "On our roadmap" },
            { value: summary.suppressed, label: "Privacy suppressions" },
          ].map((t) => (
            <Card key={t.label}>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {t.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lane filter */}
        <div
          role="group"
          aria-label="Filter gaps by lane"
          className="flex flex-wrap gap-2"
        >
          {LANE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setLane(f.key)}
              aria-pressed={lane === f.key}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                lane === f.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Gap cards by domain */}
        {domains.map((domain) => (
          <div key={domain} className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">{domain}</h2>
            {visible
              .filter((g) => g.domain === domain)
              .map((gap) => {
                const isOurs = gap.lane === "not-yet-ingested";
                const Icon = isOurs ? FileSearch : Landmark;
                return (
                  <Card key={gap.id} id={gap.id} className="scroll-mt-24">
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Icon
                          className="h-4 w-4 text-michigan-blue shrink-0"
                          aria-hidden="true"
                        />
                        <CardTitle className="text-base">{gap.title}</CardTitle>
                        <Badge variant="outline" className="text-[10px]">
                          {GAP_LANE_LABELS[gap.lane]}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {GAP_STATUS_LABELS[gap.status]}
                        </Badge>
                        {gap.since && (
                          <Badge variant="outline" className="text-[10px]">
                            {gap.since}
                          </Badge>
                        )}
                        {gap.coverage && (
                          <Badge variant="outline" className="text-[10px]">
                            {gap.coverage}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-foreground/90">
                        <span className="font-semibold">What exists:</span>{" "}
                        {gap.whatExists}
                      </p>
                      <p className="text-foreground/90">
                        <span className="font-semibold">What's missing:</span>{" "}
                        {gap.whatIsMissing}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground/80">
                          Holds the data:
                        </span>{" "}
                        {gap.holder}
                      </p>
                      {gap.statedReason && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-foreground/80">
                            Stated reason:
                          </span>{" "}
                          {gap.statedReason}
                        </p>
                      )}
                      {gap.noStatedReason && (
                        <p className="text-muted-foreground italic">
                          No published reason - the data has simply never been
                          released.
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground/80">
                          Why it matters:
                        </span>{" "}
                        {gap.whyItMatters}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Gap citation:{" "}
                        {gap.gapSource.url ? (
                          gap.gapSource.url.startsWith("/") ? (
                            <Link
                              to={gap.gapSource.url}
                              className="underline hover:text-primary"
                            >
                              {gap.gapSource.name}
                            </Link>
                          ) : (
                            <a
                              href={gap.gapSource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-primary"
                            >
                              {gap.gapSource.name}
                              <ExternalLink
                                className="inline h-2.5 w-2.5 ml-0.5"
                                aria-hidden="true"
                              />
                            </a>
                          )
                        ) : (
                          gap.gapSource.name
                        )}
                      </p>
                      {gap.action && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="mt-1 text-xs gap-1.5"
                        >
                          <Link to={gap.action.href}>
                            {gap.action.label}
                            <ArrowRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        ))}

        {/* Trends the platform declines to fake */}
        {excludedTrends.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="h-4 w-4 text-michigan-forest-deep"
                  aria-hidden="true"
                />
                <CardTitle className="text-base">
                  Trend lines this platform declines to draw
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Some series exist but cannot honestly be shown as trends. Each
                exclusion below is recorded in the trend dataset's own
                provenance block:
              </p>
              <ul role="list" className="space-y-1.5">
                {excludedTrends.map((e) => (
                  <li key={e.metric} className="text-muted-foreground">
                    <span className="font-semibold text-foreground/80">
                      {e.metric}:
                    </span>{" "}
                    {e.reason}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* How gaps close */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">How gaps close</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground/80">
                Ask for records.
              </span>{" "}
              Michigan FOIA gives every resident the right to request public
              records from any public body, with a 5-business-day response
              deadline. Our{" "}
              <Link to="/foia" className="text-primary underline">
                FOIA Request Builder
              </Link>{" "}
              writes a statute-cited letter in your browser - nothing is stored
              or transmitted.
            </p>
            <p>
              <span className="font-semibold text-foreground/80">
                Ask in public comment.
              </span>{" "}
              Agencies revise what they publish in response to documented
              demand. Citing a specific missing table, politely, in a public
              comment period is more effective than a general complaint.
            </p>
            <p>
              <span className="font-semibold text-foreground/80">
                Hold us to the same standard.
              </span>{" "}
              The second lane above is our own backlog - data that is published
              and not yet here. If one of those matters to you,{" "}
              <Link to="/feedback" className="text-primary underline">
                tell us
              </Link>{" "}
              and we will prioritize it.
            </p>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
