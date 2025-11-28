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
  const rows = useMemo(
    () =>
      properties.map((p, idx) => ({
        id: p.id || p.address || idx,
        property_nm: p.property_nm || "Unnamed",
        county: p.county,
        type: p.type,
        acres: p.acres,
        cost: p.cost,
        hours_home: p.hours_home,
        miles_home: p.miles_home,
        website_link: p.website_link,
        address: p.address,
        lat: p.lat,
        long: p.long,
      })),
    [properties]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "property_nm", headerName: "Property Name", flex: 1, minWidth: 160 },
      { field: "county", headerName: "County", flex: 1, minWidth: 160 },
      {
        field: "type",
        headerName: "Type",
        width: 90,
        valueFormatter: (params) => (params.value || "").toUpperCase(),
      },
      {
        field: "acres",
        headerName: "Acres",
        type: "number",
        width: 100,
        headerAlign: "right",
        align: "right",
      },
      {
        field: "cost",
        headerName: "Cost",
        type: "number",
        width: 130,
        valueFormatter: (params) => `$${Number(params.value || 0).toLocaleString()}`,
        headerAlign: "right",
        align: "right",
      },
      {
        field: "hours_home",
        headerName: "Hrs From Home",
        type: "number",
        width: 130,
        headerAlign: "right",
        align: "right",
      },
      {
        field: "miles_home",
        headerName: "Miles From Home",
        type: "number",
        width: 140,
        headerAlign: "right",
        align: "right",
      },
      {
        field: "website_link",
        headerName: "Link",
        width: 80,
        renderCell: (params) =>
          params.value ? (
            <a
              href={params.value}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#b38a42", fontWeight: 600 }}
              onClick={(e) => e.stopPropagation()}
            >
              View
            </a>
          ) : null,
      },
    ],
    []
  );

  const selectedIds = useMemo(
    () => selectedProperties.map((p) => p.id || p.address),
    [selectedProperties]
  );

  return (
    <div style={{ height: 420, width: "100%", color: "#0f172a" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick={false}
        onRowClick={(params) => {
          const match = properties.find(
            (p) => (p.id || p.address) === params.id
          );
          if (match) {
            onSelect(match);
          }
        }}
        rowSelectionModel={selectedIds}
        checkboxSelection
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
          filter: { filterModel: { items: [] } },
        }}
        pageSizeOptions={[10, 25, 50]}
        loading={isLoading}
        slots={{ toolbar: CustomToolbar }}
        sx={{
          border: "1px solid rgba(171,137,77,0.6)",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          "& .MuiDataGrid-columnHeaders": {
            background: "linear-gradient(135deg, #b38a42, #7a5b20)",
            color: "#0f0f0f",
            fontWeight: 700,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(179, 138, 66, 0.08)",
          },
          "& .MuiDataGrid-selectedRowCount": {
            color: "#0f0f0f",
          },
        }}
      />
    </div>
  );
}
