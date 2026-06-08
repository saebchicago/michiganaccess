import { motion } from "framer-motion";
import { Pill, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MI_PHARMACY_STATS, PHARMACY_DESERT_RISK } from "@/data/pharmacy-access";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const RISK_COLORS = { high: "bg-red-600 text-white", moderate: "bg-amber-500 text-white", low: "bg-green-600 text-white" };

const highRisk = Object.entries(PHARMACY_DESERT_RISK)
  .filter(([_, r]) => r === "high")
  .map(([c]) => c);

export default function PharmacyDesertCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="h-5 w-5 text-michigan-coral" /> Pharmacy Access Risk
          </CardTitle>
          <CardDescription>Estimated based on county type and reported chain closures - not precise pharmacy counts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3 text-center">
              <AnimatedCounter value={MI_PHARMACY_STATS.totalPharmacies} className="text-2xl font-bold text-foreground" />
              <p className="text-[10px] text-muted-foreground">Total pharmacies</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <span className="text-2xl font-bold text-michigan-coral">{MI_PHARMACY_STATS.chainDecline5yr}%</span>
              <p className="text-[10px] text-muted-foreground">Chain decline (5yr)</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <span className="text-2xl font-bold text-michigan-forest">+{MI_PHARMACY_STATS.independentGrowth5yr}%</span>
              <p className="text-[10px] text-muted-foreground">Independent growth (5yr)</p>
            </div>
          </div>

          <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-michigan-coral shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">{highRisk.length} counties at high pharmacy access risk</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {highRisk.join(", ")}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            If your pharmacy closed, call 211 to find alternatives including mail-order pharmacy and community health center dispensaries.
          </p>

          <p className="text-[10px] text-muted-foreground">Source: NCPDP 2024, FTC 2024 Report on PBMs</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
