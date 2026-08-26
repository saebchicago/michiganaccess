import { Suspense, lazy, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPinned } from "lucide-react";
import { WEEKLY_INSIGHTS } from "@/data/insights";
import { DATA_STORIES } from "@/data/data-stories";
import { MICHIGAN_TRENDS } from "@/data/michigan-trends";

const TrendChart = lazy(() =>
  import("@/components/charts/TrendChart").then((m) => ({
    default: m.TrendChart,
  })),
);
import { classify } from "@/lib/trend";
import { EDITORIAL as C } from "@/components/home/editorialTheme";

function getCurrentWeekIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.floor(
    ((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7,
  );
  return weekNum % WEEKLY_INSIGHTS.length;
}

const FEATURED_TREND = MICHIGAN_TRENDS.uninsuredRate;

/**
 * The intelligence briefing: the homepage's first editorial findings use the
 * same curated, sourced data modules as /insights. The Atlas CTA is kept here,
 * inside the existing editorial hierarchy, instead of adding another stacked
 * homepage announcement rail.
 */
export default function IntelligenceBriefing() {
  const [activeView, setActiveView] = useState<"finding" | "trend">("finding");
  const insight = WEEKLY_INSIGHTS[getCurrentWeekIndex()];
  const stories = DATA_STORIES.slice(0, 3);
  const trendPoints = FEATURED_TREND.data.map((p) => ({
    vintage: p.year,
    value: p.value,
  }));
  const trendClassification = classify(trendPoints, "down_is_better");
  const latestTrend = FEATURED_TREND.data[FEATURED_TREND.data.length - 1];

  return (
    <section
      className="container mx-auto max-w-6xl px-4 pb-14"
      aria-labelledby="briefing-heading"
    >
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="briefing-heading"
          className="font-serif text-2xl md:text-3xl"
          style={{ color: C.emerald }}
        >
          What the data says.
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/opportunity"
            className="inline-flex min-h-[44px] items-center gap-1.5 px-3 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: C.emerald, color: C.cream }}
          >
            <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
            Explore your community
          </Link>
          <Link
            to="/insights"
            className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-[11px] uppercase font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: C.goldInk, letterSpacing: "0.18em" }}
          >
            Read all insights
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div
        className="mb-6 inline-flex rounded-sm border p-1"
        role="tablist"
        aria-label="Data briefing views"
        style={{ borderColor: `${C.emerald}33` }}
      >
        {(
          [
            ["finding", "This week's finding"],
            ["trend", "The long view"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            id={`briefing-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={activeView === id}
            aria-controls={`briefing-panel-${id}`}
            tabIndex={activeView === id ? 0 : -1}
            onClick={() => setActiveView(id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                const next = id === "finding" ? "trend" : "finding";
                setActiveView(next);
                requestAnimationFrame(() =>
                  document.getElementById(`briefing-tab-${next}`)?.focus(),
                );
              }
            }}
            className="min-h-[44px] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: activeView === id ? C.emerald : "transparent",
              color: activeView === id ? C.cream : C.emerald,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
          id="briefing-panel-finding"
          role="tabpanel"
          aria-labelledby="briefing-tab-finding"
          hidden={activeView !== "finding"}
          className="max-w-3xl border-l pl-6 py-2"
          style={{ borderColor: `${C.emerald}33` }}
        >
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: C.emeraldMid }}
          >
            This week's finding
          </p>
          <blockquote
            className="font-serif text-xl md:text-2xl leading-snug mb-4"
            style={{ color: C.emerald }}
          >
            {insight.text}
          </blockquote>
          {insight.dataPoints && insight.dataPoints.length > 0 && (
            <dl className="flex flex-wrap gap-x-8 gap-y-3 mb-4">
              {insight.dataPoints.map((dp) => (
                <div key={dp.label}>
                  <dd
                    className="font-serif text-2xl leading-none tabular-nums"
                    style={{ color: C.emerald }}
                  >
                    {dp.value}
                  </dd>
                  <dt
                    className="mt-1 text-xs"
                    style={{ color: `${C.emerald}CC` }}
                  >
                    {dp.label}{" "}
                    <span style={{ color: `${C.emerald}CC` }}>
                      ({dp.context})
                    </span>
                  </dt>
                </div>
              ))}
            </dl>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px]" style={{ color: `${C.emerald}CC` }}>
              Source: {insight.source}
            </p>
            <Link
              to={insight.href}
              className="inline-flex min-h-[44px] items-center gap-1 px-1 text-[11px] font-semibold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: C.emeraldMid, letterSpacing: "0.16em" }}
            >
              View the data
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.08 }}
          id="briefing-panel-trend"
          role="tabpanel"
          aria-labelledby="briefing-tab-trend"
          hidden={activeView !== "trend"}
          className="max-w-3xl border-l pl-6 py-2"
          style={{ borderColor: `${C.emerald}33` }}
          aria-label="Featured long-run trend"
        >
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: C.emeraldMid }}
          >
            The long view
          </p>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <p className="text-sm font-medium" style={{ color: C.emerald }}>
              {FEATURED_TREND.label}
            </p>
            <p
              className="font-serif text-2xl leading-none tabular-nums"
              style={{ color: C.emerald }}
            >
              {latestTrend.value.toLocaleString()}
              {FEATURED_TREND.unit}
            </p>
          </div>
          <Suspense
            fallback={
              <div
                className="h-[110px] w-full animate-pulse rounded"
                style={{ backgroundColor: `${C.emerald}0D` }}
                aria-hidden="true"
              />
            }
          >
            <TrendChart
              data={trendPoints}
              direction="down_is_better"
              unit={FEATURED_TREND.unit}
              height={110}
              overrideColor={C.emeraldMid}
              classification={trendClassification}
              ariaLabel={`${FEATURED_TREND.label} trend, ${trendPoints[0].vintage} to ${trendPoints[trendPoints.length - 1].vintage}`}
            />
          </Suspense>
          <p
            className="mt-2 text-xs leading-relaxed"
            style={{ color: `${C.emerald}CC` }}
          >
            {FEATURED_TREND.insight}
          </p>
          <p className="mt-1.5 text-[11px]" style={{ color: `${C.emerald}CC` }}>
            Source: {FEATURED_TREND.source}
          </p>
        </motion.div>
      </div>

      <ul
        role="list"
        className="mt-8 grid gap-px sm:grid-cols-3 border"
        style={{
          backgroundColor: `${C.emerald}1A`,
          borderColor: `${C.emerald}1A`,
        }}
      >
        {stories.map((story) => (
          <li key={story.id}>
            <Link
              to={story.href}
              className="group flex h-full min-h-[44px] flex-col gap-2 px-5 py-4 transition-colors"
              style={{ backgroundColor: C.cream, color: C.emerald }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: C.emeraldMid }}
              >
                {story.title}
              </p>
              <p className="text-sm leading-snug flex-1">{story.hook}</p>
              <p className="font-serif text-3xl leading-none tabular-nums">
                {story.stat.value.toLocaleString()}
                {story.stat.suffix}
              </p>
              <p className="text-[11px]" style={{ color: `${C.emerald}CC` }}>
                {story.stat.label}
              </p>
              <p
                className="flex items-center justify-between text-[11px]"
                style={{ color: `${C.emerald}CC` }}
              >
                {story.source}
                <ArrowRight
                  className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
