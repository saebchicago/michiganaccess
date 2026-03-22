import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rss, Calendar, Sparkles, Database, Shield, Map, Users, BarChart3, Zap, Rocket } from "lucide-react";

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
    month: "March", year: "2026", title: "Intelligence Platform Release — v3.0",
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
    month: "March", year: "2026", title: "Data Supremacy Release — v2.0",
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
    month: "March", year: "2026", title: "Water Safety, Data Integrity & Platform Maturity",
    icon: Database,
    tag: "feature",
    items: [
      "Water Safety tab: PFAS interactive map (200+ sites), Flint lead line tracker (98% replaced), Water Well Viewer for private wells",
      "Replaced unverified MSHIELD data with Trinity Health's published numbers — 27.4% screening rate from 1M+ outpatients, 16% hospitalization drop",
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
    month: "February", year: "2026", title: "Hyper-Local Insight Engine & Trust UX",
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
    month: "January", year: "2026", title: "Strategic Portfolio & Regional Intelligence",
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
    month: "December", year: "2025", title: "Insurance Appeals & Complex Care",
    icon: Sparkles,
    tag: "feature",
    items: [
      "AI-powered insurance appeal letter generator",
      "Medicaid specialist workflow with step-by-step guidance",
      "Doctor's appeal toolkit with clinical documentation helpers",
      "Complex care navigation page for multi-system patients",
      "Life Navigator guided assessment tool",
    ],
  },
  {
    month: "November", year: "2025", title: "Expanded Data Coverage",
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
    month: "October", year: "2025", title: "Platform Foundation",
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
    ${entries.map((e) => `<item>
      <title>${e.month} ${e.year}: ${e.title}</title>
      <description>${e.items.join("; ")}</description>
      <pubDate>${new Date(`${e.month} 1, ${e.year}`).toUTCString()}</pubDate>
      <guid>https://accessmi.org/changelog#${e.month.toLowerCase()}-${e.year}</guid>
    </item>`).join("\n    ")}
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
    description: "Monthly platform updates, new features, and data expansions for Access Michigan.",
    path: "/changelog",
  });

  return (
    <Layout>
      <section className="py-16">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs border-primary/30 text-primary">
              <Calendar className="mr-1 h-3 w-3" /> Changelog
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">What's New</h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Monthly updates on features, data expansions, and platform improvements.
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-2 text-xs" onClick={downloadRSS}>
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
                        <h2 className="text-sm font-bold text-foreground">{entry.title}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${TAG_STYLES[entry.tag]}`}>
                          {entry.tag}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {entry.month} {entry.year}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {entry.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
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
              For partnership inquiries or feature requests, <Link to="/contact" className="text-primary hover:underline">reach out</Link>.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ChangelogPage;
