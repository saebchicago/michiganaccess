import { motion } from "framer-motion";
import { Clock, CheckCircle2, Zap, Database, Globe, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const updates = [
  {
    date: "2026-02-14",
    version: "1.4.0",
    icon: Database,
    color: "text-michigan-teal",
    title: "Live API Integration - HRSA & CDC",
    items: [
      "Added HRSA health center proxy for live Federally Qualified Health Center data",
      "Added CDC PLACES & Chronic Disease Indicator proxy for county-level health metrics",
      "All API proxies include fallback error messages and 1-hour caching",
    ],
  },
  {
    date: "2026-02-14",
    version: "1.3.0",
    icon: Globe,
    color: "text-michigan-blue",
    title: "Embeddable Widgets for County Spin-offs",
    items: [
      "Created /embed route with lightweight, iframe-ready quick-search widget",
      "Counties and organizations can embed Access Michigan search on their own sites",
      "Widget adapts to container size with responsive design",
    ],
  },
  {
    date: "2026-02-14",
    version: "1.2.0",
    icon: Shield,
    color: "text-michigan-forest",
    title: "Partnership Portal & i18n",
    items: [
      "Partnership submission form with moderation queue (Supabase-backed)",
      "English/Spanish language toggle across all pages",
      "High-contrast accessibility mode with localStorage persistence",
      "Crisis bar with 988 and 2-1-1 quick access",
    ],
  },
  {
    date: "2026-02-13",
    version: "1.1.0",
    icon: Zap,
    color: "text-michigan-gold",
    title: "Core Platform Launch",
    items: [
      "Interactive health map with Leaflet.js and facility markers",
      "Find Care directory with filters, comparison, and provider search",
      "Financial Help hub with FPL eligibility screener",
      "Health Data Dashboard with Recharts visualizations",
      "Cost Transparency tool with procedure and Rx price comparison",
      "Transportation resources with safety data and charts",
      "Environment dashboard with AQI, water quality, and energy data",
      "CMS Open Data proxy edge function for hospital data",
    ],
  },
  {
    date: "2026-02-12",
    version: "1.0.0",
    icon: CheckCircle2,
    color: "text-primary",
    title: "Initial Prototype",
    items: [
      "Access Michigan branding and Michigan-themed design system",
      "Responsive layout with Tailwind CSS semantic tokens",
      "SEO meta tags, JSON-LD structured data, Open Graph",
      "Supabase backend with RLS-protected public data tables",
      "Rate-limited query edge function for abuse prevention",
    ],
  },
];

export default function UpdateLog() {
  return (
    <section className="py-10">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Platform Update Log</h2>
      </div>
      <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
        {updates.map((update, i) => (
          <motion.div
            key={update.version}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="absolute left-0 mt-1.5 h-4 w-4 rounded-full border-2 border-background bg-primary" style={{ marginLeft: "0.03rem" }} />
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <update.icon className={`h-4 w-4 ${update.color}`} />
                  <span className="font-semibold text-foreground text-sm">{update.title}</span>
                  <Badge variant="outline" className="text-[10px]">v{update.version}</Badge>
                  <span className="text-[10px] text-muted-foreground">{update.date}</span>
                </div>
                <ul className="space-y-1">
                  {update.items.map((item, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
