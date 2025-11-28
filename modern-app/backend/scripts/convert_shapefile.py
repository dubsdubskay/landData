"""
Convert the existing VA shapefile to GeoJSON for the API.

Usage:
    python scripts/convert_shapefile.py --src ../../VA_shape.shp --out ../data/va-counties.geojson

Requires geopandas + pyogrio (install with: pip install geopandas pyogrio).
"""

import argparse
from pathlib import Path

import geopandas as gpd


def convert(src: Path, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"[convert] Reading shapefile from {src.resolve()}")
    gdf = gpd.read_file(src)
    print(f"[convert] Loaded {len(gdf)} features; writing GeoJSON to {out.resolve()}")
    gdf.to_file(out, driver="GeoJSON")
    print(f"[convert] Done. Wrote {out} with {len(gdf)} features.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", type=Path, required=True, help="Path to VA_shape.shp")
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "data" / "va-counties.geojson",
        help="Output GeoJSON path",
    )
    args = parser.parse_args()
    convert(args.src, args.out)
