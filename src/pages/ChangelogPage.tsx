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
    month: "February", year: "2026", title: "Trust & Credibility Suite",
    icon: Shield,
    tag: "feature",
    items: [
      "Added 'How We Compare' table: Access Michigan vs 211 vs Health Plan Directories",
      "New Success Stories section with real impact metrics on homepage",
      "30-Second Pitch infographic on Executive Summary page",
      "Achievement toasts & community completion stats on Resource Checklists",
      "Data Sources expandable in footer with CMS, HRSA, CDC, MDHHS attribution",
      "Last updated timestamps on all county pages",
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
              For partnership inquiries or feature requests, <a href="/contact" className="text-primary hover:underline">reach out</a>.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ChangelogPage;
