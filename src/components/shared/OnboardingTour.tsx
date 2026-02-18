import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Search, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
}

const STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Michigan Access",
    description: "Your one-stop gateway to health, housing, and civic services across all 83 counties.",
    icon: <Building2 className="h-5 w-5 text-primary" />,
  },
  {
    id: "map",
    title: "Explore by Region",
    description: "Hover over the interactive map to see population, health grades, and resources for each of Michigan's 6 regions.",
    icon: <MapPin className="h-5 w-5 text-primary" />,
    targetSelector: "[aria-label=\"Interactive map of Michigan's 6 regions\"]",
  },
  {
    id: "search",
    title: "Search Your Community",
    description: "Use the municipality search to find your city, village, or township — and access local FOIA tools, meeting schedules, and services.",
    icon: <Search className="h-5 w-5 text-primary" />,
  },
  {
    id: "done",
    title: "You're All Set!",
    description: "Explore pathways tailored to your needs — whether you're uninsured, a caregiver, or new to Michigan.",
    icon: <ArrowRight className="h-5 w-5 text-primary" />,
  },
];

const STORAGE_KEY = "mi-onboarding-complete";

export default function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Delay showing to let page render
      const timer = setTimeout(() => {
        setStep(0);
        setVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [step]);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  if (!visible || step < 0) return null;

  const current = STEPS[step];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Subtle backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/10 pointer-events-auto"
          onClick={dismiss}
        />

        {/* Tour card */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm pointer-events-auto md:bottom-6"
        >
          <div className="rounded-xl border border-border bg-card p-5 shadow-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {current.icon}
                <h3 className="text-sm font-bold text-foreground">{current.title}</h3>
              </div>
              <button onClick={dismiss} className="text-muted-foreground hover:text-foreground" aria-label="Close tour">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{current.description}</p>
            <div className="flex items-center justify-between">
              {/* Step dots */}
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-xs" onClick={dismiss}>
                  Skip
                </Button>
                <Button size="sm" className="text-xs" onClick={next}>
                  {step === STEPS.length - 1 ? "Get Started" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
