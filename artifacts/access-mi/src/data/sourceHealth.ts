/**
 * Typed accessor for sourceHealth.generated.json, produced by
 * scripts/build-source-health.mjs from ingest-manifest/*.json. Lets the
 * app answer "is this source's latest ingest attempt healthy, and if
 * not, when did we last successfully retrieve it" without shipping every
 * historical manifest file to the client.
 */
import raw from "./sourceHealth.generated.json";

export interface SourceHealthStatus {
  latest_valid: boolean;
  latest_retrieved_at: string;
  last_valid_retrieved_at: string | null;
  invalid_reason: string | null;
}

interface Payload {
  schema: string;
  generated_at: string;
  sources: Record<string, SourceHealthStatus>;
}

const payload = raw as Payload;

export const SOURCE_HEALTH_GENERATED_AT: string = payload.generated_at;

/** Returns null when the source has no recorded ingest attempt yet
 * (e.g. a script that has never been wired into the manifest, or a
 * fresh clone before any --apply run). */
export function getSourceHealth(sourceId: string): SourceHealthStatus | null {
  return payload.sources[sourceId] ?? null;
}
