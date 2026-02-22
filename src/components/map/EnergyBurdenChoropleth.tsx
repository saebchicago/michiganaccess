import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import { useArcGISData } from "@/hooks/useArcGISData";
import { useNavigate } from "react-router-dom";

// Import energy burden data inline to avoid circular deps
const ENERGY_BURDEN: Record<string, number> = {
  Wayne: 8.4, Oakland: 3.8, Macomb: 4.5, Washtenaw: 3.2, Livingston: 3.1,
  Monroe: 4.8, Lenawee: 5.6, Hillsdale: 6.4, "St. Clair": 5.5, Lapeer: 5.0,
  Sanilac: 6.5, Huron: 6.3, Tuscola: 6.2, Kent: 4.2, Ottawa: 3.5,
  Muskegon: 6.8, Allegan: 4.6, Barry: 4.8, Ionia: 5.4, Montcalm: 6.5,
  Newaygo: 6.6, Oceana: 7.0, Mason: 6.2, Lake: 9.2, Mecosta: 7.0,
  Osceola: 7.2, Kalamazoo: 5.0, Berrien: 6.5, Calhoun: 6.3, "Van Buren": 6.2,
  Cass: 5.8, "St. Joseph": 5.9, Branch: 6.4, Ingham: 5.1, Eaton: 4.2,
  Clinton: 3.9, Jackson: 5.8, Shiawassee: 5.5, Gratiot: 6.4, Isabella: 6.1,
  Genesee: 7.8, Saginaw: 7.2, Bay: 5.9, Midland: 4.0, Arenac: 7.2,
  Gladwin: 7.5, Clare: 8.5, Iosco: 7.8, "Grand Traverse": 4.5, Emmet: 5.2,
  Charlevoix: 5.0, Antrim: 5.8, Leelanau: 4.2, Benzie: 5.5, Manistee: 7.5,
  Wexford: 7.2, Missaukee: 6.8, Kalkaska: 7.0, Otsego: 5.8, Crawford: 7.8,
  Roscommon: 8.8, Ogemaw: 8.2, Oscoda: 9.0, Alcona: 8.6, Alpena: 6.5,
  Montmorency: 8.5, "Presque Isle": 8.0, Cheboygan: 6.8, Marquette: 5.8,
  Houghton: 6.8, Chippewa: 7.5, Delta: 6.2, Dickinson: 5.5, Menominee: 6.5,
  Iron: 7.8, Gogebic: 8.0, Baraga: 8.2, Ontonagon: 9.8, Keweenaw: 9.1,
  Luce: 9.5, Schoolcraft: 8.8, Alger: 7.2, Mackinac: 7.5,
};

function getBurdenColor(burden: number): string {
  if (burden < 4) return "#4caf73";   // green - low
  if (burden < 5) return "#8bc34a";   // light green
  if (burden < 6) return "#d4a017";   // gold - moderate
  if (burden < 8) return "#e67e22";   // orange - high
  return "#e74c3c";                   // red - critical
}

interface EnergyBurdenChoroplethProps {
  map: L.Map | null;
  visible?: boolean;
}

export default function EnergyBurdenChoropleth({ map, visible = true }: EnergyBurdenChoroplethProps) {
  const { data: geoData } = useArcGISData("county-boundaries", visible);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const legendRef = useRef<L.Control | null>(null);
  const navigate = useNavigate();

  const handleCountyClick = useCallback((name: string) => {
    const slug = name.toLowerCase().replace(/[\s.]+/g, "-");
    navigate(`/county/${slug}`);
  }, [navigate]);

  useEffect(() => {
    if (!map) return;

    // Remove layer if not visible
    if (!visible) {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
      if (legendRef.current) { map.removeControl(legendRef.current); legendRef.current = null; }
      return;
    }

    if (!geoData?.data) return;

    // Remove old
    if (layerRef.current) map.removeLayer(layerRef.current);
    if (legendRef.current) map.removeControl(legendRef.current);

    const geoLayer = L.geoJSON(geoData.data, {
      style: (feature) => {
        const name = feature?.properties?.NAME?.replace(/\s+County$/i, "").trim();
        const burden = name ? ENERGY_BURDEN[name] : null;
        return {
          color: "#fff",
          weight: 1.2,
          opacity: 0.8,
          fillColor: burden ? getBurdenColor(burden) : "#94a3b8",
          fillOpacity: 0.65,
        };
      },
      onEachFeature: (feature, layer) => {
        const rawName = feature.properties?.NAME;
        const name = rawName?.replace(/\s+County$/i, "").trim() || rawName;
        const burden = name ? ENERGY_BURDEN[name] : null;

        layer.bindTooltip(
          `<div style="text-align:center">
            <strong>${name} County</strong><br/>
            Energy Burden: <strong>${burden ? burden + "%" : "N/A"}</strong><br/>
            <span style="font-size:10px;color:#888">Click to view county page</span>
          </div>`,
          { sticky: true, className: "energy-tooltip" }
        );

        layer.on({
          mouseover: (e) => {
            (e.target as L.Path).setStyle({ weight: 3, fillOpacity: 0.85 });
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target as L.Path);
          },
          click: () => { if (name) handleCountyClick(name); },
        });
      },
    });

    geoLayer.addTo(map);
    layerRef.current = geoLayer;

    // Add legend
    const legend = new L.Control({ position: "bottomleft" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "energy-legend");
      div.innerHTML = `
        <div style="background:white;padding:8px 10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:11px;line-height:1.6">
          <strong style="display:block;margin-bottom:4px">⚡ Energy Burden</strong>
          <div><span style="display:inline-block;width:14px;height:10px;background:#4caf73;border-radius:2px;margin-right:4px"></span>&lt;4% Low</div>
          <div><span style="display:inline-block;width:14px;height:10px;background:#8bc34a;border-radius:2px;margin-right:4px"></span>4-5%</div>
          <div><span style="display:inline-block;width:14px;height:10px;background:#d4a017;border-radius:2px;margin-right:4px"></span>5-6% Moderate</div>
          <div><span style="display:inline-block;width:14px;height:10px;background:#e67e22;border-radius:2px;margin-right:4px"></span>6-8% High</div>
          <div><span style="display:inline-block;width:14px;height:10px;background:#e74c3c;border-radius:2px;margin-right:4px"></span>&gt;8% Critical</div>
          <div style="font-size:9px;color:#999;margin-top:4px">Source: ACEEE LEAD Tool</div>
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
  }, [map, geoData, visible, handleCountyClick]);

  return null;
}
