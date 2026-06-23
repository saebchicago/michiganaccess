import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Activity } from "lucide-react";
import { SIGNALS_2026_03, type Signal } from "@/data/monthly-signals";

const DIRECTION_CONFIG: Record<Signal["direction"], { icon: typeof TrendingUp; color: string }> = {
  up: { icon: TrendingUp, color: "text-michigan-coral-deep" },
  down: { icon: TrendingDown, color: "text-michigan-forest-deep" },
  alert: { icon: AlertTriangle, color: "text-michigan-gold-deep" },
  stable: { icon: ArrowRight, color: "text-michigan-teal-deep" },
};

const CATEGORY_BORDER: Record<Signal["category"], string> = {
  health: "border-l-michigan-teal",
  economic: "border-l-michigan-gold",
  environment: "border-l-michigan-forest",
  civic: "border-l-primary",
  safety: "border-l-michigan-coral",
};

export default function MichiganPulse() {
  const [idx, setIdx] = useState(0);
  const signals = SIGNALS_2026_03;

  useEffect(() => {
    const timer = setInterval(() => setIdx((prev) => (prev + 1) % signals.length), 4000);
    return () => clearInterval(timer);
  }, [signals.length]);

  const signal = signals[idx];
  const config = DIRECTION_CONFIG[signal.direction];
  const Icon = config.icon;
  const borderClass = CATEGORY_BORDER[signal.category];

  return (
    <div className={`border-y border-border/30 bg-background py-2.5`}>
      <div className="container">
        <div className="flex items-center gap-3 h-7">
          <div className="flex items-center gap-1.5 shrink-0">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline">
              Michigan Pulse
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-michigan-teal"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className={`flex-1 min-w-0 border-l-2 pl-2 ${borderClass}`}
            >
              <Link
                to={signal.href}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group"
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${config.color}`} />
                <span className="truncate">{signal.text}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-1 shrink-0">
            {signals.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1 rounded-full transition-all ${i === idx ? "w-3 bg-primary" : "w-1 bg-muted-foreground/30"}`}
                aria-label={`Signal ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
