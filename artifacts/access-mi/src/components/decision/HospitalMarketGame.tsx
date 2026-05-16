import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Scenario = "status_quo" | "ob_closes" | "reh_conversion";

// Source: CHQPR Dec 2025, Flex Monitoring Team, CMS REH Program, Sturgis Hospital
const SCENARIOS: Record<Scenario, { title: string; desc: string; revenue: number; costs: number; communityImpact: string; realExample: string; badge: string; badgeColor: string }> = {
  status_quo: {
    title: "Status Quo",
    desc: "Hospital continues operating all services at current volume",
    revenue: 8200000, costs: 9400000,
    communityImpact: "24/7 ER + inpatient + OB retained. 3 OB nurses serve 180 births/year.",
    realExample: "This is the current reality for Michigan's 35 Critical Access Hospitals — 13 of which are at risk (CHQPR Dec 2025).",
    badge: "Current", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  },
  ob_closes: {
    title: "OB Unit Closes",
    desc: "Hospital eliminates obstetric services to reduce losses",
    revenue: 7400000, costs: 7600000,
    communityImpact: "ER retained but nearest OB now 45 minutes away. 180 families must travel for delivery.",
    realExample: "This is what happened 17+ times across Michigan since 2008 (Bridge Michigan / MHA). 18 counties are now maternity care deserts (March of Dimes 2024).",
    badge: "Common", badgeColor: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  },
  reh_conversion: {
    title: "REH Conversion",
    desc: "Convert to Rural Emergency Hospital — keep ER, drop inpatient",
    revenue: 9700000, costs: 8900000,
    communityImpact: "ER + outpatient + observation retained. No inpatient beds. $291K/month federal payment + 105% outpatient PPS.",
    realExample: "Sturgis Hospital chose this in July 2023 — Michigan's first and only REH. ~44-48 REH conversions nationally (CMS).",
    badge: "Innovation", badgeColor: "bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400",
  },
};

const chartData = Object.entries(SCENARIOS).map(([key, s]) => ({
  scenario: s.title,
  Revenue: s.revenue / 1e6,
  Costs: s.costs / 1e6,
  "Net Income": (s.revenue - s.costs) / 1e6,
}));

export default function HospitalMarketGame() {
  const [active, setActive] = useState<Scenario>("status_quo");
  const scenario = SCENARIOS[active];

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm font-bold text-foreground mb-1">The Setup</p>
        <p className="text-xs text-muted-foreground">A fictional but data-realistic rural Michigan county: 1 Critical Access Hospital, 25 beds, 12% occupancy, 65% Medicaid payer mix, population 15,000 (declining 2%/year). Nearest alternative: 45 minutes.</p>
        <p className="text-[9px] text-muted-foreground/60 mt-1">Parameters based on Michigan CON Survey 2024 and Flex Monitoring Team data</p>
      </div>

      {/* Scenario toggles */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(SCENARIOS) as [Scenario, typeof SCENARIOS["status_quo"]][]).map(([key, s]) => (
          <button key={key} onClick={() => setActive(key)}
            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${active === key ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
            {s.title}
          </button>
        ))}
      </div>

      {/* Active scenario detail */}
      <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-bold text-foreground">{scenario.title}</h3>
              <Badge className={`text-[10px] ${scenario.badgeColor}`}>{scenario.badge}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{scenario.desc}</p>

            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div><p className="text-xs text-muted-foreground">Revenue</p><p className="text-lg font-bold text-foreground tabular-nums">${(scenario.revenue / 1e6).toFixed(1)}M</p></div>
              <div><p className="text-xs text-muted-foreground">Costs</p><p className="text-lg font-bold text-foreground tabular-nums">${(scenario.costs / 1e6).toFixed(1)}M</p></div>
              <div><p className="text-xs text-muted-foreground">Net</p><p className={`text-lg font-bold tabular-nums ${scenario.revenue - scenario.costs >= 0 ? "text-green-600" : "text-red-600"}`}>${((scenario.revenue - scenario.costs) / 1e6).toFixed(1)}M</p></div>
            </div>

            <p className="text-xs text-foreground mb-2"><strong>Community Impact:</strong> {scenario.communityImpact}</p>
            <p className="text-xs text-muted-foreground border-l-2 border-primary pl-2">{scenario.realExample}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comparison chart */}
      <Card>
        <CardContent className="py-4">
          <p className="text-xs font-semibold text-foreground mb-3">Financial Comparison ($ millions)</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="scenario" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}M`} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => `$${v.toFixed(1)}M`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Revenue" fill="#0A4C95" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Costs" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Income" fill="#00A3A1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground italic">
        Every hospital board faces this calculation. Game theory explains why rational actors sometimes make choices that hurt communities.
      </p>
      <p className="text-[9px] text-muted-foreground/60">Sources: CHQPR Dec 2025, Flex Monitoring Team, CMS REH Program, Sturgis Hospital, Bridge Michigan, March of Dimes 2024</p>
    </div>
  );
}
