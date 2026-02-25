import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, FileCheck, Users, ArrowRight, Info, AlertTriangle } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";
import { Link } from "react-router-dom";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const studies = [
  {
    icon: MapPin,
    tag: "Ambulatory Gap Analysis",
    title: "Identifying PCP Shortage Corridors in SE Michigan",
    challenge: "Monroe and Lenawee counties are designated Health Professional Shortage Areas (HPSAs) with primary care ratios exceeding 2,500:1 — well above the state benchmark of 1,200:1. Residents in these areas face extended drive times to the nearest accepting provider.",
    challengeSource: "HRSA HPSA designations (2024); County Health Rankings",
    approach: [
      "SVI-weighted gap analysis to identify underserved ZIP codes using Census + CDC data",
      "Drive-time isochrone modeling to map optimal service area catchments",
      "Facility density analysis to reveal high-opportunity corridors with low provider coverage",
      "Community needs assessment integration using publicly available CHNA reports",
    ],
    projectedOutcomes: [
      { label: "Underserved ZIPs identified", value: "12", basis: "HRSA HPSA data" },
      { label: "Drive-time reduction potential", value: "45→15 min", basis: "Isochrone modeling" },
      { label: "Coverage gap addressable", value: "+34%", basis: "Catchment analysis" },
    ],
  },
  {
    icon: FileCheck,
    tag: "Insurance Appeal Automation",
    title: "Reducing Barriers to Insurance Denial Appeals",
    challenge: "Nationally, an estimated 50–80% of insurance denials go uncontested. In Michigan, the average time to prepare a manual appeal is estimated at 4–8 hours, creating a significant barrier for working families and vulnerable populations.",
    challengeSource: "Kaiser Family Foundation (2023); ASPE/HHS denial rate reports",
    approach: [
      "AI-assisted appeal letter generation using denial code mapping and Michigan insurance regulations (MCL 500.2213)",
      "Automated extraction of carrier-specific submission requirements and deadlines",
      "Template library covering 24 common denial categories with clinical justification frameworks",
      "Step-by-step guided workflow designed to reduce preparation time significantly",
    ],
    projectedOutcomes: [
      { label: "Denial categories covered", value: "24", basis: "Platform template library" },
      { label: "Prep time reduction target", value: "~85%", basis: "Workflow analysis" },
      { label: "Avg. recovery per successful appeal (national)", value: "$3,000–5,000", basis: "ASPE/HHS estimates" },
    ],
  },
  {
    icon: Users,
    tag: "SDOH Navigation",
    title: "Improving Referral Completion Through Unified Navigation",
    challenge: "An estimated 60–70% of social determinants of health (SDOH) referrals go uncompleted nationally. Fragmented resource directories, eligibility confusion, and phone-tag workflows create cascading abandonment at each handoff point.",
    challengeSource: "ASPE/HHS (2022); American Hospital Association SDOH reports",
    approach: [
      "Unified resource directory spanning 700+ verified Michigan services across 83 counties",
      "Eligibility pre-screening to reduce inappropriate referrals before handoff",
      "Direct-link navigation that eliminates search-and-find friction for residents",
      "Multi-language support (EN/ES/AR/BN) to remove access barriers for diverse populations",
    ],
    projectedOutcomes: [
      { label: "Resources indexed", value: "700+", basis: "Platform database" },
      { label: "Counties covered", value: "83/83", basis: "Michigan county data" },
      { label: "Languages supported", value: "4", basis: "EN, ES, AR, BN" },
    ],
  },
];

const CaseStudiesPage = () => {
  usePageMeta({
    title: "Case Studies — Access Michigan",
    description: "Exploratory case studies demonstrating how public data infrastructure can support ambulatory gap analysis, insurance appeal access, and SDOH navigation in Michigan.",
    path: "/case-studies",
  });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary">Case Studies</Badge>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-3">Exploratory Impact Scenarios</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three scenarios demonstrating how Access Michigan's data infrastructure could support health equity analysis, operational planning, and community navigation.
            </p>
          </motion.div>

          {/* Disclaimer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-xl border-2 border-michigan-gold/30 bg-michigan-gold/5 p-5 mb-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-michigan-gold" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Illustrative Scenarios — Not Measured Outcomes</p>
                <p className="text-xs text-muted-foreground">
                  These case studies present <strong>projected methodologies and potential applications</strong> based on real public data sources. They are not reports of actual outcomes achieved. Access Michigan is in Public Beta and these scenarios illustrate the platform's analytical potential. No endorsement by named agencies is implied.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            {studies.map((study, i) => (
              <motion.div key={study.tag} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card>
                  <CardContent className="py-6 space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <study.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{study.tag}</Badge>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-michigan-gold/40 text-michigan-gold">Illustrative</Badge>
                        </div>
                        <h2 className="text-lg font-bold text-foreground">{study.title}</h2>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Challenge</h3>
                      <p className="text-sm text-muted-foreground">{study.challenge}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 italic">Source: {study.challengeSource}</p>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Proposed Approach</h3>
                      <ul className="space-y-1.5">
                        {study.approach.map((a) => (
                          <li key={a} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{a}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projected Indicators</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {study.projectedOutcomes.map((o) => (
                          <div key={o.label} className="rounded-lg bg-primary/5 p-3 text-center">
                            <p className="text-[10px] text-muted-foreground">{o.label}</p>
                            <p className="text-lg font-bold text-primary">{o.value}</p>
                            <p className="text-[9px] text-muted-foreground italic mt-0.5">Basis: {o.basis}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Separator className="my-10" />

          {/* Methodology note */}
          <div className="rounded-lg border border-border bg-muted/50 p-5 flex items-start gap-3">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Data Sources:</strong> All challenge statements cite authoritative public sources. See <Link to="/data-validation" className="text-primary hover:underline">Data Sources & Validation</Link> for complete methodology.
              </p>
              <p>
                <strong className="text-foreground">Platform Status:</strong> Access Michigan is in Public Beta. These scenarios illustrate the types of analysis the platform's data infrastructure can support. Actual impact measurement will be published as the platform matures.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <ShareButton title="Access Michigan — Exploratory Case Studies" description="Illustrative scenarios: ambulatory gap analysis, insurance appeal automation, and SDOH navigation across Michigan." />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CaseStudiesPage;
