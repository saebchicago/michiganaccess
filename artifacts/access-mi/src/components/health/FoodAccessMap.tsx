import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wheat, ExternalLink, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FOOD_DESERT_DATA = [
  { county: "Wayne", tracts: 185, pctPop: 38.2, snapRate: 32.1 },
  { county: "Genesee", tracts: 48, pctPop: 35.8, snapRate: 28.4 },
  { county: "Saginaw", tracts: 24, pctPop: 28.6, snapRate: 25.2 },
  { county: "Muskegon", tracts: 18, pctPop: 26.4, snapRate: 23.8 },
  { county: "Berrien", tracts: 16, pctPop: 24.1, snapRate: 21.5 },
  { county: "Calhoun", tracts: 14, pctPop: 22.8, snapRate: 22.1 },
  { county: "Jackson", tracts: 12, pctPop: 19.6, snapRate: 18.4 },
  { county: "Ingham", tracts: 15, pctPop: 17.2, snapRate: 19.6 },
  { county: "Kent", tracts: 22, pctPop: 14.8, snapRate: 15.2 },
  { county: "Lake", tracts: 4, pctPop: 52.1, snapRate: 34.8 },
  { county: "Oscoda", tracts: 3, pctPop: 48.6, snapRate: 31.2 },
  { county: "Crawford", tracts: 3, pctPop: 42.4, snapRate: 28.6 },
  { county: "Macomb", tracts: 14, pctPop: 8.2, snapRate: 12.4 },
  { county: "Oakland", tracts: 12, pctPop: 5.1, snapRate: 8.2 },
  { county: "Washtenaw", tracts: 8, pctPop: 6.4, snapRate: 10.1 },
];

export default function FoodAccessMap() {
  const totalTracts = FOOD_DESERT_DATA.reduce((sum, d) => sum + d.tracts, 0);

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
              <p className="text-2xl font-bold text-michigan-coral-deep">{totalTracts}+</p>
              <p className="text-xs text-muted-foreground">Food desert census tracts</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">1.4M+</p>
              <p className="text-xs text-muted-foreground">Residents in food deserts</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-michigan-gold-deep">14.6%</p>
              <p className="text-xs text-muted-foreground">Statewide food insecurity</p>
            </div>
          </div>

          {/* Insight */}
          <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-michigan-coral-deep shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              Rural counties like <strong>Lake (52%)</strong>, <strong>Oscoda (49%)</strong>, and <strong>Crawford (42%)</strong> have the highest % of population in food deserts - but <strong>Wayne County</strong> has the most food desert tracts (185) by total count.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs font-medium text-muted-foreground">County</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Desert Tracts</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Pop in Deserts</th>
                  <th className="pb-2 text-xs font-medium text-muted-foreground text-right">SNAP Rate</th>
                </tr>
              </thead>
              <tbody>
                {FOOD_DESERT_DATA.map((d) => (
                  <tr key={d.county} className="border-b border-border/50 last:border-0">
                    <td className="py-2 font-medium text-foreground">{d.county}</td>
                    <td className="py-2 text-right tabular-nums">{d.tracts}</td>
                    <td className="py-2 text-right">
                      <span className={d.pctPop > 25 ? "text-michigan-coral-deep font-semibold" : ""}>{d.pctPop}%</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{d.snapRate}%</td>
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
            Source: USDA Economic Research Service, Food Access Research Atlas. SNAP rates from ACS 2023.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
