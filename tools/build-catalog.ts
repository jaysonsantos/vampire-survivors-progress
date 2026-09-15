/**
 * Builds the identifier catalog that the app uses to label and group save data.
 *
 * Input one is the decompiled `VampireSurvivors.Data` enum directory. The game
 * does not ship a readable catalogue, so the enum members are the only complete
 * list of save-file identifiers.
 *
 * Input two is the directory that `tools/extract-game-data.py` writes. It holds
 * the secret and achievement tables of the game. The generator keeps only the
 * secrets and achievements that those tables define, and records what each one
 * unlocks. Only identifiers, derived labels, and content-group names are
 * written: no game text, no art, no decompiled code.
 *
 * Usage: node --experimental-transform-types tools/build-catalog.ts <enum-dir> <data-dir>
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import process from "node:process";
import { CONTENT_GROUPS, groupOf, humanise, humaniseEnemy } from "../frontend/src/lib/label.ts";
import type { CatalogEntry, Id, Reward, RewardKind } from "../frontend/src/lib/types.ts";

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
  "EnemyType",
] as const;

type EnumName = (typeof ENUM_FILES)[number];

/** Enemy identifiers follow their own naming habits, so they get their own labeller. */
const ENEMY_ENUM: EnumName = "EnemyType";

const OUTPUT_DIR = join("frontend", "src", "lib", "generated", "catalog");
const ENV_DATA_DIR = "VS_DATA_DIR";
const ENV_GAME_DATA_DIR = "VS_GAME_DATA_DIR";

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

/** The game data tables per catalog: the base game file, then one file per add-on. */
const GAME_TABLES = {
  SecretType: { base: "SECRET_DATA", addOn: "secretData_" },
  AchievementType: { base: "ACHIEVEMENT_DATA", addOn: "achievementData_" },
} as const;

type TableEnum = keyof typeof GAME_TABLES;

/** The add-on suffix of a data file, mapped to the identifier prefix that `CONTENT_GROUPS` knows. */
const DATA_FILE_GROUPS: Record<string, keyof typeof CONTENT_GROUPS> = {
  ThosePeople: "TP",
  Lemon: "LEM",
  FirstBlood: "FB",
  Emeralds: "EME",
  Bloodmoon: "BMN",
  Moonspell: "MS",
  Foscari: "FS",
  Chalcedony: "CHAL",
};

/** The reward fields of a secret or achievement row, and what each one names. */
const REWARD_FIELDS: Record<string, RewardKind> = {
  characterToUnlock: "character",
  weaponToUnlock: "weapon",
  weaponListToUnlock: "weapon",
  stageToUnlock: "stage",
  hyperToUnlock: "hyper",
  relicToUnlock: "relic",
  arcanaToUnlock: "arcana",
  powerUpToUnlock: "powerUp",
  skinsToUnlock: "skin",
};

/** The requirement fields of a row. Each holds one identifier. */
const REQUIREMENT_FIELDS = [
  "requiresRelic",
  "requiresItem",
  "requiresChar",
  "requiresStage",
  "requiresWeapon",
] as const;

/** A secret that the player types as a code. */
const SPELL_FIELD = "isSpell";

// endregion: constants

// region: parsing

const MEMBER_PATTERN = /^\s*([A-Za-z_][A-Za-z_0-9]*)\s*(?:=\s*(-?\d+))?\s*,?\s*$/;

/** Reads one C# enum file and returns its members in declaration order. */
export function parseEnum(source: string, label: (id: string) => string = humanise): CatalogEntry[] {
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
      label: label(id),
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

// region: game data

/** One row of a game table. The game writes many fields; only the reward and requirement ones matter here. */
export type GameRow = Record<string, unknown>;

/** A game table with the add-on it came from, or `null` for the base game. */
export interface GameTable {
  group: string | null;
  rows: Record<Id, GameRow>;
}

/** Resolves an arcana enum number to its identifier. The secret table stores arcanas as numbers. */
export type ArcanaLookup = (value: number) => Id | undefined;

/**
 * Finds the catalog that holds an identifier. The game reuses `weaponToUnlock`
 * for power-ups, so the field name alone does not tell what a reward is.
 */
export type KindLookup = (id: Id) => RewardKind | undefined;

/**
 * The enum that holds each reward kind, most specific first. `WeaponType` also
 * lists the power-ups and the passive items, so it comes last. `hyper` is a
 * stage flag, so it stays as the field says.
 */
const KIND_ENUMS: Partial<Record<EnumName, RewardKind>> = {
  CharacterType: "character",
  PowerUpType: "powerUp",
  StageType: "stage",
  ArcanaType: "arcana",
  SkinType: "skin",
  ItemType: "relic",
  WeaponType: "weapon",
};

/**
 * Keeps the enum members that the game tables define, in enum order, and adds
 * the group, the rewards, and the requirements of each one.
 */
export function applyGameData(
  entries: CatalogEntry[],
  tables: GameTable[],
  arcanaById: ArcanaLookup,
  kindOf: KindLookup = () => undefined,
): CatalogEntry[] {
  // The tables spell a few identifiers with another letter case than the enum
  // and the save, such as `GetMagiStonetoLevel7`. The game matches them anyway.
  const rowsById = new Map<Id, { row: GameRow; group: string | null }>();
  for (const table of tables) {
    for (const [id, row] of Object.entries(table.rows)) {
      const key = id.toLowerCase();
      if (!rowsById.has(key)) rowsById.set(key, { row, group: table.group });
    }
  }

  const result: CatalogEntry[] = [];
  for (const entry of entries) {
    const found = rowsById.get(entry.id.toLowerCase());
    if (found === undefined) continue;
    const enriched: CatalogEntry = {
      ...entry,
      group: entry.group ?? found.group,
      rewards: rewardsOf(found.row, arcanaById, kindOf),
      requires: requirementsOf(found.row),
    };
    if (found.row[SPELL_FIELD] === true) enriched.spell = true;
    result.push(enriched);
  }
  return result;
}

function rewardsOf(row: GameRow, arcanaById: ArcanaLookup, kindOf: KindLookup): Reward[] {
  const rewards: Reward[] = [];
  for (const [field, fieldKind] of Object.entries(REWARD_FIELDS)) {
    const value = row[field];
    if (value === undefined || value === null) continue;
    for (const id of rewardIds(value, fieldKind, arcanaById)) {
      const kind = fieldKind === "hyper" ? fieldKind : (kindOf(id) ?? fieldKind);
      rewards.push({ kind, id });
    }
  }
  return rewards;
}

/** A reward field holds one identifier, a list of identifiers, a list of skin rows, or an arcana number. */
function rewardIds(value: unknown, kind: RewardKind, arcanaById: ArcanaLookup): Id[] {
  if (typeof value === "number") {
    const id = arcanaById(value);
    return id === undefined ? [] : [id];
  }
  if (typeof value === "string") {
    if (kind === "arcana" && /^\d+$/.test(value)) return rewardIds(Number(value), kind, arcanaById);
    return value.length > 0 ? [value] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === "string") return [item];
      if (typeof item === "object" && item !== null && typeof (item as GameRow).skin === "string") {
        return [(item as GameRow).skin as Id];
      }
      return [];
    });
  }
  return [];
}

