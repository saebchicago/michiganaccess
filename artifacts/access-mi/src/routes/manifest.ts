/**
 * Single source of truth for discoverable destinations on the platform.
 *
 * Most literal routes live in `@/config/routes` and metadata in
 * `@/config/routeMeta`. A very small flagship set can be composed here while
 * legacy route-table consolidation is in progress; those routes must also have
 * build-time metadata in `extraRouteMeta.json` and a real router entry.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import Index from "@/pages/Index";
import {
  APP_ROUTES,
  NAV_GROUPS,
  RESERVED_SLUGS,
  SITEMAP_SECTIONS,
  isNavGroup,
  type NavGroup,
  type NavLink,
  type RouteEntry,
  type SitemapSection,
} from "@/config/routes";
import { ROUTE_META } from "@/config/routeMeta";
import {
  ROUTE_TAXONOMY,
  type IntentId,
  type SubjectId,
} from "@/config/routeTaxonomy";

export interface RouteManifestEntry {
  path: string;
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  label: string;
  eager?: boolean;
  prerender: boolean;
  title?: string;
  description?: string;
  h1?: string;
  summary?: string;
  subjects?: SubjectId[];
  featured?: boolean;
  related?: string[];
  intent?: IntentId;
}

const HOME_META = ROUTE_META.find((m) => m.path === "/");

const homeEntry: RouteManifestEntry = {
  path: "/",
  component: Index,
  label: HOME_META?.h1 ?? "Home",
  eager: true,
  prerender: HOME_META !== undefined,
  title: HOME_META?.title,
  description: HOME_META?.description,
  h1: HOME_META?.h1,
  summary: HOME_META?.summary,
};

// Flagship product route: registered directly in App.tsx for now, but included
// in the discovery manifest so homepage/Explore surfaces treat it as a real
// destination. Static crawler metadata is generated from extraRouteMeta.json.
const opportunityEntry: RouteManifestEntry = {
  path: "/opportunity",
  component: lazy(() => import("@/pages/OpportunityAtlasPage")),
  label: "Community Opportunity Atlas",
  prerender: true,
  title: "Community Opportunity Atlas | Access Michigan",
  description:
    "Start with a Michigan place. See source-backed local gaps, neighborhood-resolution data status, current action pathways, careful comparisons, and shareable findings.",
  h1: "What stands out in your community?",
  summary:
    "Place-first Michigan civic intelligence: understand local signals, trace every figure to its source, compare communities, identify current avenues to act, and share the exact finding.",
  subjects: ["home", "env", "food", "civic", "tools"],
  featured: true,
  related: ["/food-access", "/environment", "/public-investment", "/compare"],
};

const appEntries: RouteManifestEntry[] = APP_ROUTES.map((r) => {
  const meta = ROUTE_META.find((m) => m.path === r.path);
  const taxonomy = ROUTE_TAXONOMY[r.path];
  return {
    path: r.path,
    component: r.component,
    label: r.label,
    eager: r.eager,
    prerender: meta !== undefined,
    title: meta?.title,
    description: meta?.description,
    h1: meta?.h1,
    summary: meta?.summary,
    subjects: taxonomy?.subjects,
    featured: taxonomy?.featured,
    related: taxonomy?.related,
    intent: taxonomy?.intent,
  };
});

export const ROUTE_MANIFEST: RouteManifestEntry[] = [
  homeEntry,
  opportunityEntry,
  ...appEntries,
];

export const PRERENDER_ROUTES: RouteManifestEntry[] = ROUTE_MANIFEST.filter(
  (r) => r.prerender,
);

export function getManifestEntry(path: string): RouteManifestEntry | undefined {
  return ROUTE_MANIFEST.find((r) => r.path === path);
}

export { APP_ROUTES, NAV_GROUPS, RESERVED_SLUGS, SITEMAP_SECTIONS, isNavGroup };
export type { NavGroup, NavLink, RouteEntry, SitemapSection };
