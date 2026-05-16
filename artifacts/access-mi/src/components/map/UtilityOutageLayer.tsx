import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import { useOutageData, type OutageZone } from "@/hooks/useOutageData";

/**
 * Utility Outage Tracking Layer
 * Fetches outage data from the outage-proxy edge function which attempts
 * live DTE/Consumers Energy API calls with aggregated fallback.
 */

/** Escape HTML special chars to prevent XSS from API-sourced strings in Leaflet popup innerHTML */
function escHtml(s: string | undefined | null): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
  const { data: outageData } = useOutageData(visible);

  const zones = outageData?.zones ?? [];
  const source = outageData?.meta?.source ?? "demo";

  useEffect(() => {
    if (!map) return;

    if (!visible || zones.length === 0) {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
      if (legendRef.current) { map.removeControl(legendRef.current); legendRef.current = null; }
      return;
    }

    if (layerRef.current) map.removeLayer(layerRef.current);
    if (legendRef.current) map.removeControl(legendRef.current);

    const lg = L.layerGroup();

    zones.forEach((zone: OutageZone) => {
      const color = getSeverityColor(zone.severity);
      const radius = zone.severity === "none" ? 8 : Math.min(22, 10 + (zone.customersAffected / 500));
      const opacity = zone.severity === "none" ? 0.4 : 0.75;

      const circle = L.circleMarker([zone.lat, zone.lng], {
        radius, fillColor: color, color: "#fff", weight: 2, fillOpacity: opacity,
      });

      const utilityColor = zone.utility === "DTE" ? "#0A4C95" : "#2D5F3F";
      const sourceLabel = source === "live" ? "Live data" : "Public beta";

      circle.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:220px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="background:${utilityColor};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">
              ⚡ ${escHtml(zone.utility)} Energy
            </span>
            <span style="font-size:11px;color:#64748b;">${escHtml(zone.county)} County</span>
          </div>
          ${zone.severity !== "none" ? `
            <div style="background:${color};color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:6px;">
              ${zone.customersAffected.toLocaleString()} customers affected (${getOutagePercent(zone)})
            </div>
            <div style="font-size:11px;color:#334155;margin-bottom:4px;"><strong>Cause:</strong> ${escHtml(zone.cause)}</div>
            <div style="font-size:11px;color:#334155;margin-bottom:4px;"><strong>Est. Restore:</strong> ${escHtml(zone.estimatedRestore)}</div>
          ` : `
            <div style="background:#22C55E;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:6px;">✓ No active outages</div>
          `}
          <div style="font-size:10px;color:#64748b;margin-top:4px;">${zone.customersServed.toLocaleString()} total customers served</div>
          <div style="font-size:9px;color:#94a3b8;margin-top:4px;">Source: ${zone.utility === "DTE" ? "DTE Energy Outage Center" : "Consumers Energy Outage Map"} · ${escHtml(sourceLabel)}</div>
        </div>
      `);

      circle.bindTooltip(
        `<div style="text-align:center"><strong>${escHtml(zone.county)}</strong> · ${escHtml(zone.utility)}<br/>${zone.severity !== "none"
          ? `<span style="color:${color};font-weight:600">${zone.customersAffected.toLocaleString()} out</span>`
          : '<span style="color:#22C55E">No outages</span>'}</div>`,
        { sticky: true }
      );

      lg.addLayer(circle);
    });

    lg.addTo(map);
    layerRef.current = lg;

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
          <div style="font-size:9px;color:#999;margin-top:4px">DTE Energy · Consumers Energy<br/>${source === "live" ? "Live data" : "Public beta"} · Refresh: 15 min</div>
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
  }, [map, visible, zones, source]);

  return null;
}
