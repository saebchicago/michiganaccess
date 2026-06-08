import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assessZIP, type UnderservedAssessment, type OverallFlag } from "@/lib/underserved-score";
import { IRS_ZIP_DATA } from "@/data/irs-zip-income";
import { ZIP_QUICKSTATS } from "@/data/zip-quickstats";
import { COUNTY_RESILIENCE } from "@/data/county-resilience";

interface UnderservedIndicatorProps {
  zip: string;
}

const FLAG_COLORS: Record<OverallFlag, { bg: string; text: string; border: string }> = {
  "Well-Served":           { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", border: "border-green-300 dark:border-green-700" },
  "Moderate Need":         { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", border: "border-amber-300 dark:border-amber-700" },
  "Underserved":           { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", border: "border-orange-300 dark:border-orange-700" },
  "Critically Underserved": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", border: "border-red-300 dark:border-red-700" },
};

const DIMENSION_LABELS: { key: keyof UnderservedAssessment["dimensions"]; label: string }[] = [
  { key: "healthBurden", label: "Health Burden" },
  { key: "economicHardship", label: "Economic Hardship" },
  { key: "environmentalRisk", label: "Environmental Risk" },
  { key: "providerAccess", label: "Provider Access" },
  { key: "digitalAccess", label: "Digital Access" },
];

function getDotColor(value: string): string {
  if (value === "High" || value === "Desert") return "bg-red-500";
  if (value === "Moderate" || value === "Limited") return "bg-amber-500";
  return "bg-green-500";
}

export default function UnderservedIndicator({ zip }: UnderservedIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  // Gather available data
  const irs = IRS_ZIP_DATA[zip];
  const qs = ZIP_QUICKSTATS[zip];
  const county = irs?.county ?? qs?.county;
  const resilience = county
    ? COUNTY_RESILIENCE.find((c) => c.county.toLowerCase() === county.toLowerCase())
    : undefined;

  // Need at least one data source to show anything meaningful
  if (!irs && !resilience) return null;

  const assessment = assessZIP(zip, {
    healthScore: resilience?.healthScore,
    eitcPct: irs?.eitcPct,
    broadbandPct: resilience?.broadbandPct,
  });

  const colors = FLAG_COLORS[assessment.overallFlag];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-michigan-teal" />
            Underserved ZIP Assessment - {zip}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level 1: Overall flag */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between min-h-[44px] rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
            aria-expanded={expanded}
          >
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                {assessment.overallFlag}
              </span>
              <span className="text-xs text-muted-foreground">
                Flagged on {assessment.flagCount} of 5 underserved dimensions
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          {!expanded && (
            <p className="text-[10px] text-muted-foreground text-center">Tap for dimension breakdown</p>
          )}

          {/* Level 2: Dimension dots + methodology */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden space-y-4"
              >
                {/* Dimension dots */}
                <div className="space-y-2">
                  {DIMENSION_LABELS.map(({ key, label }) => {
                    const value = assessment.dimensions[key];
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full shrink-0 ${getDotColor(value)}`} />
                        <span className="text-xs text-muted-foreground flex-1">{label}</span>
                        <span className="text-xs font-medium">{value}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-green-500" /> OK
                  <span className="h-2 w-2 rounded-full bg-amber-500 ml-2" /> Moderate/Limited
                  <span className="h-2 w-2 rounded-full bg-red-500 ml-2" /> High/Desert
                </div>

                {/* Methodology expander */}
                <button
                  onClick={() => setShowMethodology(!showMethodology)}
                  className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                >
                  <Info className="h-3 w-3" />
                  {showMethodology ? "Hide methodology" : "How is this calculated?"}
                </button>

                <AnimatePresence>
                  {showMethodology && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-lg bg-muted/50 p-3 text-[10px] text-muted-foreground space-y-1">
                        <p><strong>Health Burden:</strong> County health ranking score. Below 40 = High, 40-60 = Moderate.</p>
                        <p><strong>Economic Hardship:</strong> ZIP EITC claim rate. Above 30% = High, 20-30% = Moderate.</p>
                        <p><strong>Environmental Risk:</strong> EPA TRI data - carcinogen presence or high total pounds.</p>
                        <p><strong>Provider Access:</strong> HRSA Health Professional Shortage Area designation.</p>
                        <p><strong>Digital Access:</strong> FCC broadband adoption. Below 70% = Desert, 70-80% = Limited.</p>
                        <p className="pt-1">Overall flag based on count of High/Desert dimensions: 0 = Well-Served, 1 = Moderate Need, 2-3 = Underserved, 4+ = Critically Underserved.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[9px] text-muted-foreground pt-1">
                  Composite indicator combining CDC PLACES, IRS SOI, EPA TRI, HRSA, and FCC data. Illustrative - not a validated index.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
