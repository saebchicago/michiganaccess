import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ArrowRight, ExternalLink, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Source: United for ALICE, 2023 data
const ALICE_COUNTIES = [
  { county: "Lake", aliceThreshold: 64, poverty: 28.6, alice: 35.4 },
  { county: "Oscoda", aliceThreshold: 61, poverty: 24.8, alice: 36.2 },
  { county: "Crawford", aliceThreshold: 58, poverty: 21.4, alice: 36.6 },
  { county: "Montmorency", aliceThreshold: 57, poverty: 22.1, alice: 34.9 },
  { county: "Arenac", aliceThreshold: 56, poverty: 20.8, alice: 35.2 },
  { county: "Genesee", aliceThreshold: 52, poverty: 20.6, alice: 31.4 },
  { county: "Wayne", aliceThreshold: 51, poverty: 25.4, alice: 25.6 },
  { county: "Saginaw", aliceThreshold: 50, poverty: 19.8, alice: 30.2 },
  { county: "Calhoun", aliceThreshold: 48, poverty: 17.8, alice: 30.2 },
  { county: "Muskegon", aliceThreshold: 47, poverty: 17.2, alice: 29.8 },
  { county: "Jackson", aliceThreshold: 45, poverty: 14.8, alice: 30.2 },
  { county: "Berrien", aliceThreshold: 45, poverty: 16.5, alice: 28.5 },
  { county: "Ingham", aliceThreshold: 43, poverty: 18.1, alice: 24.9 },
  { county: "Kent", aliceThreshold: 38, poverty: 11.2, alice: 26.8 },
  { county: "Macomb", aliceThreshold: 36, poverty: 10.8, alice: 25.2 },
  { county: "Kalamazoo", aliceThreshold: 37, poverty: 15.4, alice: 21.6 },
  { county: "Washtenaw", aliceThreshold: 30, poverty: 13.2, alice: 16.8 },
  { county: "Ottawa", aliceThreshold: 29, poverty: 6.8, alice: 22.2 },
  { county: "Livingston", aliceThreshold: 27, poverty: 4.8, alice: 22.2 },
  { county: "Oakland", aliceThreshold: 28, poverty: 8.1, alice: 19.9 },
];

// Source: United for ALICE, 2023 data (Survival Budget)
const BUDGET = [
  { category: "Housing", monthly: 828, pct: 27 },
  { category: "Childcare", monthly: 726, pct: 24 },
  { category: "Food", monthly: 383, pct: 12 },
  { category: "Transportation", monthly: 468, pct: 15 },
  { category: "Healthcare", monthly: 306, pct: 10 },
  { category: "Taxes + Other", monthly: 365, pct: 12 },
];

function barColor(pct: number): string {
  if (pct > 50) return "hsl(0, 80%, 55%)";
  if (pct > 40) return "hsl(27, 87%, 55%)";
  return "hsl(145, 45%, 42%)";
}

export default function ALICEDashboard() {
  const chartData = ALICE_COUNTIES.slice(0, 15).map((d) => ({
    county: d.county,
    threshold: d.aliceThreshold,
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
              <p className="text-3xl font-bold text-michigan-coral-deep">41%</p>
              <p className="text-xs text-muted-foreground">of MI households below ALICE Threshold (14% poverty + 27% ALICE) · United For ALICE 2025 report, 2023 data</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-center">
              <p className="text-3xl font-bold text-foreground">1.8M+</p>
              <p className="text-xs text-muted-foreground">households struggling to afford basics</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-center">
              <p className="text-3xl font-bold text-michigan-gold-deep">$73K</p>
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
            <CardTitle className="text-sm">% Households Below ALICE Threshold by County</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis type="number" unit="%" tick={{ fontSize: 10 }} domain={[0, 70]} />
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
              ALICE Survival Budget (Family of 4, MI)
            </CardTitle>
            <CardDescription>Monthly cost to meet basic needs - not thrive, just survive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {BUDGET.map((b) => (
                <div key={b.category} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{b.category}</span>
                  <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded flex items-center px-2"
                      style={{ width: `${b.pct * 1.5}%` }}
                    >
                      <span className="text-[9px] font-bold text-white whitespace-nowrap">${b.monthly}/mo</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{b.pct}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-border p-3 text-center">
              <p className="text-lg font-bold text-foreground">$3,076/month · $36,912/year</p>
              <p className="text-[10px] text-muted-foreground">Single adult ALICE Survival Budget</p>
            </div>
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
            <a href="https://unitedforalice.org/state-overview/michigan" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              United for ALICE, 2023 data
            </a>. ALICE Threshold = poverty + ALICE households combined.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
