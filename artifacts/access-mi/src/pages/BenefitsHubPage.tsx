import { useState } from "react";
import { motion } from "framer-motion";
import { Map as MapIcon, ShieldCheck, TrendingUp, Info } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { LifeStageMap } from "@/components/benefits/LifeStageMap";
import { BenefitsScreener } from "@/components/benefits/BenefitsScreener";
import { CliffExplainer } from "@/components/benefits/CliffExplainer";
import { OFFICIAL_MI_BRIDGES_URL } from "@/data/benefitsRules";

type HubTab = "map" | "screener" | "cliff";

interface HubTool {
  id: HubTab;
  title: string;
  blurb: string;
  icon: typeof MapIcon;
}

const TOOLS: HubTool[] = [
  {
    id: "map",
    title: "Life-stage benefits map",
    blurb:
      "What unlocks when. Pregnancy, a new baby, job loss, turning 65, aging or disability. Every entry sourced.",
    icon: MapIcon,
  },
  {
    id: "screener",
    title: "Am I eligible?",
    blurb:
      "A quick preliminary estimate against 2026 income rules. Final eligibility is decided by the program.",
    icon: ShieldCheck,
  },
  {
    id: "cliff",
    title: "Will a raise help?",
    blurb:
      "Plain-language explanation of benefits cliffs, with a link to the Atlanta Fed's CLIFF calculator.",
    icon: TrendingUp,
  },
];

export default function BenefitsHubPage() {
  usePageMeta({
    title: "Benefits & Decisions - Access Michigan",
    description:
      "Sourced life-stage benefits map, a preliminary eligibility screener, and a benefits-cliff explainer. Informational only. Eligibility is decided by the program.",
    path: "/benefits",
  });

  const [tab, setTab] = useState<HubTab>("map");

  return (
    <Layout>
      <div className="container pt-6">
        <Breadcrumbs items={[{ label: "Benefits & Decisions" }]} />
      </div>

      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge
              variant="outline"
              className="mb-3 uppercase tracking-wider text-xs"
            >
              Benefits & Decisions
            </Badge>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              What you may qualify for, in plain language
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-sm text-muted-foreground">
              Three tools, one page. Every income limit is sourced to a federal
              or state primary source. Nothing here is a determination, and
              nothing is stored.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <motion.button
              key={tool.id}
              type="button"
              onClick={() => setTab(tool.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              aria-pressed={tab === tool.id}
              className={`text-left rounded-xl border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                tab === tool.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <tool.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-foreground">
                {tool.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{tool.blurb}</p>
            </motion.button>
          ))}
        </div>

        <Card className="border-muted bg-muted/30">
          <CardContent className="flex items-start gap-2 py-4 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              These tools are informational. They are not a determination of
              eligibility, not financial advice, and not legal advice. The
              official Michigan application portal is{" "}
              <a
                href={OFFICIAL_MI_BRIDGES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                MI Bridges (newmibridges.michigan.gov)
              </a>
              . For help filling out an application, call 211.
            </p>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={(v) => setTab(v as HubTab)}>
          <TabsList className="grid grid-cols-3">
            {TOOLS.map((tool) => (
              <TabsTrigger
                key={tool.id}
                value={tool.id}
                className="text-xs sm:text-sm min-h-11"
              >
                {tool.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="map" className="mt-4">
            <LifeStageMap />
          </TabsContent>
          <TabsContent value="screener" className="mt-4">
            <BenefitsScreener />
          </TabsContent>
          <TabsContent value="cliff" className="mt-4">
            <CliffExplainer />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
