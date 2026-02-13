import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, FileText, Users, DollarSign, Vote, Calendar, ExternalLink, TrendingUp, BarChart3, Scale, Building2, BookOpen, Search, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import EnvironmentCallout from "@/components/shared/EnvironmentCallout";
import HealthSafetyCallout from "@/components/shared/HealthSafetyCallout";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// --- Demo Data ---
const budgetData = [
  { dept: "Education", shortLabel: "Education", amount: 16.8, pct: 28 },
  { dept: "Health & Human Services", shortLabel: "Health/HHS", amount: 10.2, pct: 17 },
  { dept: "Transportation", shortLabel: "Transport", amount: 5.8, pct: 10 },
  { dept: "Corrections", shortLabel: "Corrections", amount: 4.1, pct: 7 },
  { dept: "Environment", shortLabel: "Environment", amount: 2.3, pct: 4 },
  { dept: "Public Safety", shortLabel: "Pub. Safety", amount: 2.1, pct: 3 },
  { dept: "Other", shortLabel: "Other", amount: 18.7, pct: 31 },
];

const budgetPie = budgetData.map((d, i) => ({
  ...d,
  color: [
    "hsl(209, 86%, 31%)", "hsl(0, 100%, 71%)", "hsl(27, 87%, 67%)",
    "hsl(215, 19%, 35%)", "hsl(145, 32%, 30%)", "hsl(180, 100%, 32%)", "hsl(214, 74%, 59%)"
  ][i],
}));

const foiaRequests = [
  { year: "2019", submitted: 12400, fulfilled: 10800, denied: 820, pending: 780 },
  { year: "2020", submitted: 14200, fulfilled: 11900, denied: 1100, pending: 1200 },
  { year: "2021", submitted: 15800, fulfilled: 13500, denied: 1050, pending: 1250 },
  { year: "2022", submitted: 16500, fulfilled: 14200, denied: 980, pending: 1320 },
  { year: "2023", submitted: 18200, fulfilled: 15800, denied: 1100, pending: 1300 },
  { year: "2024", submitted: 19500, fulfilled: 17100, denied: 1050, pending: 1350 },
];

const voterTurnout = [
  { year: "2016", turnout: 63.2, national: 60.1 },
  { year: "2018", turnout: 57.8, national: 50.3 },
  { year: "2020", turnout: 71.4, national: 66.8 },
  { year: "2022", turnout: 55.2, national: 46.8 },
  { year: "2024", turnout: 68.9, national: 62.5 },
];

const electedOfficials = [
  { title: "Governor", name: "Gretchen Whitmer", party: "Democrat", since: "2019", contact: "https://www.michigan.gov/whitmer" },
  { title: "Lt. Governor", name: "Garlin Gilchrist II", party: "Democrat", since: "2019", contact: "https://www.michigan.gov/ltgovernor" },
  { title: "Attorney General", name: "Dana Nessel", party: "Democrat", since: "2019", contact: "https://www.michigan.gov/ag" },
  { title: "Secretary of State", name: "Jocelyn Benson", party: "Democrat", since: "2019", contact: "https://www.michigan.gov/sos" },
];

const publicMeetings = [
  { body: "State Board of Education", date: "Mar 11, 2026", time: "9:30 AM", location: "John A. Hannah Building, Lansing", type: "Regular" },
  { body: "Natural Resources Commission", date: "Mar 13, 2026", time: "10:00 AM", location: "Cadillac Place, Detroit", type: "Regular" },
  { body: "Environmental Rules Committee", date: "Mar 18, 2026", time: "1:00 PM", location: "Virtual (Zoom)", type: "Public Hearing" },
  { body: "MPSC Rate Case Hearing", date: "Mar 20, 2026", time: "9:00 AM", location: "Lansing, MI", type: "Hearing" },
  { body: "Transportation Commission", date: "Mar 25, 2026", time: "10:00 AM", location: "MDOT Building, Lansing", type: "Regular" },
];

