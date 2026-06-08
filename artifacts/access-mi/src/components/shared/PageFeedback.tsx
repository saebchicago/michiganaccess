import { useState } from "react";
import { ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Step = "ask" | "comment" | "offer_deeper" | "done";

export default function PageFeedback() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("ask");
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitVote = async (helpful: boolean, commentText: string) => {
    setSubmitting(true);
    try {
      await (supabase as any).from("page_feedback").insert({
        page_path: pathname,
        is_helpful: helpful,
        comment: commentText.trim() || null,
      });
    } catch {
      // INSERT succeeds via RLS but SELECT denied causes client error - expected
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = (helpful: boolean) => {
    setIsHelpful(helpful);
    setStep("comment");
  };

  const handleCommentSubmit = async () => {
    await submitVote(isHelpful!, comment);
    // Show deeper report offer if: negative vote, or positive with substantive comment
    const offerDeeper = !isHelpful || (isHelpful && comment.trim().length > 20);
    setStep(offerDeeper ? "offer_deeper" : "done");
  };

  const inferredCategory = isHelpful ? "suggestion" : "data_accuracy";

  return (
    <div className="border-t border-border bg-muted/30 py-4">
      <div className="container max-w-xl text-center">
        <AnimatePresence mode="wait">
          {step === "ask" && (
            <motion.div
              key="ask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-3"
            >
              <span className="text-xs text-muted-foreground">Did this page work for you?</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleVote(true)}
                aria-label="Yes, this page worked for me"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleVote(false)}
                aria-label="Could be better"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          )}

          {step === "comment" && (
            <motion.div
              key="comment"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="text-xs text-muted-foreground">
                {isHelpful
                  ? "Good to hear. Anything we could add?"
                  : "Thanks for flagging it. What could be improved?"}
              </p>
              <Textarea
                placeholder="Optional - share any details…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={2}
                className="text-sm resize-none"
                aria-label="Optional comment"
              />
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCommentSubmit}
                  disabled={submitting}
                  aria-label="Submit feedback"
                >
                  {submitting ? "Sending…" : "Submit"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setComment("");
                    handleCommentSubmit();
                  }}
                  disabled={submitting}
                  aria-label="Skip comment and submit"
                >
                  Skip
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">No personal data is collected.</p>
            </motion.div>
          )}

          {step === "offer_deeper" && (
            <motion.div
              key="offer_deeper"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="text-xs text-muted-foreground">
                Thanks for your feedback. Want to tell us more? File a detailed report so we can investigate.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/feedback?from=${encodeURIComponent(pathname)}&initial_category=${inferredCategory}`
                    )
                  }
                  aria-label="Navigate to detailed report form"
                >
                  <ArrowRight className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Report an issue
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStep("done")}
                  aria-label="No thanks, dismiss"
                >
                  No thanks
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">No personal data is collected.</p>
            </motion.div>
          )}

          {step === "done" && (
            <motion.p
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-muted-foreground"
            >
              Thanks for the feedback.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
