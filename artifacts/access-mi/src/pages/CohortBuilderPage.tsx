import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Filter,
  Download,
  Share2,
  MapPin,
  Info,
  ArrowRight,
  Save,
  Trash2,
  FileJson,
  CloudUpload,
  BarChart3,
  BookOpen,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import DataProvenance from "@/components/shared/DataProvenance";
import {
  filterCohort,
  COHORT_PRESETS,
  criteriaToSearchParams,
  criteriaFromSearchParams,
  type CohortCriteria,
  type ZipCohortProfile,
} from "@/utils/cohortFilter";

function hasActiveNumericFilters(criteria: CohortCriteria): boolean {
  return (
    criteria.minEjIndex !== undefined ||
    criteria.minPm25Percentile !== undefined ||
    criteria.minEnergyBurdenPct !== undefined ||
    criteria.minUninsuredRate !== undefined ||
    criteria.minPcpRatio !== undefined ||
    criteria.minPovertyRate !== undefined
  );
}
import { SERVICE_AREA_TEMPLATES } from "@/data/serviceAreaTemplates";
import { useCohortLibrary } from "@/hooks/useCohortLibrary";
import {
  publishCohortToCloud,
  loadCohortFromCloud,
  cohortShareUrl,
  isValidShareId,
} from "@/Services/cohortCloudSync";
import { supabaseConfigured } from "@/integrations/supabase/client";
import { downloadTableauCohortCsv } from "@/utils/exportCohortTableau";
import { downloadExcelCohortCsv } from "@/utils/exportCohortExcel";
import { downloadPowerBiCohortPackage } from "@/utils/exportCohortPowerBi";
import { downloadCohortNotebook } from "@/utils/generateCohortNotebook";
import CohortWorkspacePanel from "@/components/cohort/CohortWorkspacePanel";
import { toast } from "sonner";

const FILTER_FIELDS: {
  key: keyof CohortCriteria;
  paramKey: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  note?: string;
}[] = [
  {
    key: "minEjIndex",
    paramKey: "ej",
    label: "Min EJ index",
    min: 0,
    max: 100,
    step: 5,
    unit: "",
    note: "Requires direct EJScreen ZIP data. ZIPs without coverage are excluded.",
  },
  {
    key: "minPm25Percentile",
    paramKey: "pm25",
    label: "Min PM2.5 percentile",
    min: 0,
    max: 100,
    step: 5,
    unit: "",
    note: "EPA EJScreen national percentile. ZIP-level only.",
  },
  {
    key: "minEnergyBurdenPct",
    paramKey: "energy",
    label: "Min energy burden",
    min: 0,
    max: 15,
    step: 0.5,
    unit: "%",
    note: "County-allocated ACEEE average burden.",
  },
  {
    key: "minUninsuredRate",
    paramKey: "uninsured",
    label: "Min uninsured rate",
    min: 0,
    max: 30,
    step: 1,
    unit: "%",
    note: "County Health Rankings allocated to ZIP.",
  },
  {
    key: "minPcpRatio",
    paramKey: "pcp",
    label: "Min PCP ratio",
    min: 500,
    max: 8000,
    step: 100,
    unit: ":1",
    note: "Higher ratio = fewer providers per population.",
  },
  {
    key: "minPovertyRate",
    paramKey: "poverty",
    label: "Min poverty rate",
    min: 0,
    max: 40,
    step: 1,
    unit: "%",
    note: "ACS county estimate allocated to ZIP.",
  },
];

function MetricCell({
  metric,
}: {
  metric: ZipCohortProfile["metrics"][keyof ZipCohortProfile["metrics"]];
}) {
  return (
    <td className="py-2 px-2 text-right">
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-mono text-xs">{metric.display}</span>
        {metric.value != null && (
          <IntegrityBadge
            label={metric.integrityLabel}
            source={metric.source}
            vintage={metric.vintage}
          />
        )}
      </div>
    </td>
  );
}

