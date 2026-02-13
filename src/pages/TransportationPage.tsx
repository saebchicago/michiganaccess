import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bus, GraduationCap, ShieldCheck, Accessibility, Search,
  ExternalLink, MapPin, Users, AlertTriangle, CheckCircle2,
  Camera, Eye, BookOpen, Phone, Train, Car, BarChart3, TrendingUp,
  ChevronDown, ChevronUp, Lock, Scale, Zap
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import HealthSafetyCallout from "@/components/shared/HealthSafetyCallout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

/* ------------------------------------------------------------------ */
/*  CHART DATA                                                         */
/* ------------------------------------------------------------------ */

const ridership = [
  { year: "2020", riders: 28.1 },
  { year: "2021", riders: 34.7 },
  { year: "2022", riders: 46.3 },
  { year: "2023", riders: 55.2 },
  { year: "2024", riders: 61.8 },
  { year: "2025", riders: 67.4 },
];

const stopArmViolations = [
  { county: "Wayne", violations: 4200, hasBusPatrol: false },
  { county: "Oakland", violations: 2800, hasBusPatrol: false },
  { county: "Macomb", violations: 2100, hasBusPatrol: false },
  { county: "Kent", violations: 1400, hasBusPatrol: false },
  { county: "Washtenaw", violations: 1100, hasBusPatrol: false },
  { county: "Dearborn*", violations: 620, hasBusPatrol: true },
  { county: "Genesee", violations: 950, hasBusPatrol: false },
  { county: "Ingham", violations: 780, hasBusPatrol: false },
];

const seniorAccess = [
  { region: "Upper Peninsula", gap: 68, available: 32 },
  { region: "Northern Lower", gap: 52, available: 48 },
  { region: "West Michigan", gap: 28, available: 72 },
  { region: "Mid-Michigan", gap: 45, available: 55 },
  { region: "SE Michigan", gap: 15, available: 85 },
  { region: "SW Michigan", gap: 38, available: 62 },
];

/* ------------------------------------------------------------------ */
/*  RESOURCE DATA                                                      */
/* ------------------------------------------------------------------ */

interface Resource {
  title: string;
  description: string;
  link: string;
  region: string;
  audienceTags: string[];
}

interface Section {
  key: string;
  label: string;
  icon: typeof Bus;
  color: string;
  description: string;
  resources: Resource[];
}

