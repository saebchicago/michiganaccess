import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rss, Calendar, Sparkles, Database, Shield, Map, Users, BarChart3, Zap } from "lucide-react";

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
    month: "March", year: "2026", title: "Water Safety, Data Integrity & Platform Maturity",
    icon: Database,
    tag: "feature",
    items: [
      "Water Safety tab on Environment page: PFAS tracker (MPART interactive map), lead service line dashboard (MiLeadSafe), drinking water resources (Water Well Viewer)",
      "Replaced unverified MSHIELD data (17.1%/34%) with Trinity Health verified outcomes (27.4% unmet need, 16% hospitalization reduction from 1M+ screened)",
      "Added 4 new data sources to Methodology: SEMCOG Sidewalks FeatureServer, Michigan Broadband Map, MPART PFAS GIS, MiLeadSafe tracker",
      "Rebranded 'Public Beta' to 'Live Platform' / 'Open Civic Infrastructure' across all pages and i18n files",
      "Updated howItHelps copy with specific metrics (2,400+ providers, CMS/Leapfrog/CDC data citations)",
      "Data Center cross-link added to Civic Data Hub regulatory tools",
      "Weatherization Assistance details expanded with $21M/yr DOE + $183M BIL funding",
      "Press Kit updated to reflect 25+ data sources",
      "Fixed mobile heading overflow (text-4xl → text-3xl on hero)",
      "Live AirNow air quality checker — enter any Michigan ZIP code for real-time AQI",
      "Live EIA energy price tracker — Michigan vs. national electricity rates with 12-month trend chart",
      "Live USGS water monitoring — real-time streamflow and gage height for 15 Michigan river sites",
      "NPPES provider search already integrated on Find Care page with NPI, name, and specialty search",
      "Interactive Detection Gap Funnel with live screening volume slider — see the dollar cost of unconnected patients",
      "Michigan at a Glance data snapshot on homepage with mini county heatmap and metric toggles",
      "Energy burden × health outcomes scatter plot showing correlation across 20 counties",
      "Data Freshness Dashboard on Methodology page — transparency for all 15 tracked data sources",
      "Live NWS severe weather alerts for Michigan — real-time from National Weather Service",
      "Census tract health explorer — neighborhood-level disparity analysis within counties (CDC PLACES)",
      "CMS Physician Compare — medical school, affiliations, Medicare participation search",
      "NWS 7-day forecast widget for 8 Michigan cities",
      "FDA Class I drug recall alerts from openFDA",
      "FEMA hazard risk dashboard for 20 Michigan counties with expected annual loss data",
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
