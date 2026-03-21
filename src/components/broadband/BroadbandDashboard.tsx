import { motion } from "framer-motion";
import { Wifi, ExternalLink, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Verified data anchors
const BEAD_ALLOCATION = 1_559_000_000;
const UNSERVED_HOUSEHOLDS = 492_000;
const BARRIER_HOUSEHOLDS = 730_000;

const COUNTY_BROADBAND = [
  { county: "Lake", pctUnserved: 42.1 },
  { county: "Oscoda", pctUnserved: 38.5 },
  { county: "Crawford", pctUnserved: 35.2 },
  { county: "Montmorency", pctUnserved: 33.8 },
  { county: "Alcona", pctUnserved: 31.4 },
  { county: "Ogemaw", pctUnserved: 29.7 },
  { county: "Roscommon", pctUnserved: 28.1 },
  { county: "Iosco", pctUnserved: 26.8 },
  { county: "Arenac", pctUnserved: 25.4 },
  { county: "Clare", pctUnserved: 24.2 },
  { county: "Gladwin", pctUnserved: 23.1 },
  { county: "Missaukee", pctUnserved: 22.5 },
  { county: "Wexford", pctUnserved: 21.8 },
  { county: "Mecosta", pctUnserved: 20.4 },
  { county: "Osceola", pctUnserved: 19.6 },
];

function barColor(pct: number): string {
  if (pct > 30) return "hsl(0, 80%, 55%)";
  if (pct > 20) return "hsl(27, 87%, 55%)";
  return "hsl(27, 87%, 67%)";
}

export default function BroadbandDashboard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="h-5 w-5 text-primary" /> Michigan's Digital Divide
          </CardTitle>
          <CardDescription>
            $1.559 billion in BEAD funding. 492,000 unserved households. 730,000 facing barriers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-3 text-center">
              <p className="text-2xl font-bold text-primary">${(BEAD_ALLOCATION / 1e9).toFixed(2)}B</p>
              <p className="text-xs text-muted-foreground">BEAD Allocation (4th highest nationally)</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-center">
              <p className="text-2xl font-bold text-michigan-coral">{(UNSERVED_HOUSEHOLDS / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Unserved/underserved households</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 text-center">
              <p className="text-2xl font-bold text-michigan-gold">{(BARRIER_HOUSEHOLDS / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Facing digital divide barriers</p>
            </div>
          </div>

          <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-michigan-coral shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              Rural northern Michigan counties are hardest hit. <strong>Lake County</strong> has 42% of locations unserved — the highest rate in the state.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Most Underserved Counties (% locations unserved)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={COUNTY_BROADBAND} layout="vertical" margin={{ left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis type="number" unit="%" tick={{ fontSize: 10 }} domain={[0, 45]} />
              <YAxis dataKey="county" type="category" width={85} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Unserved"]} />
              <Bar dataKey="pctUnserved" radius={[0, 4, 4, 0]}>
                {COUNTY_BROADBAND.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.pctUnserved)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-muted-foreground">Source: FCC Broadband Data Collection, 2025-H2</p>
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <a href="https://broadbandmap.fcc.gov/location-summary/fixed?speed=25_3&latlon=44.3148,-85.6024&zoom=6" target="_blank" rel="noopener">
                FCC Map <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
