import type { OpportunityGeographyType } from "@/data/opportunityAtlas";

export type OpportunityEventName =
  | "opportunity_place_selected"
  | "opportunity_lens_viewed"
  | "opportunity_metric_viewed"
  | "opportunity_compare_started"
  | "opportunity_action_opened"
  | "opportunity_source_opened"
  | "opportunity_share_started"
  | "opportunity_share_completed"
  | "opportunity_downloaded"
  | "opportunity_place_saved"
  | "opportunity_place_removed";

export interface OpportunityEventPayload {
  geography_type?: OpportunityGeographyType;
  /** Canonical public geography id only (e.g. county-26163, zcta-48201).
   * Never raw address/search text. */
  place_id?: string;
  lens_id?: string;
  metric_id?: string;
  action_id?: string;
  channel?: "native" | "copy" | "svg";
}

const SAFE_KEYS = new Set<keyof OpportunityEventPayload>([
  "geography_type",
  "place_id",
  "lens_id",
  "metric_id",
  "action_id",
  "channel",
]);

function isSafePlaceId(value: string): boolean {
  return /^(county-26\d{3}|zcta-\d{5}|city-[a-z0-9-]+)$/.test(value);
}

/**
 * Send an allowlisted GA4 event without free-text location input, query
 * strings, or page URLs. The global GA tag is already governed by the site's
 * Privacy Policy; this helper adds no new identifiers or storage.
 */
export function trackOpportunityEvent(
  event: OpportunityEventName,
  payload: OpportunityEventPayload = {},
): void {
  if (typeof window === "undefined") return;

  const safePayload: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!SAFE_KEYS.has(key as keyof OpportunityEventPayload)) continue;
    if (typeof value !== "string" || value.length > 80) continue;
    if (key === "place_id" && !isSafePlaceId(value)) continue;
    safePayload[key] = value;
  }

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  if (typeof gtag !== "function") return;
  gtag("event", event, safePayload);
}
