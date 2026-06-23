import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, MapPin, Zap, Heart, Activity } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const PULSES = [
  { icon: Heart, value: 4200, suffix: "+", label: "healthcare facilities indexed", color: "text-michigan-coral-deep" },
  { icon: MapPin, value: 83, suffix: "", label: "counties covered", color: "text-primary" },
  { icon: Database, value: 35, suffix: "+", label: "public data sources integrated", color: "text-michigan-teal-deep" },
  { icon: Zap, value: 183, suffix: "M", label: "in energy assistance tracked", prefix: "$", color: "text-michigan-gold-deep" },
  { icon: Activity, value: 15, suffix: "", label: "live API feeds", color: "text-michigan-forest-deep" },
];

export default function DataPulse() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % PULSES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const pulse = PULSES[activeIdx];

  return (
    <div className="border-y border-border/30 bg-muted/20 py-3">
      <div className="container">
        <div className="flex items-center justify-center gap-3 h-8">
          <div className="flex items-center gap-1.5">
            {PULSES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`h-1.5 w-1.5 rounded-full transition-all ${i === activeIdx ? "bg-primary w-4" : "bg-muted-foreground/30"}`}
                aria-label={`Show stat ${i + 1}`}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <pulse.icon className={`h-4 w-4 ${pulse.color}`} aria-hidden="true" />
              <AnimatedCounter
                value={pulse.value}
                prefix={pulse.prefix || ""}
                suffix={pulse.suffix}
                className={`text-lg font-bold ${pulse.color}`}
                duration={0.8}
              />
              <span className="text-xs text-muted-foreground">{pulse.label}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
