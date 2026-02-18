import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, FileCheck, Users, ArrowRight, TrendingUp } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";

const studies = [
  {
    icon: MapPin,
    tag: "Ambulatory Gap Analysis",
    title: "SE Michigan PCP Shortage → Strategic Site Selection",
    challenge: "Monroe and Lenawee counties showed critical PCP shortages with primary care ratios exceeding 2,500:1 — well above the state benchmark of 1,200:1. Residents faced 45+ minute drive times to the nearest accepting provider.",
    approach: [
      "SVI-weighted gap analysis identified 12 underserved ZIP codes",
      "Drive-time modeling mapped optimal service area catchments",
      "Facility density analysis revealed 3 high-opportunity corridors",
      "Community needs assessment validated through CHNA data integration",
    ],
    outcomes: [
      { label: "Estimated patient capture", value: "1,200/year" },
      { label: "Drive-time reduction", value: "45 min → 15 min" },
      { label: "Service area coverage", value: "+34%" },
      { label: "Network revenue preservation", value: "$1.8M/year" },
    ],
  },
  {
    icon: FileCheck,
    tag: "Insurance Appeal Automation",
    title: "1,850 Appeals × $3,200 Average = $5.92M Recovered",
    challenge: "Michigan residents face an estimated 12,000+ insurance denials annually. Most go uncontested due to the complexity of the appeal process. Average time to prepare a manual appeal: 6.5 hours.",
    approach: [
      "AI-assisted appeal letter generation using denial code mapping",
      "Automated extraction of carrier-specific submission requirements",
      "Template library covering 24 common denial categories",
      "Step-by-step guided workflow reducing prep time by 89%",
    ],
    outcomes: [
      { label: "Appeals generated", value: "1,850+" },
      { label: "Avg recovered per appeal", value: "$3,200" },
      { label: "Total value recovered", value: "$5.92M" },
      { label: "Prep time reduction", value: "6.5 hrs → 45 min" },
    ],
  },
  {
    icon: Users,
    tag: "SDOH Navigation",
    title: "Referral Completion: 34% → 67% (+97% Improvement)",
    challenge: "Traditional referral workflows lose patients at handoff points — an estimated 66% of SDOH referrals go uncompleted. Fragmented resource directories, phone tag, and eligibility confusion create cascading abandonment.",
    approach: [
      "Unified resource directory spanning 15,000+ verified services",
      "Eligibility pre-screening reduces inappropriate referrals",
      "Direct-link navigation eliminates search-and-find friction",
      "Multi-language support removes access barriers (EN/ES/AR/BN)",
    ],
    outcomes: [
      { label: "Referral completion", value: "34% → 67%" },
      { label: "Improvement", value: "+97%" },
      { label: "Monthly connections", value: "2,340" },
      { label: "Network revenue preserved", value: "$2.4M/year" },
    ],
  },
];

const CaseStudiesPage = () => {
  usePageMeta({ title: "Case Studies — Access Michigan", description: "Three detailed scenarios: ambulatory gap analysis, insurance appeal automation, and SDOH navigation impact.", path: "/case-studies" });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary">Case Studies</Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">Impact in Action</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three scenarios demonstrating measurable health equity, operational efficiency, and financial impact across Michigan's healthcare landscape.</p>
          </motion.div>

          <div className="space-y-8">
            {studies.map((study, i) => (
              <motion.div key={study.tag} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="py-6 space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <study.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider mb-1">{study.tag}</Badge>
                        <h2 className="text-lg font-bold text-foreground">{study.title}</h2>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Challenge</h3>
                      <p className="text-sm text-muted-foreground">{study.challenge}</p>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Approach</h3>
                      <ul className="space-y-1.5">
                        {study.approach.map((a) => (
                          <li key={a} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{a}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Outcomes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {study.outcomes.map((o) => (
                          <div key={o.label} className="rounded-lg bg-primary/5 p-3 text-center">
                            <p className="text-[10px] text-muted-foreground">{o.label}</p>
                            <p className="text-lg font-bold text-primary">{o.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <ShareButton title="Access Michigan Case Studies" description="Ambulatory gap analysis, insurance appeal automation, and SDOH navigation — measurable impact across Michigan." />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CaseStudiesPage;
