import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import LanguageAccessCard from "@/components/equity/LanguageAccessCard";
import PharmacyDesertCard from "@/components/equity/PharmacyDesertCard";
import TribalHealthSection from "@/components/equity/TribalHealthSection";
import ChildcareDesertCard from "@/components/equity/ChildcareDesertCard";
import EducationEquityCard from "@/components/equity/EducationEquityCard";
import HousingCrisisCard from "@/components/equity/HousingCrisisCard";
import DentalDesertCard from "@/components/equity/DentalDesertCard";
import BankingDesertCard from "@/components/equity/BankingDesertCard";
import BroadbandRealityCard from "@/components/equity/BroadbandRealityCard";
import VeteranResourceCard from "@/components/equity/VeteranResourceCard";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info, Download, X } from "lucide-react";
import PrintButton from "@/components/shared/PrintButton";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface EquityRow {
  metric: string;
  unit: string;
  white: number;
  black: number;
  hispanic: number;
  asian: number;
  stateAvg: number;
}

// Source: MDHHS Health Equity Data, CDC WONDER, County Health Rankings & Roadmaps 2025 edition, CDC BRFSS
const EQUITY: EquityRow[] = [
  {
    metric: "Life Expectancy",
    unit: "yrs",
    white: 78.1,
    black: 73.4,
    hispanic: 80.2,
    asian: 83.5,
    stateAvg: 77.4,
  },
  {
    metric: "Infant Mortality",
    unit: "per 1K",
    white: 4.8,
    black: 12.6,
    hispanic: 5.1,
    asian: 3.2,
    stateAvg: 6.4,
  },
  {
    metric: "Uninsured Rate",
    unit: "%",
    white: 4.2,
    black: 7.8,
    hispanic: 12.5,
    asian: 5.1,
    stateAvg: 5.8,
  },
  {
    metric: "Diabetes",
    unit: "%",
    white: 10.1,
    black: 15.8,
    hispanic: 13.2,
    asian: 9.8,
    stateAvg: 11.4,
  },
  {
    metric: "Obesity",
    unit: "%",
    white: 32.1,
    black: 41.5,
    hispanic: 36.8,
    asian: 14.2,
    stateAvg: 33.0,
  },
  {
    metric: "Hypertension",
    unit: "%",
    white: 30.2,
    black: 42.1,
    hispanic: 28.5,
    asian: 22.8,
    stateAvg: 32.1,
  },
  {
    metric: "Depression",
    unit: "%",
    white: 22.3,
    black: 18.5,
    hispanic: 16.8,
    asian: 12.1,
    stateAvg: 20.1,
  },
  {
    metric: "Premature Death",
    unit: "per 100K",
    white: 7200,
    black: 12800,
    hispanic: 5900,
    asian: 4100,
    stateAvg: 8200,
  },
];

const GROUPS = ["white", "black", "hispanic", "asian"] as const;
type Group = (typeof GROUPS)[number];
const GROUP_LABELS: Record<Group, string> = {
  white: "White",
  black: "Black",
  hispanic: "Hispanic",
  asian: "Asian",
};
const GROUP_COLORS: Record<Group, string> = {
  white: "#4A90E2",
  black: "#FF6B6B",
  hispanic: "#F4A460",
  asian: "#00A3A1",
};

