import { useState } from "react";
import { motion } from "framer-motion";
import { Map as MapIcon, ShieldCheck, TrendingUp } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { LifeStageMap } from "@/components/benefits/LifeStageMap";
import { BenefitsScreener } from "@/components/benefits/BenefitsScreener";
import { CliffExplainer } from "@/components/benefits/CliffExplainer";
import { OfficialChannelNotice } from "@/components/shared/OfficialChannelNotice";

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
    title: "When benefits unlock",
    blurb: "Pregnancy, new baby, job loss, turning 65, disability. Sourced.",
    icon: MapIcon,
  },
  {
    id: "screener",
    title: "Check your income band",
    blurb:
      "2026 federal and Michigan rules. Informational only. The program decides.",
    icon: ShieldCheck,
  },
  {
    id: "cliff",
    title: "Will a raise cost you benefits?",
    blurb: "The cliff explained, with the Atlanta Fed's CLIFF calculator.",
    icon: TrendingUp,
  },
];

export default function BenefitsHubPage() {
  usePageMeta({
    title: "Benefits Education - Access Michigan",
    description:
      "Educational explainers of Michigan benefit programs: a sourced life-stage map, how eligibility rules work, and a benefits-cliff explainer. Informational only. Eligibility is decided by the program.",
    path: "/benefits",
  });

  const [tab, setTab] = useState<HubTab>("map");

  return (
    <Layout>
      <div className="container pt-6">
        <Breadcrumbs items={[{ label: "Benefits Education" }]} />
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
              Benefits Education
            </Badge>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              See what you qualify for.
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-sm text-muted-foreground">
              No account. No stored answers. Not a decision. Every income limit
              VERIFIED to a primary source.
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

        <OfficialChannelNotice />
        <p className="px-1 text-[11px] text-muted-foreground">
          These tools are informational. They are not a determination of
          eligibility, not financial advice, and not legal advice. For help
          filling out an application, call 211.
        </p>

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
