"""Download YouTube thumbnails for portfolio works (maxresdefault -> hqdefault fallback)."""
from __future__ import annotations

import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "thumbnails"

WORK_VIDEOS: dict[str, str] = {
    "work-4": "ogRnN_z5wSQ",
    "work-5": "pz3KGGx_OJU",
    "work-6": "47qRi4Cqlfg",
    "work-7": "sofXgOkQd0c",
    "work-8": "JJ2Alyigye0",
    "work-9": "Q3EurcPRJXU",
    "work-10": "O0D6jXsjoKQ",
    "work-11": "KCcVqZX6pTE",
}


def download(video_id: str, dest: Path) -> None:
    for quality in ("maxresdefault", "hqdefault"):
        url = f"https://img.youtube.com/vi/{video_id}/{quality}.jpg"
        try:
            with urllib.request.urlopen(url, timeout=30) as resp:
                data = resp.read()
            if len(data) < 1000 and quality == "maxresdefault":
                continue
            dest.write_bytes(data)
            print(f"OK {dest.name} ({quality})")
            return
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
            continue
    raise RuntimeError(f"Failed to download thumbnail for {video_id}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for work_id, video_id in WORK_VIDEOS.items():
        download(video_id, OUT / f"{work_id}-youtube.jpg")


if __name__ == "__main__":
    main()