function GapBar({ row, maxGap }: { row: EquityRow; maxGap: number }) {
  const vals = GROUPS.map((g) => row[g]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const barWidth = ((max - min) / maxGap) * 100;
  const ratio = (max / min).toFixed(1);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-foreground">
          {row.metric}
        </span>
        <span className="text-xs font-bold text-destructive">
          {ratio}x disparity
        </span>
      </div>
      <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
        <div
          className="absolute h-full rounded-lg bg-gradient-to-r from-destructive/20 to-destructive/60 transition-all duration-700"
          style={{ width: `${barWidth}%` }}
        />
        <div className="absolute inset-0 flex items-center">
          {GROUPS.map((g) => {
            const pos = ((row[g] - min) / (maxGap || 1)) * 100;
            return (
              <div
                key={g}
                className="absolute flex flex-col items-center"
                style={{ left: `${Math.min(pos, 95)}%` }}
              >
                <div
                  className="w-3 h-3 rounded-full border-2 border-background shadow-md"
                  style={{ backgroundColor: GROUP_COLORS[g] }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
        {GROUPS.map((g) => (
          <div key={g} className="text-center">
            <div className="flex items-center justify-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: GROUP_COLORS[g] }}
              />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {GROUP_LABELS[g]}
              </span>
            </div>
            <span className="text-xs font-bold text-foreground">
              {row[g]} {row.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function downloadCSV() {
  const headers = [
    "Metric",
    "Unit",
    "White",
    "Black",
    "Hispanic",
    "Asian",
    "State Avg",
    "Disparity Ratio",
  ];
  const rows = EQUITY.map((r) => {
    const vals = GROUPS.map((g) => r[g]);
    const ratio = (Math.max(...vals) / Math.min(...vals)).toFixed(1);
    return [
      r.metric,
      r.unit,
      r.white,
      r.black,
      r.hispanic,
      r.asian,
      r.stateAvg,
      ratio,
    ].join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "michigan-equity-scorecard.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function EquityScorecardPage() {
  const [sortBy, setSortBy] = useState("gap");
  const [activeTab, setActiveTab] = useState("health");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  usePageMeta({
    title: "Michigan Health Equity Data | Access Michigan",
    description:
      "Health equity indicators across Michigan's 83 counties including social determinants, chronic disease burden, and access gaps.",
    path: "/equity",
  });

  const maxGap = Math.max(
    ...EQUITY.map((r) => {
      const vals = GROUPS.map((g) => r[g]);
      return Math.max(...vals) - Math.min(...vals);
    }),
  );

  const sorted = useMemo(
    () =>
      [...EQUITY].sort((a, b) => {
        if (sortBy === "gap") {
          const gapA =
            Math.max(...GROUPS.map((g) => a[g])) /
            Math.min(...GROUPS.map((g) => a[g]));
          const gapB =
            Math.max(...GROUPS.map((g) => b[g])) /
            Math.min(...GROUPS.map((g) => b[g]));
          return gapB - gapA;
        }
        return a.metric.localeCompare(b.metric);
      }),
    [sortBy],
  );

  const detail = selectedMetric
    ? EQUITY.find((r) => r.metric === selectedMetric)
    : null;

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Data & Insights", href: "/data-and-insights" },
          { label: "Health Equity Scorecard" },
        ]}
      />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-4xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={0}
          >
            <Badge
              variant="outline"
              className="mb-3 uppercase tracking-wider text-xs"
            >
              Health Equity
            </Badge>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              Health disparities, at a glance.
            </h1>
            <p className="text-muted-foreground">
              Racial and ethnic gaps across key indicators. Hover any metric for
              group detail.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-4xl py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Largest Disparity",
              value: "Infant Mortality",
              sub: "3.9x Black vs. Asian",
              color: "text-destructive",
            },
            {
              label: "Life Expectancy Gap",
              value: "10.1 years",
              sub: "Asian 83.5 vs. Black 73.4",
              color: "text-[hsl(var(--michigan-gold))]",
            },
            {
              label: "Insurance Gap",
              value: "8.3 pts",
              sub: "Hispanic 12.5% vs. White 4.2%",
              color: "text-primary",
            },
            {
              label: "Metrics Tracked",
              value: "8",
              sub: "Across 4 racial/ethnic groups",
              color: "text-[hsl(var(--michigan-teal))]",
            },
          ].map((card) => (
            <Card key={card.label}>
              <CardContent className="pt-4 pb-3">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {card.label}
                </p>
                <p className={`text-xl font-bold mt-1 ${card.color}`}>
                  {card.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {card.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <div
                key={g}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: GROUP_COLORS[g] }}
                />
                <span className="text-xs font-semibold text-muted-foreground">
                  {GROUP_LABELS[g]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gap">Sort by disparity</SelectItem>
                <SelectItem value="alpha">Sort alphabetically</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="h-3 w-3 mr-1.5" />
              CSV
            </Button>
          </div>
        </div>

        {/* Metric bars */}
        <div className="space-y-6">
          {sorted.map((row) => (
            <motion.div
              key={row.metric}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              custom={0}
              className="cursor-pointer"
              onClick={() =>
                setSelectedMetric(
                  selectedMetric === row.metric ? null : row.metric,
                )
              }
              tabIndex={0}
              role="button"
              aria-label={`View details for ${row.metric}`}
            >
              <GapBar row={row} maxGap={maxGap} />
            </motion.div>
          ))}
        </div>

        {/* Detail modal */}
        {detail && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMetric(null)}
            role="dialog"
            aria-label={`${detail.metric} detail`}
          >
            <Card
              className="max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle>{detail.metric}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMetric(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {GROUPS.map((g) => {
                  const vals = GROUPS.map((gr) => detail[gr]);
                  const max = Math.max(...vals);
                  const pct = (detail[g] / max) * 100;
                  return (
                    <div key={g}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {GROUP_LABELS[g]}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: GROUP_COLORS[g] }}
                        >
                          {detail[g]} {detail.unit}
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: GROUP_COLORS[g],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    State average:{" "}
                    <strong>
                      {detail.stateAvg} {detail.unit}
                    </strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Source */}
        <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <strong>Sources:</strong> MDHHS Health Equity Data, CDC WONDER,
            County Health Rankings & Roadmaps, 2025 edition, CDC BRFSS.
            Reference year: 2023–2024. Disparity ratio = highest group value /
            lowest group value. See{" "}
            <a href="/methodology" className="text-primary hover:underline">
              Methodology
            </a>
            .
          </p>
        </div>
      </div>
      {/* Equity Dashboard - Tabbed Sections */}
      <div className="container max-w-5xl py-8">
        {/* Stat strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-center">
          {[
            {
              stat: "41%",
              label: "below ALICE",
              color: "text-michigan-coral-deep",
            },
            {
              stat: "59/83",
              label: "dental HPSAs",
              color: "text-michigan-gold-deep",
            },
            {
              stat: "102",
              label: "PFAS water bodies",
              color: "text-michigan-coral-deep",
            },
            {
              stat: "31K",
              label: "homeless 2024",
              color: "text-michigan-coral-deep",
            },
            { stat: "298K", label: "Spanish speakers", color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="px-3">
              <span className={`text-lg font-bold ${s.color}`}>{s.stat}</span>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
          {[
            { id: "health", label: "Health Access" },
            { id: "economic", label: "Economic" },
            { id: "environment", label: "Environment" },
            { id: "community", label: "Community" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === "health" && (
            <>
              <PharmacyDesertCard />
              <DentalDesertCard />
              <TribalHealthSection />
              <VeteranResourceCard />
              <LanguageAccessCard />
            </>
          )}
          {activeTab === "economic" && (
            <>
              <BankingDesertCard />
              <BroadbandRealityCard />
              <ChildcareDesertCard />
            </>
          )}
          {activeTab === "environment" && (
            <p className="text-sm text-muted-foreground text-center py-8">
              See the{" "}
              <a
                href="/environment#water-safety"
                className="text-primary hover:underline"
              >
                Environment page
              </a>{" "}
              for PFAS, lead, and water safety data.
            </p>
          )}
          {activeTab === "community" && (
            <>
              <EducationEquityCard />
              <HousingCrisisCard />
            </>
          )}
        </div>
      </div>

      <PrintButton />
    </Layout>
  );
}
