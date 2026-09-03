import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  getALICEByCounty,
  ALICE_SURVIVAL_BUDGETS,
  MICHIGAN_ALICE_STATEWIDE,
} from "@/data/aliceData";

const COUNTIES = [
  "Wayne",
  "Oakland",
  "Macomb",
  "Kent",
  "Genesee",
  "Washtenaw",
  "Ingham",
  "Kalamazoo",
  "Saginaw",
];

type HouseholdType = "single" | "single_parent_1" | "couple_2";
const HOUSEHOLD_LABELS: Record<HouseholdType, string> = {
  single: "Single adult",
  single_parent_1: "Single parent + 1 child",
  couple_2: "Couple + 2 children",
};

// Source: United Way ALICE Methodology 2025 + BLS OES Michigan 2024
const BUDGET_PROFILES: Record<
  HouseholdType,
  {
    housing: number;
    childcare: number;
    food: number;
    transport: number;
    healthcare: number;
    tech: number;
    taxes: number;
  }
> = {
  single: {
    housing: 950,
    childcare: 0,
    food: 350,
    transport: 450,
    healthcare: 300,
    tech: 75,
    taxes: 280,
  },
  single_parent_1: {
    housing: 1100,
    childcare: 1100,
    food: 600,
    transport: 500,
    healthcare: 400,
    tech: 75,
    taxes: 320,
  },
  couple_2: {
    housing: 1240,
    childcare: 2200,
    food: 1000,
    transport: 680,
    healthcare: 500,
    tech: 85,
    taxes: 480,
  },
};

export default function ALICESurvivalBudget() {
  const [county, setCounty] = useState("Wayne");
  const [household, setHousehold] = useState<HouseholdType>("single");

  const alice = getALICEByCounty(county);
  const budget = BUDGET_PROFILES[household];
  const totalBudget = Object.values(budget).reduce((s, v) => s + v, 0);

  // No county median-income series ships with this app, and the ALICE
  // Threshold is an income *requirement*, not household earnings - deriving a
  // "median income" from it produced a false monthly surplus. Compare the
  // modeled budget against the official ALICE Threshold instead.
  const annualNeeded = totalBudget * 12;
  // Official under-65 ALICE income threshold for the county (United For ALICE).
  const officialThreshold = alice?.aliceThreshold_family4 || null;
  const hardshipPct =
    alice?.combinedHardshipPct ??
    MICHIGAN_ALICE_STATEWIDE.combinedHardshipPct;


  const chartData = [
    { category: "Housing", cost: budget.housing, fill: "#0A4C95" },
    { category: "Childcare", cost: budget.childcare, fill: "#00A3A1" },
    { category: "Food", cost: budget.food, fill: "#2D5F3F" },
    { category: "Transport", cost: budget.transport, fill: "#f59e0b" },
    { category: "Healthcare", cost: budget.healthcare, fill: "#ef4444" },
    { category: "Tech", cost: budget.tech, fill: "#8b5cf6" },
    { category: "Taxes", cost: budget.taxes, fill: "#6b7280" },
  ].filter((d) => d.cost > 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            County
          </label>
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Household Type
          </label>
          <Select
            value={household}
            onValueChange={(v) => setHousehold(v as HouseholdType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(HOUSEHOLD_LABELS) as [HouseholdType, string][]
              ).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Budget chart */}
      <Card>
        <CardContent className="py-4">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={70}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(v: number) => `$${v.toLocaleString()}/mo`}
                />
                <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                  {chartData.map((e) => (
                    <Bar key={e.category} dataKey="cost" fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={`${county}-${household}`}
      >
        <Card className="border-2 border-border">
          <CardContent className="py-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Survival Budget</p>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  ${totalBudget.toLocaleString()}/mo
                </p>
                <p className="text-[10px] text-muted-foreground">MODELED</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Income needed / yr
                </p>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  ${annualNeeded.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {officialThreshold
                    ? `ALICE Threshold (under 65): $${officialThreshold.toLocaleString()}`
                    : "ALICE Threshold unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Below ALICE Threshold
                </p>
                <p className="text-xl font-bold text-amber-600 tabular-nums">
                  {hardshipPct}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  of {county} households
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-foreground font-medium mb-1">
                Programs that reduce this budget:
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  SNAP: ~$
                  {household === "single"
                    ? 234
                    : household === "single_parent_1"
                      ? 468
                      : 939}
                  /mo in food benefits
                </p>
                <p>
                  Medicaid: ~$
                  {household === "single"
                    ? 600
                    : household === "single_parent_1"
                      ? 1200
                      : 2400}
                  /mo healthcare value
                </p>
                <p>LIHEAP: ~$83/mo energy assistance</p>
                {budget.childcare > 0 && (
                  <p>
                    Childcare subsidy: up to $
                    {Math.round(budget.childcare * 0.8)}/mo
                  </p>
                )}
              </div>
            </div>

            <p className="text-[9px] text-muted-foreground mt-3">
              Budget is modeled (United Way ALICE Methodology 2025 + BLS OES
              Michigan 2024); actual costs vary by location. Threshold and
              hardship share: United For ALICE Michigan Data Sheet 2026 (data
              year 2024). No county household-income series is published here,
              so this tool does not estimate earnings.
            </p>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
