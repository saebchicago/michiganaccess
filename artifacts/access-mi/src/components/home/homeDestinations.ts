/**
 * Homepage discovery data, resolved from the route manifest.
 *
 * The intent cards, the featured rail, and the /explore band all render
 * curated destinations, but none of the curation lives here: intents,
 * featured flags, and subjects come from `@/config/routeTaxonomy` via the
 * manifest, and each destination's copy is its ROUTE_META summary. This
 * module only groups and caches.
 *
 * Every export is a FUNCTION with a lazy cache, never a module-scope
 * constant. This module sits inside the manifest -> Index -> (component
 * tree) import cycle, and reading a manifest binding at module-evaluation
 * time is exactly the TDZ bug that once blanked the production site - see
 * the long note in src/utils/pageSearchIndex.ts. Call these inside
 * component render only.
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

/** The four homepage intent cards, each with its 3 taxonomy-assigned destinations. */
export function getIntentCards(): IntentCard[] {
  if (cachedIntentCards === null) {
    cachedIntentCards = INTENTS.map((intent) => ({
      id: intent.id,
      title: intent.title,
      lede: intent.lede,
      destinations: ROUTE_MANIFEST.filter((r) => r.intent === intent.id).map(
        toDestination,
      ),
    }));
  }
  return cachedIntentCards;
}

let cachedFeatured: HomeDestination[] | null = null;

/** Editorial picks for the "Worth a look" rail, in taxonomy order. */
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
