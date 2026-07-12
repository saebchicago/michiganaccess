import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Metric {
  label: string;
  localValue: number;
  stateAvg: number;
  benchmark: number;
  unit: string;
  lowerIsBetter?: boolean;
}

// Source: MDHHS Medicaid Managed Care benchmarks, SFY 2026 targets, modeled estimates
const MEDICAID_BENCHMARKS: Metric[] = [
  { label: "Uninsured Rate", localValue: 6.8, stateAvg: 5.9, benchmark: 5.0, unit: "%", lowerIsBetter: true },
  { label: "Primary Care Access", localValue: 78, stateAvg: 82, benchmark: 85, unit: "%", lowerIsBetter: false },
  { label: "ED Visit Rate (per 1K)", localValue: 482, stateAvg: 445, benchmark: 400, unit: "/1K", lowerIsBetter: true },
  { label: "Preventive Screening", localValue: 71, stateAvg: 74, benchmark: 80, unit: "%", lowerIsBetter: false },
  { label: "30-Day Readmission", localValue: 14.2, stateAvg: 13.8, benchmark: 12.0, unit: "%", lowerIsBetter: true },
  { label: "Behavioral Health Follow-Up", localValue: 62, stateAvg: 66, benchmark: 72, unit: "%", lowerIsBetter: false },
];

function getTrend(local: number, benchmark: number, lowerIsBetter: boolean) {
  const diff = lowerIsBetter ? benchmark - local : local - benchmark;
  if (diff >= 0) return { icon: TrendingUp, color: "text-michigan-forest-deep", label: "Meeting" };
  if (Math.abs(diff) < (benchmark * 0.1)) return { icon: Minus, color: "text-michigan-gold-deep", label: "Near" };
  return { icon: TrendingDown, color: "text-michigan-coral-deep", label: "Below" };
}

export default function RegionalMetricCard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">SFY 2026 Medicaid Managed Care Benchmarks</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Comparing local health outcomes against Michigan state averages and SFY 2026 targets.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {MEDICAID_BENCHMARKS.map((m, i) => {
          const trend = getTrend(m.localValue, m.benchmark, !!m.lowerIsBetter);
          const TrendIcon = trend.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full">
                <CardContent className="py-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-semibold text-foreground">{m.label}</p>
                    <Badge variant="outline" className={`text-[9px] ${trend.color}`}>
                      <TrendIcon className="mr-0.5 h-2.5 w-2.5" />{trend.label}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">{m.localValue}</span>
                    <span className="text-xs text-muted-foreground">{m.unit}</span>
                  </div>
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-muted-foreground">State: <strong className="text-foreground">{m.stateAvg}{m.unit}</strong></span>
                    <span className="text-muted-foreground">Target: <strong className="text-primary">{m.benchmark}{m.unit}</strong></span>
                  </div>
                  {/* Mini bar */}
                  <div className="relative h-1.5 rounded-full bg-muted">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-primary/60"
                      style={{ width: `${Math.min(100, (m.localValue / m.benchmark) * 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-michigan-coral"
                      style={{ left: `${Math.min(100, (m.stateAvg / m.benchmark) * 100)}%` }}
                      title="State average"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Source: MDHHS Medicaid Managed Care benchmarks · SFY 2026 targets · Modeled estimates
      </p>
    </div>
  );
}
