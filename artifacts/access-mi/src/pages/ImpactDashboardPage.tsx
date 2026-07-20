import React from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Globe,
  Activity,
  Shield,
  DollarSign,
  Users,
  Briefcase,
  Heart,
  ClipboardList,
  Info,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import {
  DATA_SOURCE_COUNT,
  DATA_SOURCE_DISPLAY,
  LANGUAGES_SUPPORTED,
  COUNTIES_COVERED,
} from "@/config/platformConstants";
import EmbedShowcase from "@/components/partners/EmbedShowcase";
import { Link } from "react-router-dom";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

// @fabrication-allow: not external data - values are imported from the
// governed src/config/platformConstants.ts (COUNTIES_COVERED,
// DATA_SOURCE_COUNT, LANGUAGES_SUPPORTED); the two bare
// 0 literals ("Personal Data Collected", "Cost to Users") are platform
// policy statements, not empirical claims.
const STATS = [
  {
    icon: MapPin,
    value: COUNTIES_COVERED,
    label: "Counties Covered",
    suffix: "",
  },
  {
    icon: Activity,
    value: DATA_SOURCE_COUNT,
    label: "Data Sources",
    suffix: "",
  },
  { icon: Globe, value: LANGUAGES_SUPPORTED, label: "Languages", suffix: "" },
  { icon: Shield, value: 0, label: "Personal Data Collected", suffix: "" },
  { icon: DollarSign, value: 0, label: "Cost to Users", suffix: "" },
];

const PERSONAS = [
  {
    icon: Users,
    title: "Uninsured Resident",
    desc: "Finds free clinics, sliding-scale providers, and Medicaid enrollment help across their county - no account required.",
    color: "text-primary",
  },
  {
    icon: Heart,
    title: "Caregiver or Family Member",
    desc: "Quickly locates food pantries, housing assistance, and transportation for loved ones using ZIP-level search.",
    color: "text-destructive",
  },
  {
    icon: Briefcase,
    title: "Hospital CHNA Team",
    desc: "Explores county-level health indicators, SVI scores, and facility gaps for community health needs assessments.",
    color: "text-[hsl(var(--michigan-teal))]",
  },
  {
    icon: ClipboardList,
    title: "Grant Writer",
    desc: "Downloads equity data, energy burden metrics, and regional comparisons for HRSA and SAMHSA applications.",
    color: "text-[hsl(var(--michigan-gold))]",
  },
];

const SOURCES = [
  "CDC SVI 2022",
  "County Health Rankings 2025",
  "CMS Hospital Compare",
  "HRSA HPSA",
  "CDC PLACES & BRFSS",
  "MDHHS Health Equity Data",
  "ACEEE LEAD Tool",
  "U.S. Census ACS",
];

function AnimatedStat({
  value,
  suffix,
  label,
  icon: Icon,
  badge,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: typeof MapPin;
  badge?: React.ReactNode;
}) {
  const { value: count, ref } = useCountUp<HTMLDivElement>(value, 2000);
  // SSR/prerender + first-paint fallback: useCountUp starts at 0 until its
  // IntersectionObserver fires, so the static HTML would otherwise read
  // "0+ Data Sources" / "0 Languages". When count has not yet ticked above 0
  // but the target value is non-zero, render the target directly.
  const display = count === 0 && value !== 0 ? value : count;
  const isZeroTarget = value === 0;
  return (
    <Card className="text-center hover:shadow-md transition-shadow">
      <CardContent className="pt-6 pb-4" ref={ref}>
        <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
        <p className="text-3xl font-bold text-primary">
          {isZeroTarget ? "0" : display.toLocaleString()}
          {suffix}
        </p>
        <p className="text-xs font-semibold text-foreground mt-1">{label}</p>
        {badge && <div className="mt-2 flex justify-center">{badge}</div>}
      </CardContent>
    </Card>
  );
}

export default function ImpactDashboardPage() {
  usePageMeta({
    title: "Platform Impact - Access Michigan",
    description: `Access Michigan platform impact metrics: ${COUNTIES_COVERED} counties, ${DATA_SOURCE_DISPLAY} data sources, ${LANGUAGES_SUPPORTED} languages, zero cost.`,
    path: "/impact",
  });

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Partners", href: "/partners" },
          { label: "Platform Impact" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container max-w-5xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={0}
          >
            <Badge
              variant="outline"
              className="mb-3 uppercase tracking-wider text-xs"
            >
              Platform Impact
            </Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">
              Building Infrastructure for Health Equity
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Access Michigan aggregates {DATA_SOURCE_DISPLAY} public source
              organizations across all {COUNTIES_COVERED} counties to surface
              actionable insights for residents, health systems, and community
              organizations.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Animated stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fade}
          custom={0}
        >
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {STATS.map((s, i) => (
              <motion.div key={s.label} variants={fade} custom={i}>
                <AnimatedStat {...s} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Separator />

        {/* Platform evolution - links to the maintained changelog */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Platform Evolution
          </h2>
          <Card>
            <CardContent className="py-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access Michigan launched in December 2024 and is updated
                continuously. The complete, dated release history - every
                feature, data source, and fix - is maintained on the changelog.
              </p>
              <Link
                to="/changelog"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View the full changelog
              </Link>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Data sources */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Data Source Authority
          </h2>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            All data from public, authoritative sources. No commercial data
            providers. See{" "}
            <Link to="/methodology" className="text-primary hover:underline">
              Methodology
            </Link>
            .
          </p>
        </section>

        <Separator />

        {/* How it helps */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            How It Helps
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PERSONAS.map((p, i) => (
              <motion.div
                key={p.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fade}
                custom={i}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <p.icon className={`h-6 w-6 mb-3 ${p.color}`} />
                    <h3 className="text-sm font-bold text-foreground mb-1">
                      {p.title}
                    </h3>
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
            Access Michigan is a nonpartisan, citizen-built open data gateway.
            All platform statistics reflect current data. The site uses Google
            Analytics 4 for aggregated usage measurement; see{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy
            </Link>{" "}
            and{" "}
            <Link to="/about" className="text-primary hover:underline">
              About
            </Link>
            .
          </p>
        </div>
      </div>
    </Layout>
  );
}
