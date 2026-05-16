import { supabase } from "@/integrations/supabase/client";

/**
 * Log an anonymized search term to the search_analytics table.
 * Fire-and-forget — never blocks UI. No PII is stored.
 */
export function logSearch(params: {
  term: string;
  source: "hero" | "command-palette";
  resultCount: number;
  hadCorrection: boolean;
  correctedTo?: string;
}) {
  // Sanitize: lowercase, trim, max 120 chars, strip anything that looks like an email/phone
  let sanitized = params.term.trim().toLowerCase().slice(0, 120);
  // Remove potential PII patterns (emails, phone numbers, SSNs)
  sanitized = sanitized
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[redacted]")
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[redacted]")
    .replace(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, "[redacted]");

  if (sanitized.length < 2 || sanitized === "[redacted]") return;

  void (async () => {
    try {
      await supabase
        .from("search_analytics")
        .insert({
          search_term: sanitized,
          search_source: params.source,
          result_count: params.resultCount,
          had_correction: params.hadCorrection,
          corrected_to: params.correctedTo ?? null,
        });
    } catch {
      // silent — never interrupt UX
    }
  })();
}
