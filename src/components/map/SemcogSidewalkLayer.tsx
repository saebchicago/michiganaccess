import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";

const SEMCOG_SIDEWALKS_URL =
  "https://gis.semcog.org/server/rest/services/Hosted/Sidewalks_and_Crosswalks/FeatureServer/0/query";
const SEMCOG_CROSSWALKS_URL =
  "https://gis.semcog.org/server/rest/services/Hosted/Sidewalks_and_Crosswalks/FeatureServer/1/query";

// SE Michigan bounding box (7 SEMCOG counties)
const SEMCOG_BOUNDS: L.LatLngBoundsExpression = [
  [41.7, -84.4], // SW corner
  [43.1, -82.4], // NE corner
];

// Minimum zoom to start loading data (avoid overwhelming the API)
const MIN_ZOOM = 13;

interface SemcogSidewalkLayerProps {
  map: L.Map | null;
  visible?: boolean;
}

async function fetchGeoJSON(url: string, bounds: L.LatLngBounds): Promise<GeoJSON.FeatureCollection | null> {
  const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
  const params = new URLSearchParams({
    where: "1=1",
    geometry: bbox,
    geometryType: "esriGeometryEnvelope",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    f: "geojson",
    resultRecordCount: "2000",
  });

  try {
    const res = await fetch(`${url}?${params}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function SemcogSidewalkLayer({ map, visible = false }: SemcogSidewalkLayerProps) {
  const sidewalkLayerRef = useRef<L.LayerGroup | null>(null);
  const crosswalkLayerRef = useRef<L.LayerGroup | null>(null);
  const legendRef = useRef<L.Control | null>(null);
  const abortRef = useRef(0);

  const loadData = useCallback(async () => {
    if (!map || !visible) return;

    const zoom = map.getZoom();
    if (zoom < MIN_ZOOM) return;

    const bounds = map.getBounds();
    // Only load if within SEMCOG's coverage area
    const semcogBounds = L.latLngBounds(SEMCOG_BOUNDS);
    if (!bounds.intersects(semcogBounds)) return;

    const requestId = ++abortRef.current;

    const [sidewalks, crosswalks] = await Promise.all([
      fetchGeoJSON(SEMCOG_SIDEWALKS_URL, bounds),
      fetchGeoJSON(SEMCOG_CROSSWALKS_URL, bounds),
    ]);

    // Abort if a newer request was made
    if (requestId !== abortRef.current) return;
    if (!map.getContainer()?.parentNode) return;

    // Clear old layers
    if (sidewalkLayerRef.current) {
      try { map.removeLayer(sidewalkLayerRef.current); } catch {}
    }
    if (crosswalkLayerRef.current) {
      try { map.removeLayer(crosswalkLayerRef.current); } catch {}
    }

    // Sidewalks: thin teal lines
    if (sidewalks?.features?.length) {
      const lg = L.layerGroup();
      L.geoJSON(sidewalks, {
        style: () => ({
          color: "#00A3A1",
          weight: 2,
          opacity: 0.7,
        }),
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          layer.bindPopup(
            `<div style="font-family:system-ui,sans-serif;">
              <div style="font-size:13px;font-weight:700;color:#003B5C;margin-bottom:4px;">Sidewalk</div>
              ${p.STREET_NAME ? `<div style="font-size:11px;color:#64748b;">${p.STREET_NAME}</div>` : ""}
              ${p.MUNICIPALITY ? `<div style="font-size:11px;color:#64748b;">${p.MUNICIPALITY}</div>` : ""}
              <div style="font-size:9px;color:#94a3b8;margin-top:4px;">Source: SEMCOG (AI-digitized, ~Tier 1-2)</div>
            </div>`
          );
        },
      }).addTo(lg);
      lg.addTo(map);
      sidewalkLayerRef.current = lg;
    }

    // Crosswalks: dashed coral lines
    if (crosswalks?.features?.length) {
      const lg = L.layerGroup();
      L.geoJSON(crosswalks, {
        style: () => ({
          color: "#E85D4A",
          weight: 2,
          opacity: 0.7,
          dashArray: "4, 6",
        }),
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          layer.bindPopup(
            `<div style="font-family:system-ui,sans-serif;">
              <div style="font-size:13px;font-weight:700;color:#003B5C;margin-bottom:4px;">Crosswalk</div>
              ${p.STREET_NAME ? `<div style="font-size:11px;color:#64748b;">${p.STREET_NAME}</div>` : ""}
              ${p.MUNICIPALITY ? `<div style="font-size:11px;color:#64748b;">${p.MUNICIPALITY}</div>` : ""}
              <div style="font-size:9px;color:#94a3b8;margin-top:4px;">Source: SEMCOG (AI-digitized, ~Tier 1-2)</div>
            </div>`
          );
        },
      }).addTo(lg);
      lg.addTo(map);
      crosswalkLayerRef.current = lg;
    }
  }, [map, visible]);

  // Show/hide legend and load on visibility change
  useEffect(() => {
    if (!map) return;

    if (visible) {
      // Add legend
      if (!legendRef.current) {
        const legend = new L.Control({ position: "bottomleft" });
        legend.onAdd = () => {
          const div = L.DomUtil.create("div");
          div.innerHTML = `
            <div style="background:rgba(255,255,255,0.95);border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-family:system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
              <div style="font-size:11px;font-weight:700;margin-bottom:4px;">Sidewalks & Crosswalks (SEMCOG)</div>
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                <span style="display:inline-block;width:20px;height:2px;background:#00A3A1;"></span>
                <span style="font-size:10px;color:#475569;">Sidewalk</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="display:inline-block;width:20px;height:2px;background:#E85D4A;border-top:1px dashed #E85D4A;"></span>
                <span style="font-size:10px;color:#475569;">Crosswalk</span>
              </div>
              <div style="font-size:9px;color:#94a3b8;margin-top:4px;">Zoom to z13+ in SE Michigan · SEMCOG 7-county area</div>
            </div>`;
          return div;
        };
        legend.addTo(map);
        legendRef.current = legend;
      }

      loadData();

      // Reload on moveend
      map.on("moveend", loadData);
    } else {
      // Remove layers
      if (sidewalkLayerRef.current) {
        try { map.removeLayer(sidewalkLayerRef.current); } catch {}
        sidewalkLayerRef.current = null;
      }
      if (crosswalkLayerRef.current) {
        try { map.removeLayer(crosswalkLayerRef.current); } catch {}
        crosswalkLayerRef.current = null;
      }
      if (legendRef.current) {
        try { map.removeControl(legendRef.current); } catch {}
        legendRef.current = null;
      }
      map.off("moveend", loadData);
    }

    return () => {
      map.off("moveend", loadData);
    };
  }, [map, visible, loadData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map && map.getContainer()?.parentNode) {
        if (sidewalkLayerRef.current) try { map.removeLayer(sidewalkLayerRef.current); } catch {}
        if (crosswalkLayerRef.current) try { map.removeLayer(crosswalkLayerRef.current); } catch {}
        if (legendRef.current) try { map.removeControl(legendRef.current); } catch {}
      }
    };
  }, [map]);

  return null;
}
