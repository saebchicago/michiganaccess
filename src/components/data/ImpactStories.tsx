import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IMPACT_STORIES } from "@/data/impactStories";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function ImpactStories() {
  const [[page, direction], setPage] = useState([0, 0]);

  const story = IMPACT_STORIES[page];

  const paginate = useCallback((dir: number) => {
    setPage(([p]) => {
      const next = (p + dir + IMPACT_STORIES.length) % IMPACT_STORIES.length;
      return [next, dir];
    });
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Data Stories</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => paginate(-1)} aria-label="Previous story">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {page + 1} / {IMPACT_STORIES.length}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => paginate(1)} aria-label="Next story">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden relative min-h-[260px]">
        <CardContent className="py-5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={story.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Badge variant="outline" className="text-[10px] mb-2">Data Story</Badge>
              <h3 className="text-base font-bold text-foreground mb-2">{story.title}</h3>
              <p className="text-xs text-muted-foreground mb-1 italic">{story.subtitle}</p>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">{story.narrative}</p>

              <div className="grid gap-2 sm:grid-cols-3 mb-4">
                {story.stats.map((dp) => (
                  <div key={dp.label} className="bg-muted/30 rounded-md px-3 py-2">
                    <p className="text-lg font-bold text-foreground tabular-nums">{dp.value}</p>
                    <p className="text-[10px] text-muted-foreground">{dp.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground">{story.stats[0]?.source}</p>
                <Link to={story.href}>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    Explore <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </section>
  );
}
