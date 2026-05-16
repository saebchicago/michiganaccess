import { useEffect, useRef } from "react";
import L from "leaflet";
import { useArcGISData } from "@/hooks/useArcGISData";

interface CountyBoundaryLayerProps {
  map: L.Map | null;
  selectedCounty?: string | null;
  onCountyClick?: (countyName: string) => void;
}

const STYLE_DEFAULT: L.PathOptions = {
  color: "hsl(209, 86%, 31%)",
  weight: 1.5,
  opacity: 0.5,
  fillOpacity: 0.03,
  fillColor: "hsl(209, 86%, 31%)",
};

const STYLE_SELECTED: L.PathOptions = {
  color: "hsl(209, 86%, 31%)",
  weight: 3,
  opacity: 0.9,
  fillOpacity: 0.12,
  fillColor: "hsl(209, 86%, 41%)",
};

const STYLE_HOVER: L.PathOptions = {
  weight: 2.5,
  fillOpacity: 0.08,
};

export default function CountyBoundaryLayer({ map, selectedCounty, onCountyClick }: CountyBoundaryLayerProps) {
  const { data: geoData } = useArcGISData("county-boundaries");
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!map || !geoData?.data) return;

    // Remove old layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const geojsonData = geoData.data;
    
    const geoLayer = L.geoJSON(geojsonData, {
      style: (feature) => {
        const name = feature?.properties?.NAME;
        return name === selectedCounty ? STYLE_SELECTED : STYLE_DEFAULT;
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.NAME;
        const pop = feature.properties?.POPULATION;
        
        const displayName = name?.replace(/\s+County$/i, "").trim() || name;
        layer.bindTooltip(
          `<strong>${displayName} County</strong>${pop ? `<br/>Pop: ${Number(pop).toLocaleString()}` : ""}`,
          { sticky: true, className: "county-tooltip" }
        );

        layer.on({
          mouseover: (e) => {
            if (name !== selectedCounty) {
              (e.target as L.Path).setStyle(STYLE_HOVER);
            }
          },
          mouseout: (e) => {
            if (name !== selectedCounty) {
              (e.target as L.Path).setStyle(STYLE_DEFAULT);
            }
          },
          click: () => {
            if (onCountyClick && name) {
              onCountyClick(name);
            }
          },
        });
      },
    });

    geoLayer.addTo(map);
    layerRef.current = geoLayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, geoData, selectedCounty, onCountyClick]);

  return null;
}
