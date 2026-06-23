import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Landmark,
  FileText,
  Users,
  DollarSign,
  Vote,
  Calendar,
  ExternalLink,
  TrendingUp,
  Scale,
  Building2,
  BookOpen,
  Search,
  Globe,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import EnvironmentCallout from "@/components/shared/EnvironmentCallout";
import HealthSafetyCallout from "@/components/shared/HealthSafetyCallout";
import FOIARequestBuilder from "@/components/civic/FOIARequestBuilder";
import HazardRiskDashboard from "@/components/civic/HazardRiskDashboard";
import EconomicVitalityDashboard from "@/components/civic/EconomicVitalityDashboard";
import ALICEDashboard from "@/components/civic/ALICEDashboard";
import BroadbandDashboard from "@/components/broadband/BroadbandDashboard";
import EconomicPulse from "@/components/economic/EconomicPulse";
import { LegislativeTracker } from "@/components/civic/LegislativeTracker";
import { DataProvenance } from "@/components/shared/DataProvenance";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// [VERIFIED] UF Election Lab VEP turnout - election.lab.ufl.edu/voter-turnout/
// CSV files: Turnout_2016G_v1.0, Turnout_2018G_v1.1, Turnout_2020G_v1.2,
//            Turnout_2022G_v1.0, Turnout_2024G_v0.3 (as of March 2, 2026)
const voterTurnout = [
  { year: "2016", turnout: 65.54, national: 60.12 },
  { year: "2018", turnout: 57.62, national: 50.05 },
  { year: "2020", turnout: 73.27, national: 66.38 },
  { year: "2022", turnout: 58.92, national: 46.22 },
  { year: "2024", turnout: 74.64, national: 64.07 },
];

// [VERIFIED] Michigan.gov - all four re-elected Nov 2022, current term 2023–2027
const electedOfficials = [
  {
    title: "Governor",
    name: "Gretchen Whitmer",
    party: "Democrat",
    since: "2019",
    contact: "https://www.michigan.gov/whitmer",
  },
  {
    title: "Lt. Governor",
    name: "Garlin Gilchrist II",
    party: "Democrat",
    since: "2019",
    contact: "https://www.michigan.gov/ltgovernor",
  },
  {
    title: "Attorney General",
    name: "Dana Nessel",
    party: "Democrat",
    since: "2019",
    contact: "https://www.michigan.gov/ag",
  },
  {
    title: "Secretary of State",
    name: "Jocelyn Benson",
    party: "Democrat",
    since: "2019",
    contact: "https://www.michigan.gov/sos",
  },
];

// Open Meetings linkouts - replaces static past-dated list per Michigan OMA
const openMeetingsLinks = [
  {
    body: "State Board of Education",
    url: "https://www.michigan.gov/mde/about/boardofeducation",
  },
  {
    body: "Natural Resources Commission",
    url: "https://www.michigan.gov/dnr/about/nrc",
  },
  {
    body: "Environmental Advisory Bodies (EGLE)",
    url: "https://www.michigan.gov/egle/about/advisory-bodies",
  },
  { body: "MPSC Rate Cases & Hearings", url: "https://mi-psc.my.site.com/s/" },
  {
    body: "Michigan Transportation Commission",
    url: "https://www.michigan.gov/mdot/about/transportation-commission",
  },
];

// [VERIFIED] UF Election Lab Nov 2024 | [VERIFIED] MI House/Senate Fiscal Agencies FY2025
const getQuickStats = (t: (key: string) => string) => [
  {
    icon: Vote,
    label: t("civic.voterTurnout"),
    value: "74.6%",
    color: "text-michigan-forest-deep",
    source: "UF Election Lab, Nov 2024 [VERIFIED]",
  },
  {
    icon: DollarSign,
    label: "FY2025 Budget (All Funds)",
    value: "$82.5B",
    color: "text-michigan-gold-deep",
    source: "MI House Fiscal Agency, FY2025 enacted [VERIFIED]",
  },
  {
    icon: DollarSign,
    label: "FY2025 General Fund",
    value: "$14.8B",
    color: "text-primary",
    source: "MI House Fiscal Agency, FY2025 enacted [VERIFIED]",
  },
];

