# Context for Assistants

## Current State
- Legacy Shiny app (`app.R`) remains in the repo root. New modern stack lives in `modern-app/` (FastAPI backend + React/Vite frontend).
- Backend (`modern-app/backend/app/main.py`):
  - Endpoints: `/health`, `/states`, `/counties?state=`, `/properties?county=`
  - `/states` returns unique states from GeoJSON with name and abbreviation
  - `/counties` accepts optional state parameter for filtering
  - `/properties` accepts optional county parameter for filtering
  - Data: `modern-app/backend/data/va-counties.geojson` (129 VA counties), `data/properties.csv` (real property data with 7 properties)
  - Property fields: `id`, `property_nm`, `address`, `county`, `acres`, `type` (water/dry), `cost`, `hours_home`, `miles_home`, `contact_poc`, `date_contactd`, `website_link`, `Lat`, `Long`
  - Column normalization: strips/lowercases/replaces spaces with underscores
  - Numeric conversion for: lat, long, cost, acres, id, hours_home, miles_home

- Frontend (`modern-app/frontend`): Vite/React/TypeScript with multiple components
  - **App.tsx**: Main layout with state/county/countyFilter state management
  - **MapView**: react-leaflet map showing:
    - Selected state in orange (fillOpacity: 0.45)
    - Selected county in bright yellow (#ffeb3b, opacity: 0.65)
    - Selected properties as dark gray circles (#4a5568)
    - Properties only visible when selected (not shown by default)
    - Popups with property details, type, distance info, website links
  - **PropertyGrid**: MUI DataGrid with:
    - Multi-select checkboxes
    - Columns: Property Name, County, Type, Acres, Cost, Hrs/Miles from Home, Website Link
    - Sortable/filterable/resizable
    - CSV export via DataGrid toolbar
  - **SelectedPropertiesList**: Sidebar (320px) showing selected properties
    - Scrollable list with property name, city (extracted from address), website link
    - Individual remove buttons ('X')
    - Kulzy gold/dark themed
  - **State/County Selection**:
    - State dropdown (defaults to "Virginia") filters counties
    - County dropdown with "Filter" button for manual property loading
    - "Clear" button when county filter is active
    - All dropdowns use portal rendering (zIndex: 9999) to appear above map
  - CSV/PDF export updated with all property columns (PDF in landscape)
  - Styling: Kulzy gold/dark palette (#b38a42, #f5d9a6, #0f1621, #1a1f2e)

- Proxy: Vite rewrites `/api/*` to backend root (`http://localhost:8000/*`)
- Dev Servers: Backend on `:8000`, Frontend on `:5173` or `:5174`
- Known warnings: Node util._extend deprecation on dev startup (harmless)

## Recent Work (2025-11-27 Session 2)
- **Real data integration**: Updated backend/frontend for actual `properties.csv` structure (removed city dependency, added all new fields)
- **State selection**: Added state dropdown, `/states` endpoint, state-based county filtering, prominent orange state highlighting
- **Multi-selection**: Created `SelectedPropertiesList` sidebar, checkbox multi-select in grid, dark gray property markers
- **Manual filtering**: Changed county selection to map-highlight only, added "Filter" button for manual property loading
- **Visual enhancements**: Bright yellow county selection, dark gray property markers, improved opacity/colors, fixed z-index issues
- See `project-log.md` for detailed changes

## Open Items / Next Steps
- **Deployment**: Determine deployment patterns for backend + frontend (containerization, hosting platform, CI/CD)
- Potential features: chatbot widget, branding/logo placement, richer map imagery
- Data expansion: Add more states/counties to GeoJSON if needed
