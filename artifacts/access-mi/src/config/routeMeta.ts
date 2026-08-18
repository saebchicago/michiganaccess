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
    title: "Access Michigan: Independent Michigan civic intelligence platform.",
    description:
      "Independent civic data for all 83 Michigan counties. Every figure is traced to a primary federal source and labeled verified, modeled, or projected.",
    h1: "Michigan's public data, organized for action",
    summary:
      "ZCTA-level health, economic, and housing data across 83 counties.",
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
    path: "/insights",
    title: "Insights - Michigan Findings, Stories & Trends | Access Michigan",
    description:
      "Headline findings, data stories, and decade-long trends from Michigan public data. Every number carries a named source and a provenance label.",
    h1: "What the data says about Michigan",
    summary:
      "Curated findings, narrative data stories, and long-run trends for Michigan.",
  },
  {
    path: "/data-sources",
    title: "Data Sources | Access Michigan",
    description:
      "49 verified public data feeds (28 federal, 9 state, 12 nonprofit) from 42 publishers powering the Independent Michigan civic intelligence platform. Every publisher credited.",
    h1: "49 Verified Data Sources",
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
    path: "/food-access",
    title: "Food Access Explorer | Access Michigan",
    description:
      "Multi-variable view of USDA SNAP enrollment and retailer access across all 83 Michigan counties, with primary-source provenance and transparent benchmark math.",
    h1: "Food Access Explorer",
    summary:
      "USDA SNAP enrollment, retailer access, and coverage state for every Michigan county.",
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
      "Access Michigan platform impact metrics: 83 counties, 49 data sources, 4 languages, zero cost.",
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
    path: "/support",
    title: "Support This Project | Access Michigan",
    description:
      "Ways to support Access Michigan: share it with your community, partner with us, or contribute financially. Hosting, data pipelines, and accessibility work.",
    h1: "Support Access Michigan",
    summary:
      "Share it, partner with us, or contribute to hosting and data costs.",
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
  {
    path: "/data-explorer",
    title: "Data Explorer - Census & Community Indicators | Access Michigan",
    description:
      "Explore 50+ Census ACS tables for any Michigan county. Compare demographics, economics, housing, and education data.",
    h1: "Explore live Census data.",
    summary:
      "50+ ACS tables, any Michigan county, compared side by side.",
  },
  {
    path: "/equity",
    title: "Michigan Health Equity Data | Access Michigan",
    description:
      "Health equity indicators across Michigan's 83 counties including social determinants, chronic disease burden, and access gaps.",
    h1: "Michigan health equity data",
    summary:
      "Social determinants, chronic disease burden, and access gaps by county.",
  },
  {
    path: "/energy-burden",
    title: "Energy Burden Dashboard | Access Michigan",
    description:
      "County-level energy affordability data across Michigan, showing energy burden percentages and DOE threshold analysis.",
    h1: "Energy Burden Dashboard",
    summary:
      "Energy affordability and DOE burden thresholds by Michigan county.",
  },
  {
    path: "/detection-gap",
    title: "The Detection Gap | Access Michigan",
    description:
      "Health systems screen millions for social needs but lack the infrastructure to act. See the data behind Michigan's detection-to-action gap.",
    h1: "The Detection Gap",
    summary:
      "Screening volume versus the infrastructure to act on what's found.",
  },
  {
    path: "/public-investment",
    title: "Public Investment Intelligence | Access Michigan",
    description:
      "Where the money actually lands in Michigan. Federal funding, municipal bonds, and fiscal vulnerability analysis. Statewide.",
    h1: "Public Investment Intelligence",
    summary:
      "Federal funding, municipal bonds, and fiscal vulnerability, statewide.",
  },
  {
    path: "/officials",
    title: "Your Representatives | Access Michigan",
    description:
      "Find your elected officials at every level of government in Michigan, with official .gov lookup tools by ZIP code.",
    h1: "Your Representatives",
    summary:
      "Official .gov lookup tools for federal, state, and local Michigan representatives.",
  },
  {
    path: "/data-gaps",
    title: "Open Data Gaps | Access Michigan",
    description:
      "What Michigan public data exists, what doesn't, who holds it, and how residents can help close the gaps - with a citation for every gap claim.",
    h1: "Open Data Gaps",
    summary:
      "Documented gaps in Michigan's public data, in two honest lanes, with citations and constructive actions.",
  },
  {
    path: "/transparency",
    title: "Transparency Intelligence | Access Michigan",
    description:
      "Public money. Public contracts. Public officials. Federal contractors, lobbying, campaign finance, all Michigan political parties - sourced from primary records.",
    h1: "Transparency Intelligence",
    summary:
      "Federal contractors, lobbying, and campaign finance, sourced from primary records.",
  },
  {
    path: "/domain-dashboard",
    title: "Domain Intelligence Dashboard | Access Michigan",
    description:
      "County-by-county health, housing, and food-security intelligence for Michigan, sourced from County Health Rankings and the Census ACS.",
    h1: "Domain Intelligence Dashboard",
    summary:
      "Health, housing, and food-security signals by Michigan county.",
  },
  {
    path: "/explore",
    title: "Explore - Access Michigan",
    description:
      "Every destination on the platform in one searchable index: health, money, housing, environment, food, civic power, public spending, and analyst tools.",
    h1: "Everything on the platform, in one place.",
    summary:
      "The full library, grouped by subject, searchable in plain language.",
  },
  // --- Discovery backfill (2026-08-18) -------------------------------------
  // Entries for every curated destination in src/config/routeTaxonomy.ts that
  // previously had no prerender metadata. title/description are the page's own
  // usePageMeta() strings at the time of writing; h1 is the page's rendered
  // heading; summary is the short card/menu line. All values must stay plain
  // double-quoted literals: scripts/prerender-meta.mjs parses this file with a
  // regex and silently drops anything else.
  {
    path: "/closure-watch",
    title: "Michigan Closure Watch",
    description:
      "Hospital, service line, and FQHC closures in Michigan since 2020, two-source verified.",
    h1: "What's closing, and when it closed.",
    summary: "Hospital, service line, and FQHC closures since 2020, two-source verified.",
  },
  {
    path: "/maternal-health",
    title: "Maternal & Infant Health - Access Michigan",
    description:
      "Michigan maternal mortality: 19.1/100K. Infant mortality: 6.3/1K (MDHHS 2024). County-level data with racial disparity breakdowns from MDHHS and March of Dimes.",
    h1: "Care from prenatal to postpartum.",
    summary: "Maternal and infant health outcomes by county, with racial disparity breakdowns.",
  },
  {
    path: "/behavioral-health",
    title: "Behavioral Health Crisis Dashboard - Access Michigan",
    description:
      "Michigan's behavioral health infrastructure: psychiatric beds, 988 lifeline, CCBHCs, SUD treatment access, children's mental health. Michigan's #1 CHNA-identified need.",
    h1: "Michigan's behavioral health gap.",
    summary: "Psychiatric beds, 988 lifeline, CCBHCs, and SUD treatment access statewide.",
  },
  {
    path: "/clinical-trials",
    title: "Clinical Trials",
    description:
      "Search active clinical trials at Michigan's leading research institutions. Find enrolling studies for cancer, diabetes, neurology, and more.",
    h1: "Find a clinical trial.",
    summary: "Search enrolling clinical trials at Michigan research institutions.",
  },
  {
    path: "/complex-care",
    title: "Complex Care Navigation - Autoimmune & Rare Diseases",
    description:
      "Directory of autoimmune and rare disease resources, specialists, and community support across Michigan.",
    h1: "Autoimmune & Rare Disease Directory",
    summary: "Autoimmune and rare disease specialists, resources, and community support.",
  },
  {
    path: "/wellness",
    title: "Prevention & Wellness",
    description:
      "Age-specific screening recommendations, vaccine schedules, and wellness guidance based on USPSTF, CDC, and ACS guidelines for Michigan residents.",
    h1: "Stay ahead of it.",
    summary: "Screening schedules, vaccines, and prevention guidance by age.",
  },
  {
    path: "/insurance-coverage",
    title: "Insurance & Coverage Guide - Michigan",
    description:
      "Understand Medicaid, Medicare, Marketplace, FQHC, and private insurance options in Michigan. County-level data and navigator for all 83 counties.",
    h1: "Michigan Insurance & Coverage Guide",
    summary: "Medicaid, Medicare, Marketplace, and FQHC options, county by county.",
  },
  {
    path: "/learn",
    title: "Health Education Library",
    description:
      "Plain-language health education, symptom body map, clinical jargon decoder, health calculators, and doctor visit prep tools.",
    h1: "Understand Your Health",
    summary: "Plain-language health education, a symptom body map, and visit prep tools.",
  },
  {
    path: "/provider-data",
    title: "Provider Data",
    description:
      "Search Michigan Medicaid and Medicare provider data from public government sources",
    h1: "Provider Data",
    summary: "Search Michigan Medicaid and Medicare providers from public records.",
  },
  {
    path: "/conditions",
    title: "Health Conditions",
    description:
      "Find specialized care pathways for diabetes, heart disease, cancer, maternal health, and more across Michigan.",
    h1: "Care for your condition.",
    summary: "Care pathways for diabetes, heart disease, cancer, and more.",
  },
  {
    path: "/early-childhood",
    title: "Early Childhood in Michigan - Rx Kids & Childcare Access",
    description:
      "Rx Kids coverage by county, published program outcomes, and Michigan's childcare and preschool landscape - every number sourced.",
    h1: "Rx Kids and Michigan's childcare landscape",
    summary: "Rx Kids coverage, childcare, and preschool access by county.",
  },
  {
    path: "/social-services",
    title: "Social Services & Benefits",
    description:
      "Michigan and federal benefits, housing assistance, legal help, and behavioral health resources",
    h1: "Social Services & Benefits",
    summary: "Michigan and federal benefits, housing help, and legal aid in one place.",
  },
  {
    path: "/costs",
    title: "Cost Transparency",
    description:
      "Prescription savings programs, billing tips, and pointers to the official CMS Hospital Price Transparency search.",
    h1: "Know Before You Go",
    summary: "Prescription savings, billing tips, and hospital price transparency pointers.",
  },
  {
    path: "/tax-comparison",
    title: "Michigan Tax Comparison Calculator | City Income Tax, Property Tax, Auto Insurance | accessmi.org",
    description:
      "Compare federal, state, city income tax, property tax, and auto insurance between any two Michigan cities. See how much you'd keep.",
    h1: "Michigan Tax Comparison",
    summary: "Income, property, and auto insurance costs between any two Michigan cities.",
  },
  {
    path: "/disability-access",
    title: "Disability & Accessibility",
    description:
      "Federal and Michigan disability benefits, services, and legal aid resources",
    h1: "Disability & Accessibility",
    summary: "Disability benefits, services, and legal aid, federal and state.",
  },
  {
    path: "/reentry",
    title: "Coming Home to Michigan | Reentry Resources for Housing, Healthcare, Employment | accessmi.org",
    description:
      "Housing, healthcare, ID, employment, and legal help for returning citizens and their families across 83 Michigan counties.",
    h1: "Coming home to Michigan.",
    summary: "Housing, healthcare, ID, and work help for returning citizens.",
  },
  {
    path: "/decision-science",
    title: "Decision Science - Game Theory for Michigan Health - Access Michigan",
    description:
      "Interactive simulations: Benefits Gap Calculator, Hospital Market Dynamics, ALICE Survival Budget. Powered by DecisionPlay.",
    h1: "Why Does Michigan's Healthcare System Work This Way?",
    summary: "Interactive simulations of benefits gaps and hospital market dynamics.",
  },
  {
    path: "/sba-insights",
    title: "SBA Economic Intelligence - Access Michigan",
    description:
      "Small business lending trends across Michigan counties, including SBA loan volume, equity metrics, and industry breakdown.",
    h1: "SBA Small Business Lending",
    summary: "Small business lending volume and equity metrics by county.",
  },
  {
    path: "/housing-options",
    title: "Find Housing Options - Access Michigan",
    description:
      "Step-by-step help finding emergency shelter, affordable rentals, and subsidized housing in Michigan.",
    h1: "Find a place to land.",
    summary: "Emergency shelter to subsidized housing, step by step.",
  },
  {
    path: "/zoning",
    title: "Zoning & Land Use",
    description:
      "Michigan zoning information, land use regulations, flood zones, property lookups, and planning resources for all 83 counties.",
    h1: "Michigan Zoning & Land Use Resource Center",
    summary: "Zoning rules, flood zones, and property lookups for all 83 counties.",
  },
  {
    path: "/libraries",
    title: "Michigan Public Libraries | Access Michigan",
    description:
      "Find public libraries across Michigan's 83 counties. Free internet, digital resources, community programs, and more.",
    h1: "Michigan Public Libraries",
    summary: "Public libraries with free internet and programs, all 83 counties.",
  },
  {
    path: "/outages",
    title: "Utility Outage Dashboard",
    description:
      "Real-time utility outage tracking across all 83 Michigan counties. Monitor DTE and Consumers Energy outages with severity levels, affected customers, and historical trends.",
    h1: "Utility Outage Dashboard",
    summary: "Live DTE and Consumers Energy outage tracking by county.",
  },
  {
    path: "/find-your-city",
    title: "Find Your Ideal Michigan City | Compare by Cost, Health, Schools, Safety | accessmi.org",
    description:
      "Rank 25 Michigan cities by what matters to you: affordability, health, schools, safety, and environment. Real data, real-time results.",
    h1: "Find Your Michigan City",
    summary: "Rank 25 Michigan cities by affordability, health, schools, and safety.",
  },
  {
    path: "/community-infrastructure",
    title: "Community Infrastructure | Access Michigan",
    description:
      "Navigate Michigan's civic infrastructure - libraries, transit, courts, voting, and community centers.",
    h1: "Community Infrastructure",
    summary: "Libraries, transit, courts, and community centers by county.",
  },
  {
    path: "/environment/water",
    title: "Water Safety & PFAS Intelligence - Access Michigan",
    description:
      "Michigan PFAS contamination map, EPA drinking water violations, USGS stream data, and Great Lakes freshwater intelligence.",
    h1: "Know your water.",
    summary: "PFAS contamination, drinking water violations, and Great Lakes data.",
  },
  {
    path: "/environment/air",
    title: "Michigan Air Quality by County | Access Michigan",
    description:
      "County-level air quality data for Michigan. Source: EPA AirNow.",
    h1: "Know what's in your air.",
    summary: "County air quality from EPA AirNow, updated continuously.",
  },
  {
    path: "/environment/energy",
    title: "Energy Burden Intelligence - Access Michigan",
    description:
      "Michigan county energy burden analysis. Low-income households spend up to 12% of income on energy. LIHEAP, MiHER, solar potential data.",
    h1: "Michigan Energy Burden",
    summary: "Energy burden against DOE thresholds, with LIHEAP and MiHER pointers.",
  },
  {
    path: "/environment/disaster",
    title: "Disaster Intelligence - Access Michigan",
    description:
      "Michigan disaster risk analysis: FEMA NRI county scores, 104 presidential disaster declarations, flood risk, and community resilience data.",
    h1: "Michigan Disaster Risk",
    summary: "FEMA risk scores, disaster declarations, and flood exposure by county.",
  },
  {
    path: "/disaster-history",
    title: "FEMA Disaster History - Access Michigan",
    description:
      "Interactive dashboard of FEMA disaster declarations in Michigan from 1953 to present, powered by the live OpenFEMA API.",
    h1: "Every disaster, since 1953.",
    summary: "Every FEMA disaster declaration in Michigan since 1953, from the live API.",
  },
  {
    path: "/data/snap-michigan",
    title: "SNAP in Michigan | accessmi.org",
    description:
      "Food assistance enrollment and retailer access across all 83 Michigan counties, sourced from USDA Food and Nutrition Administration (FNA) and the SNAP Retailer Locator.",
    h1: "SNAP in Michigan",
    summary: "SNAP enrollment and retailer access for all 83 counties.",
  },
  {
    path: "/events",
    title: "Community Events",
    description:
      "Find Michigan community health fairs, resource events, and outreach programs by county.",
    h1: "Community Health Events",
    summary: "Community health fairs and resource events by county.",
  },
  {
    path: "/civic-power",
    title: "Civic Power Map - Access Michigan",
    description:
      "Michigan's democracy has open seats. 79.7% of races uncontested. Find where to serve, who represents you, and where candidates are needed.",
    h1: "Democracy has open seats.",
    summary: "Most local races go uncontested. See where your community needs you.",
  },
  {
    path: "/civic-power/races",
    title: "Races That Need Candidates - Access Michigan",
    description:
      "79.7% of Michigan's 15,139 races in 2024 were uncontested. See which regions and office types need candidates most.",
    h1: "79.7% Uncontested. #1 Among Large States.",
    summary: "Which regions and office types need candidates most.",
  },
  {
    path: "/civic-power/federal",
    title: "Federal Presence in Michigan - Access Michigan",
    description:
      "7 major federal agencies, 140+ Michigan offices, and federal advisory committees with public nomination processes.",
    h1: "The Federal Government in Your County",
    summary: "Federal agencies, offices, and advisory committees in Michigan.",
  },
  {
    path: "/elections",
    title: "Elections & Civic Access",
    description:
      "Michigan election dates, voter registration, and civic participation resources",
    h1: "Elections & Civic Access",
    summary: "Election dates, registration, and civic participation resources.",
  },
  {
    path: "/foia",
    title: "FOIA Request Builder - Access Michigan",
    description:
      "Draft professional public records requests for Michigan municipal, county, or federal agencies. Browser-only, no data stored.",
    h1: "FOIA Request Builder",
    summary: "Draft a public records request in the browser. Nothing stored.",
  },
  {
    path: "/tribal-nations",
    title: "Michigan Tribal Nations - Access Michigan",
    description:
      "Michigan's 12 federally recognized tribal nations: sovereign health infrastructure, equity data, and community resources.",
    h1: "12 Sovereign Nations",
    summary: "Michigan's 12 federally recognized tribal nations and their health systems.",
  },
  {
    path: "/transparency/contractors",
    title: "Federal Contractors - Access Michigan",
    description:
      "Every federal contract awarded in Michigan - searchable by county. Live USASpending.gov data.",
    h1: "Federal Contracts in Michigan",
    summary: "Every federal contract awarded in Michigan, searchable by county.",
  },
  {
    path: "/transparency/money",
    title: "Follow the Money - Access Michigan",
    description:
      "Michigan lobbying expenditures, campaign finance resources, and political contribution data. All parties, all public record.",
    h1: "Follow the money.",
    summary: "Lobbying, campaign finance, and political contributions, all public record.",
  },
  {
    path: "/transparency/officials",
    title: "Public Officials & Workforce - Access Michigan",
    description:
      "Michigan Legislature, federal workforce data, state salary ranges, and nonprofit grant recipients.",
    h1: "Michigan Public Officials & Workforce",
    summary: "Legislature rosters, federal workforce data, and state salary ranges.",
  },
  {
    path: "/transparency/records",
    title: "Transparency & Public Records",
    description:
      "Michigan FOIA tools, state spending data, and legislative transparency resources",
    h1: "Transparency & Public Records",
    summary: "FOIA tools, state spending data, and legislative transparency.",
  },
  {
    path: "/chna-explorer",
    title: "CHNA Explorer - Access Michigan",
    description:
      "Michigan health system CHNA priorities mapped to workforce, air, water, and access indicators at neighborhood resolution: the granularity the CHNA itself does not provide.",
    h1: "Community Health Needs Assessment",
    summary: "Health system CHNA priorities mapped to neighborhood-level indicators.",
  },
  {
    path: "/map/layers",
    title: "Deep Map - GIS Intelligence - Access Michigan",
    description:
      "Eight map layers in one view. Broadband, food access, PFAS, disaster risk, energy burden - every Michigan county.",
    h1: "Deep Map - GIS Intelligence",
    summary: "Broadband, food access, PFAS, disaster risk, and energy burden on one map.",
  },
  {
    path: "/downloads",
    title: "Download Center - Access Michigan",
    description:
      "Download community briefs, county comparisons, health maps, and raw data exports across all 83 Michigan counties.",
    h1: "Download Center",
    summary: "County briefs, comparisons, maps, and raw exports for all 83 counties.",
  },
  {
    path: "/datasets",
    title: "Dataset Explorer | Michigan Civic Intelligence",
    description:
      "Explore real Michigan datasets across health, environment, mobility, and economic pillars. All data from public authoritative sources.",
    h1: "Browse every dataset.",
    summary: "Browse Michigan datasets across health, environment, mobility, and economy.",
  },
  {
    path: "/ask",
    title: "Civic Intelligence - Ask AccessMI",
    description:
      "Ask plain-language questions about any Michigan county and get grounded, provenance-labeled answers from AccessMI's on-site datasets.",
    h1: "Civic Intelligence",
    summary: "Plain-language questions about any county, answered from on-site data.",
  },
  {
    path: "/service-area",
    title: "Service Area Builder",
    description:
      "Define a custom Michigan service area by selecting counties or ZIP codes. View aggregate statistics.",
    h1: "Service Area Builder",
    summary: "Build a custom service area from counties or ZIP codes.",
  },
  {
    path: "/data/snap-coverage-at-risk",
    title: "SNAP Coverage at Risk | accessmi.org",
    description:
      "County-level modeled ranges of Michigan SNAP participants in categories affected by P.L. 119-21 work requirement provisions. Not a point estimate. Exposure does not equal loss.",
    h1: "Who could lose SNAP.",
    summary: "Modeled ranges of SNAP participants affected by new work requirements.",
  },
  {
    path: "/data/medicaid-coverage-at-risk",
    title: "Medicaid Coverage at Risk | accessmi.org",
    description:
      "County-level modeled ranges of Michigan Medicaid enrollees in categories affected by P.L. 119-21 work requirement provisions. Not a point estimate. Exposure is not disenrollment.",
    h1: "Who could lose Medicaid.",
    summary: "Modeled ranges of Medicaid enrollees affected by new work requirements.",
  },
  {
    path: "/data/dual-eligible-exposure",
    title: "Dual-Eligible Exposure in Michigan | accessmi.org",
    description:
      "County-level view of Michiganders enrolled in both Medicare and Medicaid. Dual-eligibles are exempt from P.L. 119-21 work requirements. This map shows where they live.",
    h1: "Dual-Eligible Exposure in Michigan",
    summary: "Where Michiganders enrolled in both Medicare and Medicaid live.",
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
