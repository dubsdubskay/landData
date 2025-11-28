"""
Download the properties CSV used by the modern app.

Usage:
    python scripts/fetch_properties.py
"""

from pathlib import Path
import urllib.request

REMOTE_PROPERTIES = (
    "https://raw.githubusercontent.com/dubsdubskay/landData/main/porpertySearch.csv"
)
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "properties.csv"


def fetch() -> None:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    print(f"[fetch] Downloading properties CSV from {REMOTE_PROPERTIES}")
    try:
        urllib.request.urlretrieve(REMOTE_PROPERTIES, OUT_PATH)
        print(f"[fetch] Saved to {OUT_PATH}")
    except Exception as exc:  # noqa: BLE001
        print(
            "[fetch] Failed to download. If network is restricted, manually download "
            "porpertySearch.csv from GitHub and place it at data/properties.csv."
        )
        raise exc


if __name__ == "__main__":
    fetch()
