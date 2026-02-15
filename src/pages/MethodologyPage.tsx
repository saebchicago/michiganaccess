import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Database, Shield, Users, Accessibility, Languages, Globe, Eye,
  ArrowRight, BarChart3, Heart, CheckCircle2, Info, Layers,
  Monitor, Phone, Printer, FileText, Scale
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const flowSteps = [
  {
    icon: Database,
    title: "Public Data Sources",
    color: "bg-primary/10 text-primary",
    items: [
      "Federal: CMS, CDC PLACES, HRSA, Census",
      "State: MI DHHS, Budget Office",
      "Local: Counties, transit authorities",
    ],
  },
  {
    icon: Shield,
    title: "Quality Assurance Layer",
    color: "bg-michigan-forest/10 text-michigan-forest",
    items: [
      "Automated validation checks",
      "Cross-source verification",
      "Freshness indicators on every metric",
    ],
  },
  {
    icon: Users,
    title: "User-Centered Presentation",
    color: "bg-michigan-teal/10 text-michigan-teal",
    items: [
      "Plain language (8th-grade level)",
      "Mobile-first responsive design",
      "WCAG 2.1 AA accessibility",
      "Persistent crisis resources",
    ],
  },
  {
    icon: Heart,
    title: "Community Outcomes",
    color: "bg-michigan-coral/10 text-michigan-coral",
    items: [
      "Reduced barriers to care",
      "Informed civic participation",
      "Data-driven resource allocation",
    ],
  },
];

const equityPrinciples = [
  {
    icon: Accessibility,
    title: "Universal Design From Lived Experience",
    desc: "Every feature tested through personas representing uninsured individuals, limited English proficiency, cognitive disabilities, low digital literacy, and rural isolation.",
    example: "Safety-net clinics surfaced first in search results, not buried beneath others.",
  },
  {
    icon: Scale,
    title: "Dignity in Information Architecture",
    desc: 'No shaming language. Financial assistance presented as a normal pathway, not an exception.',
    example: '"Sliding scale based on income" — not "free care" or "charity care."',
  },
  {
    icon: Eye,
    title: "Progressive Disclosure for Cognitive Accessibility",
    desc: "Complex data starts simple; users choose depth. No information overload.",
    example: 'Hospital quality shows "95/100" upfront; click expands to 15 detailed metrics.',
  },
  {
    icon: Layers,
    title: "Multi-Modal Access",
    desc: "Visual (maps, charts), textual (summaries), actionable (phone numbers, directions).",
    example: "Download options for screen readers, print-optimized resource pages.",
  },
];

const scoringWeights = [
  { label: "Geographic Access", pct: 40, color: "bg-primary", desc: "Drive time from user location (not straight-line distance)" },
  { label: "Clinical Quality", pct: 30, color: "bg-michigan-forest", desc: "CMS scores + Leapfrog grades + specialty accreditations" },
  { label: "Service Comprehensiveness", pct: 15, color: "bg-michigan-teal", desc: "Integrated services (behavioral health, social work, telehealth)" },
  { label: "Digital Accessibility", pct: 15, color: "bg-michigan-sky", desc: "Online scheduling, language services, patient portals" },
];

