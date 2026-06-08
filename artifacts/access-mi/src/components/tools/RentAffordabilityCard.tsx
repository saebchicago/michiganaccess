import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HUD_FMR_DATA, MI_FMR_AVERAGE_2BR, HUD_FMR_SOURCE } from "@/data/hud-fmr";
import { IRS_ZIP_DATA } from "@/data/irs-zip-income";

interface RentAffordabilityCardProps {
  zip: string;
}

const BEDROOM_LABELS = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"] as const;

export default function RentAffordabilityCard({ zip }: RentAffordabilityCardProps) {
  const [expanded, setExpanded] = useState(false);

  const fmr = HUD_FMR_DATA[zip];
  if (!fmr) return null;

  const fmrValues = [fmr.fmr0br, fmr.fmr1br, fmr.fmr2br, fmr.fmr3br, fmr.fmr4br];
  const affordableIncome = Math.round((fmr.fmr2br * 12) / 0.30);
  const vsAvg = fmr.fmr2br - MI_FMR_AVERAGE_2BR;
  const vsAvgPct = Math.round((vsAvg / MI_FMR_AVERAGE_2BR) * 100);
  const aboveAvg = vsAvg > 0;

  const irs = IRS_ZIP_DATA[zip];
  const incomeGap = irs ? affordableIncome - irs.avgAGI : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="h-5 w-5 text-michigan-teal" />
            Rental Affordability - {zip}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level 1: Key KPI */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between min-h-[44px] rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
            aria-expanded={expanded}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">
                ${fmr.fmr2br.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </span>
              <span className="text-xs text-muted-foreground">
                HUD FMR 2BR &mdash;{" "}
                <span className={aboveAvg ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                  {aboveAvg ? `${vsAvgPct}% above` : `${Math.abs(vsAvgPct)}% below`} MI avg
                </span>
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          {!expanded && (
            <p className="text-[10px] text-muted-foreground text-center">Tap for all bedrooms & affordability analysis</p>
          )}

          {/* Level 2: Expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden space-y-4"
              >
                {/* All bedroom sizes */}
                <div className="grid grid-cols-5 gap-2">
                  {BEDROOM_LABELS.map((label, i) => (
                    <div key={label} className="text-center">
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold">${fmrValues[i].toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* 30% affordability rule */}
                <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                  <p className="text-xs font-medium">30% Affordability Rule</p>
                  <p className="text-sm">
                    Need <span className="font-bold text-foreground">${affordableIncome.toLocaleString()}/yr</span> for a 2BR
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Household income needed so rent does not exceed 30% of gross income.
                  </p>
                </div>

                {/* IRS cross-reference */}
                {irs && incomeGap !== null && (
                  <div className="rounded-lg border border-border p-3 space-y-1">
                    <p className="text-xs font-medium">vs. IRS Average Income ({zip})</p>
                    <p className="text-sm">
                      Avg AGI: <span className="font-semibold">${irs.avgAGI.toLocaleString()}</span>
                      {" "}&mdash;{" "}
                      {incomeGap > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          ${incomeGap.toLocaleString()} gap
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          ${Math.abs(incomeGap).toLocaleString()} surplus
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {incomeGap > 0
                        ? "Average earners in this ZIP cannot afford a 2BR at 30% of income."
                        : "Average earners in this ZIP can afford a 2BR at 30% of income."}
                    </p>
                  </div>
                )}

                <p className="text-[9px] text-muted-foreground pt-1">
                  {HUD_FMR_SOURCE}{" "}
                  <a
                    href="https://huduser.gov/portal/datasets/fmr.html"
                    target="_blank"
                    rel="noopener"
                    className="text-primary hover:underline"
                  >
                    huduser.gov
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
