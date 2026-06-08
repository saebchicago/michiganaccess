/**
 * Life Situation Navigation - "Explore by Life Situation"
 * Dynamically filters existing indicators + actions by life context.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Baby, HeartPulse, DollarSign, Users, CloudLightning, Briefcase,
  ChevronRight, ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Place } from "@/models/Place";

interface LifeSituation {
  id: string;
  label: string;
  icon: React.ElementType;
  domains: string[];
  description: string;
  actions: { title: string; href: string; external?: boolean }[];
}

const SITUATIONS: LifeSituation[] = [
  {
    id: "moving",
    label: "Moving Here",
    icon: Home,
    domains: ["housing", "transportation", "education"],
    description: "What to know about housing costs, schools, and getting around.",
    actions: [
      { title: "Check rent & housing costs", href: "#domain-housing" },
      { title: "View school data", href: "#domain-education" },
      { title: "Explore transportation", href: "#domain-transportation" },
      { title: "Find local services", href: "/resources" },
    ],
  },
  {
    id: "family",
    label: "Raising a Family",
    icon: Baby,
    domains: ["health", "education", "food"],
    description: "Health coverage, schools, and nutrition programs for families.",
    actions: [
      { title: "Apply for WIC", href: "https://www.michigan.gov/mdhhs/assistance-programs/wic", external: true },
      { title: "Find pediatric care", href: "/find-care" },
      { title: "Check food assistance (SNAP)", href: "https://www.michigan.gov/mdhhs/assistance-programs/food", external: true },
      { title: "View school quality", href: "#domain-education" },
    ],
  },
  {
    id: "health",
    label: "Managing Health",
    icon: HeartPulse,
    domains: ["health", "food", "transportation"],
    description: "Finding doctors, insurance, prescriptions, and getting to appointments.",
    actions: [
      { title: "Find a doctor or clinic", href: "/find-care" },
      { title: "Apply for Healthy Michigan Plan", href: "https://www.michigan.gov/mdhhs/assistance-programs/healthcare-coverage", external: true },
      { title: "Check health indicators", href: "#domain-health" },
      { title: "Call 2-1-1 for referrals", href: "tel:211" },
    ],
  },
  {
    id: "financial",
    label: "Financial Hardship",
    icon: DollarSign,
    domains: ["workforce", "housing", "energy", "food"],
    description: "Help with bills, rent, food, heating, and finding work.",
    actions: [
      { title: "Apply via MI Bridges", href: "https://newmibridges.michigan.gov/", external: true },
      { title: "Apply for LIHEAP heating help", href: "https://www.michigan.gov/mdhhs/assistance-programs/energy", external: true },
      { title: "Find job training (MI Works)", href: "https://www.michigan.gov/leo/bureaus-agencies/wd", external: true },
      { title: "Check food assistance", href: "#domain-food" },
    ],
  },
  {
    id: "aging",
    label: "Aging & Caregiving",
    icon: Users,
    domains: ["health", "transportation", "housing"],
    description: "Support for seniors, caregivers, and aging-in-place resources.",
    actions: [
      { title: "Find senior services", href: "/resources" },
      { title: "Check Medicare coverage", href: "https://www.medicare.gov/", external: true },
      { title: "View health indicators", href: "#domain-health" },
      { title: "Transportation options", href: "#domain-transportation" },
    ],
  },
  {
    id: "weather",
    label: "Extreme Weather",
    icon: CloudLightning,
    domains: ["energy", "safety", "environment"],
    description: "Preparing for storms, outages, heating emergencies, and water safety.",
    actions: [
      { title: "Apply for heating assistance", href: "https://www.michigan.gov/mdhhs/assistance-programs/energy", external: true },
      { title: "Check energy burden", href: "#domain-energy" },
      { title: "View FEMA alerts", href: "https://www.fema.gov/disaster/declarations?field_dv2_state_territory_tribal_value=MI", external: true },
      { title: "Check water quality", href: "#domain-environment" },
    ],
  },
  {
    id: "work",
    label: "Starting Work or Training",
    icon: Briefcase,
    domains: ["workforce", "transportation", "education"],
    description: "Job search, training programs, and getting to work.",
    actions: [
      { title: "Find jobs (MI Works)", href: "https://www.michigan.gov/leo/bureaus-agencies/wd", external: true },
      { title: "Check local unemployment rate", href: "#domain-workforce" },
      { title: "View education programs", href: "#domain-education" },
      { title: "Transportation access", href: "#domain-transportation" },
    ],
  },
];

export default function LifeSituationNav({ place }: { place: Place }) {
  const [active, setActive] = useState<string | null>(null);
  const activeSituation = SITUATIONS.find(s => s.id === active);

  return (
    <section id="life-situations" className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Explore by Life Situation</h2>
      <p className="text-sm text-muted-foreground">
        Select your situation to see the most relevant data and actions for {place.name}.
      </p>

      <div className="flex flex-wrap gap-2">
        {SITUATIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(active === s.id ? null : s.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all border ${
              active === s.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-primary/5"
            }`}
            aria-pressed={active === s.id}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSituation && (
          <motion.div
            key={activeSituation.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <activeSituation.icon className="h-4 w-4 text-primary" />
                    {activeSituation.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{activeSituation.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeSituation.domains.map(d => (
                    <Badge key={d} variant="secondary" className="text-[10px] capitalize">{d}</Badge>
                  ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {activeSituation.actions.map(a => {
                    const isHash = a.href.startsWith("#");
                    const isExternal = a.external;

                    if (isHash) {
                      return (
                        <button
                          key={a.title}
                          onClick={() => {
                            const el = document.getElementById(a.href.slice(1));
                            el?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:border-primary/30 hover:shadow-sm transition-all group"
                        >
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex-1">{a.title}</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        </button>
                      );
                    }

                    if (isExternal) {
                      return (
                        <a
                          key={a.title}
                          href={a.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 hover:border-primary/30 hover:shadow-sm transition-all group"
                        >
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex-1">{a.title}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={a.title}
                        to={a.href}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 hover:border-primary/30 hover:shadow-sm transition-all group"
                      >
                        <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex-1">{a.title}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
