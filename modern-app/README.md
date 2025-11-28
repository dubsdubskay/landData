# Modern Web App (React + FastAPI)

This folder contains a parallel modernization of the Shiny app:

- **Backend**: FastAPI serves county GeoJSON and property listings.
- **Frontend**: React (Vite) renders the map and table with reusable components.

## Prerequisites
- Python 3.10+ (with `pip`)
- Node 18+

## Backend (FastAPI)
```bash
cd modern-app/backend
pip install .[geodata]  # include geodata extras to convert the shapefile
python scripts/convert_shapefile.py --src ../../VA_shape.shp  # writes data/va-counties.geojson
uvicorn app.main:app --reload --port 8000
```

- Place a local copy of `porpertySearch.csv` at `modern-app/backend/data/properties.csv` to avoid remote fetches.
- Endpoints:
  - `GET /health`
  - `GET /counties` -> GeoJSON feature collection
  - `GET /properties?county=Chesterfield` -> property list, optionally filtered by county name

## Frontend (React + Vite)
```bash
cd modern-app/frontend
npm install
npm run dev  # opens http://localhost:5173 and proxies /api to :8000
```

- Key pieces: `src/components/MapView.tsx`, `PropertyGrid.tsx`, `src/App.tsx`.
- Uses `react-leaflet` for map rendering, React Query for data fetching/caching, `react-select` for searchable filters, and MUI DataGrid for sortable/filterable/resizable tables with CSV/PDF export.

## Workflow
1) Convert shapefile -> GeoJSON with the script above.
2) Start the FastAPI server.
3) Run the Vite dev server; map and table should load live data.
4) For production, run `npm run build` and serve the built `dist/` (e.g., behind Nginx) with the FastAPI API.
