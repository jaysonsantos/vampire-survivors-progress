# Vampire Survivors Progress

A single-page app that reads a Vampire Survivors save file and shows your
progress. The app runs fully in your browser. It never uploads your save.

## What it shows

- **Overview**: exact completion for arcanas, darkanas, power-up types, and
  cleared stages. Lifetime coins, kills, runs, and survival time.
- **Characters**: survival time, kills, cleared stages, golden egg bonus, and
  skins for every character in the save.
- **Stages**: runs and clears per stage. A character-by-stage grid shows every
  clear in one table.
- **Collection**: weapons, items, arcanas, and darkanas. Filter by add-on, or
  list what the save does not hold yet.
- **Achievements**: unlocked achievements and found secrets, with the same
  filters.

## Where the save file is

The game writes one `SaveData` file. Steam keeps it in the cloud-sync folder.

| Platform | Path |
| --- | --- |
| Steam, Linux | `~/.local/share/Steam/userdata/<id>/1794680/remote/SaveData` |
| Steam, macOS | `~/Library/Application Support/Steam/userdata/<id>/1794680/remote/SaveData` |
| Steam, Windows | `%PROGRAMFILES(X86)%\Steam\userdata\<id>\1794680\remote\SaveData` |
| Itch or standalone | `~/.config/Vampire_Survivors/saves` or the matching `AppData` folder |

Drop the file on the page, or use **Choose file**.

## Privacy

The app has no backend. It reads the file with the browser `File` API. It keeps
the parsed save in `localStorage` so a reload keeps your data. **Unload** removes
it. Nothing leaves your machine.

## About the numbers

The game ships no public content list. This app derives its identifier catalog
from the game enums. The enums also hold bosses, followers, and content that the
game does not award yet.

The app treats the two cases apart:

- **Exact**: arcanas, darkanas, power-up types, and cleared stages. Both sides of
  the ratio come from a fixed list. The percentage is correct.
- **Counts only**: characters, weapons, items, achievements, and secrets. The app
  shows how many you hold. The second number is an upper bound, not a target.
  Achievements and secrets come from the game data tables, so they are real
  entries, but they include every add-on.

## Development

The repository uses a nix flake for every tool.

```bash
nix develop            # or: direnv allow
pnpm install
pnpm dev               # http://localhost:5173
```

| Task | Command |
| --- | --- |
| Build the static site | `pnpm build` |
| Run the tests | `pnpm test` |
| Check the types | `pnpm typecheck` |
| Check the format and lint | `pnpm lint` |
| Fix the format and lint | `pnpm format` |
| Run every hook | `prek run --all-files` |

To use `direnv`, create `.envrc` with two lines:

```
dotenv_if_exists
use flake
```

### Layout

| Path | Holds |
| --- | --- |
| `frontend/src/lib` | The save reader, the statistics, and the components |
| `frontend/src/routes` | One page per section |
| `frontend/src/lib/generated/catalog` | The generated identifier catalog |
| `tools/build-catalog.ts` | The catalog generator |
| `test/` | Node test runner tests |

Manifests and tool configuration stay at the repository root.

### Regenerate the catalog

The generator reads two directories. Neither is part of this repository.

1. The decompiled `VampireSurvivors.Data` enum directory.
2. The game data tables that `tools/extract-game-data.py` writes. The script
   reads the Unity asset files of an installed game with UnityPy.

```bash
nix-shell -p python3 --run "python3 -m venv .venv && .venv/bin/pip install UnityPy json5"
.venv/bin/python tools/extract-game-data.py "/path/to/Vampire Survivors/VampireSurvivors_Data" /path/to/gamedata
pnpm catalog /path/to/VampireSurvivors.Data /path/to/gamedata
```

The generator writes only identifiers, derived labels, and add-on names. For a
secret or an achievement it also writes the identifiers of what it unlocks and
what it needs. It never writes game text, art, or decompiled code.

## Deployment

A push to `main` builds the site and publishes it to GitHub Pages. The workflow
sets `BASE_PATH` from the Pages configuration, so the app works under a project
path.

## Licence

MIT. See [LICENSE](./LICENSE).

This is a fan tool. It has no connection to poncle or to Vampire Survivors.
