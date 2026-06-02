import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import {
  HFH_SYSTEM,
  CHNA_PRIORITIES,
  CHNA_DRIVERS,
  CHNA_METRICS,
  PRIORITY_DRIVER_MAP,
} from "@/data/chnaSeed";
import {
  generateCHNABriefPDF,
  generateCHNABriefText,
} from "@/utils/generateCHNABrief";
import type {
  CHNADomain,
  CHNAGeography,
  CHNAMetric,
  IntegrityLabel,
} from "@/types/chna";
import {
  Download,
  Copy,
  Check,
  ArrowLeft,
  Users,
  Wind,
  Droplets,
  MapPin,
} from "lucide-react";

const DOMAIN_CONFIG: Record<CHNADomain, { label: string; Icon: typeof Users }> =
  {
    workforce: { label: "Workforce and Economic Stability", Icon: Users },
    air: { label: "Air Quality", Icon: Wind },
    water: { label: "Water Quality", Icon: Droplets },
    access: { label: "Healthcare Access", Icon: MapPin },
  };

const INTEGRITY_COLORS: Record<IntegrityLabel, string> = {
  VERIFIED: "text-emerald-700",
  MODELED: "text-sky-700",
  PROJECTED: "text-amber-700",
};

function geoLabel(geography: CHNAGeography, note?: string): string {
  if (note) return note;
  const labels: Record<CHNAGeography, string> = {
    state: "Michigan",
    county: "County",
    city: "City",
    tract: "Census Tract",
  };
  return labels[geography];
}

function ShareMetricRow({ metric }: { metric: CHNAMetric }) {
  const val =
    typeof metric.value === "number"
      ? metric.value.toLocaleString()
      : metric.value;
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-sm font-medium text-foreground">
          {metric.label}
        </span>
        <span className="text-sm font-semibold text-foreground">
          {val}
          {metric.unit}
        </span>
        <Badge variant="outline" className="text-[10px] font-normal">
          {geoLabel(metric.geography, metric.note ?? undefined)}
        </Badge>
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {metric.source}
        {" · "}
        {metric.vintage}
        {" · "}
        <span className={INTEGRITY_COLORS[metric.integrityLabel]}>
          <IntegrityBadge label={metric.integrityLabel} className="inline" />
        </span>
      </p>
    </div>
  );
}

function ShareDomainSection({
  domain,
  priorityId,
}: {
  domain: CHNADomain;
  priorityId: string;
}) {
  const { label, Icon } = DOMAIN_CONFIG[domain];
  const driver = CHNA_DRIVERS.find((d) => d.domain === domain);
  const metrics = CHNA_METRICS.filter(
    (m) => m.priorityId === priorityId && m.driverId === driver?.id,
  );
  if (metrics.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h3>
      </div>
      <div className="rounded-md border border-border bg-muted/20 p-3 space-y-1.5">
        {metrics.map((m) => (
          <ShareMetricRow key={m.id} metric={m} />
        ))}
      </div>
    </div>
  );
}

export function CHNASharePage() {
  const [searchParams] = useSearchParams();
  const priorityId = searchParams.get("priority") ?? CHNA_PRIORITIES[0].id;

  const priority =
    CHNA_PRIORITIES.find((p) => p.id === priorityId) ?? CHNA_PRIORITIES[0];
  const system = HFH_SYSTEM;
  const domains = PRIORITY_DRIVER_MAP[priority.id] ?? [];

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [downloading, setDownloading] = useState(false);

  usePageMeta({
    title: `${priority.label} — CHNA Brief — Access Michigan`,
    description: `${system.label} CHNA priority brief: ${priority.label}. Tract-level SDOH and environmental indicators at neighborhood resolution.`,
    path: "/chna/share",
  });

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function handleCopyText() {
    const text = generateCHNABriefText(priority, system);
    await navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      await generateCHNABriefPDF(priority, system);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-3xl flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/chna-explorer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Full Explorer
            </Link>
            <span className="text-muted-foreground/40" aria-hidden="true">
              |
            </span>
            <span className="text-sm font-medium text-foreground">
              CHNA Brief
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            accessmi.org
          </span>
        </div>
      </header>

      <main className="container max-w-3xl py-8 space-y-6">
        {/* Priority header */}
        <div>
          <Badge
            variant="outline"
            className="mb-2 text-xs uppercase tracking-wider"
          >
            CHNA Priority Brief
          </Badge>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {priority.label}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{system.label}</span>
            <span aria-hidden="true">·</span>
            <span>CHNA {system.vintage}</span>
            <span aria-hidden="true">·</span>
            <span>{system.counties.join(", ")} counties</span>
            <Badge
              variant={
                priority.scope === "enterprise" ? "default" : "secondary"
              }
              className="text-[10px]"
            >
              {priority.scope === "enterprise"
                ? "Enterprise priority"
                : `Site-specific: ${priority.hospitals?.join(", ")}`}
            </Badge>
          </div>
        </div>

        {/* Action bar */}
        <Card className="bg-muted/30">
          <CardContent className="py-3 flex flex-wrap gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              {copiedLink ? (
                <Check
                  className="h-3.5 w-3.5 text-emerald-600"
                  aria-hidden="true"
                />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copiedLink ? "Copied" : "Copy link"}
            </button>
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              {copiedText ? (
                <Check
                  className="h-3.5 w-3.5 text-emerald-600"
                  aria-hidden="true"
                />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copiedText ? "Copied" : "Copy as text"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </CardContent>
        </Card>

        {/* Domain sections with inline provenance */}
        <div className="space-y-5">
          {domains.map((domain) => (
            <ShareDomainSection
              key={domain}
              domain={domain}
              priorityId={priority.id}
            />
          ))}
        </div>

        {/* Provenance note */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Data integrity
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 text-xs text-muted-foreground space-y-1">
            <p>
              Each metric carries its source, vintage, and integrity status
              inline because this view is designed to stand alone without a
              legend.
            </p>
            <div className="grid sm:grid-cols-3 gap-1 mt-2">
              <div className="flex items-start gap-1.5">
                <IntegrityBadge label="VERIFIED" />
                <span>
                  Directly measured from a primary federal or state source.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <IntegrityBadge label="MODELED" />
                <span>
                  Derived from verified inputs via an EPA or FEMA model.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <IntegrityBadge label="PROJECTED" />
                <span>Forward-looking estimate.</span>
              </div>
            </div>
            <p className="pt-1">
              Source: {system.label} CHNA ({system.vintage}), citing BRFSS,
              MDHHS, CDC, MDEQ. Powered by{" "}
              <a
                href="https://accessmi.org"
                className="text-primary hover:underline"
              >
                Access Michigan
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-6">
          <Link to="/chna-explorer" className="text-primary hover:underline">
            Explore the full CHNA dataset
          </Link>
          {" — "}
          <a href="https://accessmi.org" className="hover:underline">
            accessmi.org
          </a>
        </div>
      </main>
    </div>
  );
}
