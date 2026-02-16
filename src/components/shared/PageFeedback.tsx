import { useState } from "react";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function PageFeedback() {
  const { pathname } = useLocation();
  const [step, setStep] = useState<"ask" | "comment" | "done">("ask");
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (isHelpful: boolean, text?: string) => {
    setSending(true);
    try {
      await (supabase as any).from("page_feedback").insert({
        page_path: pathname,
        is_helpful: isHelpful,
        comment: text || null,
      });
    } catch {}
    setSending(false);
    setStep("done");
  };

  const handleVote = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    setStep("comment");
  };

  const handleSubmitComment = () => {
    if (helpful !== null) submit(helpful, comment);
  };

  const handleSkip = () => {
    if (helpful !== null) submit(helpful);
  };

  return (
    <div className="border-t border-border bg-muted/30 py-6">
      <div className="container max-w-xl text-center">
        <AnimatePresence mode="wait">
          {step === "ask" && (
            <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="mb-3 text-sm font-medium text-foreground">Was this page helpful?</p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => handleVote(true)} className="gap-1.5">
                  <ThumbsUp className="h-4 w-4" /> Yes
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleVote(false)} className="gap-1.5">
                  <ThumbsDown className="h-4 w-4" /> Not really
                </Button>
              </div>
            </motion.div>
          )}
          {step === "comment" && (
            <motion.div key="comment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="mb-2 text-sm text-muted-foreground">
                {helpful ? "Great! Anything we could improve?" : "Sorry about that. What were you looking for?"}
              </p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional feedback…"
                className="mb-3 max-w-md mx-auto text-sm"
                rows={2}
              />
              <div className="flex items-center justify-center gap-2">
                <Button size="sm" onClick={handleSubmitComment} disabled={sending} className="gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Send
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSkip} disabled={sending}>
                  Skip
                </Button>
              </div>
            </motion.div>
          )}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="text-sm text-muted-foreground">Thank you for your feedback! 🙏</p>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-3 text-[9px] text-muted-foreground">No personal data is collected.</p>
      </div>
    </div>
  );
}
