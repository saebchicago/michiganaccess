import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, GitBranch, Database, HeartPulse, ArrowRight, TrendingUp } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";

const leanItems = [
  {
    icon: Activity,
    category: "Throughput Optimization",
    question: "How does the platform reduce patient navigation waste?",
    metrics: { before: "4.5 hours", after: "12 minutes", improvement: "94%", label: "Waste Elimination" },
    roi: "$3,200 per avoided ED visit × 850 diverted visits/month = $2.72M annual value",
    detail: "Multi-signal triage surfaces urgent care, retail clinics, and telehealth above EDs for non-emergent conditions. Filtering by wait time, walk-in availability, and service match routes low-acuity demand to appropriate care tiers.",
  },
  {
    icon: GitBranch,
    category: "Leakage Reduction",
    question: "How does centralized SDOH navigation preserve network revenue?",
    metrics: { before: "34%", after: "67%", improvement: "+97%", label: "Referral Completion" },
    roi: "$2.4M in preserved network revenue annually through reduced out-of-network referrals",
    detail: "Integrating 15,000+ community resources into the clinical referral workflow keeps patients within coordinated care ecosystems. Addresses housing, food, and transportation barriers that drive out-of-network exits.",
  },
  {
    icon: Database,
    category: "Data Integrity (Poka-Yoke)",
    question: "How is resource decay prevented through error-proofing?",
    metrics: { before: "Manual", after: "Automated", improvement: "100%", label: "Validation Coverage" },
    roi: "Quarterly CMS refresh + monthly HRSA updates + real-time MDHHS feeds eliminate stale data",
    detail: "Edge Function proxies with 1-hour cache TTL cross-validate CMS Hospital Compare against HRSA UDS and Michigan DHHS registries. Stale records (>90 days) receive degraded confidence scores. Automated reconciliation detects closures and service changes.",
  },
  {
    icon: HeartPulse,
    category: "Value-Based Care",
    question: "How does SDOH tracking enable community benefit attribution?",
    metrics: { before: "Untracked", after: "Full SDOH", improvement: "30%", label: "School Absence Reduction" },
    roi: "SDOH referral tracking enables IRS Schedule H reporting and VBC contract optimization",
    detail: "Social determinants account for 40–60% of health outcomes. Unified access to housing, SNAP enrollment, utility assistance, and employment services alongside clinical care reduces readmissions and chronic disease progression.",
  },
];

const wasteTable = [
  { metric: "Search handoffs", before: "5", after: "1", icon: "🔄" },
  { metric: "Navigation time", before: "4.5 hrs", after: "12 min", icon: "⏱️" },
  { metric: "Data sources consulted", before: "8+", after: "1 (unified)", icon: "📊" },
  { metric: "Referral completion", before: "34%", after: "67%", icon: "🎯" },
  { metric: "Resource freshness verification", before: "Manual", after: "Automated", icon: "✅" },
];

const LeanHealthcarePage = () => {
  usePageMeta({ title: "Lean Healthcare Engineering — Michigan Access", description: "Management engineering methodology: throughput optimization, leakage reduction, and value-based care ROI.", path: "/lean-healthcare" });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary">Management Engineering</Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">Lean Healthcare at Population Scale</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Applying industrial engineering principles — throughput optimization, error-proofing, and waste elimination — to close Michigan's healthcare access gaps.</p>
          </motion.div>

          {/* Waste Elimination Summary */}
          <Card className="mb-10">
            <CardContent className="py-5">
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Waste Elimination Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="py-2 text-left text-xs text-muted-foreground font-medium">Metric</th><th className="py-2 text-center text-xs text-muted-foreground font-medium">Current State</th><th className="py-2 text-center text-xs text-muted-foreground font-medium">Future State</th></tr></thead>
                  <tbody>{wasteTable.map((r) => (
                    <tr key={r.metric} className="border-b last:border-0">
                      <td className="py-2 text-xs font-medium text-foreground">{r.icon} {r.metric}</td>
                      <td className="py-2 text-center text-xs text-destructive">{r.before}</td>
                      <td className="py-2 text-center text-xs font-semibold text-primary">{r.after}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Q&A cards */}
          <div className="space-y-6 mb-10">
            {leanItems.map((item, i) => (
              <motion.div key={item.category} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card>
                  <CardContent className="py-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><item.icon className="h-4.5 w-4.5 text-primary" /></div>
                      <div>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{item.category}</Badge>
                        <h3 className="text-sm font-bold text-foreground mt-0.5">{item.question}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Performance</p>
                        <p className="text-xs"><span className="text-destructive">{item.metrics.before}</span> → <span className="text-primary font-bold">{item.metrics.after}</span></p>
                        <Badge className="mt-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">{item.metrics.improvement} {item.metrics.label}</Badge>
                      </div>
                      <div className="rounded-lg bg-primary/5 p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">ROI Impact</p>
                        <p className="text-xs font-medium text-foreground">{item.roi}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <ShareButton title="Lean Healthcare Engineering — Michigan Access" description="Throughput optimization, leakage reduction, and value-based care ROI methodology." />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LeanHealthcarePage;
