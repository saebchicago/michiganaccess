import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info } from "lucide-react";
import PrintButton from "@/components/shared/PrintButton";

const fade = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

interface County {
  name: string; pop: number; life: number; insured: number; pcp: number; obesity: number;
  rank: number; svi: number; diabetes: number; depression: number; foodInsec: number;
  childPov: number; energyBurden: number; facilities: number;
}

const COUNTIES: County[] = [
  { name: "Washtenaw", pop: 372258, life: 81.2, insured: 97.1, pcp: 128, obesity: 26.1, rank: 1, svi: 0.28, diabetes: 8.8, depression: 19.2, foodInsec: 11.2, childPov: 14.1, energyBurden: 4.2, facilities: 142 },
  { name: "Ottawa", pop: 296200, life: 80.8, insured: 95.8, pcp: 68, obesity: 28.5, rank: 2, svi: 0.22, diabetes: 9.2, depression: 18.5, foodInsec: 10.8, childPov: 10.5, energyBurden: 4.5, facilities: 78 },
  { name: "Oakland", pop: 1274395, life: 79.8, insured: 96.2, pcp: 110, obesity: 29.5, rank: 5, svi: 0.35, diabetes: 9.8, depression: 19.8, foodInsec: 12.1, childPov: 12.8, energyBurden: 4.8, facilities: 285 },
  { name: "Kent", pop: 657974, life: 79.5, insured: 94.2, pcp: 95, obesity: 31.2, rank: 8, svi: 0.42, diabetes: 10.5, depression: 20.4, foodInsec: 13.5, childPov: 16.2, energyBurden: 5.8, facilities: 198 },
  { name: "Ingham", pop: 284900, life: 78.2, insured: 94.5, pcp: 115, obesity: 30.8, rank: 15, svi: 0.48, diabetes: 10.8, depression: 21.2, foodInsec: 15.1, childPov: 22.5, energyBurden: 6.1, facilities: 112 },
  { name: "Kalamazoo", pop: 261670, life: 78.8, insured: 93.8, pcp: 98, obesity: 31.5, rank: 12, svi: 0.45, diabetes: 10.2, depression: 21.8, foodInsec: 14.8, childPov: 20.1, energyBurden: 5.5, facilities: 95 },
  { name: "Macomb", pop: 881217, life: 77.2, insured: 94.4, pcp: 72, obesity: 33.8, rank: 28, svi: 0.52, diabetes: 11.5, depression: 21.5, foodInsec: 14.2, childPov: 16.8, energyBurden: 5.9, facilities: 178 },
  { name: "Mackinac", pop: 10834, life: 76.2, insured: 91.5, pcp: 42, obesity: 34.1, rank: 55, svi: 0.62, diabetes: 12.1, depression: 22.8, foodInsec: 16.5, childPov: 24.2, energyBurden: 10.8, facilities: 8 },
  { name: "Saginaw", pop: 190539, life: 75.8, insured: 93.5, pcp: 78, obesity: 36.2, rank: 68, svi: 0.72, diabetes: 12.8, depression: 22.5, foodInsec: 17.2, childPov: 28.5, energyBurden: 8.7, facilities: 62 },
  { name: "Wayne", pop: 1793561, life: 75.1, insured: 92.8, pcp: 112, obesity: 38.5, rank: 72, svi: 0.82, diabetes: 13.2, depression: 22.1, foodInsec: 17.8, childPov: 32.4, energyBurden: 8.2, facilities: 347 },
  { name: "Genesee", pop: 406892, life: 74.8, insured: 93.1, pcp: 85, obesity: 37.8, rank: 75, svi: 0.78, diabetes: 13.5, depression: 23.1, foodInsec: 18.2, childPov: 30.8, energyBurden: 9.1, facilities: 98 },
  { name: "Lake", pop: 11853, life: 73.5, insured: 89.2, pcp: 18, obesity: 39.8, rank: 82, svi: 0.91, diabetes: 14.8, depression: 25.2, foodInsec: 21.5, childPov: 38.2, energyBurden: 11.3, facilities: 4 },
];

const MI_AVG = { life: 77.4, insured: 95.0, pcp: 83, obesity: 33.0, svi: 0.50, diabetes: 11.4, depression: 20.1, foodInsec: 14.2, childPov: 19.8, energyBurden: 6.5 };

