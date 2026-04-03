import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wind, ArrowLeft, AlertTriangle, Factory, Info, Loader2,
  ExternalLink, Shield,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useECHOFacilities } from "@/hooks/useEPAEcho";
import AirQualityChecker from "@/components/environment/AirQualityChecker";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const COUNTIES = ["Wayne", "Oakland", "Macomb", "Kent", "Genesee", "Washtenaw", "Ingham", "Kalamazoo", "Saginaw"];

export default function AirQualityPage() {
  usePageMeta({
    title: "Michigan Air Quality by County | Access Michigan",
    description: "County-level air quality data for Michigan. Source: EPA AirNow.",
    path: "/environment/air",
  });

  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const { data: facilities, isLoading } = useECHOFacilities(selectedCounty);

  const totalFacilities = facilities?.length ?? 0;
  const withViolations = facilities?.filter(f => f.violations12mo > 0).length ?? 0;
  const triReporters = facilities?.filter(f => f.triReporter).length ?? 0;
  const totalEnforcement = facilities?.reduce((s, f) => s + f.formalEnfActions3yr, 0) ?? 0;

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Environment", href: "/environment" }, { label: "Air Quality & Toxics" }]} />

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-500/10 via-primary/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Wind className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Air Quality & Toxic Environment</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Breathe Easy — Know What's Near You
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground">
              Live AQI monitoring, EPA-regulated facility tracking, and toxic release data for Michigan counties. 60+ Superfund sites. Thousands of regulated facilities.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="text-xs text-muted-foreground/70 mt-2">AirNow API · EPA ECHO · EPA TRI · EPA NPL</motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        {/* Live AQI */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wind className="h-4 w-4 text-primary" />
              Live Air Quality
            </CardTitle>
            <p className="text-xs text-muted-foreground">Real-time AQI from EPA AirNow monitoring stations across Michigan</p>
          </CardHeader>
          <CardContent>
            <AirQualityChecker />
          </CardContent>
        </Card>

        {/* EPA ECHO Facility Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="h-4 w-4 text-amber-600" />
              EPA ECHO Facility Tracker (Live)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Select a county to see EPA-regulated facilities, violations, and enforcement actions. Source: EPA ECHO API
            </p>
          </CardHeader>
          <CardContent>
            <Select value={selectedCounty ?? ""} onValueChange={v => setSelectedCounty(v || null)}>
              <SelectTrigger className="w-52 mb-4"><SelectValue placeholder="Select county" /></SelectTrigger>
              <SelectContent>
                {COUNTIES.map(c => <SelectItem key={c} value={c}>{c} County</SelectItem>)}
              </SelectContent>
            </Select>

            {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" /> Querying EPA ECHO...</div>}

            {facilities && facilities.length > 0 && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{totalFacilities}</p>
                    <p className="text-[10px] text-muted-foreground">Regulated Facilities</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className={`text-2xl font-bold tabular-nums ${withViolations > 0 ? "text-red-600" : "text-foreground"}`}>{withViolations}</p>
                    <p className="text-[10px] text-muted-foreground">With Violations (12mo)</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{triReporters}</p>
                    <p className="text-[10px] text-muted-foreground">TRI Reporters</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className={`text-2xl font-bold tabular-nums ${totalEnforcement > 0 ? "text-amber-600" : "text-foreground"}`}>{totalEnforcement}</p>
                    <p className="text-[10px] text-muted-foreground">Enforcement Actions (3yr)</p>
                  </div>
                </div>

                {/* Top violating facilities */}
                {withViolations > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Facilities with Recent Violations</p>
                    <div className="space-y-2">
                      {facilities.filter(f => f.violations12mo > 0).slice(0, 5).map(f => (
                        <div key={f.id} className="rounded-lg border border-red-200/50 dark:border-red-900/30 p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{f.name}</p>
                              <p className="text-[10px] text-muted-foreground">{f.address}, {f.city}</p>
                            </div>
                            <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                              {f.violations12mo} violation{f.violations12mo !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {f.programs.map(p => <Badge key={p} variant="outline" className="text-[9px]">{p}</Badge>)}
                            {f.triReporter && <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-600">TRI Reporter</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[9px] text-muted-foreground/60">Source: EPA ECHO Enforcement & Compliance History Online. Data is live from EPA API.</p>
              </div>
            )}
            {facilities && facilities.length === 0 && selectedCounty && (
              <p className="text-sm text-muted-foreground py-4">No active regulated facilities found for {selectedCounty} County in EPA ECHO. This may indicate an API limitation — check echo.epa.gov directly.</p>
            )}
          </CardContent>
        </Card>

        {/* SE Michigan Air Equity Callout */}
        <Card className="border-red-200/50 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10">
          <CardContent className="py-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Southeast Michigan Air Quality & Equity</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Southeast Michigan has historically been one of the most polluted air quality regions in the Midwest,
                  with Wayne County ranking among the worst nationally for PM2.5-related mortality risk.
                  Communities in southwest Detroit, Dearborn, and River Rouge face disproportionate exposure to industrial emissions.
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-2">Source: American Lung Association State of the Air · EPA EJSCREEN</p>
                <Link to="/equity" className="text-xs text-primary hover:underline mt-2 inline-block">
                  See Health Equity Scorecard →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button asChild variant="outline">
          <Link to="/environment"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Environment</Link>
        </Button>
      </div>
    </Layout>
  );
}
