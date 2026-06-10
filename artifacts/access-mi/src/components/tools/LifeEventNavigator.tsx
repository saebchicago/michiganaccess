import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Baby,
  Briefcase,
  Cake,
  Home,
  Stethoscope,
  Globe,
  KeyRound,
  ArrowRight,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OfficialChannelNotice } from "@/components/shared/OfficialChannelNotice";

const TYPE_COLORS: Record<string, string> = {
  nutrition: "bg-michigan-forest/10 text-michigan-forest",
  insurance: "bg-primary/10 text-primary",
  data: "bg-michigan-teal/10 text-michigan-teal",
  safety: "bg-michigan-coral/10 text-michigan-coral",
  health: "bg-michigan-teal/10 text-michigan-teal",
  financial: "bg-michigan-gold/10 text-michigan-gold",
  food: "bg-michigan-forest/10 text-michigan-forest",
  energy: "bg-michigan-gold/10 text-michigan-gold",
  employment: "bg-primary/10 text-primary",
  counseling: "bg-michigan-teal/10 text-michigan-teal",
  pharmacy: "bg-michigan-coral/10 text-michigan-coral",
  services: "bg-muted text-muted-foreground",
  legal: "bg-primary/10 text-primary",
  housing: "bg-michigan-gold/10 text-michigan-gold",
  crisis: "bg-michigan-coral/10 text-michigan-coral",
  care: "bg-michigan-teal/10 text-michigan-teal",
  research: "bg-michigan-forest/10 text-michigan-forest",
  support: "bg-primary/10 text-primary",
  access: "bg-michigan-teal/10 text-michigan-teal",
  language: "bg-michigan-gold/10 text-michigan-gold",
  community: "bg-michigan-forest/10 text-michigan-forest",
};

interface Resource {
  name: string;
  type: string;
  href: string;
}
interface LifeEvent {
  id: string;
  icon: typeof Baby;
  label: string;
  resources: Resource[];
}

const EVENTS: LifeEvent[] = [
  {
    id: "baby",
    icon: Baby,
    label: "Just had a baby",
    resources: [
      {
        name: "WIC (Women, Infants & Children)",
        type: "nutrition",
        href: "/financial-help",
      },
      { name: "Medicaid for newborns", type: "insurance", href: "/find-care" },
      {
        name: "Maternal health data for your county",
        type: "data",
        href: "/maternal-health",
      },
      {
        name: "Postpartum depression resources",
        type: "health",
        href: "/resources",
      },
    ],
  },
  {
    id: "lost-job",
    icon: Briefcase,
    label: "Lost my job",
    resources: [
      {
        name: "Michigan unemployment benefits (UIA)",
        type: "financial",
        href: "/financial-help",
      },
      {
        name: "Healthy Michigan Plan (Medicaid)",
        type: "insurance",
        href: "/find-care",
      },
      { name: "SNAP food assistance", type: "food", href: "/resources" },
      {
        name: "LIHEAP energy assistance",
        type: "energy",
        href: "/environment#programs",
      },
    ],
  },
  {
    id: "turning-65",
    icon: Cake,
    label: "Turning 65",
    resources: [
      {
        name: "Medicare enrollment guide",
        type: "insurance",
        href: "/find-care",
      },
      {
        name: "Michigan MMAP counseling (free)",
        type: "counseling",
        href: "/resources",
      },
      {
        name: "Prescription drug assistance",
        type: "pharmacy",
        href: "/financial-help",
      },
      { name: "Senior food programs", type: "food", href: "/resources" },
    ],
  },
  {
    id: "housing",
    icon: Home,
    label: "Facing eviction",
    resources: [
      { name: "Michigan Legal Help (free)", type: "legal", href: "/resources" },
      {
        name: "Emergency rental assistance",
        type: "financial",
        href: "/financial-help",
      },
      { name: "2-1-1 immediate help", type: "crisis", href: "/resources" },
      {
        name: "Utility shutoff protections",
        type: "energy",
        href: "/environment#programs",
      },
    ],
  },
  {
    id: "diagnosis",
    icon: Stethoscope,
    label: "New diagnosis",
    resources: [
      { name: "Find specialists near you", type: "care", href: "/find-care" },
      {
        name: "Clinical trials in Michigan",
        type: "research",
        href: "/clinical-trials",
      },
      {
        name: "Insurance appeal tools",
        type: "insurance",
        href: "/health/insurance-appeals",
      },
      { name: "Support groups", type: "support", href: "/resources" },
    ],
  },
  {
    id: "new-to-mi",
    icon: Globe,
    label: "New to Michigan",
    resources: [
      {
        name: "Community health centers (FQHCs)",
        type: "care",
        href: "/find-care",
      },
      {
        name: "Language access services",
        type: "language",
        href: "/find-care",
      },
      {
        name: "Emergency Medicaid",
        type: "insurance",
        href: "/financial-help",
      },
      {
        name: "Cultural community organizations",
        type: "community",
        href: "/resources",
      },
    ],
  },
  {
    id: "returning",
    icon: KeyRound,
    label: "Coming home from incarceration",
    resources: [
      {
        name: "Healthy Michigan Plan (Medicaid)",
        type: "insurance",
        href: "/reentry",
      },
      {
        name: "Michigan Works! job centers",
        type: "employment",
        href: "/reentry",
      },
      { name: "Get your state ID", type: "documents", href: "/reentry" },
      {
        name: "Expungement: Michigan Clean Slate",
        type: "legal",
        href: "/reentry",
      },
    ],
  },
];

export default function LifeEventNavigator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialScenario = searchParams.get("scenario");
  const [active, setActive] = useState<string | null>(
    initialScenario && EVENTS.some((e) => e.id === initialScenario)
      ? initialScenario
      : null,
  );
  const selected = EVENTS.find((e) => e.id === active);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (active) {
      next.set("scenario", active);
    } else {
      next.delete("scenario");
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <section className="py-12">
      <div className="container max-w-4xl">
        <div className="text-center mb-6">
          <Badge
            variant="outline"
            className="mb-2 text-xs uppercase tracking-wider border-primary/30 text-primary"
          >
            Start here
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What's happening in your life?
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a situation - we'll show you what's available.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EVENTS.map((event) => (
            <motion.button
              key={event.id}
              onClick={() => setActive(active === event.id ? null : event.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-xl border p-4 text-center transition-all ${
                active === event.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <event.icon
                className={`h-7 w-7 mx-auto mb-2 ${active === event.id ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className="text-xs font-medium text-foreground">
                {event.label}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <selected.icon className="h-4 w-4 text-primary" />{" "}
                      {selected.label}
                    </CardTitle>
                    <button
                      onClick={() => setActive(null)}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selected.resources.map((r) => (
                      <Link
                        key={r.name}
                        to={r.href}
                        className="flex items-center gap-2 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors group"
                      >
                        <Badge
                          className={`text-[8px] shrink-0 ${TYPE_COLORS[r.type] || "bg-muted text-muted-foreground"}`}
                        >
                          {r.type}
                        </Badge>
                        <span className="text-xs text-foreground flex-1">
                          {r.name}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3">
                    <OfficialChannelNotice variant="compact" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
