import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Facility } from "@/hooks/useFacilities";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const QUALITY_COLORS: Record<string, string> = {
  gold: "#F4A460",
  teal: "#00A3A1",
  blue: "#4A90E2",
  gray: "#94a3b8",
};

function getQualityColor(score: number | null): string {
  if (!score) return QUALITY_COLORS.gray;
  if (score >= 90) return QUALITY_COLORS.gold;
  if (score >= 75) return QUALITY_COLORS.teal;
  if (score >= 60) return QUALITY_COLORS.blue;
  return QUALITY_COLORS.gray;
}

function getQualityLabel(score: number | null): string {
  if (!score) return "No data";
  if (score >= 90) return "Top Quality";
  if (score >= 75) return "High Quality";
  if (score >= 60) return "Good Quality";
  return "Adequate";
}

const FACILITY_TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  fqhc: "Community Health Center (FQHC)",
  urgent_care: "Urgent Care",
  behavioral_health: "Behavioral Health",
  specialty: "Specialty Center",
  pharmacy: "Pharmacy",
};

function createMarkerIcon(color: string, type: string) {
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="40">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="#fff" opacity="0.9"/>
    ${type === 'fqhc' ? '<text x="12" y="15" text-anchor="middle" font-size="8" font-weight="bold" fill="' + color + '">+</text>' :
      type === 'behavioral_health' ? '<text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="' + color + '">♥</text>' :
      type === 'urgent_care' ? '<text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="' + color + '">!</text>' :
      type === 'specialty' ? '<text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="' + color + '">★</text>' :
      '<text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="' + color + '">H</text>'}
  </svg>`;

  return L.divIcon({
    html: svgIcon,
    className: "custom-marker",
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

function buildPopupContent(facility: Facility): string {
  const badges: string[] = [];
  if (facility.is_magnet) badges.push('<span style="background:#F4A460;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;">🏆 Magnet</span>');
  if (facility.leapfrog_grade === "A") badges.push('<span style="background:#2D5F3F;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;">⭐ Leapfrog A</span>');
  if (facility.is_blue_distinction) badges.push('<span style="background:#0A4C95;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;">💙 Blue Distinction</span>');

  const qualityColor = getQualityColor(facility.quality_score);
  const qualityLabel = getQualityLabel(facility.quality_score);
  const typeLabel = FACILITY_TYPE_LABELS[facility.facility_type] || facility.facility_type;

  return `
    <div style="min-width:260px;max-width:320px;font-family:system-ui,sans-serif;">
      <div style="font-size:15px;font-weight:700;color:#003B5C;margin-bottom:2px;">${facility.name}</div>
      ${facility.system_affiliation ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px;">${facility.system_affiliation}</div>` : ''}
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="background:${qualityColor};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">${qualityLabel} ${facility.quality_score ?? '—'}/100</span>
        <span style="font-size:11px;color:#64748b;">${typeLabel}</span>
      </div>
      ${badges.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">${badges.join('')}</div>` : ''}
      <div style="font-size:12px;color:#334155;margin-bottom:4px;">📍 ${facility.address}, ${facility.city}, MI ${facility.zip}</div>
      ${facility.phone ? `<div style="font-size:12px;color:#334155;margin-bottom:4px;">📞 <a href="tel:${facility.phone}" style="color:#0A4C95;">${facility.phone}</a></div>` : ''}
      ${facility.telehealth_available ? '<div style="font-size:11px;color:#00A3A1;margin-bottom:4px;">📱 Telehealth Available</div>' : ''}
      ${facility.services && facility.services.length > 0 ? `
        <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px;">
          ${facility.services.slice(0, 5).map(s => `<span style="background:#f1f5f9;color:#475569;padding:1px 6px;border-radius:3px;font-size:10px;">${s}</span>`).join('')}
          ${facility.services.length > 5 ? `<span style="color:#64748b;font-size:10px;">+${facility.services.length - 5} more</span>` : ''}
        </div>` : ''}
      ${facility.website ? `<div style="margin-top:8px;"><a href="${facility.website}" target="_blank" rel="noopener" style="color:#0A4C95;font-size:12px;font-weight:600;text-decoration:none;">Visit Website →</a></div>` : ''}
      <div style="margin-top:4px;font-size:9px;color:#94a3b8;">Quality scores are demo data for prototype purposes. Sources: CMS, Leapfrog, ANCC (demo)</div>
    </div>
  `;
}

interface HealthMapProps {
  facilities: Facility[];
  activeLayers: string[];
}

const MICHIGAN_CENTER: [number, number] = [44.3148, -85.6024];
const MICHIGAN_ZOOM = 7;

export default function HealthMap({ facilities, activeLayers }: HealthMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({});

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: MICHIGAN_CENTER,
      zoom: MICHIGAN_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when facilities or active layers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear all existing layers
    Object.values(layerGroupsRef.current).forEach((lg) => {
      map.removeLayer(lg);
    });
    layerGroupsRef.current = {};

    // Group facilities by type
    const grouped: Record<string, Facility[]> = {};
    facilities.forEach((f) => {
      if (!grouped[f.facility_type]) grouped[f.facility_type] = [];
      grouped[f.facility_type].push(f);
    });

    // Create layer groups for active layers
    Object.entries(grouped).forEach(([type, facs]) => {
      if (!activeLayers.includes(type)) return;

      const lg = L.layerGroup();
      facs.forEach((facility) => {
        const color = getQualityColor(facility.quality_score);
        const icon = createMarkerIcon(color, type);
        const marker = L.marker([facility.latitude, facility.longitude], { icon });
        marker.bindPopup(buildPopupContent(facility), { maxWidth: 340 });
        lg.addLayer(marker);
      });
      lg.addTo(map);
      layerGroupsRef.current[type] = lg;
    });
  }, [facilities, activeLayers]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full"
      style={{ minHeight: "500px" }}
    />
  );
}
