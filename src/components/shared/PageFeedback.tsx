import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function PageFeedback() {
  const { pathname } = useLocation();
  const [done, setDone] = useState(false);

  const vote = async (isHelpful: boolean) => {
    setDone(true);
    try {
      await (supabase as any).from("page_feedback").insert({
        page_path: pathname,
        is_helpful: isHelpful,
        comment: null,
      });
    } catch {
      // INSERT succeeds via RLS but SELECT denied causes client error — expected
    }
  };

  return (
    <div className="border-t border-border bg-muted/30 py-4">
      <div className="container max-w-xl text-center">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
              <span className="text-xs text-muted-foreground">Helpful?</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => vote(true)} aria-label="Yes, helpful">
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => vote(false)} aria-label="Not helpful">
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ) : (
            <motion.p key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-xs text-muted-foreground">
              Thanks for the feedback.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
