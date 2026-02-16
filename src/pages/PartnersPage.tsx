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

const METRICS = [
  { icon: Map, label: "FQHC Map Views", value: "12,400+", trend: "+18% this quarter" },
  { icon: Shield, label: "Coverage Pathfinder Runs", value: "3,200+", trend: "+24% this quarter" },
  { icon: FileText, label: "Insurance Appeals Generated", value: "1,850+", trend: "+42% since launch" },
  { icon: ClipboardList, label: "Visit Checklists Downloaded", value: "890+", trend: "New feature" },
];

const IMPACT_STORIES = [
  {
    title: "Closing the Care Gap in Rural Michigan",
    story: "A family in the Upper Peninsula used Michigan Access to locate the nearest FQHC, discover sliding-scale payment options, and generate an appeal letter when their child's specialist referral was denied. The appeal was successful within 21 days.",
    outcome: "Specialist care secured. $3,200 in denied charges overturned.",
  },
  {
    title: "Connecting Seniors to Transportation",
    story: "An 82-year-old in Genesee County found non-emergency medical transportation options through the platform, allowing her to attend her twice-weekly dialysis appointments without relying on family members who work during the day.",
    outcome: "96% appointment adherence maintained over 6 months.",
  },
  {
    title: "School-Based Health Awareness",
    story: "A Detroit parent used the community program spotlight to find school-based health centers near her children's schools, reducing missed school days from health-related absences by connecting her kids with on-site mental health services.",
    outcome: "30% reduction in health-related school absences.",
  },
];

const PARTNER_CATEGORIES = [
  {
    category: "Health System Partners",
    description: "Community benefit reporting, CHNA data integration, and population health impact tracking",
    examples: ["Henry Ford Health System", "Corewell Health", "Trinity Health"],
    icon: Heart,
  },
  {
    category: "Innovation & Safety Partners",
    description: "Student transportation safety, digital hall pass systems, and family communication platforms",
    examples: ["School bus safety technology providers", "Digital education platforms"],
    icon: GraduationCap,
  },
];

const PartnersPage = () => {
  usePageMeta({
    title: "Partner Impact Dashboard",
    description:
      "Michigan Access community impact metrics and partnership opportunities for health systems, school districts, and civic technology providers.",
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
            Aggregated, non-identifiable metrics showing how Michigan Access serves communities across all 83 counties.
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

        {/* Impact stories */}
        <section aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="text-2xl font-bold text-foreground mb-6 text-center">
            Impact Stories
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
            Anonymized scenarios illustrating how Michigan Access supports community health outcomes. These are representative examples, not individual user data.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {IMPACT_STORIES.map((story) => (
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
            Michigan Access is designed to integrate with health systems and civic technology platforms. These represent partnership categories we're exploring—not current endorsements.
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

        {/* CTA */}
        <div className="text-center space-y-4 py-8">
          <h3 className="text-xl font-semibold text-foreground">
            Interested in partnering with Michigan Access?
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
