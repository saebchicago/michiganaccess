import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Bus, Wind, Zap, Construction, Train, Radio } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const SECTOR_OVERLAYS = [
  { id: "county-boundaries", label: "County Boundaries", icon: Construction, defaultOn: true, color: "text-primary" },
  { id: "mdot-workzones", label: "MDOT Work Zones", icon: Construction, defaultOn: false, color: "text-michigan-coral" },
  { id: "egle-air", label: "Air Quality Sites", icon: Wind, defaultOn: false, color: "text-michigan-sky" },
  { id: "ev-stations", label: "EV Charging", icon: Zap, defaultOn: false, color: "text-michigan-gold" },
  { id: "ddot-routes", label: "DDOT Bus Routes", icon: Bus, defaultOn: false, color: "text-michigan-coral" },
  { id: "cata-routes", label: "CATA Bus Routes", icon: Train, defaultOn: false, color: "text-michigan-teal" },
] as const;

export const REALTIME_OVERLAYS = [
  { id: "ddot-live", label: "DDOT Live Buses", icon: Radio, defaultOn: false, color: "text-michigan-coral" },
  { id: "theride-live", label: "TheRide Live (A2)", icon: Radio, defaultOn: false, color: "text-michigan-teal" },
] as const;

interface SectorOverlayControlsProps {
  activeOverlays: string[];
  onToggleOverlay: (id: string) => void;
}

export default function SectorOverlayControls({ activeOverlays, onToggleOverlay }: SectorOverlayControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-lg border border-border bg-card p-4 shadow-md"
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground">Data Overlays</h3>
      <div className="flex flex-col gap-2.5">
        {SECTOR_OVERLAYS.map((overlay) => {
          const Icon = overlay.icon;
          const isActive = activeOverlays.includes(overlay.id);
          return (
            <label
              key={overlay.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
            >
              <Checkbox
                checked={isActive}
                onCheckedChange={() => onToggleOverlay(overlay.id)}
              />
              <Icon className={`h-4 w-4 ${overlay.color}`} />
              <span className="text-sm text-foreground">{overlay.label}</span>
              {isActive && (
                <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0">
                  Live
                </Badge>
              )}
            </label>
          );
        })}
      </div>

      <Separator className="my-3" />

      <h3 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Radio className="h-3.5 w-3.5 text-michigan-coral" />
        Real-Time Tracking
      </h3>
      <div className="flex flex-col gap-2.5">
        {REALTIME_OVERLAYS.map((overlay) => {
          const Icon = overlay.icon;
          const isActive = activeOverlays.includes(overlay.id);
          return (
            <label
              key={overlay.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
            >
              <Checkbox
                checked={isActive}
                onCheckedChange={() => onToggleOverlay(overlay.id)}
              />
              <Icon className={`h-4 w-4 ${overlay.color}`} />
              <span className="text-sm text-foreground">{overlay.label}</span>
              {isActive && (
                <Badge variant="destructive" className="ml-auto text-[9px] px-1.5 py-0 animate-pulse">
                  Live
                </Badge>
              )}
            </label>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] text-muted-foreground">
        Static data: Michigan GIS, MDOT, EGLE (hourly). Live tracking: GTFS-RT (30s).
      </p>
    </motion.div>
  );
}