export default function CohortBuilderPage() {
  usePageMeta({
    title: "Cohort Builder",
    description:
      "Filter Michigan ZIP codes by environmental burden, health access, and SDOH criteria. Shareable URLs and CSV export with full provenance.",
    path: "/cohort-builder",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [criteria, setCriteria] = useState<CohortCriteria>(() =>
    criteriaFromSearchParams(searchParams),
  );
  const { cohorts: savedCohorts, save: saveCohort, remove: removeCohort } =
    useCohortLibrary();
  const [saveName, setSaveName] = useState("");
  const loadedShareRef = useRef<string | null>(null);

  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const fromUrl = criteriaFromSearchParams(searchParams);
    const init: Record<string, boolean> = {};
    for (const f of FILTER_FIELDS) {
      init[f.key] = fromUrl[f.key] !== undefined;
    }
    return init;
  });

  const shareIdParam = searchParams.get("share");

  useEffect(() => {
    if (!shareIdParam || !isValidShareId(shareIdParam)) return;
    if (loadedShareRef.current === shareIdParam) return;

    let cancelled = false;
    loadCohortFromCloud(shareIdParam).then((snapshot) => {
      if (cancelled || !snapshot) {
        if (!cancelled) toast.error("Shared cohort not found or cloud sync unavailable");
        return;
      }
      loadedShareRef.current = shareIdParam;
      setCriteria(snapshot.criteria);
      setEnabled(snapshot.enabled);
      toast.success(`Loaded shared cohort: ${snapshot.name}`);
    });
    return () => {
      cancelled = true;
    };
  }, [shareIdParam]);

  useEffect(() => {
    if (shareIdParam) return;

    const active: CohortCriteria = { counties: criteria.counties };
    for (const f of FILTER_FIELDS) {
      if (enabled[f.key] && criteria[f.key] !== undefined) {
        (active as Record<string, unknown>)[f.key] = criteria[f.key];
      }
    }
    setSearchParams(criteriaToSearchParams(active), { replace: true });
  }, [criteria, enabled, setSearchParams, shareIdParam]);

  const activeCriteria = useMemo(() => {
    const active: CohortCriteria = { counties: criteria.counties };
    for (const f of FILTER_FIELDS) {
      if (enabled[f.key]) {
        const val = criteria[f.key];
        if (val !== undefined) (active as Record<string, unknown>)[f.key] = val;
      }
    }
    return active;
  }, [criteria, enabled]);

  const results = useMemo(
    () => filterCohort(activeCriteria),
    [activeCriteria],
  );

  const applyPreset = useCallback((presetId: string) => {
    const preset = COHORT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const nextEnabled: Record<string, boolean> = {};
    for (const f of FILTER_FIELDS) nextEnabled[f.key] = false;
    const nextCriteria: CohortCriteria = { ...preset.criteria };
    for (const f of FILTER_FIELDS) {
      if (preset.criteria[f.key] !== undefined) nextEnabled[f.key] = true;
    }
    setCriteria(nextCriteria);
    setEnabled(nextEnabled);
    toast.success(`Loaded preset: ${preset.label}`);
  }, []);

  const loadRegion = useCallback((counties: string[], label: string) => {
    setCriteria((prev) => ({ ...prev, counties }));
    toast.success(`Scoped to ${label}`);
  }, []);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Cohort link copied");
    });
  }, []);

  const handlePublishCloud = useCallback(async () => {
    if (!supabaseConfigured) {
      toast.error("Cloud publish requires Supabase configuration");
      return;
    }
    if (!hasActiveNumericFilters(activeCriteria)) {
      toast.error("Enable at least one filter before publishing");
      return;
    }
    const name = saveName.trim() || `Cohort ${new Date().toLocaleDateString()}`;
    try {
      const snapshot = await publishCohortToCloud({
        name,
        criteria: activeCriteria,
        enabled,
        resultCount: results.length,
      });
      const url = cohortShareUrl(snapshot.shareId);
      await navigator.clipboard.writeText(url);
      toast.success("Published to cloud - share link copied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cloud publish failed");
    }
  }, [saveName, activeCriteria, enabled, results.length]);

  const handleSave = useCallback(() => {
    const name = saveName.trim() || `Cohort ${new Date().toLocaleDateString()}`;
    if (!hasActiveNumericFilters(activeCriteria)) {
      toast.error("Enable at least one filter before saving");
      return;
    }
    saveCohort({
      name,
      criteria: activeCriteria,
      enabled,
      resultCount: results.length,
    });
    setSaveName("");
    toast.success(`Saved "${name}"`);
  }, [saveName, activeCriteria, enabled, results.length, saveCohort]);

  const loadSaved = useCallback(
    (id: string) => {
      const saved = savedCohorts.find((c) => c.id === id);
      if (!saved) return;
      setCriteria(saved.criteria);
      setEnabled(saved.enabled);
      toast.success(`Loaded "${saved.name}"`);
    },
    [savedCohorts],
  );

  const handleJson = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      criteria: activeCriteria,
      resultCount: results.length,
      zips: results.map((r) => ({
        zip: r.zip,
        city: r.city,
        county: r.county,
        metrics: Object.fromEntries(
          Object.entries(r.metrics).map(([k, m]) => [
            k,
            {
              value: m.value,
              integrity: m.integrityLabel,
              source: m.source,
            },
          ]),
        ),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cohort-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeCriteria, results]);

  const handleTableau = useCallback(() => {
    downloadTableauCohortCsv({
      name: saveName.trim() || `Cohort ${new Date().toLocaleDateString()}`,
      criteria: activeCriteria,
      results,
    });
    toast.success("Tableau CSV downloaded");
  }, [saveName, activeCriteria, results]);

  const handleExcel = useCallback(() => {
    downloadExcelCohortCsv({
      name: saveName.trim() || `Cohort ${new Date().toLocaleDateString()}`,
      criteria: activeCriteria,
      results,
    });
    toast.success("Excel CSV downloaded");
  }, [saveName, activeCriteria, results]);

  const handlePowerBi = useCallback(() => {
    downloadPowerBiCohortPackage({
      name: saveName.trim() || `Cohort ${new Date().toLocaleDateString()}`,
      criteria: activeCriteria,
      results,
    });
    toast.success("Power BI package downloaded");
  }, [saveName, activeCriteria, results]);

  const handleNotebook = useCallback(() => {
    downloadCohortNotebook({
      name: saveName.trim() || `Cohort ${new Date().toLocaleDateString()}`,
      criteria: activeCriteria,
      results,
      includePathways: true,
    });
    toast.success("Jupyter notebook downloaded");
  }, [saveName, activeCriteria, results]);

  const handleCsv = useCallback(() => {
    const headers = [
      "ZIP",
      "City",
      "County",
      "EJ Index",
      "PM2.5 %ile",
      "Energy Burden %",
      "Uninsured %",
      "PCP Ratio",
      "Poverty %",
    ];
    const rows = results.map((r) => [
      r.zip,
      r.city,
      r.county,
      r.metrics.ej_index.display,
      r.metrics.pm25_percentile.display,
      r.metrics.energy_burden_pct.display,
      r.metrics.uninsured_rate.display,
      r.metrics.pcp_ratio.display,
      r.metrics.poverty_rate.display,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cohort-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <Layout>
      <Breadcrumbs
        items={[
          { label: "Data & Insights", href: "/data-and-insights" },
          { label: "Cohort Builder" },
        ]}
      />

      <section className="bg-gradient-to-br from-primary/8 via-background to-accent/5 py-10 md:py-14">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-xs">
                UC8 Phase 1
              </Badge>
            </div>
            <h1 className="text-3xl font-bold md:text-4xl mb-2">
              Cohort Builder
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Filter Michigan ZIP codes by environmental burden, health access,
              and poverty criteria. Export to Tableau, Excel, Power BI, or Jupyter.
              Query via POST <code className="text-xs">/.netlify/functions/cohort-query</code>.
              EJScreen filters apply only where ZIP-level data exists.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-8 space-y-6">
        <Card className="border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="py-4 flex gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              County-allocated metrics are labeled <strong>modeled</strong>.
              EJScreen metrics are <strong>verified</strong> only for ZIPs in the
              current EJScreen seed. Expand coverage with{" "}
              <code className="text-xs">scripts/ingest-ejscreen-csv.mjs</code>{" "}
              (manual EPA CSV) or{" "}
              <code className="text-xs">scripts/build-ejscreen-zcta.mjs</code>{" "}
              (ArcGIS).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5 space-y-4">
            <h2 className="text-sm font-bold">Preset cohorts</h2>
            <div className="flex flex-wrap gap-2">
              {COHORT_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {COHORT_PRESETS.map((p) => p.description).join(" ")}
            </p>
          </CardContent>
        </Card>

        {shareIdParam && isValidShareId(shareIdParam) && (
          <CohortWorkspacePanel
            shareId={shareIdParam}
            activeCriteria={activeCriteria}
            enabled={enabled}
            resultCount={results.length}
            onLoadVersion={(criteria, nextEnabled) => {
              setCriteria(criteria);
              setEnabled(nextEnabled);
              toast.success("Loaded workspace version");
            }}
          />
        )}

        <Card>
          <CardContent className="py-5 space-y-4">
            <h2 className="text-sm font-bold">Saved cohorts</h2>
            <p className="text-xs text-muted-foreground">
              Save locally (up to 20) or publish to cloud for a cross-device
              share link. Cloud cohorts use an unlisted UUID URL.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                className="text-sm border rounded-md px-3 py-1.5 bg-background flex-1 min-w-[180px]"
                placeholder="Name this cohort..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                aria-label="Cohort save name"
              />
              <Button
                size="sm"
                variant="default"
                className="gap-1 text-xs"
                onClick={handleSave}
              >
                <Save className="h-3 w-3" /> Save local
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs"
                onClick={handlePublishCloud}
                disabled={!supabaseConfigured}
              >
                <CloudUpload className="h-3 w-3" /> Publish cloud
              </Button>
            </div>
            {savedCohorts.length > 0 ? (
              <ul className="space-y-2">
                {savedCohorts.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {c.resultCount} ZIPs - {new Date(c.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        onClick={() => loadSaved(c.id)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[10px] text-destructive"
                        onClick={() => {
                          removeCohort(c.id);
                          toast.success("Removed saved cohort");
                        }}
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No saved cohorts yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5 space-y-3">
            <h2 className="text-sm font-bold">Geographic scope (optional)</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setCriteria((p) => ({ ...p, counties: undefined }))}
              >
                All Michigan ZIPs
              </Button>
              {SERVICE_AREA_TEMPLATES.map((t) => (
                <Button
                  key={t.id}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => loadRegion(t.counties, t.label)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
            {criteria.counties && (
              <p className="text-[10px] text-muted-foreground">
                Scoped to: {criteria.counties.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5 space-y-6">
            <h2 className="text-sm font-bold">Filter criteria</h2>
            {FILTER_FIELDS.map((field) => {
              const value =
                (criteria[field.key] as number | undefined) ??
                (field.key === "minPcpRatio" ? 1500 : field.min);
              return (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={enabled[field.key] ?? false}
                        onChange={(e) =>
                          setEnabled((prev) => ({
                            ...prev,
                            [field.key]: e.target.checked,
                          }))
                        }
                        className="rounded border-border"
                      />
                      {field.label}
                      {enabled[field.key] && (
                        <span className="font-mono text-xs text-primary">
                          {field.key === "minPcpRatio"
                            ? `>= ${value}${field.unit}`
                            : `>= ${value}${field.unit}`}
                        </span>
                      )}
                    </label>
                  </div>
                  {enabled[field.key] && (
                    <>
                      <Slider
                        value={[value]}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        onValueChange={([v]) =>
                          setCriteria((prev) => ({
                            ...prev,
                            [field.key]: v,
                          }))
                        }
                      />
                      {field.note && (
                        <p className="text-[10px] text-muted-foreground">
                          {field.note}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="py-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold">
                Results ({results.length} ZIP{results.length === 1 ? "" : "s"})
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-1 text-xs"
                >
                  <Share2 className="h-3 w-3" /> Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCsv}
                  disabled={results.length === 0}
                  className="gap-1 text-xs"
                >
                  <Download className="h-3 w-3" /> CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleJson}
                  disabled={results.length === 0}
                  className="gap-1 text-xs"
                >
                  <FileJson className="h-3 w-3" /> JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTableau}
                  disabled={results.length === 0}
                  className="gap-1 text-xs"
                >
                  <BarChart3 className="h-3 w-3" /> Tableau
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExcel}
                  disabled={results.length === 0}
                  className="gap-1 text-xs"
                >
                  <Download className="h-3 w-3" /> Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePowerBi}
                  disabled={results.length === 0}
                  className="gap-1 text-xs"
                >
                  <FileJson className="h-3 w-3" /> Power BI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNotebook}
                  disabled={results.length === 0}
                  className="gap-1 text-xs"
                >
                  <BookOpen className="h-3 w-3" /> Jupyter
                </Button>
                {results.length > 0 && (
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link
                      to={`/compare-zips?zips=${results
                        .slice(0, 4)
                        .map((r) => r.zip)
                        .join(",")}`}
                    >
                      Compare top 4 <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ZIPs match the active criteria. Try lowering thresholds or
                disabling EJScreen filters (limited ZIP coverage).
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs">
                      <th className="py-2 px-2 text-left">ZIP</th>
                      <th className="py-2 px-2 text-left">City</th>
                      <th className="py-2 px-2 text-left">County</th>
                      <th className="py-2 px-2 text-right">EJ</th>
                      <th className="py-2 px-2 text-right">PM2.5</th>
                      <th className="py-2 px-2 text-right">Energy</th>
                      <th className="py-2 px-2 text-right">Uninsured</th>
                      <th className="py-2 px-2 text-right">PCP</th>
                      <th className="py-2 px-2 text-right">Poverty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr
                        key={r.zip}
                        className="border-b border-border/30 hover:bg-muted/30"
                      >
                        <td className="py-2 px-2">
                          <Link
                            to={`/zip/${r.zip}`}
                            className="font-mono text-primary hover:underline"
                          >
                            {r.zip}
                          </Link>
                        </td>
                        <td className="py-2 px-2 text-xs">{r.city}</td>
                        <td className="py-2 px-2 text-xs">{r.county}</td>
                        <MetricCell metric={r.metrics.ej_index} />
                        <MetricCell metric={r.metrics.pm25_percentile} />
                        <MetricCell metric={r.metrics.energy_burden_pct} />
                        <MetricCell metric={r.metrics.uninsured_rate} />
                        <MetricCell metric={r.metrics.pcp_ratio} />
                        <MetricCell metric={r.metrics.poverty_rate} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/environment/justice">
              <MapPin className="h-3 w-3 mr-1" /> EJ Pathways
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/service-area">Service Area Builder</Link>
          </Button>
        </div>

        <DataProvenance
          source="EPA EJScreen, ACEEE, County Health Rankings, Census ACS"
          updated="2026"
          methodologyHref="/methodology"
        />
      </div>
    </Layout>
  );
}