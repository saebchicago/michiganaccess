import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import EngineeringFAQ from "@/components/home/EngineeringFAQ";
import ComparisonTable from "@/components/home/ComparisonTable";
import { Link } from "react-router-dom";
import {
  Brain,
  Bus,
  BarChart3,
  MapPin,
  Wifi,
  Building2,
  Users,
  CheckCircle2,
  TrendingUp,
  Target,
  Lightbulb,
  AlertTriangle,
  DollarSign,
  FileText,
  Globe,
  Activity,
  Info,
  Rocket,
} from "lucide-react";
import { DataClassification } from "@/components/shared/DataClassification";
import {
  COUNTIES_COVERED,
  RESOURCE_COUNT_DISPLAY,
  LANGUAGES_SUPPORTED,
} from "@/config/platformConstants";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

/* ── Platform Capabilities (verifiable, present-tense) ───────── */
const platformCapabilities = [
  {
    icon: MapPin,
    value: String(COUNTIES_COVERED),
    label: "Counties Covered",
    source: "Michigan county data",
  },
  {
    icon: FileText,
    value: RESOURCE_COUNT_DISPLAY,
    label: "Community Resources",
    source: "Platform database",
  },
  {
    icon: Globe,
    value: String(LANGUAGES_SUPPORTED),
    label: "Languages Supported",
    source: "EN, ES, AR, BN",
  },
  {
    icon: Activity,
    value: "15+",
    label: "Public Data Sources",
    source: "CMS, HRSA, CDC, MDHHS, etc.",
  },
  {
    icon: Brain,
    value: "AI",
    label: "Appeal Generator",
    source: "Denial-code-mapped templates",
  },
  {
    icon: Bus,
    value: "Live",
    label: "Transit Integration",
    source: "GTFS real-time feeds",
  },
];

/* ── Exploratory Case Studies (clearly labeled as projected) ── */
const caseStudies = [
  {
    icon: Brain,
    title: "Closing Mental Health Access Gaps",
    subtitle: "Exploratory Analysis - Northern Michigan",
    color: "text-michigan-coral",
    bgColor: "bg-michigan-coral/5 border-michigan-coral/20",
    challenge:
      "Northern Michigan counties show 35% higher depression rates but 60% fewer mental health providers per capita than state average.",
    challengeSource: "CDC PLACES (2023), HRSA HPSA designations",
    steps: [
      {
        title: "Geospatial Access Analysis",
        desc: "Map providers + drive-time isochrones to identify residents >60 minutes from nearest psychiatrist",
        icon: MapPin,
      },
      {
        title: "Telehealth Overlay",
        desc: "Cross-reference broadband access (FCC data) to estimate telehealth-eligible population",
        icon: Wifi,
      },
      {
        title: "Safety-Net Integration",
        desc: "Identify FQHC locations with capacity for embedded behavioral health",
        icon: Building2,
      },
      {
        title: "Sustainability Modeling",
        desc: "Analyze Medicaid rates + sliding scale viability for hybrid care models",
        icon: DollarSign,
      },
    ],
    potentialApplications: [
      "Health Systems: IRS Schedule H community benefit alignment with quantifiable underserved populations",
      "FQHCs: Collaborative model reduces capital investment for behavioral health expansion",
      "Public Health: Measurable baseline for tracking ED visit reductions for mental health crises",
    ],
    transferable:
      "Rural diabetes care, maternity deserts, substance use treatment access",
  },
  {
    icon: Bus,
    title: "Transportation as Health Infrastructure",
    subtitle: "Exploratory Analysis - Transit-Health Intersection",
    color: "text-michigan-teal",
    bgColor: "bg-michigan-teal/5 border-michigan-teal/20",
    challenge:
      "An estimated 23% of missed medical appointments are attributed to transportation barriers nationally. Transit data remains siloed from health facility data in most Michigan communities.",
    challengeSource:
      "National Academies of Sciences, 2021; APTA Health & Transit reports",
    steps: [
      {
        title: "Integrated Transit Mapping",
        desc: "Overlay healthcare facilities with public transit routes and schedules via GTFS feeds",
        icon: MapPin,
      },
      {
        title: "Access Score Calculation",
        desc: "Calculate % of residents within 15-min walk of bus stop + 30-min ride of primary care",
        icon: BarChart3,
      },
      {
        title: "Gap Identification",
        desc: "Identify high-volume clinics with low transit accessibility despite urban location",
        icon: AlertTriangle,
      },
      {
        title: "Scenario Modeling",
        desc: "Model impact of route extensions, medical shuttle partnerships, and telehealth follow-ups",
        icon: TrendingUp,
      },
    ],
    potentialApplications: [
      "Health Systems: Quantify no-show reduction potential from transit-aware scheduling",
      "Ambulatory Strategy: Inform site selection near high-accessibility corridors",
      "Transit Authorities: Build case for healthcare anchor partnerships",
    ],
    transferable:
      "Dialysis access, cancer treatment coordination, senior care transportation",
  },
  {
    icon: BarChart3,
    title: "Public Data as Community Intelligence",
    subtitle: "Exploratory Analysis - 83-County Landscape",
    color: "text-primary",
    bgColor: "bg-primary/5 border-primary/20",
    challenge:
      "Understanding regional health needs requires expensive consulting. Public data exists but is scattered across 83 county health departments, federal agencies, and state portals.",
    challengeSource: "IRS Form 990 Schedule H requirements; HRSA UDS data",
    steps: [
      {
        title: "Data Aggregation",
        desc: "Compile county community health needs assessments and publicly available health indicators",
        icon: FileText,
      },
      {
        title: "Service Gap Analysis",
        desc: "Identify top unmet needs per county by cross-referencing prevalence data with existing programs",
        icon: Target,
      },
      {
        title: "Resource Landscape",
        desc: "Map existing programs per need category to reveal saturation vs. scarcity",
        icon: Globe,
      },
      {
        title: "Strategic Whitespace",
        desc: "Identify counties with high need and low existing program coverage",
        icon: Lightbulb,
      },
    ],
    potentialApplications: [
      "Health Systems: Expansion planning using HRSA, CDC, and CMS public indicators",
      "Grant Writers: Align HRSA, SAMHSA funding applications with documented community gaps",
      "Community Organizations: Approach counties with solutions matched to documented needs",
      "Policymakers: Identify cross-jurisdiction challenges from aggregated public data",
    ],
    transferable:
      "Education infrastructure planning, environmental justice mapping, transit optimization",
  },
];

