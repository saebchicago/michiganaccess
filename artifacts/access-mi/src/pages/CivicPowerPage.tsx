import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Landmark,
  Users,
  Vote,
  Building2,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Shield,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import SuggestResource from "@/components/community/SuggestResource";
import HelpfulVote from "@/components/community/HelpfulVote";
import { MICHIGAN_CIVIC_STATS } from "@/data/civicBoards";
import {
  MICHIGAN_RACE_DATA,
  STATE_UNCONTESTED_COMPARISON,
} from "@/data/uncontestedRaces";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

function getRegionColor(pct: number): string {
  if (pct >= 85) return "text-red-600";
  if (pct >= 75) return "text-orange-600";
  return "text-amber-600";
}

function getRegionBg(pct: number): string {
  if (pct >= 85)
    return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40";
  if (pct >= 75)
    return "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/40";
  return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40";
}

const CivicPowerPage = () => {
  usePageMeta({
    title: "Civic Power Map - Access Michigan",
    description:
      "Michigan's democracy has open seats. 79.7% of races uncontested. Find where to serve, who represents you, and where candidates are needed.",
    path: "/civic-power",
  });

  const stateCompData = useMemo(
    () =>
      [...STATE_UNCONTESTED_COMPARISON]
        .sort((a, b) => b.pct - a.pct)
        .map((s) => ({
          ...s,
          fill:
            s.state === "Michigan"
              ? "#dc2626"
              : s.state === "National Average"
                ? "#6b7280"
                : "#0A4C95",
        })),
    [],
  );

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Civic Power Map" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-michigan-teal/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5"
            >
              <Landmark className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Civic Power Map
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mb-4 text-4xl font-bold text-foreground md:text-5xl"
            >
              Democracy has open seats.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Most Michigan elections in 2024 had one candidate. Thousands of
              board seats sit empty. Start here.
            </motion.p>
            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-xs text-muted-foreground/70 mt-2"
            >
              Ballotpedia 2024 · CLOSUP MPPS 2025
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-6 flex flex-wrap justify-center gap-3"
            >
              <Button asChild size="lg">
                <Link to="/civic-power/boards">
                  Find Where to Serve <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/civic-power/races">Races That Need Candidates</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Crisis Counter Band */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600 tabular-nums">
                79.7%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                of Michigan races uncontested
              </p>
              <p className="text-[9px] text-muted-foreground/60">
                Ballotpedia 2024
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground tabular-nums">
                ~50,000
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                governing board seats statewide
              </p>
              <p className="text-[9px] text-muted-foreground/60">
                Estimated across all board types
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600 tabular-nums">
                22%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Detroit local election turnout
              </p>
              <p className="text-[9px] text-muted-foreground/60">
                Michigan SOS 2017
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 tabular-nums">
                38%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                of officials say residents are engaged
              </p>
              <p className="text-[9px] text-muted-foreground/60">
                CLOSUP MPPS 2025 (down from 58%)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="container py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Users,
              title: "Who Represents You",
              desc: "Enter your ZIP code and see every elected official and governing body - federal, state, county, and local.",
              href: "/officials",
              color: "text-primary",
            },
            {
              icon: BookOpen,
              title: "Where to Serve",
              desc: "15 types of governing boards where Michigan residents can apply. Health, housing, transit, environment, education - with how-to-apply guides.",
              href: "/civic-power/boards",
              color: "text-michigan-teal-deep",
              badge: "New",
            },
            {
              icon: Vote,
              title: "Races That Need Candidates",
              desc: "79.7% of Michigan races were uncontested in 2024. See which regions and office types have the greatest need - and how to file.",
              href: "/civic-power/races",
              color: "text-red-600",
              badge: "New",
            },
            {
              icon: Building2,
              title: "Federal Presence",
              desc: "7 major federal agencies, 140+ Michigan offices, and advisory committees with public nomination processes you may not know exist.",
              href: "/civic-power/federal",
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
                          {card.badge && (
                            <Badge variant="outline" className="text-[9px]">
                              {card.badge}
                            </Badge>
                          )}
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

      {/* State Comparison Chart */}
      <section className="container pb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Michigan vs. Midwest Peers - Uncontested Race Rate
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Source: Ballotpedia Analysis of Uncontested Elections 2024
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateCompData}
                  layout="vertical"
                  margin={{ left: 110 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    unit="%"
                  />
                  <YAxis
                    dataKey="state"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <ReferenceLine
                    x={70}
                    stroke="#6b7280"
                    strokeDasharray="6 4"
                    label={{
                      value: "National Avg 70%",
                      position: "top",
                      style: { fontSize: 10 },
                    }}
                  />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {stateCompData.map((entry) => (
                      <Cell key={entry.state} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Regional Breakdown */}
      <section className="container pb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Regional Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MICHIGAN_RACE_DATA.map((region) => (
            <Card
              key={region.region}
              className={`border ${getRegionBg(region.uncontestedPct)}`}
            >
              <CardContent className="py-4">
                <h3 className="text-sm font-bold text-foreground">
                  {region.region}
                </h3>
                <p className="text-[10px] text-muted-foreground mb-3">
                  {region.counties.slice(0, 4).join(", ")}
                  {region.counties.length > 4
                    ? ` +${region.counties.length - 4}`
                    : ""}
                </p>
                <div className="flex items-end gap-4 mb-3">
                  <div>
                    <p
                      className={`text-3xl font-bold tabular-nums ${getRegionColor(region.uncontestedPct)}`}
                    >
                      {region.uncontestedPct}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      uncontested
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground tabular-nums">
                      {region.zeroCandidate}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      zero candidates
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-[10px]">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Most uncontested:
                    </span>{" "}
                    {region.worstOfficeType}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Best opportunity:
                    </span>{" "}
                    {region.bestOpportunity}
                  </p>
                </div>
                <p className="text-[9px] text-muted-foreground/60 mt-2">
                  Ballotpedia / Michigan SOS {region.year}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Evidence Callout Cards */}
      <section className="container pb-12">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Why This Matters
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-primary/20">
            <CardContent className="py-5">
              <Shield className="h-5 w-5 text-primary mb-2" />
              <h3 className="text-sm font-bold text-foreground mb-2">
                The recruitment gap
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Most governing-board seats are filled through personal networks
                rather than public, open recruitment - so many residents never
                hear that a seat is open. accessmi.org surfaces these seats
                publicly so more people can serve.
              </p>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-900/40">
            <CardContent className="py-5">
              <AlertTriangle className="h-5 w-5 text-red-500 mb-2" />
              <h3 className="text-sm font-bold text-foreground mb-2">
                The Flint Warning
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In 2013, Michigan emergency managers replaced elected officials
                in cities and school districts representing the majority of the
                state's Black residents. Four appointed managers - no elected
                voice - led to a water crisis affecting 100,000 people.
              </p>
              <p className="text-[9px] text-muted-foreground/60 mt-2">
                Source: Milbank Quarterly, Jacobson et al. 2020
              </p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-amber-900/40">
            <CardContent className="py-5">
              <TrendingDown className="h-5 w-5 text-amber-600 mb-2" />
              <h3 className="text-sm font-bold text-foreground mb-2">
                The 8% Turnout Crisis
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Michigan school boards control $15B+ in annual K-12 spending -
                yet average election turnout is 8%. Nationally, contested races
                generate 3–15 percentage points more turnout.
              </p>
              <p className="text-[9px] text-muted-foreground/60 mt-2">
                Source: CLOSUP / WWU Electoral Competitiveness Study
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container pb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SuggestResource pageUrl="/civic-power" />
          <HelpfulVote pagePath="/civic-power" />
        </div>
      </section>
    </Layout>
  );
};

export default CivicPowerPage;
