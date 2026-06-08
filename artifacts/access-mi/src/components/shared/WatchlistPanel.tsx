import { Star, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

/** Renders saved/starred items panel - used on homepage */
export default function WatchlistPanel() {
  const { items, toggle, clear, count } = useWatchlist();

  if (count === 0) return null;

  return (
    <section className="container py-6">
      <div className="rounded-xl border border-michigan-gold/30 bg-michigan-gold/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-michigan-gold text-michigan-gold" />
            Your Saved Items
            <Badge variant="secondary" className="text-[10px] ml-1">{count}</Badge>
          </h2>
          <Button variant="ghost" size="sm" onClick={clear} className="text-xs text-muted-foreground h-7">
            Clear all
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {items.slice(0, 6).map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 group"
              >
                <Star className="h-3 w-3 fill-michigan-gold text-michigan-gold shrink-0" />
                <Link to={item.href} className="flex-1 text-xs font-medium text-foreground hover:text-primary truncate">
                  {item.label}
                </Link>
                <Badge variant="outline" className="text-[9px] capitalize shrink-0">{item.type}</Badge>
                <button
                  onClick={() => toggle(item)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                  aria-label={`Remove ${item.label}`}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {count > 6 && (
          <p className="text-[10px] text-muted-foreground mt-2">+ {count - 6} more saved items</p>
        )}
        <p className="text-[9px] text-muted-foreground mt-2">Stored locally on your device - never sent to any server.</p>
      </div>
    </section>
  );
}
