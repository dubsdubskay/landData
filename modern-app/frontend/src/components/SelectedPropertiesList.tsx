import { Property } from "../types";

type Props = {
  selectedProperties: Property[];
  onRemove: (property: Property) => void;
};

// Extract city from address (between first and second comma)
const extractCity = (address: string): string => {
  const parts = address.split(",");
  if (parts.length >= 2) {
    return parts[1].trim();
  }
  return "";
};

export default function SelectedPropertiesList({ selectedProperties, onRemove }: Props) {
  if (selectedProperties.length === 0) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "0.9rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        Select properties from the table to view them here
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "0.75rem",
      }}
    >
      {selectedProperties.map((property, idx) => {
        const city = extractCity(property.address);
        return (
          <div
            key={property.id || property.address || idx}
            style={{
              backgroundColor: "#0f1621",
              border: "1px solid rgba(179, 138, 66, 0.4)",
              borderRadius: "8px",
              padding: "0.75rem",
              marginBottom: "0.75rem",
              position: "relative",
            }}
          >
            <button
              onClick={() => onRemove(property)}
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                background: "rgba(220, 38, 38, 0.8)",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(220, 38, 38, 1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(220, 38, 38, 0.8)";
              }}
              title="Remove from selection"
            >
              ×
            </button>

            <div style={{ paddingRight: "2rem" }}>
              <div
                style={{
                  color: "#f5d9a6",
                  fontWeight: 600,
                  fontSize: "1rem",
                  marginBottom: "0.25rem",
                }}
              >
                {property.property_nm || "Unnamed Property"}
              </div>

              {city && (
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {city}
                </div>
              )}

              {property.website_link && (
                <a
                  href={property.website_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#b38a42",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    display: "inline-block",
                    marginTop: "0.25rem",
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#c29c4c";
                    e.currentTarget.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#b38a42";
                    e.currentTarget.style.textDecoration = "none";
                  }}
                >
                  View Listing →
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
