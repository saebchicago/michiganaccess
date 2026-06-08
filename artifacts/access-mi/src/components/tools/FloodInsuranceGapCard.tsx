import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FEMA_FLOOD_DATA, FEMA_FLOOD_SOURCE } from "@/data/fema-flood";

interface FloodInsuranceGapCardProps {
  county: string;
}

const RISK_COLORS: Record<string, { bg: string; text: string }> = {
  Critical: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
  High:     { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
  Moderate: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
  Low:      { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
};

export default function FloodInsuranceGapCard({ county }: FloodInsuranceGapCardProps) {
  const [expanded, setExpanded] = useState(false);

  const data = FEMA_FLOOD_DATA[county] ?? Object.values(FEMA_FLOOD_DATA).find(
    (d) => d.county.toLowerCase() === county.toLowerCase()
  );

  if (!data) return null;

  const risk = RISK_COLORS[data.underinsuranceRisk] ?? RISK_COLORS.Moderate;
  const paidMillions = Math.round(data.totalClaimsPaid / 1_000_000);
  const maxBar = Math.max(data.totalClaimsSince1978, data.policiesInForce);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Droplets className="h-5 w-5 text-michigan-teal" />
            Flood Insurance Gap - {data.county} County
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level 1: Risk badge + key stat */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between min-h-[44px] rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
            aria-expanded={expanded}
          >
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${risk.bg} ${risk.text}`}>
                {data.underinsuranceRisk}
              </span>
              <span className="text-sm text-muted-foreground">
                {data.totalClaimsSince1978.toLocaleString()} claims &mdash; {data.policiesInForce.toLocaleString()} active policies
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          {!expanded && (
            <p className="text-[10px] text-muted-foreground text-center">Tap for claims vs. policies breakdown</p>
          )}

          {/* Level 2: Expanded comparison */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden space-y-4"
              >
                {/* Claims vs policies bars */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Claims since 1978</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {data.totalClaimsSince1978.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="absolute left-0 top-0 h-full rounded-full bg-red-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(data.totalClaimsSince1978 / maxBar) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Active policies</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {data.policiesInForce.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="absolute left-0 top-0 h-full rounded-full bg-green-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(data.policiesInForce / maxBar) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Total Paid</p>
                    <p className="text-sm font-semibold">${paidMillions}M</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Avg Claim</p>
                    <p className="text-sm font-semibold">${data.avgClaimAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Claims/Policy</p>
                    <p className="text-sm font-semibold">{data.claimsPerPolicy.toFixed(2)}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {data.totalClaimsSince1978.toLocaleString()} claims since 1978 but only{" "}
                  {data.policiesInForce.toLocaleString()} active policies - many properties
                  have experienced flooding without maintaining coverage.
                </p>

                <p className="text-[9px] text-muted-foreground pt-1">
                  {FEMA_FLOOD_SOURCE}{" "}
                  <a
                    href="https://www.fema.gov/openfema"
                    target="_blank"
                    rel="noopener"
                    className="text-primary hover:underline"
                  >
                    fema.gov/openfema
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