function requirementsOf(row: GameRow): Id[] {
  const ids: Id[] = [];
  for (const field of REQUIREMENT_FIELDS) {
    const value = row[field];
    if (typeof value === "string" && value.length > 0) ids.push(value);
  }
  return ids;
}

/** Reads the base table and every add-on table of one catalog from the extracted data directory. */
function readGameTables(gameDataDir: string, name: TableEnum): GameTable[] {
  const { base, addOn } = GAME_TABLES[name];
  const tables: GameTable[] = [];
  for (const file of readdirSync(gameDataDir).sort()) {
    if (!file.endsWith(".json")) continue;
    const stem = basename(file, ".json");
    if (stem === base) {
      tables.push({ group: null, rows: readRows(join(gameDataDir, file)) });
    } else if (stem.startsWith(addOn)) {
      const prefix = DATA_FILE_GROUPS[stem.slice(addOn.length)];
      if (prefix === undefined) throw new Error(`unknown add-on in ${file}; add it to DATA_FILE_GROUPS`);
      tables.push({ group: CONTENT_GROUPS[prefix] ?? null, rows: readRows(join(gameDataDir, file)) });
    }
  }
  if (tables.length === 0) throw new Error(`no ${base} table under ${gameDataDir}`);
  return tables;
}

function readRows(path: string): Record<Id, GameRow> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<Id, GameRow>;
}

// endregion: game data

// region: entry point

function main(): void {
  const dataDir = process.argv[2] ?? process.env[ENV_DATA_DIR];
  const gameDataDir = process.argv[3] ?? process.env[ENV_GAME_DATA_DIR];
  if (dataDir === undefined || gameDataDir === undefined) {
    process.stderr.write(
      `usage: build-catalog.ts <enum-dir> <game-data-dir>  (or set ${ENV_DATA_DIR} and ${ENV_GAME_DATA_DIR})\n`,
    );
    process.exit(1);
  }
  if (!existsSync(gameDataDir)) {
    process.stderr.write(`${gameDataDir} does not exist. Run tools/extract-game-data.py first.\n`);
    process.exit(1);
  }

  const parsed = new Map<EnumName, CatalogEntry[]>();
  for (const name of ENUM_FILES) {
    const label = name === ENEMY_ENUM ? humaniseEnemy : humanise;
    parsed.set(name, parseEnum(readFileSync(join(dataDir, `${name}.cs`), "utf8"), label));
  }

  const arcanaByValue = new Map<number, Id>();
  for (const entry of parsed.get("ArcanaType") ?? []) {
    if (entry.value !== null) arcanaByValue.set(entry.value, entry.id);
  }
  const kindById = new Map<Id, RewardKind>();
  for (const [name, kind] of Object.entries(KIND_ENUMS) as [EnumName, RewardKind][]) {
    for (const entry of parsed.get(name) ?? []) {
      if (!kindById.has(entry.id)) kindById.set(entry.id, kind);
    }
  }
  for (const name of Object.keys(GAME_TABLES) as TableEnum[]) {
    const entries = parsed.get(name) ?? [];
    const tables = readGameTables(gameDataDir, name);
    parsed.set(
      name,
      applyGameData(
        entries,
        tables,
        (value) => arcanaByValue.get(value),
        (id) => kindById.get(id),
      ),
    );
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const index: Record<string, number> = {};
  for (const [name, entries] of parsed) {
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
