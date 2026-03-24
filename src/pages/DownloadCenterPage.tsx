import { Link } from "react-router-dom";
import { Download, FileText, Map, BarChart3, Database, ExternalLink } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

interface DownloadItem {
  title: string;
  description: string;
  icon: typeof FileText;
  action: "print" | "link";
  href?: string;
}

const DOWNLOADS: { section: string; items: DownloadItem[] }[] = [
  {
    section: "Community Briefs",
    items: [
      { title: "County Community Brief", description: "Full profile with health, housing, economic & environmental data for any county.", icon: FileText, action: "link", href: "/brief/wayne" },
      { title: "ZIP Scorecard", description: "Neighborhood-level health scorecard with CDC PLACES, IRS SOI, and Census data.", icon: BarChart3, action: "link", href: "/zip/48201" },
      { title: "County Comparison Report", description: "Side-by-side analysis of up to 4 counties across 20+ indicators.", icon: BarChart3, action: "link", href: "/compare" },
    ],
  },
  {
    section: "Maps & Visualizations",
    items: [
      { title: "Health Equity Atlas", description: "Interactive map of health disparities across all 83 Michigan counties.", icon: Map, action: "link", href: "/health-equity-atlas" },
      { title: "Detection Gap Funnel", description: "Visualize screening-to-treatment drop-off rates by condition and county.", icon: BarChart3, action: "link", href: "/detection-gap" },
    ],
  },
  {
    section: "Data Exports",
    items: [
      { title: "CSV Data Export", description: "Download raw data tables for your own analysis from the Health Data Dashboard.", icon: Database, action: "link", href: "/data" },
      { title: "60+ Data Sources Directory", description: "Complete catalog of every federal and state dataset we aggregate.", icon: ExternalLink, action: "link", href: "/data-sources" },
    ],
  },
];

export default function DownloadCenterPage() {
  usePageMeta({
    title: "Download Center — Access Michigan",
    description: "Download community briefs, county comparisons, health maps, and raw data exports. All free, no account required.",
    path: "/downloads",
  });

  return (
    <Layout>
      <div className="container max-w-4xl py-10 md:py-16 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-primary">
            <Download className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Download Center</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every report on Access Michigan can be saved as a PDF using your browser's print dialog. No account required.
          </p>
        </div>

        {DOWNLOADS.map((group) => (
          <section key={group.section} className="space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">{group.section}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  {item.action === "link" && item.href && (
                    <Link to={item.href}>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full">
                        <ExternalLink className="h-3 w-3" /> Open & Print
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="rounded-xl border border-border bg-muted/30 p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> On any page, press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono">Ctrl+P</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono">⌘P</kbd> on Mac) to save as PDF.
          </p>
          <p className="text-xs text-muted-foreground">
            All data is sourced from public federal and state datasets. See our{" "}
            <Link to="/methodology" className="text-primary hover:underline">Methodology</Link> page for details.
          </p>
        </div>
      </div>
    </Layout>
  );
}
