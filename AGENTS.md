# Repository Guidelines

## Project Structure & Data
- `app.R` contains the Shiny UI/server logic, map rendering, and data wrangling.
- Shapefile assets live at `VA_shape.*` in the repo root; do not rename extensions or move without updating `st_read`.
- `www/` holds static assets (logos, images) referenced by the UI.
- `index.htm` is a simple landing page; `manifest.json` supports packaging.
- `packrat/` tracks R package dependencies; prefer restoring instead of ad hoc installs.

## Build, Run, and Development
- Restore libraries: `R -e "packrat::restore()"` (installs packages pinned by packrat).
- Run the app locally: `R -e "shiny::runApp('app.R', host='0.0.0.0', port=3838)"`.
- For quick iterations in RStudio: open `app.R` and click “Run App” (uses working directory root so shapefile paths resolve).
- Keep shapefiles and any new CSV data in repo root or adjust `st_read`/`read_csv` paths explicitly.

## Coding Style & Naming
- R code: 2-space indentation, snake_case for objects (`selected_country`), and clear reactive names (`selectedCounty` is existing; prefer descriptive variants for new code).
- Use `dplyr` pipes for data steps; avoid mutating globals in server unless necessary.
- Keep UI text and styling inlined or grouped near related components; add minimal, purposeful comments for non-obvious logic or leaflet options.

## Testing & Quality
- There is no automated test suite; validate changes by running the app and exercising:
  - State/county selection updates polygons and popups.
  - Table row selection drops circles with correct radius and popup values.
  - External CSV (`porpertySearch.csv`) still loads; handle offline failures gracefully.
- If adding data transforms, add small sanity checks (e.g., `stopifnot(all(c("Lat","Long") %in% names(df)))`).

## Commit & Pull Requests
- Commit messages: use present-tense, concise summaries (e.g., `Add county selection popup formatting`); include scope when useful.
- PRs should describe motivation, key UI/data changes, manual test notes, and any new dependencies. Attach before/after screenshots for UI tweaks and link related issues.
- Keep diffs small and grouped logically; mention any data file additions (especially shapefiles/CSVs) and their sources.

## Security & Data Handling
- Avoid embedding secrets; all data should come from committed shapefiles or public CSV URLs.
- When changing external data sources, document the URL and expected columns near the loader in `app.R`.
- Do not commit large binaries beyond necessary geodata; prefer compressed or remote sources if size grows.
