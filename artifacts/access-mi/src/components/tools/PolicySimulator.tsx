import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Info, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MI_POPULATION = 10_037_261;

interface PolicyScenario {
  id: string;
  label: string;
  description: string;
  currentCoverage: number; // 0-100
  maxTarget: number;
  costPerPerson: number; // illustrative annual cost
  sourceNote: string;
  regionalSplit: { label: string; pct: number }[];
}

const SCENARIOS: PolicyScenario[] = [
  {
    id: "medicaid-hrsn",
    label: "Medicaid HRSN Benefits",
    description: "Michigan uses a multi-authority approach (SPA for CHW, 1915(b) ILOS for nutrition, MCO contracts for SDOH, CIE framework) to cover housing, nutrition, and transportation services for enrollees with identified social needs. Healthy Michigan Plan 1115 renewed with HRSN authority Jan 2025.",
    currentCoverage: 12,
    maxTarget: 80,
    costPerPerson: 2400,
    sourceNote: "Michigan multi-authority HRSN approach. Comparison: NC ($85/PMPM savings, JAMA), MA (23% hospitalization reduction, Health Affairs), OR ($1.1B spending authority). First MI monitoring report due March 30, 2026.",
    regionalSplit: [
      { label: "Southeast MI", pct: 42 },
      { label: "West MI", pct: 22 },
      { label: "Mid-Michigan", pct: 18 },
      { label: "Northern MI", pct: 12 },
      { label: "Upper Peninsula", pct: 6 },
    ],
  },
  {
    id: "211-funding",
    label: "Michigan 211 Funding Expansion",
    description: "Increased state and federal investment in 211 navigation infrastructure to reduce wait times and expand service hours.",
    currentCoverage: 35,
    maxTarget: 95,
    costPerPerson: 85,
    sourceNote: "United Way 211 network reports. Per-contact cost modeled from national 211 operational data.",
    regionalSplit: [
      { label: "Southeast MI", pct: 38 },
      { label: "West MI", pct: 24 },
      { label: "Mid-Michigan", pct: 18 },
      { label: "Northern MI", pct: 13 },
      { label: "Upper Peninsula", pct: 7 },
    ],
  },
  {
    id: "fqhc-expansion",
    label: "FQHC Expansion",
    description: "New Federally Qualified Health Center sites in underserved areas, bringing integrated primary care and social services to high-need communities.",
    currentCoverage: 22,
    maxTarget: 60,
    costPerPerson: 1800,
    sourceNote: "HRSA FQHC program data. Cost per new patient modeled from UDS averages.",
    regionalSplit: [
      { label: "Southeast MI", pct: 35 },
      { label: "West MI", pct: 20 },
      { label: "Mid-Michigan", pct: 20 },
      { label: "Northern MI", pct: 15 },
      { label: "Upper Peninsula", pct: 10 },
    ],
  },
  {
    id: "chw-reimbursement",
    label: "CHW Reimbursement",
    description: "Medicaid reimbursement for community health worker services, expanding the CHW workforce for SDOH navigation.",
    currentCoverage: 8,
    maxTarget: 50,
    costPerPerson: 1200,
    sourceNote: "MN, OR CHW reimbursement models. Cost per beneficiary modeled from published evaluations.",
    regionalSplit: [
      { label: "Southeast MI", pct: 40 },
      { label: "West MI", pct: 22 },
      { label: "Mid-Michigan", pct: 17 },
      { label: "Northern MI", pct: 13 },
      { label: "Upper Peninsula", pct: 8 },
    ],
  },
  {
    id: "energy-assistance",
    label: "Energy Assistance Expansion",
    description: "Increased LIHEAP and state energy assistance funding targeting households with energy burden above 6% of income.",
    currentCoverage: 28,
    maxTarget: 75,
    costPerPerson: 650,
    sourceNote: "MI DHHS LIHEAP reports. Per-household benefit modeled from ACEEE/LIHEAP data.",
    regionalSplit: [
      { label: "Southeast MI", pct: 32 },
      { label: "West MI", pct: 20 },
      { label: "Mid-Michigan", pct: 20 },
      { label: "Northern MI", pct: 16 },
      { label: "Upper Peninsula", pct: 12 },
    ],
  },
];

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(Math.round(n));
const fmtDollar = (n: number) =>
  n >= 1_000_000_000 ? `$${(n / 1_000_000_000).toFixed(1)}B` : n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(0)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${Math.round(n)}`;

export default function PolicySimulator() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [targetCoverage, setTargetCoverage] = useState([SCENARIOS[0].currentCoverage + 20]);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const handleScenarioChange = (id: string) => {
    setScenarioId(id);
    const s = SCENARIOS.find((sc) => sc.id === id)!;
    setTargetCoverage([Math.min(s.currentCoverage + 20, s.maxTarget)]);
  };

  const impact = useMemo(() => {
    const gapPct = Math.max(0, targetCoverage[0] - scenario.currentCoverage) / 100;
    const newlyCovered = Math.round(MI_POPULATION * gapPct);
    const annualCost = newlyCovered * scenario.costPerPerson;
    const regional = scenario.regionalSplit.map((r) => ({
      ...r,
      count: Math.round(newlyCovered * (r.pct / 100)),
    }));
    return { newlyCovered, annualCost, regional, gapPct };
  }, [targetCoverage, scenario]);

  return (
    <Card className="border-michigan-teal/20">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-michigan-teal-deep" />
              Policy Impact Simulator
              <Badge variant="outline" className="text-[10px]">Illustrative</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Model the reach and cost of social infrastructure policies across Michigan.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold">Policy Scenario</label>
          <Select value={scenarioId} onValueChange={handleScenarioChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCENARIOS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{scenario.description}</p>
        </div>

        {/* Coverage Slider */}
        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Target Coverage</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">
                Current: {scenario.currentCoverage}%
              </span>
              <span className="text-sm font-bold text-primary tabular-nums">
                {targetCoverage[0]}%
              </span>
            </div>
          </div>
          <Slider
            value={targetCoverage}
            onValueChange={setTargetCoverage}
            min={scenario.currentCoverage}
            max={scenario.maxTarget}
            step={1}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{scenario.currentCoverage}% (current)</span>
            <span>{scenario.maxTarget}% (max target)</span>
          </div>
        </div>

        {/* Impact Cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <motion.div
            key={`${scenarioId}-covered-${targetCoverage[0]}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center"
          >
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{fmt(impact.newlyCovered)}</p>
            <p className="text-[10px] text-muted-foreground">newly covered residents</p>
          </motion.div>
          <motion.div
            key={`${scenarioId}-cost-${targetCoverage[0]}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl bg-michigan-teal/10 border border-michigan-teal/20 p-4 text-center"
          >
            <p className="text-2xl font-bold text-michigan-teal-deep">{fmtDollar(impact.annualCost)}</p>
            <p className="text-[10px] text-muted-foreground">est. annual investment</p>
            <p className="text-[9px] text-muted-foreground italic">Illustrative</p>
          </motion.div>
          <motion.div
            key={`${scenarioId}-gap-${targetCoverage[0]}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-michigan-gold/10 border border-michigan-gold/20 p-4 text-center"
          >
            <p className="text-2xl font-bold text-michigan-gold-deep">
              +{(impact.gapPct * 100).toFixed(0)}pp
            </p>
            <p className="text-[10px] text-muted-foreground">coverage increase</p>
          </motion.div>
        </div>

        {/* Regional Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold">Regional Breakdown</h4>
          {impact.regional.map((r) => (
            <div key={r.label} className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground w-28 shrink-0">{r.label}</span>
              <div className="flex-1 h-3 bg-muted rounded overflow-hidden">
                <motion.div
                  className="h-full rounded bg-michigan-teal/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${r.pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground w-14 text-right tabular-nums">
                {fmt(r.count)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-[10px] text-muted-foreground leading-relaxed space-y-1">
            <p>
              <strong>Illustrative projection.</strong> All outputs are modeled estimates for exploratory purposes only.
              They do not represent official cost projections or policy commitments.
            </p>
            <p className="italic">{scenario.sourceNote}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
