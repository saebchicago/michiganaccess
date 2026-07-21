import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WEEKLY_INSIGHTS } from "@/data/insights";
import { DATA_STORIES } from "@/data/data-stories";
import { MICHIGAN_TRENDS } from "@/data/michigan-trends";
import { TrendChart } from "@/components/charts/TrendChart";
import { classify } from "@/lib/trend";
import { EDITORIAL as C } from "@/components/home/editorialTheme";

// Same week rotation as InsightOfWeek so the homepage and /insights lead
// with the same finding on any given day.
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
 * The intelligence briefing: the homepage's first scroll leads with a
 * finding, not a tool. Consumes the same curated, sourced data modules
 * as /insights, rendered in the homepage's editorial voice.
 */
export default function IntelligenceBriefing() {
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
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-6">
        <h3
          id="briefing-heading"
          className="font-serif text-2xl md:text-3xl"
          style={{ color: C.emerald }}
        >
          What the data says.
        </h3>
        <Link
          to="/insights"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
          style={{ color: C.gold, letterSpacing: "0.18em" }}
        >
          Read all insights
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* This week's finding */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-7 border-l pl-6 py-2"
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
                    style={{ color: `${C.emerald}B3` }}
                  >
                    {dp.label} <span style={{ color: `${C.emerald}80` }}>({dp.context})</span>
                  </dt>
                </div>
              ))}
            </dl>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px]" style={{ color: `${C.emerald}80` }}>
              Source: {insight.source}
            </p>
            <Link
              to={insight.href}
              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: C.emeraldMid, letterSpacing: "0.16em" }}
            >
              View the data
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </motion.article>

        {/* Long-run trend */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="lg:col-span-5 border-l pl-6 py-2"
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
          <TrendChart
            data={trendPoints}
            direction="down_is_better"
            unit={FEATURED_TREND.unit}
            height={110}
            overrideColor={C.emeraldMid}
            classification={trendClassification}
            ariaLabel={`${FEATURED_TREND.label} trend, ${trendPoints[0].vintage} to ${trendPoints[trendPoints.length - 1].vintage}`}
          />
          <p
            className="mt-2 text-xs leading-relaxed"
            style={{ color: `${C.emerald}B3` }}
          >
            {FEATURED_TREND.insight}
          </p>
          <p className="mt-1.5 text-[11px]" style={{ color: `${C.emerald}80` }}>
            Source: {FEATURED_TREND.source}
          </p>
        </motion.aside>
      </div>

      {/* Story teasers */}
      <ul
        role="list"
        className="mt-8 grid gap-px sm:grid-cols-3 border"
        style={{ backgroundColor: `${C.emerald}1A`, borderColor: `${C.emerald}1A` }}
      >
        {stories.map((story) => (
          <li key={story.id}>
            <Link
              to={story.href}
              className="group flex h-full flex-col gap-2 px-5 py-4 transition-colors"
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
              <p className="text-[11px]" style={{ color: `${C.emerald}99` }}>
                {story.stat.label}
              </p>
              <p
                className="flex items-center justify-between text-[11px]"
                style={{ color: `${C.emerald}80` }}
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
