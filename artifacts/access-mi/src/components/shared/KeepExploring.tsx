import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getManifestEntry } from "@/routes/manifest";

/**
 * "Keep exploring" rail: renders the current page's `related` destinations
 * from the route taxonomy (via the manifest), with each card's copy
 * resolved from that destination's ROUTE_META summary. The component holds
 * no link data of its own - pages declare their related set once, in
 * src/config/routeTaxonomy.ts, where check-route-taxonomy.mjs validates
 * every target.
 *
 * getManifestEntry is read inside render, never at module scope (TDZ note
 * in src/utils/pageSearchIndex.ts). Renders nothing when the page has no
 * related entries, so it is always safe to include.
 */
export default function KeepExploring({
  currentPath,
  heading = "Keep exploring",
}: {
  currentPath: string;
  heading?: string;
}) {
  const related = getManifestEntry(currentPath)?.related ?? [];
  const destinations = related
    .map((href) => {
      const entry = getManifestEntry(href);
      return entry
        ? {
            href,
            label: entry.label,
            description: entry.summary ?? entry.description,
          }
        : null;
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  if (destinations.length === 0) return null;

  return (
    <section
      className="rounded-lg border border-border bg-muted/20 px-5 py-4"
      aria-label={heading}
    >
      <h2 className="text-sm font-semibold text-foreground">{heading}</h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {destinations.map((d) => (
          <li key={d.href}>
            <Link
              to={d.href}
              className="group flex h-full flex-col rounded-md border border-transparent px-2.5 py-2 -mx-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                {d.label}
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
              {d.description && (
                <span className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {d.description}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
