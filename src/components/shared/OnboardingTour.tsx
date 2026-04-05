import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "accessmi_tour_seen";

interface TourStep {
  title: string;
  body: string;
  cta: string;
  targetSelector: string;
}

const STEPS: TourStep[] = [
  {
    title: "Welcome to Access Michigan",
    body: "Find free resources for housing, health, food, and more across all 83 Michigan counties.",
    cta: "Show me around →",
    targetSelector: "[aria-label='Hero']",
  },
  {
    title: "Search anything",
    body: "Type a ZIP, city, county, or service. Try: '48322 food pantry' or 'Oakland County mental health'.",
    cta: "Got it →",
    targetSelector: ".hero-search-input",
  },
  {
    title: "Compare communities",
    body: "Pick any two counties and compare income, health, equity scores, and more side by side.",
    cta: "Nice →",
    targetSelector: "[href='/compare']",
  },
  {
    title: "Your Civic Insight Score",
    body: "Every Michigan county gets a 0–100 score across access, equity, and opportunity. Yours is here.",
    cta: "Let's go →",
    targetSelector: "[aria-label*='Civic Insight Score']",
  },
];

/** Fires a custom event so the footer "Replay tour" button can re-open it */
export function replayTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("accessmi:replay-tour"));
}

export default function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dismiss = useCallback(() => {
    setVisible(false);
    setStep(-1);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const startTour = useCallback(() => {
    setStep(0);
    setVisible(true);
  }, []);

  // Launch on first visit
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(startTour, 1500);
    return () => clearTimeout(timer);
  }, [startTour]);

  // Replay event listener
  useEffect(() => {
    const handler = () => startTour();
    window.addEventListener("accessmi:replay-tour", handler);
    return () => window.removeEventListener("accessmi:replay-tour", handler);
  }, [startTour]);

  // Position spotlight on current step target
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) {
      setSpotlightRect(null);
      return;
    }
    const el = document.querySelector(STEPS[step].targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
    } else {
      setSpotlightRect(null);
    }
  }, [step, prefersReducedMotion]);

  // Keyboard: Escape to dismiss, Enter/Tab to advance
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
      if (e.key === "Enter") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [step, dismiss]);

  const current = step >= 0 && step < STEPS.length ? STEPS[step] : null;

  // Compute card position: below the spotlight target, centered
  const cardStyle: React.CSSProperties = {};
  if (spotlightRect) {
    const below = spotlightRect.bottom + 16;
    const fitsBelow = below + 220 < window.innerHeight;
    cardStyle.position = "fixed";
    cardStyle.left = Math.max(16, Math.min(spotlightRect.left + spotlightRect.width / 2 - 176, window.innerWidth - 368));
    cardStyle.top = fitsBelow ? below : Math.max(16, spotlightRect.top - 220);
  } else {
    cardStyle.position = "fixed";
    cardStyle.bottom = 80;
    cardStyle.left = "50%";
    cardStyle.transform = "translateX(-50%)";
  }

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          key="onboarding-tour"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
          className="fixed inset-0 z-[9999]"
          role="dialog"
          aria-modal="true"
          aria-label="Onboarding tour"
        >
          {/* Dark backdrop with spotlight cutout */}
          <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={dismiss}>
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                {spotlightRect && (
                  <rect
                    x={spotlightRect.left - 8}
                    y={spotlightRect.top - 8}
                    width={spotlightRect.width + 16}
                    height={spotlightRect.height + 16}
                    rx="12"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#tour-mask)" />
          </svg>

          {/* Spotlight ring */}
          {spotlightRect && (
            <div
              className="absolute rounded-xl ring-2 ring-primary/60 pointer-events-none"
              style={{
                left: spotlightRect.left - 8,
                top: spotlightRect.top - 8,
                width: spotlightRect.width + 16,
                height: spotlightRect.height + 16,
              }}
            />
          )}

          {/* Skip tour link */}
          <button
            onClick={dismiss}
            className="fixed top-4 right-4 z-[10000] text-xs text-white/80 hover:text-white flex items-center gap-1 pointer-events-auto"
          >
            Skip tour <X className="h-3.5 w-3.5" />
          </button>

          {/* Tour card */}
          <motion.div
            ref={cardRef}
            key={current.title}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            style={cardStyle}
            className="w-[352px] max-w-[calc(100vw-2rem)] pointer-events-auto"
          >
            <div className="rounded-xl border border-border bg-card p-5 shadow-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground">{current.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{current.body}</p>
              <div className="flex items-center justify-between">
                {/* Step dots */}
                <div
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={STEPS.length}
                  aria-valuenow={step + 1}
                  aria-label={`Step ${step + 1} of ${STEPS.length}`}
                  className="flex gap-1.5"
                >
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-border"}`}
                    />
                  ))}
                </div>
                <Button size="sm" className="text-xs" onClick={next}>
                  {current.cta}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
