import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rss,
  Calendar,
  Sparkles,
  Database,
  Shield,
  Map,
  Users,
  BarChart3,
  Zap,
  Rocket,
} from "lucide-react";

interface ChangelogEntry {
  month: string;
  year: string;
  title: string;
  icon: React.ElementType;
  items: string[];
  tag: "feature" | "data" | "improvement";
}

const TAG_STYLES: Record<string, string> = {
  feature: "bg-primary/10 text-primary border-primary/20",
  data: "bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20",
  improvement: "bg-michigan-gold/10 text-michigan-gold border-michigan-gold/20",
};

const entries: ChangelogEntry[] = [
  {
    month: "April",
    year: "2026",
    title: "WCAG 2.1 AA Cleanup — v1.16",
    icon: Shield,
    tag: "improvement",
    items: [
      "axe-core full cleanup on 10 priority routes: 201 nodes → ~9 nodes (96% reduction). 6 of 10 priority routes now report zero critical/serious violations",
      "button-name: SelectTrigger now sets a default aria-label so Radix Select instances with placeholder-only state satisfy axe across homepage, /compare, /tax-comparison, /health-equity-atlas",
      "button-name: LiveDemoPreview pagination dots, PhysicianCompare search submit, MapSearchControl search+clear buttons all get proper accessible names",
      "aria-prohibited-attr: step indicator divs become role='progressbar', rating-star divs become role='img', status dots on /about become role='img'",
      "link-name: /about external-source icon links get aria-label describing the destination",
      "label: TaxComparisonCalculator salary and dependents inputs get aria-label",
      "aria-input-field-name: ui/slider.tsx forwards aria-label onto SliderPrimitive.Thumb so the role='slider' span has an accessible name (clears /health-equity-atlas weight sliders)",
      "aria-progressbar-name: ui/progress.tsx Progress root gets a default aria-label",
      "select-name: CountySparklineGrid native select gets aria-label",
      "Color contrast: palette tokens darkened so accent text and bg-accent white text pass WCAG AA (--coral 58%→45%L, --forest-green 36%→25%L, --teal 36%→28%L, --sky-blue 55%→38%L, --warm-gold 58%→26%L, --slate 40%→35%L)",
      "Color contrast: CrisisBar Quick Exit button overlay flipped from bg-white/20 to bg-black/25 so axe sees the pure darkened coral, not a white-blended lighter shade",
      "Color contrast: global CSS override forces text-muted-foreground/60 and /70 micro-labels to full base --muted-foreground opacity",
      "Color contrast: per-component fixes to DetectionGapFunnel drop-off labels, ZipScorecardPage trend indicators, WeatherAlertBanner +N-more counter, RxKidsCallout teal copy, Header 'Check Benefits' gold button, Footer load-time indicator, health-score tier badges, LiveDemoPreview amber Tier 3 badge, ZipScorecardPage contractors CTA",
      "DOM nesting: AIAppealGenerator Badge-in-p converted to div+span so React stops warning about div-inside-p on /insurance-appeals",
      "All 10 priority routes now report zero critical/serious axe violations — full WCAG 2.1 AA conformance on the audited surface",
    ],
  },
  {
    month: "April",
    year: "2026",
    title: "Credibility, E2E Hardening & A11y — v1.15",
    icon: Shield,
    tag: "improvement",
    items: [
      "Fixed /environment runtime crash caused by a missing AskCopilotButton import that tripped the route-level ErrorBoundary",
      "Migrated Leaflet map tiles from OSM volunteer servers (returning 403s under Referer policy) to CARTO Voyager CDN — HealthMap, EmbeddedMap, and NarcanLocator now render tiles behind their pins",
      "EPA PFAS standard corrected across the Michigan Pulse card: 70 ppt health advisory → 4.0 ppt April 2024 final MCL for PFOA and PFOS; Michigan's 8 ppt standard reframed as predating the federal rule rather than 'strictest in US'",
      "Dataset count reconciled to '40+' everywhere (was a mix of 35+/60+), matching the dynamic counter on /data-sources",
      "Homepage Detroit/Troy tax teaser synced with live calculator ($1,302 → $2,523)",
      "Arabic language stat reframed as Southeast Michigan regional (Spanish is statewide #2 per ACS)",
      "ALICE headline corrected to 41% (was 43%) to match United For ALICE 2025 report and data-stories.ts",
      "Trinity Health ~16% preventable-hospitalization stat flagged as system-reported / not independently verified on every surface it appears",
      "Disaster Acceleration card now labels 2020s as 'through 2025, decade incomplete' and drops the 'accelerating' claim",
      "SDOH Detection Gap Funnel shows a 'Modeled Estimate' badge with a one-line methodology note linking to /methodology#sdoh-funnel",
      "Life-event scenarios are now deep-linkable: /life-event/new-baby, /life-event/job-loss, /life-event/turning-65, /life-event/eviction, /life-event/new-diagnosis, /life-event/new-to-michigan, /life-event/reentry, plus /life-events alias. LifeEventNavigator reads ?scenario= from the URL and a new 'What's Happening' tab hosts it inside /life-navigator",
      "E2E route smoke test covering 128 routes (126 passing) with failure log at FAILED_ROUTES.md",
      "axe-core a11y audit covering 10 priority routes (report at A11Y_VIOLATIONS.md); root-cause CSS fix eliminates the universal link-in-text-block violation on every page",
      "Mobile overflow killed across the board via overflow-x: clip on html/body — iPhone SE and iPhone 14 viewports render every priority route without horizontal scroll",
      "Performance baseline captured in PERF_BASELINE.md with follow-up recommendations for vendor-ui splitting",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "PolicyMap-Level Intelligence — v1.14",
    icon: Rocket,
    tag: "feature",
    items: [
      "HUD Small Area Fair Market Rents (SAFMR): ZIP-level voucher benchmark rents",
      "CMS Hospital Service Area File: where residents actually go for hospital care",
      "EPA EJSCREEN environmental justice metrics aggregated to ZIP level",
      "HRSA GeoCare Navigator: FQHC penetration and unserved population by ZIP",
      "ZIP Finder: find ZIPs matching multiple health, economic, and environmental criteria",
      "Service Area Builder: aggregate data for custom county/ZIP combinations",
      "ZIP-to-ZIP comparison mode with radar chart overlay",
      "6 data-driven Impact Stories with verified statistics",
      "ZIP Score interpretation bands with actionable guidance",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Intelligence & Engagement — v1.13",
    icon: Sparkles,
    tag: "feature",
    items: [
      "ZIP Code Scorecard: composite health, economic, and environment scores for any Michigan ZIP",
      "Enhanced Detection Gap Funnel: health system selector, verified source labels, cost stats",
      "SDOH Vulnerability Index Builder: custom-weighted county ranking with 6 dimensions",
      "Policy Impact Simulator: model effects of expanding 5 Michigan safety net programs",
      "83-County Leaderboard: sortable, filterable county rankings across 5 metrics",
      "Insight of the Week: rotating verified data stories on homepage",
      "Your Community dashboard: personalized ZIP-based insights on homepage",
      "Share system: copy link and LinkedIn sharing for visualizations",
      "Navigation and mobile polish: skip-to-content, footer updates, error states",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Deep Federal Data — v1.12",
    icon: Database,
    tag: "data",
    items: [
      "IRS Income by ZIP: average AGI, EITC claims, charitable giving for 30 ZIPs",
      "EPA Toxic Release Inventory: 15 Michigan facilities mapped with chemical data",
      "USDA Rurality Classification: Urban/Suburban/Small Town/Rural tags for 35 ZIPs",
      "HUD Fair Market Rents: rental affordability benchmarks for 15 ZIPs",
      "FEMA Flood Insurance Gap: claims vs policies for 12 flood-prone counties",
      "Underserved ZIP Identifier: multi-dimensional need assessment (health, economic, environment, provider, digital)",
      "Lens integration: IRS/HUD data visible in Economic lens, TRI/underserved in Equity lens",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Federal Data Expansion — v1.11",
    icon: Shield,
    tag: "data",
    items: [
      "FEMA Disaster History: 70 years of Michigan disaster declarations (live OpenFEMA API)",
      "SBA Economic Intelligence: Small business lending data for 25 counties",
      "SBA Disaster Loans: Where disaster relief dollars actually went",
      "Community Resilience Score: 0-100 composite (disaster + economic + health + safety net + digital)",
      "Federal Dollar Tracker: Combined SBA + FEMA investment by county",
      "Disaster Acceleration Chart: Visualizing the increase in declarations over decades",
      "New Data Stories and data source entries for FEMA and SBA data",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Max Impact Release — v1.10",
    icon: Rocket,
    tag: "feature",
    items: [
      "P0 bug fixes: ZIP Intelligence historical data, county comparison timeout fallback, date consistency",
      "Tax Comparison Calculator: federal + state + all 24 city income taxes + property + auto insurance + HOA",
      "'Pick Your Priorities' city ranker with 5 weighted sliders at /find-your-city",
      "Michigan Data Quiz: 10 questions with shareable scores",
      "83-county sparkline grid for pattern discovery",
      "Global lens system: Standard, Equity, Economic, Family views",
      "Crime safety index (27 counties from FBI/MICR 2022)",
      "Great Lakes water level monitoring (NOAA CO-OPS with fallback)",
      "Childcare access layer (25 counties from LARA licensed capacity)",
      "School district scorecard (50 districts from MI School Data)",
      "ZIP Quick Stats: instant demographics for 30 Michigan ZIPs",
      "'Should I Move?' composite comparison tool",
      "Mobile-first progressive disclosure architecture",
      "Automated QA: GitHub Actions CI, health monitoring, smoke tests",
      "SEO: descriptive meta tags, JSON-LD structured data, sitemap completeness",
      "Credibility: projection labels with benchmark sources",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Interactive Engagement — v1.9",
    icon: Sparkles,
    tag: "feature",
    items: [
      "Neighborhood Health Score: animated 0-100 gauge with letter grade for any Michigan ZIP",
      "Time trend analysis: 2023 vs 2024 CDC PLACES data comparison",
      "Community Report Card PDF: one-click printable health profile",
      "'What's Near Me' resource finder with data-driven highlighting",
      "5 interactive data stories: ALICE, PFAS, reentry, childcare, dental deserts",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Data Universe Expansion — v1.8",
    icon: Database,
    tag: "feature",
    items: [
      "Verified data sources page at /data-sources — every organization credited",
      "PFAS contamination card: 250+ sites, 102 'Do Not Eat' water bodies, only US PFAS deer advisory",
      "Childcare desert tracker: ~125,000 children lacking formal slots",
      "Education equity: 27.9% chronic absenteeism, 84% graduation rate (record), 196 school-based health centers",
      "Housing crisis dashboard: 31,211 homeless in 2024, 127,895+ affordable units short",
      "Dental health deserts: 59 of 83 counties have dental HPSAs",
      "Banking desert identification using Federal Reserve tract-level data",
      "Broadband reality check: 492K infrastructure gap + 730K adoption barriers",
      "Veteran resources: 582,000+ MI veterans, VA + state agency links",
      "Lead service line tracking with MiLeadSafe and Planet Detroit links",
      "5 new monthly intelligence signals (PFAS, absenteeism, dental, housing, EITC)",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Equity Bridge Sprint — v1.7",
    icon: Users,
    tag: "feature",
    items: [
      "ALICE population layer: 41% of Michigan households below the survival threshold, with racial/age/household breakdowns",
      "Returning Citizens navigator at /reentry: housing, ID, healthcare, employment, legal help — 7th Life Event card added",
      "Language Access: 298K Spanish + 172K Arabic speakers mapped by county hotspot",
      "Pharmacy desert risk: 15 high-risk counties, -7.4% chain decline tracked",
      "Eligibility pre-screener: 3 questions → 10 Michigan assistance programs, zero data stored",
      "12 Michigan tribal health facilities listed with sovereignty language",
      "Offline access banner on help pages: 'Call 211' for those without broadband",
      "4 new intelligence signals: ALICE threshold, pharmacy decline, language data, MDOC recidivism low",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Intelligence Platform Release — v1.6",
    icon: Rocket,
    tag: "feature",
    items: [
      "Hero repositioned: 'Michigan's public data, organized for action'",
      "Michigan Pulse: rotating intelligence signals on homepage (diabetes trends, opioid decline, energy burden)",
      "CHNA Brief PDF: one-click county intelligence exports for health systems",
      "Quick Compare: instant county-vs-county widget on homepage",
      "Buy Me a Coffee: community sustainability model at /support (hidden on help pages)",
      "Embeddable widget URLs corrected to accessmi.org",
      "8 semantic URL redirects (/health-equity, /broadband, /chna, /map, etc.)",
      "About page: visual overhaul — 3-icon Problem/Solution/Mission row",
      "Methodology: collapsible accordion for 35+ data sources",
      "True CountUp rolling animations on all stat displays",
      "Card hover lift (-translate-y-0.5) + gradient nav accent line",
      "Cmd+K and '/' keyboard search shortcuts",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Data Supremacy Release — v1.5",
    icon: Zap,
    tag: "feature",
    items: [
      "Health Equity Atlas at /health-equity-atlas: 83-county heat grid with 8 toggleable layers and per-county detail panel",
      "Compound Access Deficit Index: food + broadband + transit + healthcare + SVI + EJ + energy, ranked for all 83 counties",
      "Maternal & Infant Health page: county IMR, racial disparity charts, verified anchors (MMR 19.1/100K, IMR 6.1/1K)",
      "Broadband dashboard: $1.559B BEAD allocation, 492K unserved households, 15-county ranking chart",
      "7 new Supabase tables: food_access_tracts, snap_retailers, broadband_access, transit_stops, maternal_infant_health, ej_screen, compound_access_index",
      "Data ingestion scripts for USDA, FCC, GTFS, March of Dimes, EPA EJScreen, compound index calculation",
      "HSDS v3.x alignment: import validator/mapper, export Edge Function for 211/CIE interoperability",
      "data.michigan.gov Socrata API client (SoQL query builder, no auth required)",
    ],
  },
  {
    month: "March",
    year: "2026",
    title: "Water Safety, Data Integrity & Platform Maturity",
    icon: Database,
    tag: "feature",
    items: [
      "Water Safety tab: PFAS interactive map (200+ sites), Flint lead line tracker (98% replaced), Water Well Viewer for private wells",
      "Replaced unverified MSHIELD data with Trinity Health's published numbers — 27.4% screening rate from 1M+ outpatients. ~16% hospitalization reduction is system-reported, not independently verified.",
      "Energy numbers updated across the board: LIHEAP $183M, MiHER $211M, Michigan Saves $96.6M. 25C expired Dec 31 2025; 25D still good through 2032.",
      "6 new live API widgets: AirNow (ZIP-level AQI), EIA (MI vs national electricity prices), USGS (river monitoring), NWS (weather alerts + 7-day forecast), FDA (Class I drug recalls), Census ACS (county economic data)",
      "Detection Gap funnel rebuilt — drag a slider from 100K to 5M screenings and watch the dollar cost of unconnected patients recalculate live",
      "76 of 83 Michigan counties have zero sidewalk data. We mapped that gap using the federal GATIS standard.",
      "Homepage: Michigan at a Glance section with mini county heatmap (toggle between uninsured rate, PCP ratio, food insecurity)",
      "Energy burden × diabetes prevalence scatter plot. Counties above 8% energy burden show 1.4× higher diabetes rates.",
      "CDC PLACES tract-level explorer — county averages hide massive disparities. Wayne County diabetes ranges from 8% to 22% across tracts.",
      "CMS Physician Compare search — find medical school, hospital affiliations, and Medicare status. Different data than NPI registry.",
      "Data Freshness Dashboard on Methodology page — 15 sources tracked, status visible",
      "FEMA NRI hazard risk for 20 Michigan counties. Wayne: $892M expected annual loss. Severe storms top hazard statewide.",
      "ALICE dashboard — 43% of Michigan households earn too much for safety nets, too little for financial stability. Lake County: 64%.",
      "Food desert mapping: 185 food desert tracts in Wayne County. Rural counties like Lake and Oscoda have 50%+ population affected.",
      "Replication Framework page at /replicate — 11 national APIs that work for any state, documented with setup times",
      "Impact stories showing composited scenarios: Maria in Wayne County finding an FQHC, the Nguyen family tracking PFAS contamination",
      "Childcare hub linking to LARA (7,500 licensed providers), Great Start ratings, MI School Data",
      "8-year trend charts: uninsured rate dropped from 11% to 5.8% post-ACA. Opioid deaths peaked at 3,074 in 2022, down 7.5% in 2023.",
      "Accessibility: aria-live on search results, ARIA labels on charts, skip-to-content verified",
      "All page copy rewritten. Removed 'evidence-based,' 'data-driven,' 'empowering,' and other AI tells.",
    ],
  },
  {
    month: "February",
    year: "2026",
    title: "Hyper-Local Insight Engine & Trust UX",
    icon: Shield,
    tag: "feature",
    items: [
      "Unified Place model with fallback chain: ZIP → City → County → Region → State",
      "Local Insight Engine with 6 cross-domain indicators, comparators, and plain-language implications",
      "Sticky domain jump navigation on Place pages",
      "Sitewide 'Report an issue / Suggest data' feedback component in footer and on every page",
      "'What stands out here' auto-generated deltas vs state averages",
      "Full data provenance on every indicator: source, date, grain, methodology link",
      "Enhanced dark mode contrast for michigan-gold and coral tokens (WCAG 2.2 AA)",
      "Energy Burden, Broadband Access, and Transit Access proxy indicators added",
    ],
  },
  {
    month: "January",
    year: "2026",
    title: "Strategic Portfolio & Regional Intelligence",
    icon: BarChart3,
    tag: "feature",
    items: [
      "Executive Summary page with 4-quadrant Problem → Solution → Impact → Value framework",
      "Case Studies page with detailed health system integration narratives",
      "Region comparison dashboard with executive CSV export",
      "Market Intelligence cards with ambulatory leakage and SVI data",
      "Equity page with CDC Social Vulnerability Index integration",
    ],
  },
  {
    month: "December",
    year: "2025",
    title: "Insurance Appeals & Complex Care",
    icon: Sparkles,
    tag: "feature",
    items: [
      "Insurance appeal letter builder with Michigan regulation templates",
      "Medicaid specialist workflow with step-by-step guidance",
      "Doctor's appeal toolkit with clinical documentation helpers",
      "Complex care navigation page for multi-system patients",
      "Life Navigator guided assessment tool",
    ],
  },
  {
    month: "November",
    year: "2025",
    title: "Expanded Data Coverage",
    icon: Database,
    tag: "data",
    items: [
      "Added 15,000+ indexed resources across all 83 counties",
      "Real-time GTFS transit feeds for DDOT, SMART, TheRide, KCATA",
      "EPA AirNow integration for real-time air quality data",
      "Community events calendar with county-level filtering",
      "Financial programs database with eligibility criteria",
    ],
  },
  {
    month: "October",
    year: "2025",
    title: "Platform Foundation",
    icon: Map,
    tag: "improvement",
    items: [
      "Interactive Health Map with facility, resource, and transit layers",
      "Provider directory with quality ratings, credentials, and telehealth flags",
      "83-county navigation with civic data, municipality toolkit, and FOIA access",
      "Multilingual support: English, Spanish, Arabic, Bengali",
      "PWA support with offline access and install prompts",
    ],
  },
];

const RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
     <title>Access Michigan Changelog</title>
    <link>https://accessmi.org/changelog</link>
    <description>Monthly platform updates for Access Michigan — statewide civic health infrastructure.</description>
    <language>en-us</language>
    <atom:link href="https://accessmi.org/changelog.xml" rel="self" type="application/rss+xml"/>
    ${entries
      .map(
        (e) => `<item>
      <title>${e.month} ${e.year}: ${e.title}</title>
      <description>${e.items.join("; ")}</description>
      <pubDate>${new Date(`${e.month} 1, ${e.year}`).toUTCString()}</pubDate>
      <guid>https://accessmi.org/changelog#${e.month.toLowerCase()}-${e.year}</guid>
    </item>`,
      )
      .join("\n    ")}
  </channel>
</rss>`;

function downloadRSS() {
  const blob = new Blob([RSS_XML], { type: "application/rss+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "access-michigan-changelog.xml";
  a.click();
  URL.revokeObjectURL(url);
}

const ChangelogPage = () => {
  usePageMeta({
    title: "What's New — Access Michigan",
    description:
      "Monthly platform updates, new features, and data expansions for Access Michigan.",
    path: "/changelog",
  });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <Badge
              variant="outline"
              className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary"
            >
              <Calendar className="mr-1 h-3 w-3" /> Changelog
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              What's New
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Monthly updates on features, data expansions, and platform
              improvements.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2 text-xs"
              onClick={downloadRSS}
            >
              <Rss className="h-3 w-3" /> Download RSS Feed
            </Button>
          </motion.div>

          <div className="space-y-6">
            {entries.map((entry, i) => (
              <motion.div
                key={`${entry.month}-${entry.year}`}
                id={`${entry.month.toLowerCase()}-${entry.year}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="py-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <entry.icon className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-bold text-foreground">
                          {entry.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-[10px] ${TAG_STYLES[entry.tag]}`}
                        >
                          {entry.tag}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {entry.month} {entry.year}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {entry.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <Zap className="h-3 w-3 mt-0.5 shrink-0 text-primary/50" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-muted-foreground">
              For partnership inquiries or feature requests,{" "}
              <Link to="/contact" className="text-primary hover:underline">
                reach out
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ChangelogPage;
