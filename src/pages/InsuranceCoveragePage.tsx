import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import {
  ShieldCheck, Heart, Building2, Briefcase, HelpCircle, ExternalLink,
  ChevronRight, ArrowRight, Phone, FileText, AlertTriangle, Scale,
  Users, DollarSign, Stethoscope, Clock,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import InsuranceNavigator from "@/components/findcare/InsuranceNavigator";
import AskCopilotButton from "@/components/shared/AskCopilotButton";

/* ── Jargon tooltip helper ─────────────────────── */
function JargonTip({ term, tip }: { term: string; tip: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted decoration-muted-foreground/50 cursor-help">{term}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">{tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

/* ── Program data (all public, no mock) ────────── */
const PROGRAMS = [
  {
    id: "medicaid",
    title: "Medicaid — Healthy Michigan Plan",
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    who: "Adults 19–64, income ≤ 133% Federal Poverty Level (FPL). Children and pregnant individuals may qualify at higher income levels.",
    covers: "Doctor visits, hospital stays, prescriptions, mental health, substance use treatment, dental, vision, lab work.",
    howToApply: "Apply online through MI Bridges or call MDHHS.",
    links: [
      { label: "Apply on MI Bridges", href: "https://newmibridges.michigan.gov/", external: true },
      { label: "MDHHS Medicaid Info", href: "https://www.michigan.gov/mdhhs/assistance-programs/healthcare", external: true },
    ],
    updated: "March 2026",
  },
  {
    id: "medicare",
    title: "Medicare",
    icon: Heart,
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    who: "People 65 and older, or under 65 with certain disabilities or End-Stage Renal Disease (ESRD).",
    covers: "Part A (hospital), Part B (outpatient/doctor), Part D (prescriptions). Medicare Advantage (Part C) bundles these through a private plan.",
    howToApply: "Enroll through Social Security Administration or Medicare.gov during enrollment periods.",
    links: [
      { label: "Medicare.gov Plan Finder", href: "https://www.medicare.gov/plan-compare/", external: true },
      { label: "MI SHINE Counseling", href: "https://mmapinc.org/medicare-medicaid-assistance-program/", external: true },
    ],
    updated: "March 2026",
  },
  {
    id: "marketplace",
    title: "Health Insurance Marketplace (ACA)",
    icon: Scale,
    color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
    who: "Individuals and families who do not have employer coverage or Medicaid. Premium tax credits available for income 100–400% FPL.",
    covers: "All Marketplace plans cover Essential Health Benefits: doctor visits, emergency, hospitalization, prescriptions, maternity, mental health, preventive care.",
    howToApply: "Open Enrollment runs Nov 1 – Jan 15 annually. Special Enrollment Periods available for qualifying life events.",
    links: [
      { label: "HealthCare.gov", href: "https://www.healthcare.gov/", external: true },
      { label: "Find Local Enrollment Help", href: "https://localhelp.healthcare.gov/", external: true },
    ],
    updated: "March 2026",
  },
  {
    id: "fqhc",
    title: "Community Health Centers (FQHCs)",
    icon: Building2,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    who: "Everyone — insured or uninsured. Fees are based on a sliding scale tied to household income.",
    covers: "Primary care, dental, behavioral health, pharmacy, labs, prenatal care. Some centers offer vision and substance use treatment.",
    howToApply: "Walk in or call any FQHC. No referral needed. Bring proof of income for fee reduction.",
    links: [
      { label: "Find an FQHC Near You", href: "/find-care", external: false },
      { label: "HRSA Health Center Finder", href: "https://findahealthcenter.hrsa.gov/", external: true },
    ],
    updated: "March 2026",
  },
  {
    id: "private",
    title: "Employer / Private Insurance (incl. BCBS of Michigan)",
    icon: Briefcase,
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    who: "Employees offered coverage through their employer, or individuals purchasing directly from an insurer.",
    covers: "Varies by plan. Michigan's largest insurer is Blue Cross Blue Shield of Michigan / Blue Care Network.",
    howToApply: "Enroll through your employer during open enrollment, or buy directly from the insurer.",
    links: [
      { label: "BCBSM Member Resources", href: "https://www.bcbsm.com/", external: true },
      { label: "Understand Your EOB", href: "/health/insurance-appeals", external: false },
    ],
    updated: "March 2026",
  },
];

const QUICK_PATHS = [
  { question: "I have no insurance", answer: "Start with Medicaid (if income-eligible) or an FQHC. Use the navigator below.", tab: "medicaid" },
  { question: "I just lost my job", answer: "You may qualify for a Special Enrollment Period on the Marketplace, COBRA continuation, or Medicaid.", tab: "marketplace" },
  { question: "I'm 65 or turning 65", answer: "You're likely eligible for Medicare. MI SHINE counselors can help you choose a plan at no cost.", tab: "medicare" },
  { question: "My claim was denied", answer: "You have the right to appeal. Access Michigan can generate a free appeal letter.", tab: "appeals" },
];

export default function InsuranceCoveragePage() {
  const [activeTab, setActiveTab] = useState("overview");

  usePageMeta({
    title: "Insurance & Coverage Guide — Michigan",
    description: "Understand Medicaid, Medicare, Marketplace, FQHC, and private insurance options in Michigan. Free navigator tool, no tracking.",
    path: "/insurance-coverage",
    jsonLd: {
      "@type": "FAQPage",
      name: "Insurance & Coverage Guide — Access Michigan",
      description: "Comprehensive guide to health insurance options for Michigan residents.",
    },
  });

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Insurance & Coverage" },
      ]} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-12 md:py-16">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="max-w-3xl">
            <Badge variant="outline" className="mb-3 text-xs">Independent civic guide · Not affiliated with any insurer or agency</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              Michigan Insurance & Coverage Guide
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
              Understand your options — <JargonTip term="Medicaid" tip="Free or low-cost health coverage from the state for people with low income." />,{" "}
              <JargonTip term="Medicare" tip="Federal health insurance for people 65+ or with certain disabilities." />,{" "}
              <JargonTip term="Marketplace" tip="Health insurance plans you can buy during Open Enrollment, often with financial help." />,{" "}
              FQHCs, or private plans — explained in plain language with links to official Michigan resources.
            </p>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> No data collected · No account required · Sources: MDHHS, CMS, HRSA · Updated March 2026
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container pb-16">
        {/* Quick paths */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" /> Start here — what's your situation?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_PATHS.map((qp, i) => (
              <motion.div key={qp.question} variants={fadeUp} custom={i}>
                <Card
                  className="cursor-pointer hover:border-primary/40 transition-colors h-full"
                  onClick={() => {
                    if (qp.tab === "appeals") {
                      window.location.href = "/health/insurance-appeals";
                    } else {
                      setActiveTab(qp.tab);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm mb-1.5">"{qp.question}"</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{qp.answer}</p>
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      Learn more <ChevronRight className="h-3 w-3" />
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 mb-8">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            {PROGRAMS.map(p => (
              <TabsTrigger key={p.id} value={p.id} className="text-xs">{p.title.split("—")[0].split("(")[0].trim()}</TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-8">
            {/* Navigator widget */}
            <div className="max-w-xl">
              <InsuranceNavigator />
            </div>

            <Separator />

            {/* Insurance Explainer Cards */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Understanding Your Options
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {EXPLAINER_CARDS.map((card, i) => (
                  <motion.div key={card.title} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                          {card.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {card.paragraphs.map((p, pi) => (
                          <p key={pi} className="text-xs text-muted-foreground leading-relaxed">{p}</p>
                        ))}
                        <p className="text-[10px] text-muted-foreground/60 italic">{card.updated}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* All programs summary */}
            <div>
              <h2 className="text-lg font-bold mb-4">All Coverage Programs</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {PROGRAMS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <motion.div key={p.id} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                      <Card className="h-full hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <span className={`inline-flex items-center justify-center h-7 w-7 rounded-md ${p.color}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            {p.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Who qualifies</p>
                            <p className="text-xs text-foreground leading-relaxed">{p.who}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">What's covered</p>
                            <p className="text-xs text-foreground leading-relaxed">{p.covers}</p>
                          </div>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => setActiveTab(p.id)}
                            className="text-xs gap-1 text-primary p-0 h-auto"
                          >
                            Full details <ArrowRight className="h-3 w-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Appeals CTA */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Claim denied? You have the right to appeal.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Access Michigan can generate a free appeal letter using AI, with step-by-step guidance.</p>
                </div>
                <Button asChild size="sm" className="gap-1.5">
                  <Link to="/health/insurance-appeals">
                    <FileText className="h-3.5 w-3.5" /> Appeal Generator <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual program tabs */}
          {PROGRAMS.map((p) => {
            const Icon = p.icon;
            return (
              <TabsContent key={p.id} value={p.id} className="space-y-6">
                <div className="flex items-start gap-3">
                  <span className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${p.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">{p.title}</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> Last verified: {p.updated}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" /> Who Qualifies</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm leading-relaxed">{p.who}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5 text-primary" /> What's Covered</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm leading-relaxed">{p.covers}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-primary" /> How to Apply</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm leading-relaxed">{p.howToApply}</p></CardContent>
                  </Card>
                </div>

                <div className="flex flex-wrap gap-2">
                  {p.links.map((link) =>
                    link.external ? (
                      <Button key={link.label} size="sm" variant="outline" asChild className="gap-1.5">
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                          {link.label} <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    ) : (
                      <Button key={link.label} size="sm" variant="outline" asChild className="gap-1.5">
                        <Link to={link.href}>{link.label} <ArrowRight className="h-3 w-3" /></Link>
                      </Button>
                    )
                  )}
                </div>

                {/* FQHC sliding fee on its tab */}
                {p.id === "fqhc" && (
                  <Card className="max-w-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-primary" /> Sliding Fee Calculator</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">Use the Insurance Navigator below to estimate your FQHC discount category.</p>
                      <InsuranceNavigator />
                    </CardContent>
                  </Card>
                )}

                {/* Medicaid specific */}
                {p.id === "medicaid" && (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm font-semibold">Managed Care in Michigan</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Most Michigan Medicaid members are enrolled in a managed care plan such as{" "}
                        <JargonTip term="BCBS Complete" tip="Blue Cross Complete of Michigan — a Medicaid managed care plan operated by BCBSM." />,{" "}
                        Meridian, Molina, Priority Health, or UnitedHealthcare Community Plan. Your plan manages your benefits, assigns a primary care provider, and handles referrals.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Source: <a href="https://www.michigan.gov/mdhhs/doing-business/providers/providers/medicaid-health-plans" target="_blank" rel="noopener noreferrer" className="underline">MDHHS Medicaid Health Plans</a>
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Common actions */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <Link to="/health/insurance-appeals"><FileText className="h-3 w-3" /> Appeal a Denial</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <Link to="/find-care"><Stethoscope className="h-3 w-3" /> Find a Provider</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <Link to="/financial-help"><DollarSign className="h-3 w-3" /> Financial Assistance</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <a href="tel:211"><Phone className="h-3 w-3" /> Call 2-1-1</a>
                  </Button>
                </div>

                <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    For guidance only — this is an independent civic resource, not affiliated with any insurer or government agency. Final eligibility is determined by the program administrator.
                  </p>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </Layout>
  );
}
