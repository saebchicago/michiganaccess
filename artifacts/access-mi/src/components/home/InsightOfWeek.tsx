import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lightbulb, ArrowRight } from "lucide-react";
import { WEEKLY_INSIGHTS } from "@/data/insights";
import { Button } from "@/components/ui/button";
import ShareInsight from "@/components/shared/ShareInsight";

function getCurrentWeekIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.floor(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return weekNum % WEEKLY_INSIGHTS.length;
}

export default function InsightOfWeek() {
  const [index, setIndex] = useState(getCurrentWeekIndex);
  const [direction, setDirection] = useState(0);
  const insight = WEEKLY_INSIGHTS[index];

  const navigate = (dir: -1 | 1) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + WEEKLY_INSIGHTS.length) % WEEKLY_INSIGHTS.length);
  };

  return (
    <section className="py-8 border-y border-border/30">
      <div className="container max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-michigan-gold-deep" />
          <h2 className="text-lg font-bold text-foreground">Insight of the Week</h2>
        </div>

        <div className="relative rounded-xl border border-border bg-card p-6 overflow-hidden min-h-[160px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25 }}
            >
              <blockquote className="font-serif text-base md:text-lg font-medium text-foreground leading-relaxed mb-3">
                "{insight.text}"
              </blockquote>
              <p className="text-xs text-muted-foreground mb-4">
                Source: {insight.source}
              </p>
              {insight.dataPoints && insight.dataPoints.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {insight.dataPoints.map((dp) => (
                    <div key={dp.label} className="flex-1 min-w-[100px] rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <p className="text-sm font-bold text-foreground tabular-nums">{dp.value}</p>
                      <p className="text-[11px] font-medium text-muted-foreground">{dp.label}</p>
                      <p className="text-[10px] text-muted-foreground/70">{dp.context}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <Link
                  to={insight.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View the data <ArrowRight className="h-3 w-3" />
                </Link>
                <ShareInsight
                  title="Insight of the Week"
                  description={insight.text}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-1 sm:-left-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={() => navigate(-1)}
              aria-label="Previous insight"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-1 sm:-right-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={() => navigate(1)}
              aria-label="Next insight"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {WEEKLY_INSIGHTS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
              aria-label={`Go to insight ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