const CivicDataPage = () => {
  const { t } = useTranslation();
  usePageMeta({
    title: "Civic Data & Open Government",
    description:
      "Budget transparency, FOIA tracking, voter engagement, and elected officials for Michigan.",
    path: "/civic-data",
  });
  const [activeTab, setActiveTab] = useState("budget");

  return (
    <Layout>
      <Breadcrumbs items={[{ label: t("civic.badge") }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-michigan-navy/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5"
            >
              <Landmark className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("civic.badge")}
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mb-4 text-4xl font-bold text-foreground md:text-5xl"
            >
              {t("civic.title")}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground"
            >
              {t("civic.subtitle")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Methodology note */}
      <section className="border-b border-border bg-card py-4">
        <div className="container">
          <Card className="border-primary/15 bg-primary/5">
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                <Info
                  className="h-4 w-4 text-primary flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-foreground">Data standards:</strong>{" "}
                  Every figure on this page is sourced from a primary government
                  source or peer-reviewed dataset, with source name and as-of
                  date shown inline. Figures without a confirmable primary
                  source have been removed. Budget figures reflect FY2025
                  enacted appropriations (Michigan House/Senate Fiscal
                  Agencies). Voter turnout uses VEP (Voting Eligible Population)
                  methodology from the UF Election Lab, the standard measure for
                  cross-state comparison.
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-b border-border bg-card py-6">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {getQuickStats(t).map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="flex items-center gap-3 rounded-lg bg-background p-4"
              >
                <stat.icon className={`h-8 w-8 ${stat.color} shrink-0`} />
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-[9px] text-muted-foreground/70">
                    {stat.source}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12 md:py-16">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 grid w-full grid-cols-2 md:grid-cols-5 gap-1">
              <TabsTrigger value="budget" className="text-xs sm:text-sm">
                {t("civic.budget")}
              </TabsTrigger>
              <TabsTrigger value="foia" className="text-xs sm:text-sm">
                {t("civic.foiaTracker")}
              </TabsTrigger>
              <TabsTrigger value="elections" className="text-xs sm:text-sm">
                {t("civic.elections")}
              </TabsTrigger>
              <TabsTrigger value="officials" className="text-xs sm:text-sm">
                {t("civic.officials")}
              </TabsTrigger>
              <TabsTrigger value="meetings" className="text-xs sm:text-sm">
                {t("civic.publicMeetings")}
              </TabsTrigger>
            </TabsList>

            {/* Budget */}
            <TabsContent value="budget">
              <motion.div
                initial="hidden"
                animate="show"
                variants={stagger}
                className="space-y-6"
              >
                <motion.div variants={fadeUp}>
                  <Card className="border-michigan-gold/20 bg-michigan-gold/5">
                    <CardContent className="py-4">
                      <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                        <Info
                          className="h-4 w-4 text-michigan-gold-deep flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>
                          Departmental budget breakdowns without a confirmed
                          primary source have been removed. The figures below
                          are the enacted FY2025 totals as published by the
                          Michigan House and Senate Fiscal Agencies. FY2026
                          (~$81B all-funds) was enacted October 2025. For the
                          full enacted budget by department, see the{" "}
                          <a
                            href="https://www.michigan.gov/budget"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            Michigan State Budget Office
                          </a>
                          .
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="grid gap-6 sm:grid-cols-2"
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="h-8 w-8 text-michigan-gold-deep shrink-0" />
                        <div>
                          <p className="text-3xl font-bold text-foreground">
                            $82.52B
                          </p>
                          <p className="text-sm text-muted-foreground">
                            All-Funds Budget
                          </p>
                        </div>
                      </div>
                      <DataProvenance
                        sourceName="Michigan House Fiscal Agency / Senate Fiscal Agency"
                        sourceUrl="https://www.michigan.gov/budget"
                        asOfDate="FY2025 enacted"
                        cadence="Annual"
                        dataKind="measured"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="h-8 w-8 text-primary shrink-0" />
                        <div>
                          <p className="text-3xl font-bold text-foreground">
                            ~$14.8B
                          </p>
                          <p className="text-sm text-muted-foreground">
                            General Fund
                          </p>
                        </div>
                      </div>
                      <DataProvenance
                        sourceName="Michigan House Fiscal Agency / Senate Fiscal Agency"
                        sourceUrl="https://www.michigan.gov/budget"
                        asOfDate="FY2025 enacted"
                        cadence="Annual"
                        dataKind="measured"
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                      <DollarSign className="h-8 w-8 shrink-0 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          Full Budget Detail
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          View enacted appropriations by department, fund type,
                          and fiscal year at the official Michigan State Budget
                          Office.
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <a
                          href="https://www.michigan.gov/budget"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          State Budget Office{" "}
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* FOIA */}
            <TabsContent value="foia">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp}>
                  <Card className="border-michigan-teal/20 bg-michigan-teal/5 mb-6">
                    <CardContent className="py-4">
                      <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                        <Info
                          className="h-4 w-4 text-michigan-teal-deep flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>
                          Michigan does not publish a statewide aggregate count
                          of FOIA requests. A chart previously displayed here
                          used fabricated placeholder data and has been removed.
                          The information below explains how Michigan FOIA works
                          and links to official resources.
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="how">
                      <AccordionTrigger>
                        {t("civic.howToFOIA")}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground space-y-2">
                        <p>
                          Any person, business, or organization can submit a
                          FOIA request. Michigan law does not require you to
                          state your reason for the request.
                        </p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>
                            Identify the public body that holds the records you
                            want.
                          </li>
                          <li>
                            Write a request describing the records with
                            reasonable specificity.
                          </li>
                          <li>
                            Submit via mail, email, or the agency's online
                            portal.
                          </li>
                          <li>
                            The agency must respond within 5 business days. (MCL
                            15.235)
                          </li>
                        </ol>
                        <p className="mt-2">
                          <a
                            href="https://www.michigan.gov/treasury/local/foil"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            Michigan FOIA Resources →
                          </a>
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="cost">
                      <AccordionTrigger>{t("civic.foiaCost")}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Agencies can charge for search, review, and copying.
                        Indigent individuals may receive a fee reduction of up
                        to $20 by submitting an affidavit of eligibility. (MCL
                        15.234) Electronic records are generally less expensive
                        than paper copies.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Elections */}
            <TabsContent value="elections">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Vote className="h-5 w-5 text-michigan-forest-deep" />
                        {t("civic.voterTurnoutChart")}
                      </CardTitle>
                      <CardDescription>
                        {t("civic.voterTurnoutDesc")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={voterTurnout}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(214, 20%, 90%)"
                          />
                          <XAxis dataKey="year" />
                          <YAxis unit="%" domain={[40, 80]} />
                          <Tooltip formatter={(v: number) => `${v}%`} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="turnout"
                            stroke="hsl(209, 86%, 31%)"
                            strokeWidth={2}
                            name="Michigan"
                            dot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="national"
                            stroke="hsl(215, 19%, 35%)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="National Avg"
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Michigan consistently outperforms the national average
                        in voter participation. The 2024 election set a new
                        state record at 74.6% of eligible voters, surpassing
                        2020 (73.3%). Both elections followed expanded voting
                        access under Proposal 3 (2018).
                      </p>
                      <div className="mt-3">
                        <DataProvenance
                          sourceName="UF Election Lab (Prof. Michael McDonald), VEP methodology"
                          sourceUrl="https://election.lab.ufl.edu/voter-turnout/"
                          asOfDate="March 2, 2026"
                          cadence="Updated after each general election"
                          dataKind="measured"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="mt-8 grid gap-6 md:grid-cols-3"
                >
                  {[
                    {
                      title: "Register to Vote",
                      desc: "Register online, by mail, or in person  -  including same-day registration at your local clerk's office.",
                      link: "https://mvic.sos.state.mi.us/registervoter",
                      icon: Users,
                    },
                    {
                      title: "Find Your Polling Place",
                      desc: "Look up your polling location, sample ballot, and elected officials by address.",
                      link: "https://mvic.sos.state.mi.us/",
                      icon: Building2,
                    },
                    {
                      title: "Track Your Ballot",
                      desc: "Check the status of your absentee ballot from application to counting.",
                      link: "https://mvic.sos.state.mi.us/voter/index",
                      icon: TrendingUp,
                    },
                  ].map((item) => (
                    <Card
                      key={item.title}
                      className="group hover:border-michigan-forest/30 transition-colors"
                    >
                      <CardContent className="p-6">
                        <item.icon className="mb-3 h-8 w-8 text-michigan-forest-deep" />
                        <h3 className="mb-2 font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          {item.desc}
                        </p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Go to tool{" "}
                          <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Officials */}
            <TabsContent value="officials">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-primary" />
                        {t("civic.electedOfficials")}
                      </CardTitle>
                      <CardDescription>
                        Current executive branch leadership
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {electedOfficials.map((official) => (
                          <div
                            key={official.title}
                            className="flex items-start gap-4 rounded-lg border border-border p-4"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">
                                {official.title}
                              </p>
                              <p className="font-semibold text-foreground">
                                {official.name}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {official.party}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Since {official.since}
                                </span>
                              </div>
                              <a
                                href={official.contact}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-xs text-primary hover:underline"
                              >
                                Official website{" "}
                                <ExternalLink className="ml-1 inline h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <DataProvenance
                          sourceName="Michigan.gov (official state website)"
                          sourceUrl="https://www.michigan.gov"
                          asOfDate="Jan 2023 (current term began)"
                          cadence="Updated after elections"
                          dataKind="measured"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-6">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                      <Landmark className="h-8 w-8 shrink-0 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          Find Your State Legislators
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Look up your State Senator and State Representative by
                          address using the Michigan Legislature's official
                          tool.
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <a
                          href="https://www.legislature.mi.gov/legislators"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Find Legislators{" "}
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Public Meetings */}
            <TabsContent value="meetings">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-michigan-gold-deep" />
                        Public Meetings & Hearings
                      </CardTitle>
                      <CardDescription>
                        Michigan's Open Meetings Act guarantees public access to
                        government deliberations. Check each body's official
                        calendar for current dates and agendas.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {openMeetingsLinks.map((item) => (
                          <div
                            key={item.body}
                            className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <p className="font-semibold text-foreground">
                              {item.body}
                            </p>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
                            >
                              Official calendar{" "}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                      <p className="mt-6 text-xs text-muted-foreground">
                        Dates and times change. Always verify directly with the
                        public body before attending. All meetings listed are
                        subject to Michigan's Open Meetings Act.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Open Data & Civic Engagement */}
      <section className="border-t border-border bg-muted/30 py-12 md:py-16">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="mx-auto max-w-4xl"
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-michigan-teal/10 px-4 py-1.5">
                <Globe className="h-4 w-4 text-michigan-teal-deep" />
                <span className="text-sm font-medium text-michigan-teal-deep">
                  Open Data & Transparency
                </span>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
                How to Request Open Data
              </h2>
              <p className="text-muted-foreground">
                Michigan residents, journalists, researchers, and organizations
                all have the right to request government data. Here's how.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-michigan-teal-deep" />
                    Filing a FOIA Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    The <strong>Freedom of Information Act (FOIA)</strong> gives
                    anyone the right to request records from any Michigan public
                    body - no reason needed.
                  </p>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>
                      <strong>Identify the agency</strong> that holds the data
                      (state department, county, city, school district, etc.).
                    </li>
                    <li>
                      <strong>Write a specific request</strong> describing the
                      records you want. Be as precise as possible.
                    </li>
                    <li>
                      <strong>Submit via email, mail, or online portal.</strong>{" "}
                      Many agencies have FOIA coordinators listed on their
                      websites.
                    </li>
                    <li>
                      <strong>Expect a response within 5 business days.</strong>{" "}
                      The agency must acknowledge your request and provide a
                      cost estimate if fees apply. (MCL 15.235)
                    </li>
                  </ol>
                  <p className="pt-2">
                    <a
                      href="https://www.michigan.gov/treasury/local/foil"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      Michigan FOIA Guide & Templates{" "}
                      <ExternalLink className="ml-1 inline h-3 w-3" />
                    </a>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Search className="h-5 w-5 text-michigan-teal-deep" />
                    Already-Open Data Portals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Before filing a request, check if the data is already
                    publicly available through these top resources:
                  </p>
                  <ul className="space-y-2">
                    {[
                      {
                        name: "Michigan Open Data Portal",
                        url: "https://data.michigan.gov",
                        desc: "State government datasets  -  health, education, infrastructure, and more",
                      },
                      {
                        name: "Data.gov",
                        url: "https://data.gov",
                        desc: "Federal open data including Michigan-specific datasets from EPA, HHS, DOT",
                      },
                      {
                        name: "U.S. Census Bureau",
                        url: "https://data.census.gov",
                        desc: "Demographics, economics, housing data by county, city, and tract",
                      },
                      {
                        name: "Michigan Legislature",
                        url: "https://www.legislature.mi.gov",
                        desc: "Bills, voting records, committee schedules, and session archives",
                      },
                      {
                        name: "MiSchoolData",
                        url: "https://www.mischooldata.org",
                        desc: "K-12 school performance, enrollment, graduation rates",
                      },
                    ].map((r) => (
                      <li key={r.name} className="flex flex-col">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {r.name}{" "}
                          <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                        <span className="text-xs">{r.desc}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6">
              <Card className="border-michigan-teal/20 bg-michigan-teal/5">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                  <BookOpen className="h-8 w-8 shrink-0 text-michigan-teal-deep" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      Can't find the data you need?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Contact the agency's FOIA coordinator directly, reach out
                      to organizations like the{" "}
                      <strong>Michigan Press Association</strong> or{" "}
                      <strong>
                        Reporters Committee for Freedom of the Press
                      </strong>{" "}
                      for guidance, or attend a public meeting to request data
                      be made available proactively.
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <a
                      href="https://www.rcfp.org/open-government-guide/michigan/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      MI Open Gov Guide{" "}
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Broadband & Digital Access */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Broadband & Digital
              Access
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Michigan Broadband Funding
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Michigan has received $1.5+ billion through the federal BEAD
                    program targeting 200,000+ unserved locations, and $250M
                    through the ROBIN Grant (Coronavirus Capital Projects Fund)
                    for broadband infrastructure.
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Sources: NTIA BEAD Program [VERIFIED] · U.S. Treasury
                    Capital Projects Fund [VERIFIED]
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://michiganbroadbandmap.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Broadband Map <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Regulatory & Legislative Tools
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-3">
                    <li>
                      •{" "}
                      <a
                        href="https://mi-psc.my.site.com/s/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        MPSC E-Dockets
                      </a>{" "}
                      - Utility rate cases & orders
                    </li>
                    <li>
                      •{" "}
                      <a
                        href="https://www.legislature.mi.gov/Bills"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        MI Legislature Bill Search
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a
                        href="https://openstates.org/mi/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Open States Michigan
                      </a>{" "}
                      - Votes & sponsors
                    </li>
                    <li>
                      •{" "}
                      <Link
                        to="/data-centers"
                        className="text-primary hover:underline"
                      >
                        Data Center Pipeline
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Economic Pulse */}
      <section className="py-8">
        <div className="container max-w-5xl">
          <EconomicPulse />
        </div>
      </section>

      {/* Legislative Resources */}
      <section className="py-8">
        <div className="container max-w-5xl">
          <LegislativeTracker />
        </div>
      </section>

      {/* ALICE Dashboard */}
      <section className="py-12">
        <div className="container max-w-5xl">
          <ALICEDashboard />
        </div>
      </section>

      {/* Broadband & Digital Divide */}
      <section className="py-12">
        <div className="container max-w-5xl">
          <BroadbandDashboard />
        </div>
      </section>

      {/* Economic Vitality */}
      <section className="py-12">
        <div className="container max-w-5xl">
          <EconomicVitalityDashboard />
        </div>
      </section>

      {/* Natural Hazard Risk */}
      <section className="py-12">
        <div className="container max-w-5xl">
          <HazardRiskDashboard />
        </div>
      </section>

      {/* FOIA Request Builder */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <FOIARequestBuilder />
        </div>
      </section>

      <section className="py-8">
        <div className="container space-y-4">
          <EnvironmentCallout />
          <HealthSafetyCallout />
        </div>
      </section>

      {/* Data Sources */}
      <section className="border-t border-border bg-muted/30 py-8">
        <div className="container text-center">
          <p className="text-xs text-muted-foreground">
            Data Sources:{" "}
            <a
              href="https://election.lab.ufl.edu/voter-turnout/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              UF Election Lab (VEP Turnout)
            </a>
            ,{" "}
            <a
              href="https://www.michigan.gov/budget"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Michigan State Budget Office
            </a>
            ,{" "}
            <a
              href="https://www.michigan.gov/sos"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Secretary of State
            </a>
            ,{" "}
            <a
              href="https://www.legislature.mi.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Michigan Legislature
            </a>
            ,{" "}
            <a
              href="https://www.ntia.gov/broadband"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              NTIA BEAD Program
            </a>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            All figures are sourced from primary government sources or
            peer-reviewed datasets. Source names and as-of dates are shown
            inline on each claim.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default CivicDataPage;
