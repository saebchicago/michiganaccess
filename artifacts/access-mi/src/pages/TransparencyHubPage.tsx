import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  Users,
  Vote,
  ArrowRight,
  Shield,
  Info,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MICHIGAN_POLITICAL_PARTY_COUNT } from "@/config/platformConstants";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function TransparencyHubPage() {
  usePageMeta({
    title: "Transparency Intelligence - Access Michigan",
    description:
      "Public money. Public contracts. Public officials. Federal contractors, lobbying, campaign finance, all Michigan political parties - sourced from primary records.",
    path: "/transparency",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Transparency" }]} />

      {/* Hero - dark theme */}
      <section className="relative overflow-hidden bg-slate-900 py-16 md:py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5"
            >
              <Shield className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">
                Transparency Intelligence
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mb-4 text-4xl font-bold text-white md:text-5xl"
            >
              Michigan, in the open.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-slate-300"
            >
              Public money. Public contracts. Public officials. One place.
              Primary sources.
            </motion.p>
          </motion.div>

          {/* Animated stat row */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto"
          >
            {[
              {
                value: "$14.2B",
                label: "Federal Awards FY2024",
                source: "USASpending.gov",
                color: "text-amber-400",
              },
              {
                value: "2,000+",
                label: "Registered Lobbyists",
                source: "Michigan MiTN 2024",
                color: "text-teal-400",
              },
              {
                value: "8",
                label: "Political Parties",
                source: "Michigan SOS 2025",
                color: "text-white",
              },
              {
                value: "148",
                label: "State Legislators",
                source: "Michigan Legislature",
                color: "text-white",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i + 3}
                className="text-center"
              >
                <p
                  className={`text-2xl sm:text-3xl font-bold tabular-nums ${stat.color}`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                <p className="text-[9px] text-slate-500">{stat.source}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Navigation Panels */}
      <section className="container py-10">
        <h2 className="sr-only">Transparency data categories</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Building2,
              title: "Federal Contractors",
              desc: "Every federal contract awarded in Michigan - searchable by company, county, or industry. $14.2B in FY2024.",
              href: "/transparency/contractors",
              color: "text-amber-600",
              badge: "Live API",
            },
            {
              icon: DollarSign,
              title: "Follow the Money",
              desc: "Lobbying expenditures by industry, campaign finance explainers, and links to Michigan MiTN and OpenSecrets.",
              href: "/transparency/money",
              color: "text-teal-600",
              badge: "New",
            },
            {
              icon: Vote,
              title: "All Parties",
              desc: `All ${MICHIGAN_POLITICAL_PARTY_COUNT} Michigan political parties, equal treatment, identical format. Filing guides, petition requirements, ballot access comparison.`,
              href: "/transparency/parties",
              color: "text-primary",
              badge: "New",
            },
            {
              icon: Users,
              title: "Public Officials",
              desc: "Michigan Legislature, federal workforce data, state salary classifications, and nonprofit grant recipients.",
              href: "/transparency/officials",
              color: "text-michigan-forest-deep",
              badge: "New",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={card.href} className="block group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-lg bg-muted p-2.5 ${card.color}`}
                      >
                        <card.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {card.title}
                          </h3>
                          <Badge variant="outline" className="text-[9px]">
                            {card.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {card.desc}
                        </p>
                        <span className="text-xs text-primary mt-2 inline-flex items-center gap-1 group-hover:underline">
                          Explore <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Existing Transparency Resources */}
      <section className="container pb-10">
        <Card className="bg-muted/30">
          <CardContent className="py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                FOIA & Public Records
              </p>
              <p className="text-xs text-muted-foreground">
                Michigan FOIA portal, public records requests, and MuckRock
                archives
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/transparency/records">
                View Public Records Resources{" "}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Disclaimer */}
      <section className="container pb-12">
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                All data on this page is from public records: USASpending.gov,
                SAM.gov, Michigan MiTN, Open States, OPM FedScope, ProPublica
                Nonprofit Explorer. This platform does not endorse or critique
                any individual, organization, or party. All parties and
                contractors are shown equally.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