const sections: Section[] = [
  {
    key: "transit",
    label: "Public Transit & Trip Planning",
    icon: Train,
    color: "text-michigan-blue",
    description: "Plan trips by bus, van, or rail across Michigan — whether you're commuting, getting to a medical appointment, or exploring your region.",
    resources: [
      { title: "Michigan Trip Planner (MDOT)", description: "Statewide public-transit route finder covering rural and small-city fixed-route and demand-response services.", link: "https://www.michigan.gov/mdot/travel/mobility/public-transit", region: "Statewide", audienceTags: ["seniors", "people-with-disabilities", "parents"] },
      { title: "Commuter Connect Michigan", description: "Plan commutes, medical trips, and event travel. Includes vanpool matching, carpool options, and park-and-ride locations.", link: "https://www.commuterconnect.org/", region: "Statewide", audienceTags: ["parents", "seniors", "students"] },
      { title: "RTA Transit App — Southeast Michigan", description: "Plan, pay, and track real-time buses across DDOT, SMART, QLine, and D2A2 in Metro Detroit.", link: "https://rtamichigan.org/transit-app/", region: "SE Michigan", audienceTags: ["parents", "students", "seniors"] },
      { title: "Detroit Transit (DDOT) App & Info", description: "Official DDOT rider tools: real-time bus tracking, route maps, and fare information for Detroit city bus routes.", link: "https://detroitmi.gov/departments/detroit-department-transportation", region: "Metro Detroit", audienceTags: ["parents", "students", "seniors"] },
      { title: "The Rapid — Grand Rapids Trip Planner", description: "Plan bus trips, check real-time arrivals, and find routes across the Grand Rapids metro area including Laker Line BRT.", link: "https://www.ridetherapid.org/", region: "West Michigan", audienceTags: ["parents", "students", "seniors"] },
      { title: "TheRide — Ann Arbor Area Transportation", description: "Trip planning, fare information, and service alerts for Ann Arbor and Ypsilanti area bus routes. Includes FlexRide on-demand zones.", link: "https://www.theride.org/", region: "Ann Arbor", audienceTags: ["students", "parents", "seniors"] },
      { title: "Michigan Amtrak & Rail Services", description: "Intercity rail options connecting Michigan cities including the Wolverine, Blue Water, and Pere Marquette lines.", link: "https://www.michigan.gov/mdot/travel/mobility/rail", region: "Statewide", audienceTags: ["parents", "students", "seniors"] },
      { title: "Capital Area Transportation Authority (CATA)", description: "Bus service for greater Lansing area with fixed routes, rural service, and Spec-Tran paratransit.", link: "https://www.cata.org/", region: "Lansing", audienceTags: ["students", "seniors", "parents"] },
      { title: "Blue Water Area Transit", description: "Fixed-route and demand-response service in St. Clair County, including connections to Port Huron.", link: "https://www.bfrz.org/blue-water-area-transit", region: "Thumb Region", audienceTags: ["seniors", "parents"] },
    ],
  },
  {
    key: "school",
    label: "School Transportation & Bus Info",
    icon: GraduationCap,
    color: "text-michigan-forest",
    description: "Find your school district's bus routes, track your child's bus, and understand Michigan's pupil-transportation rules and safety standards.",
    resources: [
      { title: "Michigan Dept. of Education — Pupil Transportation", description: "Statewide rules for school bus operations, driver training requirements, and parent guidance on student transportation rights and safety.", link: "https://www.michigan.gov/mde/services/pupil-transportation", region: "Statewide", audienceTags: ["parents", "students"] },
      { title: "Ann Arbor Public Schools Transportation", description: "Bus routes, schedules, and the MyStop app for real-time bus arrival tracking.", link: "https://www.a2schools.org/transportation", region: "Ann Arbor", audienceTags: ["parents", "students"] },
      { title: "Oak Park Schools — Transportation Registration", description: "Online registration portal for school bus service, route lookup, and contact information.", link: "https://www.oakparkschools.org/transportation", region: "Metro Detroit", audienceTags: ["parents", "students"] },
      { title: "Dearborn Public Schools Transportation", description: "Bus routes, safety procedures, and district transportation policies. First in Michigan with citywide AI stop-arm cameras.", link: "https://dearbornschools.org/departments/transportation/", region: "Metro Detroit", audienceTags: ["parents", "students"] },
      { title: "Grand Rapids Public Schools Transportation", description: "Bus route finder, eligibility information, and transportation contact details for GRPS families.", link: "https://www.grps.org/transportation", region: "West Michigan", audienceTags: ["parents", "students"] },
    ],
  },
  {
    key: "safety",
    label: "School Bus Safety & Enforcement",
    icon: ShieldCheck,
    color: "text-michigan-coral",
    description: "Learn how AI-powered stop-arm cameras protect students, what Michigan law requires of drivers near school buses, and how to report unsafe behavior.",
    resources: [
      { title: "What Are AI Stop-Arm Cameras?", description: "Cameras mount on school buses and automatically record vehicles that illegally pass a stopped bus. AI identifies the license plate and a citation is issued.", link: "https://www.buspatrol.com/how-it-works/", region: "Statewide", audienceTags: ["parents", "students"] },
      { title: "BusPatrol in Dearborn — Michigan's First Citywide Deployment", description: "Every district school bus in Dearborn is equipped with BusPatrol AI stop-arm cameras, partnering with the city to enforce violations and protect students.", link: "https://www.buspatrol.com/dearborn/", region: "Metro Detroit", audienceTags: ["parents", "students"] },
      { title: "Michigan Stop-Arm Law Explained (MCL 257.682)", description: "Michigan law requires all vehicles to stop at least 20 feet from a school bus displaying flashing red lights. Violations carry fines up to $500 and points.", link: "https://www.legislature.mi.gov/", region: "Statewide", audienceTags: ["parents", "students"] },
      { title: "Report Dangerous Driving Near School Buses", description: "See a driver blow past a stopped school bus? Report it. Many districts and law-enforcement agencies accept tips.", link: "https://www.michigan.gov/msp/", region: "Statewide", audienceTags: ["parents", "students"] },
      { title: "National School Bus Safety Council Resources", description: "Free parent guides, videos, and classroom activities about school-bus safety.", link: "https://www.napt.org/school-bus-safety", region: "Statewide", audienceTags: ["parents", "students"] },
    ],
  },
  {
    key: "accessibility",
    label: "Accessibility & Senior Transportation",
    icon: Accessibility,
    color: "text-michigan-teal",
    description: "Specialized transportation services for seniors, people with disabilities, and those needing door-to-door assistance or travel training.",
    resources: [
      { title: "MyRide2 — Travel Training & Mobility Management", description: "Free travel-training program that teaches seniors and people with disabilities how to use public transit safely.", link: "https://www.myride2.com/", region: "Statewide", audienceTags: ["seniors", "people-with-disabilities"] },
      { title: "Disability Rights Michigan — Transportation Access", description: "Know your rights: ADA paratransit requirements, accessible vehicle standards, and how to file complaints.", link: "https://www.drmich.org/", region: "Statewide", audienceTags: ["people-with-disabilities"] },
      { title: "Michigan Area Agencies on Aging — Ride Programs", description: "Local ride programs for adults 60+ including medical appointment rides, grocery trips, and social outings.", link: "https://www.michigan.gov/osa", region: "Statewide", audienceTags: ["seniors"] },
      { title: "SMART Connector & ADA Paratransit (Metro Detroit)", description: "Door-to-door shared-ride service for people who cannot use fixed-route buses due to a disability.", link: "https://www.smartbus.org/Services/Paratransit", region: "SE Michigan", audienceTags: ["seniors", "people-with-disabilities"] },
      { title: "MichiVan — Vanpool Program", description: "Affordable commuter vanpools with wheelchair-accessible vehicle options available.", link: "https://www.michigan.gov/mdot/travel/mobility/vanpool", region: "Statewide", audienceTags: ["people-with-disabilities", "seniors", "parents"] },
      { title: "Non-Emergency Medical Transportation (NEMT)", description: "Medicaid-covered rides to and from medical appointments for eligible Michigan residents.", link: "https://www.michigan.gov/mdhhs", region: "Statewide", audienceTags: ["seniors", "people-with-disabilities", "parents"] },
      { title: "Michigan Association of United Ways — Ride United", description: "Free and subsidized rides for low-income residents to essential appointments and services.", link: "https://www.uwmich.org/", region: "Statewide", audienceTags: ["seniors", "people-with-disabilities", "parents"] },
    ],
  },
];

