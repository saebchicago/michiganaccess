import { useEffect, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ClosureEntry } from "@/data/closureWatchFallback";

const MICHIGAN_CENTER: [number, number] = [44.5, -85.6];
const MICHIGAN_ZOOM = 6;

const TYPE_COLORS: Record<ClosureEntry["closureType"], string> = {
  "full-closure": "#DC2626",
  "service-line-elimination": "#EA580C",
  "merger": "#2563EB",
  "conversion": "#7C3AED",
};

const TYPE_LABELS: Record<ClosureEntry["closureType"], string> = {
  "full-closure": "Full Closure",
  "service-line-elimination": "Service Line Eliminated",
  "merger": "Merger / Transfer",
  "conversion": "Conversion",
};

function makeCircleIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

interface ClosureMapProps {
  entries: ClosureEntry[];
  height?: string;
}

const ClosureMap = memo(function ClosureMap({ entries, height = "420px" }: ClosureMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MICHIGAN_CENTER,
      zoom: MICHIGAN_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    entries
      .filter((e) => e.status === "verified")
      .forEach((entry) => {
        const color = TYPE_COLORS[entry.closureType];
        const icon = makeCircleIcon(color);
        const year = entry.closureDate.slice(0, 4);
        const sourcesHtml = entry.sources
          .slice(0, 2)
          .map(
            (s) =>
              `<a href="${s.url}" target="_blank" rel="noopener noreferrer" style="color:#2563EB;text-decoration:underline;font-size:11px">${s.name}</a>`
          )
          .join("<br/>");

        L.marker([entry.latitude, entry.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-size:13px;max-width:240px">
              <strong>${entry.facilityName}</strong><br/>
              <span style="font-size:11px;color:#6b7280">${entry.city}, ${entry.county} County · ${year}</span><br/>
              <span style="display:inline-block;margin:4px 0;padding:1px 6px;border-radius:9999px;background:${color}22;color:${color};font-size:10px;font-weight:600">${TYPE_LABELS[entry.closureType]}</span>
              ${entry.serviceLineAffected ? `<br/><span style="font-size:11px;color:#374151">${entry.serviceLineAffected}</span>` : ""}
              <br/><p style="font-size:11px;color:#374151;margin:4px 0">${entry.summary}</p>
              <div style="margin-top:4px;border-top:1px solid #e5e7eb;padding-top:4px">${sourcesHtml}</div>
            </div>`,
            { maxWidth: 260 }
          );
      });

    // Simple legend
    const legend = new L.Control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      div.style.cssText =
        "background:white;padding:8px 10px;border-radius:6px;border:1px solid #e5e7eb;font-size:11px;line-height:1.8;box-shadow:0 1px 3px rgba(0,0,0,0.15)";
      div.innerHTML = Object.entries(TYPE_COLORS)
        .map(
          ([type, color]) =>
            `<div style="display:flex;align-items:center;gap:6px">
              <div style="width:10px;height:10px;border-radius:50%;background:${color};border:1.5px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.3)"></div>
              <span>${TYPE_LABELS[type as ClosureEntry["closureType"]]}</span>
            </div>`
        )
        .join("");
      return div;
    };
    legend.addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [entries]);

  return <div ref={containerRef} style={{ height }} className="w-full rounded-lg overflow-hidden border border-border" />;
});

export default ClosureMap;
