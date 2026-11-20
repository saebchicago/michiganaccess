import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wheat, ExternalLink, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { MICHIGAN_FOOD_ACCESS, FOOD_ACCESS_SOURCE } from "@/hooks/useFoodAccess";

// USDA ERS Food Access Research Atlas 2019, summed from tracts to counties by
// scripts/refresh-usda-fara-county.mjs. "Food desert" = USDA's low-income,
// low-access (LILA) tract flag at 1 mile urban / 10 miles rural.
const TOP_COUNTIES = [...MICHIGAN_FOOD_ACCESS]
  .sort((a, b) => b.lilaTracts - a.lilaTracts)
  .slice(0, 15);
const TOTAL_LILA_TRACTS = MICHIGAN_FOOD_ACCESS.reduce((sum, d) => sum + d.lilaTracts, 0);
const TOTAL_TRACTS = MICHIGAN_FOOD_ACCESS.reduce((sum, d) => sum + d.totalTracts, 0);
const TOTAL_LILA_POP = MICHIGAN_FOOD_ACCESS.reduce((sum, d) => sum + d.lowIncomeLowAccessPop, 0);

export default function FoodAccessMap() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wheat className="h-5 w-5 text-michigan-gold-deep" /> Food Access & Food Deserts
          </CardTitle>
          <CardDescription>
            Where Michigan residents lack adequate access to affordable, nutritious food
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-michigan-coral-deep">{TOTAL_LILA_TRACTS.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Food desert census tracts (of {TOTAL_TRACTS.toLocaleString()})</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{TOTAL_LILA_POP.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Low-income residents with low food access</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-michigan-gold-deep">2019</p>
              <p className="text-xs text-muted-foreground">Latest USDA atlas year</p>
            </div>
          </div>

          {/* Insight */}
          <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-michigan-coral-deep shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              <strong>{TOP_COUNTIES[0].county} County</strong> has the most food desert tracts ({TOP_COUNTIES[0].lilaTracts}).
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs font-medium text-muted-foreground">County</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Food desert tracts</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Tracts with low access</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Low-income, low-access residents</th>
                </tr>
              </thead>
              <tbody>
                {TOP_COUNTIES.map((d) => (
                  <tr key={d.county} className="border-b border-border/50 last:border-0">
                    <td className="py-2 font-medium text-foreground">{d.county}</td>
                    <td className="py-2 text-right tabular-nums">{d.lilaTracts}</td>
                    <td className="py-2 text-right">
                      <span className={d.lowAccessPct > 50 ? "text-michigan-coral-deep font-semibold" : ""}>{d.lowAccessPct}%</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{d.lowIncomeLowAccessPop.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <a href="https://newmibridges.michigan.gov" target="_blank" rel="noopener noreferrer">
                Apply for SNAP via MI Bridges <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to="/resources">Find Local Food Banks <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Source: {FOOD_ACCESS_SOURCE}, tract data summed to counties (MODELED). Tracts with low access: share of the county's tracts USDA flags low access. Low access: more than 1 mile (urban) or 10 miles (rural) from a supermarket. Population counts are 2010 Census based. Top 15 counties by food desert tracts.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
