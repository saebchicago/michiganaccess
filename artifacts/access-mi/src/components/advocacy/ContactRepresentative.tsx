/**
 * Contact My Representative — One-Click Advocacy Layer.
 * Maps Michigan ZIP/City to state legislature contacts and generates
 * pre-filled emails with Community Brief pressure data.
 */
import { useMemo, useState } from "react";
import { Mail, ExternalLink, Copy, CheckCircle2, Users, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Place, PlaceIndicator } from "@/models/Place";
import { buildFullIndicators } from "@/models/Place";

// Michigan Legislature lookup (openstates.org public data structure)
const MI_LEGISLATURE_URL = "https://www.legislature.mi.gov/";
const OPENSTATES_FIND = "https://openstates.org/find_your_legislator/";

interface Props {
  place: Place;
}

function buildTopPressures(place: Place): { label: string; deviation: string }[] {
  const indicators = buildFullIndicators(place);
  const pressures: { label: string; deviation: string; pct: number }[] = [];

  for (const ind of indicators) {
    if (ind.numericValue === 0 || ind.stateAvg === 0) continue;
    const diff = ind.numericValue - ind.stateAvg;
    const pct = Math.abs(diff / ind.stateAvg) * 100;
    const isBetter = ind.direction === "lower-is-better" ? diff < 0 : diff > 0;
    if (!isBetter && pct >= 10) {
      const dir = ind.direction === "lower-is-better" ? "higher" : "lower";
      pressures.push({
        label: ind.label,
        deviation: `${pct.toFixed(0)}% ${dir} than the state average`,
        pct,
      });
    }
  }

  return pressures.sort((a, b) => b.pct - a.pct).slice(0, 3);
}

function generateEmailBody(place: Place, pressures: { label: string; deviation: string }[]): string {
  const zip = place.zip || "";
  const areaName = place.city || place.name;

  let body = `Dear Representative,\n\nI am a resident of ${areaName}${zip ? ` (ZIP ${zip})` : ""}, Michigan. `;
  body += `Data from Access Michigan's Community Brief shows our community is currently facing challenges in several areas:\n\n`;

  for (const p of pressures) {
    body += `• ${p.label}: ${p.deviation}\n`;
  }

  body += `\nWhat legislative steps are being taken in the 2026 session to address these concerns for residents in our area?\n\n`;
  body += `I believe every community deserves equitable access to healthcare, housing, and economic opportunity. `;
  body += `I would appreciate a response outlining current and planned initiatives.\n\n`;
  body += `Respectfully,\n[Your Name]\n${areaName}, Michigan${zip ? ` ${zip}` : ""}\n\n`;
  body += `---\nData source: Access Michigan (accessmichigan.org) — a nonprofit civic data platform.`;

  return body;
}

export default function ContactRepresentative({ place }: Props) {
  const pressures = useMemo(() => buildTopPressures(place), [place]);
  const emailBody = useMemo(() => generateEmailBody(place, pressures), [place, pressures]);
  const [copied, setCopied] = useState(false);

  const subject = encodeURIComponent(
    `Community Concerns — ${place.city || place.name}${place.zip ? `, ZIP ${place.zip}` : ""}`
  );
  const body = encodeURIComponent(emailBody);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    toast.success("Email template copied to clipboard");
    setTimeout(() => setCopied(false), 3000);
  };

  // Evidence strength badge — show when any pressure is in bottom 10%
  const evidenceStrength = useMemo(() => {
    const indicators = buildFullIndicators(place);
    let extremeCount = 0;
    for (const ind of indicators) {
      if (ind.numericValue === 0 || ind.stateAvg === 0) continue;
      const diff = ind.numericValue - ind.stateAvg;
      const pct = Math.abs(diff / ind.stateAvg) * 100;
      const isBetter = ind.direction === "lower-is-better" ? diff < 0 : diff > 0;
      if (!isBetter && pct >= 25) extremeCount++;
    }
    if (extremeCount >= 3) return "high";
    if (extremeCount >= 1) return "moderate";
    return null;
  }, [place]);

  if (pressures.length === 0) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Contact Your Representative
          </CardTitle>
          {evidenceStrength && (
            <Badge
              variant="outline"
              className={`text-[10px] transition-transform hover:scale-105 active:scale-95 cursor-default ${
                evidenceStrength === "high"
                  ? "border-red-400/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950"
                  : "border-amber-400/50 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950"
              }`}
            >
              {evidenceStrength === "high" ? "⚡ High Evidence" : "📊 Moderate Evidence"} — data-backed advocacy
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Use data from your Community Brief to advocate for your community.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pressures Summary */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">Key community pressures identified:</p>
          {pressures.map(p => (
            <div key={p.label} className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-[10px] border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                {p.label}
              </Badge>
              <span className="text-muted-foreground">{p.deviation}</span>
            </div>
          ))}
        </div>

        {/* Pre-filled Email Template */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-primary" /> Pre-filled email template:
          </p>
          <Textarea
            readOnly
            value={emailBody}
            className="text-xs min-h-[140px] bg-muted/30 cursor-default"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild className="gap-1.5">
            <a href={`mailto:?subject=${subject}&body=${body}`}>
              <Mail className="h-3.5 w-3.5" /> Open in Email App
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Template"}
          </Button>
          <Button size="sm" variant="ghost" asChild className="gap-1.5">
            <a href={OPENSTATES_FIND} target="_blank" rel="noopener noreferrer">
              <Users className="h-3.5 w-3.5" /> Find My Legislator <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </Button>
        </div>

        {/* Find your rep link */}
        <div className="rounded-md bg-muted/30 border border-border px-3 py-2">
          <p className="text-[10px] text-muted-foreground">
            <strong>Step 1:</strong> Find your state representative at{" "}
            <a href={OPENSTATES_FIND} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              OpenStates.org
            </a>{" "}
            or{" "}
            <a href={MI_LEGISLATURE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              legislature.mi.gov
            </a>.
            <br />
            <strong>Step 2:</strong> Copy the email template above and send it to your representative's contact address.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
