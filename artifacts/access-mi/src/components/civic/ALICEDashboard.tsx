import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ArrowRight, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import {
  ALICE_COUNTY_PROVENANCE,
  ALICE_COUNTY_RECORDS,
  ALICE_STATEWIDE_RECORD,
} from "@/data/aliceData";

/**
 * Every figure on this card reads from alice-county.generated.json - the
 * official United For ALICE Michigan Data Sheet, all 83 counties.
 *
 * It used to carry a hand-maintained 20-county table and a monthly budget
 * split from the 2025 report (2023 data). Once the 2026 sheet landed, this
 * card disagreed with the platform's own dataset on every county it listed
 * (Lake 64% here vs 51.5% official, Ottawa 29% vs 33.8%) and on the
 * statewide headline (41% vs 39.7%). The budget bars were worse: they were
 * titled "Family of 4" while summing to $36,912 - the single-adult figure -
 * and no published breakdown backed the categories. Nothing here is typed
 * by hand any more.
 */

const SOURCE_LABEL = `United For ALICE ${ALICE_COUNTY_PROVENANCE.report_year} Report (${ALICE_COUNTY_PROVENANCE.data_year} data)`;

const TOP_COUNTY_COUNT = 15;

const TOP_COUNTIES = [...ALICE_COUNTY_RECORDS]
  .sort((a, b) => b.belowAliceThresholdPct - a.belowAliceThresholdPct)
  .slice(0, TOP_COUNTY_COUNT);

const STATEWIDE_BELOW_HOUSEHOLDS =
  ALICE_STATEWIDE_RECORD.povertyHouseholds + ALICE_STATEWIDE_RECORD.aliceHouseholds;

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

const millions = (n: number) => `${(n / 1_000_000).toFixed(1)}M`;

/** Official statewide Household Survival Budgets. The sheet publishes the
 *  annual totals only; it does not break them into monthly categories, so
 *  none are invented here. */
const SURVIVAL_BUDGETS = [
  {
    label: "Single adult",
    annual: ALICE_STATEWIDE_RECORD.survivalBudgetSingleAdult,
    federalPovertyLevel:
      ALICE_STATEWIDE_RECORD.federalPovertyLevelSingleAdult,
  },
  {
    label: "Family of four",
    annual: ALICE_STATEWIDE_RECORD.survivalBudgetFamilyOfFour,
    federalPovertyLevel:
      ALICE_STATEWIDE_RECORD.federalPovertyLevelFamilyOfFour,
  },
];

function barColor(pct: number): string {
  if (pct > 50) return "hsl(0, 80%, 55%)";
  if (pct > 40) return "hsl(27, 87%, 55%)";
  return "hsl(145, 45%, 42%)";
}

export default function ALICEDashboard() {
  const chartData = TOP_COUNTIES.map((d) => ({
    county: d.countyName,
    threshold: d.belowAliceThresholdPct,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
      <Card className="border-michigan-coral/20 bg-michigan-coral/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-michigan-coral-deep" />
            ALICE: Asset Limited, Income Constrained, Employed
          </CardTitle>
          <CardDescription>
            Working families who earn above the poverty line but below the cost of living
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Headline */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-3 text-center">
              <p className="text-3xl font-bold text-michigan-coral-deep">
                {Math.round(ALICE_STATEWIDE_RECORD.belowAliceThresholdPct)}%
              </p>
              <p className="text-xs text-muted-foreground">
                of MI households below ALICE Threshold (
                {ALICE_STATEWIDE_RECORD.povertyPct}% poverty +{" "}
                {ALICE_STATEWIDE_RECORD.alicePct}% ALICE) · {SOURCE_LABEL}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-center">
              <p className="text-3xl font-bold text-foreground">
                {millions(STATEWIDE_BELOW_HOUSEHOLDS)}
              </p>
              <p className="text-xs text-muted-foreground">
                households struggling to afford basics, of{" "}
                {millions(ALICE_STATEWIDE_RECORD.households)} statewide
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-center">
              <p className="text-3xl font-bold text-michigan-gold-deep">
                {usd(ALICE_STATEWIDE_RECORD.survivalBudgetFamilyOfFour)}
              </p>
              <p className="text-xs text-muted-foreground">Survival Budget (family of 4)</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>This is why Access Michigan exists.</strong> The ALICE population - people who work but can't afford housing, childcare, food, transportation, and healthcare simultaneously - is the exact audience this platform serves. They earn too much for traditional safety nets but not enough to be financially stable.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* County chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              % Households Below ALICE Threshold - {TOP_COUNTY_COUNT} highest of 83 counties
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <ProvenanceTag
                label="MODELED"
                source={SOURCE_LABEL}
                vintage={`${ALICE_COUNTY_PROVENANCE.data_year} data`}
              />
              <span className="text-[10px]">Classification against the ALICE Threshold</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis type="number" unit="%" tick={{ fontSize: 10 }} domain={[0, 60]} />
                <YAxis dataKey="county" type="category" width={85} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Below ALICE Threshold"]} />
                <Bar dataKey="threshold" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.threshold)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Survival budget */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-michigan-gold-deep" />
              ALICE Survival Budget vs Federal Poverty Level (MI)
            </CardTitle>
            <CardDescription>
              What it costs to meet basic needs - not thrive, just survive -
              against the poverty line used to decide who qualifies for help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SURVIVAL_BUDGETS.map((b) => (
                <div key={b.label} className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-foreground">{b.label}</span>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {usd(b.annual)}/year
                    </span>
                  </div>
                  <div className="h-6 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-primary/60 rounded flex items-center px-2 w-full">
                      <span className="text-[9px] font-bold text-white whitespace-nowrap">
                        Survival Budget {usd(Math.round(b.annual / 12))}/mo
                      </span>
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-michigan-coral/60 rounded flex items-center px-2"
                      style={{
                        width: `${Math.round((b.federalPovertyLevel / b.annual) * 100)}%`,
                      }}
                    >
                      <span className="text-[9px] font-bold text-white whitespace-nowrap">
                        FPL {usd(b.federalPovertyLevel)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    The Survival Budget is{" "}
                    {(b.annual / b.federalPovertyLevel).toFixed(1)}x the federal
                    poverty level, so a household can earn well over the line
                    and still not cover basics.
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground">
              {ALICE_STATEWIDE_RECORD.reportRoundingNote}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="border-michigan-forest/20 bg-michigan-forest/5">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Programs ALICE households may qualify for:</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to="/financial-help">Benefits Wizard <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to="/environment#programs">LIHEAP / MEAP / MiHER <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to="/find-care">Sliding-Scale Clinics <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Source:{" "}
            <a href={ALICE_COUNTY_PROVENANCE.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {SOURCE_LABEL}
            </a>. ALICE Threshold = poverty + ALICE households combined.
            Household counts are published by United For ALICE; the
            below-threshold classification is MODELED against a constructed
            Household Survival Budget.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
