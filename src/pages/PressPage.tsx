import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image, BarChart3, Mail, ExternalLink } from "lucide-react";

const ASSETS = [
  {
    title: "Platform Overview (PDF)",
    description: "Two-page executive summary of Access Michigan — mission, metrics, and partnership model.",
    icon: FileText,
    filename: "Access_Michigan_Overview.pdf",
    size: "2.1 MB",
  },
  {
    title: "Logo & Brand Assets (ZIP)",
    description: "Primary logo, favicon, and color palette in SVG, PNG, and EPS formats.",
    icon: Image,
    filename: "Access_Michigan_Brand_Kit.zip",
    size: "4.8 MB",
  },
  {
    title: "Impact Data Sheet",
    description: "Key statistics: 83 counties, 15K+ resources, equity scoring methodology, and outcomes data.",
    icon: BarChart3,
    filename: "Access_Michigan_Impact_Data.pdf",
    size: "1.3 MB",
  },
];

const FACTS = [
  { label: "Counties Covered", value: "83 / 83" },
  { label: "Resources Indexed", value: "15,000+" },
  { label: "Data Sources", value: "30+ (CMS, HRSA, CDC, NWS, FDA, FEMA, MDHHS, DOE, USGS, AirNow)" },
  { label: "Languages", value: "English, Spanish, Arabic, Bengali" },
  { label: "Cost to Users", value: "Free — No login required" },
  { label: "Personal Data Collected", value: "None" },
  { label: "MI Hospital Community Benefit", value: "$4.5B+ (all systems combined)" },
  { label: "Energy Programs Tracked", value: "LIHEAP, MEAP, MiHER, WAP, MI Saves" },
];

const COVERAGE = [
  { outlet: "Michigan Health & Hospital Association", type: "Industry" },
  { outlet: "Bridge Michigan", type: "News" },
  { outlet: "Michigan Municipal League", type: "Civic" },
];

export default function PressPage() {
  usePageMeta({
    title: "Press & Media Kit",
    description: "Download press assets, platform facts, and media resources for Access Michigan coverage.",
    path: "/press",
    jsonLd: {
      "@type": "WebPage",
      "name": "Press Kit — Access Michigan",
      "url": "https://accessmi.org/press",
    },
  });

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary/8 via-primary/3 to-background py-14">
        <div className="container max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary">
              Press & Media
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">Media Kit</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything journalists, partners, and researchers need to cover Access Michigan.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-3xl py-10 space-y-10">
        {/* Quick Facts */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Facts</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {FACTS.map((f) => (
              <Card key={f.label}>
                <CardContent className="py-3 text-center">
                  <p className="text-lg font-bold text-foreground">{f.value}</p>
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Downloadable Assets */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Downloadable Assets</h2>
          <div className="space-y-3">
            {ASSETS.map((asset) => (
              <Card key={asset.title} className="hover-lift">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <asset.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{asset.title}</h3>
                    <p className="text-xs text-muted-foreground">{asset.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" disabled>
                    <Download className="h-3.5 w-3.5" /> {asset.size}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Press kit files are being finalized. Contact us for early access.
          </p>
        </section>

        {/* Boilerplate */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">About Access Michigan</h2>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access Michigan is an independent, non-commercial civic technology platform that organizes 
                health, housing, food, and family services across all 83 Michigan counties into one structured, 
                accessible interface. The platform integrates real-time data from CMS, HRSA, CDC, and MDHHS 
                to provide equity-weighted search results, quality ratings, and community resource navigation — 
                all without collecting personal data or requiring user accounts.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Media Contact */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Media Contact</h2>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4 flex items-center gap-4">
              <Mail className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Press Inquiries</p>
                <Link to="/contact" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Contact Form <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Coverage */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Coverage & Mentions</h2>
          <div className="space-y-2">
            {COVERAGE.map((c) => (
              <div key={c.outlet} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{c.outlet}</span>
                <Badge variant="secondary" className="text-[10px]">{c.type}</Badge>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Coverage list is illustrative. Platform is in active outreach phase.
          </p>
        </section>
      </div>
    </Layout>
  );
}
