import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";

// Dismissible "what's new" banner. Sessionstorage gate so users only see it
// once per session. Extracted from src/pages/Index.tsx during the Layer-3 IA
// restructure so it can live on /changelog (its semantic home) without
// disappearing when the home page no longer renders it.
export default function WhatsNewBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("whats-new-v9-dismissed") === "1";
    } catch {
      return false;
    }
  });
  if (dismissed) return null;
  const dismiss = () => {
    try {
      sessionStorage.setItem("whats-new-v9-dismissed", "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-primary/20 bg-primary/5"
    >
      <div className="container max-w-5xl flex items-center justify-between gap-3 py-2.5 px-4">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="text-foreground font-medium truncate">
            <span className="font-bold">NEW:</span> ZIP Code Health Scorecards
            &middot; Service Area Builder &middot; Impact Stories &middot; HUD
            Housing Data
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/zip-intelligence"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Explore <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            aria-label="Dismiss"
            onClick={dismiss}
            className="rounded p-1 hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
