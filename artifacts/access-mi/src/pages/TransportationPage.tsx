import { useState, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { COUNTIES_COVERED } from "@/config/platformConstants";
import {
  Bus,
  GraduationCap,
  ShieldCheck,
  Accessibility,
  Search,
  ExternalLink,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Eye,
  BookOpen,
  Phone,
  Train,
  Car,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Lock,
  Scale,
  Zap,
  ClipboardList,
  Footprints,
  Bike,
  Construction,
  Layers,
  Info,
  ArrowRight,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import HealthSafetyCallout from "@/components/shared/HealthSafetyCallout";
import SchoolSafetyCallout from "@/components/shared/SchoolSafetyCallout";
import VisitPrepChecklist from "@/components/shared/VisitPrepChecklist";
import CareTeamReminders from "@/components/shared/CareTeamReminders";
import CivicDataCallout from "@/components/shared/CivicDataCallout";
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
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

/* ------------------------------------------------------------------ */
/*  CHART DATA                                                         */
/* ------------------------------------------------------------------ */

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
    description:
      "Plan trips by bus, van, or rail across Michigan - whether you're commuting, getting to a medical appointment, or exploring your region.",
    resources: [
      {
        title: "Michigan Trip Planner (MDOT)",
        description:
          "Statewide public-transit route finder covering rural and small-city fixed-route and demand-response services.",
        link: "https://www.michigan.gov/mdot/travel/mobility/public-transit",
        region: "Statewide",
        audienceTags: ["seniors", "people-with-disabilities", "parents"],
      },
      {
        title: "Commuter Connect Michigan",
        description:
          "Plan commutes, medical trips, and event travel. Includes vanpool matching, carpool options, and park-and-ride locations.",
        link: "https://www.commuterconnect.org/",
        region: "Statewide",
        audienceTags: ["parents", "seniors", "students"],
      },
      {
        title: "RTA Transit App - Southeast Michigan",
        description:
          "Plan, pay, and track real-time buses across DDOT, SMART, QLine, and D2A2 in Metro Detroit.",
        link: "https://rtamichigan.org/transit-app/",
        region: "SE Michigan",
        audienceTags: ["parents", "students", "seniors"],
      },
      {
        title: "Detroit Transit (DDOT) App & Info",
        description:
          "Official DDOT rider tools: real-time bus tracking, route maps, and fare information for Detroit city bus routes.",
        link: "https://detroitmi.gov/departments/detroit-department-transportation",
        region: "Metro Detroit",
        audienceTags: ["parents", "students", "seniors"],
      },
      {
        title: "The Rapid - Grand Rapids Trip Planner",
        description:
          "Plan bus trips, check real-time arrivals, and find routes across the Grand Rapids metro area including Laker Line BRT.",
        link: "https://www.ridetherapid.org/",
        region: "West Michigan",
        audienceTags: ["parents", "students", "seniors"],
      },
      {
        title: "TheRide - Ann Arbor Area Transportation",
        description:
          "Trip planning, fare information, and service alerts for Ann Arbor and Ypsilanti area bus routes. Includes FlexRide on-demand zones.",
        link: "https://www.theride.org/",
        region: "Ann Arbor",
        audienceTags: ["students", "parents", "seniors"],
      },
      {
        title: "Michigan Amtrak & Rail Services",
        description:
          "Intercity rail options connecting Michigan cities including the Wolverine, Blue Water, and Pere Marquette lines.",
        link: "https://www.michigan.gov/mdot/travel/mobility/rail",
        region: "Statewide",
        audienceTags: ["parents", "students", "seniors"],
      },
      {
        title: "Capital Area Transportation Authority (CATA)",
        description:
          "Bus service for greater Lansing area with fixed routes, rural service, and Spec-Tran paratransit.",
        link: "https://www.cata.org/",
        region: "Lansing",
        audienceTags: ["students", "seniors", "parents"],
      },
      {
        title: "Blue Water Area Transit",
        description:
          "Fixed-route and demand-response service in St. Clair County, including connections to Port Huron.",
        link: "https://www.bfrz.org/blue-water-area-transit",
        region: "Thumb Region",
        audienceTags: ["seniors", "parents"],
      },
    ],
  },
  {
    key: "school",
    label: "School Transportation & Bus Info",
    icon: GraduationCap,
    color: "text-michigan-forest-deep",
    description:
      "Find your school district's bus routes, track your child's bus, and understand Michigan's pupil-transportation rules and safety standards.",
    resources: [
      {
        title: "Michigan Dept. of Education - Pupil Transportation",
        description:
          "Statewide rules for school bus operations, driver training requirements, and parent guidance on student transportation rights and safety.",
        link: "https://www.michigan.gov/mde/services/pupil-transportation",
        region: "Statewide",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Ann Arbor Public Schools Transportation",
        description:
          "Bus routes, schedules, and the MyStop app for real-time bus arrival tracking.",
        link: "https://www.a2schools.org/transportation",
        region: "Ann Arbor",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Oak Park Schools - Transportation Registration",
        description:
          "Online registration portal for school bus service, route lookup, and contact information.",
        link: "https://www.oakparkschools.org/transportation",
        region: "Metro Detroit",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Dearborn Public Schools Transportation",
        description:
          "Bus routes, safety procedures, and district transportation policies. First in Michigan with citywide AI stop-arm cameras.",
        link: "https://dearbornschools.org/departments/transportation/",
        region: "Metro Detroit",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Grand Rapids Public Schools Transportation",
        description:
          "Bus route finder, eligibility information, and transportation contact details for GRPS families.",
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
    color: "text-michigan-coral-deep",
    description:
      "Learn how AI-powered stop-arm cameras protect students, what Michigan law requires of drivers near school buses, and how to report unsafe behavior.",
    resources: [
      {
        title: "What Are AI Stop-Arm Cameras?",
        description:
          "Cameras mount on school buses and automatically record vehicles that illegally pass a stopped bus. AI identifies the license plate and a citation is issued.",
        link: "https://www.michigan.gov/mde/services/pupil-transportation",
        region: "Statewide",
        audienceTags: ["parents", "students"],
      },
      {
        title: "School Bus Safety Technology",
        description:
          "Learn about AI and camera technologies being deployed in Michigan school districts to enhance stop-arm safety and protect students from dangerous driving near school buses.",
        link: "https://www.michigan.gov/mde/services/pupil-transportation",
        region: "Metro Detroit",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Michigan Stop-Arm Law Explained (MCL 257.682)",
        description:
          "Michigan law requires all vehicles to stop at least 20 feet from a school bus displaying flashing red lights. Violations carry fines up to $500 and points.",
        link: "https://www.legislature.mi.gov/",
        region: "Statewide",
        audienceTags: ["parents", "students"],
      },
      {
        title: "Report Dangerous Driving Near School Buses",
        description:
          "See a driver blow past a stopped school bus? Report it. Many districts and law-enforcement agencies accept tips.",
        link: "https://www.michigan.gov/msp/",
        region: "Statewide",
        audienceTags: ["parents", "students"],
      },
      {
        title: "National School Bus Safety Council Resources",
        description:
          "Free parent guides, videos, and classroom activities about school-bus safety.",
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
    color: "text-michigan-teal-deep",
    description:
      "Specialized transportation services for seniors, people with disabilities, and those needing door-to-door assistance or travel training.",
    resources: [
      {
        title: "MyRide2 - Travel Training & Mobility Management",
        description:
          "Free travel-training program that teaches seniors and people with disabilities how to use public transit safely.",
        link: "https://www.myride2.com/",
        region: "Statewide",
        audienceTags: ["seniors", "people-with-disabilities"],
      },
      {
        title: "Disability Rights Michigan - Transportation Access",
        description:
          "Know your rights: ADA paratransit requirements, accessible vehicle standards, and how to file complaints.",
        link: "https://www.drmich.org/",
        region: "Statewide",
        audienceTags: ["people-with-disabilities"],
      },
      {
        title: "Michigan Area Agencies on Aging - Ride Programs",
        description:
          "Local ride programs for adults 60+ including medical appointment rides, grocery trips, and social outings.",
        link: "https://www.michigan.gov/osa",
        region: "Statewide",
        audienceTags: ["seniors"],
      },
      {
        title: "SMART Connector & ADA Paratransit (Metro Detroit)",
        description:
          "Door-to-door shared-ride service for people who cannot use fixed-route buses due to a disability.",
        link: "https://www.smartbus.org/Services/Paratransit",
        region: "SE Michigan",
        audienceTags: ["seniors", "people-with-disabilities"],
      },
      {
        title: "MichiVan - Vanpool Program",
        description:
          "Affordable commuter vanpools with wheelchair-accessible vehicle options available.",
        link: "https://www.michigan.gov/mdot/travel/mobility/vanpool",
        region: "Statewide",
        audienceTags: ["people-with-disabilities", "seniors", "parents"],
      },
      {
        title: "Non-Emergency Medical Transportation (NEMT)",
        description:
          "Medicaid-covered rides to and from medical appointments for eligible Michigan residents.",
        link: "https://www.michigan.gov/mdhhs",
        region: "Statewide",
        audienceTags: ["seniors", "people-with-disabilities", "parents"],
      },
      {
        title: "Michigan Association of United Ways - Ride United",
        description:
          "Free and subsidized rides for low-income residents to essential appointments and services.",
        link: "https://www.uwmich.org/",
        region: "Statewide",
        audienceTags: ["seniors", "people-with-disabilities", "parents"],
      },
    ],
  },
];

const safetyChecklist = [
  {
    text: "Teach children to stand at least 6 feet (3 giant steps) away from the curb while waiting for the bus.",
    icon: Users,
  },
  {
    text: "Remind kids to wait for the bus to fully stop and the driver to signal before crossing.",
    icon: Eye,
  },
  {
    text: "Michigan law: Drivers must stop at least 20 feet from a school bus with flashing red lights - in both directions (unless divided highway).",
    icon: AlertTriangle,
  },
  {
    text: "If your child drops something near the bus, tell them to tell the driver - never reach under the bus.",
    icon: ShieldCheck,
  },
  {
    text: "Report drivers who illegally pass stopped school buses to your local police or school district.",
    icon: Camera,
  },
  {
    text: "Review your child's bus route and stop location at the start of each school year.",
    icon: BookOpen,
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENTS                                                         */
/* ------------------------------------------------------------------ */

function ResourceCard({ r, i }: { r: Resource; i: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={i % 10}
    >
      <Card className="hover-lift h-full">
        <CardContent className="py-4 space-y-2.5">
          <h3 className="font-semibold text-foreground text-sm leading-snug">
            {r.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {r.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">
              <MapPin className="mr-1 h-2.5 w-2.5" />
              {r.region}
            </Badge>
            {r.audienceTags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] capitalize"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <a href={r.link} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-7 text-xs mt-1">
              <ExternalLink className="mr-1 h-3 w-3" />
              Visit Resource
            </Button>
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatsCards() {
  const stats = [
    {
      value: "67.4M",
      label: "Annual transit rides (2025 est.)",
      icon: Bus,
      color: "text-michigan-blue",
    },
    {
      value: "540+",
      label: "School districts served",
      icon: GraduationCap,
      color: "text-michigan-forest-deep",
    },
    {
      value: "71%",
      label: "Violation reduction (Dearborn)",
      icon: ShieldCheck,
      color: "text-michigan-coral-deep",
    },
    {
      value: String(COUNTIES_COVERED),
      label: "Counties with transit service",
      icon: MapPin,
      color: "text-michigan-teal-deep",
    },
  ];
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={i}
        >
          <Card className="hover-lift">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {s.label}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function StopArmCameraExplainer() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={0}
    >
      <Card className="border-michigan-coral/20 bg-michigan-coral/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-michigan-coral-deep" />
            How AI Stop-Arm Cameras Protect Students
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="tech" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-michigan-coral-deep" />
                  Technology Overview
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>
                  AI-powered stop-arm camera systems mount multiple cameras on
                  the exterior of school buses. When the bus stops and activates
                  its red flashing lights and extended stop arm, the cameras
                  begin recording.
                </p>
                <p>
                  Computer vision AI analyzes the footage in real-time to detect
                  any vehicle that illegally passes the stopped bus. The system
                  identifies the vehicle's license plate with high accuracy, and
                  a citation is automatically generated and mailed to the
                  registered owner - similar to a red-light camera ticket.
                </p>
                <p>
                  This removes the burden from bus drivers (who previously had
                  to memorize plates while watching children) and increases
                  enforcement 10–50x beyond what police patrols alone can
                  achieve.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="privacy" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-michigan-teal-deep" />
                  Privacy Protections
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Stop-arm camera programs are designed with strict privacy
                  guardrails:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Cameras only activate when the bus's red lights are flashing
                    - they do not record continuously.
                  </li>
                  <li>
                    Only footage of potential violations is reviewed;
                    non-violation clips are automatically deleted.
                  </li>
                  <li>
                    No student images are captured - cameras face outward toward
                    traffic, not inside the bus.
                  </li>
                  <li>
                    License plate data is used solely for citation purposes and
                    is not shared with third parties.
                  </li>
                  <li>
                    Programs operate under municipal or school district
                    authority with public oversight.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="legal" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-michigan-forest-deep" />
                  Michigan Legal Framework (MCL 257.682)
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>
                  <strong>Michigan law (MCL 257.682)</strong> requires all
                  vehicles to stop at least 20 feet from a school bus that is
                  displaying alternating flashing red lights and has its stop
                  arm extended. This applies to vehicles approaching from both
                  directions unless on a divided highway.
                </p>
                <p>
                  <strong>Penalties:</strong> Violators face fines up to $500
                  for a first offense and points on their driving record. If a
                  violation results in injury, penalties increase significantly
                  including possible criminal charges.
                </p>
                <p>
                  Michigan municipalities are authorized to use automated camera
                  enforcement on school buses, enabling AI-based citation
                  systems to issue civil citations based on camera evidence.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dearborn" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-michigan-coral-deep" />
                  Dearborn Case Study: AI Enforcement Success
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>
                  <strong>Dearborn Public Schools</strong> became Michigan's
                  first district to equip every school bus with AI-powered
                  stop-arm cameras, partnering with the city of Dearborn for
                  automated enforcement.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-michigan-coral/20 bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-michigan-coral-deep mb-1">
                      Before AI Deployment
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>• ~2,100 annual stop-arm violations estimated</li>
                      <li>• Drivers relied on memorizing license plates</li>
                      <li>
                        • Less than 5% of violations resulted in citations
                      </li>
                      <li>• 3 student near-miss incidents per semester</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-michigan-forest/20 bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-michigan-forest-deep mb-1">
                      After AI Deployment
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>• ~620 annual violations (71% reduction)</li>
                      <li>• 95%+ of violations result in citations</li>
                      <li>• Zero student injury incidents since deployment</li>
                      <li>• Community awareness dramatically increased</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs">
                  <strong>Key insight:</strong> The deterrent effect is the most
                  powerful outcome. When drivers know every bus has cameras,
                  violation rates plummet - protecting students even when no
                  citation is issued.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="stats" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-michigan-blue" />
                  Student Safety Statistics
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Nationally, school buses are the safest form of surface
                  transportation for students - but the danger zone is outside
                  the bus:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>17 million</strong> stop-arm violations occur
                    annually nationwide (NASDPTS estimate)
                  </li>
                  <li>
                    <strong>95%</strong> of school-bus related fatalities happen
                    outside the bus - in loading/unloading zones
                  </li>
                  <li>
                    <strong>108,000+</strong> violations were recorded on a
                    single survey day across participating states
                  </li>
                  <li>
                    Districts with AI camera enforcement see{" "}
                    <strong>50–80% reduction</strong> in violations within the
                    first year
                  </li>
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
/*  ACTIVE TRANSPORTATION (GATIS)                                      */
/* ------------------------------------------------------------------ */

const michiganDataLandscape = [
  {
    region: "SE Michigan (7 counties)",
    data: "Sidewalks, crosswalks, bike lanes, trails",
    source: "SEMCOG FeatureServer",
    tier: "~Tier 1-2",
    coverage: "Good (AI-digitized)",
  },
  {
    region: "Grand Rapids (Kent County)",
    data: "Bike lanes, some sidewalks",
    source: "City of GR Open Data",
    tier: "~Tier 1",
    coverage: "Partial",
  },
  {
    region: "Ann Arbor (Washtenaw)",
    data: "Sidewalks, bike infrastructure",
    source: "City + SEMCOG",
    tier: "~Tier 1-2",
    coverage: "Good",
  },
  {
    region: "Lansing (Ingham County)",
    data: "Limited",
    source: "City data",
    tier: "~Tier 1",
    coverage: "Sparse",
  },
  {
    region: "Upper Peninsula (15 counties)",
    data: "None",
    source: "-",
    tier: "No data",
    coverage: "Zero coverage",
  },
  {
    region: "Rural Michigan (50+ counties)",
    data: "None",
    source: "-",
    tier: "No data",
    coverage: "Zero coverage",
  },
];

// Source: GATIS v1.0 (national open standard for active transportation data), Bureau of Transportation Statistics, ratified March 2026
const gatisTiers = [
  {
    tier: 1,
    label: "Minimal",
    description: 'Feature ID, type, geometry only - "We know it exists"',
    color: "bg-red-400",
  },
  {
    tier: 2,
    label: "Basic",
    description:
      'Adds width, surface material, directionality - "We know what it\'s like"',
    color: "bg-orange-400",
  },
  {
    tier: 3,
    label: "Detailed",
    description:
      'Adds ADA compliance, incline, GTFS linkage - "We know if it\'s accessible"',
    color: "bg-yellow-400",
  },
  {
    tier: 4,
    label: "Comprehensive",
    description:
      'Adds traffic volume, maintenance schedule, lifecycle stage - "We can plan with it"',
    color: "bg-green-400",
  },
];

function ActiveTransportationTab() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
      >
        <div className="rounded-xl border border-michigan-teal/20 bg-gradient-to-br from-michigan-teal/5 to-background p-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h2 className="text-xl font-bold text-foreground">
              Pedestrian, Bike & Accessibility Infrastructure
            </h2>
            <Badge className="bg-michigan-teal/10 text-michigan-teal-deep border-michigan-teal/20 text-[10px]">
              NEW - Federally Backed Open Standard
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by GATIS - the national open standard for active
            transportation data from the Bureau of Transportation Statistics
            (v1.0, February 2026).
          </p>
        </div>
      </motion.div>

      {/* Key Stats Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {[
          {
            title: "Zero Statewide Sidewalk Data",
            description:
              "Michigan has no unified statewide sidewalk inventory. SEMCOG covers 7 SE Michigan counties. The other 76 counties have no publicly available pedestrian infrastructure data. This is the gap GATIS was designed to fill.",
            icon: AlertTriangle,
            color: "text-michigan-coral-deep",
            bgColor: "bg-michigan-coral/10",
          },
          {
            title: "SEMCOG Coverage: 7 Counties",
            description:
              "Wayne, Oakland, Macomb, Washtenaw, Livingston, Monroe, and St. Clair counties have sidewalk and crosswalk data via SEMCOG's ArcGIS FeatureServer, created from AI-digitized aerial imagery (2019), updated quarterly.",
            icon: MapPin,
            color: "text-michigan-blue",
            bgColor: "bg-michigan-blue/10",
          },
          {
            title: "GATIS v1.0 - Ratified March 2026",
            description:
              "The federal Bureau of Transportation Statistics released the first national standard for pedestrian, bike, and accessibility infrastructure data. Public domain, open source. Access Michigan is among the first civic platforms to integrate it.",
            icon: CheckCircle2,
            color: "text-michigan-forest-deep",
            bgColor: "bg-michigan-forest/10",
          },
          {
            title: "Why This Matters",
            description:
              "For seniors, people with disabilities, and NEMT users, knowing whether a sidewalk exists and whether a curb ramp is ADA-compliant is more critical than knowing a bus route exists. 40% of Michigan's pedestrian fatalities occur in areas with no sidewalk coverage.",
            icon: Accessibility,
            color: "text-michigan-teal-deep",
            bgColor: "bg-michigan-teal/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i}
          >
            <Card className="h-full">
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor} flex-shrink-0`}
                  >
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {stat.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* What GATIS Covers */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={2}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-michigan-teal-deep" />
              What GATIS Covers
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Four standardized feature categories for active transportation
              infrastructure
            </p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="edges" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-semibold">
                  <span className="flex items-center gap-2">
                    <Footprints className="h-4 w-4 text-michigan-teal-deep" />
                    Edges (Linear Features)
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Sidewalks, crossings, bikeways, multi-use paths, ramps, steps,
                  traffic islands - with attributes like width, surface
                  material, incline, and cross-slope.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="nodes" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-semibold">
                  <span className="flex items-center gap-2">
                    <Construction className="h-4 w-4 text-michigan-coral-deep" />
                    Nodes (Connection Points)
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Curb ramps, intersection transitions - with ADA compliance
                  date, detectable warnings, and surface condition.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="points" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-semibold">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-michigan-blue" />
                    Points (Discrete Features)
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Transit stops (linked to GTFS), bike parking, push buttons,
                  traffic calming devices, and signs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="zones" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-semibold">
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-michigan-forest-deep" />
                    Zones (Area Features)
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Pedestrian zones, bike share station areas.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* GATIS Data Maturity Tiers */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={3}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-michigan-blue" />
              GATIS Data Maturity Tiers
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              How complete is the data? SEMCOG's Michigan data is approximately
              Tier 1-2 (presence/geometry, no condition data).
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {gatisTiers.map((t, i) => (
              <div key={t.tier} className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`h-8 w-8 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {t.tier}
                  </div>
                  {i < gatisTiers.length - 1 && (
                    <div className="w-0.5 h-4 bg-border" />
                  )}
                </div>
                <div className="pt-1">
                  <p className="text-sm font-semibold text-foreground">
                    Tier {t.tier}: {t.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Michigan Data Landscape */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={4}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-michigan-blue" />
              Michigan's Active Transportation Data Landscape
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              The 76-county data gap is itself a finding - visualizing what's
              missing is as powerful as showing what exists.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">
                      Region
                    </th>
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">
                      Data Available
                    </th>
                    <th className="text-left py-2 pr-3 font-semibold text-foreground hidden sm:table-cell">
                      Source
                    </th>
                    <th className="text-left py-2 pr-3 font-semibold text-foreground">
                      GATIS Tier
                    </th>
                    <th className="text-left py-2 font-semibold text-foreground hidden md:table-cell">
                      Coverage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {michiganDataLandscape.map((row) => (
                    <tr key={row.region} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium text-foreground">
                        {row.region}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {row.data}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground hidden sm:table-cell">
                        {row.source}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge
                          variant={
                            row.tier === "No data" ? "destructive" : "outline"
                          }
                          className="text-[10px]"
                        >
                          {row.tier}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground hidden md:table-cell">
                        {row.coverage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Call to Action Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            title: "Explore SEMCOG Sidewalk Data",
            description:
              "Interactive maps of sidewalks, crosswalks, and bike infrastructure for 7 SE Michigan counties.",
            link: "https://bicycle-and-pedestrian-mobility-maps-semcog.hub.arcgis.com/",
            icon: MapPin,
            color: "text-michigan-blue",
          },
          {
            title: "View the GATIS Specification",
            description:
              "The full open-standard specification from the Bureau of Transportation Statistics.",
            link: "https://dotbts.github.io/BPA/",
            icon: BookOpen,
            color: "text-michigan-forest-deep",
          },
          {
            title: "Join NC-BPAID",
            description:
              "Help advocate for Michigan-wide pedestrian infrastructure data collection and standardization.",
            link: "https://forms.office.com/g/34975BEAkF",
            icon: Users,
            color: "text-michigan-teal-deep",
          },
        ].map((cta, i) => (
          <motion.div
            key={cta.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i}
          >
            <Card className="hover-lift h-full">
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center gap-2">
                  <cta.icon className={`h-4 w-4 ${cta.color}`} />
                  <h3 className="font-semibold text-sm text-foreground">
                    {cta.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cta.description}
                </p>
                {cta.link !== "#" ? (
                  <a href={cta.link} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs mt-1"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Learn More
                    </Button>
                  </a>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs mt-1"
                    disabled
                  >
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* NC-BPAID Partnership & Advocacy */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={6}
      >
        <Card className="border-michigan-blue/20 bg-gradient-to-br from-michigan-blue/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-michigan-blue" />
              Access Michigan × NC-BPAID: Advocating for Michigan-Wide
              Pedestrian Data
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Partnering with the National Committee on Bicycle, Pedestrian, and
              Active Infrastructure Data
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              NC-BPAID is open to anyone - government, nonprofit, or private
              citizen. Three subgroups meet regularly:{" "}
              <strong>Data Practices</strong>, <strong>Outreach</strong>, and{" "}
              <strong>Specification Development</strong>.
            </p>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Access Michigan is joining as a civic data partner to advocate
                for:
              </p>
              <ul className="space-y-1.5">
                {[
                  "MDOT adopting GATIS for statewide data collection",
                  "SEMCOG expanding sidewalk coverage beyond 7 counties",
                  "Michigan municipalities publishing pedestrian infrastructure data to open ArcGIS portals",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-michigan-forest-deep" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground italic">
              The GATIS Playbook vote is scheduled for spring 2026 - Access
              Michigan will participate.
            </p>

            <div className="flex gap-2 flex-wrap">
              <a
                href="https://forms.office.com/g/c6gsQbB2VH"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Contact NC-BPAID
                </Button>
              </a>
              <a
                href="https://forms.office.com/g/34975BEAkF"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Join Mailing List
                </Button>
              </a>
              <a
                href="https://github.com/dotbts/BPA"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  GATIS on GitHub
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function TransportationPage() {
  usePageMeta({
    title: "Transportation & Safety",
    description:
      "Public transit, school bus safety, accessible rides, and transportation resources across Michigan.",
    path: "/transportation",
    jsonLd: {
      "@type": "WebPage",
      name: "Transportation & Safety - Access Michigan",
      description:
        "Public transit routes, school bus safety data, and accessible transportation options across Michigan.",
      url: "https://accessmi.org/transportation",
    },
  });
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
        r.audienceTags.some((t) => t.includes(q)),
    );
  }, [activeSection, search]);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-accent/5 to-background py-10 lg:py-16">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Transportation & Safety" }]} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
            Get where you need to go.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Plan a ride. Track your kid's bus. Find NEMT for seniors and people
            with disabilities.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-6 max-w-xl"
          >
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
            <TabsTrigger value="active-transport">
              Walking, Biking & Accessibility
            </TabsTrigger>
            <TabsTrigger value="stoparm">AI Stop-Arm Cameras</TabsTrigger>
          </TabsList>

          {/* RESOURCES TAB */}
          <TabsContent value="resources" className="space-y-6">
            {/* Category Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              {sections.map((sec, i) => (
                <motion.div
                  key={sec.key}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                >
                  <Card
                    className={`cursor-pointer transition-all ${activeTab === sec.key ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                    onClick={() => {
                      setActiveTab(sec.key);
                      setSearch("");
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${sec.label}`}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setActiveTab(sec.key)
                    }
                  >
                    <CardContent className="flex items-center gap-3 py-3">
                      <sec.icon className={`h-6 w-6 ${sec.color}`} />
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {sec.resources.length}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          {sec.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section description */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <activeSection.icon
                  className={`h-5 w-5 ${activeSection.color}`}
                />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {activeSection.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {activeSection.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Resources grid */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                <strong className="text-foreground">{filtered.length}</strong>{" "}
                resource{filtered.length !== 1 ? "s" : ""}
                {search && " matching your search"}
              </p>
              {filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-lg font-medium text-foreground">
                    No resources found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try a different search term or category
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filtered.map((r, i) => (
                    <ResourceCard key={r.title} r={r} i={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Safety Checklist - on safety tab */}
            {activeTab === "safety" && (
              <>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={1}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle2 className="h-5 w-5 text-michigan-forest-deep" />
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
                              <item.icon className="h-3.5 w-3.5 text-michigan-forest-deep" />
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.text}
                            </p>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Transportation Safety - MDOT Tips & BusPatrol Integration */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={2}
                >
                  <Card className="border-michigan-coral/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ShieldCheck className="h-5 w-5 text-michigan-coral-deep" />
                        Transportation Safety
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        School bus safety guidance sourced from MDOT and partner
                        integration resources
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* MDOT School Bus Safety Tips */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <GraduationCap className="h-4 w-4 text-michigan-forest-deep" />
                          MDOT School Bus Safety Tips
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            {
                              tip: "Arrive at the bus stop 5 minutes early. Never chase a moving bus.",
                              icon: Bus,
                            },
                            {
                              tip: "Wait until the bus stops completely and the door opens before approaching.",
                              icon: Eye,
                            },
                            {
                              tip: "Cross the street at least 10 feet in front of the bus where the driver can see you.",
                              icon: Users,
                            },
                            {
                              tip: "Never walk behind a school bus - drivers cannot see you.",
                              icon: AlertTriangle,
                            },
                            {
                              tip: "Use handrails when boarding and exiting. Watch for drawstrings or loose straps.",
                              icon: CheckCircle2,
                            },
                            {
                              tip: "If you drop something near the bus, tell the driver instead of picking it up yourself.",
                              icon: ShieldCheck,
                            },
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              initial="hidden"
                              whileInView="visible"
                              viewport={{ once: true }}
                              variants={fadeUp}
                              custom={i}
                              className="flex gap-2.5 items-start rounded-lg border border-border p-3 bg-muted/20"
                            >
                              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-michigan-forest/10">
                                <item.icon className="h-3 w-3 text-michigan-forest-deep" />
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {item.tip}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-3">
                          Source:{" "}
                          <a
                            href="https://www.michigan.gov/mdot/travel/safety/school-bus-safety"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            MDOT School Bus Safety
                          </a>{" "}
                          ·{" "}
                          <a
                            href="https://www.michigan.gov/mde/services/pupil-transportation"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            MDE Pupil Transportation
                          </a>
                        </p>
                      </div>

                      {/* BusPatrol Integration for Partners */}
                      <div className="border-t border-border pt-5">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <Camera className="h-4 w-4 text-michigan-coral-deep" />
                          BusPatrol Integration - Partner Guidance
                        </h4>
                        <div className="rounded-lg border border-michigan-coral/15 bg-michigan-coral/5 p-4 space-y-3">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">
                              BusPatrol
                            </strong>{" "}
                            provides AI-powered stop-arm camera systems that
                            automatically detect and cite drivers who illegally
                            pass stopped school buses. Michigan districts like{" "}
                            <strong>Dearborn</strong> have seen up to a{" "}
                            <strong>71% reduction</strong> in stop-arm
                            violations after deployment.
                          </p>
                          <Accordion type="single" collapsible>
                            <AccordionItem value="integration">
                              <AccordionTrigger className="text-xs font-semibold py-2">
                                How Districts & Partners Can Integrate
                              </AccordionTrigger>
                              <AccordionContent className="text-xs text-muted-foreground space-y-2">
                                <ul className="list-disc ml-4 space-y-1.5">
                                  <li>
                                    <strong>School districts:</strong> Contact
                                    BusPatrol to schedule a no-cost pilot
                                    program. Cameras install on existing buses
                                    with no upfront cost to the district.
                                  </li>
                                  <li>
                                    <strong>Law enforcement:</strong> Partner
                                    with BusPatrol to review AI-flagged
                                    violations and issue civil citations
                                    automatically, reducing officer workload.
                                  </li>
                                  <li>
                                    <strong>Municipal governments:</strong> Pass
                                    local ordinances enabling stop-arm camera
                                    enforcement (authorized under Michigan MCL
                                    257.682).
                                  </li>
                                  <li>
                                    <strong>Public interest firms:</strong> Use
                                    Access Michigan's stop-arm data and
                                    violation trends to support safety advocacy,
                                    grant applications, and community education
                                    campaigns.
                                  </li>
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="data">
                              <AccordionTrigger className="text-xs font-semibold py-2">
                                Available Data & Metrics
                              </AccordionTrigger>
                              <AccordionContent className="text-xs text-muted-foreground space-y-2">
                                <ul className="list-disc ml-4 space-y-1.5">
                                  <li>
                                    Stop-arm violation counts by county (see
                                    Data & Trends tab)
                                  </li>
                                  <li>
                                    Before/after violation reduction rates for
                                    camera-equipped districts
                                  </li>
                                  <li>
                                    NHTSA FARS crash fatality data for Michigan
                                    counties
                                  </li>
                                  <li>
                                    Senior transportation gap analysis by region
                                  </li>
                                </ul>
                                <p className="mt-2">
                                  All data is available for CSV export in the{" "}
                                  <strong>Data & Trends</strong> tab above.
                                </p>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          <div className="flex gap-2 flex-wrap pt-1">
                            <a
                              href="https://www.buspatrol.com"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                              >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                BusPatrol.com
                              </Button>
                            </a>
                            <a
                              href="https://www.michigan.gov/mde/services/pupil-transportation"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                              >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                MDE Pupil Transportation
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </TabsContent>

          {/* ACTIVE TRANSPORTATION TAB */}
          <TabsContent value="active-transport">
            <ActiveTransportationTab />
          </TabsContent>

          {/* AI STOP-ARM CAMERAS TAB */}
          <TabsContent value="stoparm" className="space-y-6">
            <StopArmCameraExplainer />
          </TabsContent>
        </Tabs>

        {/* Health & Safety cross-reference - on safety tab */}
        {activeTab === "safety" && <HealthSafetyCallout />}

        {/* School Safety callout - on school tab */}
        {activeTab === "school" && <SchoolSafetyCallout />}

        {/* Visit Prep + Reminders */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border">
            <CardContent className="py-6 text-center space-y-3">
              <ClipboardList className="h-8 w-8 mx-auto text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Prepare for Your Visit
              </p>
              <p className="text-xs text-muted-foreground">
                Clinic visit or school day checklist-download and print.
              </p>
              <VisitPrepChecklist />
            </CardContent>
          </Card>
          <CareTeamReminders />
        </div>

        {/* Crisis / Accessibility banner */}
        <Card className="border-michigan-teal/20 bg-michigan-teal/5">
          <CardContent className="py-4 text-center">
            <p className="text-sm font-semibold text-foreground">
              Need a ride to a medical appointment?
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Medicaid members: Call your health plan for free Non-Emergency
              Medical Transportation (NEMT). Seniors: Contact your local{" "}
              <a
                href="https://www.michigan.gov/osa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Area Agency on Aging
              </a>{" "}
              · Disability Rights Michigan:{" "}
              <a href="tel:8002883164" className="text-primary underline">
                800-288-3164
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Civic Data callout */}
        <CivicDataCallout />
      </div>
    </Layout>
  );
}
