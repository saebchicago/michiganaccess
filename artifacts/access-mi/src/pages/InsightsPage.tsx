import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, LineChart as LineChartIcon, Landmark } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import InsightOfWeek from "@/components/home/InsightOfWeek";
import DataStoriesSection from "@/components/stories/DataStoriesSection";
import MichiganTrends from "@/components/dashboard/MichiganTrends";
import { WEEKLY_INSIGHTS } from "@/data/insights";
import { DATA_STORIES } from "@/data/data-stories";
import { MICHIGAN_TRENDS } from "@/data/michigan-trends";

const EXPLORE_LINKS = [
  { label: "Health dashboard", href: "/health", icon: LineChartIcon },
  { label: "Housing dashboard", href: "/housing", icon: Landmark },
  { label: "Food security dashboard", href: "/food-security", icon: Landmark },
  { label: "Data & Insights hub", href: "/data-and-insights", icon: BookOpen },
  { label: "Methodology", href: "/methodology", icon: BookOpen },
];

/**
 * The narrative intelligence hub: every curated finding, data story, and
 * long-run trend in one place. Complements /data-and-insights (the data
 * catalog and dashboard portal) with the editorial layer - headline
 * findings first, every number sourced.
 */
export default function InsightsPage() {
  usePageMeta({
    title: "Insights - Michigan Findings, Stories & Trends",
    description:
      "Headline findings, data stories, and decade-long trends from Michigan public data. Every number carries a named source and a provenance label.",
    path: "/insights",
  });

  const trendCount = Object.keys(MICHIGAN_TRENDS).length;

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Insights" }]} />

      {/* Editorial masthead - one of the site's few large-type moments. */}
      <section className="border-b border-border/40 bg-muted/20">
        <div className="container max-w-4xl py-12 md:py-16 text-center space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            The intelligence layer
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight text-balance">
            What the data says about Michigan
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {WEEKLY_INSIGHTS.length} headline findings, {DATA_STORIES.length} data stories, and{" "}
            {trendCount} decade-long trends - drawn from public records, every number traced to a
            named source.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ProvenanceTag label="VERIFIED" />
            <ProvenanceTag label="MODELED" />
            <ProvenanceTag label="PROJECTED" />
            <Link
              to="/methodology"
              className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              How we label numbers
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <InsightOfWeek />

      <DataStoriesSection />

      <section className="py-10 border-t border-border/30">
        <div className="container max-w-5xl">
          <MichiganTrends />
        </div>
      </section>

      {/* Where to go deeper */}
      <section className="py-10 border-t border-border/30 bg-muted/20">
        <div className="container max-w-5xl space-y-4">
          <h2 className="text-lg font-bold text-foreground">Go deeper</h2>
          <div className="flex flex-wrap gap-2">
            {EXPLORE_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <link.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {link.label}
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
