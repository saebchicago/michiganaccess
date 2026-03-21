import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, ExternalLink, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis, Cell,
} from "recharts";

// County-level data: energy burden (%) × diabetes prevalence (%)
// Sources: DOE LEAD Tool (energy burden), CDC PLACES (diabetes), Census (population)
const COUNTY_DATA = [
  { county: "Wayne", energyBurden: 8.1, diabetes: 14.2, pop: 1793561, svi: 0.78 },
  { county: "Oakland", energyBurden: 4.2, diabetes: 9.8, pop: 1274395, svi: 0.32 },
  { county: "Macomb", energyBurden: 5.1, diabetes: 11.5, pop: 881217, svi: 0.45 },
  { county: "Kent", energyBurden: 5.4, diabetes: 10.6, pop: 664564, svi: 0.41 },
  { county: "Genesee", energyBurden: 7.8, diabetes: 13.8, pop: 406211, svi: 0.72 },
  { county: "Washtenaw", energyBurden: 3.8, diabetes: 8.4, pop: 372258, svi: 0.25 },
  { county: "Ingham", energyBurden: 5.9, diabetes: 11.2, pop: 284900, svi: 0.48 },
  { county: "Kalamazoo", energyBurden: 5.6, diabetes: 10.9, pop: 265066, svi: 0.44 },
  { county: "Saginaw", energyBurden: 7.5, diabetes: 13.4, pop: 190124, svi: 0.69 },
  { county: "Muskegon", energyBurden: 6.8, diabetes: 12.7, pop: 175242, svi: 0.62 },
  { county: "Ottawa", energyBurden: 3.9, diabetes: 8.2, pop: 299207, svi: 0.22 },
  { county: "Berrien", energyBurden: 6.9, diabetes: 12.5, pop: 153401, svi: 0.58 },
  { county: "Calhoun", energyBurden: 7.2, diabetes: 13.1, pop: 133017, svi: 0.65 },
  { county: "Jackson", energyBurden: 6.5, diabetes: 12.0, pop: 158510, svi: 0.55 },
  { county: "Livingston", energyBurden: 3.6, diabetes: 8.0, pop: 193866, svi: 0.18 },
  { county: "Monroe", energyBurden: 5.3, diabetes: 11.0, pop: 152100, svi: 0.42 },
  { county: "Bay", energyBurden: 6.7, diabetes: 12.4, pop: 103126, svi: 0.57 },
  { county: "Midland", energyBurden: 4.5, diabetes: 9.5, pop: 83156, svi: 0.30 },
  { county: "Isabella", energyBurden: 6.4, diabetes: 11.6, pop: 63812, svi: 0.52 },
  { county: "Houghton", energyBurden: 8.5, diabetes: 10.2, pop: 35684, svi: 0.48 },
];

function sviColor(svi: number): string {
  if (svi > 0.65) return "hsl(0, 100%, 65%)";
  if (svi > 0.45) return "hsl(27, 87%, 67%)";
  return "hsl(145, 45%, 42%)";
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground">{d.county} County</p>
      <p className="text-xs text-muted-foreground">Energy burden: <strong>{d.energyBurden}%</strong></p>
      <p className="text-xs text-muted-foreground">Diabetes prevalence: <strong>{d.diabetes}%</strong></p>
      <p className="text-xs text-muted-foreground">Population: {d.pop.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">SVI: {d.svi.toFixed(2)}</p>
    </div>
  );
};

export default function EnergyHealthScatter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 shrink-0 text-michigan-coral mt-0.5" />
        <div>
          <h2 className="text-xl font-bold text-foreground">When Energy Bills Become a Health Crisis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Michigan counties with high energy burden consistently show elevated chronic disease rates. The connection is structural, not coincidental.
          </p>
        </div>
      </div>

      {/* Scatter plot */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-michigan-gold" />
            Energy Burden vs. Diabetes Prevalence by County
          </CardTitle>
          <CardDescription>
            Dot size = population · Dot color = Social Vulnerability Index (green=low, red=high)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis
                type="number"
                dataKey="energyBurden"
                name="Energy Burden"
                unit="%"
                domain={[3, 9]}
                tick={{ fontSize: 11 }}
                label={{ value: "Energy Burden (% of income)", position: "bottom", offset: 5, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="diabetes"
                name="Diabetes"
                unit="%"
                domain={[7, 15]}
                tick={{ fontSize: 11 }}
                label={{ value: "Diabetes Prevalence (%)", angle: -90, position: "insideLeft", offset: 10, fontSize: 11 }}
              />
              <ZAxis type="number" dataKey="pop" range={[40, 400]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={COUNTY_DATA} name="Counties">
                {COUNTY_DATA.map((entry, i) => (
                  <Cell key={i} fill={sviColor(entry.svi)} fillOpacity={0.8} stroke={sviColor(entry.svi)} strokeWidth={1} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(145, 45%, 42%)" }} /> Low SVI</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(27, 87%, 67%)" }} /> Moderate SVI</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(0, 100%, 65%)" }} /> High SVI</span>
          </div>
        </CardContent>
      </Card>

      {/* Key findings */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { stat: "1.4×", desc: "Counties with >8% energy burden have 1.4× higher diabetes rates than those below 5%", color: "border-michigan-coral/20 bg-michigan-coral/5" },
          { stat: "23%", desc: "Michigan's average residential rate (20.8¢/kWh) is 23% above the national average (16.9¢/kWh)", color: "border-michigan-gold/20 bg-michigan-gold/5" },
          { stat: "76", desc: "Counties with zero pedestrian infrastructure data — often the same communities with highest energy burden", color: "border-primary/20 bg-primary/5" },
        ].map((item) => (
          <Card key={item.stat} className={item.color}>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-foreground">{item.stat}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What can you do */}
      <Card className="border-michigan-forest/20 bg-michigan-forest/5">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">What Can You Do?</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to="/financial-help">Check LIHEAP / MEAP Eligibility <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to="/environment#programs">DTE / Consumers Efficiency Programs <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <Link to="/environment#energy">Weatherization Assistance <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Sources: DOE LEAD Tool (energy burden), CDC PLACES (diabetes prevalence), Census ACS (population), CDC SVI 2022.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
