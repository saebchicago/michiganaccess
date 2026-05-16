import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, MapPin, ExternalLink, AlertTriangle, Heart } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MICHIGAN_TRIBAL_NATIONS, TRIBAL_HEALTH_SUMMARY } from "@/data/tribalNationsData";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

export default function TribalNationsPage() {
  usePageMeta({ title: "Michigan Tribal Nations — Access Michigan", description: "Michigan's 12 federally recognized tribal nations: sovereign health infrastructure, equity data, and community resources.", path: "/tribal-nations" });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Michigan Tribal Nations" }]} />

      <section className="relative overflow-hidden bg-gradient-to-br from-michigan-forest/10 via-primary/5 to-background py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <motion.div initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-michigan-forest/10 px-4 py-1.5">
              <Shield className="h-4 w-4 text-michigan-forest" />
              <span className="text-sm font-medium text-michigan-forest">Michigan Tribal Nations</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-3xl font-bold text-foreground md:text-4xl">12 Sovereign Nations</motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-base text-muted-foreground">
              Michigan's 12 federally recognized tribal nations operate as sovereign governments with their own health systems, social services, and governance structures. The health disparities documented here reflect systemic inequities — not tribal community characteristics.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Sovereignty Statement */}
      <section className="container py-6">
        <Card className="border-michigan-forest/20 bg-michigan-forest/[0.03]">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">{TRIBAL_HEALTH_SUMMARY.sovereigntyStatement}</p>
          </CardContent>
        </Card>
      </section>

      {/* Tribal Nation Cards */}
      <section className="container pb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">Tribal Nations & Health Infrastructure</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MICHIGAN_TRIBAL_NATIONS.map((tribe, i) => (
            <motion.div key={tribe.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
              <Card className="h-full">
                <CardContent className="py-4">
                  <h3 className="text-sm font-bold text-foreground mb-1">{tribe.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" /> {tribe.reservationCity}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-[9px]">{tribe.healthCenterType}</Badge>
                    {tribe.mihinParticipant && <Badge className="text-[9px] bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400">MiHIN</Badge>}
                    {tribe.clinicCount > 1 && <Badge variant="outline" className="text-[9px]">{tribe.clinicCount} clinics</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2"><span className="font-medium text-foreground">{tribe.healthCenterName}</span></p>
                  <p className="text-[10px] text-muted-foreground mb-2">Service area: {tribe.serviceAreaCounties.join(", ")}</p>
                  <div className="space-y-1 mb-2">
                    {tribe.keyHealthChallenges.slice(0, 3).map(c => <p key={c} className="text-[9px] text-muted-foreground">{"\u2022"} {c}</p>)}
                  </div>
                  {tribe.healthCenterUrl && (
                    <a href={tribe.healthCenterUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-1" aria-label={`${tribe.shortName} health center, opens in new window`}>
                      Health center <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                  <p className="text-[8px] text-muted-foreground/50 mt-2">{tribe.sources.join(" \u00B7 ")}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Regional Health Disparities */}
      <section className="container pb-10">
        <Card className="border-red-200/50 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Regional Health Disparities
            </CardTitle>
            <p className="text-xs text-muted-foreground">Statewide data for Michigan's Native American population. Tribal-specific data available through GLITEC dashboards.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 tabular-nums">{TRIBAL_HEALTH_SUMMARY.cancerMortalityAboveNational}%</p>
                <p className="text-xs text-muted-foreground">Cancer mortality above national AIAN rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 tabular-nums">{TRIBAL_HEALTH_SUMMARY.suidRateVsWhite}x</p>
                <p className="text-xs text-muted-foreground">SUID rate vs white infants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 tabular-nums">{TRIBAL_HEALTH_SUMMARY.nativeRentersUnaffordableHousing}%</p>
                <p className="text-xs text-muted-foreground">Native renters in unaffordable housing</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground tabular-nums">{TRIBAL_HEALTH_SUMMARY.tribesInMiHIN}</p>
                <p className="text-xs text-muted-foreground">of 12 tribes in MiHIN</p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground/60 mt-3">{TRIBAL_HEALTH_SUMMARY.source}</p>
          </CardContent>
        </Card>
      </section>

      {/* Resources */}
      <section className="container pb-12">
        <h2 className="text-base font-bold text-foreground mb-4">Resources & Partnerships</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Great Lakes Inter-Tribal Council (GLITC)", url: "https://www.glitc.org", desc: "AIAN health data for MI, MN, WI" },
            { name: "IHS Bemidji Area", url: "https://www.ihs.gov/bemidji", desc: "Federal Indian health facilities" },
            { name: "Inter-Tribal Council of Michigan", url: "https://www.itcmi.org", desc: "Tribal health center directory" },
            { name: "MDHHS Health Equity (PA 653)", url: "https://www.michigan.gov/mdhhs", desc: "Michigan health equity reports" },
            { name: "Bridge Michigan: Tribal Coverage", url: "https://www.bridgemi.com", desc: "Investigative reporting on tribal issues" },
          ].map(r => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="group" aria-label={`${r.name}, opens in new window`}>
              <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all">
                <CardContent className="py-3">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>
    </Layout>
  );
}
