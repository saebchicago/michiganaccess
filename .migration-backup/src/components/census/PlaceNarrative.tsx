/**
 * PlaceNarrative — AI-generated Census Reporter-style narrative for a place.
 * Uses live ACS data + Lovable AI to create contextual paragraphs.
 */
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Sparkles, RefreshCw } from "lucide-react";
import { useCensusACS, getCensusValue, formatDollars, formatCount, formatPercent } from "@/hooks/useCensusACS";
import { getCountyFips } from "@/data/census-geographies";
import type { Place } from "@/models/Place";

// Cache narratives per place slug to avoid repeat AI calls
const narrativeCache = new Map<string, string>();

function buildStaticNarrative(place: Place, data: any): string {
  const countyName = place.parentCounty || place.name.replace(/ County$/, "");
  const pop = getCensusValue(data, "B01001", "B01001_001E");
  const income = getCensusValue(data, "B19013", "B19013_001E");
  const own = getCensusValue(data, "B25003", "B25003_002E");
  const rent = getCensusValue(data, "B25003", "B25003_003E");
  const totalHousing = (own || 0) + (rent || 0);
  const ownerPct = totalHousing > 0 ? ((own || 0) / totalHousing * 100).toFixed(0) : "N/A";
  const bachPlus = getCensusValue(data, "B15003", "B15003_022E");
  const totalEd = getCensusValue(data, "B15003", "B15003_001E");
  const bachPct = totalEd && bachPlus ? ((bachPlus / totalEd) * 100).toFixed(1) : "N/A";

  const lines: string[] = [];

  lines.push(
    `${countyName} County is home to ${pop ? formatCount(pop) : "an estimated"} residents, ` +
    `making it ${pop && pop > 500000 ? "one of Michigan's most populous counties" : pop && pop < 30000 ? "one of Michigan's smaller counties" : "a mid-sized Michigan county"}.`
  );

  if (income) {
    const stateMedian = 63498;
    const diff = income - stateMedian;
    const pctDiff = Math.abs(diff / stateMedian * 100).toFixed(0);
    lines.push(
      `The median household income is ${formatDollars(income)}, ` +
      `${diff > 0 ? `about ${pctDiff}% above` : diff < 0 ? `about ${pctDiff}% below` : "roughly equal to"} ` +
      `the statewide median of ${formatDollars(stateMedian)}.`
    );
  }

  if (totalHousing > 0) {
    lines.push(
      `Of the ${formatCount(totalHousing)} occupied housing units, ${ownerPct}% are owner-occupied.`
    );
  }

  if (bachPct !== "N/A") {
    lines.push(
      `Among residents aged 25 and over, ${bachPct}% hold a bachelor's degree or higher.`
    );
  }

  lines.push(
    `Data reflects the 2023 American Community Survey 5-Year Estimates from the U.S. Census Bureau.`
  );

  return lines.join(" ");
}

export default function PlaceNarrative({ place }: { place: Place }) {
  const countyName = place.parentCounty || place.name.replace(/ County$/, "");
  const fips = getCountyFips(countyName);

  const { data, isLoading } = useCensusACS({
    tables: ["B01001", "B19013", "B25003", "B15003"],
    geoType: "county",
    geoFips: fips || "",
    enabled: !!fips,
  });

  const narrative = useMemo(() => {
    if (!data) return null;
    const cached = narrativeCache.get(place.slug);
    if (cached) return cached;
    const text = buildStaticNarrative(place, data);
    narrativeCache.set(place.slug, text);
    return text;
  }, [data, place.slug]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!narrative) return null;

  return (
    <Card className="border-primary/10 bg-gradient-to-br from-primary/3 via-background to-accent/3">
      <CardContent className="py-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Community Profile</h3>
          <Badge variant="outline" className="text-[9px] h-4">ACS 2023</Badge>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{narrative}</p>
        <p className="text-[10px] text-muted-foreground mt-3">
          Source: U.S. Census Bureau, ACS 5-Year Estimates. Auto-generated profile.
        </p>
      </CardContent>
    </Card>
  );
}
