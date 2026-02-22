import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";

/**
 * Utility Outage Tracking Layer
 * Shows simulated real-time outage data for DTE Energy and Consumers Energy
 * service territories across Michigan counties.
 * 
 * In production, this would proxy DTE's and Consumers Energy's outage map APIs.
 * Current data is representative of typical outage patterns.
 */

interface OutageZone {
  county: string;
  lat: number;
  lng: number;
  utility: "DTE" | "Consumers";
  customersAffected: number;
  customersServed: number;
  cause: string;
  estimatedRestore: string;
  severity: "none" | "low" | "moderate" | "high" | "critical";
}

// Representative outage data — in production, proxied from utility APIs
const OUTAGE_ZONES: OutageZone[] = [
  { county: "Wayne", lat: 42.33, lng: -83.05, utility: "DTE", customersAffected: 2340, customersServed: 750000, cause: "Storm damage", estimatedRestore: "4–6 hrs", severity: "moderate" },
  { county: "Oakland", lat: 42.58, lng: -83.29, utility: "DTE", customersAffected: 180, customersServed: 520000, cause: "Equipment failure", estimatedRestore: "1–2 hrs", severity: "low" },
  { county: "Macomb", lat: 42.67, lng: -82.91, utility: "DTE", customersAffected: 0, customersServed: 340000, cause: "", estimatedRestore: "", severity: "none" },
  { county: "Washtenaw", lat: 42.28, lng: -83.74, utility: "DTE", customersAffected: 45, customersServed: 145000, cause: "Planned maintenance", estimatedRestore: "2 hrs", severity: "low" },
  { county: "Livingston", lat: 42.60, lng: -83.91, utility: "DTE", customersAffected: 0, customersServed: 80000, cause: "", estimatedRestore: "", severity: "none" },
  { county: "Monroe", lat: 41.92, lng: -83.40, utility: "DTE", customersAffected: 520, customersServed: 62000, cause: "Wind damage", estimatedRestore: "3–5 hrs", severity: "moderate" },
  { county: "St. Clair", lat: 42.88, lng: -82.52, utility: "DTE", customersAffected: 0, customersServed: 68000, cause: "", estimatedRestore: "", severity: "none" },
  { county: "Lapeer", lat: 43.05, lng: -83.33, utility: "DTE", customersAffected: 85, customersServed: 38000, cause: "Tree contact", estimatedRestore: "2–3 hrs", severity: "low" },
  { county: "Kent", lat: 42.96, lng: -85.67, utility: "Consumers", customersAffected: 1200, customersServed: 280000, cause: "Thunderstorm", estimatedRestore: "5–8 hrs", severity: "high" },
  { county: "Ottawa", lat: 42.98, lng: -86.02, utility: "Consumers", customersAffected: 350, customersServed: 120000, cause: "Lightning strike", estimatedRestore: "3–4 hrs", severity: "moderate" },
  { county: "Kalamazoo", lat: 42.29, lng: -85.59, utility: "Consumers", customersAffected: 0, customersServed: 110000, cause: "", estimatedRestore: "", severity: "none" },
  { county: "Ingham", lat: 42.73, lng: -84.56, utility: "Consumers", customersAffected: 680, customersServed: 125000, cause: "Ice accumulation", estimatedRestore: "6–10 hrs", severity: "moderate" },
  { county: "Genesee", lat: 43.01, lng: -83.69, utility: "Consumers", customersAffected: 4200, customersServed: 180000, cause: "Major storm", estimatedRestore: "8–12 hrs", severity: "critical" },
  { county: "Saginaw", lat: 43.42, lng: -83.95, utility: "Consumers", customersAffected: 150, customersServed: 85000, cause: "Equipment failure", estimatedRestore: "1–2 hrs", severity: "low" },
  { county: "Bay", lat: 43.59, lng: -83.89, utility: "Consumers", customersAffected: 0, customersServed: 48000, cause: "", estimatedRestore: "", severity: "none" },
  { county: "Jackson", lat: 42.25, lng: -84.40, utility: "Consumers", customersAffected: 90, customersServed: 65000, cause: "Vehicle accident", estimatedRestore: "2 hrs", severity: "low" },
  { county: "Calhoun", lat: 42.32, lng: -85.00, utility: "Consumers", customersAffected: 0, customersServed: 58000, cause: "", estimatedRestore: "", severity: "none" },
  { county: "Berrien", lat: 41.95, lng: -86.42, utility: "Consumers", customersAffected: 275, customersServed: 70000, cause: "Wind damage", estimatedRestore: "3–5 hrs", severity: "moderate" },
  { county: "Muskegon", lat: 43.23, lng: -86.25, utility: "Consumers", customersAffected: 0, customersServed: 75000, cause: "", estimatedRestore: "", severity: "none" },
  { county: "Grand Traverse", lat: 44.76, lng: -85.62, utility: "Consumers", customersAffected: 120, customersServed: 45000, cause: "Tree contact", estimatedRestore: "2–3 hrs", severity: "low" },
  { county: "Marquette", lat: 46.55, lng: -87.40, utility: "Consumers", customersAffected: 800, customersServed: 32000, cause: "Snow/ice", estimatedRestore: "6–10 hrs", severity: "high" },
  { county: "Alpena", lat: 45.06, lng: -83.43, utility: "Consumers", customersAffected: 0, customersServed: 14000, cause: "", estimatedRestore: "", severity: "none" },
];

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical": return "#7E0023";
    case "high": return "#DC2626";
    case "moderate": return "#F59E0B";
    case "low": return "#3B82F6";
    default: return "#22C55E";
  }
}

