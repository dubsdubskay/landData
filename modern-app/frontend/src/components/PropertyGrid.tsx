import { DataGrid, GridColDef, GridToolbar, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { Property } from "../types";
import { useMemo } from "react";

type Props = {
  properties: Property[];
  isLoading: boolean;
  selectedProperties: Property[];
  onSelect: (property: Property) => void;
};

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbar />
      <GridToolbarExport csvOptions={{ fileName: "properties" }} />
    </GridToolbarContainer>
  );
}

export default function PropertyGrid({ properties, isLoading, selectedProperties, onSelect }: Props) {
  // Extract city from address (format: "street, city, state zip")
  const extractCity = (address: string) => {
    const parts = address.split(",");
    return parts.length >= 2 ? parts[1].trim() : "";
  };

  const rows = useMemo(
    () =>
      properties.map((p, idx) => ({
        id: p.id ?? p.address ?? idx,
        propertyId: p.id,
        property_nm: p.property_nm || "Unnamed",
        address: p.address,
        city: extractCity(p.address),
        county: p.county,
        acres: p.acres,
        type: p.type,
        cost: p.cost,
        hours_home: p.hours_home,
        miles_home: p.miles_home,
        contact_poc: p.contact_poc,
        date_contactd: p.date_contactd,
        lat: p.lat,
        long: p.long,
      })),
    [properties]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "propertyId",
        headerName: "ID",
        width: 60,
        type: "number",
        headerAlign: "left",
        align: "left",
      },
      {
        field: "property_nm",
        headerName: "Property Name",
        flex: 1,
        minWidth: 140
      },
      {
        field: "address",
        headerName: "Address",
        flex: 1.5,
        minWidth: 200
      },
      {
        field: "city",
        headerName: "City",
        width: 120
      },
      {
        field: "county",
        headerName: "County",
        width: 140
      },
      {
        field: "acres",
        headerName: "Acres",
        type: "number",
        width: 80,
        headerAlign: "right",
        align: "right",
      },
      {
        field: "type",
        headerName: "Type",
        width: 70,
        valueFormatter: (params) => (params.value || "").toUpperCase(),
      },
      {
        field: "cost",
        headerName: "Cost",
        type: "number",
        width: 110,
        valueFormatter: (params) => `$${Number(params.value || 0).toLocaleString()}`,
        headerAlign: "right",
        align: "right",
      },
      {
        field: "hours_home",
        headerName: "Hours",
        type: "number",
        width: 75,
        headerAlign: "right",
        align: "right",
      },
      {
        field: "miles_home",
        headerName: "Miles",
        type: "number",
        width: 75,
        headerAlign: "right",
        align: "right",
      },
      {
        field: "contact_poc",
        headerName: "Contact",
        width: 90,
      },
      {
        field: "date_contactd",
        headerName: "Date",
        width: 85,
      },
      {
        field: "lat",
        headerName: "Lat",
        type: "number",
        width: 85,
        valueFormatter: (params) => params.value?.toFixed(5),
        headerAlign: "right",
        align: "right",
      },
      {
        field: "long",
        headerName: "Long",
        type: "number",
        width: 85,
        valueFormatter: (params) => params.value?.toFixed(5),
        headerAlign: "right",
        align: "right",
      },
    ],
    []
  );

  const selectedIds = useMemo(
    () => selectedProperties.map((p) => p.id ?? p.address),
    [selectedProperties]
  );

  return (
    <div style={{ height: 420, width: "100%", color: "#e2e8f0" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick={false}
        onRowClick={(params) => {
          const match = properties.find(
            (p) => (p.id ?? p.address) === params.id
          );
          if (match) {
            onSelect(match);
          }
        }}
        rowSelectionModel={selectedIds}
        checkboxSelection
        rowHeight={36}
        columnHeaderHeight={44}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
          filter: { filterModel: { items: [] } },
        }}
        pageSizeOptions={[10, 25, 50]}
        loading={isLoading}
        slots={{ toolbar: CustomToolbar }}
        sx={{
          border: "1px solid rgba(179,138,66,0.3)",
          borderRadius: "8px",
          backgroundColor: "#1a1f2e",
          color: "#e2e8f0",
          fontSize: "0.875rem",
          "& .MuiDataGrid-columnHeaders": {
            background: "linear-gradient(135deg, #b38a42, #8b6f3a)",
            color: "#0f1621",
            fontWeight: 700,
            fontSize: "0.875rem",
            minHeight: "44px !important",
            maxHeight: "44px !important",
          },
          "& .MuiDataGrid-columnHeader": {
            padding: "0 8px",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid rgba(179,138,66,0.15)",
            color: "#e2e8f0",
            padding: "0 8px",
            fontSize: "0.875rem",
          },
          "& .MuiDataGrid-row": {
            backgroundColor: "#1a1f2e",
            "&:nth-of-type(odd)": {
              backgroundColor: "#151923",
            },
            "&:hover": {
              backgroundColor: "rgba(179, 138, 66, 0.15)",
            },
            "&.Mui-selected": {
              backgroundColor: "rgba(179, 138, 66, 0.25)",
              "&:hover": {
                backgroundColor: "rgba(179, 138, 66, 0.35)",
              },
            },
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#151923",
            borderTop: "1px solid rgba(179,138,66,0.3)",
            color: "#e2e8f0",
          },
          "& .MuiTablePagination-root": {
            color: "#e2e8f0",
          },
          "& .MuiTablePagination-selectIcon": {
            color: "#b38a42",
          },
          "& .MuiCheckbox-root": {
            color: "#b38a42",
            "&.Mui-checked": {
              color: "#b38a42",
            },
          },
          "& .MuiDataGrid-toolbarContainer": {
            padding: "8px",
            backgroundColor: "#151923",
            borderBottom: "1px solid rgba(179,138,66,0.3)",
            "& button": {
              color: "#b38a42",
              "&:hover": {
                backgroundColor: "rgba(179, 138, 66, 0.1)",
              },
            },
          },
          "& .MuiDataGrid-selectedRowCount": {
            color: "#e2e8f0",
          },
          "& a": {
            color: "#f5d9a6",
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": {
              color: "#b38a42",
              textDecoration: "underline",
            },
          },
        }}
      />
    </div>
  );
}
