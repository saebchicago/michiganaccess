/**
 * Geographic service-area templates (UC4 Phase 1).
 *
 * Templates are defined by Michigan geography only. No health system or
 * partner names. Counties must exist in ZIP_TO_COUNTY / census-geographies.
 */

export interface ServiceAreaTemplate {
  id: string;
  /** Geographic label shown in UI */
  label: string;
  description: string;
  counties: string[];
  region: string;
}

export const SERVICE_AREA_TEMPLATES: ServiceAreaTemplate[] = [
  {
    id: "southeast-core",
    label: "Southeast Michigan Core",
    description:
      "Four-county southeast core including Wayne, Oakland, Macomb, and Jackson.",
    counties: ["Wayne", "Oakland", "Macomb", "Jackson"],
    region: "Southeast",
  },
  {
    id: "west-michigan",
    label: "West Michigan",
    description: "Kent, Ottawa, and Muskegon counties.",
    counties: ["Kent", "Ottawa", "Muskegon"],
    region: "West Michigan",
  },
  {
    id: "capital-area",
    label: "Capital Area",
    description: "Ingham, Eaton, and Clinton counties.",
    counties: ["Ingham", "Eaton", "Clinton"],
    region: "Mid-Michigan",
  },
  {
    id: "northern-lower",
    label: "Northern Lower Peninsula",
    description: "Grand Traverse, Manistee, and Emmet counties.",
    counties: ["Grand Traverse", "Manistee", "Emmet"],
    region: "Northern Lower",
  },
  {
    id: "upper-peninsula-west",
    label: "Western Upper Peninsula",
    description: "Marquette, Houghton, and Delta counties.",
    counties: ["Marquette", "Houghton", "Delta"],
    region: "Upper Peninsula",
  },
];

export function getServiceAreaTemplate(
  id: string,
): ServiceAreaTemplate | undefined {
  return SERVICE_AREA_TEMPLATES.find((t) => t.id === id);
}