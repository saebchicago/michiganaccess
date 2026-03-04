import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/usePageMeta";

import UpdateLog from "@/components/shared/UpdateLog";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import HealthEquitySection from "@/components/home/HealthEquitySection";

import {
  Shield,
  BarChart3,
  Globe,
  Users,
  Heart,
  Scale,
  Database,
  ExternalLink,
  BookOpen,
  Award,
  Target,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const dataSources = [
  {
    name: "Centers for Medicare & Medicaid Services (CMS)",
    url: "https://data.cms.gov/provider-data/",
    description:
      "Hospital quality metrics, patient safety indicators, readmission rates, mortality data, HCAHPS patient experience scores",
    update: "Quarterly",
  },
  {
    name: "Leapfrog Group Hospital Safety Grades",
    url: "https://www.hospitalsafetygrade.org/",
    description:
      "Independent hospital safety grades (A–F) based on errors, injuries, accidents, and infections",
    update: "Biannual (Spring/Fall)",
  },
  {
    name: "ANCC Magnet Recognition Program",
    url: "https://www.nursingworld.org/organizational-programs/magnet/",
    description:
      "Gold standard for nursing excellence; recognizes superior nursing processes and outcomes",
    update: "Ongoing designation",
  },
  {
    name: "Blue Cross Blue Shield Blue Distinction Centers",
    url: "https://www.bcbs.com/blue-distinction-specialty-care",
    description:
      "Specialty care quality designations for cardiac, orthopedic, maternity, cancer, and transplant programs",
    update: "Annual review",
  },
  {
    name: "Health Resources & Services Administration (HRSA)",
    url: "https://data.hrsa.gov/",
    description:
      "Health Professional Shortage Areas (HPSAs), Federally Qualified Health Centers, Medically Underserved Areas",
    update: "Quarterly",
  },
  {
    name: "CDC PLACES & BRFSS",
    url: "https://www.cdc.gov/places/",
    description:
      "Chronic disease prevalence, health behavior data, and community health indicators at county/census tract level",
    update: "Annual",
  },
  {
    name: "Michigan Department of Health & Human Services",
    url: "https://www.michigan.gov/mdhhs",
    description:
      "State-level health data, Medicaid/Healthy Michigan Plan information, vital records, disease surveillance",
    update: "Varies by dataset",
  },
  {
    name: "County Health Rankings & Roadmaps",
    url: "https://www.countyhealthrankings.org/explore-health-rankings/michigan",
    description:
      "County-level health outcomes, health behaviors, clinical care access, social & economic factors, physical environment",
    update: "Annual (March)",
  },
  {
    name: "U.S. Census Bureau (ACS)",
    url: "https://data.census.gov/",
    description:
      "Demographic data, poverty rates, insurance coverage, social determinants indicators",
    update: "Annual estimates",
  },
  {
    name: "ClinicalTrials.gov",
    url: "https://clinicaltrials.gov/",
    description:
      "Active clinical trial listings in Michigan by condition, phase, and enrollment status",
    update: "Real-time",
  },
];

const rankingFactors = [
  {
    factor: "Distance from You",
    weight: 40,
    icon: Globe,
    color: "text-michigan-sky",
    description:
      "Closer care is more accessible care. We prioritize healthcare near your location because geographic proximity directly impacts whether residents seek and maintain care.",
  },
  {
    factor: "Quality & Safety Scores",
    weight: 30,
    icon: Shield,
    color: "text-michigan-forest",
    description:
      "Independent ratings from Leapfrog (hospital safety), CMS (clinical quality), Blue Distinction Centers (specialty excellence), and ANCC Magnet Recognition (nursing quality). Higher objective ratings rank higher.",
  },
  {
    factor: "Digital Access",
    weight: 15,
    icon: BarChart3,
    color: "text-michigan-teal",
    description:
      "Online scheduling, patient portal, telehealth, electronic records, and prescription refills. Digital access reduces barriers, especially for working families and rural residents.",
  },
  {
    factor: "Service Comprehensiveness",
    weight: 15,
    icon: Heart,
    color: "text-michigan-blue",
    description:
      "Breadth of specialties, integrated support services (behavioral health, social work, nutrition), and on-site ancillary services. Comprehensive facilities reduce care fragmentation.",
  },
];

export default function AboutPage() {
  const { t } = useTranslation();

  // ✅ Set metadata ONCE, consistently.
  // If your i18n strings exist, they’ll still drive visible text content.
  usePageMeta({
    title: "About & Methodology | Access Michigan",
    description:
      "How Access Michigan organizes public datasets, explains ranking logic, and maintains independence from government agencies.",
    path: "/about",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-navy/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: t("nav.about") }]} />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {t("aboutPage.badge")}
            </span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="mb-4 text-3xl font-bold text-foreground lg:text-5xl"
          >
            {t("aboutPage.title")}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            {t("aboutPage.subtitle")}
          </motion.p>

          {/* Citizen initiative origin */}
          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className="mx-auto max-w-2xl mt-8 text-left space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access Michigan is a citizen-led initiative built by Michigan residents with experience in healthcare operations, data, and civic technology. It began as a volunteer project to make public data easier to use for families, communities, and institutions across the state.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Access Michigan is an independent civic platform — not affiliated with MDHHS, Michigan 2-1-1, or any government agency. We use public data to help residents find services and communities understand their needs, with no cookies, no tracking, and no personal data collected.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Health Equity in Action */}
      <HealthEquitySection />

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Mission */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 lg:p-12">
            <h2 className="mb-4 text-2xl font-bold text-foreground">{t("aboutPage.missionTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("aboutPage.missionDesc")}</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                { icon: Scale, titleKey: "independentTitle", descKey: "independentDesc" },
                { icon: Users, titleKey: "residentFirstTitle", descKey: "residentFirstDesc" },
                { icon: Database, titleKey: "dataDrivenTitle", descKey: "dataDrivenDesc" },
              ].map((item, i) => (
                <motion.div
                  key={item.titleKey}
                  variants={fadeUp}
                  custom={i + 1}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{t(`aboutPage.${item.titleKey}`)}</h3>
                  <p className="text-xs text-muted-foreground">{t(`aboutPage.${item.descKey}`)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Ranking Methodology */}
        <section id="methodology">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10">
                <Target className="h-5 w-5 text-michigan-forest" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("aboutPage.rankingTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("aboutPage.rankingSubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <p className="mb-8 text-muted-foreground leading-relaxed">{t("aboutPage.rankingDesc")}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {rankingFactors.map((rf, i) => (
              <motion.div
                key={rf.factor}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full hover-lift">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <rf.icon className={`h-5 w-5 ${rf.color}`} />
                        <CardTitle className="text-base">{rf.factor}</CardTitle>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        {rf.weight}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{rf.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("aboutPage.userControl")}</p>
                <p className="text-sm text-muted-foreground">{t("aboutPage.userControlDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Choice Architecture Transparency */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10">
                <Lightbulb className="h-5 w-5 text-michigan-teal" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("aboutPage.choiceArchTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("aboutPage.choiceArchSubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                title: "Distance-First, Quality-Enhanced",
                desc: "Default sort is distance. When facilities are similarly close (within 2 miles), higher quality scores break the tie — nudging toward safer, more comprehensive options naturally.",
              },
              {
                title: "Visual Quality Cues",
                desc: "Badges (🏆 Magnet, ⭐ Leapfrog A, 💙 Blue Distinction) highlight objectively accredited facilities. Labels like 'Most comprehensive nearby' appear only when data supports them.",
              },
              {
                title: "Safety-Net Visibility",
                desc: "FQHCs and community health centers always appear with prominent 'Recommended affordable option' and 'No one turned away' callouts. They are never suppressed by quality filters.",
              },
              {
                title: "Condition-Specific Pathways",
                desc: "When searching for a specific condition, results default to showing programs with integrated specialty quality, support services (social work, behavioral health, nutrition), and accessible locations.",
              },
              { title: "Full User Control", desc: "Users can always re-sort, change filters, and explore all options. Ranking criteria are explained here and linked from every search results page." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="flex gap-3"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-michigan-forest" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Community Benefit & Health Equity */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-coral/10">
                <Heart className="h-5 w-5 text-michigan-coral" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("aboutPage.communityBenefitTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("aboutPage.communityBenefitSubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Social Determinants Integration",
                desc: "Food, housing, transportation, and financial assistance navigation integrated alongside clinical care — not as afterthought, but as core infrastructure.",
              },
              { icon: Shield, title: "Health Equity Focus", desc: "HPSA overlay maps, Social Vulnerability Index data, and health equity metrics highlight communities needing the most support." },
              { icon: Globe, title: "Culturally Appropriate", desc: "Language service indicators, cultural competency data, and multilingual resource guides for Michigan's diverse populations." },
              { icon: Scale, title: "Financial Navigation", desc: "Charity care programs, Medicaid enrollment, prescription assistance, and sliding-scale services surfaced for every facility." },
              { icon: BookOpen, title: "Health Literacy", desc: "All content written at 8th-grade reading level. Plain-language explanations of complex medical and insurance topics." },
              { icon: Award, title: "Vulnerable Populations", desc: "Dedicated pathways for uninsured, low-income, elderly, pediatric, and disability populations with tailored resource guides." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <item.icon className="mb-3 h-5 w-5 text-michigan-coral" />
                    <h3 className="mb-1 text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Data Sources */}
        <section id="data-sources">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-blue/10">
                <Database className="h-5 w-5 text-michigan-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("aboutPage.dataSourcesTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("aboutPage.dataSourcesSubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {dataSources.map((source, i) => (
              <motion.div key={source.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{source.name}</h3>
                        <a href={source.url} target="_blank" rel="noopener" className="text-primary hover:underline">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{source.description}</p>
                    </div>
                    <span className="flex-shrink-0 rounded bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                      {source.update}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <Link to="/privacy" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:bg-muted">
              <Shield className="h-4 w-4" /> Privacy
            </Link>
            <a href="#methodology" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:bg-muted">
              <Target className="h-4 w-4" /> Methodology
            </a>
          </div>
        </section>

        <Separator />

        {/* Technology & Scalability */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-sky/10">
                <BarChart3 className="h-5 w-5 text-michigan-sky" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("aboutPage.technologyTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("aboutPage.technologySubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Modern Stack", desc: "React 18, TypeScript, Tailwind CSS, Framer Motion. Production-grade architecture with code splitting, lazy loading, and optimized bundling." },
              { title: "Real-Time Data Pipeline", desc: "Database-backed with structured APIs. Designed for automated weekly data pulls from CMS, HRSA, CDC, and state health department feeds." },
              { title: "Michigan-Wide, Expandable", desc: "Currently covers all 83 Michigan counties. Architecture supports expansion to additional states with minimal modification." },
              { title: "Accessible & Performant", desc: "WCAG 2.1 AA compliant. Mobile-first responsive design. Lazy-loaded maps and images. Sub-3-second page loads on 3G." },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <h3 className="mb-1 text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        <UpdateLog />

        <Separator />

        {/* Limitations */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="mb-4 text-2xl font-bold text-foreground">{t("aboutPage.limitationsTitle")}</h2>
          </motion.div>
          <div className="space-y-3">
            {[
              "This platform is not a substitute for professional medical advice. Always consult healthcare providers for medical decisions.",
              "Not all facilities and providers in Michigan are listed. Coverage is expanding continuously.",
              "Data has inherent time lag from source agencies. Quality metrics may be 3–12 months behind current performance.",
              "Data is sourced from public APIs including CMS, CDC PLACES, HRSA, and Michigan EGLE. Some metrics may have a 3–12 month lag from source agencies.",
              "We are not liable for inaccuracies. Use information as a starting point and verify with providers directly.",
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="flex gap-3 rounded-lg border border-border p-3"
              >
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Public Benefit Commitment */}
        <section id="public-benefit">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 lg:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Public Benefit Commitment</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access Michigan is a nonpartisan, non-commercial civic platform. We do not advocate for political positions, sell access to public services, or monetize resident interactions. Our sole purpose is to improve how Michigan residents, caregivers, and communities find and understand the services available to them.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access Michigan complements — but does not replace — government services, 2-1-1, or direct service providers. We organize publicly available data into an accessible, navigable format so residents can make informed decisions and institutions can better understand the communities they serve.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Inspired by civic technology research and built using open civic data principles, this platform is maintained independently and funded without commercial obligations. Future sustainability will prioritize public benefit over commercial interests.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Collaborate */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center"
        >
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h3 className="mb-2 text-lg font-bold text-foreground">Collaborate With Access Michigan</h3>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Nonprofits, researchers, civic groups, and public agencies are invited to explore how Access Michigan can support their work — whether through data sharing, community feedback, or joint navigation improvements. We welcome informal advisors, domain experts, and community leaders who share our commitment to equitable access.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Interested in contributing or learning more?{" "}
            <Link to="/contact" className="font-medium text-primary hover:underline">
              Get in touch →
            </Link>
          </p>
        </motion.div>

        {/* Quick links (trust layer) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/privacy" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
            <Shield className="h-4 w-4" />
            Privacy
          </Link>
          <a href="#data-sources" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
            <Database className="h-4 w-4" />
            Data sources
          </a>
          <a href="#methodology" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
            <Target className="h-4 w-4" />
            Methodology
          </a>
        </div>
      </div>
    </Layout>
  );
}