export default function MethodologyPage() {
  usePageMeta({ title: "Data Methodology", description: "A replicable framework for integrating fragmented public datasets into accessible, equity-centered civic infrastructure.", path: "/methodology" });
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Methodology" }]} />
          <motion.span initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Data Methodology
          </motion.span>
          <motion.h1 variants={fade} custom={1} initial="hidden" animate="visible" className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
            How We Transform Public Data Into Community Impact
          </motion.h1>
          <motion.p variants={fade} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A replicable framework for integrating fragmented datasets into accessible, equity-centered civic infrastructure.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Data Integration Framework */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Data Integration Framework</h2>
                <p className="text-sm text-muted-foreground">From raw public data to actionable community resource</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-4">
            {flowSteps.map((step, i) => (
              <motion.div key={step.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i} className="relative">
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${step.color.split(" ")[0]}`}>
                      <step.icon className={`h-5 w-5 ${step.color.split(" ")[1]}`} />
                    </div>
                    <h3 className="mb-2 text-sm font-bold text-foreground">{step.title}</h3>
                    <ul className="space-y-1">
                      {step.items.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-michigan-forest" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {i < flowSteps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Equity-Centered Design Principles */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-coral/10">
                <Heart className="h-5 w-5 text-michigan-coral" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Equity-Centered Design Principles</h2>
                <p className="text-sm text-muted-foreground">Every decision filtered through health equity</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {equityPrinciples.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <p.icon className="mb-3 h-5 w-5 text-michigan-coral" />
                    <h3 className="mb-1 text-sm font-bold text-foreground">{p.title}</h3>
                    <p className="mb-3 text-xs text-muted-foreground">{p.desc}</p>
                    <div className="rounded-md bg-muted/50 p-2.5 border border-border">
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Example:</span> {p.example}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Quality Ranking Methodology */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10">
                <BarChart3 className="h-5 w-5 text-michigan-forest" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Quality Ranking Methodology</h2>
                <p className="text-sm text-muted-foreground">Transparent, reproducible composite scoring</p>
              </div>
            </div>
          </motion.div>

          {/* Formula */}
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Composite Score Formula</p>
            <p className="font-mono text-sm text-foreground leading-relaxed">
              COMPOSITE = <span className="text-primary font-bold">40%</span> Geographic Access + <span className="text-michigan-forest font-bold">30%</span> Clinical Quality + <span className="text-michigan-teal font-bold">15%</span> Service Comprehensiveness + <span className="text-michigan-sky font-bold">15%</span> Digital Accessibility
            </p>
          </div>

          {/* Weight bars */}
          <div className="space-y-4 mb-8">
            {scoringWeights.map((w, i) => (
              <motion.div key={w.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{w.label}</span>
                  <span className="text-sm font-bold text-primary">{w.pct}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted">
                  <motion.div
                    className={`h-full rounded-full ${w.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${w.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{w.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Equity Override */}
          <div className="rounded-xl border-2 border-michigan-coral/30 bg-michigan-coral/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-michigan-coral" />
              <h3 className="text-sm font-bold text-foreground">Equity Override Rules</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Safety-net facilities (FQHCs, free clinics) receive automatic visibility boost",
                "Filters never completely hide safety-net options",
                '"Recommended for uninsured patients" callouts displayed alongside quality badges',
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-michigan-coral" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Side-by-side comparison */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <h4 className="mb-3 text-sm font-bold text-destructive">Standard Distance Ranking</h4>
                <ol className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Large Health System — 2.1 mi</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Specialty Practice — 3.4 mi</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Private Clinic — 4.0 mi</li>
                  <li className="flex gap-2 opacity-50"><span className="font-bold text-foreground">7.</span> FQHC (Safety-Net) — 5.8 mi</li>
                </ol>
                <p className="mt-3 text-[11px] text-destructive/80">⚠ Safety-net clinic buried at position 7 despite being most relevant for uninsured</p>
              </CardContent>
            </Card>
            <Card className="border-michigan-forest/20">
              <CardContent className="pt-6">
                <h4 className="mb-3 text-sm font-bold text-michigan-forest">Equity-Adjusted Ranking</h4>
                <ol className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Large Health System — 2.1 mi <span className="text-michigan-forest">· Quality: A</span></li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> <span className="font-semibold text-michigan-forest">FQHC — 5.8 mi · "No one turned away"</span></li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Specialty Practice — 3.4 mi</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">4.</span> Private Clinic — 4.0 mi</li>
                </ol>
                <p className="mt-3 text-[11px] text-michigan-forest">✅ Safety-net clinic elevated with equity boost for vulnerable populations</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}
