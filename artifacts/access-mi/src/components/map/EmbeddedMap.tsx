import { useEffect, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Facility } from "@/hooks/useFacilities";
import { COUNTY_CENTERS } from "@/utils/countyUtils";

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MICHIGAN_CENTER: [number, number] = [44.3148, -85.6024];

// Inset the visible bounds so basemap city labels at the viewport edge
// have safe space and do not get clipped against the container.
function fitWithPadding(
  map: L.Map,
  center: [number, number],
  zoom: number,
  animate: boolean,
) {
  const size = map.getSize();
  if (size.x === 0 || size.y === 0) {
    map.setView(center, zoom, { animate });
    return;
  }
  const centerPx = map.project(L.latLng(center), zoom);
  const half = size.divideBy(2);
  const sw = map.unproject(centerPx.subtract(half), zoom);
  const ne = map.unproject(centerPx.add(half), zoom);
  map.fitBounds(L.latLngBounds(sw, ne), { padding: [40, 40], animate });
}

function getMarkerColor(type: string): string {
  const colors: Record<string, string> = {
    hospital: "#003B5C",
    fqhc: "#00A3A1",
    urgent_care: "#E85D4A",
    behavioral_health: "#7C3AED",
    specialty: "#F4A460",
    pharmacy: "#94a3b8",
    food: "#2D5F3F",
    housing: "#003B5C",
    transportation: "#00A3A1",
    mental_health: "#E85D4A",
  };
  return colors[type] || "#003B5C";
}

interface EmbeddedMapProps {
  facilities?: Facility[];
  resources?: Array<{
    latitude: number | null;
    longitude: number | null;
    resource_name: string;
    resource_type: string;
    address?: string | null;
    city: string;
  }>;
  county?: string | null;
  height?: string;
  className?: string;
  showCountyBoundary?: boolean;
}

const EmbeddedMap = memo(function EmbeddedMap({
  facilities = [],
  resources = [],
  county,
  height = "400px",
  className = "",
}: EmbeddedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const center =
      county && COUNTY_CENTERS[county]
        ? COUNTY_CENTERS[county]
        : MICHIGAN_CENTER;
    const zoom = county ? 10 : 7;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: false,
      zoomSnap: 0,
    });

    L.tileLayer(
      "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        crossOrigin: "anonymous",
        maxZoom: 20,
      },
    ).addTo(map);

    fitWithPadding(map, center, zoom, false);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when county changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const center =
      county && COUNTY_CENTERS[county]
        ? COUNTY_CENTERS[county]
        : MICHIGAN_CENTER;
    const zoom = county ? 10 : 7;
    fitWithPadding(map, center, zoom, true);
  }, [county]);

  // Add markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Facility markers
    facilities.forEach((f) => {
      if (!f.latitude || !f.longitude) return;
      const color = getMarkerColor(f.facility_type);
      const icon = L.divIcon({
        html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
        className: "custom-dot-marker",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      L.marker([f.latitude, f.longitude], { icon })
        .bindPopup(`<strong>${f.name}</strong><br/>${f.city}, MI`)
        .addTo(map);
    });

    // Resource markers
    resources.forEach((r) => {
      if (!r.latitude || !r.longitude) return;
      const color = getMarkerColor(r.resource_type);
      const icon = L.divIcon({
        html: `<div style="background:${color};width:10px;height:10px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
        className: "custom-dot-marker",
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });
      L.marker([r.latitude, r.longitude], { icon })
        .bindPopup(`<strong>${r.resource_name}</strong><br/>${r.city}, MI`)
        .addTo(map);
    });
  }, [facilities, resources]);

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-lg border border-border ${className}`}
      style={{ height, minHeight: "300px" }}
      role="application"
      aria-label="Interactive map showing locations in Michigan"
    />
  );
});

export default EmbeddedMap;
