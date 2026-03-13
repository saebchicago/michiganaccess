import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * FloatingFeedback — moved to footer-inline on mobile to avoid z-index conflicts
 * with chat FAB, bottom nav, and quick exit bar. On desktop it stays as a small
 * floating button in the bottom-left.
 */
export default function FloatingFeedback() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("ff-dismissed") === "1"
  );

  if (dismissed && !open) return null;

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await (supabase as unknown as { from: (t: string) => { insert: (d: Record<string, unknown>) => Promise<unknown> } }).from("page_feedback").insert({
        page_path: pathname,
        is_helpful: false,
        comment: `[Data Issue] ${comment}`,
      });
      toast({ title: "Thank you!", description: "Your feedback helps keep data accurate for all Michiganders." });
      setComment("");
      setOpen(false);
      setDismissed(true);
      sessionStorage.setItem("ff-dismissed", "1");
    } catch {
      toast({ title: "Couldn't send", description: "Please try again.", variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <>
      {/* Desktop-only floating trigger — hidden on mobile to avoid conflicts */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setOpen(true)}
            className="hidden lg:flex fixed bottom-6 left-6 z-30 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-lg hover:text-foreground hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            aria-label="Report a data issue"
          >
            <AlertCircle className="h-3.5 w-3.5 text-michigan-coral" aria-hidden="true" />
            Saw a mistake?
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded form — desktop only floating, mobile triggers from footer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-40 w-72 rounded-xl border border-border bg-card p-4 shadow-2xl hidden lg:block"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-foreground">Help us fix it</p>
              <button onClick={() => setOpen(false)} className="p-0.5 hover:bg-muted rounded" aria-label="Close feedback form">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              Page: <span className="font-mono">{pathname}</span>
            </p>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What looks wrong? (e.g., 'Poverty rate seems outdated for Genesee County')"
              rows={3}
              className="text-xs mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit} disabled={sending || !comment.trim()} className="flex-1 gap-1 text-xs">
                <Send className="h-3 w-3" /> Submit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setDismissed(true); sessionStorage.setItem("ff-dismissed", "1"); }} className="text-xs">
                Dismiss
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5">No personal data collected.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
