import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EMBEDS = [
  {
    title: "IHME GBD Compare — Disease Burden Explorer",
    description: "Compare Michigan-specific disease burden, risk factors, and mortality trends against national and global benchmarks. Use the GBD Compare tool to explore age-standardized rates for conditions like cardiovascular disease, diabetes, and substance use disorders.",
    src: "https://vizhub.healthdata.org/gbd-compare/",
    source: "University of Washington IHME",
    sourceUrl: "https://www.healthdata.org/research-analysis/gbd",
    fullSiteUrl: "https://vizhub.healthdata.org/gbd-compare/",
    fullSiteLabel: "Open full IHME GBD Compare in new tab",
  },
  {
    title: "CDC NCHS — Vital Statistics Rapid Release",
    description: "Provisional vital statistics including birth, death, and infant mortality data with interactive county-level breakdowns from the National Center for Health Statistics.",
    src: "https://www.cdc.gov/nchs/nvss/vsrr.htm",
    source: "CDC National Center for Health Statistics",
    sourceUrl: "https://www.cdc.gov/nchs/",
    fullSiteUrl: "https://www.cdc.gov/nchs/nvss/vsrr.htm",
    fullSiteLabel: "Open CDC NCHS Vital Statistics in new tab",
  },
];

export default function ExternalEmbeds() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Interactive Research Dashboards</h2>
        <p className="text-sm text-muted-foreground">
          Explore disease burden and vital statistics through trusted public health data portals. These tools support deep-dive analysis for researchers, health systems, and CHNA partners.
        </p>
      </div>
      {EMBEDS.map((embed) => (
        <Card key={embed.title} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              {embed.title}
              <Badge variant="outline" className="text-[10px] font-normal">External Tool</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">{embed.description}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30" style={{ height: 480 }}>
              <iframe
                src={embed.src}
                title={embed.title}
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-popups"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-4">
              <a
                href={embed.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {embed.source}
              </a>
              <a
                href={embed.fullSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {embed.fullSiteLabel}
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
