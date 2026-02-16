import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Facility } from "@/hooks/useFacilities";
import { useCounty } from "@/contexts/CountyContext";
import { useNavigate } from "react-router-dom";
import { countyToSlug, COUNTY_CENTERS } from "@/utils/countyUtils";
import CountyBoundaryLayer from "./CountyBoundaryLayer";
import VehiclePositionLayer from "./VehiclePositionLayer";
import { useArcGISData, type ArcGISLayer } from "@/hooks/useArcGISData";
import { useGTFSRealtime } from "@/hooks/useGTFSRealtime";
import { useAirQuality } from "@/hooks/useAirQuality";

// Fix default icon
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

  const choiceLabels: string[] = [];
  if (facility.facility_type === 'fqhc') choiceLabels.push('<div style="background:#2D5F3F;color:#fff;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:600;margin-bottom:6px;">✅ No one turned away · Sliding scale fees</div>');
  if (facility.services && facility.services.length >= 7) choiceLabels.push('<div style="background:#0A4C95;color:#fff;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:600;margin-bottom:6px;">🏥 Comprehensive care</div>');

  const dc = facility.digital_capabilities as Record<string, boolean> | null;
  const digitalFeatures: string[] = [];
  if (dc?.online_scheduling) digitalFeatures.push('Schedule Online');
  if (dc?.patient_portal) digitalFeatures.push('Patient Portal');
  if (facility.telehealth_available) digitalFeatures.push('Telehealth');

  return `
    <div style="min-width:260px;max-width:320px;font-family:system-ui,sans-serif;">
      ${choiceLabels.join('')}
      <div style="font-size:14px;font-weight:700;color:#003B5C;margin-bottom:2px;">${facility.name}</div>
      ${facility.system_affiliation ? `<div style="font-size:11px;color:#64748b;margin-bottom:6px;">${facility.system_affiliation}</div>` : ''}
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="background:${qualityColor};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">${qualityLabel} ${facility.quality_score ?? '—'}/100</span>
        <span style="font-size:11px;color:#64748b;">${typeLabel}</span>
      </div>
      ${badges.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">${badges.join('')}</div>` : ''}
      <div style="font-size:12px;color:#334155;margin-bottom:4px;">📍 ${facility.address}, ${facility.city}, MI ${facility.zip}</div>
      ${facility.phone ? `<div style="font-size:12px;color:#334155;margin-bottom:4px;">📞 <a href="tel:${facility.phone}" style="color:#0A4C95;">${facility.phone}</a></div>` : ''}
      ${digitalFeatures.length > 0 ? `<div style="margin:6px 0;display:flex;flex-wrap:wrap;gap:3px;">${digitalFeatures.map(f => `<span style="background:#e0f7f7;color:#00A3A1;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:500;">🖥️ ${f}</span>`).join('')}</div>` : ''}
      ${facility.services && facility.services.length > 0 ? `<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:3px;">${facility.services.slice(0, 5).map(s => `<span style="background:#f1f5f9;color:#475569;padding:1px 6px;border-radius:3px;font-size:10px;">${s}</span>`).join('')}${facility.services.length > 5 ? `<span style="color:#64748b;font-size:10px;">+${facility.services.length - 5} more</span>` : ''}</div>` : ''}
      ${facility.website ? `<div style="margin-top:8px;"><a href="${facility.website}" target="_blank" rel="noopener" style="color:#0A4C95;font-size:12px;font-weight:600;text-decoration:none;">Visit Website →</a></div>` : ''}
      <div style="margin-top:6px;padding-top:4px;font-size:9px;color:#94a3b8;">
        ${facility.county ? `<a href="/county/${countyToSlug(facility.county)}" style="color:#0A4C95;">View ${facility.county} County →</a> · ` : ''}
        Quality scores are demo data.
      </div>
    </div>
  `;
}

interface HealthMapProps {
  facilities: Facility[];
  activeLayers: string[];
  activeOverlays?: string[];
  onSearchLocation?: (lat: number, lon: number) => void;
}

const MICHIGAN_CENTER: [number, number] = [44.3148, -85.6024];
const MICHIGAN_ZOOM = 7;

export default function HealthMap({ facilities, activeLayers, activeOverlays = [] }: HealthMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const overlayLayersRef = useRef<Record<string, L.LayerGroup>>({});
  const { county, setCounty } = useCounty();
  const navigate = useNavigate();

  // Fetch overlay data
  const showWorkzones = activeOverlays.includes("mdot-workzones");
  const showAir = activeOverlays.includes("egle-air");
  const showEV = activeOverlays.includes("ev-stations");
  const showDDOT = activeOverlays.includes("ddot-routes");
  const showCATA = activeOverlays.includes("cata-routes");
  const showDDOTLive = activeOverlays.includes("ddot-live");
  const showTheRideLive = activeOverlays.includes("theride-live");
  const showAQI = activeOverlays.includes("aqi-stations");

  const { data: workzoneData } = useArcGISData("mdot-workzones", showWorkzones);
  const { data: airData } = useArcGISData("egle-air", showAir);
  const { data: evData } = useArcGISData("ev-stations", showEV);
  const { data: ddotData } = useArcGISData("ddot-routes", showDDOT);
  const { data: cataData } = useArcGISData("cata-routes", showCATA);
  const { data: ddotLive } = useGTFSRealtime("ddot", showDDOTLive);
  const { data: therideLive } = useGTFSRealtime("theride", showTheRideLive);
  const { data: aqiData } = useAirQuality(showAQI);

  const allLiveVehicles = useMemo(() => {
    const vehicles = [];
    if (showDDOTLive && ddotLive?.vehicles) vehicles.push(...ddotLive.vehicles);
    if (showTheRideLive && therideLive?.vehicles) vehicles.push(...therideLive.vehicles);
    return vehicles;
  }, [showDDOTLive, showTheRideLive, ddotLive, therideLive]);

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
      clusterRef.current = null;
    };
  }, []);

  // Pan to county
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (county && COUNTY_CENTERS[county]) {
      map.setView(COUNTY_CENTERS[county], 10, { animate: true });
    } else {
      map.setView(MICHIGAN_CENTER, MICHIGAN_ZOOM, { animate: true });
    }
  }, [county]);

  // Update facility markers with clustering
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old cluster
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      chunkedLoading: true,
    }) as L.MarkerClusterGroup;

    facilities.forEach((f) => {
      if (!activeLayers.includes(f.facility_type)) return;
      const color = getQualityColor(f.quality_score);
      const icon = createMarkerIcon(color, f.facility_type);
      const marker = L.marker([f.latitude, f.longitude], { icon });
      marker.bindPopup(buildPopupContent(f), { maxWidth: 320 });
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;
  }, [facilities, activeLayers]);

  // Sector overlay layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old overlays
    Object.values(overlayLayersRef.current).forEach((lg) => map.removeLayer(lg));
    overlayLayersRef.current = {};

    // MDOT Work Zones
    if (showWorkzones && workzoneData?.data) {
      const lg = L.layerGroup();
      try {
        L.geoJSON(workzoneData.data, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 6, fillColor: "#E85D4A", color: "#fff", weight: 2, fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(`<strong>🚧 ${p.PROJECT_NAME || "Work Zone"}</strong><br/>${p.DESCRIPTION || ""}<br/><em>${p.STATUS || ""}</em>`);
          },
        }).addTo(lg);
      } catch {}
      lg.addTo(map);
      overlayLayersRef.current["workzones"] = lg;
    }

    // Air Quality
    if (showAir && airData?.data) {
      const lg = L.layerGroup();
      try {
        L.geoJSON(airData.data, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8, fillColor: "#4A90E2", color: "#fff", weight: 2, fillOpacity: 0.7,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(`<strong>🌬️ ${p.SITE_NAME || "Air Monitor"}</strong><br/>Type: ${p.MONITOR_TYPE || "N/A"}<br/>Status: ${p.STATUS || "Active"}`);
          },
        }).addTo(lg);
      } catch {}
      lg.addTo(map);
      overlayLayersRef.current["air"] = lg;
    }

    // EV Stations
    if (showEV && evData?.data) {
      const lg = L.layerGroup();
      try {
        L.geoJSON(evData.data, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 5, fillColor: "#F4A460", color: "#fff", weight: 1.5, fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(`<strong>⚡ ${p.Station_Name || "EV Station"}</strong><br/>${p.Street_Address || ""}, ${p.City || ""}<br/>Network: ${p.EV_Network || "N/A"}<br/>L2: ${p.EV_Level2_EVSE_Num || 0} · DC Fast: ${p.EV_DC_Fast_Count || 0}`);
          },
        }).addTo(lg);
      } catch {}
      lg.addTo(map);
      overlayLayersRef.current["ev"] = lg;
    }
    // DDOT Bus Routes
    if (showDDOT && ddotData?.data) {
      const lg = L.layerGroup();
      try {
        L.geoJSON(ddotData.data, {
          style: () => ({
            color: "#E85D4A",
            weight: 3,
            opacity: 0.7,
            dashArray: "5, 8",
          }),
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 4, fillColor: "#E85D4A", color: "#fff", weight: 1, fillOpacity: 0.9,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(`<strong>🚌 DDOT ${p.ROUTE_NUM || p.route_short_name || ""}</strong><br/>${p.ROUTE_NAME || p.route_long_name || "Bus Route"}`);
          },
        }).addTo(lg);
      } catch {}
      lg.addTo(map);
      overlayLayersRef.current["ddot"] = lg;
    }

    // CATA Bus Routes
    if (showCATA && cataData?.data) {
      const lg = L.layerGroup();
      try {
        L.geoJSON(cataData.data, {
          style: () => ({
            color: "#00A3A1",
            weight: 3,
            opacity: 0.7,
            dashArray: "5, 8",
          }),
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 4, fillColor: "#00A3A1", color: "#fff", weight: 1, fillOpacity: 0.9,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(`<strong>🚌 CATA ${p.route_short_name || ""}</strong><br/>${p.route_long_name || "Bus Route"}`);
          },
        }).addTo(lg);
      } catch {}
      lg.addTo(map);
      overlayLayersRef.current["cata"] = lg;
    }
    // AQI Stations
    if (showAQI && aqiData?.stations) {
      const lg = L.layerGroup();
      for (const station of aqiData.stations) {
        const textColor = station.aqi <= 100 ? "#000" : "#fff";
        const icon = L.divIcon({
          html: `<div style="
            width:32px;height:32px;border-radius:50%;
            background:${station.color};border:2px solid #fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;color:${textColor};
            font-family:system-ui,sans-serif;
          ">${station.aqi}</div>`,
          className: "aqi-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const timeStr = station.lastUpdated
          ? new Date(station.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "N/A";

        const marker = L.marker([station.latitude, station.longitude], { icon });
        marker.bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:200px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="width:28px;height:28px;border-radius:50%;background:${station.color};display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${textColor};">${station.aqi}</span>
              <div>
                <div style="font-size:13px;font-weight:700;color:#003B5C;">${station.name}</div>
                ${station.city ? `<div style="font-size:11px;color:#64748b;">${station.city}, MI</div>` : ""}
              </div>
            </div>
            <div style="background:${station.color};color:${textColor};padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-bottom:6px;">
              ${station.category}
            </div>
            <div style="font-size:11px;color:#475569;">Parameter: ${station.parameter}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Updated: ${timeStr}</div>
            <div style="font-size:9px;color:#94a3b8;margin-top:2px;">Source: EPA / OpenAQ</div>
          </div>
        `);
        lg.addLayer(marker);
      }
      lg.addTo(map);
      overlayLayersRef.current["aqi"] = lg;
    }
  }, [showWorkzones, showAir, showEV, showDDOT, showCATA, showAQI, workzoneData, airData, evData, ddotData, cataData, aqiData]);

  const handleCountyClick = useCallback((name: string) => {
    // Strip "County" suffix if present from ArcGIS data
    const cleanName = name.replace(/\s+County$/i, "").trim();
    setCounty(cleanName as any);
    navigate(`/county/${countyToSlug(cleanName)}`);
  }, [setCounty, navigate]);

  return (
    <div className="relative h-full w-full" style={{ minHeight: "500px" }}>
      <div ref={mapRef} className="h-full w-full" />
      <CountyBoundaryLayer
        map={mapInstanceRef.current}
        selectedCounty={county}
        onCountyClick={handleCountyClick}
      />
      <VehiclePositionLayer
        map={mapInstanceRef.current}
        vehicles={allLiveVehicles}
        visible={showDDOTLive || showTheRideLive}
      />
      {(showDDOTLive || showTheRideLive) && allLiveVehicles.length > 0 && (
        <div className="absolute bottom-2 left-2 z-[1000] rounded bg-card/90 border border-border px-2 py-1 text-[10px] text-muted-foreground shadow">
          🚌 {allLiveVehicles.length} buses live · Refreshes every 30s
        </div>
      )}
    </div>
  );
}
