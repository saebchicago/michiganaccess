import { useState, useMemo, lazy, Suspense } from "react";
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
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";

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
  const [counties, setCounties] = useState(5);
  const [edVisits, setEdVisits] = useState(120000);
  const [lowAcuity, setLowAcuity] = useState([18]);

  const results = useMemo(() => {
    const pct = lowAcuity[0] / 100;
    const diversions = Math.round(edVisits * pct * 0.35);
    const capacityValue = diversions * 3200;
    const sdohConnections = Math.round(diversions * 2.4);
    const communityBenefit = Math.round(sdohConnections * 420);
    return { diversions, capacityValue, sdohConnections, communityBenefit };
  }, [counties, edVisits, lowAcuity]);

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
          Estimate potential operational impact of integrated navigation for
          your service area. All outputs are{" "}
          <strong>modeled projections</strong>, not guaranteed outcomes.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Service Area Counties</Label>
            <Input
              type="number"
              value={counties}
              onChange={(e) => setCounties(+e.target.value)}
              min={1}
              max={83}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Annual ED Visits</Label>
            <Input
              type="number"
              value={edVisits}
              onChange={(e) => setEdVisits(+e.target.value)}
              min={1000}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">% Low-Acuity ({lowAcuity[0]}%)</Label>
            <Slider
              value={lowAcuity}
              onValueChange={setLowAcuity}
              min={5}
              max={40}
              step={1}
              className="mt-3"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Projected ED Diversions",
              value: results.diversions.toLocaleString(),
              sub: "/year (modeled)",
            },
            {
              label: "Projected Capacity Value",
              value: `$${(results.capacityValue / 1e6).toFixed(1)}M`,
              sub: "/year (modeled)",
            },
            {
              label: "Projected SDOH Connections",
              value: results.sdohConnections.toLocaleString(),
              sub: "/year (modeled)",
            },
            {
              label: "Projected Benefit Value",
              value: `$${(results.communityBenefit / 1e6).toFixed(2)}M`,
              sub: "Schedule H (modeled)",
            },
          ].map((r) => (
            <div
              key={r.label}
              className="rounded-lg bg-primary/5 p-3 text-center"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {r.label}
              </p>
              <p className="text-xl font-bold text-primary mt-1">{r.value}</p>
              <p className="text-[10px] text-muted-foreground">{r.sub}</p>
            </div>
          ))}
        </div>

        <div className="rounded-md bg-muted/30 p-3">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong>Assumptions:</strong> 35% diversion rate for low-acuity ED
            visits (Weinick et al., Health Affairs); $3,200 avg. ED visit cost
            (AHRQ HCUP StatBrief #268); 2.4× SDOH referral multiplier; $420 avg.
            community benefit value per connection (IRS Schedule H benchmarks).
            All figures are modeled projections - actual results depend on
            implementation, market conditions, and system-specific factors.
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
              Verified financial and community impact data from Michigan's major
              health systems.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="py-5">
                  <h3 className="font-bold text-foreground mb-2">
                    Henry Ford Health
                  </h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>
                      • Mosaic ACO:{" "}
                      <strong className="text-foreground">$27.2M</strong> shared
                      savings, $19.9M retained (PY2024){" "}
                      <a
                        href="https://www.henryford.com/news/2025/12/henry-ford-health-mosaic-accountable-care-organization-earns-27-million-in-shared-savings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline ml-1"
                      >
                        [source]
                      </a>
                    </li>
                    <li>• $3B hospital expansion approved (Feb 2024)</li>
                    <li>
                      • Absorbed 8 former Ascension Michigan hospitals (Oct
                      2024)
                    </li>
                  </ul>
                  <IntegrityBadge
                    label="VERIFIED"
                    source="HFH Mosaic ACO press release"
                    vintage="PY2024, Dec 2025"
                    className="mt-3"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-5">
                  <h3 className="font-bold text-foreground mb-2">
                    Trinity Health (Michigan)
                  </h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>
                      • Community impact:{" "}
                      <strong className="text-foreground">$2.9 billion</strong>{" "}
                      (FY2025)
                    </li>
                    <li>• 162 CHWs addressed 16,300+ social needs</li>
                    <li>• 1M+ screened for SDOH; 27.4% reported unmet need</li>
                    <li>
                      • System-reported{" "}
                      <strong className="text-foreground">~16% decrease</strong>
                      <IntegrityBadge
                        label="PROJECTED"
                        source="Trinity Health (system-reported, not independently verified)"
                        className="ml-1 align-middle"
                      />{" "}
                      in preventable hospitalizations (not independently
                      verified)
                    </li>
                    <li>
                      • 45% reduction in health disparities (system-reported)
                    </li>
                  </ul>
                  <IntegrityBadge
                    label="MODELED"
                    source="Trinity Health Community Impact Report"
                    vintage="FY2025, system-reported"
                    className="mt-3"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-5">
                  <h3 className="font-bold text-foreground mb-2">
                    Corewell Health
                  </h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>
                      • Revenue:{" "}
                      <strong className="text-foreground">$10.4 billion</strong>{" "}
                      <span className="text-[9px] opacity-60">
                        (Corewell Health FY2023 Annual Report)
                      </span>
                    </li>
                    <li>
                      • 22 hospitals across Michigan{" "}
                      <span className="text-[9px] opacity-60">
                        (corewellhealth.org, 2024)
                      </span>
                    </li>
                    <li>• Largest health system in Michigan</li>
                  </ul>
                  <IntegrityBadge
                    label="VERIFIED"
                    source="Corewell Health Annual Report"
                    vintage="FY2023"
                    className="mt-3"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-5">
                  <h3 className="font-bold text-foreground mb-2">
                    All MI Hospitals (MHA)
                  </h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>
                      • Combined community benefit:{" "}
                      <strong className="text-foreground">$4.5+ billion</strong>{" "}
                      <span className="text-[9px] opacity-60">
                        (MHA Community Benefit Report, system-reported)
                      </span>
                    </li>
                    <li>• CHW Medicaid reimbursement effective Jan 2024</li>
                    <li>• 7 MDHHS SDOH Hubs launched statewide</li>
                    <li>• MVC covers ~84% of insured Michiganders</li>
                  </ul>
                  <IntegrityBadge
                    label="MODELED"
                    source="MHA Community Benefit Report"
                    vintage="2023-2024, system-reported"
                    className="mt-3"
                  />
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
