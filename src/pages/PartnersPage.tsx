import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Users, Map, Shield, ClipboardList, FileText,
  TrendingUp, Heart, Building2, GraduationCap, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import EmbedShowcase from "@/components/partners/EmbedShowcase";
import MetricsAPI from "@/components/partners/MetricsAPI";
import EventCalendarPreview from "@/components/partners/EventCalendarPreview";

const METRICS = [
  { icon: Map, label: "Counties Covered", value: "83/83", trend: "All Michigan counties" },
  { icon: Shield, label: "Community Resources", value: "700+", trend: "Verified & active" },
  { icon: FileText, label: "Live Data Feeds", value: "7", trend: "CDC, CMS, EPA, HRSA, EIA, NHTSA, openFDA" },
  { icon: ClipboardList, label: "Municipalities Tracked", value: "170+", trend: "Governance & FOIA data" },
];

const ILLUSTRATIVE_SCENARIOS = [
  {
    title: "Finding Sliding-Scale Care in Rural Michigan",
    story: "Illustrative scenario: A family in the Upper Peninsula could use Access Michigan to locate the nearest FQHC, discover sliding-scale payment options, and generate an appeal letter if a referral were denied.",
    outcome: "Illustrative — not a real person or observed outcome.",
  },
  {
    title: "Connecting Seniors to Transportation",
    story: "Illustrative scenario: A senior in Genesee County could find non-emergency medical transportation options through the platform to attend regular appointments.",
    outcome: "Illustrative — demonstrates platform capabilities, not measured results.",
  },
  {
    title: "School-Based Health Awareness",
    story: "Illustrative scenario: A parent could use the community program spotlight to find school-based health centers near their children's schools.",
    outcome: "Illustrative — shows possible use case, not a documented outcome.",
  },
];

const PARTNER_CATEGORIES = [
  {
    category: "Health System Partners",
    description: "Community benefit reporting, CHNA data integration, and population health impact tracking",
    examples: ["Regional health systems", "Academic medical centers", "Community hospitals"],
    icon: Heart,
  },
  {
    category: "Innovation & Safety Partners",
    description: "Student transportation safety, digital education platforms, and family communication systems",
    examples: ["School bus safety technology providers", "Digital education platforms"],
    icon: GraduationCap,
  },
];