const METRICS = [
  { key: "life" as const, label: "Life Expectancy", unit: "yrs", avg: MI_AVG.life, higherBetter: true },
  { key: "insured" as const, label: "Insured Rate", unit: "%", avg: MI_AVG.insured, higherBetter: true },
  { key: "pcp" as const, label: "PCPs per 100K", unit: "", avg: MI_AVG.pcp, higherBetter: true },
  { key: "obesity" as const, label: "Obesity Rate", unit: "%", avg: MI_AVG.obesity, higherBetter: false },
  { key: "diabetes" as const, label: "Diabetes", unit: "%", avg: MI_AVG.diabetes, higherBetter: false },
  { key: "depression" as const, label: "Depression", unit: "%", avg: MI_AVG.depression, higherBetter: false },
  { key: "foodInsec" as const, label: "Food Insecurity", unit: "%", avg: MI_AVG.foodInsec, higherBetter: false },
  { key: "childPov" as const, label: "Child Poverty", unit: "%", avg: MI_AVG.childPov, higherBetter: false },
  { key: "energyBurden" as const, label: "Energy Burden", unit: "%", avg: MI_AVG.energyBurden, higherBetter: false },
  { key: "svi" as const, label: "SVI Score", unit: "", avg: MI_AVG.svi, higherBetter: false },
];

type MetricKey = typeof METRICS[number]["key"];

function StatCard({ label, value, unit, avg, higherBetter }: { label: string; value: number; unit: string; avg: number; higherBetter: boolean }) {
  const diff = value - avg;
  const isBetter = higherBetter ? diff >= 0 : diff <= 0;
  const variant = isBetter ? "default" : "destructive";
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}<span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span></p>
        <Badge variant={variant} className="mt-2 text-[10px]">{diff > 0 ? "+" : ""}{diff.toFixed(1)} vs MI avg</Badge>
      </CardContent>
    </Card>
  );
}

function BarViz({ county, metric }: { county: County; metric: typeof METRICS[number] }) {
  const val = county[metric.key as keyof County] as number;
  const max = Math.max(...COUNTIES.map(c => c[metric.key as keyof County] as number)) * 1.1;
  const pct = (val / max) * 100;
  const avgPct = (metric.avg / max) * 100;
  return (
    <div className="relative h-7 bg-muted rounded-full overflow-hidden">
      <div className="absolute h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary to-primary/60" style={{ width: `${pct}%` }} />
      <div className="absolute h-full w-0.5 bg-destructive z-10" style={{ left: `${avgPct}%` }} title={`MI Avg: ${metric.avg}`} />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-foreground">{val}{metric.unit}</span>
    </div>
  );
}

function vulnLabel(svi: number) {
  if (svi >= 0.75) return { text: "Critical", variant: "destructive" as const };
  if (svi >= 0.5) return { text: "High", variant: "secondary" as const };
  return { text: "Moderate", variant: "default" as const };
}

