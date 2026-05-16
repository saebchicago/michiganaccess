import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CommunityResource } from "@/hooks/useCommunityResources";
import type { MichiganRegion } from "@/data/michigan-regions";

interface Props {
  region: MichiganRegion;
  regionResources: CommunityResource[];
  allResources: CommunityResource[];
}

const RESOURCE_TYPES = [
  { key: "food", aliases: ["food", "food_nutrition"], label: "Food & Nutrition", color: "hsl(145, 40%, 30%)" },
  { key: "housing", aliases: ["housing", "housing_shelter"], label: "Housing & Shelter", color: "hsl(215, 65%, 28%)" },
  { key: "transportation", aliases: ["transportation"], label: "Transportation", color: "hsl(186, 50%, 36%)" },
  { key: "mental_health", aliases: ["mental_health", "substance_abuse"], label: "Mental Health", color: "hsl(10, 75%, 60%)" },
  { key: "health", aliases: ["health", "health_services", "health_insurance"], label: "Health Services", color: "hsl(280, 40%, 45%)" },
  { key: "legal", aliases: ["legal", "domestic_violence"], label: "Legal Aid", color: "hsl(30, 70%, 50%)" },
  { key: "education", aliases: ["education", "employment"], label: "Education & Employment", color: "hsl(200, 45%, 40%)" },
  { key: "other", aliases: ["information_referral"], label: "Information & Referral", color: "hsl(0, 0%, 50%)" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
};

export default function ResourceGapAnalysis({ region, regionResources, allResources }: Props) {
  const analysis = useMemo(() => {
    const totalRegions = 6;
    const regionPop = region.counties.length;

    return RESOURCE_TYPES.map(type => {
      const regionCount = regionResources.filter(r => type.aliases.includes(r.resource_type)).length;
      const stateCount = allResources.filter(r => type.aliases.includes(r.resource_type)).length;
      const stateAvgPerRegion = stateCount / totalRegions;
      const countyAvg = regionPop > 0 ? regionCount / regionPop : 0;
      const stateCountyAvg = stateCount / 83; // MI has 83 counties
      const gap = stateAvgPerRegion > 0 ? ((regionCount - stateAvgPerRegion) / stateAvgPerRegion) * 100 : 0;
      const perCapitaGap = stateCountyAvg > 0 ? ((countyAvg - stateCountyAvg) / stateCountyAvg) * 100 : 0;

      return {
        ...type,
        regionCount,
        stateCount,
        stateAvgPerRegion: Math.round(stateAvgPerRegion),
        gap: Math.round(gap),
        perCapitaGap: Math.round(perCapitaGap),
        isUnderserved: gap < -15,
        isStrong: gap > 15,
      };
    }).filter(t => t.stateCount > 0).sort((a, b) => a.gap - b.gap);
  }, [region, regionResources, allResources]);

  const underserved = analysis.filter(a => a.isUnderserved);

  if (analysis.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 text-xl font-bold text-foreground flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-primary" />
        Resource Gap Analysis
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        How this region's resource coverage compares to the statewide average across {region.counties.length} counties.
      </p>

      {underserved.length > 0 && (
        <Card className="mb-4 border-destructive/20 bg-destructive/5">
          <CardContent className="py-3">
            <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              {underserved.length} resource {underserved.length === 1 ? "type" : "types"} underrepresented: {underserved.map(u => u.label).join(", ")}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {analysis.map((item, i) => (
          <motion.div key={item.key} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
            <Card className="h-full">
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      item.isStrong
                        ? "border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
                        : item.isUnderserved
                        ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
                        : ""
                    }`}
                  >
                    {item.gap > 0 ? "+" : ""}{item.gap}% vs avg
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Region: <strong className="text-foreground">{item.regionCount}</strong></span>
                  <span>State avg/region: <strong className="text-foreground">{item.stateAvgPerRegion}</strong></span>
                </div>
                <Progress
                  value={Math.min(100, item.stateAvgPerRegion > 0 ? (item.regionCount / item.stateAvgPerRegion) * 50 : 50)}
                  className="h-1.5"
                />
                {item.isUnderserved && (
                  <p className="text-[10px] text-destructive font-medium">
                    ⚠ {Math.abs(item.gap)}% below statewide average — potential service gap
                  </p>
                )}
                {item.isStrong && (
                  <p className="text-[10px] text-michigan-forest font-medium flex items-center gap-1">
                    <CheckCircle className="h-2.5 w-2.5" /> Strong coverage in this category
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
