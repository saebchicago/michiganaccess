import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { computeHealthScore } from "@/lib/health-score";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { PlacesMeasure } from "@/lib/places-client";

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

interface Props {
  zipCode: string;
  data: PlacesMeasure[];
}

export default function NeighborhoodHealthScore({ zipCode, data }: Props) {
  const dataMap = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((d) => { m[d.short_question_text] = d.data_value; });
    return m;
  }, [data]);

  const result = useMemo(() => computeHealthScore(dataMap), [dataMap]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Neighborhood Health Score</p>
            <p className="text-sm text-foreground font-medium">ZIP {zipCode}</p>
          </div>

          <ScoreGauge score={result.score} color={result.color} />

          <Badge style={{ backgroundColor: result.color, color: result.score >= 50 ? "#000" : "#fff" }} className="text-lg px-4 py-1">
            Grade: {result.grade}
          </Badge>

          <div className="grid grid-cols-2 gap-4 text-left">
            {result.strengths.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-michigan-forest flex items-center gap-1 mb-1">
                  <CheckCircle2 className="h-3 w-3" /> Strengths
                </p>
                {result.strengths.map((s) => (
                  <Badge key={s} variant="outline" className="text-[9px] mr-1 mb-1 border-michigan-forest/30 text-michigan-forest">{s}</Badge>
                ))}
              </div>
            )}
            {result.concerns.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-michigan-coral flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3" /> Concerns
                </p>
                {result.concerns.map((c) => (
                  <Badge key={c} variant="outline" className="text-[9px] mr-1 mb-1 border-michigan-coral/30 text-michigan-coral">{c}</Badge>
                ))}
              </div>
            )}
          </div>

          <details className="text-left">
            <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-primary flex items-center gap-1">
              <Info className="h-3 w-3" /> How is this calculated?
            </summary>
            <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
              Composite of 12 CDC PLACES measures weighted by health impact. Each measure scores 0-100 based on distance from Michigan state average. This is an illustrative composite, not a clinical assessment. Source: CDC PLACES 2024, BRFSS 2022.
            </p>
          </details>

          <button onClick={() => document.getElementById("zip-builder")?.scrollIntoView({ behavior: "smooth" })} className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
            <ArrowDown className="h-3 w-3" /> Explore the full data
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
