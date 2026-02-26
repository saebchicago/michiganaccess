import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  resourceId: string;
  resourceType?: string;
  county?: string;
  compact?: boolean;
}

export default function ResourceRatingWidget({ resourceId, resourceType = "community_resource", county, compact }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) { toast.error("Please select a rating."); return; }
    setSending(true);
    try {
      const { error } = await (supabase as any).from("resource_ratings").insert({
        resource_id: resourceId,
        resource_type: resourceType,
        rating,
        comment: comment.trim() || null,
        county: county || null,
      });
      if (error) throw error;
      setDone(true);
      toast.success("Thanks for your rating!");
    } catch {
      toast.error("Could not submit. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        ))}
        <span>Submitted</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${compact ? "" : "p-3 border rounded-lg bg-muted/20"}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <Star
              className={`h-4 w-4 transition-colors ${
                s <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
        {rating > 0 && <span className="text-[10px] text-muted-foreground ml-1">{rating}/5</span>}
      </div>
      {!compact && rating > 0 && (
        <>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment..."
            rows={2}
            maxLength={500}
            className="text-xs"
          />
          <Button size="sm" variant="outline" onClick={handleSubmit} disabled={sending} className="h-7 text-xs">
            <Send className="mr-1 h-3 w-3" />
            {sending ? "..." : "Submit"}
          </Button>
        </>
      )}
      {compact && rating > 0 && (
        <Button size="sm" variant="ghost" onClick={handleSubmit} disabled={sending} className="h-6 text-[10px] px-2">
          {sending ? "..." : "Submit rating"}
        </Button>
      )}
    </div>
  );
}
