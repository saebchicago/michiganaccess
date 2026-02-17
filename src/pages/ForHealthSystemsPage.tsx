import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { Building2, Network, FileBarChart, GitBranch, ArrowRight, Calculator } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";

const valueProps = [
  {
    icon: Network,
    title: "Ambulatory Network Optimization",
    items: ["Service area analytics with SVI-weighted gap detection", "Drive-time analysis for site selection", "Capacity planning using HRSA shortage area data", "Market intelligence across 83 counties"],
  },
  {
    icon: FileBarChart,
    title: "Community Benefit Program ROI",
    items: ["CHNA data integration (IRS Schedule H ready)", "Social risk adjustment for VBC contracts", "SDOH referral tracking and outcome attribution", "Automated Community Benefit valuation"],
  },
  {
    icon: GitBranch,
    title: "Referral Leakage Analysis",
    items: ["Network utilization pattern mapping", "PCP shortage identification by ZIP code", "Service line growth opportunity sizing", "Out-of-network exit prevention strategies"],
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
          <h3 className="text-lg font-bold text-foreground">System Impact Calculator</h3>
        </div>
        <p className="text-xs text-muted-foreground">Estimate the operational and financial impact of integrated navigation for your service area.</p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Service Area Counties</Label>
            <Input type="number" value={counties} onChange={(e) => setCounties(+e.target.value)} min={1} max={83} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Annual ED Visits</Label>
            <Input type="number" value={edVisits} onChange={(e) => setEdVisits(+e.target.value)} min={1000} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">% Low-Acuity ({lowAcuity[0]}%)</Label>
            <Slider value={lowAcuity} onValueChange={setLowAcuity} min={5} max={40} step={1} className="mt-3" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Estimated ED Diversions", value: results.diversions.toLocaleString(), sub: "/year" },
            { label: "Preserved Capacity Value", value: `$${(results.capacityValue / 1e6).toFixed(1)}M`, sub: "/year" },
            { label: "SDOH Connections", value: results.sdohConnections.toLocaleString(), sub: "/year" },
            { label: "Community Benefit Value", value: `$${(results.communityBenefit / 1e6).toFixed(2)}M`, sub: "Schedule H" },
          ].map((r) => (
            <div key={r.label} className="rounded-lg bg-primary/5 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{r.label}</p>
              <p className="text-xl font-bold text-primary mt-1">{r.value}</p>
              <p className="text-[10px] text-muted-foreground">{r.sub}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const ForHealthSystemsPage = () => {
  usePageMeta({ title: "For Health Systems — Michigan Access", description: "Ambulatory network optimization, community benefit ROI, and referral leakage analysis for operations leaders.", path: "/for-health-systems" });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary">For Operations & Engineering Leaders</Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">Strategic Value for Health Systems</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Population health infrastructure designed for management engineers, IE/OR professionals, and ambulatory operations leaders.</p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3 mb-12">
            {valueProps.map((vp, i) => (
              <motion.div key={vp.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full">
                  <CardContent className="py-5 space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><vp.icon className="h-5 w-5 text-primary" /></div>
                    <h3 className="font-bold text-foreground">{vp.title}</h3>
                    <ul className="space-y-1.5">
                      {vp.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <SystemImpactCalculator />

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild><Link to="/partnerships/health-systems" className="gap-2">View Integration Guide <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline"><Link to="/lean-healthcare" className="gap-2">Lean Methodology <ArrowRight className="h-4 w-4" /></Link></Button>
            <ShareButton title="Michigan Access for Health Systems" description="Ambulatory optimization, community benefit ROI, and referral leakage analysis." />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForHealthSystemsPage;
