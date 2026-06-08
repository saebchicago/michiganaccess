import { useState } from "react";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface HelpfulVoteProps {
  pagePath: string;
  zip?: string;
}

export default function HelpfulVote({ pagePath, zip }: HelpfulVoteProps) {
  const [voted, setVoted] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  const submitVote = async (helpful: boolean) => {
    try {
      if (supabaseConfigured) {
        await supabase.from("platform_feedback" as any).insert({
          page_path: pagePath,
          zip: zip || null,
          helpful,
          comment: comment.trim() || null,
        });
      }
      setVoted(true);
    } catch {
      // Fail silently - feedback is non-critical
    }
  };

  if (voted) {
    return (
      <p className="text-xs text-muted-foreground">
        {"\u2713"} Thanks for your feedback
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <p className="text-xs text-muted-foreground">Was this useful?</p>
      <button
        onClick={() => submitVote(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-green-600 transition-colors"
        aria-label="Yes, this was helpful"
      >
        <ThumbsUp className="h-3.5 w-3.5" /> Yes
      </button>
      <button
        onClick={() => setShowComment(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
        aria-label="No, this was not helpful"
      >
        <ThumbsDown className="h-3.5 w-3.5" /> Not quite
      </button>
      {showComment && (
        <div className="flex items-center gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What would make it better?"
            className="text-xs border border-border rounded px-2 py-1 w-48 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => submitVote(false)}
            className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
