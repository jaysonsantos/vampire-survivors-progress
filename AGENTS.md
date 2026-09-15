# Agent instructions

This repository holds one static single-page app. It reads a Vampire Survivors
save file in the browser. There is no backend and no database.

Follow the `jayson-code-conventions` and `jayson-typescript-conventions` skills.
This file records only what those skills do not cover.

## Layout

- `frontend/` holds every `.ts` and `.svelte` source file.
- Manifests and tool configuration stay at the repository root.
- `tools/` holds the catalog generator. It is TypeScript and runs on Node.
- `test/` holds Node test runner tests.

## The save file

- The save is plain JSON. The game writes it as one file named `SaveData`.
- `frontend/src/lib/types.ts` declares the fields that this app reads. The game
  writes many more fields. The reader keeps them and ignores them.
- The save stores arcanas as enum numbers. Every other identifier is a string.
- Never commit a real save file. A real save holds personal play data. Use the
  synthetic fixture in `test/fixture.ts`.

## The identifier catalog

- `frontend/src/lib/generated/catalog/*.json` is generated. Do not edit it.
- Regenerate it with `pnpm catalog <path-to-VampireSurvivors.Data>`.
- The input is a decompiled game assembly. That input is not redistributable, so
  it stays outside this repository.
- Write only identifiers, derived labels, and add-on names to the catalog. Never
  write game text, art, or decompiled code.
- Biome and the hooks skip the generated folder.

## Progress numbers

The game enums are a superset of what a player can own. They hold bosses,
followers, and unreleased content. Keep the two cases apart:

- Show a percentage only when both sides come from a fixed list. Arcanas,
  darkanas, power-up types, and cleared stages qualify.
- Show a count for characters, weapons, items, achievements, and secrets. Label
  the catalog size as an upper bound.

Do not present an enum count as a completion target.

## Svelte

- The app uses Svelte 5 runes.
- A rune that the markup writes back to must stay `let`. Biome reads only the
  script block, so `biome.jsonc` turns `style/useConst` off for `.svelte` files.
  Do not turn it back on.
- `svelte.config.js` uses `kit.files` to point at `frontend/`. SvelteKit marks
  that option deprecated. Keep it until SvelteKit removes it.

## Deployment

- `.github/workflows/ci.yml` runs every linter and the build through the flake.
- `.github/workflows/pages.yml` publishes to GitHub Pages.
- The Pages job sets `BASE_PATH`, copies `index.html` to `404.html`, and adds
  `.nojekyll`. GitHub Pages needs all three for a single-page app.
