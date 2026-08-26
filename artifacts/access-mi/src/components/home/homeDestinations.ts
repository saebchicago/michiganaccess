/**
 * Homepage discovery data, resolved from the route manifest.
 *
 * The intent cards, featured rail, and /explore band render curated
 * destinations. Everything is resolved lazily inside functions to avoid the
 * manifest -> Index -> component import cycle that once caused a production
 * TDZ blank page.
 */
import { ROUTE_MANIFEST } from "@/routes/manifest";
import {
  INTENTS,
  SUBJECTS,
  type IntentId,
  type SubjectId,
} from "@/config/routeTaxonomy";

export interface HomeDestination {
  label: string;
  href: string;
  description?: string;
}

export interface IntentCard {
  id: IntentId;
  title: string;
  lede: string;
  destinations: HomeDestination[];
}

function toDestination(entry: {
  label: string;
  path: string;
  summary?: string;
  description?: string;
}): HomeDestination {
  return {
    label: entry.label,
    href: entry.path,
    description: entry.summary ?? entry.description,
  };
}

let cachedIntentCards: IntentCard[] | null = null;

/**
 * The four homepage intent cards, three destinations each.
 *
 * `Understand my place` deliberately starts with the Opportunity Atlas. The
 * broad specialist route taxonomy remains intact, but the resident-facing
 * homepage gets one canonical place-first product instead of presenting every
 * comparison/explorer surface at equal weight.
 */
export function getIntentCards(): IntentCard[] {
  if (cachedIntentCards === null) {
    cachedIntentCards = INTENTS.map((intent) => {
      const taxonomyDestinations = ROUTE_MANIFEST.filter(
        (r) => r.intent === intent.id,
      );

      const entries =
        intent.id === "place"
          ? [
              ...ROUTE_MANIFEST.filter((r) => r.path === "/opportunity"),
              ...taxonomyDestinations.filter((r) => r.path !== "/opportunity"),
            ].slice(0, 3)
          : taxonomyDestinations.slice(0, 3);

      return {
        id: intent.id,
        title: intent.title,
        lede: intent.lede,
        destinations: entries.map(toDestination),
      };
    });
  }
  return cachedIntentCards;
}

let cachedFeatured: HomeDestination[] | null = null;

/** Editorial picks for the "Worth a look" rail, in manifest order. */
export function getFeaturedRail(): HomeDestination[] {
  if (cachedFeatured === null) {
    cachedFeatured = ROUTE_MANIFEST.filter((r) => r.featured).map(
      toDestination,
    );
  }
  return cachedFeatured;
}

let cachedCounts: { id: SubjectId; label: string; count: number }[] | null =
  null;

/** Per-subject destination counts for the /explore band, in chip order. */
export function getSubjectCounts(): {
  id: SubjectId;
  label: string;
  count: number;
}[] {
  if (cachedCounts === null) {
    cachedCounts = SUBJECTS.map((subject) => ({
      id: subject.id,
      label: subject.label,
      count: ROUTE_MANIFEST.filter((r) =>
        r.subjects?.includes(subject.id),
      ).length,
    }));
  }
  return cachedCounts;
}

let cachedLibrarySize: number | null = null;

/** Total curated destinations (the /explore library size). */
export function getLibrarySize(): number {
  if (cachedLibrarySize === null) {
    cachedLibrarySize = ROUTE_MANIFEST.filter(
      (r) => r.subjects?.length,
    ).length;
  }
  return cachedLibrarySize;
}
