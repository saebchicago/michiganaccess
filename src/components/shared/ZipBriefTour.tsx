/**
 * ZipBriefTour — A 3-step guided tour for the ZIP → Mirror → Brief flow.
 * Separate from the main OnboardingTour; stored under its own localStorage key.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "accessmi_zip_tour_seen";

interface TourStep {
  title: string;
  body: string;
  cta: string;
  targetSelector: string;
  icon: React.ElementType;
}

const STEPS: TourStep[] = [
  {
    title: "1. Enter Your ZIP Code",
    body: "Start by searching for your ZIP code to see hyperlocal data for your neighborhood.",
    cta: "Next →",
    targetSelector: ".hero-search-input, [aria-label='Hero'] input",
    icon: MapPin,
  },
  {
    title: "2. See Mirror Metrics",
    body: "Your ZIP's income, poverty, and education data are shown side-by-side with county and state averages.",
    cta: "Next →",
    targetSelector: "#zip-overlay",
    icon: BarChart3,
  },
  {
    title: "3. Generate Your Brief",
    body: "Download an Executive Brief or CSV with all indicators benchmarked against Michigan. Print-ready.",
    cta: "Got it →",
    targetSelector: "[class*='DownloadLocal'], [class*='download']",
    icon: FileText,
  },
];

export function replayZipTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("accessmi:replay-zip-tour"));
}

export default function ZipBriefTour() {
  const [step, setStep] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

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

  // Auto-launch on first ZIP page visit
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(startTour, 2000);
    return () => clearTimeout(timer);
  }, [startTour]);

  // Replay event
  useEffect(() => {
    const handler = () => startTour();
    window.addEventListener("accessmi:replay-zip-tour", handler);
    return () => window.removeEventListener("accessmi:replay-zip-tour", handler);
  }, [startTour]);

  // Spotlight positioning
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) {
      setSpotlightRect(null);
      return;
    }
    const selectors = STEPS[step].targetSelector.split(", ");
    let el: Element | null = null;
    for (const sel of selectors) {
      el = document.querySelector(sel.trim());
      if (el) break;
    }
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
    } else {
      setSpotlightRect(null);
    }
  }, [step, prefersReducedMotion]);

  // Keyboard
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
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  }, [step, dismiss]);

  const current = step >= 0 && step < STEPS.length ? STEPS[step] : null;

  const cardStyle: React.CSSProperties = {};
  if (spotlightRect) {
    const below = spotlightRect.bottom + 16;
    const fitsBelow = below + 200 < window.innerHeight;
    cardStyle.position = "fixed";
    cardStyle.left = Math.max(16, Math.min(spotlightRect.left + spotlightRect.width / 2 - 176, window.innerWidth - 368));
    cardStyle.top = fitsBelow ? below : Math.max(16, spotlightRect.top - 200);
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
          key="zip-tour"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
          className="fixed inset-0 z-[9999]"
          role="dialog"
          aria-modal="true"
          aria-label="ZIP to Brief guided tour"
        >
          {/* Backdrop */}
          <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={dismiss}>
            <defs>
              <mask id="zip-tour-mask">
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
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#zip-tour-mask)" />
          </svg>

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

          <button
            onClick={dismiss}
            className="fixed top-4 right-4 z-[10000] text-xs text-white/80 hover:text-white flex items-center gap-1 pointer-events-auto"
          >
            Skip tour <X className="h-3.5 w-3.5" />
          </button>

          <motion.div
            key={current.title}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            style={cardStyle}
            className="w-[352px] max-w-[calc(100vw-2rem)] pointer-events-auto"
          >
            <div className="rounded-xl border border-border bg-card p-5 shadow-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <current.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">{current.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{current.body}</p>
              <div className="flex items-center justify-between">
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
