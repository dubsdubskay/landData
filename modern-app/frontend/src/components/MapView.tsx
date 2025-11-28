import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from "react-leaflet";
import { GeoJSON as LeafletGeoJSON, LatLngExpression } from "leaflet";
import { CountiesGeoJSON, Property } from "../types";

type Props = {
  counties?: CountiesGeoJSON;
  properties: Property[];
  selectedState?: string;
  selectedCounty?: string;
  selectedProperties: Property[];
};

const defaultCenter: LatLngExpression = [37.5, -77.4];

export default function MapView({
  counties,
  properties,
  selectedState,
  selectedCounty,
  selectedProperties,
}: Props) {
  const geoJsonRef = useRef<LeafletGeoJSON>(null);

  const geoJson = useMemo(() => counties ?? null, [counties]);

  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.setStyle((feature: any) => {
      const countyName = feature?.properties?.NAME ?? feature?.properties?.name;
      const stateName = feature?.properties?.STATE_N;

      // Check if this county is selected
      const isCountySelected = countyName && selectedCounty &&
        countyName.toLowerCase() === selectedCounty.toLowerCase();

      // Check if this county is in the selected state
      const isInSelectedState = stateName && selectedState &&
        stateName.toLowerCase() === selectedState.toLowerCase();

      if (isCountySelected) {
        // Highlighted county (bright yellow)
        return {
          color: "#ffffff",
          weight: 2,
          fillColor: "#ffeb3b",
          fillOpacity: 0.65,
        };
      } else if (isInSelectedState) {
        // State is selected, show all counties in that state with orange fill
        return {
          color: "#637084",
          weight: 1,
          fillColor: "#ff8c00",
          fillOpacity: 0.45,
        };
      } else {
        // Default styling for unselected counties
        return {
          color: "#637084",
          weight: 1,
          fillColor: "#637084",
          fillOpacity: 0.15,
        };
      }
    });
  }, [selectedState, selectedCounty, geoJson]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={6.5}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {geoJson ? (
        <GeoJSON
          data={geoJson as any}
          ref={geoJsonRef}
          style={(feature) => {
            const countyName = feature?.properties?.NAME ?? feature?.properties?.name;
            const stateName = feature?.properties?.STATE_N;

            const isCountySelected = countyName && selectedCounty &&
              countyName.toLowerCase() === selectedCounty.toLowerCase();

            const isInSelectedState = stateName && selectedState &&
              stateName.toLowerCase() === selectedState.toLowerCase();

            if (isCountySelected) {
              return {
                color: "#ffffff",
                weight: 2,
                fillColor: "#ffeb3b",
                fillOpacity: 0.65,
              };
            } else if (isInSelectedState) {
              return {
                color: "#637084",
                weight: 1,
                fillColor: "#ff8c00",
                fillOpacity: 0.45,
              };
            } else {
              return {
                color: "#637084",
                weight: 1,
                fillColor: "#637084",
                fillOpacity: 0.15,
              };
            }
          }}
        />
      ) : null}

      {selectedProperties.map((p, idx) => {
        return (
          <CircleMarker
            key={`${p.id || p.address}-${idx}`}
            center={[p.lat, p.long]}
            radius={Math.max(6, Math.min(18, Math.sqrt((p.acres || 1) * 4)))}
            pathOptions={{
              color: "#4a5568",
              fillColor: "#4a5568",
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <strong>{p.property_nm || "Unnamed Property"}</strong>
              {p.type && (
                <>
                  <br />
                  <em style={{ color: "#666" }}>Type: {p.type}</em>
                </>
              )}
              <br />
              {p.county}
              <br />
              ${p.cost?.toLocaleString?.() ?? p.cost} • {p.acres} acres
              {p.hours_home && (
                <>
                  <br />
                  {p.hours_home}h / {p.miles_home} mi from home
                </>
              )}
              {p.website_link && (
                <>
                  <br />
                  <a
                    href={p.website_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#b38a42", fontWeight: 600 }}
                  >
                    View Listing
                  </a>
                </>
              )}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
