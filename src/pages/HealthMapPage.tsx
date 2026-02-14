import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Layers, Info } from "lucide-react";
import Layout from "@/components/layout/Layout";
import HealthMap from "@/components/map/HealthMap";
import MapLayerControls, { LAYERS } from "@/components/map/MapLayerControls";
import MapLegend from "@/components/map/MapLegend";
import { useFacilities } from "@/hooks/useFacilities";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const DEFAULT_LAYERS = LAYERS.filter((l) => l.defaultOn).map((l) => l.id);

export default function HealthMapPage() {
  const [activeLayers, setActiveLayers] = useState<string[]>(DEFAULT_LAYERS);
  const { data: facilities = [], isLoading } = useFacilities();

  const toggleLayer = useCallback((layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
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
            <h2 className="text-lg font-bold text-foreground">Health Map</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Explore healthcare facilities across Michigan. Toggle layers to show
            different facility types. Markers are color-coded by quality score.
          </p>
          <MapLayerControls activeLayers={activeLayers} onToggleLayer={toggleLayer} />
          <MapLegend />
          <div className="mt-auto rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground">DATA NOTICE</p>
                <p className="text-[10px] text-muted-foreground">
                  Facility names and locations are real Michigan healthcare facilities sourced from CMS Hospital Compare.
                  Quality scores reflect available public data from CMS, Leapfrog Group, ANCC Magnet Recognition, and BCBSM Blue Distinction.
                  Some metrics may have a 3–12 month lag from source agencies.
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
                Layers
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetTitle>Map Layers</SheetTitle>
              <div className="mt-4 flex flex-col gap-4">
                <MapLayerControls activeLayers={activeLayers} onToggleLayer={toggleLayer} />
                <MapLegend />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Map */}
        <div className="relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm font-medium text-muted-foreground">Loading facilities…</p>
              </motion.div>
            </div>
          )}
          <HealthMap facilities={facilities} activeLayers={activeLayers} />
        </div>
      </div>
    </Layout>
  );
}
