import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Eye, Users } from "lucide-react";
import { Link } from "react-router-dom";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function PortfolioPage() {
  usePageMeta({
    title: "Portfolio - Access Michigan",
    description: "Three civic intelligence tools built to make complex health and strategic decisions legible.",
    path: "/portfolio",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-teal/5 to-background py-16 lg:py-24">
        <div className="container max-w-5xl text-center">
          <Breadcrumbs items={[{ label: "Portfolio" }]} />
          <motion.div initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4">
            <Badge className="rounded-full bg-michigan-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-teal border-michigan-teal/20">
              Civic Intelligence Portfolio
            </Badge>
          </motion.div>
          <motion.h1
            variants={fade} custom={1} initial="hidden" animate="visible"
            className="mb-4 text-3xl font-bold text-foreground lg:text-5xl"
          >
            Three Tools. One Philosophy.
          </motion.h1>
          <motion.p
            variants={fade} custom={2} initial="hidden" animate="visible"
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Make complexity legible - for patients, clinicians, executives, and strategists.
            Each platform is live, free, and built on public data.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-8">

        {/* Platform Cards */}
        <div className="space-y-6">

          {/* Card 1 - accessmi.org */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <Card className="border-l-4 border-l-michigan-teal overflow-hidden">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs border-michigan-teal/30 text-michigan-teal">
                      Population Health Infrastructure
                    </Badge>
                    <h2 className="text-xl font-bold text-foreground">Access Michigan</h2>
                    <a
                      href="https://accessmi.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-michigan-teal hover:underline"
                    >
                      accessmi.org
                    </a>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Health system BD · Strategy teams · Residents
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Civic platform mapping healthcare access, financial assistance, and social services
                  across Michigan's 83 counties - with a live business development financial scenario
                  modeler built on CDC SVI and HRSA data.
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    "BD financial modeler: service line NPV, build vs. partner vs. acquire, SDOH ROI - all interactive, all sourced",
                    "83-county market opportunity scoring using CDC Social Vulnerability Index and HRSA shortage area data",
                    "SDOH financial impact modeling anchored to Henry Ford Health and Trinity Health published outcomes",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-michigan-teal" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Button asChild size="sm" className="bg-michigan-teal hover:bg-michigan-teal/90 text-white">
                  <Link to="/bd-financial-model">Open BD Modeler →</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2 - chronicintel.com */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={1}>
            <Card className="border-l-4 border-l-blue-500 overflow-hidden">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs border-blue-500/30 text-blue-600">
                      Clinical Decision Intelligence
                    </Badge>
                    <h2 className="text-xl font-bold text-foreground">Chronic Intelligence</h2>
                    <a
                      href="https://chronicintel.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      chronicintel.com
                    </a>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    CMIOs · Clinical strategists · Researchers
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Decision intelligence for chronic disease - epidemiology, clinical trial pipelines,
                  equity signals, and innovation scoring across 301 conditions. Role-adaptive content
                  for clinicians, researchers, and executives.
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    "301 conditions mapped against active clinical trial pipelines and pharma R&D activity",
                    "Equity flags marking documented racial, socioeconomic, and sex-based disparities in diagnosis and treatment",
                    "Instant structured PDF reports - client-side generation, no data transmitted, no account required",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Button asChild size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  <a href="https://chronicintel.com" target="_blank" rel="noopener noreferrer">
                    Explore Platform →
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3 - decisionplay.app */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={2}>
            <Card className="border-l-4 border-l-amber-500 overflow-hidden">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs border-amber-500/30 text-amber-600">
                      Strategic Situation Analysis
                    </Badge>
                    <h2 className="text-xl font-bold text-foreground">DecisionPlay</h2>
                    <a
                      href="https://decisionplay.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-600 hover:underline"
                    >
                      decisionplay.app
                    </a>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Executives · BD teams · Transformation leaders
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste any strategic situation - a negotiation, a transformation initiative, a tough
                  call - and instantly see the game theory underneath. Who has leverage, what the
                  incentives are, what moves are available.
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    "Game theory engine that surfaces leverage, incentives, and strategic structure from plain-language descriptions",
                    "Healthcare transformation scenario pack: JVs, AI proposals, build vs. acquire decisions, M&A dynamics",
                    "Runs entirely in the browser - no account, no server, no data stored. Private by architecture.",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                  <a href="https://decisionplay.app" target="_blank" rel="noopener noreferrer">
                    Analyze a Situation →
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Philosophy section */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
          className="pt-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">A Consistent Philosophy</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "No accounts required",
                text: "Every tool works instantly, without signup. The lowest barrier to insight is no barrier at all.",
              },
              {
                icon: Eye,
                title: "Transparent methodology",
                text: "Public data, cited sources, explainable outputs. No black boxes. No paid placements.",
              },
              {
                icon: Users,
                title: "Built for the decision-maker",
                text: "Not for the data scientist. Complexity is handled by the platform - not exported to the user.",
              },
            ].map((col, i) => (
              <motion.div key={col.title} variants={fade} custom={i + 1}>
                <Card className="text-center hover-lift h-full">
                  <CardContent className="pt-6 pb-5">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10">
                        <col.icon className="h-5 w-5 text-michigan-teal" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-2">{col.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{col.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}
