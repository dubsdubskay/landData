# Project Log

## 2025-11-27 (Session 2)
- **Real Data Integration**: Updated backend and frontend to work with actual `properties.csv` file
  - Removed dependency on non-existent `city` column
  - Added support for: `id`, `property_nm`, `type` (water/dry), `hours_home`, `miles_home`, `contact_poc`, `date_contactd`, `website_link`
  - Updated backend validation and numeric conversions for all fields
  - Enhanced frontend types (`Property`) to match real data structure
  - Updated PropertyGrid to display all relevant columns with clickable website links
  - Updated CSV/PDF exports with new column structure (landscape PDF format)

- **State Selection Feature**: Added state dropdown and filtering
  - New backend endpoint `/states` returns unique states from GeoJSON
  - Updated `/counties` endpoint to accept optional `state` query parameter
  - Frontend state dropdown (defaults to "Virginia") filters counties automatically
  - County dropdown disabled until state is selected
  - Map highlights selected state in prominent orange (fillOpacity: 0.45)
  - State changes clear county filter and property selections

- **Multi-Selection System**: Replaced single property selection with multi-select
  - Created `SelectedPropertiesList` component - scrollable sidebar (320px) showing selected properties
  - Displays property name, city (extracted from address), and clickable website link
  - Individual remove buttons ('X') on each item
  - PropertyGrid now has checkbox multi-selection
  - Selected properties appear as dark gray markers (`#4a5568`) on map
  - Properties hidden by default - only show when selected
  - Persistent highlighting until manually removed

- **Manual County Filtering**: Changed from auto-filter to manual
  - Selecting county now only highlights it on map (bright yellow `#ffeb3b`, opacity: 0.65)
  - Added compact "Filter" button next to county dropdown
  - Properties load only when user clicks Filter button
  - "Clear" button appears when filter is active
  - Buttons use inline layout with reduced padding

- **Visual Enhancements**:
  - County selection: Bright yellow (`#ffeb3b`) with 0.65 opacity
  - Property markers: Dark gray (`#4a5568`) circles
  - State highlighting: More prominent orange (0.45 opacity)
  - Fixed dropdown z-index issues with portal rendering
  - MapView popups enhanced with property type, distance info, website links

- **Technical Improvements**:
  - All dropdowns use `menuPortalTarget={document.body}` to appear above map
  - Proper state management for `selectedState`, `selectedCounty`, `countyFilter`, `selectedProperties`
  - Updated MapView to work with `selectedProperties` array instead of single property
  - City extraction utility added to parse address field

## 2025-11-27 (Session 1)
- Start: 06:00 UTC (approx) — Stop: 06:15 UTC
- Added contributor guide `AGENTS.md`.
- Modern app scaffold in `modern-app/`:
  - Backend: FastAPI (`app/main.py`) with CORS and endpoints `/health`, `/counties` (GeoJSON), `/properties?county=` (CSV->JSON). `pyproject.toml` set up with extras `.[geodata]`.
  - Data tooling: `scripts/convert_shapefile.py` (GeoJSON conversion with status logs), `scripts/fetch_properties.py` (downloads `porpertySearch.csv`, now surfaces failures), `data/properties.sample.csv` for offline use; `data/README.md` explains conversions and manual fetch/copy.
  - Frontend: Vite/React/TypeScript with `react-leaflet` map and `PropertyTable`; main wiring in `src/App.tsx`, components in `src/components/`, styling in `src/styles/index.css`, API client with React Query.
  - Dev proxy fixed (`vite.config.ts` rewrites `/api/*` to backend roots) after initial blank UI; added error display for counties/properties fetches.
- Verified county GeoJSON loads locally; properties feed requires `data/properties.csv` (sample provided until real CSV available). Noted network restriction blocked GitHub fetch; documented manual download/copy.
- Documentation refreshed: `modern-app/README.md` (setup/run), `modern-app/backend/data/README.md` (data handling and sample usage).
- UI refresh: Kulzy-inspired dark/gold theme, searchable county select (`react-select`), MUI DataGrid with sorting/filtering/resizing, CSV/PDF export, updated map styling, and new `PropertyGrid` component replacing basic table.
