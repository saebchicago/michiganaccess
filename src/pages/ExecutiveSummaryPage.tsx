import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, Lightbulb, BarChart3, ArrowRight, Building2, Heart, Landmark, MapPin, Globe, Brain, Bus, FileText, Info } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const quadrants = [
  {
    icon: AlertTriangle,
    title: "THE CHALLENGE",
    color: "border-destructive/30",
    stats: [
      { text: "60% fewer mental health providers per capita in northern Michigan vs. state average", source: "HRSA HPSA" },
      { text: "50–80% of insurance denials go uncontested nationally", source: "Kaiser Family Foundation, 2023" },
      { text: "60–70% of SDOH referrals go uncompleted due to fragmented directories", source: "ASPE/HHS, 2022" },
      { text: "Public health data scattered across 83 county departments and federal portals", source: "Platform analysis" },
    ],
  },
  {
    icon: Lightbulb,
    title: "THE APPROACH",
    color: "border-primary/30",
    stats: [
      { text: "Equity-centered navigation with Social Vulnerability Index (SVI) integration", source: "CDC/ATSDR SVI" },
      { text: "83-county unified resource directory with 700+ verified services", source: "Platform database" },
      { text: "Real-time data aggregation from 15+ public sources (CMS, HRSA, CDC, MDHHS)", source: "Data validation page" },
      { text: "AI-powered insurance appeal generator with Michigan-specific legal references", source: "MCL 500.2213" },
    ],
  },
  {
    icon: BarChart3,
    title: "THE POTENTIAL",
    color: "border-emerald-500/30",
    stats: [
      { text: "Geospatial gap analysis to identify underserved corridors across all 83 counties", source: "HRSA HPSA data" },
      { text: "Transit-health intersection mapping using live GTFS feeds", source: "GTFS real-time" },
      { text: "Denial appeal automation covering 24 common denial categories", source: "Platform templates" },
      { text: "Multi-language access (EN/ES/AR/BN) for Michigan's diverse populations", source: "Platform capability" },
    ],
  },
  {
    icon: Globe,
    title: "THE FOUNDATION",
    color: "border-amber-500/30",
    stats: [
      { text: "Built on authoritative public data: CMS, HRSA, CDC, MDHHS, EPA, EIA, NWS", source: "15+ sources" },
      { text: "Privacy-first: no accounts, no cookies, no tracking, no ads", source: "Privacy policy" },
      { text: "Open civic infrastructure — free for all Michigan residents", source: "Platform policy" },
      { text: "Community Health Needs Assessment (CHNA) alignment for IRS Schedule H", source: "IRS requirements" },
    ],
  },
];

const audiences = [
  { icon: Building2, label: "Health Systems", cta: "Explore System Integration", link: "/for-health-systems" },
  { icon: Heart, label: "Nonprofits", cta: "View Impact Scenarios", link: "/impact" },
  { icon: Landmark, label: "Policymakers", cta: "See Equity Framework", link: "/equity" },
];

const ExecutiveSummaryPage = () => {
  usePageMeta({
    title: "Executive Summary — Access Michigan",
    description: "Access Michigan: a civic health navigation platform aggregating 15+ public data sources across all 83 Michigan counties to support health equity and community navigation.",
    path: "/executive-summary",
  });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary">Executive Summary</Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">Access Michigan: Civic Health Infrastructure</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A statewide population health navigation platform aggregating public data across all 83 Michigan counties to support health equity, community navigation, and institutional planning.
            </p>
          </motion.div>

          {/* Platform Facts — verifiable only */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-10">
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/[0.03] overflow-hidden">
              <CardContent className="py-6 px-6 md:px-10">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-5 text-center">Platform at a Glance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                  {[
                    { value: "83", label: "Counties covered", sub: "100% of Michigan" },
                    { value: "700+", label: "Resources verified", sub: "Health · Housing · Food" },
                    { value: "15+", label: "Public data sources", sub: "CMS · HRSA · CDC · MDHHS" },
                    { value: "4", label: "Languages supported", sub: "EN · ES · AR · BN" },
                  ].map((s) => (
                    <div key={s.label} className="space-y-1">
                      <p className="text-2xl md:text-3xl font-black text-primary tabular-nums">{s.value}</p>
                      <p className="text-xs font-semibold text-foreground">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 md:gap-4 text-[10px] text-muted-foreground flex-wrap">
                  {["Quality-ranked (not pay-to-play)", "Equity-adjusted scoring", "Privacy-first (no tracking)", "Free & no login required"].map((t) => (
                    <span key={t} className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />{t}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Disclaimer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="rounded-xl border-2 border-michigan-gold/30 bg-michigan-gold/5 p-5 mb-10">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 shrink-0 text-michigan-gold" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Public Beta:</strong> Access Michigan is a new civic resource. Statistics below reflect platform capabilities and publicly sourced data points — not measured platform outcomes. Exploratory impact scenarios are available on the <Link to="/case-studies" className="text-primary hover:underline">Case Studies</Link> page.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 mb-12">
            {quadrants.map((q, i) => (
              <motion.div key={q.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className={`h-full ${q.color}`}>
                  <CardContent className="py-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <q.icon className="h-5 w-5 text-primary" />
                      <h2 className="font-bold text-foreground tracking-wider text-sm">{q.title}</h2>
                    </div>
                    <ul className="space-y-2">
                      {q.stats.map((s) => (
                        <li key={s.text} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                          <span>{s.text} <span className="text-[9px] italic text-muted-foreground/70">({s.source})</span></span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="mb-10">
            <CardContent className="py-6">
              <h2 className="text-sm font-bold text-foreground mb-4">For Your Organization</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {audiences.map((a) => (
                  <Button key={a.label} asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link to={a.link}>
                      <a.icon className="h-5 w-5 text-primary" />
                      <span className="text-xs font-semibold">{a.label}</span>
                      <span className="text-[10px] text-muted-foreground">{a.cta}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild><Link to="/case-studies" className="gap-2">View Case Studies <ArrowRight className="h-4 w-4" /></Link></Button>
            <ShareButton title="Access Michigan — Executive Summary" description="Civic health navigation platform: 83 counties, 700+ resources, 15+ public data sources." />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ExecutiveSummaryPage;