const PartnersPage = () => {
  usePageMeta({
    title: "Partner Impact Dashboard",
    description:
      "Access Michigan community impact metrics and partnership opportunities for health systems, school districts, and civic technology providers.",
    path: "/partners",
  });

  return (
    <Layout>
      <div className="container py-8 space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Partners" }]} />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Building2 className="h-3 w-3 mr-1" />
            Community Impact
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Partner Impact Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Platform coverage and database metrics for Access Michigan across all 83 counties.
          </p>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover-lift h-full">
                <CardContent className="pt-6 space-y-2">
                  <metric.icon className="h-5 w-5 text-primary" />
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm font-medium text-foreground">{metric.label}</p>
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <TrendingUp className="h-3 w-3" />
                    {metric.trend}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Illustrative scenarios */}
        <section aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="text-2xl font-bold text-foreground mb-6 text-center">
            Illustrative Scenarios
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
            These are <strong>hypothetical examples</strong> showing how residents might use Access Michigan. They are not real people or measured outcomes.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {ILLUSTRATIVE_SCENARIOS.map((story) => (
              <Card key={story.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{story.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{story.story}</p>
                  <div className="bg-accent/5 rounded-lg p-3">
                    <p className="text-sm font-medium text-accent">{story.outcome}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Partner categories */}
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="text-2xl font-bold text-foreground mb-6 text-center">
            Potential Partner Categories
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access Michigan is designed to integrate with health systems and civic technology platforms. These represent partnership categories we're exploring—not current endorsements.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {PARTNER_CATEGORIES.map((cat) => (
              <Card key={cat.category} className="hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <cat.icon className="h-5 w-5 text-primary" />
                    {cat.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.examples.map((example) => (
                      <Badge key={example} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* For Health Systems */}
        <section aria-labelledby="health-systems-heading" className="py-4">
          <div className="text-center mb-8">
            <Badge className="bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20 mb-3">
              <Heart className="h-3 w-3 mr-1" />
              For Healthcare Organizations
            </Badge>
            <h2 id="health-systems-heading" className="text-2xl font-bold text-foreground">
              Amplify Community Benefit Impact
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              See how Access Michigan can support your community health needs assessment, referral intelligence, and population health initiatives.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Referral Analytics",
                description: "Understand which resources residents access in your service area. Identify referral patterns and gaps in the care continuum.",
                bullets: ["Service area resource utilization", "Referral pathway mapping", "Community navigation trends"],
              },
              {
                icon: Map,
                title: "Gap Analysis",
                description: "Identify unmet needs with real usage data across all 83 counties. Pinpoint where services are needed most.",
                bullets: ["County-level shortage identification", "Social determinant mapping", "Service desert detection"],
              },
              {
                icon: TrendingUp,
                title: "Community Benefit ROI",
                description: "Quantify the impact of charity care and SDOH interventions with aggregated, non-identifiable platform data.",
                bullets: ["CHNA data integration", "IRS Schedule H alignment", "Population health benchmarking"],
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover-lift border-michigan-teal/10">
                  <CardHeader className="pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10 text-michigan-teal mb-2">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.bullets.map((b) => (
                        <li key={b} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-michigan-teal/50 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Card className="inline-block border-michigan-teal/20 bg-michigan-teal/5">
              <CardContent className="py-4 px-8 flex flex-col sm:flex-row items-center gap-4">
                <p className="text-sm text-foreground">
                  Ready to explore how Access Michigan can support your community health strategy?
                </p>
                <Button className="bg-michigan-teal hover:bg-michigan-teal/90 text-white shrink-0" asChild>
                  <Link to="/partnerships/health-systems">
                    Schedule Discussion <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Embeddable Widgets */}
        <EmbedShowcase />

        {/* CHNA Data Export */}
        <section aria-labelledby="chna-heading" className="py-4">
          <div className="text-center mb-6">
            <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 mb-3">
              <FileText className="h-3 w-3 mr-1" />
              CHNA-Ready Data
            </Badge>
            <h2 id="chna-heading" className="text-2xl font-bold text-foreground">
              Community Health Needs Assessment Export
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-sm">
              Download anonymized, aggregated platform data formatted for IRS Schedule H reporting and CHNA documentation. No personal data is ever collected or shared.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Resource Gap Analysis", desc: "County-level resource density vs. need indicators across food, housing, transportation, and mental health sectors.", format: "CSV" },
              { title: "Facility Utilization Metrics", desc: "Aggregated page views and referral patterns by facility type and county, benchmarked against state averages.", format: "CSV" },
              { title: "Community Feedback Summary", desc: "Anonymized satisfaction rates and thematic analysis of user feedback by page and sector.", format: "PDF" },
            ].map((item) => (
              <Card key={item.title} className="hover-lift border-michigan-forest/10">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                    <Badge variant="outline" className="text-[10px]">{item.format}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <Link to="/contact?subject=CHNA%20Data%20Request">
                      <FileText className="mr-1.5 h-3 w-3" />Request Export
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-4">
            All exports are strictly anonymized and aggregated. Access Michigan never collects or shares personal health information.
          </p>
        </section>

        {/* Anonymous Metrics */}
        <MetricsAPI />

        {/* Event Calendar */}
        <EventCalendarPreview />

        {/* CTA */}
        <div className="text-center space-y-4 py-8">
          <h3 className="text-xl font-semibold text-foreground">
            Interested in partnering with Access Michigan?
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            We welcome conversations with health systems, school districts, and civic technology providers about community impact collaboration.
          </p>
          <div className="flex justify-center gap-3">
            <Button className="bg-gradient-michigan" asChild>
              <Link to="/partnerships">
                Submit Partnership Inquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">
                <BarChart3 className="h-4 w-4" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PartnersPage;
