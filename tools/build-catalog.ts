/**
 * Builds the identifier catalog that the app uses to label and group save data.
 *
 * Input is the decompiled `VampireSurvivors.Data` enum directory. The game does
 * not ship a readable catalogue, so the enum members are the only complete list
 * of save-file identifiers. Only identifiers, derived labels, and content-group
 * names are written: no game text, no art, no decompiled code.
 *
 * Usage: node --experimental-transform-types tools/build-catalog.ts <data-dir>
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import process from "node:process";
import { groupOf, humanise } from "../frontend/src/lib/label.ts";
import type { CatalogEntry } from "../frontend/src/lib/types.ts";

// region: constants

const ENUM_FILES = [
  "CharacterType",
  "WeaponType",
  "StageType",
  "ItemType",
  "AchievementType",
  "ArcanaType",
  "PowerUpType",
  "SecretType",
  "SkinType",
] as const;

const OUTPUT_DIR = join("frontend", "src", "lib", "generated", "catalog");
const ENV_DATA_DIR = "VS_DATA_DIR";

/** Members that exist only as null values, engine tests, or range markers. */
const EXCLUDED_EXACT = new Set(["VOID", "none", "NONE", "TEST", "TESTONE", "BLACK", "WHITE", "DEFAULT"]);
const EXCLUDED_PATTERNS = [
  /_TEST$/,
  /^TEST_/,
  /^DEBUG/,
  /^PLACEHOLDER/,
  /^UNUSED/,
  /_RANGE_START$/,
  // Followers and boss forms are spawned by the game, never owned by a player.
  /^FOLLOWER_/,
  /^MEGALO_/,
];

// endregion: constants

// region: parsing

const MEMBER_PATTERN = /^\s*([A-Za-z_][A-Za-z_0-9]*)\s*(?:=\s*(-?\d+))?\s*,?\s*$/;

/** Reads one C# enum file and returns its members in declaration order. */
export function parseEnum(source: string): CatalogEntry[] {
  const body = source.slice(source.indexOf("{") + 1, source.lastIndexOf("}"));
  const entries: CatalogEntry[] = [];
  const seen = new Set<string>();
  for (const line of body.split("\n")) {
    const match = MEMBER_PATTERN.exec(line);
    if (match === null) continue;
    const id = match[1];
    if (id === undefined || seen.has(id) || isExcluded(id)) continue;
    seen.add(id);
    entries.push({
      id,
      label: humanise(id),
      value: match[2] === undefined ? null : Number(match[2]),
      group: groupOf(id),
    });
  }
  return entries;
}

function isExcluded(id: string): boolean {
  if (EXCLUDED_EXACT.has(id)) return true;
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(id));
}

// endregion: parsing

// region: entry point

function main(): void {
  const dataDir = process.argv[2] ?? process.env[ENV_DATA_DIR];
  if (dataDir === undefined) {
    process.stderr.write(`usage: build-catalog.ts <data-dir>  (or set ${ENV_DATA_DIR})\n`);
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const index: Record<string, number> = {};
  for (const name of ENUM_FILES) {
    const entries = parseEnum(readFileSync(join(dataDir, `${name}.cs`), "utf8"));
    const target = join(OUTPUT_DIR, `${toKebabCase(name)}.json`);
    writeFileSync(target, `${JSON.stringify(entries, null, 2)}\n`);
    index[basename(target)] = entries.length;
  }
  process.stdout.write(`${JSON.stringify(index, null, 2)}\n`);
}

function toKebabCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

if (process.argv[1]?.endsWith("build-catalog.ts") === true) main();

// endregion: entry point
