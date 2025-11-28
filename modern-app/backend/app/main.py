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


@app.get("/states")
def states() -> List[Dict[str, str]]:
    geojson = load_counties()
    unique_states = {}
    for feature in geojson.get("features", []):
        props = feature.get("properties", {})
        state_name = props.get("STATE_N")
        state_abbr = props.get("STATE_A")
        if state_name and state_abbr and state_name not in unique_states:
            unique_states[state_name] = {"name": state_name, "abbreviation": state_abbr}
    return sorted(unique_states.values(), key=lambda x: x["name"])


@app.get("/counties")
def counties(state: Optional[str] = Query(default=None)) -> JSONResponse:
    geojson = load_counties()

    if state:
        # Filter counties by state name or abbreviation
        filtered_features = [
            f
            for f in geojson.get("features", [])
            if f.get("properties", {}).get("STATE_N", "").lower() == state.lower()
            or f.get("properties", {}).get("STATE_A", "").lower() == state.lower()
        ]
        geojson = {"type": "FeatureCollection", "features": filtered_features}

    return JSONResponse(content=geojson)


@app.get("/properties")
def properties(county: Optional[str] = Query(default=None)) -> List[Dict[str, Any]]:
    df = load_properties()

    def normalize_col(col: str) -> str:
        return col.strip().lower().replace(" ", "_")

    df.columns = [normalize_col(c) for c in df.columns]

    if county:
        df = df[df["county"].str.contains(county, case=False, na=False)]

    # Validate required columns based on actual CSV structure
    required = ["county", "address", "lat", "long", "cost", "acres"]
    missing_cols = [c for c in required if c not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=500,
            detail=f"Missing required columns in properties CSV: {missing_cols}",
        )

    # Convert numeric columns
    numeric_cols = {
        "lat": "lat",
        "long": "long",
        "cost": "cost",
        "acres": "acres",
        "id": "id",
        "hours_home": "hours_home",
        "miles_home": "miles_home",
    }

    for orig_col, target_col in numeric_cols.items():
        if orig_col in df.columns:
            df = df.assign(**{target_col: pd.to_numeric(df[orig_col], errors="coerce")})

    # Drop rows without valid coordinates
    df = df.dropna(subset=["lat", "long"])

    return df.to_dict(orient="records")

