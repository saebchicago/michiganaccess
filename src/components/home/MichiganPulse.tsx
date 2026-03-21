import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Activity } from "lucide-react";

const SIGNALS = [
  {
    icon: TrendingUp,
    text: "Diabetes rising fastest in Northern MI counties",
    href: "/data",
    color: "text-michigan-coral",
  },
  {
    icon: TrendingDown,
    text: "Opioid deaths down 7.5% statewide since 2022 peak",
    href: "/data",
    color: "text-michigan-forest",
  },
  {
    icon: AlertTriangle,
    text: "Wayne County energy burden at 8.1% — above 6% DOE threshold",
    href: "/environment#energy",
    color: "text-michigan-gold",
  },
  {
    icon: ArrowRight,
    text: "Life expectancy stabilizing after post-2021 decline",
    href: "/maternal-health",
    color: "text-michigan-teal",
  },
  {
    icon: AlertTriangle,
    text: "76 of 83 counties have zero pedestrian infrastructure data",
    href: "/transportation#active-transport",
    color: "text-michigan-coral",
  },
];

export default function MichiganPulse() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((prev) => (prev + 1) % SIGNALS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const signal = SIGNALS[idx];

  return (
    <div className="border-y border-border/30 bg-background py-2.5">
      <div className="container">
        <div className="flex items-center gap-3 h-7">
          <div className="flex items-center gap-1.5 shrink-0">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline">
              Michigan Pulse
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
              className="flex-1 min-w-0"
            >
              <Link
                to={signal.href}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group"
              >
                <signal.icon className={`h-3.5 w-3.5 shrink-0 ${signal.color}`} />
                <span className="truncate">{signal.text}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-1 shrink-0">
            {SIGNALS.map((_, i) => (
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