function getOutagePercent(zone: OutageZone): string {
  if (zone.customersAffected === 0) return "0%";
  return ((zone.customersAffected / zone.customersServed) * 100).toFixed(2) + "%";
}

interface UtilityOutageLayerProps {
  map: L.Map | null;
  visible?: boolean;
}

export default function UtilityOutageLayer({ map, visible = true }: UtilityOutageLayerProps) {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const legendRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!visible) {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
      if (legendRef.current) { map.removeControl(legendRef.current); legendRef.current = null; }
      return;
    }

    // Remove old
    if (layerRef.current) map.removeLayer(layerRef.current);
    if (legendRef.current) map.removeControl(legendRef.current);

    const lg = L.layerGroup();

    OUTAGE_ZONES.forEach((zone) => {
      const color = getSeverityColor(zone.severity);
      const radius = zone.severity === "none" ? 8 : Math.min(22, 10 + (zone.customersAffected / 500));
      const opacity = zone.severity === "none" ? 0.4 : 0.75;

      const circle = L.circleMarker([zone.lat, zone.lng], {
        radius,
        fillColor: color,
        color: "#fff",
        weight: 2,
        fillOpacity: opacity,
      });

      const utilityColor = zone.utility === "DTE" ? "#0A4C95" : "#2D5F3F";

      circle.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:220px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="background:${utilityColor};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">
              ⚡ ${zone.utility} Energy
            </span>
            <span style="font-size:11px;color:#64748b;">${zone.county} County</span>
          </div>
          ${zone.severity !== "none" ? `
            <div style="background:${color};color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:6px;">
              ${zone.customersAffected.toLocaleString()} customers affected (${getOutagePercent(zone)})
            </div>
            <div style="font-size:11px;color:#334155;margin-bottom:4px;">
              <strong>Cause:</strong> ${zone.cause}
            </div>
            <div style="font-size:11px;color:#334155;margin-bottom:4px;">
              <strong>Est. Restore:</strong> ${zone.estimatedRestore}
            </div>
          ` : `
            <div style="background:#22C55E;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:6px;">
              ✓ No active outages
            </div>
          `}
          <div style="font-size:10px;color:#64748b;margin-top:4px;">
            ${zone.customersServed.toLocaleString()} total customers served
          </div>
          <div style="font-size:9px;color:#94a3b8;margin-top:4px;">
            Source: ${zone.utility === "DTE" ? "DTE Energy Outage Center" : "Consumers Energy Outage Map"} · Demo data
          </div>
        </div>
      `);

      circle.bindTooltip(
        `<div style="text-align:center">
          <strong>${zone.county}</strong> · ${zone.utility}<br/>
          ${zone.severity !== "none"
            ? `<span style="color:${color};font-weight:600">${zone.customersAffected.toLocaleString()} out</span>`
            : '<span style="color:#22C55E">No outages</span>'}
        </div>`,
        { sticky: true }
      );

      lg.addLayer(circle);
    });

    lg.addTo(map);
    layerRef.current = lg;

    // Legend
    const legend = new L.Control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "outage-legend");
      div.innerHTML = `
        <div style="background:white;padding:8px 10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:11px;line-height:1.6">
          <strong style="display:block;margin-bottom:4px">⚡ Utility Outages</strong>
          <div><span style="display:inline-block;width:14px;height:10px;background:#22C55E;border-radius:2px;margin-right:4px"></span>No outages</div>
          <div><span style="display:inline-block;width:14px;height:10px;background:#3B82F6;border-radius:2px;margin-right:4px"></span>Low (&lt;0.5%)</div>
          <div><span style="display:inline-block;width:14px;height:10px;background:#F59E0B;border-radius:2px;margin-right:4px"></span>Moderate</div>
          <div><span style="display:inline-block;width:14px;height:10px;background:#DC2626;border-radius:2px;margin-right:4px"></span>High (&gt;1%)</div>
          <div><span style="display:inline-block;width:14px;height:10px;background:#7E0023;border-radius:2px;margin-right:4px"></span>Critical (&gt;2%)</div>
          <div style="font-size:9px;color:#999;margin-top:4px">DTE Energy · Consumers Energy<br/>Demo data · Refresh: 15 min</div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);
    legendRef.current = legend;

    return () => {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
      if (legendRef.current) { map.removeControl(legendRef.current); legendRef.current = null; }
    };
  }, [map, visible]);

  return null;
}
