/**
 * Single source of truth for every route on the platform.
 *
 * The literal arrays live in `@/config/routes` (router) and
 * `@/config/routeMeta` (prerender metadata). This file composes them
 * into one typed registry so consumers (Router, Header, Footer,
 * homepage cards, Downloads, CI link check, prerender script) all
 * resolve per-route facts from a single import.
 *
 * Any new route MUST be added to `APP_ROUTES` in `@/config/routes`;
 * the corresponding navigation entry MUST point at a path that is
 * present in this manifest. `scripts/check-links.mjs` enforces both.
 */
import type { ComponentType, LazyExoticComponent } from "react";
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

export interface RouteManifestEntry {
  path: string;
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  label: string;
  eager?: boolean;
  /**
   * True when `scripts/prerender-meta.mjs` writes a per-route
   * dist/<path>/index.html with route-specific head + noscript body.
   * Derived from presence of an entry in `ROUTE_META`.
   */
  prerender: boolean;
  title?: string;
  description?: string;
  h1?: string;
  summary?: string;
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

const appEntries: RouteManifestEntry[] = APP_ROUTES.map((r) => {
  const meta = ROUTE_META.find((m) => m.path === r.path);
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
  };
});

export const ROUTE_MANIFEST: RouteManifestEntry[] = [homeEntry, ...appEntries];

export const PRERENDER_ROUTES: RouteManifestEntry[] = ROUTE_MANIFEST.filter(
  (r) => r.prerender,
);

export function getManifestEntry(path: string): RouteManifestEntry | undefined {
  return ROUTE_MANIFEST.find((r) => r.path === path);
}

export { APP_ROUTES, NAV_GROUPS, RESERVED_SLUGS, SITEMAP_SECTIONS, isNavGroup };
export type { NavGroup, NavLink, RouteEntry, SitemapSection };
