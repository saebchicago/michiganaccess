import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { COUNTIES_COVERED } from "@/config/platformConstants";

export default function PartnershipOnePager() {
  usePageMeta({
    title: "Partnership One-Pager - Access Michigan",
    description:
      "Downloadable partnership capabilities summary for health system decision-makers.",
    path: "/partnerships/health-systems/one-pager",
  });

  const handlePrint = () => window.print();

  return (
    <Layout>
      {/* Print-only header override */}
      <style>{`
        @media print {
          header, footer, nav, .crisis-bar, .print-button, .ai-chat-widget,
          .page-feedback, .no-print { display: none !important; }
          body { font-size: 11pt; }
          .one-pager { padding: 0 !important; max-width: 100% !important; }
          .one-pager h1 { font-size: 22pt !important; }
          .one-pager h2 { font-size: 14pt !important; }
          .one-pager .grid { break-inside: avoid; }
        }
      `}</style>

      <div className="container py-8 max-w-3xl one-pager">
        {/* Screen-only controls */}
        <div className="flex items-center justify-between mb-8 no-print">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/partnerships/health-systems">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-michigan-teal hover:bg-michigan-teal/90 text-white"
          >
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </div>

        {/* Document */}
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center border-b border-michigan-teal/20 pb-6">
            <p className="text-xs uppercase tracking-widest text-michigan-teal-deep font-semibold mb-2">
              Partnership Capabilities
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              Access Michigan
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Community-level health intelligence for CHNA reporting, referral
              optimization, and community benefit quantification across all 83
              Michigan counties.
            </p>
          </div>

          {/* What We Do */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 border-l-4 border-michigan-teal pl-3">
              What We Provide
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Referral Analytics",
                  points: [
                    "Service area resource utilization",
                    "Referral pathway mapping",
                    "Community navigation trends",
                  ],
                },
                {
                  title: "Gap Analysis",
                  points: [
                    "County-level shortage identification",
                    "Social determinant mapping",
                    "Service desert detection",
                  ],
                },
                {
                  title: "Community Benefit ROI",
                  points: [
                    "CHNA data integration",
                    "IRS Schedule H alignment",
                    "Population health benchmarking",
                  ],
                },
              ].map((col) => (
                <div
                  key={col.title}
                  className="rounded-lg border border-border p-4 space-y-2"
                >
                  <h3 className="font-semibold text-sm text-foreground">
                    {col.title}
                  </h3>
                  <ul className="space-y-1">
                    {col.points.map((p) => (
                      <li
                        key={p}
                        className="text-xs text-muted-foreground flex items-start gap-1.5"
                      >
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-michigan-teal flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* CHNA Workflow */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 border-l-4 border-michigan-teal pl-3">
              CHNA Integration Workflow
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "Data Ingestion",
                "Needs Mapping",
                "Gap Analysis",
                "Report Generation",
                "Continuous Monitoring",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-michigan-teal/30 bg-michigan-teal/5 px-3 py-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-michigan-teal text-white text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {step}
                    </span>
                  </div>
                  {i < 4 && (
                    <span className="text-michigan-teal-deep/40 text-lg">→</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Geographic Coverage */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 border-l-4 border-michigan-teal pl-3">
              Geographic Coverage
            </h2>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-3xl font-bold text-michigan-teal-deep">
                {COUNTIES_COVERED}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Michigan counties covered
              </p>
            </div>
          </section>

          {/* Standards */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 border-l-4 border-michigan-teal pl-3">
              Standards & Compliance
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "No PHI Collected or Stored",
                "No User Accounts Required",
                "Aligned to IRS 501(r)/Schedule H",
                "Open Methodology",
              ].map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="text-center border-t border-michigan-teal/20 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">
              Start the Conversation
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Saeb Ahsan, founder, responds within 2 business days.
            </p>
            <p className="text-sm text-michigan-teal-deep font-medium">
              accessmi.org/partnerships/health-systems
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
