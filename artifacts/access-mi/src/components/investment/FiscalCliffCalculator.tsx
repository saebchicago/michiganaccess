// src/components/investment/FiscalCliffCalculator.tsx
// Interactive simulator: what happens when federal funding is cut
// Source: USASpending.gov FY2024 estimates

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Users, DollarSign } from "lucide-react";
import { MICHIGAN_FEDERAL_SPENDING } from "@/data/federalSpending";

// Program-specific dependency percentages by county
// Source: Illustrative composite from USASpending.gov FY2024
const PROGRAM_DEPENDENCY: Record<
  string,
  {
    medicaid_pct: number;
    snap_pct: number;
    housing_pct: number;
    health_grants_pct: number;
  }
> = {
  Wayne: {
    medicaid_pct: 44,
    snap_pct: 8,
    housing_pct: 9,
    health_grants_pct: 18,
  },
  Genesee: {
    medicaid_pct: 47,
    snap_pct: 16,
    housing_pct: 12,
    health_grants_pct: 8,
  },
  Saginaw: {
    medicaid_pct: 44,
    snap_pct: 16,
    housing_pct: 13,
    health_grants_pct: 9,
  },
  Oakland: {
    medicaid_pct: 34,
    snap_pct: 6,
    housing_pct: 10,
    health_grants_pct: 18,
  },
  Macomb: {
    medicaid_pct: 39,
    snap_pct: 8,
    housing_pct: 11,
    health_grants_pct: 15,
  },
  Kent: {
    medicaid_pct: 39,
    snap_pct: 9,
    housing_pct: 12,
    health_grants_pct: 14,
  },
  Washtenaw: {
    medicaid_pct: 28,
    snap_pct: 6,
    housing_pct: 12,
    health_grants_pct: 25,
  },
  Ingham: {
    medicaid_pct: 31,
    snap_pct: 5,
    housing_pct: 8,
    health_grants_pct: 34,
  },
  Kalamazoo: {
    medicaid_pct: 39,
    snap_pct: 10,
    housing_pct: 13,
    health_grants_pct: 15,
  },
};

// Medicaid enrollees estimate by county (Michigan MDHHS 2024)
const MEDICAID_ENROLLEES: Record<string, number> = {
  Wayne: 580000,
  Genesee: 142000,
  Oakland: 128000,
  Macomb: 98000,
  Kent: 104000,
  Saginaw: 68000,
  Ingham: 74000,
  Kalamazoo: 58000,
  Washtenaw: 44000,
  Muskegon: 42000,
};

type Severity = "critical" | "high" | "moderate";
type ProgramKey = "medicaid" | "snap" | "housing" | "all";

const SEVERITY_COLORS: Record<Severity, string> = {
  critical:
    "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/40",
  high: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/40",
  moderate:
    "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/40",
};

