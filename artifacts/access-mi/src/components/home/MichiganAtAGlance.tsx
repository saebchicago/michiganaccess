import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BarChart3, Droplets, Heart, ArrowRight, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { RESOURCE_COUNT } from "@/config/platformConstants";

type MetricKey = "uninsured" | "pcp" | "food";

const METRICS: { key: MetricKey; label: string; desc: string }[] = [
  {
    key: "uninsured",
    label: "Uninsured Rate",
    desc: "% of residents without health insurance",
  },
  {
    key: "pcp",
    label: "Primary Care Ratio",
    desc: "Residents per primary care physician",
  },
  {
    key: "food",
    label: "Food Insecurity",
    desc: "% of residents facing food insecurity",
  },
];

function parseMetric(county: string, key: MetricKey): number {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return 0;
  const h = profile.healthHighlights;
  const idx = key === "uninsured" ? 0 : key === "pcp" ? 1 : 2;
  const val = h[idx]?.value || "0";
  if (key === "pcp") {
    const match = val.match(/([\d,]+):1/);
    return match ? parseInt(match[1].replace(",", ""), 10) : 0;
  }
  return parseFloat(val) || 0;
}

function getColor(val: number, key: MetricKey): string {
  if (key === "uninsured") {
    if (val > 8) return "bg-michigan-coral";
    if (val > 5) return "bg-michigan-gold";
    return "bg-michigan-forest";
  }
  if (key === "pcp") {
    if (val > 2000) return "bg-michigan-coral";
    if (val > 1200) return "bg-michigan-gold";
    return "bg-michigan-forest";
  }
  if (val > 16) return "bg-michigan-coral";
  if (val > 12) return "bg-michigan-gold";
  return "bg-michigan-forest";
}

const HIGHLIGHT_COUNTIES = [
  "Wayne",
  "Oakland",
  "Kent",
  "Genesee",
  "Washtenaw",
  "Macomb",
  "Ingham",
  "Kalamazoo",
  "Saginaw",
  "Muskegon",
  "Ottawa",
  "Berrien",
  "Calhoun",
  "Jackson",
  "Livingston",
  "Monroe",
  "Allegan",
  "Eaton",
  "Bay",
  "Midland",
];

const SEARCH_TOPICS = [
  "Food assistance in Wayne County",
  "Mental health in Kent County",
  "SNAP enrollment near 48201",
  "Urgent care in Washtenaw",
  "LIHEAP heating assistance",
  "Prenatal care in Genesee",
  "Dental clinics near me",
  "Housing resources in Oakland",
  "Medicaid enrollment in Ingham",
  "Substance use treatment in Saginaw",
];

export default function MichiganAtAGlance() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("uninsured");

  return (
    <section className="py-12 bg-muted/20 border-y border-border/30">
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Badge
            variant="outline"
            className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary"
          >
            Real data, real-time
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">
            Michigan at a Glance
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Health metrics across all 83 counties - updated from public sources
          </p>
        </motion.div>

        {/* Metric toggle */}
        <div className="flex justify-center gap-2 mb-6">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeMetric === m.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mini heatmap grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-3">
                {METRICS.find((m) => m.key === activeMetric)?.desc} - top 20
                counties by population
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {HIGHLIGHT_COUNTIES.map((county) => {
                  const val = parseMetric(county, activeMetric);
                  const color = getColor(val, activeMetric);
                  const display =
                    activeMetric === "pcp"
                      ? `${(val / 1000).toFixed(1)}K:1`
                      : `${val}%`;
                  return (
                    <Link
                      key={county}
                      to={`/brief?county=${county}`}
                      className="group relative"
                      title={`${county}: ${display}`}
                    >
                      <div
                        className={`aspect-square rounded-md ${color} opacity-70 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                      >
                        <span className="text-[8px] font-bold text-white leading-none text-center px-0.5">
                          {county.slice(0, 4)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-michigan-forest" />{" "}
                    Good
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-michigan-gold" />{" "}
                    Moderate
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-michigan-coral" />{" "}
                    Needs Attention
                  </span>
                </div>
                <Link
                  to="/compare"
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                >
                  Compare all counties <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[
            {
              icon: Heart,
              value: 2400,
              suffix: "+",
              label: "Healthcare providers tracked",
              sub: "CMS, HRSA, Leapfrog quality data",
              color: "text-michigan-coral-deep",
            },
            {
              icon: Droplets,
              value: 200,
              suffix: "+",
              label: "PFAS sites monitored",
              sub: "MPART map · Michigan MCL: PFOA 8 ppt, PFOS 16 ppt (2020)",
              color: "text-michigan-teal-deep",
            },
            {
              icon: Users,
              value: RESOURCE_COUNT,
              suffix: "+",
              label: "Community resources indexed",
              sub: "Food, housing, legal, utilities, health",
              color: "text-primary",
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover-lift">
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <AnimatedCounter
                      value={item.value}
                      suffix={item.suffix}
                      className={`text-2xl font-bold ${item.color}`}
                    />
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search ticker */}
        <div className="overflow-hidden relative">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              What people are searching for
            </span>
          </div>
          <div className="relative overflow-hidden h-7">
            <motion.div
              className="flex gap-4 absolute whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {[...SEARCH_TOPICS, ...SEARCH_TOPICS].map((topic, i) => (
                <span
                  key={`${topic}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground"
                >
                  {topic}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
