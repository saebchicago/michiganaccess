import { useState, lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
const DetectionGapFunnel = lazy(
  () => import("@/components/shared/DetectionGapFunnel"),
);
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import {
  Building2,
  Network,
  FileBarChart,
  GitBranch,
  ArrowRight,
  Calculator,
  Info,
} from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";

const valueProps = [
  {
    icon: Network,
    title: "Ambulatory Network Optimization",
    items: [
      "Service area analytics with SVI-weighted gap detection",
      "Drive-time analysis for site selection",
      "Capacity planning using HRSA shortage area data",
      "Market intelligence across 83 counties",
    ],
  },
  {
    icon: FileBarChart,
    title: "Community Benefit Program ROI",
    items: [
      "CHNA data integration (IRS Schedule H ready)",
      "Social risk adjustment for VBC contracts",
      "SDOH referral tracking and outcome attribution",
      "Automated Community Benefit valuation",
    ],
  },
  {
    icon: GitBranch,
    title: "Referral Leakage Analysis",
    items: [
      "Network utilization pattern mapping",
      "PCP shortage identification by ZIP code",
      "Service line growth opportunity sizing",
      "Out-of-network exit prevention strategies",
    ],
  },
  {
    icon: Calculator,
    title: "BD Scenario Modeler",
    items: [
      "Service line NPV with payer mix modeling",
      "Build vs. partner vs. acquire comparison",
      "Market opportunity scoring - all 83 counties",
      "SDOH financial impact with VBC attribution",
    ],
    cta: { label: "Open Modeler", href: "/bd-financial-model" },
  },
];

function SystemImpactCalculator() {
  const [edVisits, setEdVisits] = useState("120000");
  const [lowAcuity, setLowAcuity] = useState([18]);
  const [diversionRate, setDiversionRate] = useState([35]);
  const visits = Number(edVisits);
  const divertedVisits =
    edVisits !== "" && Number.isSafeInteger(visits) && visits >= 0
      ? Math.round(visits * (lowAcuity[0] / 100) * (diversionRate[0] / 100))
      : null;

  return (
    <Card className="border-primary/20">
      <CardContent className="py-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">
            Exploratory Impact Calculator
          </h3>
          <Badge
            variant="outline"
            className="text-[9px] uppercase tracking-wider border-michigan-gold/40 text-michigan-gold-deep ml-1"
          >
            Modeled
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Explore a hypothetical ED diversion scenario. The starting inputs are
          examples. Replace them with assumptions appropriate to your service area.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="annual-ed-visits" className="text-xs">Annual ED visits</Label>
            <Input
              id="annual-ed-visits"
              type="number"
              value={edVisits}
              onChange={(event) => setEdVisits(event.target.value)}
              min={0}
              step={1}
              className="mt-1"
            />
          </div>
          <div>
            <p className="text-xs">Low-acuity share ({lowAcuity[0]}%)</p>
            <Slider
              aria-label="Low-acuity share"
              value={lowAcuity}
              onValueChange={setLowAcuity}
              max={100}
              step={1}
              className="mt-3"
            />
          </div>
          <div>
            <p className="text-xs">Assumed diversion rate ({diversionRate[0]}%)</p>
            <Slider
              aria-label="Assumed diversion rate"
              value={diversionRate}
              onValueChange={setDiversionRate}
              max={100}
              step={1}
              className="mt-3"
            />
          </div>
        </div>

        <div className="rounded-lg bg-primary/5 p-3" aria-live="polite">
          <p className="text-sm font-semibold">
            {divertedVisits === null
              ? "Enter a nonnegative whole number of annual ED visits."
              : `${divertedVisits.toLocaleString()} ED visits diverted per year in this scenario`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Annual ED visits × low-acuity share × assumed diversion rate, rounded
            to the nearest visit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const ForHealthSystemsPage = () => {
  usePageMeta({
    title: "For Health Systems - Access Michigan",
    description:
      "Ambulatory network optimization, community benefit ROI, and referral leakage analysis for operations leaders.",
    path: "/for-health-systems",
  });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge
              variant="outline"
              className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary"
            >
              For Operations & Engineering Leaders
            </Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">
              Built for your ops team.
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ambulatory optimization. ROI modeling. Referral leakage.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border-2 border-michigan-gold/30 bg-michigan-gold/5 p-5 mb-10"
          >
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 shrink-0 text-michigan-gold-deep" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Public Beta.</strong> Below
                are <strong>PROJECTED capabilities</strong>. Modeled
                projections, not measured outcomes. See{" "}
                <a
                  href="/lean-healthcare"
                  className="text-primary hover:underline"
                >
                  Lean Healthcare Engineering
                </a>{" "}
                for sourced citations.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {valueProps.map((vp, i) => (
              <motion.div
                key={vp.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <CardContent className="py-5 space-y-3 flex-1 flex flex-col">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <vp.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">{vp.title}</h3>
                    <ul className="space-y-1.5 flex-1">
                      {vp.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {"cta" in vp && vp.cta && (
                      <Button asChild size="sm" className="w-full mt-2">
                        <Link to={vp.cta.href}>{vp.cta.label}</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Verified Michigan Health System Financials */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Michigan Health
              System Landscape
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              These figures come from the organizations’ own reports. Each
              source defines the scope and reporting period for its figure.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="space-y-2 py-5">
                  <h3 className="font-bold text-foreground">Trinity Health</h3>
                  <p className="text-sm text-muted-foreground">
                    Trinity Health reported $2.9 billion in community impact
                    across its national system in fiscal year 2025.
                  </p>
                  <a
                    className="text-sm text-primary underline"
                    href="https://www.trinity-health.org/our-impact/community-health-and-well-being/investing-in-our-communities"
                  >
                    Trinity Health community impact reporting
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-2 py-5">
                  <h3 className="font-bold text-foreground">Michigan Health &amp; Hospital Association</h3>
                  <p className="text-sm text-muted-foreground">
                    Michigan hospitals reported more than $4.5 billion in
                    community benefit activities in fiscal year 2023 through
                    the MHA survey.
                  </p>
                  <a
                    className="text-sm text-primary underline"
                    href="https://www.mha.org/newsroom/publications/community-impact-report/"
                  >
                    MHA Community Impact Report
                  </a>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <SystemImpactCalculator />

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link to="/partnerships/health-systems" className="gap-2">
                View Integration Guide <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/bd-financial-model" className="gap-2">
                BD Financial Model <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/market-intelligence" className="gap-2">
                Market Intelligence <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/lean-healthcare" className="gap-2">
                Lean Healthcare Engineering <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <ShareButton
              title="Access Michigan for Health Systems"
              description="Ambulatory optimization, community benefit ROI, and referral leakage analysis."
            />
          </div>
        </div>
      </section>

      {/* Detection Gap Funnel - full version */}
      <section className="container pb-12">
        <Card>
          <CardContent className="py-6">
            <Suspense
              fallback={
                <div className="h-48 animate-pulse bg-muted rounded-xl" />
              }
            >
              <DetectionGapFunnel variant="full" />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default ForHealthSystemsPage;
