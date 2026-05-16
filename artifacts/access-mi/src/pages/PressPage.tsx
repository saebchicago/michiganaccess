import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, ExternalLink } from "lucide-react";

const FACTS = [
  { label: "Counties Covered", value: "83 / 83" },
  { label: "Resources Indexed", value: "15,000+" },
  { label: "Live API Integrations", value: "18" },
  { label: "Data Sources", value: "35+" },
  { label: "Languages", value: "English, Spanish, Arabic, Bengali" },
  { label: "Cost to Users", value: "Free — No login required" },
  { label: "Personal Data Collected", value: "None" },
  { label: "Live Feeds", value: "AirNow, USGS, NWS, NPPES, FDA" },
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


        {/* Boilerplate */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">About Access Michigan</h2>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access Michigan pulls data from 35+ public sources — CMS hospital ratings, CDC disease prevalence, NWS weather alerts, USGS river monitoring, FDA drug recalls, and more — and organizes it by county so Michigan residents can find healthcare, energy assistance, and community services without creating an account or giving up personal data. It's free, it's independent, and it doesn't take money from health systems.
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
          <p className="text-sm text-muted-foreground">Press inquiries welcome — outreach in progress.</p>
        </section>
      </div>
    </Layout>
  );
}
