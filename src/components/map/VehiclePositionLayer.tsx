import { useEffect, useRef } from "react";
import L from "leaflet";
import type { VehiclePosition } from "@/hooks/useGTFSRealtime";

function createBusIcon(color: string, bearing?: number) {
  const rotation = bearing ? `transform: rotate(${bearing}deg);` : "";
  return L.divIcon({
    html: `<div style="width:20px;height:20px;${rotation}">
      <svg viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="3" width="16" height="16" rx="3" fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <rect x="7" y="5" width="10" height="5" rx="1" fill="#fff" opacity="0.9"/>
        <circle cx="8" cy="17" r="1.5" fill="#fff"/>
        <circle cx="16" cy="17" r="1.5" fill="#fff"/>
        <polygon points="12,1 14,3 10,3" fill="${color}"/>
      </svg>
    </div>`,
    className: "vehicle-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

interface VehiclePositionLayerProps {
  map: L.Map | null;
  vehicles: VehiclePosition[];
  visible: boolean;
}

export default function VehiclePositionLayer({ map, vehicles, visible }: VehiclePositionLayerProps) {
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove old layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!visible || vehicles.length === 0) return;

    const lg = L.layerGroup();

    vehicles.forEach((v) => {
      const icon = createBusIcon(v.color, v.bearing);
      const marker = L.marker([v.latitude, v.longitude], { icon });

      const speedMph = v.speed ? (v.speed * 2.237).toFixed(0) : null;
      const timeStr = v.timestamp
        ? new Date(v.timestamp * 1000).toLocaleTimeString()
        : "N/A";

      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:180px;">
          <div style="font-size:13px;font-weight:700;color:#003B5C;">🚌 ${v.agency}</div>
          ${v.label ? `<div style="font-size:12px;color:#475569;">Vehicle: ${v.label}</div>` : ""}
          ${v.routeId ? `<div style="font-size:12px;color:#475569;">Route: ${v.routeId}</div>` : ""}
          ${speedMph ? `<div style="font-size:11px;color:#64748b;">Speed: ${speedMph} mph</div>` : ""}
          <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Updated: ${timeStr}</div>
          <div style="font-size:9px;color:#94a3b8;">Refreshes every 30s</div>
        </div>
      `);

      lg.addLayer(marker);
    });

    lg.addTo(map);
    layerRef.current = lg;

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, vehicles, visible]);

  return null;
}