const quickStats = [
  { icon: Landmark, label: "State Departments", value: "19", color: "text-primary" },
  { icon: FileText, label: "FOIA Requests (2024)", value: "19,500", color: "text-michigan-teal" },
  { icon: Vote, label: "2024 Voter Turnout", value: "68.9%", color: "text-michigan-forest" },
  { icon: DollarSign, label: "FY2025 Budget", value: "$60B", color: "text-michigan-gold" },
];

const CivicDataPage = () => {
  const [activeTab, setActiveTab] = useState("budget");

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Civic Data & Open Government" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-michigan-navy/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Landmark className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Civic Data & Open Government</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Michigan Open Government Hub
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
              Budget transparency, FOIA tracking, voter engagement, elected officials, and public meeting schedules — empowering informed civic participation.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-b border-border bg-card py-6">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickStats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="flex items-center gap-3 rounded-lg bg-background p-4">
                <stat.icon className={`h-8 w-8 ${stat.color} shrink-0`} />
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
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
              <TabsTrigger value="budget" className="text-xs sm:text-sm">Budget</TabsTrigger>
              <TabsTrigger value="foia" className="text-xs sm:text-sm">FOIA Tracker</TabsTrigger>
              <TabsTrigger value="elections" className="text-xs sm:text-sm">Elections</TabsTrigger>
              <TabsTrigger value="officials" className="text-xs sm:text-sm">Officials</TabsTrigger>
              <TabsTrigger value="meetings" className="text-xs sm:text-sm">Public Meetings</TabsTrigger>
            </TabsList>

            {/* Budget */}
            <TabsContent value="budget">
              <motion.div initial="hidden" animate="show" variants={stagger} className="grid gap-8 lg:grid-cols-2">
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-michigan-gold" />
                        FY2025 State Budget by Department
                      </CardTitle>
                      <CardDescription>Total: ~$60 billion (General Fund + Federal)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={budgetData} layout="vertical" margin={{ left: 10, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis type="number" unit="B" tickFormatter={(v) => `$${v}`} />
                          <YAxis dataKey="dept" type="category" width={160} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v: number) => [`$${v}B`, "Spending"]} />
                          <Bar dataKey="amount" fill="hsl(209, 86%, 31%)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget Allocation</CardTitle>
                      <CardDescription>Percentage breakdown of state spending</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie data={budgetPie} cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2} dataKey="amount" label={({ shortLabel, pct }) => `${shortLabel} ${pct}%`} labelLine={{ strokeWidth: 1 }}>
                            {budgetPie.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number, _name: string, props: any) => [`$${v}B (${props.payload.pct}%)`, props.payload.dept]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {budgetPie.map((d) => (
                          <div key={d.dept} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: d.color }} />
                            <span>{d.dept} ({d.pct}%)</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        <strong>Education leads</strong> at 28% of the budget, followed by Health & Human Services at 17%.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* FOIA */}
            <TabsContent value="foia">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-michigan-teal" />
                        FOIA Request Volume & Outcomes
                      </CardTitle>
                      <CardDescription>Michigan Freedom of Information Act requests to state agencies (2019–2024)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={foiaRequests}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="fulfilled" fill="hsl(145, 32%, 30%)" name="Fulfilled" stackId="a" />
                          <Bar dataKey="denied" fill="hsl(0, 100%, 71%)" name="Denied" stackId="a" />
                          <Bar dataKey="pending" fill="hsl(27, 87%, 67%)" name="Pending" stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-8">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="how">
                      <AccordionTrigger>How to File a FOIA Request in Michigan</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground space-y-2">
                        <p>Any person, business, or organization can submit a FOIA request. Michigan law does not require you to state your reason for the request.</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Identify the public body that holds the records you want.</li>
                          <li>Write a request describing the records with reasonable specificity.</li>
                          <li>Submit via mail, email, or the agency's online portal.</li>
                          <li>The agency must respond within 5 business days.</li>
                        </ol>
                        <p className="mt-2">
                          <a href="https://www.michigan.gov/treasury/local/foil" target="_blank" rel="noopener" className="text-primary underline">Michigan FOIA Resources →</a>
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="cost">
                      <AccordionTrigger>What does it cost?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Agencies can charge for search, review, and copying, but the first $20 of costs is waived for most requests. Indigent citizens may request fee waivers. Electronic records are generally less expensive than paper copies.
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
                        <Vote className="h-5 w-5 text-michigan-forest" />
                        Michigan Voter Turnout vs. National Average
                      </CardTitle>
                      <CardDescription>Percentage of eligible voters who cast ballots (2016–2024)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={voterTurnout}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis dataKey="year" />
                          <YAxis unit="%" domain={[40, 80]} />
                          <Tooltip formatter={(v: number) => `${v}%`} />
                          <Legend />
                          <Line type="monotone" dataKey="turnout" stroke="hsl(209, 86%, 31%)" strokeWidth={2} name="Michigan" dot={{ r: 5 }} />
                          <Line type="monotone" dataKey="national" stroke="hsl(215, 19%, 35%)" strokeWidth={2} strokeDasharray="5 5" name="National Avg" dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Michigan consistently outperforms the national average. The 2020 election saw a record 71.4% turnout following expanded absentee voting under Proposal 3 (2018).
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-8 grid gap-6 md:grid-cols-3">
                  {[
                    { title: "Register to Vote", desc: "Register online, by mail, or in person — including same-day registration at your local clerk's office.", link: "https://mvic.sos.state.mi.us/registervoter", icon: Users },
                    { title: "Find Your Polling Place", desc: "Look up your polling location, sample ballot, and elected officials by address.", link: "https://mvic.sos.state.mi.us/", icon: Building2 },
                    { title: "Track Your Ballot", desc: "Check the status of your absentee ballot from application to counting.", link: "https://mvic.sos.state.mi.us/voter/index", icon: TrendingUp },
                  ].map((item) => (
                    <Card key={item.title} className="group hover:border-michigan-forest/30 transition-colors">
                      <CardContent className="p-6">
                        <item.icon className="mb-3 h-8 w-8 text-michigan-forest" />
                        <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
                        <p className="mb-4 text-sm text-muted-foreground">{item.desc}</p>
                        <a href={item.link} target="_blank" rel="noopener" className="text-sm font-medium text-primary hover:underline">
                          Go to tool <ExternalLink className="ml-1 inline h-3 w-3" />
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
                        Statewide Elected Officials
                      </CardTitle>
                      <CardDescription>Current executive branch leadership</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {electedOfficials.map((official) => (
                          <div key={official.title} className="flex items-start gap-4 rounded-lg border border-border p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">{official.title}</p>
                              <p className="font-semibold text-foreground">{official.name}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{official.party}</Badge>
                                <span className="text-xs text-muted-foreground">Since {official.since}</span>
                              </div>
                              <a href={official.contact} target="_blank" rel="noopener" className="mt-2 inline-block text-xs text-primary hover:underline">
                                Official website <ExternalLink className="ml-1 inline h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-6">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                      <Landmark className="h-8 w-8 shrink-0 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Find Your State Legislators</h3>
                        <p className="text-sm text-muted-foreground">Look up your State Senator and State Representative by address using the Michigan Legislature's official tool.</p>
                      </div>
                      <Button variant="outline" asChild>
                        <a href="https://www.legislature.mi.gov/legislators" target="_blank" rel="noopener">
                          Find Legislators <ExternalLink className="ml-2 h-3 w-3" />
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
                        <Calendar className="h-5 w-5 text-michigan-gold" />
                        Upcoming Public Meetings & Hearings
                      </CardTitle>
                      <CardDescription>Open to public comment — attend in person or virtually</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {publicMeetings.map((meeting, i) => (
                          <motion.div
                            key={i}
                            variants={fadeUp}
                            className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{meeting.body}</p>
                              <p className="text-sm text-muted-foreground">{meeting.date} · {meeting.time} · {meeting.location}</p>
                            </div>
                            <Badge variant={meeting.type === "Public Hearing" ? "destructive" : meeting.type === "Hearing" ? "secondary" : "outline"}>
                              {meeting.type}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                      <p className="mt-6 text-xs text-muted-foreground">
                        Michigan's Open Meetings Act guarantees public access to government deliberations. All meetings listed are open to the public.
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
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mx-auto max-w-4xl">
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-michigan-teal/10 px-4 py-1.5">
                <Globe className="h-4 w-4 text-michigan-teal" />
                <span className="text-sm font-medium text-michigan-teal">Open Data & Transparency</span>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">How to Request Open Data</h2>
              <p className="text-muted-foreground">
                Michigan residents, journalists, researchers, and organizations all have the right to request government data. Here's how.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-michigan-teal" />
                    Filing a FOIA Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>The <strong>Freedom of Information Act (FOIA)</strong> gives anyone the right to request records from any Michigan public body — no reason needed.</p>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li><strong>Identify the agency</strong> that holds the data (state department, county, city, school district, etc.).</li>
                    <li><strong>Write a specific request</strong> describing the records you want. Be as precise as possible.</li>
                    <li><strong>Submit via email, mail, or online portal.</strong> Many agencies have FOIA coordinators listed on their websites.</li>
                    <li><strong>Expect a response within 5 business days.</strong> The agency must acknowledge your request and provide a cost estimate if fees apply.</li>
                  </ol>
                  <p className="pt-2">
                    <a href="https://www.michigan.gov/treasury/local/foil" target="_blank" rel="noopener" className="font-medium text-primary hover:underline">
                      Michigan FOIA Guide & Templates <ExternalLink className="ml-1 inline h-3 w-3" />
                    </a>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Search className="h-5 w-5 text-michigan-teal" />
                    Already-Open Data Portals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Before filing a request, check if the data is already publicly available through these top resources:</p>
                  <ul className="space-y-2">
                    {[
                      { name: "Michigan Open Data Portal", url: "https://data.michigan.gov", desc: "State government datasets — health, education, infrastructure, and more" },
                      { name: "Data.gov", url: "https://data.gov", desc: "Federal open data including Michigan-specific datasets from EPA, HHS, DOT" },
                      { name: "U.S. Census Bureau", url: "https://data.census.gov", desc: "Demographics, economics, housing data by county, city, and tract" },
                      { name: "Michigan Legislature", url: "https://www.legislature.mi.gov", desc: "Bills, voting records, committee schedules, and session archives" },
                      { name: "MiSchoolData", url: "https://www.mischooldata.org", desc: "K-12 school performance, enrollment, graduation rates" },
                    ].map((r) => (
                      <li key={r.name} className="flex flex-col">
                        <a href={r.url} target="_blank" rel="noopener" className="font-medium text-primary hover:underline">
                          {r.name} <ExternalLink className="ml-1 inline h-3 w-3" />
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
                  <BookOpen className="h-8 w-8 shrink-0 text-michigan-teal" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Can't find the data you need?</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact the agency's FOIA coordinator directly, reach out to organizations like the <strong>Michigan Press Association</strong> or <strong>Reporters Committee for Freedom of the Press</strong> for guidance, or attend a public meeting to request data be made available proactively.
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="https://www.rcfp.org/open-government-guide/michigan/" target="_blank" rel="noopener">
                      MI Open Gov Guide <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
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
            <a href="https://www.michigan.gov/budget" target="_blank" rel="noopener" className="underline hover:text-primary">Michigan Budget Office</a>,{" "}
            <a href="https://www.michigan.gov/sos" target="_blank" rel="noopener" className="underline hover:text-primary">Secretary of State</a>,{" "}
            <a href="https://www.legislature.mi.gov/" target="_blank" rel="noopener" className="underline hover:text-primary">Michigan Legislature</a>,{" "}
            <a href="https://www.electproject.org/" target="_blank" rel="noopener" className="underline hover:text-primary">U.S. Elections Project</a>
          </p>
          <p className="mt-2 text-xs font-semibold text-michigan-gold">⚠ Some values are demo data for prototype purposes</p>
        </div>
      </section>
    </Layout>
  );
};

export default CivicDataPage;
