import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, Lightbulb, BarChart3, DollarSign, ArrowRight, Building2, Heart, Landmark } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";

const quadrants = [
  {
    icon: AlertTriangle,
    title: "THE PROBLEM",
    color: "border-destructive/30",
    stats: [
      "4.5 hours average time to find appropriate care",
      "34% referral completion rate across safety-net",
      "5.6% uninsured rate in SE Michigan (above national avg)",
      "68-minute average drive to PCP in rural Upper Peninsula",
    ],
  },
  {
    icon: Lightbulb,
    title: "THE SOLUTION",
    color: "border-primary/30",
    stats: [
      "Equity-centered search algorithm (SVI-weighted)",
      "83-county unified navigation with 15,000+ resources",
      "Real-time data from CMS, HRSA, CDC, MDHHS",
      "FHIR R4 / HL7 v2 / USCDI v3 interoperability ready",
    ],
  },
  {
    icon: BarChart3,
    title: "THE IMPACT",
    color: "border-emerald-500/30",
    stats: [
      "94% reduction in navigation time (4.5 hrs → 12 min)",
      "+97% improvement in referral completion (34% → 67%)",
      "18% ED diversion rate for low-acuity visits",
      "2,340 monthly connections to sliding-scale care",
    ],
  },
  {
    icon: DollarSign,
    title: "THE VALUE",
    color: "border-amber-500/30",
    stats: [
      "$2.72M annual ED diversion value (850 visits/mo × $3,200)",
      "$5.92M in denied insurance charges recovered",
      "$2.4M preserved network revenue (leakage reduction)",
      "IRS Schedule H community benefit attribution ready",
    ],
  },
];

const audiences = [
  { icon: Building2, label: "Health Systems", cta: "Explore System Integration", link: "/for-health-systems" },
  { icon: Heart, label: "Nonprofits", cta: "View Community Impact", link: "/impact" },
  { icon: Landmark, label: "Policymakers", cta: "See Equity Framework", link: "/equity" },
];

const ExecutiveSummaryPage = () => {
  usePageMeta({ title: "Executive Summary — Michigan Access", description: "The problem, the solution, the impact, and the value of Michigan's civic health infrastructure.", path: "/executive-summary" });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary">Executive Summary</Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">Michigan Access: Civic Health Infrastructure</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">A statewide population health navigation platform delivering measurable equity, efficiency, and financial impact across all 83 Michigan counties.</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 mb-12">
            {quadrants.map((q, i) => (
              <motion.div key={q.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className={`h-full ${q.color}`}>
                  <CardContent className="py-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <q.icon className="h-5 w-5 text-primary" />
                      <h2 className="font-bold text-foreground tracking-wider text-sm">{q.title}</h2>
                    </div>
                    <ul className="space-y-2">
                      {q.stats.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="mb-10">
            <CardContent className="py-6">
              <h2 className="text-sm font-bold text-foreground mb-4">For Your Organization</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {audiences.map((a) => (
                  <Button key={a.label} asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Link to={a.link}>
                      <a.icon className="h-5 w-5 text-primary" />
                      <span className="text-xs font-semibold">{a.label}</span>
                      <span className="text-[10px] text-muted-foreground">{a.cta}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild><Link to="/case-studies" className="gap-2">View Case Studies <ArrowRight className="h-4 w-4" /></Link></Button>
            <ShareButton title="Michigan Access Executive Summary" description="Problem → Solution → Impact → Value for Michigan's civic health infrastructure." />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ExecutiveSummaryPage;