export default function FiscalCliffCalculator() {
  const [cutPct, setCutPct] = useState(10);
  const [program, setProgram] = useState<ProgramKey>("medicaid");

  const impacts = useMemo(() => {
    return MICHIGAN_FEDERAL_SPENDING.map((county) => {
      const dep = PROGRAM_DEPENDENCY[county.county];
      if (!dep) return null;

      let dollarImpact = 0;
      let residentsAffected = 0;

      if (program === "medicaid" || program === "all") {
        const medicaidDollars =
          county.total_awards_millions * (dep.medicaid_pct / 100);
        dollarImpact += medicaidDollars * (cutPct / 100);
        const enrollees = MEDICAID_ENROLLEES[county.county] ?? 0;
        residentsAffected += Math.round(enrollees * (cutPct / 100) * 0.3);
      }
      if (program === "snap" || program === "all") {
        const snapDollars = county.total_awards_millions * (dep.snap_pct / 100);
        dollarImpact += snapDollars * (cutPct / 100);
        residentsAffected += Math.round(
          (county.snap_millions * (cutPct / 100) * 1000000) / 1200,
        );
      }
      if (program === "housing" || program === "all") {
        const housingDollars =
          county.total_awards_millions * (dep.housing_pct / 100);
        dollarImpact += housingDollars * (cutPct / 100);
      }

      const severity: Severity =
        dollarImpact > 200
          ? "critical"
          : dollarImpact > 50
            ? "high"
            : "moderate";

      return {
        county: county.county,
        dollarImpactM: dollarImpact,
        residentsAffected,
        severity,
      };
    })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.dollarImpactM - a.dollarImpactM);
  }, [cutPct, program]);

  const totalImpactM = impacts.reduce((s, i) => s + i.dollarImpactM, 0);
  const totalResidents = impacts.reduce((s, i) => s + i.residentsAffected, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-foreground text-sm">
              Fiscal Cliff Calculator
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulate the impact of federal funding reductions on Michigan
              counties. Based on USASpending.gov FY2024 data. Dollar impacts are
              modeled estimates - actual effects depend on program structure and
              state matching requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Cut percentage slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Federal Funding Reduction
            </label>
            <motion.span
              key={cutPct}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold tabular-nums text-foreground"
            >
              {cutPct}%
            </motion.span>
          </div>
          <Slider
            value={[cutPct]}
            onValueChange={([v]) => setCutPct(v)}
            min={5}
            max={50}
            step={5}
            className="w-full"
            aria-label="Federal funding reduction percentage"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5% (modest)</span>
            <span>25% (severe)</span>
            <span>50% (catastrophic)</span>
          </div>
        </div>

        {/* Program selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">
            Program to Cut
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "medicaid" as const, label: "Medicaid" },
              { key: "snap" as const, label: "SNAP / Food" },
              { key: "housing" as const, label: "Housing" },
              { key: "all" as const, label: "All Programs" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setProgram(p.key)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  program === p.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary impact cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${cutPct}-${program}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/40 p-4">
            <DollarSign className="h-4 w-4 text-red-600 mb-1" />
            <p className="text-2xl font-bold text-red-700 dark:text-red-400 tabular-nums">
              -${totalImpactM.toFixed(0)}M
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              Estimated funding loss across Michigan
            </p>
            <p className="text-[9px] text-red-500/70 mt-1">
              Illustrative estimate - USASpending.gov FY2024
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900/40 p-4">
            <Users className="h-4 w-4 text-orange-600 mb-1" />
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400 tabular-nums">
              {totalResidents.toLocaleString()}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Estimated residents affected
            </p>
            <p className="text-[9px] text-orange-500/70 mt-1">
              Illustrative estimate
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/40 p-4">
            <TrendingDown className="h-4 w-4 text-amber-600 mb-1" />
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
              {impacts.filter((i) => i.severity === "critical").length} counties
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Face "critical" impact level
            </p>
            <p className="text-[9px] text-amber-500/70 mt-1">
              &gt;$200M estimated loss
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* County impact table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/50 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            County-Level Impact Breakdown
          </p>
        </div>
        <div className="divide-y divide-border">
          {impacts.slice(0, 8).map((impact) => {
            const barWidth = Math.min(
              100,
              (impact.dollarImpactM / (impacts[0]?.dollarImpactM ?? 1)) * 100,
            );
            return (
              <motion.div
                key={impact.county}
                layout
                className="px-4 py-3 flex items-center gap-4"
              >
                <div className="w-24 shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    {impact.county}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        impact.severity === "critical"
                          ? "bg-red-500"
                          : impact.severity === "high"
                            ? "bg-orange-500"
                            : "bg-amber-400"
                      }`}
                    />
                  </div>
                </div>
                <div className="w-24 text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    -${impact.dollarImpactM.toFixed(0)}M
                  </p>
                </div>
                <div className="w-20 shrink-0">
                  <Badge
                    className={`text-[10px] border ${SEVERITY_COLORS[impact.severity]}`}
                  >
                    {impact.severity}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <p className="text-[9px] text-muted-foreground/60">
        All figures are modeled estimates based on USASpending.gov FY2024
        county-level award data. Actual program impacts depend on program
        structure, state matching requirements, and federal rulemaking. Not
        financial or policy advice.
      </p>
    </div>
  );
}
