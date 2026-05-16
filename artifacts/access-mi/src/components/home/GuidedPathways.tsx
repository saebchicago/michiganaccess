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
    supportText: "You're not alone — many Michiganders are finding affordable care right now.",
    description: "Find sliding-scale clinics, Medicaid enrollment, and charity care programs",
    links: [
      { label: "Check Medicaid Eligibility", href: "/financial-help" },
      { label: "Find Free/Low-Cost Clinics", href: "/find-care" },
      { label: "Appeal a Denial", href: "/health/insurance-appeals" },
    ],
    color: "text-michigan-coral",
    bg: "bg-michigan-coral/5",
    borderColor: "border-michigan-coral/30",
    iconBg: "bg-michigan-coral/10",
    outcomes: ["Get health coverage", "Find affordable clinics", "Understand your options"],
  },
  {
    id: "caregiver",
    icon: Heart,
    title: "I'm caring for a family member",
    supportText: "Caregiving is hard work. You deserve support and a break.",
    description: "Find support groups, respite care, home health services, and caregiver resources",
    links: [
      { label: "Connect with Support Groups", href: "/support" },
      { label: "Find Respite Care", href: "/resources" },
      { label: "Compare Care Providers", href: "/quality" },
    ],
    color: "text-michigan-teal",
    bg: "bg-michigan-teal/5",
    borderColor: "border-michigan-teal/30",
    iconBg: "bg-michigan-teal/10",
    outcomes: ["Connect with other caregivers", "Take a needed break", "Get quality care info"],
  },
  {
    id: "new-resident",
    icon: MapPin,
    title: "I just moved to Michigan",
    supportText: "Welcome — getting settled is a process, and we're here to help.",
    description: "Find local doctors, enroll in coverage, and discover community services",
    links: [
      { label: "Find Doctors Near Me", href: "/find-care" },
      { label: "Explore My County", href: "/health-map" },
      { label: "Find Financial Assistance", href: "/financial-help" },
    ],
    color: "text-primary",
    bg: "bg-primary/5",
    borderColor: "border-primary/30",
    iconBg: "bg-primary/10",
    outcomes: ["Find trusted providers", "Learn about local services", "Enroll in coverage"],
  },
  {
    id: "emergency",
    icon: Siren,
    title: "I need help right now",
    supportText: "Help is available 24/7 — you can reach someone right now.",
    description: "Crisis lines, urgent care, and emergency resources",
    links: [
      { label: "Call 988 Crisis Line", href: "tel:988" },
      { label: "Call 211 for Resources", href: "tel:211" },
      { label: "Find Urgent Care", href: "/find-care" },
    ],
    color: "text-destructive",
    bg: "bg-destructive/5",
    borderColor: "border-destructive/30",
    iconBg: "bg-destructive/10",
    badge: "24/7 Available",
    pulse: true,
    outcomes: ["Speak to a counselor immediately", "Get emergency resources", "Find nearby care"],
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
          <p className="mt-2 text-muted-foreground">Pick the situation that fits yours — we'll guide you to the right resources.</p>
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
                      aria-label={`${p.title}. Click to explore options.`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedId(isExpanded ? null : p.id);
                        }
                      }}
                    >
                      {/* Badge */}
                      {p.badge && (
                        <Badge variant="destructive" className={`absolute top-3 right-3 text-[10px] ${p.pulse ? "animate-pulse" : ""}`}>
                          {p.badge}
                        </Badge>
                      )}

                      <CardContent className="py-6 space-y-3.5">
                        {/* Icon */}
                        <div className={`inline-flex items-center justify-center rounded-lg p-2.5 ${p.iconBg} transition-transform duration-300 motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-3`}>
                          <p.icon className={`h-6 w-6 ${p.color}`} />
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-foreground leading-snug">{p.title}</h3>

                        {/* Support Text (empathy statement) */}
                        <p className={`text-xs font-medium ${p.color} leading-relaxed`}>
                          {p.supportText}
                        </p>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>

                        {/* Links */}
                        <div className="flex flex-col gap-2 pt-1">
                          {p.links.map((link) =>
                            link.href.startsWith("tel:") ? (
                              <a
                                key={link.label}
                                href={link.href}
                                onClick={(e) => e.stopPropagation()}
                                className={`flex items-center gap-1.5 text-xs font-medium ${p.color} hover:underline transition-colors sm:py-0 py-2 min-h-[44px] sm:min-h-0`}
                              >
                                <ArrowRight className="h-3 w-3 flex-shrink-0" /> {link.label}
                              </a>
                            ) : (
                              <Link
                                key={link.label}
                                to={link.href}
                                onClick={(e) => e.stopPropagation()}
                                className={`flex items-center gap-1.5 text-xs font-medium ${p.color} hover:underline transition-colors sm:py-0 py-2 min-h-[44px] sm:min-h-0`}
                              >
                                <ArrowRight className="h-3 w-3 flex-shrink-0" /> {link.label}
                              </Link>
                            )
                          )}
                        </div>
                      </CardContent>

                      {/* Expanded content — checklist */}
                      {isExpanded && p.id !== "emergency" && (
                        <CardFooter className="pt-0 pb-5 px-6 flex-col gap-3 border-t border-border">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="w-full space-y-2.5"
                          >
                            <p className="text-[10px] text-muted-foreground font-medium">Step 1 of 3 · ~2 min</p>
                            <ResourceChecklist pathwayId={p.id} pathwayTitle={p.title} color={p.color} />
                          </motion.div>
                        </CardFooter>
                      )}
                    </Card>
                  </TooltipTrigger>

                  {/* Tooltip preview */}
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">You'll get help with:</p>
                      <ul className="space-y-0.5">
                        {p.outcomes.map((o) => (
                          <li key={o}>• {o}</li>
                        ))}
                      </ul>
                    </div>
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
