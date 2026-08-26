import type { OpportunityPlace } from "@/data/opportunityAtlas";

const STORAGE_KEY = "am-opportunity-watchlist";
const MAX_SAVED = 12;

export interface SavedOpportunityPlace {
  placeId: string;
  geographyType: OpportunityPlace["geographyType"];
  label: string;
  countyName: string;
  savedAt: string;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
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
    typeof item.savedAt === "string"
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

/** Stores only a canonical public geography id + display metadata. Raw search
 * text, addresses, coordinates, and insight history are never persisted. The
 * site's deny-by-default "Clear my activity" utility also clears this key. */
export function saveOpportunityPlace(
  place: OpportunityPlace,
): SavedOpportunityPlace[] {
  const store = storage();
  if (!store) return [];
  const existing = listSavedOpportunityPlaces().filter(
    (item) => item.placeId !== place.id,
  );
  const next: SavedOpportunityPlace[] = [
    {
      placeId: place.id,
      geographyType: place.geographyType,
      label: place.label,
      countyName: place.countyName,
      savedAt: new Date().toISOString(),
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
