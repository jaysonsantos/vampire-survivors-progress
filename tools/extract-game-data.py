"""Extracts the game data tables from the Unity asset files of Vampire Survivors.

The game keeps its content tables as JSON text assets inside `resources.assets`
and inside one `*_persistent_assets_all.bundle` per add-on. This script writes
each table as one strict JSON file, so that `tools/build-catalog.ts` can read
them. The output holds game text, so it stays outside the repository.

Usage:
    nix-shell -p python3 --run "python3 -m venv .venv && .venv/bin/pip install UnityPy json5"
    .venv/bin/python tools/extract-game-data.py <VampireSurvivors_Data> <output-dir>
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import json5
import UnityPy

# region: constants

TEXT_ASSET = "TextAsset"
BUNDLE_DIR = Path("StreamingAssets") / "aa" / "StandaloneWindows64"
BUNDLE_GLOB = "*_persistent_assets_all.bundle"
RESOURCES_FILE = "resources.assets"

# The tables that the catalog generator reads. Base game names are upper case,
# add-on names are camel case with the add-on as suffix.
TABLE_PREFIXES = ("SECRET_DATA", "secretData", "ACHIEVEMENT_DATA", "achievementData")

# endregion: constants


def read_text(script: str | bytes) -> str:
    """Unity stores a text asset as text or as bytes, depending on the version."""
    if isinstance(script, bytes):
        return script.decode("utf-8", errors="ignore")
    return script


def extract(data_dir: Path, output_dir: Path) -> dict[str, int]:
    """Writes every wanted table under `output_dir` and returns the entry count per table."""
    output_dir.mkdir(parents=True, exist_ok=True)
    sources = [data_dir / RESOURCES_FILE, *sorted((data_dir / BUNDLE_DIR).glob(BUNDLE_GLOB))]
    counts: dict[str, int] = {}
    for source in sources:
        environment = UnityPy.load(str(source))
        for obj in environment.objects:
            if obj.type.name != TEXT_ASSET:
                continue
            asset = obj.read()
            name: str = asset.m_Name
            if not name.startswith(TABLE_PREFIXES):
                continue
            # The game reads its JSON with a lenient parser, so a table may hold a trailing comma.
            table = json5.loads(read_text(asset.m_Script))
            target = output_dir / f"{name}.json"
            target.write_text(json.dumps(table, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            counts[name] = len(table)
    return counts


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        sys.stderr.write("usage: extract-game-data.py <VampireSurvivors_Data> <output-dir>\n")
        return 1
    counts = extract(Path(argv[1]), Path(argv[2]))
    sys.stdout.write(json.dumps(counts, indent=2) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
