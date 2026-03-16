import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, FileText, Globe, Activity, Shield, DollarSign, Users, Briefcase, Heart, ClipboardList, Info } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import EmbedShowcase from "@/components/partners/EmbedShowcase";
import PrintButton from "@/components/shared/PrintButton";
import { Link } from "react-router-dom";

const fade = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

const STATS = [
  { icon: MapPin, value: 83, label: "Counties Covered", suffix: "" },
  { icon: FileText, value: 15000, label: "Resources Indexed", suffix: "+" },
  { icon: Activity, value: 8, label: "Data Sources", suffix: "" },
  { icon: Globe, value: 4, label: "Languages", suffix: "" },
  { icon: Shield, value: 0, label: "Personal Data Collected", suffix: "" },
  { icon: DollarSign, value: 0, label: "Cost to Users", suffix: "" },
];

const TIMELINE = [
  { version: "v1.0", date: "Dec 2024", title: "Foundation", desc: "83-county coverage, Find Care, community resources, health map" },
  { version: "v1.1", date: "Jan 2025", title: "Data Layer", desc: "Census ACS integration, county comparisons, data explorer" },
  { version: "v1.2", date: "Feb 2025", title: "Civic Access", desc: "Elections, officials, transparency, public safety pages" },
  { version: "v1.3", date: "Feb 2025", title: "Intelligence Suite", desc: "CHNA Explorer, equity scorecard, market intelligence" },
  { version: "v1.4", date: "Mar 2025", title: "Partner Tools", desc: "Detection Gap, quality comparison, energy burden dashboard" },
];

const PERSONAS = [
  { icon: Users, title: "Uninsured Resident", desc: "Finds free clinics, sliding-scale providers, and Medicaid enrollment help across their county — no account required.", color: "text-primary" },
  { icon: Heart, title: "Community Health Worker", desc: "Quickly locates food pantries, housing assistance, and transportation for clients using ZIP-level search.", color: "text-destructive" },
  { icon: Briefcase, title: "Hospital CHNA Team", desc: "Explores county-level health indicators, SVI scores, and facility gaps for community health needs assessments.", color: "text-[hsl(var(--michigan-teal))]" },
  { icon: ClipboardList, title: "Grant Writer", desc: "Downloads equity data, energy burden metrics, and regional comparisons for HRSA and SAMHSA applications.", color: "text-[hsl(var(--michigan-gold))]" },
];

const SOURCES = [
  "CDC SVI 2022", "County Health Rankings 2025", "CMS Hospital Compare", "HRSA HPSA",
  "CDC PLACES & BRFSS", "MDHHS Health Equity Data", "ACEEE LEAD Tool", "U.S. Census ACS",
];

function AnimatedStat({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: typeof MapPin }) {
  const count = useCountUp(value, 2000);
  return (
    <Card className="text-center hover:shadow-md transition-shadow">
      <CardContent className="pt-6 pb-4">
        <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
        <p className="text-3xl font-bold text-primary">{value === 0 ? "$0" : count.toLocaleString()}{suffix}</p>
        <p className="text-xs font-semibold text-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function ImpactDashboardPage() {
  usePageMeta({
    title: "Platform Impact — Access Michigan",
    description: "Access Michigan platform impact metrics: 83 counties, 15,000+ resources, 8 data sources, 4 languages, zero cost.",
    path: "/impact",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Partners", href: "/partners" }, { label: "Platform Impact" }]} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container max-w-5xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fade} custom={0}>
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs">Platform Impact</Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">Building Infrastructure for Health Equity</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">Access Michigan aggregates 8 public datasets across all 83 counties to surface actionable insights for residents, health systems, and community organizations.</p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Animated stats */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {STATS.map((s, i) => (
              <motion.div key={s.label} variants={fade} custom={i}>
                <AnimatedStat {...s} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Separator />

        {/* Timeline */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Platform Evolution</h2>
          <div className="space-y-4">
            {TIMELINE.map((t, i) => (
              <motion.div key={t.version} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card>
                  <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="default">{t.version}</Badge>
                      <span className="text-xs text-muted-foreground">{t.date}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Data sources */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Data Source Authority</h2>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
          </div>
          <p className="text-xs text-muted-foreground mt-3">All data from public, authoritative sources. No commercial data providers. See <Link to="/methodology" className="text-primary hover:underline">Methodology</Link>.</p>
        </section>

        <Separator />

        {/* How it helps */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">How It Helps</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PERSONAS.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <p.icon className={`h-6 w-6 mb-3 ${p.color}`} />
                    <h3 className="text-sm font-bold text-foreground mb-1">{p.title}</h3>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Embed showcase */}
        <EmbedShowcase />

        {/* Source footer */}
        <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Access Michigan is a nonpartisan, citizen-built open data gateway. All platform statistics reflect current data. No personal data is collected or stored. See <Link to="/about" className="text-primary hover:underline">About</Link> for project information.
          </p>
        </div>
      </div>
      <PrintButton />
    </Layout>
  );
}
