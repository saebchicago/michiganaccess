import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SCHOOL_DISTRICTS,
  MI_AVG_GRAD_RATE,
  MI_AVG_ABSENTEEISM,
  type SchoolDistrict,
} from "@/data/school-districts";

interface SchoolDistrictCardProps {
  district?: string;
  county?: string;
}

function getGrade(gradRate: number): { letter: string; color: string } {
  if (gradRate >= 90) return { letter: "A", color: "text-green-600 dark:text-green-400" };
  if (gradRate >= 80) return { letter: "B", color: "text-blue-600 dark:text-blue-400" };
  if (gradRate >= 70) return { letter: "C", color: "text-yellow-600 dark:text-yellow-400" };
  if (gradRate >= 60) return { letter: "D", color: "text-orange-600 dark:text-orange-400" };
  return { letter: "F", color: "text-red-600 dark:text-red-400" };
}

// Hardcoded trend directions based on district performance patterns
function getTrend(d: SchoolDistrict): "up" | "down" | "flat" {
  if (d.gradRate >= 90) return "up";
  if (d.gradRate < 70) return "down";
  return "flat";
}

function TrendArrow({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function ComparisonBar({ label, value, stateAvg, inverse }: { label: string; value: number; stateAvg: number; inverse?: boolean }) {
  const better = inverse ? value < stateAvg : value > stateAvg;
  const ratio = value / stateAvg;
  const barColor = better ? "bg-green-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${better ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {value}%
        </span>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(ratio * 50, 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/40"
          style={{ left: "50%" }}
          title={`MI avg: ${stateAvg}%`}
        />
      </div>
      <p className="text-[9px] text-muted-foreground">MI avg: {stateAvg}%</p>
    </div>
  );
}

function DistrictRow({ d }: { d: SchoolDistrict }) {
  const [expanded, setExpanded] = useState(false);
  const grade = getGrade(d.gradRate);
  const trend = getTrend(d);

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      {/* Level 1: Key KPI - grade + trend visible without interaction */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between min-h-[44px]"
        aria-expanded={expanded}
      >
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">{d.district}</p>
          <p className="text-[10px] text-muted-foreground">{d.county} County</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendArrow trend={trend} />
          <span className={`text-2xl font-bold ${grade.color}`}>{grade.letter}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {!expanded && (
        <p className="text-[10px] text-muted-foreground text-center">Tap for details</p>
      )}

      {/* Level 2: Expanded comparison bars */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden space-y-3"
          >
            <ComparisonBar label="Graduation Rate" value={d.gradRate} stateAvg={MI_AVG_GRAD_RATE} />
            <ComparisonBar label="Chronic Absenteeism" value={d.absenteeism} stateAvg={MI_AVG_ABSENTEEISM} inverse />
            <p className="text-[9px] text-muted-foreground">Per-pupil spending: ${d.perPupil.toLocaleString()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SchoolDistrictCard({ district, county }: SchoolDistrictCardProps) {
  let districts: SchoolDistrict[] = [];

  if (district) {
    const match = SCHOOL_DISTRICTS.find(
      (d) => d.district.toLowerCase() === district.toLowerCase()
    );
    if (match) districts = [match];
  } else if (county) {
    districts = SCHOOL_DISTRICTS.filter(
      (d) => d.county.toLowerCase() === county.toLowerCase()
    );
  }

  if (districts.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No school district data found{district ? ` for "${district}"` : county ? ` in ${county} County` : ""}.
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-michigan-blue" />
            School District Scorecard
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[9px]">A = 90%+ grad rate</Badge>
            <Badge variant="outline" className="text-[9px]">B = 80-89%</Badge>
            <Badge variant="outline" className="text-[9px]">C = 70-79%</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {districts.map((d) => (
            <DistrictRow key={d.district} d={d} />
          ))}
          <p className="text-[9px] text-muted-foreground pt-1">
            Source:{" "}
            <a
              href="https://mischooldata.org"
              target="_blank"
              rel="noopener"
              className="text-primary hover:underline"
            >
              MI School Data (mischooldata.org)
            </a>{" "}
            2024-25
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
