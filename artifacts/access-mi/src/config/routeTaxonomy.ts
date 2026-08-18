/**
 * Route taxonomy - the curation layer over the route manifest.
 *
 * This file answers one question per curated destination: how should it be
 * grouped, featured, and cross-linked on the discovery surfaces (/explore,
 * the header menu panels, the homepage intent cards, and the KeepExploring
 * rail)? Everything else about a destination - its label, description,
 * summary, prerender metadata - lives in src/config/routes.ts and
 * src/config/routeMeta.ts and is merged with this file by
 * src/routes/manifest.ts. Do not duplicate labels or copy here.
 *
 * Deliberately a leaf module with ZERO imports: the route manifest eagerly
 * imports the homepage, whose component tree reaches back into the manifest,
 * and a module inside that cycle once read a manifest binding at evaluation
 * time and blanked the production site (see the TDZ note in
 * src/utils/pageSearchIndex.ts). A leaf can never join that cycle.
 *
 * Format contract (enforced by scripts/check-route-taxonomy.mjs, which
 * regex-parses this file the way prerender-meta.mjs parses ROUTE_META):
 *  - path keys and related[] values are plain double-quoted string literals;
 *  - one entry per line, no spreads, no computed keys, no constants;
 *  - every path must be a registered non-parameterized route with a
 *    ROUTE_META entry that has a summary (that summary is the card copy);
 *  - subjects come from the closed SubjectId set; intents from IntentId,
 *    exactly three paths per intent (the homepage renders exactly three
 *    destinations per intent card);
 *  - featured is the editorial pick set for the homepage rail (3 to 8
 *    entries; it is a curation flag, not a popularity measurement - the
 *    platform has no page-level usage data and must not imply it does).
 *
 * Insertion order is meaningful: it is the display order within a subject
 * on /explore, within an intent card, and within the featured rail.
 */

export type SubjectId =
  | "health"
  | "money"
  | "home"
  | "env"
  | "food"
  | "civic"
  | "follow"
  | "tools";

export type IntentId = "help" | "place" | "money" | "analyze";

export interface RouteTaxonomyEntry {
  /** Subject groupings shown as filter chips on /explore. Nonempty. */
  subjects: SubjectId[];
  /** Editorial pick for the homepage "Worth a look" rail. */
  featured?: boolean;
  /** Destinations for the KeepExploring rail on this page. 1-4 entries. */
  related?: string[];
  /** Slot on one of the four homepage intent cards. */
  intent?: IntentId;
}

/** Ordered chip list for /explore; ids must cover SubjectId exactly. */
export const SUBJECTS: ReadonlyArray<{ id: SubjectId; label: string }> = [
  { id: "health", label: "Health and care" },
  { id: "money", label: "Money and benefits" },
  { id: "home", label: "Home and neighborhood" },
  { id: "env", label: "Environment" },
  { id: "food", label: "Food" },
  { id: "civic", label: "Civic power" },
  { id: "follow", label: "Follow the money" },
  { id: "tools", label: "Analyst tools" },
];

/** The four homepage intent cards, in display order. */
export const INTENTS: ReadonlyArray<{
  id: IntentId;
  title: string;
  lede: string;
}> = [
  {
    id: "help",
    title: "Get help now",
    lede: "Care, food, housing, mental health. Free. Private. No account.",
  },
  {
    id: "place",
    title: "Understand my place",
    lede: "Your ZIP or county, measured against the state and the nation.",
  },
  {
    id: "money",
    title: "Follow the money",
    lede: "Public money, public contracts, public records.",
  },
  {
    id: "analyze",
    title: "Analyze and export",
    lede: "Census tables, map layers, and briefs you can hand to a board.",
  },
];

