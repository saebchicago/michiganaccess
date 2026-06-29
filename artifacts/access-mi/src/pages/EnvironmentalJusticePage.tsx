import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Map, Layers, Info, ArrowRight, Download, FileText, CloudSun } from "lucide-react";
import {
  generateEJPathwayReportPDF,
  downloadEJPathwayReportWord,
} from "@/utils/generateEJPathwayReport";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CausalPathwayCard from "@/components/ej/CausalPathwayCard";
import DataProvenance from "@/components/shared/DataProvenance";
import { CAUSAL_PATHWAYS } from "@/data/causalPathways";
import { MICHIGAN_EJSCREEN } from "@/data/ejscreen";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45 },
  }),
};

const EJSCREEN_ZCTA_COUNT = Object.keys(MICHIGAN_EJSCREEN).length;

export default function EnvironmentalJusticePage() {
  usePageMeta({
    title: "Environmental Justice Pathways",
    description:
      "Verified causal pathways linking environmental burdens, social determinants, and health access across Michigan. Confidence scoring and full source provenance.",
    path: "/environment/justice",
  });

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Environment", href: "/environment" },
          { label: "Environmental Justice" },
        ]}
      />

      <section className="bg-gradient-to-br from-emerald-900/90 via-slate-900 to-slate-950 py-12 md:py-16 text-white">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl"
          >
            <motion.div variants={fade} custom={0} className="mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30">
                UC1 Phase 1
              </Badge>
            </motion.div>
            <motion.h1
              variants={fade}
              custom={1}
              className="mb-4 text-3xl font-bold md:text-4xl"
            >
              Environmental Justice Pathways
            </motion.h1>
            <motion.p variants={fade} custom={2} className="text-slate-300 leading-relaxed">
              Explore how environmental exposures intersect with social determinants
              and health access. Every pathway step cites a named source. Linkage
              language follows strict evidence standards - not every step implies
              causation.
            </motion.p>
            <motion.p
              variants={fade}
              custom={3}
              className="mt-3 text-sm text-slate-400 leading-relaxed"
            >
              AccessMI is an independent civic data platform. Pathways are editorially
              reviewed and do not favor any health system, insurer, or media outlet.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container py-10 space-y-8">
        <Card className="border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="py-4 flex gap-3">
            <Info className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/90 leading-relaxed">
              <p className="font-semibold mb-1">EJScreen coverage note</p>
              <p>
                EPA EJScreen ZCTA data currently covers {EJSCREEN_ZCTA_COUNT} sample
                Michigan ZIP codes while statewide tract ingest is in progress. Map
                layers use county aggregates and other verified sources where tract
                data is not yet available.
              </p>
            </div>
          </CardContent>
        </Card>

        <section aria-labelledby="pathways-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 id="pathways-heading" className="text-xl font-bold">
              Verified pathways
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => generateEJPathwayReportPDF()}
              >
                <Download className="h-3 w-3" /> PDF report
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => downloadEJPathwayReportWord()}
              >
                <FileText className="h-3 w-3" /> Word report
              </Button>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {CAUSAL_PATHWAYS.map((pathway) => (
              <CausalPathwayCard key={pathway.id} pathway={pathway} />
            ))}
          </div>
        </section>

        <section aria-labelledby="maps-heading">
          <h2 id="maps-heading" className="text-xl font-bold mb-4">
            Related map layers
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="py-5 space-y-3">
                <Layers className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Deep Map</h3>
                <p className="text-xs text-muted-foreground">
                  PFAS, energy burden, food access, disaster risk, and broadband layers.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/map/layers">
                    Open layers <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5 space-y-3">
                <Map className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Health Equity Atlas</h3>
                <p className="text-xs text-muted-foreground">
                  EJ index, energy burden, compound deficit, and 7 more equity layers.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/health-equity-atlas">
                    Open atlas <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5 space-y-3">
                <CloudSun className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Climate Scenarios</h3>
                <p className="text-xs text-muted-foreground">
                  Stress-test counties under heat and air quality events with projected bands.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/environment/climate">
                    Open command center <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5 space-y-3">
                <Leaf className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Cohort Builder</h3>
                <p className="text-xs text-muted-foreground">
                  Filter ZIPs by pollution burden, energy cost, and access gaps with shareable URLs.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/cohort-builder">
                    Build cohort <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <DataProvenance
          source="EPA EJScreen, CDC PLACES, ACEEE, HUD CHAS, HRSA GeoCare"
          updated="2026"
          methodologyHref="/methodology"
        />
      </div>
    </Layout>
  );
}