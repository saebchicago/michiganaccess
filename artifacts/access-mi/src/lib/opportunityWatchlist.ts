import type {
  OpportunityInsight,
  OpportunityPlace,
} from "@/data/opportunityAtlas";

const STORAGE_KEY = "am-opportunity-watchlist";
const MAX_SAVED = 12;

export interface SavedMetricSnapshot {
  value: number;
  vintage: string;
}

export interface SavedOpportunityPlace {
  placeId: string;
  geographyType: OpportunityPlace["geographyType"];
  label: string;
  countyName: string;
  savedAt: string;
  lastCheckedAt: string;
  snapshot: Record<string, SavedMetricSnapshot>;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isValidSnapshot(value: unknown): value is Record<string, SavedMetricSnapshot> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value as Record<string, unknown>).every(([key, item]) => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(key) || !item || typeof item !== "object") {
      return false;
    }
    const snapshot = item as Partial<SavedMetricSnapshot>;
    return Number.isFinite(snapshot.value) && typeof snapshot.vintage === "string";
  });
}

function isValidSavedPlace(value: unknown): value is SavedOpportunityPlace {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SavedOpportunityPlace>;
  return (
    typeof item.placeId === "string" &&
    /^(county-26\d{3}|zcta-\d{5}|city-[a-z0-9-]+)$/.test(item.placeId) &&
    (item.geographyType === "city" ||
      item.geographyType === "county" ||
      item.geographyType === "zcta") &&
    typeof item.label === "string" &&
    item.label.length <= 100 &&
    typeof item.countyName === "string" &&
    item.countyName.length <= 80 &&
    typeof item.savedAt === "string" &&
    typeof item.lastCheckedAt === "string" &&
    isValidSnapshot(item.snapshot)
  );
}

function snapshotInsights(
  insights: OpportunityInsight[],
): Record<string, SavedMetricSnapshot> {
  return Object.fromEntries(
    insights.map((insight) => [
      insight.metricId,
      { value: insight.value, vintage: insight.vintage },
    ]),
  );
}

export function listSavedOpportunityPlaces(): SavedOpportunityPlace[] {
  const store = storage();
  if (!store) return [];
  try {
    const parsed = JSON.parse(store.getItem(STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidSavedPlace).slice(0, MAX_SAVED);
  } catch {
    return [];
  }
}

/** Stores only a canonical public geography id + display metadata and a
 * source-backed metric/vintage snapshot. Raw search text, addresses,
 * coordinates, and browsing history are never persisted. The site's
 * deny-by-default "Clear my activity" utility also clears this key. */
export function saveOpportunityPlace(
  place: OpportunityPlace,
  insights: OpportunityInsight[],
): SavedOpportunityPlace[] {
  const store = storage();
  if (!store) return [];
  const existing = listSavedOpportunityPlaces().filter(
    (item) => item.placeId !== place.id,
  );
  const now = new Date().toISOString();
  const next: SavedOpportunityPlace[] = [
    {
      placeId: place.id,
      geographyType: place.geographyType,
      label: place.label,
      countyName: place.countyName,
      savedAt: now,
      lastCheckedAt: now,
      snapshot: snapshotInsights(insights),
    },
    ...existing,
  ].slice(0, MAX_SAVED);
  store.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function removeOpportunityPlace(placeId: string): SavedOpportunityPlace[] {
  const store = storage();
  if (!store) return [];
  const next = listSavedOpportunityPlaces().filter(
    (item) => item.placeId !== placeId,
  );
  store.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function isOpportunityPlaceSaved(placeId: string): boolean {
  return listSavedOpportunityPlaces().some((item) => item.placeId === placeId);
}

export interface OpportunityChange {
  metricId: string;
  previous: SavedMetricSnapshot;
  current: SavedMetricSnapshot;
}

/** Compare only values/vintages that were actually saved. This reports a
 * source-snapshot change, not a causal event or statistical significance. */
export function getOpportunityPlaceChanges(
  saved: SavedOpportunityPlace,
  insights: OpportunityInsight[],
): OpportunityChange[] {
  const current = snapshotInsights(insights);
  return Object.entries(saved.snapshot).flatMap(([metricId, previous]) => {
    const next = current[metricId];
    if (!next) return [];
    return previous.value !== next.value || previous.vintage !== next.vintage
      ? [{ metricId, previous, current: next }]
      : [];
  });
}