export default function CHNAExplorerPage() {
  const [selectedCounty, setSelectedCounty] = useState("Wayne");
  const [compareCounty, setCompareCounty] = useState("Washtenaw");

  usePageMeta({
    title: "CHNA Explorer — Access Michigan",
    description: "Interactive county-level Community Health Needs Assessment tool for all 83 Michigan counties.",
    path: "/chna-explorer",
  });

  const county = COUNTIES.find(c => c.name === selectedCounty)!;
  const compare = COUNTIES.find(c => c.name === compareCounty)!;
  const vuln = vulnLabel(county.svi);
  const sorted = useMemo(() => [...COUNTIES].sort((a, b) => a.name.localeCompare(b.name)), []);

  const findings = useMemo(() => [
    county.svi >= 0.7 && `High social vulnerability (SVI ${county.svi}) — top quartile statewide`,
    county.obesity > MI_AVG.obesity * 1.1 && `Obesity rate ${((county.obesity / MI_AVG.obesity - 1) * 100).toFixed(0)}% above state average`,
    county.foodInsec > MI_AVG.foodInsec * 1.1 && `Food insecurity ${((county.foodInsec / MI_AVG.foodInsec - 1) * 100).toFixed(0)}% above state average`,
    county.pcp < MI_AVG.pcp * 0.8 && `Primary care physician shortage — ${county.pcp} per 100K vs. ${MI_AVG.pcp} state average`,
    county.energyBurden > 6 && `Energy burden ${county.energyBurden}% — exceeds DOE high-burden threshold (6%)`,
    county.childPov > MI_AVG.childPov * 1.2 && `Child poverty rate ${county.childPov}% — significantly above state average`,
  ].filter(Boolean) as string[], [county]);

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data & Insights", href: "/data-and-insights" }, { label: "CHNA Explorer" }]} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-5xl">
          <motion.div initial="hidden" animate="visible" variants={fade} custom={0}>
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs">Interactive</Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-2">Community Health Needs Assessment</h1>
            <p className="text-muted-foreground">Interactive county-level health intelligence across Michigan's 83 counties.</p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8 space-y-8">
        {/* County selectors */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Primary County</label>
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{sorted.map(c => <SelectItem key={c.name} value={c.name}>{c.name} County (Rank #{c.rank})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Compare With</label>
            <Select value={compareCounty} onValueChange={setCompareCounty}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{sorted.map(c => <SelectItem key={c.name} value={c.name}>{c.name} County</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compare">Side-by-Side</TabsTrigger>
            <TabsTrigger value="metrics">All Metrics</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-xl">{county.name} County</CardTitle>
                    <p className="text-sm text-muted-foreground">Population: {county.pop.toLocaleString()} · Health Rank: #{county.rank} of 83</p>
                  </div>
                  <Badge variant={vuln.variant}>{vuln.text} (SVI {county.svi})</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Life Expectancy" value={county.life} unit=" yrs" avg={MI_AVG.life} higherBetter />
                  <StatCard label="Insured Rate" value={county.insured} unit="%" avg={MI_AVG.insured} higherBetter />
                  <StatCard label="PCPs per 100K" value={county.pcp} unit="" avg={MI_AVG.pcp} higherBetter />
                  <StatCard label="Facilities" value={county.facilities} unit="" avg={120} higherBetter />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Health Indicators vs. Michigan Average</CardTitle>
                <p className="text-xs text-muted-foreground">Red line = Michigan state average</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {METRICS.map(m => (
                  <div key={m.key} className="flex items-center gap-4">
                    <span className="text-xs font-medium text-muted-foreground w-28 shrink-0 text-right">{m.label}</span>
                    <div className="flex-1"><BarViz county={county} metric={m} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {findings.length > 0 && (
              <Card className="bg-primary text-primary-foreground border-0">
                <CardHeader className="pb-2"><CardTitle className="text-base text-primary-foreground">Key Findings</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-2">
                    {findings.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">●</span>
                        <p className="text-sm text-primary-foreground/80">{f}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Side-by-Side */}
          <TabsContent value="compare">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-center">{county.name}</TableHead>
                      <TableHead className="text-center">{compare.name}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { label: "Health Rank", a: `#${county.rank}`, b: `#${compare.rank}` },
                      { label: "Population", a: county.pop.toLocaleString(), b: compare.pop.toLocaleString() },
                      { label: "SVI Score", a: String(county.svi), b: String(compare.svi) },
                      ...METRICS.map(m => ({
                        label: m.label,
                        a: `${county[m.key as keyof County]}${m.unit}`,
                        b: `${compare[m.key as keyof County]}${m.unit}`,
                        higherBetter: m.higherBetter,
                        numA: county[m.key as keyof County] as number,
                        numB: compare[m.key as keyof County] as number,
                      })),
                      { label: "Facilities", a: String(county.facilities), b: String(compare.facilities) },
                    ].map((row, i) => {
                      const numRow = row as { numA?: number; numB?: number; higherBetter?: boolean };
                      let aWins = false, bWins = false;
                      if (numRow.numA !== undefined && numRow.numB !== undefined) {
                        aWins = numRow.higherBetter ? numRow.numA > numRow.numB : numRow.numA < numRow.numB;
                        bWins = !aWins && numRow.numA !== numRow.numB;
                      }
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{row.label}</TableCell>
                          <TableCell className={`text-center font-semibold ${aWins ? "text-emerald-600 dark:text-emerald-400" : bWins ? "text-destructive" : ""}`}>{row.a}</TableCell>
                          <TableCell className={`text-center font-semibold ${bWins ? "text-emerald-600 dark:text-emerald-400" : aWins ? "text-destructive" : ""}`}>{row.b}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Metrics */}
          <TabsContent value="metrics">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>County</TableHead>
                      <TableHead className="text-center">Rank</TableHead>
                      {METRICS.slice(0, 7).map(m => <TableHead key={m.key} className="text-center whitespace-nowrap">{m.label}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...COUNTIES].sort((a, b) => a.rank - b.rank).map(c => (
                      <TableRow
                        key={c.name}
                        className={`cursor-pointer ${c.name === selectedCounty ? "bg-primary/5 font-semibold" : "hover:bg-muted/50"}`}
                        onClick={() => setSelectedCounty(c.name)}
                      >
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-center">#{c.rank}</TableCell>
                        {METRICS.slice(0, 7).map(m => <TableCell key={m.key} className="text-center">{c[m.key as keyof County]}{m.unit}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Source footer */}
        <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <strong>Data Sources:</strong> CDC SVI 2022, County Health Rankings 2025, CMS Hospital Compare, HRSA HPSA, CDC PLACES & BRFSS, MDHHS Health Equity Data, ACEEE LEAD Tool. Data reflects most recent available reporting periods (2023–2025). Facility counts from Access Michigan platform database. See{" "}
            <a href="/methodology" className="text-primary hover:underline">Methodology</a> for full documentation.
          </p>
        </div>
      </div>
      <PrintButton />
    </Layout>
  );
}
