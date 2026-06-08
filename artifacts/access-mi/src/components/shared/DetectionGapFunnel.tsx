import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Source: HMA March 2025 (MCO enrollment), Trinity Health reference rate,
// national SDOH screening data (NACHC, AHC model)
const FUNNEL_CURRENT = [
  { stage: "Medicaid MCO Beneficiaries", value: 1772000, pct: 100, source: "HMA March 2025" },
  { stage: "Screened for SDOH", value: 478440, pct: 27.0, source: "Trinity Health reference rate (27.4%)" },
  { stage: "Needs Identified", value: 129178, pct: 27.0, source: "National ~27% positive screen (NACHC)" },
  { stage: "Referred to Services", value: 64589, pct: 50.0, source: "National avg ~50% referral (AHC model)" },
  { stage: "Referral Completed", value: 7105, pct: 11.0, source: "National ~11% resolution (HealthAffairs)" },
  { stage: "Health Improvement Documented", value: null, pct: null, source: "No data available yet" },
];

const FUNNEL_WITH_AM = [
  { stage: "Medicaid MCO Beneficiaries", value: 1772000, pct: 100, source: "HMA March 2025" },
  { stage: "Screened for SDOH", value: 708800, pct: 40.0, source: "Projected: unified screening via Access Michigan" },
  { stage: "Needs Identified", value: 191376, pct: 27.0, source: "Same positive rate, larger screened pool" },
  { stage: "Referred to Services", value: 114826, pct: 60.0, source: "Projected: improved referral w/ CIE integration" },
  { stage: "Referral Completed", value: 39041, pct: 34.0, source: "Projected: 11% → 34% w/ closed-loop tracking" },
  { stage: "Health Improvement Documented", value: null, pct: null, source: "Future measurement framework" },
];

const STAGE_COLORS = ["#0A4C95", "#0E6B8A", "#00796F", "#2D5F3F", "#b91c1c", "#4b5563"];

interface DetectionGapFunnelProps {
  variant?: "full" | "compact";
}

export default function DetectionGapFunnel({ variant = "full" }: DetectionGapFunnelProps) {
  const [mode, setMode] = useState<"current" | "projected">("current");
  const data = mode === "current" ? FUNNEL_CURRENT : FUNNEL_WITH_AM;
  const maxVal = data[0].value ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">The Detection Gap</h3>
            <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-wider text-muted-foreground border-border">Modeled Estimate</Badge>
          </div>
          <p className="text-xs text-muted-foreground">From 1.77M beneficiaries to documented outcomes - where the system loses people</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Method: Michigan MCO enrollment (1.77M) × national benchmark rates (NACHC, AHC Model). Not measured MI outcomes.{" "}
            <Link to="/methodology#sdoh-funnel" className="underline hover:text-foreground">Methodology →</Link>
          </p>
        </div>
        {variant === "full" && (
          <div className="flex gap-1">
            <button onClick={() => setMode("current")}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all ${mode === "current" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
              Current State
            </button>
            <button onClick={() => setMode("projected")}
              className={`text-[10px] px-3 py-1 rounded-full border transition-all ${mode === "projected" ? "bg-michigan-teal text-white border-michigan-teal" : "border-border text-muted-foreground"}`}>
              With Access Michigan
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {data.map((stage, i) => {
          const barWidth = stage.value ? Math.max(8, (stage.value / maxVal) * 100) : 5;
          const dropoff = i > 0 && data[i - 1].value && stage.value
            ? ((1 - stage.value / (data[i - 1].value ?? 1)) * 100).toFixed(0)
            : null;

          return (
            <motion.div key={stage.stage} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }} className="group relative">
              <div className="flex items-center gap-3">
                <div className="w-28 sm:w-36 shrink-0 text-right">
                  <p className="text-xs font-medium text-foreground leading-tight">{stage.stage}</p>
                </div>
                <div className="flex-1">
                  <div className="relative h-8 bg-muted rounded overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="h-full rounded flex items-center px-2"
                      style={{ backgroundColor: STAGE_COLORS[i] ?? "#6b7280" }}>
                      <span className="text-[10px] font-bold text-white whitespace-nowrap">
                        {stage.value ? stage.value.toLocaleString() : "?"}
                      </span>
                    </motion.div>
                  </div>
                </div>
                <div className="w-16 shrink-0 text-right">
                  {stage.pct != null ? (
                    <span className="text-xs font-semibold tabular-nums text-foreground">{stage.pct}%</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </div>
              {dropoff && Number(dropoff) > 20 && (
                <div className="ml-28 sm:ml-36 pl-3 mt-0.5">
                  <span className="text-[10px] text-red-700 font-semibold">{"\u2193"} {dropoff}% drop-off</span>
                </div>
              )}
              {/* Tooltip on hover */}
              <div className="hidden group-hover:block absolute left-28 sm:left-36 top-full z-10 mt-1 p-2 rounded-lg bg-popover border border-border shadow-lg text-[10px] text-muted-foreground max-w-xs">
                {stage.source}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[9px] text-muted-foreground/60">
        Sources: HMA March 2025 (MCO enrollment), Trinity Health FY2025 (screening reference), NACHC (positive rate), AHC Model (referral rate), Health Affairs 2023 (resolution rate).
        {mode === "projected" && " Projected improvements are illustrative platform targets, not achieved outcomes."}
      </p>
    </div>
  );
}
