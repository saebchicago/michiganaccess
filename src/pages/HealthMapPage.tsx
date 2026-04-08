import { useState, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MapPin, Layers, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import MapLayerControls, { LAYERS } from "@/components/map/MapLayerControls";
import MapLegend from "@/components/map/MapLegend";
import SectorOverlayControls from "@/components/map/SectorOverlayControls";
import { useFacilities } from "@/hooks/useFacilities";
import { useCounty } from "@/contexts/CountyContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import MapFirstVisitTooltip from "@/components/map/MapFirstVisitTooltip";
import NetworkFilter from "@/components/map/NetworkFilter";

// Lazy-load the heavy map component (520 lines + Leaflet + clustering)
const HealthMap = lazy(() => import("@/components/map/HealthMap"));

const DEFAULT_LAYERS = LAYERS.filter((l) => l.defaultOn).map((l) => l.id);

export default function HealthMapPage() {
  const { t } = useTranslation();
  const { county } = useCounty();
  usePageMeta({ title: "Health Map", description: "Interactive map of Michigan healthcare facilities with quality scores, transit access, and layer controls.", path: "/health-map" });
  const [activeLayers, setActiveLayers] = useState<string[]>(DEFAULT_LAYERS);
  const [activeOverlays, setActiveOverlays] = useState<string[]>(["county-boundaries"]);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const { data: facilities = [], isLoading } = useFacilities(undefined, county);

  const toggleLayer = useCallback((layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  }, []);

  const toggleOverlay = useCallback((id: string) => {
    setActiveOverlays((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  }, []);

  return (
    <Layout>
      <div className="relative flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="hidden w-72 flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-background p-4 lg:flex"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t('healthMap.title')}</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('healthMap.description')}
            {county && <span className="block mt-1 font-medium text-primary">Filtered: {county} County</span>}
          </p>

          <MapLayerControls activeLayers={activeLayers} onToggleLayer={toggleLayer} />
          <SectorOverlayControls activeOverlays={activeOverlays} onToggleOverlay={toggleOverlay} />
          <NetworkFilter selectedSystem={selectedSystem} onSelect={setSelectedSystem} />
          <MapLegend />

          <div className="mt-auto rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground">{t('healthMap.dataNotice')}</p>
                <p className="text-[10px] text-muted-foreground">
                  {t('healthMap.dataNoticeText')} Data overlays from Michigan GIS, MDOT, EGLE. Click a county boundary to view its subpage.
                </p>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Mobile controls */}
        <div className="absolute left-3 top-3 z-[1000] flex gap-2 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="secondary" className="shadow-md">
                <Layers className="mr-1.5 h-4 w-4" />
                {t('healthMap.layers')}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetTitle>{t('healthMap.mapLayers')}</SheetTitle>
              <div className="mt-4 flex flex-col gap-4">
                <MapLayerControls activeLayers={activeLayers} onToggleLayer={toggleLayer} />
                <SectorOverlayControls activeOverlays={activeOverlays} onToggleOverlay={toggleOverlay} />
                <NetworkFilter selectedSystem={selectedSystem} onSelect={setSelectedSystem} />
                <MapLegend />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <MapFirstVisitTooltip />

        {/* Map — lazy loaded */}
        <div className="relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm font-medium text-muted-foreground">{t('healthMap.loading')}</p>
              </motion.div>
            </div>
          )}
          <Suspense fallback={
            <div className="flex h-full items-center justify-center bg-muted/30">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          }>
            <HealthMap
              facilities={facilities}
              activeLayers={activeLayers}
              activeOverlays={activeOverlays}
              selectedSystem={selectedSystem}
            />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
}
