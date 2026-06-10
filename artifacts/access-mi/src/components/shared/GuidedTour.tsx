import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DATA_SOURCE_DISPLAY } from "@/config/platformConstants";

const STEPS = [
  {
    title: "Intelligence Signals",
    desc: `Real-time insights from ${DATA_SOURCE_DISPLAY} data sources, updated hourly to annually.`,
  },
  {
    title: "Life Event Navigator",
    desc: "Pick a life situation and see which Michigan programs apply.",
  },
  {
    title: "Eligibility Screener",
    desc: "3 questions → 10 assistance programs. Zero data stored.",
  },
  {
    title: "County Comparison",
    desc: "Compare any two Michigan counties side-by-side on key metrics.",
  },
  {
    title: "Equity Atlas",
    desc: "D3 choropleth map with 10 data layers across all 83 counties.",
  },
];

export default function GuidedTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") === "true" && !sessionStorage.getItem("tour-done")) {
      setActive(true);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      setActive(false);
      sessionStorage.setItem("tour-done", "1");
    }
  };

  const handleSkip = () => {
    setActive(false);
    sessionStorage.setItem("tour-done", "1");
  };

  if (!active) return null;

  const s = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={handleSkip}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-xl shadow-2xl p-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tour {step + 1} of {STEPS.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">{s.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip tour
            </button>
            <Button size="sm" onClick={handleNext} className="gap-1">
              {step < STEPS.length - 1 ? "Next" : "Done"}{" "}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-3">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${i === step ? "w-4 bg-primary" : "w-1 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
