from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

COUNTIES_PATH = DATA_DIR / "va-counties.geojson"
PROPERTIES_PATH = DATA_DIR / "properties.csv"
REMOTE_PROPERTIES = (
    "https://raw.githubusercontent.com/dubsdubskay/landData/main/porpertySearch.csv"
)


def load_counties() -> Dict[str, Any]:
    if not COUNTIES_PATH.exists():
        raise FileNotFoundError(
            f"County GeoJSON not found at {COUNTIES_PATH}. "
            "Run scripts/convert_shapefile.py after installing geopandas, "
            "or place a GeoJSON file there."
        )
    return json.loads(COUNTIES_PATH.read_text())


def load_properties(source_url: Optional[str] = None) -> pd.DataFrame:
    url = source_url or REMOTE_PROPERTIES
    if PROPERTIES_PATH.exists():
        return pd.read_csv(PROPERTIES_PATH)
    try:
        return pd.read_csv(url)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to load properties from remote CSV. "
                f"Place a CSV at {PROPERTIES_PATH} or set PROPERTIES_URL."
            ),
        ) from exc


app = FastAPI(title="Land Data API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/counties")
def counties() -> JSONResponse:
    geojson = load_counties()
    return JSONResponse(content=geojson)


@app.get("/properties")
def properties(county: Optional[str] = Query(default=None)) -> List[Dict[str, Any]]:
    df = load_properties()

    def normalize_col(col: str) -> str:
        return col.strip().lower().replace(" ", "_")

    df.columns = [normalize_col(c) for c in df.columns]

    if county:
        df = df[df["county"].str.contains(county, case=False, na=False)]

    expected = ["city", "county", "address", "lat", "long", "cost", "acres"]
    missing_cols = [c for c in expected if c not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=500,
            detail=f"Missing expected columns in properties CSV: {missing_cols}",
        )

    df = df.assign(
        lat=pd.to_numeric(df["lat"], errors="coerce"),
        long=pd.to_numeric(df["long"], errors="coerce"),
        cost=pd.to_numeric(df["cost"], errors="coerce"),
        acres=pd.to_numeric(df["acres"], errors="coerce"),
    ).dropna(subset=["lat", "long"])

    return df.to_dict(orient="records")

