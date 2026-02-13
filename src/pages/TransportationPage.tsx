import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bus, GraduationCap, ShieldCheck, Accessibility, Search,
  ExternalLink, MapPin, Users, AlertTriangle, CheckCircle2,
  Camera, Eye, BookOpen, Phone, Train, Car
} from "lucide-react";
import Layout from "@/components/layout/Layout";
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
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
      {
        title: "Michigan Trip Planner (MDOT)",
        description: "Statewide public-transit route finder covering rural and small-city fixed-route and demand-response services. Helpful for residents outside major metro areas.",
        link: "https://www.michigan.gov/mdot/travel/mobility/public-transit",
        region: "Statewide",
        audienceTags: ["seniors", "people-with-disabilities", "parents"],
      },
      {
        title: "Commuter Connect Michigan",
        description: "Plan commutes, medical trips, and event travel. Includes vanpool matching, carpool options, and park-and-ride locations across the state.",
        link: "https://www.commuterconnect.org/",
        region: "Statewide",
        audienceTags: ["parents", "seniors", "students"],
      },
      {
        title: "RTA Transit App — Southeast Michigan",
        description: "Plan, pay, and track real-time buses and shuttles across DDOT, SMART, QLine, and D2A2 in Metro Detroit and beyond.",
        link: "https://rtamichigan.org/transit-app/",
        region: "SE Michigan",
        audienceTags: ["parents", "students", "seniors"],
      },
      {
        title: "Detroit Transit (DDOT) App & Info",
        description: "Official DDOT rider tools: real-time bus tracking, route maps, and fare information for Detroit city bus routes.",
        link: "https://detroitmi.gov/departments/detroit-department-transportation",
        region: "Metro Detroit",
        audienceTags: ["parents", "students", "seniors"],
      },
      {
        title: "The Rapid — Grand Rapids Trip Planner",
        description: "Plan bus trips, check real-time arrivals, and find routes across the Grand Rapids metro area including Laker Line BRT.",
        link: "https://www.ridetherapid.org/",
        region: "West Michigan",
        audienceTags: ["parents", "students", "seniors"],
      },
      {
        title: "TheRide — Ann Arbor Area Transportation",
        description: "Trip planning, fare information, and service alerts for Ann Arbor and Ypsilanti area bus routes. Includes FlexRide on-demand zones.",
        link: "https://www.theride.org/",
        region: "Ann Arbor",
        audienceTags: ["students", "parents", "seniors"],
      },
      {
        title: "Michigan Amtrak & Rail Services",
        description: "Intercity rail options connecting Michigan cities including the Wolverine, Blue Water, and Pere Marquette lines.",
        link: "https://www.michigan.gov/mdot/travel/mobility/rail",
        region: "Statewide",
        audienceTags: ["parents", "students", "seniors"],
      },
    ],
  },
  {
    key: "school",
    label: "School Transportation & Bus Info",
    icon: GraduationCap,
    color: "text-michigan-forest",
    description: "Find your school district's bus routes, track your child's bus, and understand Michigan's pupil-transportation rules and safety standards.",
    resources: [
      {
        title: "Michigan Dept. of Education — Pupil Transportation",
        description: "Statewide rules for school bus operations, driver training requirements, and parent guidance on student transportation rights and safety.",
        link: "https://www.michigan.gov/mde/services/pupil-transportation",
        region: "Statewide",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Ann Arbor Public Schools Transportation",
        description: "Bus routes, schedules, and the MyStop app for real-time bus arrival tracking. Parents can see exactly when their child's bus will arrive.",
        link: "https://www.a2schools.org/transportation",
        region: "Ann Arbor",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Oak Park Schools — Transportation Registration",
        description: "Online registration portal for school bus service, route lookup, and contact information for transportation questions.",
        link: "https://www.oakparkschools.org/transportation",
        region: "Metro Detroit",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Dearborn Public Schools Transportation",
        description: "Bus routes, safety procedures, and district transportation policies. Dearborn is a leader in adopting new bus-safety technology across its fleet.",
        link: "https://dearbornschools.org/departments/transportation/",
        region: "Metro Detroit",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Grand Rapids Public Schools Transportation",
        description: "Bus route finder, eligibility information, and transportation contact details for GRPS families.",
        link: "https://www.grps.org/transportation",
        region: "West Michigan",
        audienceTags: ["parents", "students"],
      },
    ],
  },
  {
    key: "safety",
    label: "School Bus Safety & Enforcement",
    icon: ShieldCheck,
    color: "text-michigan-coral",
    description: "Learn how AI-powered stop-arm cameras protect students, what Michigan law requires of drivers near school buses, and how to report unsafe behavior.",
    resources: [
      {
        title: "What Are AI Stop-Arm Cameras?",
        description: "These cameras mount on school buses and automatically record vehicles that illegally pass a stopped bus with its red lights flashing. AI identifies the license plate and a citation is issued — protecting kids at every stop.",
        link: "https://www.buspatrol.com/how-it-works/",
        region: "Statewide",
        audienceTags: ["parents", "students"],
      },
      {
        title: "BusPatrol in Dearborn — Michigan's First Citywide Deployment",
        description: "Dearborn is the first city in Michigan where every district school bus is equipped with BusPatrol AI stop-arm cameras, partnering with the city to enforce stop-arm violations and protect students.",
        link: "https://www.buspatrol.com/dearborn/",
        region: "Metro Detroit",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Michigan Stop-Arm Law Explained (MCL 257.682)",
        description: "Michigan law requires all vehicles to stop at least 20 feet from a school bus displaying flashing red lights. Violations carry fines up to $500 and points on your license.",
        link: "https://www.legislature.mi.gov/",
        region: "Statewide",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Report Dangerous Driving Near School Buses",
        description: "See a driver blow past a stopped school bus? Report it. Many districts and law-enforcement agencies accept tips to keep bus stops safer.",
        link: "https://www.michigan.gov/msp/",
        region: "Statewide",
        audienceTags: ["parents", "students"],
      },
      {
        title: "National School Bus Safety Council Resources",
        description: "Free parent guides, videos, and classroom activities about school-bus safety. Great for families and school staff.",
        link: "https://www.napt.org/school-bus-safety",
        region: "Statewide",
        audienceTags: ["parents", "students"],
      },
    ],
  },
  {
    key: "accessibility",
    label: "Accessibility & Senior Transportation",
    icon: Accessibility,
    color: "text-michigan-teal",
    description: "Specialized transportation services for seniors, people with disabilities, and those needing door-to-door assistance or travel training.",
    resources: [
      {
        title: "MyRide2 — Travel Training & Mobility Management",
        description: "Free travel-training program that teaches seniors and people with disabilities how to use public transit safely and independently across Michigan.",
        link: "https://www.myride2.com/",
        region: "Statewide",
        audienceTags: ["seniors", "people-with-disabilities"],
      },
      {
        title: "Disability Rights Michigan — Transportation Access",
        description: "Know your rights: ADA paratransit requirements, accessible vehicle standards, and how to file complaints about inaccessible transit services.",
        link: "https://www.drmich.org/",
        region: "Statewide",
        audienceTags: ["people-with-disabilities"],
      },
      {
        title: "Michigan Area Agencies on Aging — Ride Programs",
        description: "Local ride programs for adults 60+ including medical appointment rides, grocery trips, and social outings. Contact your regional AAA for availability.",
        link: "https://www.michigan.gov/osa",
        region: "Statewide",
        audienceTags: ["seniors"],
      },
      {
        title: "SMART Connector & ADA Paratransit (Metro Detroit)",
        description: "Door-to-door shared-ride service for people who cannot use fixed-route buses due to a disability. Serves the suburban Detroit tri-county area.",
        link: "https://www.smartbus.org/Services/Paratransit",
        region: "SE Michigan",
        audienceTags: ["seniors", "people-with-disabilities"],
      },
      {
        title: "MichiVan — Vanpool Program",
        description: "Affordable commuter vanpools with wheelchair-accessible vehicle options available. Great for getting to work or recurring appointments.",
        link: "https://www.michigan.gov/mdot/travel/mobility/vanpool",
        region: "Statewide",
        audienceTags: ["people-with-disabilities", "seniors", "parents"],
      },
      {
        title: "Non-Emergency Medical Transportation (NEMT)",
        description: "Medicaid-covered rides to and from medical appointments for eligible Michigan residents. Contact your Medicaid health plan for scheduling.",
        link: "https://www.michigan.gov/mdhhs",
        region: "Statewide",
        audienceTags: ["seniors", "people-with-disabilities", "parents"],
      },
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
            Plan your ride, find your child's bus, learn about stop-arm camera programs, and access transportation for seniors and people with disabilities.
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
        {/* Category Stats */}
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

        {/* BusPatrol explainer — always visible on safety tab */}
        {activeTab === "safety" && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Card className="border-michigan-coral/20 bg-michigan-coral/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5 text-michigan-coral" />
                  How AI Stop-Arm Cameras Protect Students
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI-powered stop-arm camera programs — like those operated by <strong>BusPatrol</strong> — use cameras mounted on the outside of school buses to automatically detect and record vehicles that illegally pass a stopped bus while its red lights are flashing and stop arm is extended.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When a violation is captured, AI reviews the footage, identifies the vehicle's license plate, and a traffic citation is mailed to the registered owner — similar to a red-light camera ticket. This happens automatically, removing the burden from bus drivers and increasing enforcement far beyond what police patrols alone can achieve.
                </p>
                <div className="rounded-md bg-background/80 p-3 border border-michigan-coral/10">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-michigan-coral" />
                    Dearborn: Michigan's First Citywide Deployment
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The <strong>Dearborn Public Schools</strong> district is the first in Michigan to equip <strong>every school bus</strong> with BusPatrol AI stop-arm cameras. The city of Dearborn has partnered with BusPatrol to enforce stop-arm violations, creating a safer environment for the thousands of students who ride district buses each day.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Safety Checklist — always visible on safety tab */}
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