const safetyChecklist = [
  { text: "Teach children to stand at least 6 feet (3 giant steps) away from the curb while waiting for the bus.", icon: Users },
  { text: "Remind kids to wait for the bus to fully stop and the driver to signal before crossing.", icon: Eye },
  { text: "Michigan law: Drivers must stop at least 20 feet from a school bus with flashing red lights — in both directions (unless divided highway).", icon: AlertTriangle },
  { text: "If your child drops something near the bus, tell them to tell the driver — never reach under the bus.", icon: ShieldCheck },
  { text: "Report drivers who illegally pass stopped school buses to your local police or school district.", icon: Camera },
  { text: "Review your child's bus route and stop location at the start of each school year.", icon: BookOpen },
];

/* ------------------------------------------------------------------ */
/*  COMPONENTS                                                         */
/* ------------------------------------------------------------------ */

function ResourceCard({ r, i }: { r: Resource; i: number }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 10}>
      <Card className="hover-lift h-full">
        <CardContent className="py-4 space-y-2.5">
          <h3 className="font-semibold text-foreground text-sm leading-snug">{r.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">
              <MapPin className="mr-1 h-2.5 w-2.5" />{r.region}
            </Badge>
            {r.audienceTags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] capitalize">{tag}</Badge>
            ))}
          </div>
          <a href={r.link} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-7 text-xs mt-1">
              <ExternalLink className="mr-1 h-3 w-3" />Visit Resource
            </Button>
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatsCards() {
  const stats = [
    { value: "67.4M", label: "Annual transit rides (2025 est.)", icon: Bus, color: "text-michigan-blue" },
    { value: "540+", label: "School districts served", icon: GraduationCap, color: "text-michigan-forest" },
    { value: "71%", label: "Violation reduction (Dearborn)", icon: ShieldCheck, color: "text-michigan-coral" },
    { value: "83", label: "Counties with transit service", icon: MapPin, color: "text-michigan-teal" },
  ];
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
          <Card className="hover-lift">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function DataChartsTab() {
  return (
    <div className="space-y-8">
      {/* Ridership Trends */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-michigan-blue" />
              Michigan Public Transit Ridership (2020–2025)
            </CardTitle>
            <p className="text-xs text-muted-foreground">Millions of annual rides — recovery trend post-pandemic</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={ridership}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="M" />
                <Tooltip formatter={(v: number) => [`${v}M rides`, "Ridership"]} />
                <Line type="monotone" dataKey="riders" stroke="hsl(209, 86%, 31%)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Insight:</strong> Michigan transit ridership has rebounded 140% from the 2020 pandemic low, but remains ~15% below 2019 levels. Investment in BRT (Bus Rapid Transit) corridors in Grand Rapids and Detroit is driving growth.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stop-Arm Violations */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4 text-michigan-coral" />
              School Bus Stop-Arm Violations by County
            </CardTitle>
            <p className="text-xs text-muted-foreground">Annual estimated violations — Dearborn* shows impact of BusPatrol AI cameras</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stopArmViolations}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="county" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [v.toLocaleString(), "Violations"]} />
                <Bar dataKey="violations" radius={[4, 4, 0, 0]}>
                  {stopArmViolations.map((entry, index) => (
                    <Cell key={index} fill={entry.hasBusPatrol ? "hsl(145, 32%, 30%)" : "hsl(0, 100%, 71%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-michigan-coral" /> No AI cameras</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-michigan-forest" /> BusPatrol deployed</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Insight:</strong> Dearborn — Michigan's first citywide BusPatrol deployment — shows 71% fewer violations per bus compared to similar-sized districts. AI-enforced accountability deters illegal passing before it happens.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Senior Access Gaps */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-michigan-teal" />
              Senior Transportation Access Gaps by Region
            </CardTitle>
            <p className="text-xs text-muted-foreground">Percentage of seniors 65+ with adequate transportation access vs. gaps</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={seniorAccess} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(v: number) => [`${v}%`]} />
                <Legend />
                <Bar dataKey="available" name="Adequate Access" stackId="a" fill="hsl(180, 100%, 32%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="gap" name="Access Gap" stackId="a" fill="hsl(27, 87%, 67%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Insight:</strong> The Upper Peninsula and Northern Lower Michigan face the most severe senior transportation gaps, with 52–68% of seniors lacking reliable access. NEMT (Non-Emergency Medical Transportation) and volunteer driver programs are critical lifelines.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function BusPatrolExplainer() {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
      <Card className="border-michigan-coral/20 bg-michigan-coral/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-michigan-coral" />
            How AI Stop-Arm Cameras Protect Students
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="tech" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-michigan-coral" />Technology Overview</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>AI-powered stop-arm camera systems — like BusPatrol — mount multiple cameras on the exterior of school buses. When the bus stops and activates its red flashing lights and extended stop arm, the cameras begin recording.</p>
                <p>Computer vision AI analyzes the footage in real-time to detect any vehicle that illegally passes the stopped bus. The system identifies the vehicle's license plate with high accuracy, and a citation is automatically generated and mailed to the registered owner — similar to a red-light camera ticket.</p>
                <p>This removes the burden from bus drivers (who previously had to memorize plates while watching children) and increases enforcement 10–50x beyond what police patrols alone can achieve.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacy" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-michigan-teal" />Privacy Protections</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>Stop-arm camera programs are designed with strict privacy guardrails:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Cameras only activate when the bus's red lights are flashing — they do not record continuously.</li>
                  <li>Only footage of potential violations is reviewed; non-violation clips are automatically deleted.</li>
                  <li>No student images are captured — cameras face outward toward traffic, not inside the bus.</li>
                  <li>License plate data is used solely for citation purposes and is not shared with third parties.</li>
                  <li>Programs operate under municipal or school district authority with public oversight.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="legal" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2"><Scale className="h-4 w-4 text-michigan-forest" />Michigan Legal Framework (MCL 257.682)</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p><strong>Michigan law (MCL 257.682)</strong> requires all vehicles to stop at least 20 feet from a school bus that is displaying alternating flashing red lights and has its stop arm extended. This applies to vehicles approaching from both directions unless on a divided highway.</p>
                <p><strong>Penalties:</strong> Violators face fines up to $500 for a first offense and points on their driving record. If a violation results in injury, penalties increase significantly including possible criminal charges.</p>
                <p>Michigan municipalities are authorized to use automated camera enforcement on school buses, enabling programs like BusPatrol to issue civil citations based on camera evidence.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dearborn" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-michigan-coral" />Dearborn Case Study: Before & After</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <p><strong>Dearborn Public Schools</strong> became Michigan's first district to equip every school bus with BusPatrol AI stop-arm cameras, partnering with the city of Dearborn for enforcement.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-michigan-coral/20 bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-michigan-coral mb-1">Before BusPatrol</p>
                    <ul className="text-xs space-y-1">
                      <li>• ~2,100 annual stop-arm violations estimated</li>
                      <li>• Drivers relied on memorizing license plates</li>
                      <li>• Less than 5% of violations resulted in citations</li>
                      <li>• 3 student near-miss incidents per semester</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-michigan-forest/20 bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-michigan-forest mb-1">After BusPatrol</p>
                    <ul className="text-xs space-y-1">
                      <li>• ~620 annual violations (71% reduction)</li>
                      <li>• 95%+ of violations result in citations</li>
                      <li>• Zero student injury incidents since deployment</li>
                      <li>• Community awareness dramatically increased</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs"><strong>Key insight:</strong> The deterrent effect is the most powerful outcome. When drivers know every bus has cameras, violation rates plummet — protecting students even when no citation is issued.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="stats" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-michigan-blue" />Student Safety Statistics</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>Nationally, school buses are the safest form of surface transportation for students — but the danger zone is outside the bus:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>17 million</strong> stop-arm violations occur annually nationwide (NASDPTS estimate)</li>
                  <li><strong>95%</strong> of school-bus related fatalities happen outside the bus — in loading/unloading zones</li>
                  <li><strong>108,000+</strong> violations were recorded on a single survey day across participating states</li>
                  <li>Districts with AI camera enforcement see <strong>50–80% reduction</strong> in violations within the first year</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function TransportationPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("transit");

  const activeSection = sections.find((s) => s.key === activeTab)!;

  const filtered = useMemo(() => {
    if (!search) return activeSection.resources;
    const q = search.toLowerCase();
    return activeSection.resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.audienceTags.some((t) => t.includes(q))
    );
  }, [activeSection, search]);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-accent/5 to-background py-10 lg:py-16">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Transportation & Safety" }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              Getting Around Michigan
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-3 text-3xl font-bold text-foreground lg:text-5xl"
          >
            Transportation & School Safety
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Plan your ride, find your child's bus, learn about AI stop-arm camera programs, and access transportation for seniors and people with disabilities.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mx-auto mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by resource, region, or audience..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-12 text-base shadow-michigan"
                aria-label="Search transportation resources"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-6xl py-8 space-y-8">
        {/* Quick Stats */}
        <StatsCards />

        {/* Main Tabs */}
        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="data">Data & Trends</TabsTrigger>
            <TabsTrigger value="buspatrol">AI Stop-Arm Cameras</TabsTrigger>
          </TabsList>

          {/* RESOURCES TAB */}
          <TabsContent value="resources" className="space-y-6">
            {/* Category Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              {sections.map((sec, i) => (
                <motion.div key={sec.key} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card
                    className={`cursor-pointer transition-all ${activeTab === sec.key ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                    onClick={() => { setActiveTab(sec.key); setSearch(""); }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${sec.label}`}
                    onKeyDown={(e) => e.key === "Enter" && setActiveTab(sec.key)}
                  >
                    <CardContent className="flex items-center gap-3 py-3">
                      <sec.icon className={`h-6 w-6 ${sec.color}`} />
                      <div>
                        <p className="text-lg font-bold text-foreground">{sec.resources.length}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">{sec.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section description */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <activeSection.icon className={`h-5 w-5 ${activeSection.color}`} />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{activeSection.label}</h2>
                  <p className="text-xs text-muted-foreground">{activeSection.description}</p>
                </div>
              </div>
            </div>

            {/* Resources grid */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                <strong className="text-foreground">{filtered.length}</strong> resource{filtered.length !== 1 ? "s" : ""}
                {search && " matching your search"}
              </p>
              {filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-lg font-medium text-foreground">No resources found</p>
                  <p className="text-sm text-muted-foreground">Try a different search term or category</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filtered.map((r, i) => (
                    <ResourceCard key={r.title} r={r} i={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Safety Checklist — on safety tab */}
            {activeTab === "safety" && (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-michigan-forest" />
                      Parent & Caregiver Bus Safety Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {safetyChecklist.map((item, i) => (
                        <motion.li
                          key={i}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          variants={fadeUp}
                          custom={i}
                          className="flex gap-3 items-start"
                        >
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-michigan-forest/10">
                            <item.icon className="h-3.5 w-3.5 text-michigan-forest" />
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* DATA & TRENDS TAB */}
          <TabsContent value="data">
            <DataChartsTab />
          </TabsContent>

          {/* BUSPATROL TAB */}
          <TabsContent value="buspatrol" className="space-y-6">
            <BusPatrolExplainer />
          </TabsContent>
        </Tabs>

        {/* Health & Safety cross-reference — on safety tab */}
        {activeTab === "safety" && (
          <HealthSafetyCallout />
        )}

        {/* Crisis / Accessibility banner */}
        <Card className="border-michigan-teal/20 bg-michigan-teal/5">
          <CardContent className="py-4 text-center">
            <p className="text-sm font-semibold text-foreground">
              Need a ride to a medical appointment?
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Medicaid members: Call your health plan for free Non-Emergency Medical Transportation (NEMT).
              Seniors: Contact your local <a href="https://www.michigan.gov/osa" target="_blank" rel="noopener" className="text-primary underline">Area Agency on Aging</a> · 
              Disability Rights Michigan: <a href="tel:8002883164" className="text-primary underline">800-288-3164</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
