# Data directory

- `va-counties.geojson`: generated from the existing `VA_shape.shp` using `python scripts/convert_shapefile.py`.
- `properties.csv`: optional local copy of `porpertySearch.csv` if you want to avoid remote fetches.
- `properties.sample.csv`: tiny sample to validate the UI offline; copy it to `properties.csv` if needed.

Create the GeoJSON before running the API:

```bash
cd modern-app/backend
pip install .[geodata]
python scripts/convert_shapefile.py --src ../../VA_shape.shp
```

Fetch the properties CSV locally (avoids runtime download failures):

```bash
python scripts/fetch_properties.py
```

If network is restricted, manually download `porpertySearch.csv` from GitHub and place it at `data/properties.csv`, or copy the sample:

```bash
cp data/properties.sample.csv data/properties.csv
```
