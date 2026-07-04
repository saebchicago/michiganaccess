import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Printer } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { HoverLift, SignalCardAnimation, CounterAnimation, ChartAnimation } from "@/components/animations/civic-animations";
import { MobileCivicNav, ResponsiveGrid, StickyCountyHeader } from "@/components/responsive/ResponsiveGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useCounty } from "@/contexts/CountyContext";
import {
  INTELLIGENCE_DOMAINS,
  formatMetricName,
  getIntelligenceDomain,
  type IntelligenceDomain,
  type IntelligenceDomainSlug,
} from "@/data/intelligence-domains";
import { getCountyIntelligenceRecord } from "@/data/michigan-counties-intelligence";

const DOMAIN_ROUTE_SLUGS = new Set<IntelligenceDomainSlug>(INTELLIGENCE_DOMAINS.map((domain) => domain.slug));
const CHART_BASELINE_Y = 54;
const CHART_HEIGHT_RANGE = 36;
const MAX_VISIBLE_METRICS = 8;
const CHART_START_X = 10;
const CHART_X_STEP = 35;
const CHART_FALLBACK_PATH = `M${CHART_START_X} ${CHART_BASELINE_Y} L${CHART_START_X + CHART_X_STEP * 4} ${CHART_BASELINE_Y}`;

const PERCENT_METRICS = new Set([
  "uninsured_rate",
  "renter_burden_rate",
  "food_insecurity_rate",
]);

function formatMetricValue(metric: string, value: number | null) {
  if (value === null) {
    return "Data pending";
  }

  if (PERCENT_METRICS.has(metric)) {
    return `${value.toLocaleString()}%`;
  }

  return value.toLocaleString();
}

function getSignalTone(metric: string, value: number | null) {
  if (value === null) return "stable";
  if (metric.includes("score") || metric.includes("access") || metric.includes("compliance") || metric.includes("coverage")) {
    if (value >= 75) return "improving";
    if (value >= 50) return "insight";
    return "worsening";
  }
  if (metric.includes("life_expectancy") || metric.includes("capacity")) {
    return value >= 75 ? "improving" : "stable";
  }
  if (metric.includes("rate") || metric.includes("burden") || metric.includes("filings") || metric.includes("deaths")) {
    if (value >= 50) return "worsening";
    if (value >= 20) return "stable";
    return "improving";
  }
  return "insight";
}

function buildCsv(domain: IntelligenceDomain, countyName: string, metrics: Record<string, number | null>) {
  const rows = domain.metrics.map((metric) => `${metric},${metrics[metric] ?? ""}`);
  return `county,domain\n${countyName},${domain.slug}\n\nmetric,value\n${rows.join("\n")}`;
}

function inferDomainFromPath(pathname: string): IntelligenceDomainSlug {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (firstSegment && DOMAIN_ROUTE_SLUGS.has(firstSegment as IntelligenceDomainSlug)) {
    return firstSegment as IntelligenceDomainSlug;
  }

  return "health";
}

