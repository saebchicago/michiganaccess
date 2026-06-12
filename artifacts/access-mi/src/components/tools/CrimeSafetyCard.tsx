import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTY_CRIME, MI_AVG_VIOLENT, MI_AVG_PROPERTY } from "@/data/crime-data";

interface CrimeSafetyCardProps {
  county: string;
}

function RateBar({ label, value, stateAvg }: { label: string; value: number; stateAvg: number }) {
  const ratio = value / stateAvg;
  const belowAvg = value <= stateAvg;
  const barColor = belowAvg ? "bg-green-500" : "bg-red-500";
  const barWidth = Math.min(ratio * 100, 200); // cap at 200%

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${belowAvg ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {value.toLocaleString()} per 100K
        </span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(barWidth, 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        {/* State average marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/40"
          style={{ left: `${Math.min((stateAvg / (Math.max(value, stateAvg) * 1.1)) * 100, 100)}%` }}
          title={`MI avg: ${stateAvg}`}
        />
      </div>
      <p className="text-[9px] text-muted-foreground">
        MI avg: {stateAvg.toLocaleString()} &mdash; {belowAvg ? `${Math.round((1 - ratio) * 100)}% below` : `${Math.round((ratio - 1) * 100)}% above`}
      </p>
    </div>
  );
}

export default function CrimeSafetyCard({ county }: CrimeSafetyCardProps) {
  const [expanded, setExpanded] = useState(false);

  const data = COUNTY_CRIME.find(
    (c) => c.county.toLowerCase() === county.toLowerCase()
  );

  if (!data) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No crime data available for {county} County.
        </CardContent>
      </Card>
    );
  }

  const violentBelow = data.violentPer100K <= MI_AVG_VIOLENT;
  const propertyBelow = data.propertyPer100K <= MI_AVG_PROPERTY;
  const overallSafe = violentBelow && propertyBelow;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-michigan-teal" />
            {data.county} County Crime Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level 1: Key KPI visible without scroll */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between min-h-[44px] rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
            aria-expanded={expanded}
          >
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${overallSafe ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {overallSafe ? "Below Avg" : "Above Avg"}
              </span>
              <span className="text-xs text-muted-foreground">vs MI state average</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
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
                className="overflow-hidden space-y-4"
              >
                <RateBar label="Violent Crime" value={data.violentPer100K} stateAvg={MI_AVG_VIOLENT} />
                <RateBar label="Property Crime" value={data.propertyPer100K} stateAvg={MI_AVG_PROPERTY} />

                <p className="text-[9px] text-muted-foreground pt-1">
                  Based on 2022 FBI/MICR data.{" "}
                  <a
                    href="https://michigan.gov/msp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    michigan.gov/msp
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
