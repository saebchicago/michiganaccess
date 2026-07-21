import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
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

// Selectors are stable ids/labels on the CURRENT homepage
// (src/pages/Index.tsx). The tour only runs on "/", so these are the
// only elements it may target - keep them in sync with the homepage.
const STEPS: TourStep[] = [
  {
    title: "Welcome to Access Michigan",
    body: "Public records turned into civic intelligence for all 83 Michigan counties - find help, or trace any number to its source.",
    cta: "Show me around",
    targetSelector: "#hero-headline",
  },
  {
    title: "Start with your ZIP",
    body: "Enter any Michigan ZIP for a community scorecard built from verified public health and economic data.",
    cta: "Got it",
    targetSelector: "input[aria-label='ZIP code']",
  },
  {
    title: "This week's intelligence",
    body: "The briefing leads with a sourced finding, a decade-long trend, and data stories - updated as the data moves.",
    cta: "Nice",
    targetSelector: "#briefing-heading",
  },
  {
    title: "Or pick your county",
    body: "Every county has a full profile. Pick yours once and the whole site follows it.",
    cta: "Let's go",
    targetSelector: "#county-heading",
  },
];

/**
 * Re-opens the tour (used by the footer "Replay tour" button). The tour
 * lives on the homepage, so off-homepage replays navigate there first
 * via the ?tour=true contract.
 */
export function replayTour() {
  localStorage.removeItem(STORAGE_KEY);
  if (window.location.pathname !== "/") {
    window.location.href = "/?tour=true";
    return;
  }
  window.dispatchEvent(new CustomEvent("accessmi:replay-tour"));
}

export default function OnboardingTour() {
  const { pathname, search } = useLocation();
  const [step, setStep] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const onHomepage = pathname === "/";

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

  // Launch on first visit - homepage only. A first visit that lands on a
  // deep link (a shared county URL, a dataset) must not get a tour that
  // spotlights homepage elements which are not on the page.
  useEffect(() => {
    if (!onHomepage) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(startTour, 1500);
    return () => clearTimeout(timer);
  }, [onHomepage, startTour]);

  // ?tour=true starts the tour explicitly (footer replay from another
  // page navigates here with this param; external links may use it too).
  useEffect(() => {
    if (!onHomepage) return;
    if (new URLSearchParams(search).get("tour") === "true") {
      const timer = setTimeout(startTour, 400);
      return () => clearTimeout(timer);
    }
  }, [onHomepage, search, startTour]);

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