function buildChartPath(domain: IntelligenceDomain, metrics: Record<string, number | null>) {
  const chartValues = domain.metrics
    .slice(0, 5)
    .map((metric, index) => ({ index, value: metrics[metric] }))
    .filter((point): point is { index: number; value: number } => point.value !== null);

  if (chartValues.length === 0) {
    return CHART_FALLBACK_PATH;
  }

  const max = Math.max(...chartValues.map((point) => point.value), 1);

  return chartValues
    .map(({ index, value }, pointIndex) => {
      const x = CHART_START_X + index * CHART_X_STEP;
      const y = CHART_BASELINE_Y - (value / max) * CHART_HEIGHT_RANGE;
      return `${pointIndex === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function DomainVisualization({ domain, metrics }: { domain: IntelligenceDomain; metrics: Record<string, number | null> }) {
  const chartPoints = useMemo(() => buildChartPath(domain, metrics), [domain, metrics]);

  return (
    <Card className="civic-card border-border/60 bg-card/95">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="civic-eyebrow">Domain visualization</p>
          <h2 className="civic-subsection-title">Signal trend across the leading indicators</h2>
          <p className="text-sm text-muted-foreground">
            Chart animations stay under 400ms for controls and expand to a single column on smaller screens.
          </p>
        </div>
        <div className="w-full max-w-md text-insight">
          <ChartAnimation points={chartPoints} />
        </div>
      </div>
    </Card>
  );
}

function CountyComparison({ domain, metrics }: { domain: IntelligenceDomain; metrics: Record<string, number | null> }) {
  const availableValues = domain.metrics.map((metric) => metrics[metric]).filter((value): value is number => value !== null);
  const average = availableValues.length
    ? availableValues.reduce((sum, value) => sum + value, 0) / availableValues.length
    : 0;

  return (
    <Card className="civic-card border-border/60 bg-card/95">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <p className="civic-eyebrow">County comparison</p>
          <h2 className="civic-subsection-title">How this domain compares with Michigan baselines</h2>
          <p className="text-sm text-muted-foreground">
            Update frequency: {domain.updateFrequency} · Source: {domain.dataSource}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-background/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Available metrics</p>
            <CounterAnimation target={availableValues.length} className="text-3xl" />
          </div>
          <div className="rounded-lg border border-border/60 bg-background/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Average signal value</p>
            <CounterAnimation target={average} decimals={1} className="text-3xl" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function DomainDashboard() {
  const location = useLocation();
  const { county, countyLabel } = useCounty();
  const selectedCounty = county ?? "Wayne";
  const [selectedDomain, setSelectedDomain] = useState<IntelligenceDomainSlug>(
    inferDomainFromPath(location.pathname) as IntelligenceDomainSlug,
  );
  const [researchMode, setResearchMode] = useState(false);

  useEffect(() => {
    setSelectedDomain(inferDomainFromPath(location.pathname) as IntelligenceDomainSlug);
  }, [location.pathname]);

  const domain = getIntelligenceDomain(selectedDomain);
  const countyRecord = getCountyIntelligenceRecord(selectedCounty);
  const metrics = countyRecord?.domainMetrics[domain.slug] ?? null;
  const csvHref = metrics
    ? `data:text/csv;charset=utf-8,${encodeURIComponent(buildCsv(domain, selectedCounty, metrics))}`
    : undefined;

  const dashboardLinks = INTELLIGENCE_DOMAINS.map((item) => ({
    label: item.name,
    href: item.slug === "health" ? "/health" : `/${item.slug}`,
  }));

  return (
    <Layout>
      <StickyCountyHeader
        title={`${countyLabel} - ${domain.name} Intelligence`}
        subtitle="AccessMI brings together county, city, and ZIP-aware civic indicators across Michigan’s key public-interest domains."
        secondaryLinks={dashboardLinks}
      />

      <section className="container space-y-6 py-6 md:space-y-8 md:py-8">
        <div className="overflow-x-auto pb-2">
          <div className="flex w-max gap-2">
            {INTELLIGENCE_DOMAINS.map((item) => {
              const active = item.slug === domain.slug;
              return (
                <motion.div key={item.slug} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Button
                    asChild
                    variant={active ? "default" : "outline"}
                    className={active ? "bg-primary text-primary-foreground" : "bg-background"}
                  >
                    <Link to={item.slug === "health" ? "/health" : `/${item.slug}`} onClick={() => setSelectedDomain(item.slug)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="civic-slide-in flex flex-col gap-4 rounded-lg border border-border/60 bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="civic-eyebrow">Research controls</p>
            <h2 className="civic-subsection-title">Toggle methodology-ready detail</h2>
            <p className="text-sm text-muted-foreground">
              Reveal export links and a structured table without adding loading animations during data fetches.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-3 text-sm font-medium text-foreground">
              <Switch aria-label="Toggle research mode" checked={researchMode} onCheckedChange={setResearchMode} />
              Research mode
            </label>
            {csvHref ? (
              <Button asChild variant="outline">
                <a id="csv-download-link" href={csvHref} download={`${selectedCounty}-${domain.slug}.csv`}>
                  <Download className="mr-2 h-4 w-4" /> Download CSV
                </a>
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        <div className="hidden print:block">
          <h2 className="text-2xl font-bold">{countyLabel} Intelligence Snapshot</h2>
        </div>

        {metrics ? (
          <ResponsiveGrid className="items-stretch">
            {domain.metrics.slice(0, MAX_VISIBLE_METRICS).map((metric, index) => {
              const value = metrics[metric] ?? null;
              const tone = getSignalTone(metric, value);
              const toneClass =
                tone === "improving"
                  ? "bg-improving-soft text-improving"
                  : tone === "worsening"
                    ? "bg-worsening-soft text-worsening"
                    : tone === "stable"
                      ? "bg-stable-soft text-stable"
                      : "bg-insight-soft text-insight";

              return (
                <SignalCardAnimation key={metric} index={index}>
                  <HoverLift>
                    <Card className="civic-card h-full border-border/60 bg-card/95">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="civic-eyebrow">{domain.name}</p>
                            <h2 className="civic-subsection-title">{formatMetricName(metric)}</h2>
                          </div>
                          <Badge className={toneClass}>{tone.replace(/^[a-z]/, (char) => char.toUpperCase())}</Badge>
                        </div>
                        <p className="civic-metric-lg">{formatMetricValue(metric, value)}</p>
                        <p className="text-sm text-muted-foreground">
                          Source cadence: {domain.updateFrequency}. Missing values are explicitly marked as pending to protect data integrity.
                        </p>
                      </div>
                    </Card>
                  </HoverLift>
                </SignalCardAnimation>
              );
            })}
          </ResponsiveGrid>
        ) : (
          <Card id="county-fallback" className="civic-card border-border/60 bg-card/95">
            <p className="civic-subsection-title">County fallback</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We could not find a domain snapshot for {selectedCounty}. Showing the default Michigan domain scaffold instead.
            </p>
          </Card>
        )}

        {metrics ? <DomainVisualization domain={domain} metrics={metrics} /> : null}
        {metrics ? <CountyComparison domain={domain} metrics={metrics} /> : null}

        {researchMode && metrics ? (
          <Card className="civic-card border-border/60 bg-card/95">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="civic-eyebrow">Research mode enabled</p>
                <h2 className="civic-subsection-title">Detailed table and source links</h2>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {csvHref ? (
                  <a id="api-download-link" href={csvHref} download={`${selectedCounty}-${domain.slug}-api.csv`} className="text-primary underline underline-offset-4">
                    API-style download
                  </a>
                ) : null}
                <Link id="methodology-link" to="/methodology" className="text-primary underline underline-offset-4">
                  Methodology
                </Link>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table id="data-table" className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left">
                    <th className="py-3 pr-4 font-semibold text-foreground">Metric</th>
                    <th className="py-3 pr-4 font-semibold text-foreground">Value</th>
                    <th className="py-3 font-semibold text-foreground">Update frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {domain.metrics.map((metric) => (
                    <tr key={metric} className="border-b border-border/40">
                      <td className="py-3 pr-4 text-foreground">{formatMetricName(metric)}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatMetricValue(metric, metrics[metric] ?? null)}</td>
                      <td className="py-3 text-muted-foreground">{domain.updateFrequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}
      </section>

      <MobileCivicNav menuLinks={dashboardLinks} />
    </Layout>
  );
}
