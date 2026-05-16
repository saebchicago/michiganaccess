import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HAZARD_RISK_DATA, RISK_COLORS } from "@/data/michigan-hazard-risk";

export default function HazardRiskDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-michigan-coral" />
            Which Michigan Counties Face the Most Risk?
          </CardTitle>
          <CardDescription>
            FEMA National Risk Index — expected annual loss, social vulnerability, and top hazards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-michigan-coral">
                {HAZARD_RISK_DATA.filter((d) => d.riskRating === "Very High" || d.riskRating === "Relatively High").length}
              </p>
              <p className="text-xs text-muted-foreground">High/Very High Risk Counties</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">$892M</p>
              <p className="text-xs text-muted-foreground">Highest Annual Loss (Wayne)</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-michigan-gold">Severe Storm</p>
              <p className="text-xs text-muted-foreground">#1 Hazard Statewide</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs font-medium text-muted-foreground">County</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Risk</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Annual Loss</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Vulnerability</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground">Top Hazards</th>
                </tr>
              </thead>
              <tbody>
                {HAZARD_RISK_DATA.map((row) => (
                  <tr key={row.county} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 font-medium text-foreground">{row.county}</td>
                    <td className="py-2.5">
                      <Badge className={`text-[9px] ${RISK_COLORS[row.riskRating] || "bg-gray-400 text-white"}`}>
                        {row.riskRating}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right tabular-nums font-mono text-foreground">{row.expectedAnnualLoss}</td>
                    <td className="py-2.5">
                      <span className={`text-xs ${row.socialVulnerability.includes("High") ? "text-michigan-coral" : "text-muted-foreground"}`}>
                        {row.socialVulnerability}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {row.topHazards.map((h) => (
                          <span key={h} className="text-[9px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                            {h}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Source: FEMA National Risk Index — 20 of 83 counties shown. Full data at hazards.fema.gov
            </p>
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <a href="https://hazards.fema.gov/nri/map" target="_blank" rel="noopener">
                Full NRI Map <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
