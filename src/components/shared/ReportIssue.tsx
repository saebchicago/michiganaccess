/**
 * Sitewide "Report an issue / Suggest data / Suggest a resource" component.
 * Stores submissions in the existing page_feedback table.
 */
import { useState } from "react";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "data-issue", label: "Report a data issue" },
  { value: "suggest-resource", label: "Suggest a resource" },
  { value: "suggest-data", label: "Suggest a dataset" },
  { value: "general", label: "General feedback" },
];

export default function ReportIssue({ variant = "inline" }: { variant?: "inline" | "footer" }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await (supabase as any).from("page_feedback").insert({
        page_path: pathname,
        is_helpful: false,
        comment: `[${category || "general"}] ${comment}`,
      });
      toast({ title: "Thank you!", description: "Your feedback has been submitted." });
      setComment("");
      setCategory("");
      setOpen(false);
    } catch {
      toast({ title: "Error", description: "Could not submit. Please try again.", variant: "destructive" });
    }
    setSending(false);
  };

  if (variant === "footer") {
    return (
      <div className="text-center">
        <button
          onClick={() => setOpen(v => !v)}
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          aria-expanded={open}
        >
          <MessageSquare className="h-3 w-3" />
          Report an issue or suggest data
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {open && (
          <div className="mt-3 mx-auto max-w-md space-y-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Describe the issue or suggestion…"
              rows={2}
              className="text-xs"
            />
            <Button size="sm" onClick={handleSubmit} disabled={sending || !comment.trim()} className="gap-1.5 text-xs">
              <Send className="h-3 w-3" /> Submit
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Report an issue or suggest data
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select category…" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Describe the issue or suggestion…"
            rows={2}
            className="text-xs"
          />
          <Button size="sm" onClick={handleSubmit} disabled={sending || !comment.trim()} className="gap-1.5 text-xs">
            <Send className="h-3 w-3" /> Submit
          </Button>
          <p className="text-[9px] text-muted-foreground">No personal data collected. Submissions are anonymous.</p>
        </div>
      )}
    </div>
  );
}
