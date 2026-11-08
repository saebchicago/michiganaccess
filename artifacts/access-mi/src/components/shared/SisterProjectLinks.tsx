import { ExternalLink } from "lucide-react";
import { OTHER_PROJECTS } from "@/config/relatedProjects";

/**
 * Contextual hand-off to a sibling project where it answers a question
 * AccessMI does not. Base URLs come from relatedProjects.json (single source),
 * so a domain change never needs a page edit. Discloses shared authorship so
 * a cross-link is never read as independent corroboration.
 */
export interface SisterLink {
  project: "ConditionMap" | "Values in Care";
  path: string;
  label: string;
  why: string;
}

function baseUrl(name: SisterLink["project"]): string | null {
  return OTHER_PROJECTS.find((p) => p.name === name)?.url ?? null;
}

export function sisterHref(link: SisterLink): string | null {
  const base = baseUrl(link.project);
  return base ? new URL(link.path, base).toString() : null;
}

export default function SisterProjectLinks({
  heading = "Beyond access: related references",
  links,
}: {
  heading?: string;
  links: SisterLink[];
}) {
  const resolved = links
    .map((l) => ({ ...l, href: sisterHref(l) }))
    .filter((l): l is SisterLink & { href: string } => Boolean(l.href));
  if (resolved.length === 0) return null;
  return (
    <section
      aria-labelledby="sister-projects-heading"
      className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
      data-testid="sister-project-links"
    >
      <h2 id="sister-projects-heading" className="text-sm font-semibold text-foreground">
        {heading}
      </h2>
      <ul className="space-y-2">
        {resolved.map((l) => (
          <li key={l.href} className="text-sm">
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {l.project}: {l.label}
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <span className="block text-xs text-muted-foreground">{l.why}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        Same independent builder as AccessMI. Each site keeps its own sources
        and methods; a link here is not independent corroboration.
      </p>
    </section>
  );
}
