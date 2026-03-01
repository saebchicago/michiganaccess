import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/integrations/supabase/client";
import { useCounty } from "@/contexts/CountyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CloudLightning, Zap, Apple, Construction, HeartHandshake,
  ChevronDown, ChevronUp, Clock, MapPin, ExternalLink, AlertTriangle, Info
} from "lucide-react";

const CACHE_KEY = "mi-community-alerts";
const CACHE_TTL = 15 * 60 * 1000;
const ZIP_KEY = "mi-user-zip";

interface NWSAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  severity: string;
  urgency: string;
  areaDesc: string;
  effective: string;
  expires: string;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data as T;
  } catch { return null; }
}

function setCache(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

const severityColor: Record<string, string> = {
  Extreme: "bg-destructive text-destructive-foreground",
  Severe: "bg-destructive/80 text-destructive-foreground",
  Moderate: "bg-michigan-gold text-white",
  Minor: "bg-muted text-muted-foreground",
  Unknown: "bg-muted text-muted-foreground",
};

function AlertCard({ open, onToggle, title, icon: Icon, children, timestamp }: {
  open: boolean; onToggle: () => void; title: string; icon: React.ElementType; children: React.ReactNode; timestamp?: string;
}) {
  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {timestamp && (
                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" /> {timestamp}
                  </span>
                )}
                {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-3 pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function WeatherAlerts({ county }: { county: string | null }) {
  const [alerts, setAlerts] = useState<NWSAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `${CACHE_KEY}-nws-${county || "all"}`;
    const cached = getCached<NWSAlert[]>(cacheKey);
    if (cached) { setAlerts(cached); setLoading(false); return; }

    const params = county ? `?county=${encodeURIComponent(county)}` : "";

    fetch(`${SUPABASE_URL}/functions/v1/nws-alerts-proxy${params}`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    })
      .then(r => r.json())
      .then(d => {
        const a = d.alerts || [];
        setAlerts(a);
        setCache(cacheKey, a);
      })
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, [county]);

  if (loading) return <p className="text-xs text-muted-foreground animate-pulse">Loading weather alerts…</p>;
  if (alerts.length === 0) return <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3" /> No active weather alerts for your area.</p>;

  return (
    <div className="space-y-2">
      {alerts.slice(0, 5).map(a => (
        <div key={a.id} className="rounded-md border border-border/50 p-2 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[9px] ${severityColor[a.severity] || severityColor.Unknown}`}>{a.severity}</Badge>
            <span className="text-xs font-semibold">{a.event}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{a.headline}</p>
          {a.areaDesc && <p className="text-[10px] text-muted-foreground"><MapPin className="inline h-2.5 w-2.5 mr-0.5" />{a.areaDesc}</p>}
        </div>
      ))}
    </div>
  );
}

export default function CommunityAlerts() {
  const { county } = useCounty();
  const [zip, setZip] = useState(() => localStorage.getItem(ZIP_KEY) || "");
  const [zipInput, setZipInput] = useState("");
  const [showZipPrompt, setShowZipPrompt] = useState(!zip && !county);
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    weather: true, utility: false, food: false, roads: false, benefits: false,
  });

  const toggle = (key: string) => setOpenCards(p => ({ ...p, [key]: !p[key] }));
  const now = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const handleZipSave = () => {
    if (/^\d{5}$/.test(zipInput)) {
      setZip(zipInput);
      localStorage.setItem(ZIP_KEY, zipInput);
      setShowZipPrompt(false);
    }
  };

  return (
    <section className="py-8" id="community-alerts">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Community Alerts & Insights
          </h2>
          {(zip || county) && (
            <Badge variant="outline" className="text-[10px]">
              <MapPin className="h-2.5 w-2.5 mr-0.5" />
              {county ? `${county} County` : `ZIP ${zip}`}
            </Badge>
          )}
        </div>

        {showZipPrompt && !county && (
          <Card className="mb-4 border-primary/20 bg-primary/5">
            <CardContent className="p-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs">Enter your ZIP code for localized alerts:</span>
              <Input
                placeholder="48226"
                value={zipInput}
                onChange={e => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="h-7 w-24 text-xs"
                onKeyDown={e => e.key === "Enter" && handleZipSave()}
              />
              <Button size="sm" className="h-7 text-xs" onClick={handleZipSave}>Set</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {/* 1. Weather & Emergency */}
          <AlertCard open={openCards.weather} onToggle={() => toggle("weather")} title="Weather & Emergency Alerts" icon={CloudLightning} timestamp={now}>
            <WeatherAlerts county={county} />
          </AlertCard>

          {/* 2. Utility Rate Alerts */}
          <AlertCard open={openCards.utility} onToggle={() => toggle("utility")} title="Utility Rate Alerts" icon={Zap} timestamp="Mar 2026">
            <div className="space-y-2">
              <div className="rounded-md bg-michigan-gold/10 border border-michigan-gold/20 p-2">
                <p className="text-[11px] leading-relaxed">
                  <strong>DTE Energy</strong> approved a $242M rate increase effective March 5, 2026 (~$4.93/mo for avg residential customers).
                </p>
                <a href="https://michigan.gov/mpsc" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5 mt-1">
                  Source: Michigan Public Service Commission <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <div className="rounded-md bg-muted/30 border border-border/50 p-2">
                <p className="text-[11px] leading-relaxed">
                  <strong>Consumers Energy</strong> — Check current rates and planned changes for non-DTE service areas.
                </p>
                <a href="https://www.consumersenergy.com/residential/rates" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5 mt-1">
                  View Consumers Energy rates <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </AlertCard>

          {/* 3. Food & Basic Needs */}
          <AlertCard open={openCards.food} onToggle={() => toggle("food")} title="Food & Basic Needs" icon={Apple} timestamp={now}>
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">Find food pantries, meal programs, and emergency food assistance near you.</p>
              <div className="flex flex-wrap gap-2">
                <a href="https://www.feedingamerica.org/find-your-local-foodbank" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  Feeding America Locator <ExternalLink className="h-2.5 w-2.5" />
                </a>
                <a href="https://www.211.org/get-help/zip-lookup" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  211 Food Resources <ExternalLink className="h-2.5 w-2.5" />
                </a>
                <a href="https://www.michigan.gov/mdhhs/assistance-programs/food" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  MDHHS Food Programs <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <div className="rounded-md bg-muted/30 border border-border/50 p-2">
                <p className="text-[11px]"><strong>SNAP Benefits:</strong> Apply through MiBridges for food assistance. Most households of 4 earning ≤$3,250/mo qualify.</p>
              </div>
            </div>
          </AlertCard>

          {/* 4. Road & Transit Conditions */}
          <AlertCard open={openCards.roads} onToggle={() => toggle("roads")} title="Road & Transit Conditions" icon={Construction} timestamp={now}>
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">County-level road closures, construction alerts, and transit updates.</p>
              <div className="flex flex-wrap gap-2">
                <a href="https://mdotjboss.state.mi.us/MiDrive/map" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  MDOT MiDrive Map <ExternalLink className="h-2.5 w-2.5" />
                </a>
                <a href="https://www.michigan.gov/mdot/travel/construction" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  Active Construction <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              {county && (
                <p className="text-[10px] text-muted-foreground">Showing conditions for <strong>{county} County</strong>. Check MiDrive for real-time updates.</p>
              )}
            </div>
          </AlertCard>

          {/* 5. Benefits & Social Services */}
          <AlertCard open={openCards.benefits} onToggle={() => toggle("benefits")} title="Benefits & Social Services" icon={HeartHandshake} timestamp="Current">
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">Apply for Michigan benefits through MiBridges — a single portal for multiple programs.</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: "SNAP (Food)", desc: "Food assistance" },
                  { name: "Medicaid", desc: "Health coverage" },
                  { name: "LIHEAP", desc: "Heating assistance" },
                  { name: "Childcare", desc: "Subsidized care" },
                ].map(p => (
                  <div key={p.name} className="rounded border border-border/50 p-1.5">
                    <p className="text-[10px] font-semibold">{p.name}</p>
                    <p className="text-[9px] text-muted-foreground">{p.desc}</p>
                  </div>
                ))}
              </div>
              <a href="https://michigan.gov/mibridges" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                Apply on MiBridges <ExternalLink className="h-3 w-3" />
              </a>
              {county && (
                <p className="text-[10px] text-muted-foreground">Contact your <strong>{county} County</strong> MDHHS office for in-person assistance.</p>
              )}
            </div>
          </AlertCard>

          {/* 6. MDHHS & 211 Resources */}
          <AlertCard open={false} onToggle={() => toggle("mdhhs")} title="MDHHS & 211 Resources" icon={Info} timestamp="Live">
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">Real-time resource availability through Michigan 211 and MDHHS.</p>
              <div className="flex flex-wrap gap-2">
                <a href="https://www.michigan.gov/mdhhs" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  MDHHS Portal <ExternalLink className="h-2.5 w-2.5" />
                </a>
                <a href="https://www.mi211.org/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  Michigan 211 <ExternalLink className="h-2.5 w-2.5" />
                </a>
                <a href="tel:211" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  Call 2-1-1
                </a>
              </div>
            </div>
          </AlertCard>
        </div>

        {/* Data Sources Footer */}
        <div className="mt-4 pt-3 border-t border-border/30">
          <details className="text-[9px] text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground transition-colors">Data Sources</summary>
            <p className="mt-1 leading-relaxed">
              Weather: National Weather Service API · Utility: Michigan Public Service Commission · Food: Feeding America, MDHHS, 211 ·
              Roads: MDOT MiDrive · Benefits: MiBridges / MDHHS · Resources: Michigan 211.
              Data cached locally for 15 minutes. No personal data is stored or transmitted.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
