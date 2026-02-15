import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Brain, Bus, BarChart3, MapPin, Wifi, Building2, Users,
  ArrowRight, CheckCircle2, TrendingUp, Target, Lightbulb,
  AlertTriangle, DollarSign, FileText, Globe
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const caseStudies = [
  {
    icon: Brain,
    title: "Closing Mental Health Access Gaps",
    subtitle: "Strategic Planning Methodology",
    color: "text-michigan-coral",
    bgColor: "bg-michigan-coral/5 border-michigan-coral/20",
    challenge: "Northern Michigan counties show 35% higher depression rates (CDC PLACES) but 60% fewer mental health providers per capita than state average.",
    steps: [
      { title: "Geospatial Access Analysis", desc: "Mapped providers + drive-time isochrones → 12,000 residents >60 minutes from nearest psychiatrist", icon: MapPin },
      { title: "Telehealth Overlay", desc: "Cross-referenced broadband access (FCC data) → 40% of gap area has sufficient internet", icon: Wifi },
      { title: "Safety-Net Integration", desc: "FQHC locations mapped → 8 centers have capacity for embedded behavioral health", icon: Building2 },
      { title: "Sustainability Modeling", desc: "Analyzed Medicaid rates + sliding scale → hybrid telehealth + in-person model viable", icon: DollarSign },
    ],
    stakeholders: [
      "Health Systems: IRS Schedule H community benefit alignment, quantifiable underserved population",
      "Partnership Model: FQHC collaboration reduces capital investment",
      "Population Health: Measurable reduction in ED visits for mental health crises",
    ],
    transferable: "Rural diabetes care, maternity deserts, substance use treatment",
  },
  {
    icon: Bus,
    title: "Transportation-as-Health-Infrastructure",
    subtitle: "Operations Research for Ambulatory Access",
    color: "text-michigan-teal",
    bgColor: "bg-michigan-teal/5 border-michigan-teal/20",
    challenge: "23% of missed medical appointments attributed to transportation barriers. Transit data siloed from health facility data.",
    steps: [
      { title: "Integrated Transit Mapping", desc: "Overlaid 105 healthcare facilities with public transit routes + schedules", icon: MapPin },
      { title: "Access Score Calculation", desc: "% of residents within 15-min walk of bus stop + 30-min ride of primary care", icon: BarChart3 },
      { title: "Gap Identification", desc: "18 high-volume clinics with <40% transit accessibility despite urban location", icon: AlertTriangle },
      { title: "Optimization Modeling", desc: "3 scenarios tested: route extension (12%), medical partnerships (28%), telehealth follow-ups (35%)", icon: TrendingUp },
    ],
    stakeholders: [
      "Health Systems: No-show reduction ROI quantified",
      "Ambulatory Strategy: Site new clinics near high-accessibility zones",
      "Partnership Opportunities: Regional transit authorities seeking healthcare anchors",
    ],
    transferable: "Dialysis access, cancer treatment coordination, senior care",
  },
  {
    icon: BarChart3,
    title: "Public Data as Market Intelligence",
    subtitle: "Strategic Analysis for Market Development",
    color: "text-primary",
    bgColor: "bg-primary/5 border-primary/20",
    challenge: "Understanding regional health needs requires expensive consulting. Public data exists but is scattered across 83 county health departments.",
    steps: [
      { title: "FOIA Aggregation", desc: "Compiled county community health needs assessments (IRS-required for nonprofit hospitals)", icon: FileText },
      { title: "Service Gap Analysis", desc: "Identified Top 5 unmet needs per county. Example: Kent County prioritizes substance use, behavioral health, diabetes prevention", icon: Target },
      { title: "Competitive Landscape", desc: "Counted existing programs per need → substance use has 60% fewer programs than diabetes (despite similar prevalence)", icon: Globe },
      { title: "Strategic Whitespace", desc: "Northern counties show 3× higher geriatric care need but no specialized programs", icon: Lightbulb },
    ],
    stakeholders: [
      "Health Systems: Data-driven expansion into markets with unmet need + low saturation",
      "Grant Alignment: HRSA, SAMHSA funding priorities match identified gaps",
      "Community Partnership: Approach counties with solutions to documented needs",
      "Government: FOIA trends reveal cross-jurisdiction challenges (15 counties requested school safety data → signals coordinated solution opportunity)",
    ],
    transferable: "Education infrastructure, environmental justice, transit optimization",
  },
];

export default function ImpactPage() {
  usePageMeta({ title: "Community Impact", description: "Case studies demonstrating how integrated public data informs strategic planning and reduces health disparities.", path: "/impact" });
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-forest/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Impact" }]} />
          <motion.span initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4 inline-block rounded-full bg-michigan-forest/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-forest">
            Case Studies
          </motion.span>
          <motion.h1 variants={fade} custom={1} initial="hidden" animate="visible" className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
            Community Impact Through Data-Driven Design
          </motion.h1>
          <motion.p variants={fade} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Methodology-focused case studies demonstrating how integrated public data informs strategic planning and reduces health disparities. Methods replicable for health systems, government agencies, and community organizations.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {caseStudies.map((cs, ci) => (
          <motion.section key={cs.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cs.bgColor.split(" ")[0]}`}>
                <cs.icon className={`h-5 w-5 ${cs.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{cs.title}</h2>
                <p className="text-sm text-muted-foreground">{cs.subtitle}</p>
              </div>
            </div>

            {/* Challenge */}
            <div className={`rounded-xl border-2 ${cs.bgColor} p-5 mb-6`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${cs.color}`} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Challenge</p>
                  <p className="text-sm text-foreground">{cs.challenge}</p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {cs.steps.map((step, si) => (
                <motion.div key={step.title} variants={fade} custom={si + 1}>
                  <Card className="h-full hover-lift">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-primary-foreground bg-primary`}>{si + 1}</span>
                        <step.icon className={`h-4 w-4 ${cs.color}`} />
                      </div>
                      <h4 className="mb-1 text-xs font-bold text-foreground">{step.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Stakeholders */}
            <div className="rounded-lg border border-border bg-muted/50 p-5 mb-3">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Opportunities for Stakeholders</h4>
              <ul className="space-y-2">
                {cs.stakeholders.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-michigan-forest" /> {s}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Transferable to:</span> {cs.transferable}
            </p>

            {ci < caseStudies.length - 1 && <Separator className="mt-12" />}
          </motion.section>
        ))}
      </div>
    </Layout>
  );
}
