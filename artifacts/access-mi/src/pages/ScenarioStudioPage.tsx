import { useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GitCompare,
  Save,
  Share2,
  ArrowRight,
  Info,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import DataProvenance from "@/components/shared/DataProvenance";
import { CLIMATE_SCENARIOS, type ClimateScenarioSeverity } from "@/data/climateScenarios";
import { SERVICE_AREA_TEMPLATES } from "@/data/serviceAreaTemplates";
import { projectClimateScenario } from "@/utils/climateScenarioModel";
import {
  compareScenarioSlots,
  runSeveritySensitivity,
  scenarioSlotsFromSearchParams,
  scenarioSlotsToSearchParams,
  scenarioStudioShareUrl,
  type ScenarioSlot,
} from "@/utils/scenarioStudioModel";
import { useScenarioStudioLibrary } from "@/hooks/useScenarioStudioLibrary";
import { toast } from "sonner";

const COMPARE_COLORS = ["#3b82f6", "#f59e0b"];

function ScenarioPicker({
  label,
  slot,
  onChange,
}: {
  label: string;
  slot: ScenarioSlot;
  onChange: (next: ScenarioSlot) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <select
        className="w-full text-sm border rounded-md px-3 py-2 bg-background"
        value={slot.scenarioId}
        onChange={(e) => onChange({ ...slot, scenarioId: e.target.value })}
        aria-label={`${label} scenario`}
      >
        {CLIMATE_SCENARIOS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        {(["moderate", "severe"] as ClimateScenarioSeverity[]).map((sev) => (
          <Button
            key={sev}
            size="sm"
            variant={slot.severity === sev ? "default" : "outline"}
            className="text-xs capitalize"
            onClick={() => onChange({ ...slot, severity: sev })}
          >
            {sev}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function ScenarioStudioPage() {
  usePageMeta({
    title: "Scenario Planning Studio",
    description:
      "Compare climate and health scenarios side by side with sensitivity analysis and shareable comparison URLs.",
    path: "/scenario-studio",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const initial = scenarioSlotsFromSearchParams(searchParams);
  const [slotA, setSlotA] = useState<ScenarioSlot>(initial.slotA);
  const [slotB, setSlotB] = useState<ScenarioSlot>(initial.slotB);
  const [scopeCounties, setScopeCounties] = useState<string[] | undefined>(
    initial.slotA.counties,
  );
  const [saveName, setSaveName] = useState("");
  const { comparisons, save, remove } = useScenarioStudioLibrary();

  const scopedA = useMemo(
    () => ({ ...slotA, counties: scopeCounties }),
    [slotA, scopeCounties],
  );
  const scopedB = useMemo(
    () => ({ ...slotB, counties: scopeCounties }),
    [slotB, scopeCounties],
  );

  const comparison = useMemo(
    () => compareScenarioSlots(scopedA, scopedB),
    [scopedA, scopedB],
  );

  const projA = useMemo(
    () => projectClimateScenario(scopedA.scenarioId, scopedA.severity, scopeCounties),
    [scopedA, scopeCounties],
  );
  const projB = useMemo(
    () => projectClimateScenario(scopedB.scenarioId, scopedB.severity, scopeCounties),
    [scopedB, scopeCounties],
  );

  const chartData = useMemo(() => {
    const counties = new Set([
      ...projA.slice(0, 8).map((p) => p.county),
      ...projB.slice(0, 8).map((p) => p.county),
    ]);
    return [...counties].map((county) => {
      const a = projA.find((p) => p.county === county);
      const b = projB.find((p) => p.county === county);
      return {
        county,
        scenarioA: a?.projectedVulnerability ?? 0,
        scenarioB: b?.projectedVulnerability ?? 0,
      };
    });
  }, [projA, projB]);

  const sensitivityA = useMemo(
    () => runSeveritySensitivity(scopedA.scenarioId, scopeCounties),
    [scopedA.scenarioId, scopeCounties],
  );

  const syncUrl = useCallback(
    (a: ScenarioSlot, b: ScenarioSlot) => {
      const params = scenarioSlotsToSearchParams(
        { ...a, counties: scopeCounties },
        { ...b, counties: scopeCounties },
      );
      setSearchParams(params, { replace: true });
    },
    [scopeCounties, setSearchParams],
  );

  const handleSlotA = (next: ScenarioSlot) => {
    setSlotA(next);
    syncUrl(next, scopedB);
  };

  const handleSlotB = (next: ScenarioSlot) => {
    setSlotB(next);
    syncUrl(scopedA, next);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${scenarioStudioShareUrl(scopedA, scopedB)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleSave = () => {
    const name =
      saveName.trim() ||
      `Compare ${CLIMATE_SCENARIOS.find((s) => s.id === scopedA.scenarioId)?.title ?? "A"} vs ${CLIMATE_SCENARIOS.find((s) => s.id === scopedB.scenarioId)?.title ?? "B"}`;
    save({ name, slotA: scopedA, slotB: scopedB });
    setSaveName("");
    toast.success(`Saved "${name}"`);
  };

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Tools", href: "/data-explorer" },
          { label: "Scenario Studio" },
        ]}
      />

      <section className="bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 py-12 md:py-16 text-white">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <GitCompare className="h-5 w-5 text-indigo-300" />
              <Badge className="bg-indigo-500/20 text-indigo-100 border-indigo-500/30">
                UC9 Phase 1
              </Badge>
            </div>
            <h1 className="text-3xl font-bold md:text-4xl mb-3">Scenario Planning Studio</h1>
            <p className="text-slate-300 max-w-2xl leading-relaxed">
              Compare climate-health scenarios side by side, run severity sensitivity checks,
              and share comparison URLs. All projections are labeled PROJECTED.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-6">
        <Card className="border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="py-4 flex gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Scenario comparisons use the same county-level model as{" "}
              <Link to="/environment/climate" className="text-primary hover:underline">
                Climate Vulnerability
              </Link>
              . Policy and housing modules can be added in Phase 2.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <ScenarioPicker label="Scenario A" slot={slotA} onChange={handleSlotA} />
          <ScenarioPicker label="Scenario B" slot={slotB} onChange={handleSlotB} />
        </div>

        <Card>
          <CardContent className="py-5 space-y-3">
            <h2 className="text-sm font-bold">Geographic scope (optional)</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setScopeCounties(undefined);
                  syncUrl(scopedA, scopedB);
                }}
              >
                All Michigan counties
              </Button>
              {SERVICE_AREA_TEMPLATES.map((t) => (
                <Button
                  key={t.id}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setScopeCounties(t.counties);
                    const params = scenarioSlotsToSearchParams(
                      { ...scopedA, counties: t.counties },
                      { ...scopedB, counties: t.counties },
                    );
                    setSearchParams(params, { replace: true });
                    toast.success(`Scoped to ${t.label}`);
                  }}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="py-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold">Side-by-side comparison</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleShare}>
                  <Share2 className="h-3 w-3" /> Share
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link to="/environment/climate">
                    Climate module <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 mb-6">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Avg delta A</p>
                <p className="text-xl font-bold font-mono">+{comparison.avgDeltaA}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Top: {comparison.topCountyA ?? "-"}
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-[10px] text-muted-foreground">County overlap</p>
                <p className="text-xl font-bold font-mono">{comparison.countyOverlap}</p>
                <IntegrityBadge
                  label={comparison.integrityLabel}
                  source="Scenario model"
                  vintage="2026"
                />
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Avg delta B</p>
                <p className="text-xl font-bold font-mono">+{comparison.avgDeltaB}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Top: {comparison.topCountyB ?? "-"}
                </p>
              </div>
            </div>

            <div className="h-56 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="county" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={48} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="scenarioA" name="Scenario A" fill={COMPARE_COLORS[0]} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="scenarioB" name="Scenario B" radius={[2, 2, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COMPARE_COLORS[1]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5 space-y-3">
            <h2 className="text-sm font-bold">Sensitivity (Scenario A severity)</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {sensitivityA.map((pt) => (
                <div key={pt.severity} className="rounded-md border px-3 py-2 text-xs">
                  <span className="font-semibold capitalize">{pt.severity}</span>
                  <span className="text-muted-foreground ml-2">
                    avg projected {pt.avgProjected}, delta +{pt.avgDelta}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5 space-y-4">
            <h2 className="text-sm font-bold">Saved comparisons</h2>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                className="text-sm border rounded-md px-3 py-1.5 bg-background flex-1 min-w-[180px]"
                placeholder="Name this comparison..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                aria-label="Comparison save name"
              />
              <Button size="sm" className="gap-1 text-xs" onClick={handleSave}>
                <Save className="h-3 w-3" /> Save local
              </Button>
            </div>
            {comparisons.length > 0 ? (
              <ul className="space-y-2">
                {comparisons.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs"
                  >
                    <span className="font-semibold">{c.name}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        onClick={() => {
                          setSlotA(c.slotA);
                          setSlotB(c.slotB);
                          setScopeCounties(c.slotA.counties);
                          syncUrl(c.slotA, c.slotB);
                          toast.success(`Loaded "${c.name}"`);
                        }}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[10px] text-destructive"
                        onClick={() => {
                          remove(c.id);
                          toast.success("Removed");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-muted-foreground">No saved comparisons yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/cohort-builder">
              <BarChart3 className="h-3 w-3 mr-1" /> Cohort Builder
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/sdoh-risk">SDOH Risk Engine</Link>
          </Button>
        </div>

        <DataProvenance
          source="FEMA NRI, ACEEE LEAD, County Health Rankings"
          updated="2026"
          methodologyHref="/methodology/environmental"
        />
      </div>
    </Layout>
  );
}