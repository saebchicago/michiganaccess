import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { computeCompoundDeficit } from "@/utils/compoundDeficit";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { toast } from "sonner";

const COUNTIES = Object.keys(COUNTY_PROFILES).sort();

function getMetrics(county: string) {
  const p = COUNTY_PROFILES[county];
  if (!p) return null;
  const h = p.healthHighlights;
  const uninsured = parseFloat(h[0]?.value || "0");
  const food = parseFloat(h[2]?.value || "0");
  const pcr = h[1]?.value || "-";
  // Civic score is the inverse of the shared CADI so this widget agrees
  // with the Health Equity Atlas. Higher = better; lower = more access
  // barriers compound.
  const compound = computeCompoundDeficit(p).compound;
  const civicScore = Math.max(0, Math.min(100, Math.round(100 - compound)));
  return { uninsured, food, pcr, civicScore, population: p.population };
}

interface MetricBarProps {
  label: string;
  valueA: number;
  valueB: number;
  suffix: string;
  colorA: string;
  colorB: string;
  max: number;
}
function MetricBar({
  label,
  valueA,
  valueB,
  suffix,
  colorA,
  colorB,
  max,
}: MetricBarProps) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <div className="flex gap-1.5 items-center">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(valueA / max) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-5 rounded-r ${colorA} flex items-center px-1.5`}
        >
          <span className="text-[9px] font-bold text-white whitespace-nowrap">
            {valueA}
            {suffix}
          </span>
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(valueB / max) * 100}%` }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className={`h-5 rounded-r ${colorB} flex items-center px-1.5`}
        >
          <span className="text-[9px] font-bold text-white whitespace-nowrap">
            {valueB}
            {suffix}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default function QuickCompare() {
  const [countyA, setCountyA] = useState("");
  const [countyB, setCountyB] = useState("");

  const metricsA = useMemo(
    () => (countyA ? getMetrics(countyA) : null),
    [countyA],
  );
  const metricsB = useMemo(
    () => (countyB ? getMetrics(countyB) : null),
    [countyB],
  );
  const ready = metricsA && metricsB;

  const handleShare = () => {
    const url = `https://accessmi.org/compare?a=${countyA}&b=${countyB}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Comparison link copied"));
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          How does your county compare?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select value={countyA} onValueChange={setCountyA}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="County A" />
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={countyB} onValueChange={setCountyB}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="County B" />
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Popular comparisons */}
        {!ready && (
          <div className="flex flex-wrap gap-1.5">
            {[
              ["Wayne", "Oakland"],
              ["Kent", "Ottawa"],
              ["Ingham", "Washtenaw"],
            ].map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                onClick={() => {
                  setCountyA(a);
                  setCountyB(b);
                }}
                className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              >
                {a} vs {b}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {ready && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-primary" /> {countyA}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-michigan-teal" />{" "}
                  {countyB}
                </span>
              </div>

              {/* Score circles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center rounded-lg border border-border p-3">
                  <AnimatedCounter
                    value={metricsA!.civicScore}
                    suffix="/100"
                    className="text-2xl font-bold text-primary"
                  />
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    Civic Score
                  </p>
                </div>
                <div className="text-center rounded-lg border border-border p-3">
                  <AnimatedCounter
                    value={metricsB!.civicScore}
                    suffix="/100"
                    className="text-2xl font-bold text-michigan-teal-deep"
                  />
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    Civic Score
                  </p>
                </div>
              </div>

              {/* Metric bars */}
              <MetricBar
                label="Uninsured Rate"
                valueA={metricsA!.uninsured}
                valueB={metricsB!.uninsured}
                suffix="%"
                colorA="bg-primary"
                colorB="bg-michigan-teal"
                max={15}
              />
              <MetricBar
                label="Food Insecurity"
                valueA={metricsA!.food}
                valueB={metricsB!.food}
                suffix="%"
                colorA="bg-primary"
                colorB="bg-michigan-teal"
                max={25}
              />

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1"
                  asChild
                >
                  <Link to={`/compare?a=${countyA}&b=${countyB}`}>
                    Full Comparison <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-3 w-3" /> Share
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
