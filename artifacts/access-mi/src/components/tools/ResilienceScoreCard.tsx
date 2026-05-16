import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { computeResilienceScore } from "@/lib/resilience-score";
import { getResilienceInput } from "@/data/county-resilience";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const TIER_COLORS: Record<string, string> = {
  "Tier 1 — Strong": "#22c55e",
  "Tier 2 — Moderate": "#3b82f6",
  "Tier 3 — Limited": "#eab308",
  "Tier 4 — Priority": "#f97316",
  "Tier 5 — Critical": "#ef4444",
};

const DIM_LABELS: Record<string, string> = {
  disaster: "Disaster Preparedness",
  economic: "Economic Capacity",
  health: "Health Infrastructure",
  safetyNet: "Social Safety Net",
  digital: "Digital Connectivity",
};

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(214, 20%, 90%)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter value={score} className="text-3xl font-bold text-foreground" duration={1.5} />
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, value }: { label: string; value: number }) {
  const barColor = value >= 70 ? "#22c55e" : value >= 50 ? "#3b82f6" : value >= 40 ? "#eab308" : "#ef4444";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

interface Props {
  county: string;
}

export default function ResilienceScoreCard({ county }: Props) {
  const [methodOpen, setMethodOpen] = useState(false);

  const input = useMemo(() => getResilienceInput(county), [county]);
  const result = useMemo(() => (input ? computeResilienceScore(input) : null), [input]);

  if (!input || !result) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Resilience data not available for <strong>{county}</strong> County.
          </p>
        </CardContent>
      </Card>
    );
  }

  const gradeColor = TIER_COLORS[result.grade] || "#6b7280";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/20">
        <CardContent className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Community Resilience Score
            </p>
            <p className="text-sm text-foreground font-medium">{county} County</p>
          </div>

          {/* Gauge + Grade — stack on mobile */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <ScoreGauge score={result.score} color={gradeColor} />
            <Badge
              style={{ backgroundColor: gradeColor, color: result.grade.includes("Limited") ? "#000" : "#fff" }}
              className="text-sm px-4 py-2 font-semibold"
            >
              {result.grade}
            </Badge>
          </div>

          {/* Dimension bars */}
          <div className="space-y-3">
            {(Object.entries(result.dimensions) as [string, number][]).map(([key, value]) => (
              <DimensionBar key={key} label={DIM_LABELS[key] || key} value={value} />
            ))}
          </div>

          {/* Strengths & Vulnerabilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {result.strengths.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-michigan-forest flex items-center gap-1 mb-1">
                  <CheckCircle2 className="h-3 w-3" /> Strengths
                </p>
                {result.strengths.map((s) => (
                  <Badge key={s} variant="outline" className="text-[9px] mr-1 mb-1 border-michigan-forest/30 text-michigan-forest">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            {result.vulnerabilities.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-michigan-coral flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3" /> Vulnerabilities
                </p>
                {result.vulnerabilities.map((v) => (
                  <Badge key={v} variant="outline" className="text-[9px] mr-1 mb-1 border-michigan-coral/30 text-michigan-coral">
                    {v}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Methodology expander */}
          <div className="text-left">
            <button
              onClick={() => setMethodOpen(!methodOpen)}
              className="text-[10px] text-muted-foreground cursor-pointer hover:text-primary flex items-center gap-1"
            >
              <Info className="h-3 w-3" />
              Methodology
              <ChevronDown className={`h-3 w-3 transition-transform ${methodOpen ? "rotate-180" : ""}`} />
            </button>
            {methodOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
                  The Community Resilience Score is a weighted composite of five dimensions:
                  Disaster Preparedness (25%) — based on historical disaster declaration frequency;
                  Economic Capacity (25%) — SBA lending per capita + median household income;
                  Health Infrastructure (20%) — county health ranking score;
                  Social Safety Net (15%) — inverse of ALICE threshold rate;
                  Digital Connectivity (15%) — broadband adoption percentage.
                  Each dimension scores 0-100, then weighted to produce the final score.
                </p>
                <p className="text-[9px] text-muted-foreground mt-1 italic">
                  Illustrative composite index. Not a validated resilience measure.
                </p>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
