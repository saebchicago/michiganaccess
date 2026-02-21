import { useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldAlert, Heart, MapPin, Siren,
  ArrowRight, Users
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ResourceChecklist from "./ResourceChecklist";

const pathways = [
  {
    id: "uninsured",
    icon: ShieldAlert,
    title: "I need care but don't have insurance",
    description: "Find sliding-scale clinics, Medicaid enrollment, and charity care programs",
    links: [
      { label: "Financial Assistance", href: "/financial-help" },
      { label: "Community Health Centers", href: "/find-care" },
      { label: "Appeal a Denial", href: "/health/insurance-appeals" },
    ],
    color: "text-michigan-coral",
    bg: "bg-michigan-coral/5",
    borderColor: "border-michigan-coral/30",
    iconBg: "bg-michigan-coral/10",
    encouragement: "You're not alone — this tool is here to help you find options.",
    outcomes: ["Find free or low-cost clinics", "Check Medicaid eligibility", "Get financial help"],
  },
  {
    id: "caregiver",
    icon: Heart,
    title: "I'm caring for a family member",
    description: "Support groups, respite care, home health, and caregiver resources",
    links: [
      { label: "Support Groups", href: "/support" },
      { label: "Community Resources", href: "/resources" },
      { label: "Quality Ratings", href: "/quality" },
    ],
    color: "text-michigan-teal",
    bg: "bg-michigan-teal/5",
    borderColor: "border-michigan-teal/30",
    iconBg: "bg-michigan-teal/10",
    encouragement: "Caregiving is hard — let us help you find support nearby.",
    outcomes: ["Connect with support groups", "Find respite care options", "Compare quality ratings"],
  },
  {
    id: "new-resident",
    icon: MapPin,
    title: "I just moved to Michigan",
    description: "Find doctors, enroll in coverage, and discover local services",
    links: [
      { label: "Find Care Near You", href: "/find-care" },
      { label: "Health Map", href: "/health-map" },
      { label: "Financial Help", href: "/financial-help" },
    ],
    color: "text-primary",
    bg: "bg-primary/5",
    borderColor: "border-primary/30",
    iconBg: "bg-primary/10",
    encouragement: "Welcome to Michigan — we'll help you get settled.",
    outcomes: ["Find nearby providers", "Explore your county's services", "Enroll in coverage"],
  },
  {
    id: "emergency",
    icon: Siren,
    title: "I need help right now",
    description: "Crisis lines, emergency rooms, and urgent care options",
    links: [
      { label: "Call 988 (Crisis)", href: "tel:988" },
      { label: "Call 211 (Resources)", href: "tel:211" },
      { label: "Find Urgent Care", href: "/find-care" },
    ],
    color: "text-destructive",
    bg: "bg-destructive/5",
    borderColor: "border-destructive/30",
    iconBg: "bg-destructive/10",
    encouragement: "Help is available 24/7 — you can call right now.",
    badge: "24/7 Available",
    pulse: true,
    outcomes: ["Reach a crisis counselor", "Find urgent care nearby", "Get connected to 211"],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35 } }),
};

const GuidedPathways = forwardRef<HTMLElement>(function GuidedPathways(_props, ref) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section ref={ref} className="py-16 bg-muted/30">
      <div className="container">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">How can we help you today?</h2>
          <p className="mt-2 text-muted-foreground">Choose what fits your situation — we'll guide you to the right resources.</p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pathways.map((p, i) => {
            const isExpanded = expandedId === p.id;
            return (
              <motion.div key={p.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={`group h-full border-l-4 ${p.bg} ${p.borderColor} relative overflow-hidden cursor-pointer transition-all duration-200 motion-safe:hover:scale-[1.02] motion-safe:hover:shadow-lg motion-reduce:hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedId(isExpanded ? null : p.id);
                        }
                      }}
                    >
                      {p.badge && (
                        <Badge variant="destructive" className={`absolute top-3 right-3 text-[10px] ${p.pulse ? "animate-pulse" : ""}`}>
                          {p.badge}
                        </Badge>
                      )}
                      <CardContent className="py-6 space-y-4">
                        <div className={`inline-flex items-center justify-center rounded-lg p-2.5 ${p.iconBg} transition-transform duration-300 motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-3`}>
                          <p.icon className={`h-6 w-6 ${p.color}`} />
                        </div>
                        <h3 className="text-sm font-bold text-foreground leading-snug">{p.title}</h3>
                        <p className="text-xs text-muted-foreground">{p.description}</p>

                        {/* Links — always visible on mobile as full-width buttons */}
                        <div className="flex flex-col gap-2 pt-1">
                          {p.links.map((link) =>
                            link.href.startsWith("tel:") ? (
                              <a
                                key={link.label}
                                href={link.href}
                                onClick={(e) => e.stopPropagation()}
                                className={`flex items-center gap-1.5 text-xs font-medium ${p.color} hover:underline sm:py-0 py-2 min-h-[44px] sm:min-h-0`}
                              >
                                <ArrowRight className="h-3 w-3" /> {link.label}
                              </a>
                            ) : (
                              <Link
                                key={link.label}
                                to={link.href}
                                onClick={(e) => e.stopPropagation()}
                                className={`flex items-center gap-1.5 text-xs font-medium ${p.color} hover:underline sm:py-0 py-2 min-h-[44px] sm:min-h-0`}
                              >
                                <ArrowRight className="h-3 w-3" /> {link.label}
                              </Link>
                            )
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 pb-5 px-6 flex-col gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border pt-3 w-full">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span className="italic">{p.encouragement}</span>
                        </div>

                        {/* Progress + checklist: only visible after card is clicked */}
                        {isExpanded && p.id !== "emergency" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="w-full"
                          >
                            <p className="text-[10px] text-muted-foreground mb-1">Step 1 of 3 · ~2 min</p>
                            <ResourceChecklist pathwayId={p.id} pathwayTitle={p.title} color={p.color} />
                          </motion.div>
                        )}
                      </CardFooter>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    <p className="font-semibold mb-1">Preview steps:</p>
                    <ul className="space-y-0.5">
                      {p.outcomes.map((o) => (
                        <li key={o}>• {o}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default GuidedPathways;
