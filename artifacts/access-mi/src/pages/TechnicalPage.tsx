import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Monitor, Server, Database, Shield, Zap, Globe,
  ArrowDown, CheckCircle2, Layers, Lock, Eye,
  Smartphone, BarChart3, Code, Cloud, FileText, Link2, Share2
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const archLayers = [
  {
    titleKey: "userLayer",
    icon: Monitor,
    color: "bg-primary text-primary-foreground",
    items: [
      "Browser (mobile-first responsive)",
      "Accessibility: WCAG 2.1 AA, ARIA labels, screen reader tested",
      "Performance: <3s load on 3G, lazy-loaded maps/charts",
    ],
  },
  {
    titleKey: "appLayer",
    icon: Code,
    color: "bg-michigan-teal text-accent-foreground",
    items: [
      "Frontend: React 18 + TypeScript + Tailwind CSS + Framer Motion",
      "Build: Vite with code splitting, tree shaking",
      "State: React Query for caching, optimistic updates",
    ],
  },
  {
    titleKey: "edgeLayer",
    icon: Cloud,
    color: "bg-michigan-forest text-primary-foreground",
    items: [
      "Serverless Edge Functions (Deno runtime)",
      "Rate limiting: 100 requests/min per IP",
      "Caching: 1-hour cache for external API responses",
    ],
  },
  {
    titleKey: "dataLayer",
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
  { labelKey: "pageViews", value: "1M+", desc: "With edge caching" },
  { labelKey: "pageLoad", value: "<3s", desc: "Sub-3-second latency" },
  { labelKey: "countiesCovered", value: "83", desc: "All Michigan counties" },
  { labelKey: "providersCount", value: "20,000+", desc: "Facilities + individual providers" },
];

const growthPlan = [
  { titleKey: "horizontalScaling", desc: "Connection pooling + read replicas for high-traffic periods", icon: Server },
  { titleKey: "geoCDN", desc: "CDN distribution for statewide latency <100ms", icon: Globe },
  { titleKey: "whiteLabelReady", desc: "Replicable architecture for other states (Ohio, Indiana, Wisconsin)", icon: Layers },
];

const interopStandards = [
  {
    icon: Share2,
    title: "FHIR R4 (Fast Healthcare Interoperability Resources)",
    desc: "Data model aligned with HL7 FHIR R4 resource types. Provider directories map to Practitioner, PractitionerRole, Organization, and Location resources. Enables future integration with health system EHRs and HIEs.",
    tags: ["HL7 FHIR R4", "RESTful API", "JSON"],
  },
  {
    icon: FileText,
    title: "USCDI v3 (US Core Data for Interoperability)",
    desc: "Data elements mapped to ONC's USCDI standard for patient access and clinical data exchange. Supports CMS Interoperability & Patient Access final rule compliance for partner health systems.",
    tags: ["ONC USCDI v3", "Patient Access API", "21st Century Cures"],
  },
  {
    icon: Link2,
    title: "HL7 CDA & ADT Integration-Ready",
    desc: "Architecture supports ingestion of HL7 v2 ADT messages and CDA documents for real-time bed availability, ED wait times, and discharge planning - critical for ambulatory network optimization.",
    tags: ["HL7 v2", "CDA R2", "ADT Messages"],
  },
];

export default function TechnicalPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("technicalPage.badge"), description: t("technicalPage.subtitle"), path: "/technical" });
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-navy/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: t("technicalPage.badge") }]} />
          <motion.span initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4 inline-block rounded-full bg-michigan-navy/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-navy">
            {t("technicalPage.badge")}
          </motion.span>
          <motion.h1 variants={fade} custom={1} initial="hidden" animate="visible" className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
            {t("technicalPage.title")}
          </motion.h1>
          <motion.p variants={fade} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("technicalPage.subtitle")}
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
                <h2 className="text-2xl font-bold text-foreground">{t("technicalPage.archTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("technicalPage.archSubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {archLayers.map((layer, i) => (
              <motion.div key={layer.titleKey} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className={`flex items-center gap-3 px-5 py-4 sm:w-56 ${layer.color}`}>
                        <layer.icon className="h-5 w-5" />
                        <span className="text-sm font-bold">{t(`technicalPage.${layer.titleKey}`)}</span>
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
              <h3 className="text-sm font-bold text-foreground">{t("technicalPage.securityTitle")}</h3>
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

        {/* Healthcare Interoperability Standards - NEW */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-coral/10">
                <Share2 className="h-5 w-5 text-michigan-coral" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("technicalPage.interopTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("technicalPage.interopSubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {interopStandards.map((std, i) => (
              <motion.div key={std.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="hover-lift">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-michigan-coral/10">
                        <std.icon className="h-5 w-5 text-michigan-coral" />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 text-sm font-bold text-foreground">{std.title}</h4>
                        <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{std.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {std.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-michigan-coral/10 px-2.5 py-0.5 text-[10px] font-semibold text-michigan-coral">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{t("technicalPage.interopNote")}</span>
            </p>
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
                <h2 className="text-2xl font-bold text-foreground">{t("technicalPage.scalabilityTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("technicalPage.scalabilitySubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
            {scalabilityMetrics.map((m, i) => (
              <motion.div key={m.labelKey} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="text-center hover-lift">
                  <CardContent className="pt-6 pb-4">
                    <p className="text-2xl font-bold text-primary">{m.value}</p>
                    <p className="text-xs font-semibold text-foreground mt-1">{t(`technicalPage.${m.labelKey}`)}</p>
                    <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {growthPlan.map((g, i) => (
              <motion.div key={g.titleKey} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <g.icon className="mb-3 h-5 w-5 text-michigan-teal" />
                    <h4 className="mb-1 text-sm font-bold text-foreground">{t(`technicalPage.${g.titleKey}`)}</h4>
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
