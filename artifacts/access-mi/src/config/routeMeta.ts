/**
 * Per-route metadata for static HTML injection at build time.
 *
 * The Vite build produces a single index.html that the SPA hydrates
 * client-side. Crawlers and link-preview generators that do not run
 * JavaScript only see the boilerplate <title>, <meta>, and (mostly
 * empty) <body> from that one file, which is why deep routes like
 * /methodology, /health-map, and /transportation were appearing as
 * the homepage in search snippets.
 *
 * `scripts/prerender-meta.mjs` runs after the Vite build. For every
 * entry below it copies dist/index.html into dist/<path>/index.html
 * and rewrites the head tags (title, description, canonical, OG/
 * Twitter) and inserts a per-route <h1> + summary inside the
 * <noscript> body so non-JS readers get unique, route-specific
 * content. The SPA then hydrates as normal in browsers that run JS.
 *
 * Only static (non-parameterized) routes appear here. Dynamic
 * routes such as /county/:slug and /zip/:zipcode are left to the
 * SPA fallback because their metadata is data-driven at runtime.
 *
 * This file is the single source of truth used by both the build
 * script and the runtime usePageMeta hook (so the head tags injected
 * at build match the values React swaps in on hydration).
 */

export interface RouteMeta {
  /** Path served by React Router. Must match exactly. */
  path: string;
  /** HTML <title> for the route. */
  title: string;
  /** HTML <meta name="description"> for the route. */
  description: string;
  /** Visible page heading rendered inside <noscript> for crawlers. */
  h1: string;
  /** Optional short paragraph below the h1 for non-JS context. */
  summary?: string;
}

