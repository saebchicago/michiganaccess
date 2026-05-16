import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "michigan-access-map-visited";

interface MapFirstVisitTooltipProps {
  onOpenLayers?: () => void;
}

export default function MapFirstVisitTooltip({ onOpenLayers }: MapFirstVisitTooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // noop
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute left-3 top-16 z-[1001] w-64 rounded-lg border border-border bg-card p-4 shadow-lg lg:left-[19rem] lg:top-4"
        >
          <button onClick={dismiss} className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-michigan-gold/15 p-1.5">
              <Lightbulb className="h-4 w-4 text-michigan-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Explore health data layers</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Toggle air quality, transit routes, school safety, and facility locations.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              onOpenLayers?.();
              dismiss();
            }}
          >
            Show me
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