export const ROUTE_TAXONOMY: Record<string, RouteTaxonomyEntry> = {

  // Health and care
  "/find-care": { subjects: ["health"], intent: "help" },
  "/health-map": { subjects: ["health"] },
  "/quality": { subjects: ["health"] },
  "/closure-watch": { subjects: ["health"], featured: true, related: ["/quality", "/health-map"] },
  "/detection-gap": { subjects: ["health"], featured: true, related: ["/chna-explorer", "/closure-watch"] },
  "/maternal-health": { subjects: ["health"] },
  "/behavioral-health": { subjects: ["health"] },
  "/clinical-trials": { subjects: ["health"] },
  "/complex-care": { subjects: ["health"] },
  "/wellness": { subjects: ["health"] },
  "/insurance-coverage": { subjects: ["health", "money"] },
  "/learn": { subjects: ["health"] },
  "/provider-data": { subjects: ["health", "tools"] },
  "/conditions": { subjects: ["health"] },
  "/early-childhood": { subjects: ["health"] },

  // Money and benefits
  "/financial-help": { subjects: ["money"], intent: "help" },
  "/benefits": { subjects: ["money"] },
  "/social-services": { subjects: ["money"] },
  "/costs": { subjects: ["money", "health"] },
  "/tax-comparison": { subjects: ["money"] },
  "/disability-access": { subjects: ["money"] },
  "/reentry": { subjects: ["money"] },
  "/decision-science": { subjects: ["money", "tools"] },
  "/sba-insights": { subjects: ["money"] },
  "/data/snap-coverage-at-risk": { subjects: ["food", "money"], related: ["/data/medicaid-coverage-at-risk", "/data/dual-eligible-exposure", "/data/snap-michigan"] },
  "/data/medicaid-coverage-at-risk": { subjects: ["health", "money"], related: ["/data/snap-coverage-at-risk", "/data/dual-eligible-exposure", "/insurance-coverage"] },
  "/data/dual-eligible-exposure": { subjects: ["health", "money"], related: ["/data/snap-coverage-at-risk", "/data/medicaid-coverage-at-risk", "/insurance-coverage"] },

  // Home and neighborhood
  "/zip-intelligence": { subjects: ["home", "tools"], intent: "place" },
  "/housing-options": { subjects: ["home"], intent: "help" },
  "/zoning": { subjects: ["home"] },
  "/libraries": { subjects: ["home", "civic"] },
  "/outages": { subjects: ["home", "env"] },
  "/transportation": { subjects: ["home"] },
  "/find-your-city": { subjects: ["home"] },
  "/community-infrastructure": { subjects: ["home", "civic"] },

  // Environment
  "/environment/water": { subjects: ["env"], featured: true, related: ["/environment", "/environment/air"] },
  "/environment/air": { subjects: ["env"] },
  "/environment/energy": { subjects: ["env", "money"] },
  "/environment/disaster": { subjects: ["env"] },
  "/energy-burden": { subjects: ["env", "money"] },
  "/disaster-history": { subjects: ["env"], featured: true, related: ["/environment/disaster", "/environment"] },
  "/environment": { subjects: ["env"] },

  // Food
  "/food-access": { subjects: ["food"], featured: true, related: ["/data/snap-michigan", "/data/snap-coverage-at-risk"] },
  "/data/snap-michigan": { subjects: ["food"], related: ["/food-access", "/data/snap-coverage-at-risk"] },
  "/resources": { subjects: ["food", "money"] },
  "/events": { subjects: ["food", "health"] },

  // Civic power
  "/civic-power": { subjects: ["civic"], featured: true, related: ["/civic-power/races", "/officials", "/foia"] },
  "/civic-power/races": { subjects: ["civic"], related: ["/civic-power", "/officials"] },
  "/civic-power/federal": { subjects: ["civic", "follow"] },
  "/officials": { subjects: ["civic"] },
  "/elections": { subjects: ["civic"] },
  "/foia": { subjects: ["civic", "follow"], intent: "money", related: ["/transparency/records", "/transparency"] },
  "/tribal-nations": { subjects: ["civic", "health"] },
  "/civic-data": { subjects: ["civic"] },

  // Follow the money
  "/transparency": { subjects: ["follow"] },
  "/transparency/contractors": { subjects: ["follow"], intent: "money", related: ["/public-investment", "/transparency/money"] },
  "/transparency/money": { subjects: ["follow"] },
  "/transparency/officials": { subjects: ["follow", "civic"] },
  "/transparency/records": { subjects: ["follow", "civic"] },
  "/public-investment": { subjects: ["follow"], intent: "money", related: ["/transparency/contractors", "/sba-insights"] },

  // Analyst tools
  "/compare": { subjects: ["tools"], intent: "place" },
  "/compare-zips": { subjects: ["tools", "home"] },
  "/data-explorer": { subjects: ["tools"], intent: "analyze" },
  "/chna-explorer": { subjects: ["tools", "health"] },
  "/map/layers": { subjects: ["tools", "env"], intent: "analyze" },
  "/downloads": { subjects: ["tools"], intent: "analyze" },
  "/datasets": { subjects: ["tools"] },
  "/ask": { subjects: ["tools"] },
  "/service-area": { subjects: ["tools"] },
  "/data-gaps": { subjects: ["tools", "civic"] },
  "/insights": { subjects: ["tools"] },
  "/brief": { subjects: ["tools"], intent: "place" },
};
