import { Property } from "../types";

type Props = {
  properties: Property[];
  isLoading: boolean;
  selectedProperty: Property | null;
  onSelect: (property: Property | null) => void;
};

export default function PropertyTable({ properties, isLoading, selectedProperty, onSelect }: Props) {
  if (isLoading) {
    return <p>Loading properties…</p>;
  }

  if (!properties.length) {
    return <p>No properties found for this filter.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th>City</th>
            <th>County</th>
            <th>Acres</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => {
            const isActive = selectedProperty?.address === p.address;
            return (
              <tr
                key={p.address}
                onClick={() => onSelect(p)}
                style={{
                  cursor: "pointer",
                  backgroundColor: isActive ? "#e0f2fe" : "transparent",
                }}
              >
                <td>{p.city}</td>
                <td>{p.county}</td>
                <td>{p.acres}</td>
                <td>${p.cost?.toLocaleString?.() ?? p.cost}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
