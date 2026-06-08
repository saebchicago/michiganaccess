import { useState, useEffect, useCallback } from "react";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import { MessageSquarePlus, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SuggestResourceProps {
  zip?: string;
  county?: string;
  pageUrl?: string;
}

type SubmissionType = "suggest_resource" | "report_issue" | "data_correction";

export default function SuggestResource({ zip, county, pageUrl }: SuggestResourceProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<SubmissionType>("suggest_resource");
  const [message, setMessage] = useState("");
  const [org, setOrg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      if (supabaseConfigured) {
        await supabase.from("community_submissions").insert({
          submission_type: type,
          zip: zip || null,
          county: county || null,
          page_url: pageUrl || window.location.pathname,
          message: message.trim(),
          organization: org.trim() || null,
        });
      }
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); setMessage(""); setOrg(""); }, 2500);
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && open) setOpen(false);
  }, [open]);

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors py-1">
        <MessageSquarePlus className="h-3.5 w-3.5" />
        Suggest a resource or report an issue
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute top-8 left-0 z-50 w-80 rounded-xl border border-border bg-background shadow-xl p-4 space-y-3">
            {submitted ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" /> Thank you - your feedback helps improve this platform.
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">How can we improve this page?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      { key: "suggest_resource" as const, label: "Suggest a resource" },
                      { key: "report_issue" as const, label: "Report an error" },
                      { key: "data_correction" as const, label: "Correct data" },
                    ]).map(({ key, label }) => (
                      <button key={key} onClick={() => setType(key)}
                        className={`text-[10px] px-2 py-1 rounded-full border transition-all ${type === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder={type === "suggest_resource" ? "Name of resource, organization, or program to add..." : type === "report_issue" ? "Describe the issue..." : "What data is incorrect?"}
                  className="w-full text-xs border border-border rounded-lg p-2.5 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]" />
                <input value={org} onChange={e => setOrg(e.target.value)} placeholder="Your organization (optional)"
                  className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                <div className="flex gap-2">
                  <button onClick={handleSubmit} disabled={loading || !message.trim()}
                    className="flex-1 bg-primary text-primary-foreground text-xs py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                  <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
                </div>
                <p className="text-[9px] text-muted-foreground">Submissions are reviewed by the accessmi.org team. No account required.</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
