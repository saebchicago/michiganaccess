export interface OpportunityUrlState {
  placeId: string;
  metricId?: string;
  lensId?: string;
  comparePlaceId?: string;
}

function safeId(value: string | undefined, pattern: RegExp): string | undefined {
  if (!value || value.length > 100 || !pattern.test(value)) return undefined;
  return value;
}

const PLACE_PATTERN = /^(county-26\d{3}|zcta-\d{5}|city-[a-z0-9-]+)$/;
const TOKEN_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function parseOpportunityState(
  params: URLSearchParams,
): OpportunityUrlState | null {
  const placeId = safeId(params.get("place") ?? undefined, PLACE_PATTERN);
  if (!placeId) return null;
  return {
    placeId,
    metricId: safeId(params.get("metric") ?? undefined, TOKEN_PATTERN),
    lensId: safeId(params.get("lens") ?? undefined, TOKEN_PATTERN),
    comparePlaceId: safeId(
      params.get("compare") ?? undefined,
      PLACE_PATTERN,
    ),
  };
}

/** Build a stateful URL using canonical public IDs only. No free-text search
 * terms are serialized, keeping shared URLs deterministic and analytics-safe. */
export function buildOpportunityUrl(
  state: OpportunityUrlState,
  origin = typeof window !== "undefined" ? window.location.origin : "https://accessmi.org",
): string {
  const placeId = safeId(state.placeId, PLACE_PATTERN);
  if (!placeId) throw new Error("Invalid canonical opportunity place id");
  const params = new URLSearchParams({ place: placeId });
  const metricId = safeId(state.metricId, TOKEN_PATTERN);
  const lensId = safeId(state.lensId, TOKEN_PATTERN);
  const comparePlaceId = safeId(state.comparePlaceId, PLACE_PATTERN);
  if (metricId) params.set("metric", metricId);
  if (lensId) params.set("lens", lensId);
  if (comparePlaceId) params.set("compare", comparePlaceId);
  return `${origin}/opportunity?${params.toString()}`;
}
