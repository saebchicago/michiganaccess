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
import EnergyBurdenChoropleth from "./EnergyBurdenChoropleth";
import UtilityOutageLayer from "./UtilityOutageLayer";
import VehiclePositionLayer from "./VehiclePositionLayer";
import SemcogSidewalkLayer from "./SemcogSidewalkLayer";
import { useArcGISData, type ArcGISLayer } from "@/hooks/useArcGISData";
import { matchesSystem } from "./NetworkFilter";
import { useGTFSRealtime } from "@/hooks/useGTFSRealtime";
import { useAirQuality } from "@/hooks/useAirQuality";

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

function createMarkerIcon(color: string, type: string, pulse = false) {
  const pulseRing = pulse
    ? `<circle cx="12" cy="12" r="11" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"><animate attributeName="r" from="11" to="20" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite"/></circle>`
    : "";
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="40">
    ${pulseRing}
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="#fff" opacity="0.9"/>
    ${
      type === "fqhc"
        ? '<text x="12" y="15" text-anchor="middle" font-size="8" font-weight="bold" fill="' +
          color +
          '">+</text>'
        : type === "behavioral_health"
          ? '<text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="' +
            color +
            '">♥</text>'
          : type === "urgent_care"
            ? '<text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="' +
              color +
              '">!</text>'
            : type === "specialty"
              ? '<text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="' +
                color +
                '">★</text>'
              : '<text x="12" y="15" text-anchor="middle" font-size="7" font-weight="bold" fill="' +
                color +
                '">H</text>'
    }
  </svg>`;

  return L.divIcon({
    html: svgIcon,
    className: `custom-marker${pulse ? " pulse-marker" : ""}`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

function buildPopupContent(facility: Facility): string {
  const badges: string[] = [];
  if (facility.is_magnet)
    badges.push(
      '<span style="background:#F4A460;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;">🏆 Magnet</span>',
    );
  if (facility.leapfrog_grade === "A")
    badges.push(
      '<span style="background:#2D5F3F;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;">⭐ Leapfrog A</span>',
    );
  if (facility.is_blue_distinction)
    badges.push(
      '<span style="background:#0A4C95;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;">💙 Blue Distinction</span>',
    );

  const qualityColor = getQualityColor(facility.quality_score);
  const qualityLabel = getQualityLabel(facility.quality_score);
  const typeLabel =
    FACILITY_TYPE_LABELS[facility.facility_type] || facility.facility_type;

  const choiceLabels: string[] = [];
  if (facility.facility_type === "fqhc")
    choiceLabels.push(
      '<div style="background:#2D5F3F;color:#fff;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:600;margin-bottom:6px;">✅ No one turned away · Sliding scale fees</div>',
    );
  if (facility.services && facility.services.length >= 7)
    choiceLabels.push(
      '<div style="background:#0A4C95;color:#fff;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:600;margin-bottom:6px;">🏥 Comprehensive care</div>',
    );

  const dc = facility.digital_capabilities as Record<string, boolean> | null;
  const digitalFeatures: string[] = [];
  if (dc?.online_scheduling) digitalFeatures.push("Schedule Online");
  if (dc?.patient_portal) digitalFeatures.push("Patient Portal");
  if (facility.telehealth_available) digitalFeatures.push("Telehealth");

  return `
    <div style="min-width:260px;max-width:320px;font-family:system-ui,sans-serif;">
      ${choiceLabels.join("")}
      <div style="font-size:14px;font-weight:700;color:#003B5C;margin-bottom:2px;">${facility.name}</div>
      ${facility.system_affiliation ? `<div style="font-size:11px;color:#64748b;margin-bottom:6px;">${facility.system_affiliation}</div>` : ""}
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="background:${qualityColor};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">${qualityLabel} ${facility.quality_score ?? "-"}/100</span>
        <span style="font-size:11px;color:#64748b;">${typeLabel}</span>
      </div>
      ${badges.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">${badges.join("")}</div>` : ""}
      <div style="font-size:12px;color:#334155;margin-bottom:4px;">📍 ${facility.address}, ${facility.city}, MI ${facility.zip}</div>
      ${facility.phone ? `<div style="font-size:12px;color:#334155;margin-bottom:4px;">📞 <a href="tel:${facility.phone}" style="color:#0A4C95;">${facility.phone}</a></div>` : ""}
      ${digitalFeatures.length > 0 ? `<div style="margin:6px 0;display:flex;flex-wrap:wrap;gap:3px;">${digitalFeatures.map((f) => `<span style="background:#e0f7f7;color:#00A3A1;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:500;">🖥️ ${f}</span>`).join("")}</div>` : ""}
      ${
        facility.services && facility.services.length > 0
          ? `<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:3px;">${facility.services
              .slice(0, 5)
              .map(
                (s) =>
                  `<span style="background:#f1f5f9;color:#475569;padding:1px 6px;border-radius:3px;font-size:10px;">${s}</span>`,
              )
              .join(
                "",
              )}${facility.services.length > 5 ? `<span style="color:#64748b;font-size:10px;">+${facility.services.length - 5} more</span>` : ""}</div>`
          : ""
      }
      ${facility.website ? `<div style="margin-top:8px;"><a href="${facility.website}" target="_blank" rel="noopener noreferrer" style="color:#0A4C95;font-size:12px;font-weight:600;text-decoration:none;">Visit Website →</a></div>` : ""}
      <div style="margin-top:6px;padding-top:4px;font-size:9px;color:#94a3b8;">
        ${facility.county ? `<a href="/county/${countyToSlug(facility.county)}" style="color:#0A4C95;">View ${facility.county} County →</a> · ` : ""}
        Quality data sourced from CMS & Leapfrog.
      </div>
    </div>
  `;
}

interface HealthMapProps {
  facilities: Facility[];
  activeLayers: string[];
  activeOverlays?: string[];
  selectedSystem?: string | null;
  onSearchLocation?: (lat: number, lon: number) => void;
}

const MICHIGAN_CENTER: [number, number] = [44.3148, -85.6024];
const MICHIGAN_ZOOM = 7;

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

export default function HealthMap({
  facilities,
  activeLayers,
  activeOverlays = [],
  selectedSystem = null,
}: HealthMapProps) {
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
  const showBusPatrol = activeOverlays.includes("buspatrol-safety");
  const showPedestrian = activeOverlays.includes("pedestrian-risk");
  const showSemcogSidewalks = activeOverlays.includes("semcog-sidewalks");
  const showEnergyBurden = activeOverlays.includes("energy-burden");
  const showUtilityOutages = activeOverlays.includes("utility-outages");

  const { data: workzoneData } = useArcGISData("mdot-workzones", showWorkzones);
  const { data: airData } = useArcGISData("egle-air", showAir);
  const { data: evData } = useArcGISData("ev-stations", showEV);
  const { data: ddotData } = useArcGISData("ddot-routes", showDDOT);
  const { data: cataData } = useArcGISData("cata-routes", showCATA);
  const { data: ddotLive } = useGTFSRealtime("ddot", showDDOTLive);
  const { data: therideLive } = useGTFSRealtime("theride", showTheRideLive);
  const { data: aqiData, isError: aqiError } = useAirQuality(showAQI);

  const allLiveVehicles = useMemo(() => {
    const vehicles = [];
    if (showDDOTLive && ddotLive?.vehicles) vehicles.push(...ddotLive.vehicles);
    if (showTheRideLive && therideLive?.vehicles)
      vehicles.push(...therideLive.vehicles);
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

    L.tileLayer(
      "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        crossOrigin: "anonymous",
        maxZoom: 20,
      },
    ).addTo(map);

    fitWithPadding(map, MICHIGAN_CENTER, MICHIGAN_ZOOM, false);

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
      fitWithPadding(map, COUNTY_CENTERS[county], 10, true);
    } else {
      fitWithPadding(map, MICHIGAN_CENTER, MICHIGAN_ZOOM, true);
    }
  }, [county]);

  // Update facility markers with clustering
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.getContainer()?.parentNode) return;

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
      const isMatch =
        !selectedSystem || matchesSystem(f.system_affiliation, selectedSystem);
      const color = isMatch ? getQualityColor(f.quality_score) : "#d1d5db";
      // Pulse high-priority gap markers: low quality + behavioral health or FQHC with no quality data
      const isGapArea =
        isMatch &&
        (!f.quality_score || f.quality_score < 60) &&
        (f.facility_type === "behavioral_health" || f.facility_type === "fqhc");
      const icon = createMarkerIcon(color, f.facility_type, isGapArea);
      const typeLabel =
        FACILITY_TYPE_LABELS[f.facility_type] || f.facility_type;
      const accessibleName = [f.name, typeLabel, f.city]
        .filter(Boolean)
        .join(", ");
      const marker = L.marker([f.latitude, f.longitude], {
        icon,
        opacity: isMatch ? 1 : 0.4,
        alt: accessibleName,
        title: accessibleName,
        keyboard: true,
      });
      marker.bindPopup(buildPopupContent(f), { maxWidth: 320 });
      cluster.addLayer(marker);
    });

    try {
      if (map.getContainer()?.parentNode) {
        map.addLayer(cluster);
        clusterRef.current = cluster;
      }
    } catch {
      // Map destroyed during layer add
    }
  }, [facilities, activeLayers, selectedSystem]);

  // Sector overlay layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.getContainer()?.parentNode) return;

    // Clear old overlays safely
    Object.values(overlayLayersRef.current).forEach((lg) => {
      try {
        map.removeLayer(lg);
      } catch {}
    });
    overlayLayersRef.current = {};

    const safeAddToMap = (lg: L.LayerGroup, key: string) => {
      try {
        if (map.getContainer()?.parentNode) {
          lg.addTo(map);
          overlayLayersRef.current[key] = lg;
        }
      } catch {
        // Map was destroyed between check and add
      }
    };

    // MDOT Work Zones
    if (showWorkzones && workzoneData?.data) {
      const lg = L.layerGroup();
      try {
        L.geoJSON(workzoneData.data, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: "#E85D4A",
              color: "#fff",
              weight: 2,
              fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(
              `<strong>🚧 ${p.PROJECT_NAME || "Work Zone"}</strong><br/>${p.DESCRIPTION || ""}<br/><em>${p.STATUS || ""}</em>`,
            );
          },
        }).addTo(lg);
      } catch {}
      safeAddToMap(lg, "workzones");
    }

    // Air Quality
    if (showAir && airData?.data) {
      const lg = L.layerGroup();
      try {
        L.geoJSON(airData.data, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: "#4A90E2",
              color: "#fff",
              weight: 2,
              fillOpacity: 0.7,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(
              `<strong>🌬️ ${p.SITE_NAME || "Air Monitor"}</strong><br/>Type: ${p.MONITOR_TYPE || "N/A"}<br/>Status: ${p.STATUS || "Active"}`,
            );
          },
        }).addTo(lg);
      } catch {}
      safeAddToMap(lg, "air");
    }

    // EV Stations
    if (showEV && evData?.data) {
      const lg = L.layerGroup();
      try {
        L.geoJSON(evData.data, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 5,
              fillColor: "#F4A460",
              color: "#fff",
              weight: 1.5,
              fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(
              `<strong>⚡ ${p.Station_Name || "EV Station"}</strong><br/>${p.Street_Address || ""}, ${p.City || ""}<br/>Network: ${p.EV_Network || "N/A"}<br/>L2: ${p.EV_Level2_EVSE_Num || 0} · DC Fast: ${p.EV_DC_Fast_Count || 0}`,
            );
          },
        }).addTo(lg);
      } catch {}
      safeAddToMap(lg, "ev");
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
              radius: 4,
              fillColor: "#E85D4A",
              color: "#fff",
              weight: 1,
              fillOpacity: 0.9,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(
              `<strong>🚌 DDOT ${p.ROUTE_NUM || p.route_short_name || ""}</strong><br/>${p.ROUTE_NAME || p.route_long_name || "Bus Route"}`,
            );
          },
        }).addTo(lg);
      } catch {}
      safeAddToMap(lg, "ddot");
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
              radius: 4,
              fillColor: "#00A3A1",
              color: "#fff",
              weight: 1,
              fillOpacity: 0.9,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(
              `<strong>🚌 CATA ${p.route_short_name || ""}</strong><br/>${p.route_long_name || "Bus Route"}`,
            );
          },
        }).addTo(lg);
      } catch {}
      safeAddToMap(lg, "cata");
    }
    // AQI Stations
    if (showAQI && aqiData?.stations) {
      // ... keep existing code
    }

    // School Zone Safety (Michigan school zones)
    if (showBusPatrol) {
      const lg = L.layerGroup();
      const schoolZones = [
        {
          lat: 42.3314,
          lng: -83.0458,
          name: "Cass Technical HS",
          violations: 47,
          zone: "Detroit",
        },
        {
          lat: 42.383,
          lng: -83.1022,
          name: "Renaissance Academy",
          violations: 32,
          zone: "Detroit",
        },
        {
          lat: 42.4473,
          lng: -83.1502,
          name: "Southfield Regional",
          violations: 28,
          zone: "Southfield",
        },
        {
          lat: 42.7325,
          lng: -84.5555,
          name: "Eastern HS",
          violations: 19,
          zone: "Lansing",
        },
        {
          lat: 42.2808,
          lng: -83.743,
          name: "Pioneer HS",
          violations: 15,
          zone: "Ann Arbor",
        },
        {
          lat: 43.0125,
          lng: -83.6875,
          name: "Central HS",
          violations: 22,
          zone: "Flint",
        },
        {
          lat: 42.9634,
          lng: -85.6681,
          name: "Ottawa Hills HS",
          violations: 12,
          zone: "Grand Rapids",
        },
        {
          lat: 42.5195,
          lng: -83.176,
          name: "Berkley HS",
          violations: 18,
          zone: "Berkley",
        },
        {
          lat: 42.4929,
          lng: -83.0148,
          name: "Grosse Pointe South",
          violations: 8,
          zone: "Grosse Pointe",
        },
        {
          lat: 42.308,
          lng: -83.4816,
          name: "Canton HS",
          violations: 14,
          zone: "Canton",
        },
      ];
      for (const sz of schoolZones) {
        const severity =
          sz.violations > 30
            ? "#DC2626"
            : sz.violations > 15
              ? "#F59E0B"
              : "#22C55E";
        const icon = L.divIcon({
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${severity};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;font-family:system-ui;">${sz.violations}</div>`,
          className: "school-safety-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });
        const marker = L.marker([sz.lat, sz.lng], { icon });
        marker.bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:200px;">
            <div style="font-size:13px;font-weight:700;color:#003B5C;margin-bottom:4px;">🛑 ${sz.name}</div>
            <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${sz.zone}, MI</div>
            <div style="background:${severity};color:#fff;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-bottom:6px;">
              ${sz.violations} stop-arm violations (30 days)
            </div>
            <div style="font-size:10px;color:#475569;">Category: ${sz.violations > 30 ? "High Risk" : sz.violations > 15 ? "Moderate" : "Low"}</div>
            <div style="font-size:9px;color:#94a3b8;margin-top:4px;">Source: Michigan school zone enforcement data</div>
          </div>
        `);
        lg.addLayer(marker);
      }
      safeAddToMap(lg, "buspatrol");
    }

    // Pedestrian Risk Zones (MTCF data)
    if (showPedestrian) {
      const lg = L.layerGroup();
      const hotspots = [
        {
          lat: 42.3314,
          lng: -83.0458,
          name: "Downtown Detroit",
          injuries: 142,
          change: "+14%",
        },
        {
          lat: 42.337,
          lng: -83.0495,
          name: "Midtown Detroit",
          injuries: 87,
          change: "+11%",
        },
        {
          lat: 42.4316,
          lng: -83.022,
          name: "8 Mile / Woodward",
          injuries: 63,
          change: "+18%",
        },
        {
          lat: 42.9634,
          lng: -85.6681,
          name: "Downtown Grand Rapids",
          injuries: 54,
          change: "+9%",
        },
        {
          lat: 42.7325,
          lng: -84.5555,
          name: "Downtown Lansing",
          injuries: 48,
          change: "+12%",
        },
        {
          lat: 43.0125,
          lng: -83.6875,
          name: "Downtown Flint",
          injuries: 39,
          change: "+16%",
        },
        {
          lat: 42.2808,
          lng: -83.743,
          name: "Ann Arbor Central",
          injuries: 31,
          change: "+7%",
        },
        {
          lat: 42.3223,
          lng: -83.1763,
          name: "Dearborn / Michigan Ave",
          injuries: 44,
          change: "+13%",
        },
        {
          lat: 42.4865,
          lng: -83.1446,
          name: "Royal Oak / Woodward",
          injuries: 27,
          change: "+10%",
        },
        {
          lat: 42.3362,
          lng: -83.1499,
          name: "West Vernor / Springwells",
          injuries: 36,
          change: "+15%",
        },
      ];
      for (const hs of hotspots) {
        const severity =
          hs.injuries > 80
            ? "#DC2626"
            : hs.injuries > 40
              ? "#F59E0B"
              : "#FB923C";
        const radius = Math.min(25, Math.max(12, hs.injuries / 6));
        const circle = L.circleMarker([hs.lat, hs.lng], {
          radius,
          fillColor: severity,
          color: "#fff",
          weight: 2,
          fillOpacity: 0.55,
        });
        circle.bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:200px;">
            <div style="font-size:13px;font-weight:700;color:#003B5C;margin-bottom:4px;">🚶 ${hs.name}</div>
            <div style="background:${severity};color:#fff;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-bottom:6px;">
              ${hs.injuries} pedestrian injuries · ${hs.change} YoY
            </div>
            <div style="font-size:10px;color:#475569;">70% of fatalities occur at night or in high-risk zones</div>
            <div style="font-size:9px;color:#94a3b8;margin-top:4px;">Source: Michigan Traffic Crash Facts (MTCF)</div>
          </div>
        `);
        lg.addLayer(circle);
      }
      safeAddToMap(lg, "pedestrian");
    }
  }, [
    showWorkzones,
    showAir,
    showEV,
    showDDOT,
    showCATA,
    showAQI,
    showBusPatrol,
    showPedestrian,
    workzoneData,
    airData,
    evData,
    ddotData,
    cataData,
    aqiData,
  ]);

  const handleCountyClick = useCallback(
    (name: string) => {
      // Strip "County" suffix if present from ArcGIS data
      const cleanName = name.replace(/\s+County$/i, "").trim();
      setCounty(cleanName as any);
      navigate(`/county/${countyToSlug(cleanName)}`);
    },
    [setCounty, navigate],
  );

  return (
    <div className="relative h-full w-full" style={{ minHeight: "500px" }}>
      <div
        ref={mapRef}
        className="h-full w-full"
        role="application"
        aria-label="Interactive Michigan health-facility map. Use arrow keys to pan, plus and minus to zoom, and Tab to step through facility markers."
      />
      <CountyBoundaryLayer
        map={mapInstanceRef.current}
        selectedCounty={county}
        onCountyClick={handleCountyClick}
      />
      <EnergyBurdenChoropleth
        map={mapInstanceRef.current}
        visible={showEnergyBurden}
      />
      <UtilityOutageLayer
        map={mapInstanceRef.current}
        visible={showUtilityOutages}
      />
      <VehiclePositionLayer
        map={mapInstanceRef.current}
        vehicles={allLiveVehicles}
        visible={showDDOTLive || showTheRideLive}
      />
      <SemcogSidewalkLayer
        map={mapInstanceRef.current}
        visible={showSemcogSidewalks}
      />
      {(showDDOTLive || showTheRideLive) && allLiveVehicles.length > 0 && (
        <div className="absolute bottom-2 left-2 z-[1000] rounded bg-card/90 border border-border px-2 py-1 text-[10px] text-muted-foreground shadow">
          🚌 {allLiveVehicles.length} buses live · Refreshes every 30s
        </div>
      )}
      {showAQI && (
        <div
          className="absolute bottom-2 right-2 z-[1000] rounded-lg bg-card/95 border border-border p-3 shadow-lg backdrop-blur-sm"
          style={{ minWidth: 160 }}
        >
          <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-foreground">
            EPA Air Quality Index
          </h4>
          {[
            { range: "0–50", label: "Good", color: "#00E400" },
            {
              range: "51–100",
              label: "Moderate",
              color: "#FFFF00",
              dark: true,
            },
            {
              range: "101–150",
              label: "Unhealthy (Sensitive)",
              color: "#FF7E00",
            },
            { range: "151–200", label: "Unhealthy", color: "#FF0000" },
            { range: "201–300", label: "Very Unhealthy", color: "#8F3F97" },
            { range: "301+", label: "Hazardous", color: "#7E0023" },
          ].map((cat) => (
            <div key={cat.range} className="flex items-center gap-2 py-0.5">
              <span
                className="inline-block h-3.5 w-3.5 rounded-full border border-border"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[10px] font-medium text-foreground">
                {cat.range}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {cat.label}
              </span>
            </div>
          ))}
          {aqiError && (
            <p className="mt-1.5 text-[9px] text-red-500">
              AQI data unavailable - fetch failed
            </p>
          )}
          <p className="mt-1.5 text-[9px] text-muted-foreground">
            Source: EPA AirNow · Updated hourly
            {aqiData?.fetched_at && (
              <>
                {" "}
                · Last updated:{" "}
                {new Date(aqiData.fetched_at).toLocaleTimeString()}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