export default function ImpactPage() {
  const { t } = useTranslation();
  usePageMeta({
    title: "Impact & Technology | Access Michigan",
    description:
      "How Access Michigan uses public data to support health equity analysis across 83 Michigan counties - exploratory case studies and platform capabilities.",
    path: "/impact",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-forest/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Impact & Technology" }]} />
          <motion.span
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={0}
            className="mb-4 inline-block rounded-full bg-michigan-forest/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-forest"
          >
            Impact & Technology
          </motion.span>
          <motion.h1
            variants={fade}
            custom={1}
            initial="hidden"
            animate="visible"
            className="mb-4 text-3xl font-bold text-foreground lg:text-5xl"
          >
            Building Infrastructure for Health Equity
          </motion.h1>
          <motion.p
            variants={fade}
            custom={2}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Access Michigan aggregates 15+ public datasets across all 83
            counties to surface actionable insights for residents, health
            systems, and community organizations.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Platform Status - verifiable facts only */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fade}
          custom={0}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Platform Capabilities
              </h2>
              <p className="text-sm text-muted-foreground">
                What Access Michigan provides today
              </p>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 mb-4">
            {platformCapabilities.map((cap, i) => (
              <motion.div key={cap.label} variants={fade} custom={i}>
                <Card className="text-center hover-lift h-full">
                  <CardContent className="pt-6 pb-4">
                    <cap.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="text-2xl font-bold text-primary">
                      {cap.value}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-1">
                      {cap.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {cap.source}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <DataClassification type="verified" />
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-3">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              All figures above reflect current platform data. Access Michigan
              is in <strong>Public Beta</strong> - capabilities are expanding
              with community feedback. See{" "}
              <Link
                to="/data-validation"
                className="text-primary hover:underline"
              >
                Data Sources & Validation
              </Link>{" "}
              for full methodology.
            </p>
          </div>
        </motion.section>

        <Separator />

        {/* Disclaimer banner */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fade}
          custom={0}
          className="rounded-xl border-2 border-michigan-gold/30 bg-michigan-gold/5 p-5"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-michigan-gold" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Exploratory Case Studies
              </p>
              <p className="text-xs text-muted-foreground">
                The following case studies are{" "}
                <strong>illustrative scenarios</strong> that demonstrate how
                Access Michigan's data infrastructure could support health
                equity analysis. They use real public data sources but present{" "}
                <strong>projected methodologies, not measured outcomes</strong>.
                No endorsement by or partnership with named agencies is implied.
              </p>
              <div className="mt-2">
                <DataClassification type="illustrative" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Case Studies */}
        {caseStudies.map((cs, ci) => (
          <motion.section
            key={cs.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fade}
            custom={0}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${cs.bgColor.split(" ")[0]}`}
              >
                <cs.icon className={`h-5 w-5 ${cs.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-2xl font-bold text-foreground">
                    {cs.title}
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase tracking-wider border-michigan-gold/40 text-michigan-gold"
                  >
                    Illustrative
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{cs.subtitle}</p>
              </div>
            </div>

            <div className={`rounded-xl border-2 ${cs.bgColor} p-5 mb-6`}>
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={`mt-0.5 h-4 w-4 shrink-0 ${cs.color}`}
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Challenge
                  </p>
                  <p className="text-sm text-foreground">{cs.challenge}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 italic">
                    Source: {cs.challengeSource}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Proposed Methodology
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {cs.steps.map((step, si) => (
                <motion.div key={step.title} variants={fade} custom={si + 1}>
                  <Card className="h-full hover-lift">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-primary-foreground bg-primary">
                          {si + 1}
                        </span>
                        <step.icon className={`h-4 w-4 ${cs.color}`} />
                      </div>
                      <h4 className="mb-1 text-xs font-bold text-foreground">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-5 mb-3">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Potential Applications
              </h4>
              <ul className="space-y-2">
                {cs.potentialApplications.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-michigan-forest" />{" "}
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                Transferable to:
              </span>{" "}
              {cs.transferable}
            </p>

            {ci < caseStudies.length - 1 && <Separator className="mt-12" />}
          </motion.section>
        ))}

        <Separator />
      </div>

      {/* Health × Infrastructure Cross-Analysis */}
      <div className="container max-w-5xl py-12 space-y-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fade}
          custom={0}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10">
              <Activity className="h-5 w-5 text-michigan-teal" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                When Sidewalks Are a Health Issue
              </h2>
              <p className="text-sm text-muted-foreground">
                Active Transportation & Chronic Disease - powered by GATIS
              </p>
            </div>
          </div>
          <Badge className="bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20 text-[10px]">
            Cross-Sector Analysis
          </Badge>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fade}
          custom={1}
        >
          <Card className="border-michigan-teal/20 bg-michigan-teal/[0.03]">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-michigan-coral" />
                    The Connection
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Counties with less walkable infrastructure correlate with
                    higher diabetes, obesity, and cardiovascular disease rates -
                    this is well-established in epidemiological literature (CDC,
                    AHRQ).
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Michigan's pedestrian fatality rate is above the national
                    average. MDOT crash data shows disproportionate fatalities
                    in areas without sidewalk coverage.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-michigan-teal" />
                    What Access Michigan Can Now Overlay
                  </h4>
                  <ul className="space-y-1.5">
                    {[
                      "CDC PLACES chronic disease prevalence data",
                      "SEMCOG sidewalk & crosswalk coverage (7 SE counties)",
                      "HRSA HPSA shortage designations",
                      "SVI social vulnerability scores",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-michigan-forest" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic">
                    These layers together reveal WHERE infrastructure investment
                    could have the greatest health impact.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-michigan-gold" />
                  The "Last 100 Feet" Problem
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  For seniors and people with disabilities, the "last 100 feet"
                  to a bus stop or clinic entrance is often the most dangerous
                  part of their journey - and it's completely unmapped outside
                  of SEMCOG's 7-county footprint. A bus route is meaningless if
                  there's no sidewalk to reach the stop.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-michigan-teal/20 bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-michigan-teal mb-1">
                      Wayne County (Has Sidewalk Data)
                    </p>
                    <ul className="text-[11px] text-muted-foreground space-y-1">
                      <li>SEMCOG sidewalk geometry available</li>
                      <li>Crosswalk locations mapped</li>
                      <li>Can overlay health + infrastructure</li>
                      <li>Can identify specific gaps</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-michigan-coral/20 bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-michigan-coral mb-1">
                      Rural County (Zero Data)
                    </p>
                    <ul className="text-[11px] text-muted-foreground space-y-1">
                      <li>No sidewalk inventory exists</li>
                      <li>No crosswalk or curb ramp data</li>
                      <li>Cannot assess pedestrian safety</li>
                      <li>Higher pedestrian fatality risk</li>
                    </ul>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  The 76-county data gap is itself a finding. GATIS provides the
                  standard - now Michigan needs the data collection to match.
                </p>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
                <DataClassification type="modeled" />
                <span>
                  Analysis based on published research linking walkability to
                  health outcomes (CDC, AHRQ) and Michigan-specific SEMCOG/MDOT
                  data.
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Platform Comparison */}
      <ComparisonTable />

      {/* System Architecture FAQ */}
      <EngineeringFAQ />
    </Layout>
  );
}
