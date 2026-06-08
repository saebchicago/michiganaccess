/**
 * Community Trust Widget - Social proof system for resources.
 * Allows "Verified Helpful" upvotes and "Out of Date" reports.
 * Uses existing resource_ratings and community_reports tables.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { ThumbsUp, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Restricted keywords for moderation
const RESTRICTED_KEYWORDS = [
  "kill", "threat", "bomb", "gun", "weapon", "hate", "slur",
  "suicide", "self-harm", "drugs", "illegal",
];

function containsRestrictedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return RESTRICTED_KEYWORDS.some(kw => lower.includes(kw));
}

interface Props {
  resourceId: string;
  resourceName: string;
  resourceType?: string;
  county?: string;
  compact?: boolean;
}

export default function CommunityTrustWidget({
  resourceId, resourceName, resourceType = "community_resource", county, compact,
}: Props) {
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Fetch existing counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { count } = await supabase
          .from("resource_ratings")
          .select("*", { count: "exact", head: true })
          .eq("resource_id", resourceId)
          .gte("rating", 4);
        setHelpfulCount(count ?? 0);
      } catch {
        // silent
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchCounts();

    // Check localStorage for prior votes
    const voted = localStorage.getItem(`trust-vote-${resourceId}`);
    if (voted) setHasVoted(true);
  }, [resourceId]);

  const handleHelpful = useCallback(async () => {
    if (hasVoted) return;
    setSending(true);
    try {
      const { error } = await supabase.from("resource_ratings").insert({
        resource_id: resourceId,
        resource_type: resourceType,
        rating: 5,
        comment: "Verified helpful by community member",
        county,
      });
      if (error) throw error;
      setHelpfulCount(c => c + 1);
      setHasVoted(true);
      localStorage.setItem(`trust-vote-${resourceId}`, "1");
      toast.success("Thank you! Your feedback helps neighbors find reliable resources.");
    } catch {
      toast.error("Could not submit vote. Please try again.");
    } finally {
      setSending(false);
    }
  }, [hasVoted, resourceId, resourceType, county]);

  const handleReport = useCallback(async () => {
    if (!reportText.trim()) return;
    if (containsRestrictedContent(reportText)) {
      toast.error("Your report contains restricted content. Please revise and resubmit.");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("community_reports").insert({
        description: `Resource "${resourceName}" reported as out-of-date: ${reportText}`,
        category: "data_error",
        county,
      });
      if (error) throw error;
      setShowReport(false);
      setReportText("");
      toast.success("Report submitted. Our team will review this resource.");
    } catch {
      toast.error("Could not submit report. Please try again.");
    } finally {
      setSending(false);
    }
  }, [reportText, resourceName, county]);

  if (loadingCounts) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-[10px]">Loading trust data…</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Trust Score */}
      <div className="flex items-center gap-2 flex-wrap">
        {helpfulCount > 0 && (
          <Badge variant="outline" className="text-[10px] gap-1 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            {helpfulCount} neighbor{helpfulCount !== 1 ? "s" : ""} found this helpful
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={hasVoted ? "secondary" : "outline"}
          disabled={hasVoted || sending}
          onClick={handleHelpful}
          className="h-7 text-xs gap-1.5"
        >
          {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ThumbsUp className="h-3 w-3" />}
          {hasVoted ? "Verified Helpful ✓" : "Verified Helpful"}
        </Button>
        {!compact && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowReport(!showReport)}
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <AlertCircle className="h-3 w-3" />
            Report Out of Date
          </Button>
        )}
      </div>

      {/* Report Form */}
      {showReport && (
        <div className="space-y-2 border border-border rounded-md p-3 bg-muted/30">
          <p className="text-xs font-medium text-foreground">What's out of date or incorrect?</p>
          <Textarea
            value={reportText}
            onChange={e => setReportText(e.target.value)}
            placeholder="e.g., Phone number no longer works, service has moved..."
            className="text-xs min-h-[60px]"
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReport} disabled={!reportText.trim() || sending} className="text-xs gap-1">
              {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertCircle className="h-3 w-3" />}
              Submit Report
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReport(false)} className="text-xs">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
