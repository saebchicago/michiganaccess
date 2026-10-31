// Sibling public-data projects linked from the footer and from the
// prerendered crawler block (scripts/prerender-meta.mjs reads the same JSON).
// Names only: no descriptions or claims.
import data from "./relatedProjects.json";

export interface RelatedProject {
  name: string;
  url: string;
}

export const OTHER_PROJECTS: readonly RelatedProject[] = data.projects.filter(
  (p) => p.url !== data.self,
);

export const BUILT_BY: RelatedProject = data.builtBy;