export const ROUTE_META: RouteMeta[] = [
  {
    path: "/",
    title: "Access Michigan: civic intelligence, county by county.",
    description:
      "Independent civic data for all 83 Michigan counties. Every figure is traced to a primary federal source and labeled verified, modeled, or projected.",
    h1: "Michigan's public data, organized for action",
    summary: "ZIP-level health, economic, and housing data across 83 counties.",
  },
  {
    path: "/methodology",
    title: "Methodology | Access Michigan",
    description:
      "How Access Michigan sources and validates civic data. Covers data classification, the Civic Insight Score, and equity-centered design principles.",
    h1: "Methodology and data transparency",
    summary:
      "Sourcing, validation, and a transparent record of every score and threshold on the platform.",
  },
  {
    path: "/health-map",
    title: "Michigan Health Map | Access Michigan",
    description:
      "Interactive map of Michigan health facilities: FQHCs, behavioral health providers, and CMS-rated hospitals across all 83 counties.",
    h1: "Michigan Health Map",
    summary:
      "Locate hospitals, clinics, FQHCs, and behavioral health services anywhere in Michigan.",
  },
  {
    path: "/transportation",
    title: "Transportation Access | Access Michigan",
    description:
      "Public transit, paratransit, non-emergency medical transport, and rural ride programs across Michigan's 83 counties. Sourced from MDOT and SEMCOG.",
    h1: "Transportation access in Michigan",
    summary:
      "Rural transit, ADA paratransit, NEMT, and rideshare programs by county.",
  },
  {
    path: "/find-care",
    title: "Find Care Near You | Access Michigan",
    description:
      "Search Michigan healthcare providers by ZIP or county. FQHCs, sliding-scale clinics, behavioral health providers, and Leapfrog-rated hospitals.",
    h1: "Find Care Near You",
    summary:
      "Search Michigan providers, clinics, and hospitals by ZIP or county.",
  },
  {
    path: "/benefits",
    title: "Benefits Education | Access Michigan",
    description:
      "Educational explainers of Michigan benefit programs: a sourced life-stage map, how eligibility rules work, and a benefits-cliff explainer. Informational only. Eligibility is decided by the program.",
    h1: "How Michigan benefit programs work",
    summary: "Three educational tools, one page. Sourced. Informational only.",
  },
  {
    path: "/quality",
    title: "Hospital Quality & Safety Ratings | Access Michigan",
    description:
      "Compare Michigan hospitals on Leapfrog safety grades, CMS quality scores, Magnet status, and patient experience metrics. Sourced from CMS and Leapfrog.",
    h1: "Hospital Quality & Safety Ratings",
    summary:
      "Independent safety grades, CMS quality scores, and accreditations for Michigan hospitals.",
  },
  {
    path: "/data",
    title: "Health Data Dashboard | Access Michigan",
    description:
      "Statewide health metrics for Michigan: CDC PLACES indicators, ALICE economic burden, insurance coverage, and behavioral health trends.",
    h1: "Health Data Dashboard",
    summary:
      "Statewide health, equity, and economic indicators by county and ZIP.",
  },
  {
    path: "/data-and-insights",
    title: "Data & Insights | Access Michigan",
    description:
      "Featured Michigan civic data stories, leaderboards, and analytical tools sourced from CMS, CDC, HRSA, USDA, Census, and Michigan MDHHS.",
    h1: "Data & Insights",
    summary:
      "Civic data stories, leaderboards, and analytical tools across Michigan.",
  },
  {
    path: "/data-sources",
    title: "Data Sources | Access Michigan",
    description:
      "42 verified public source organizations (24 federal, 9 state, 9 nonprofit) powering Michigan's civic intelligence platform. Every organization credited.",
    h1: "42 Verified Data Sources",
    summary:
      "Federal, state, and nonprofit data sources behind every metric on the platform.",
  },
  {
    path: "/financial-help",
    title: "Financial Help | Access Michigan",
    description:
      "Michigan financial assistance programs for healthcare, housing, energy, and food. Preliminary eligibility screener links to MI Bridges.",
    h1: "Financial Help",
    summary:
      "Michigan financial assistance programs, with a preliminary screener routing to MI Bridges.",
  },
  {
    path: "/compare",
    title: "Compare Places | Side-by-Side Census Data | Access Michigan",
    description:
      "Compare up to 4 Michigan counties or ZIP codes with live Census ACS data, community voice, equity lens, and PDF export.",
    h1: "Compare Michigan counties and ZIP codes",
    summary:
      "Side-by-side civic, economic, and housing data with a shareable, exportable view.",
  },
  {
    path: "/compare-zips",
    title: "Compare ZIPs | Access Michigan",
    description:
      "Side-by-side health and economic comparison for any two Michigan ZIP codes, drawn from CDC PLACES and Census ACS.",
    h1: "Compare Michigan ZIP codes",
    summary:
      "Two ZIP codes, side by side, on the metrics that actually drive outcomes.",
  },
  {
    path: "/zip-intelligence",
    title: "Michigan ZIP Health Score: 40 CDC Measures | Access Michigan",
    description:
      "Type your ZIP code. See 40 health, equity, and social measures. Build custom charts. Compare to Michigan and national averages.",
    h1: "Know your neighborhood",
    summary:
      "Type a Michigan ZIP. See 40 CDC PLACES measures. Build a custom view.",
  },
  {
    path: "/environment",
    title: "Environment | Access Michigan",
    description:
      "Michigan environmental data: PFAS sites, EJSCREEN equity indicators, FEMA flood risk, EGLE water infrastructure, and EPA TRI/ECHO facility records.",
    h1: "Michigan environmental data",
    summary:
      "PFAS, water infrastructure, environmental justice, and disaster risk by county.",
  },
  {
    path: "/health",
    title: "Health | Access Michigan",
    description:
      "Michigan health data hub: insurance coverage, CDC PLACES indicators, hospital quality, maternal and infant health, and behavioral health access.",
    h1: "Health in Michigan",
    summary: "Michigan health data, organized by ZIP, county, and statewide.",
  },
  {
    path: "/housing",
    title: "Housing | Access Michigan",
    description:
      "Michigan housing data: HUD fair market rents, eviction rates, homelessness Point-in-Time counts, mortgage equity, and homebuyer assistance programs.",
    h1: "Housing in Michigan",
    summary:
      "Rents, evictions, homelessness, and mortgage equity by Michigan county.",
  },
  {
    path: "/food-security",
    title: "Food Security | Access Michigan",
    description:
      "Michigan food insecurity rates, SNAP eligibility and participation, USDA Food Access Research Atlas tracts, WIC, and emergency food assistance by county.",
    h1: "Food security in Michigan",
    summary:
      "SNAP, WIC, food deserts, and emergency food assistance by county.",
  },
  {
    path: "/energy",
    title: "Energy | Access Michigan",
    description:
      "Michigan energy data: LIHEAP and State Emergency Relief eligibility, MEAP heating assistance, MiHER rebates, and utility equity programs.",
    h1: "Energy assistance in Michigan",
    summary:
      "Heating assistance, rebates, and clean-energy financing programs by county.",
  },
  {
    path: "/legal-aid",
    title: "Legal Aid | Access Michigan",
    description:
      "Michigan civil legal aid for housing, benefits, family, immigration, and reentry. Attorney referrals, MichLegalHelp resources, and self-help tools.",
    h1: "Legal aid in Michigan",
    summary:
      "Civil legal help for housing, benefits, family, and immigration matters.",
  },
  {
    path: "/civic-data",
    title: "Civic Data | Access Michigan",
    description:
      "Michigan civic intelligence hub: elected officials, election dates, voting access, broadband availability, and federal investment by district.",
    h1: "Civic data and democracy",
    summary:
      "Officials, elections, broadband, and federal investment, by Michigan district.",
  },
  {
    path: "/impact",
    title: "Platform Impact | Access Michigan",
    description:
      "Access Michigan platform impact metrics: 83 counties, 15,000+ records, 42 data sources, 4 languages, zero cost.",
    h1: "Building infrastructure for health equity",
    summary:
      "Platform metrics, release timeline, and how Access Michigan helps Michiganders.",
  },
  {
    path: "/resources",
    title: "Community Resources | Access Michigan",
    description:
      "Michigan community resources by county: food pantries, shelters, mental health crisis centers, charitable clinics, immigration help, and reentry services.",
    h1: "Community Resources",
    summary:
      "Food, shelter, health, legal, and reentry resources by Michigan county.",
  },
  {
    path: "/about",
    title: "About | Access Michigan",
    description:
      "Access Michigan is a nonpartisan, independent, citizen-built civic data platform. Mission, methodology, governance, and how to contribute.",
    h1: "About Access Michigan",
    summary:
      "A nonpartisan civic intelligence platform for Michigan, built on public data.",
  },
  {
    path: "/changelog",
    title: "Changelog | Access Michigan",
    description:
      "Access Michigan release notes: feature launches, data updates, methodology changes, and platform credibility fixes by month.",
    h1: "Changelog and release notes",
    summary: "Every release on the platform, with what changed and why.",
  },
  {
    path: "/health-equity-atlas",
    title: "Michigan Health Equity Atlas | Access Michigan",
    description:
      "10 health-equity layers across Michigan's 83 counties: access deficit, food deserts, broadband, infant mortality, environmental justice, and energy burden.",
    h1: "Michigan Health Equity Atlas",
    summary: "10 equity layers, 83 counties, one map.",
  },
  {
    path: "/civic-data-hub",
    title: "Civic Data Hub | Access Michigan",
    description:
      "Federal investment, broadband availability, and democratic-participation data by Michigan congressional district and county.",
    h1: "Civic Data Hub",
    summary:
      "Federal investment, broadband, and democratic-participation data, by district.",
  },
  {
    path: "/brief",
    title: "County Brief | Access Michigan",
    description:
      "Citation-grade county brief: population, facilities, uninsured rate, food insecurity, and primary care ratio. Each statistic sourced and labeled.",
    h1: "Michigan County Brief",
    summary:
      "One-page sourced county brief for health departments, journalists, and grant writers.",
  },
];

/**
 * Lookup helper used by both build script and the runtime
 * usePageMeta hook. Returns undefined for dynamic / unknown paths,
 * which leaves the existing client-side defaults in charge.
 */
export function getRouteMeta(path: string): RouteMeta | undefined {
  return ROUTE_META.find((r) => r.path === path);
}
