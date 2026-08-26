import { useState } from "react";
import { Check, Download, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import type {
  OpportunityInsight,
  OpportunityPlace,
} from "@/data/opportunityAtlas";
import { buildOpportunityUrl } from "@/lib/opportunityState";
import { trackOpportunityEvent } from "@/lib/opportunityAnalytics";

interface InsightShareCardProps {
  place: OpportunityPlace;
  insight: OpportunityInsight;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(value: string, max = 68): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function buildShareSvg(place: OpportunityPlace, insight: OpportunityInsight, url: string): string {
  const summary = wrapText(insight.summary, 72);
  const summaryTspans = summary
    .map(
      (line, index) =>
        `<tspan x="72" dy="${index === 0 ? 0 : 34}">${xmlEscape(line)}</tspan>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f3e8"/>
  <rect x="0" y="0" width="1200" height="18" fill="#0f4c3a"/>
  <text x="72" y="88" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#0f4c3a">Access Michigan</text>
  <text x="72" y="132" font-family="Arial, sans-serif" font-size="22" fill="#365f54">Community Opportunity Atlas · ${xmlEscape(place.label)}</text>
  <text x="72" y="225" font-family="Georgia, serif" font-size="40" font-weight="700" fill="#173d33">${xmlEscape(insight.title)}</text>
  <text x="72" y="305" font-family="Georgia, serif" font-size="58" font-weight="700" fill="#0f4c3a">${xmlEscape(insight.displayValue)}</text>
  <text x="72" y="365" font-family="Arial, sans-serif" font-size="22" fill="#294d43">${summaryTspans}</text>
  <text x="72" y="520" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="#173d33">${xmlEscape(insight.provenanceLabel)} · ${xmlEscape(insight.source)} · ${xmlEscape(insight.vintage)}</text>
  <text x="72" y="558" font-family="Arial, sans-serif" font-size="17" fill="#49685f">Comparison: ${xmlEscape(insight.benchmark.summary)}</text>
  <text x="72" y="598" font-family="Arial, sans-serif" font-size="17" fill="#49685f">${xmlEscape(url)}</text>
</svg>`;
}

export function InsightShareCard({ place, insight }: InsightShareCardProps) {
  const [copied, setCopied] = useState(false);
  const url = buildOpportunityUrl({
    placeId: place.id,
    metricId: insight.metricId,
  });

  const copy = async () => {
    trackOpportunityEvent("opportunity_share_started", {
      geography_type: place.geographyType,
      place_id: place.id,
      metric_id: insight.metricId,
      channel: "copy",
    });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      trackOpportunityEvent("opportunity_share_completed", {
        geography_type: place.geographyType,
        place_id: place.id,
        metric_id: insight.metricId,
        channel: "copy",
      });
    } catch {
      setCopied(false);
    }
  };

  const nativeShare = async () => {
    trackOpportunityEvent("opportunity_share_started", {
      geography_type: place.geographyType,
      place_id: place.id,
      metric_id: insight.metricId,
      channel: "native",
    });
    if (!navigator.share) {
      await copy();
      return;
    }
    try {
      await navigator.share({
        title: `${place.label}: ${insight.title}`,
        text: `${insight.displayValue} — ${insight.summary}`,
        url,
      });
      trackOpportunityEvent("opportunity_share_completed", {
        geography_type: place.geographyType,
        place_id: place.id,
        metric_id: insight.metricId,
        channel: "native",
      });
    } catch {
      // User cancellation is not an error and should not be counted completed.
    }
  };

  const download = () => {
    const svg = buildShareSvg(place, insight, url);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `accessmi-${place.id}-${insight.metricId}.svg`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    trackOpportunityEvent("opportunity_downloaded", {
      geography_type: place.geographyType,
      place_id: place.id,
      metric_id: insight.metricId,
      channel: "svg",
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {place.label} · {insight.nativeResolution} data
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            {insight.title}
          </h3>
          <p className="mt-2 font-display text-3xl font-bold text-primary">
            {insight.displayValue}
          </p>
        </div>
        <ProvenanceTag
          label={insight.provenanceLabel}
          source={insight.source}
          vintage={insight.vintage}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {insight.summary}
      </p>
      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Comparison: </span>
        {insight.benchmark.summary}
        <span className="ml-1">({insight.benchmark.provenanceLabel})</span>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium text-foreground">
          Why this matters
        </summary>
        <p className="mt-2 text-muted-foreground">{insight.whyItMatters}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Benchmark method: {insight.benchmark.method}
        </p>
      </details>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={copy} className="gap-1.5">
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied" : "Copy finding"}
        </Button>
        <Button variant="outline" size="sm" onClick={nativeShare} className="gap-1.5">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" onClick={download} className="gap-1.5">
          <Download className="h-4 w-4" />
          Download card
        </Button>
      </div>
    </div>
  );
}
