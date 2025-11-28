import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import client from "./api/client";
import { CountiesGeoJSON, Property, State } from "./types";
import MapView from "./components/MapView";
import PropertyGrid from "./components/PropertyGrid";
import SelectedPropertiesList from "./components/SelectedPropertiesList";
import kulzyLogo from "./images/Kulzy-Design-Logo2Gold.png";

const countyLabel = (feature: any): string | undefined =>
  feature?.properties?.NAME ?? feature?.properties?.name;

export default function App() {
  const [selectedState, setSelectedState] = useState<string>("Virginia");
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [countyFilter, setCountyFilter] = useState<string>("");
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);

  const {
    data: states,
    error: statesError,
  } = useQuery<State[]>({
    queryKey: ["states"],
    queryFn: async () => {
      const res = await client.get("/states");
      return res.data;
    },
  });

  const {
    data: counties,
    error: countiesError,
    isFetching: loadingCounties,
  } = useQuery<CountiesGeoJSON>({
    queryKey: ["counties", selectedState],
    queryFn: async () => {
      const res = await client.get("/counties", {
        params: selectedState ? { state: selectedState } : {},
      });
      return res.data;
    },
    enabled: Boolean(selectedState),
  });

  const {
    data: properties,
    isLoading: loadingProps,
    error: propsError,
  } = useQuery<Property[]>({
    queryKey: ["properties", countyFilter],
    queryFn: async () => {
      const res = await client.get("/properties", {
        params: countyFilter ? { county: countyFilter } : {},
      });
      return res.data;
    },
  });

  const stateOptions = useMemo(() => {
    if (!states) return [];
    return states.map((s) => ({ value: s.name, label: `${s.name} (${s.abbreviation})` }));
  }, [states]);

  const countyOptions = useMemo(() => {
    if (!counties) return [];
    const names = counties.features
      .map((f) => countyLabel(f))
      .filter((x): x is string => Boolean(x));
    return Array.from(new Set(names))
      .sort()
      .map((name) => ({ value: name, label: name }));
  }, [counties]);

  const togglePropertySelection = (property: Property) => {
    setSelectedProperties((prev) => {
      const isSelected = prev.some(
        (p) => (p.id && p.id === property.id) || (p.address === property.address)
      );
      if (isSelected) {
        return prev.filter(
          (p) => !((p.id && p.id === property.id) || (p.address === property.address))
        );
      } else {
        return [...prev, property];
      }
    });
  };

  const removeProperty = (property: Property) => {
    setSelectedProperties((prev) =>
      prev.filter(
        (p) => !((p.id && p.id === property.id) || (p.address === property.address))
      )
    );
  };

  const exportCsv = () => {
    if (!properties?.length) return;
    const header = ["property_nm", "county", "type", "acres", "cost", "hours_home", "miles_home", "address", "website_link", "lat", "long"];
    const rows = properties.map((p) => header.map((key) => (p as any)[key] ?? ""));
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "properties.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPdf = () => {
    if (!properties?.length) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Virginia Land Explorer", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Property Name", "County", "Type", "Acres", "Cost", "Hrs From Home", "Miles From Home"]],
      body: properties.map((p) => [
        p.property_nm || "Unnamed",
        p.county,
        p.type?.toUpperCase() || "",
        p.acres,
        `$${Number(p.cost || 0).toLocaleString()}`,
        p.hours_home || "",
        p.miles_home || "",
      ]),
      styles: { fontSize: 8 },
    });
    doc.save("properties.pdf");
  };

  return (
    <div className="app-shell">
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <img
          src={kulzyLogo}
          alt="Kulzy Design"
          style={{
            maxWidth: "180px",
            width: "100%",
            height: "auto",
          }}
        />
      </div>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <p className="badge">Modernized</p>
      </div>

      <header style={{ marginBottom: "1rem", textAlign: "center" }}>
        <h1 className="heading">Virginia Land Explorer</h1>
        <p className="subdued">
          Select a county, explore parcels, and view them on the map with Kulzy-inspired styling.
        </p>
      </header>

      <div className="panel">
        <div className="controls">
          <label style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.25rem", color: "#f5d9a6" }}>
              State
            </div>
            <Select
              isSearchable
              placeholder="Select a state..."
              options={stateOptions}
              value={stateOptions.find((s) => s.value === selectedState) || null}
              onChange={(opt) => {
                setSelectedState(opt?.value || "");
                setSelectedCounty("");
                setCountyFilter("");
                setSelectedProperties([]);
              }}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#0f1621",
                  borderColor: "#b38a42",
                  color: "#f5d9a6",
                  boxShadow: "none",
                  minHeight: "46px",
                }),
                singleValue: (base) => ({ ...base, color: "#f5d9a6" }),
                input: (base) => ({ ...base, color: "#f5d9a6" }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#111827",
                  color: "#f5d9a6",
                  zIndex: 9999,
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "rgba(179,138,66,0.2)" : "transparent",
                  color: "#f5d9a6",
                }),
              }}
            />
          </label>

          <div>
            <div style={{ fontWeight: 700, marginBottom: "0.25rem", color: "#f5d9a6" }}>
              County filter
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <Select
                  isClearable
                  isSearchable
                  placeholder="Search counties..."
                  options={countyOptions}
                  value={countyOptions.find((c) => c.value === selectedCounty) || null}
                  onChange={(opt) => {
                    setSelectedCounty(opt?.value || "");
                  }}
                  isDisabled={!selectedState}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: "#0f1621",
                      borderColor: "#b38a42",
                      color: "#f5d9a6",
                      boxShadow: "none",
                      minHeight: "46px",
                    }),
                    singleValue: (base) => ({ ...base, color: "#f5d9a6" }),
                    input: (base) => ({ ...base, color: "#f5d9a6" }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "#111827",
                      color: "#f5d9a6",
                      zIndex: 9999,
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? "rgba(179,138,66,0.2)" : "transparent",
                      color: "#f5d9a6",
                    }),
                  }}
                />
              </div>
              <button
                className="btn"
                onClick={() => setCountyFilter(selectedCounty)}
                disabled={!selectedCounty}
                style={{ padding: "0.5rem 0.75rem", minWidth: "auto", whiteSpace: "nowrap" }}
              >
                Filter
              </button>
              {countyFilter && (
                <button
                  className="btn secondary"
                  onClick={() => {
                    setCountyFilter("");
                    setSelectedCounty("");
                  }}
                  style={{ padding: "0.5rem 0.75rem", minWidth: "auto", whiteSpace: "nowrap" }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="toolbar">
          <button className="btn" onClick={exportCsv} disabled={!properties?.length}>
            Export CSV
          </button>
          <button className="btn secondary" onClick={exportPdf} disabled={!properties?.length}>
            Save as PDF
          </button>
        </div>

        {statesError ? (
          <p style={{ color: "crimson" }}>
            Failed to load states: {(statesError as Error).message}
          </p>
        ) : null}

        {countiesError ? (
          <p style={{ color: "crimson" }}>
            Failed to load counties: {(countiesError as Error).message}
          </p>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1rem", marginBottom: "1rem" }}>
          <div className="map-wrapper">
            <MapView
              counties={counties}
              properties={properties ?? []}
              selectedState={selectedState}
              selectedCounty={selectedCounty}
              selectedProperties={selectedProperties}
            />
          </div>

          <div
            style={{
              border: "1px solid rgba(171, 137, 77, 0.6)",
              borderRadius: "12px",
              backgroundColor: "#1a1f2e",
              height: "500px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "0.75rem 1rem",
                borderBottom: "1px solid rgba(171, 137, 77, 0.4)",
                background: "linear-gradient(135deg, #b38a42, #7a5b20)",
                color: "#0f0f0f",
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              Selected Properties ({selectedProperties.length})
            </div>
            <SelectedPropertiesList
              selectedProperties={selectedProperties}
              onRemove={removeProperty}
            />
          </div>
        </div>

        {propsError ? (
          <p style={{ color: "crimson" }}>
            Failed to load properties: {(propsError as Error).message}
          </p>
        ) : null}

        <PropertyGrid
          properties={properties ?? []}
          isLoading={loadingProps || loadingCounties}
          onSelect={togglePropertySelection}
          selectedProperties={selectedProperties}
        />
      </div>
    </div>
  );
}
