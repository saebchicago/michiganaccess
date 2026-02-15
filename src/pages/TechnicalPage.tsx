import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Monitor, Server, Database, Shield, Zap, Globe,
  ArrowDown, CheckCircle2, Layers, Lock, Eye,
  Smartphone, BarChart3, Code, Cloud
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const archLayers = [
  {
    title: "User Layer",
    icon: Monitor,
    color: "bg-primary text-primary-foreground",
    items: [
      "Browser (mobile-first responsive)",
      "Accessibility: WCAG 2.1 AA, ARIA labels, screen reader tested",
      "Performance: <3s load on 3G, lazy-loaded maps/charts",
    ],
  },
  {
    title: "Application Layer",
    icon: Code,
    color: "bg-michigan-teal text-accent-foreground",
    items: [
      "Frontend: React 18 + TypeScript + Tailwind CSS + Framer Motion",
      "Build: Vite with code splitting, tree shaking",
      "State: React Query for caching, optimistic updates",
    ],
  },
  {
    title: "Edge Compute Layer",
    icon: Cloud,
    color: "bg-michigan-forest text-primary-foreground",
    items: [
      "Serverless Edge Functions (Deno runtime)",
      "Rate limiting: 100 requests/min per IP",
      "Caching: 1-hour cache for external API responses",
    ],
  },
  {
    title: "Data Layer",
    icon: Database,
    color: "bg-michigan-navy text-primary-foreground",
    items: [
      "PostgreSQL (primary database)",
      "Row Level Security (RLS) for multi-tenancy",
      "External APIs: CMS Hospital Compare, CDC PLACES, HRSA Data Warehouse",
    ],
  },
];

const securityItems = [
  { icon: Lock, text: "No PII/PHI collection (public data only)" },
  { icon: Shield, text: "HTTPS everywhere, CSP headers" },
  { icon: Eye, text: "Public sector ready: 508 compliance, plain language" },
  { icon: Globe, text: "No cookies, no tracking, privacy-first analytics" },
];

const scalabilityMetrics = [
  { label: "Page Views/Month", value: "1M+", desc: "With edge caching" },
  { label: "p95 Page Load", value: "<3s", desc: "Sub-3-second latency" },
  { label: "Counties Covered", value: "83", desc: "All Michigan counties" },
  { label: "Providers", value: "20,000+", desc: "Facilities + individual providers" },
];

const growthPlan = [
  { title: "Horizontal Scaling", desc: "Connection pooling + read replicas for high-traffic periods", icon: Server },
  { title: "Geographic CDN", desc: "CDN distribution for statewide latency <100ms", icon: Globe },
  { title: "White-Label Ready", desc: "Replicable architecture for other states (Ohio, Indiana, Wisconsin)", icon: Layers },
];

export default function TechnicalPage() {
  usePageMeta({ title: "Technical Architecture", description: "Production-grade architecture with public sector considerations for scale and impact.", path: "/technical" });
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-navy/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Technical Architecture" }]} />
          <motion.span initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4 inline-block rounded-full bg-michigan-navy/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-navy">
            Technical Architecture
          </motion.span>
          <motion.h1 variants={fade} custom={1} initial="hidden" animate="visible" className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
            Built for Scale, Designed for Impact
          </motion.h1>
          <motion.p variants={fade} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Production-grade architecture with public sector considerations.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Architecture Diagram */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">System Architecture</h2>
                <p className="text-sm text-muted-foreground">Four-layer stack with security at every tier</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {archLayers.map((layer, i) => (
              <motion.div key={layer.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className={`flex items-center gap-3 px-5 py-4 sm:w-56 ${layer.color}`}>
                        <layer.icon className="h-5 w-5" />
                        <span className="text-sm font-bold">{layer.title}</span>
                      </div>
                      <div className="flex-1 p-4">
                        <ul className="space-y-1">
                          {layer.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-michigan-forest" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {i < archLayers.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Security */}
          <div className="mt-8 rounded-xl border-2 border-michigan-forest/20 bg-michigan-forest/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-michigan-forest" />
              <h3 className="text-sm font-bold text-foreground">Security & Compliance</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {securityItems.map((s) => (
                <div key={s.text} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <s.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-michigan-forest" />
                  {s.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Scalability */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10">
                <Zap className="h-5 w-5 text-michigan-teal" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Scalability Strategy</h2>
                <p className="text-sm text-muted-foreground">Current capacity and growth plan</p>
              </div>
            </div>
          </motion.div>

          {/* Current metrics */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
            {scalabilityMetrics.map((m, i) => (
              <motion.div key={m.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="text-center hover-lift">
                  <CardContent className="pt-6 pb-4">
                    <p className="text-2xl font-bold text-primary">{m.value}</p>
                    <p className="text-xs font-semibold text-foreground mt-1">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Growth plan */}
          <div className="grid gap-4 sm:grid-cols-3">
            {growthPlan.map((g, i) => (
              <motion.div key={g.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <g.icon className="mb-3 h-5 w-5 text-michigan-teal" />
                    <h4 className="mb-1 text-sm font-bold text-foreground">{g.title}</h4>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
