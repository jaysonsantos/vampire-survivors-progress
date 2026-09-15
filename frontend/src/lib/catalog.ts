/**
 * The identifier catalog. `tools/build-catalog.ts` writes the JSON files from
 * the game enums, because the game ships no readable content list.
 *
 * A catalog is complete for labels but not for progress: the enums also hold
 * bosses, followers, and content that the game does not award yet. Only the
 * arcana and power-up catalogs are exact, so only those carry a percentage.
 */
import { ARCANA_PREFIX_DARKANA, ARCANA_PREFIX_STANDARD } from "./constants.ts";
import achievementType from "./generated/catalog/achievement-type.json" with { type: "json" };
import arcanaType from "./generated/catalog/arcana-type.json" with { type: "json" };
import characterType from "./generated/catalog/character-type.json" with { type: "json" };
import enemyType from "./generated/catalog/enemy-type.json" with { type: "json" };
import itemType from "./generated/catalog/item-type.json" with { type: "json" };
import powerUpType from "./generated/catalog/power-up-type.json" with { type: "json" };
import secretType from "./generated/catalog/secret-type.json" with { type: "json" };
import skinType from "./generated/catalog/skin-type.json" with { type: "json" };
import stageType from "./generated/catalog/stage-type.json" with { type: "json" };
import weaponType from "./generated/catalog/weapon-type.json" with { type: "json" };
import { humanise } from "./label.ts";
import type { CatalogEntry, Id } from "./types.ts";

export const CATALOG = {
  achievements: achievementType as CatalogEntry[],
  arcanas: arcanaType as CatalogEntry[],
  characters: characterType as CatalogEntry[],
  enemies: enemyType as CatalogEntry[],
  items: itemType as CatalogEntry[],
  powerUps: powerUpType as CatalogEntry[],
  secrets: secretType as CatalogEntry[],
  skins: skinType as CatalogEntry[],
  stages: stageType as CatalogEntry[],
  weapons: weaponType as CatalogEntry[],
} as const;

export type CatalogName = keyof typeof CATALOG;

const ENTRY_BY_ID = new Map<Id, CatalogEntry>();
for (const entries of Object.values(CATALOG)) {
  for (const entry of entries) {
    if (!ENTRY_BY_ID.has(entry.id)) ENTRY_BY_ID.set(entry.id, entry);
  }
}

/**
 * Returns the readable label of an identifier. Identifiers that no catalog
 * holds, such as enemy names inside `KillCount`, are humanised on the spot.
 */
export function labelFor(id: Id): string {
  return ENTRY_BY_ID.get(id)?.label ?? humanise(id);
}

/** The add-on an identifier belongs to, or `null` for the base game. */
export function groupFor(id: Id): string | null {
  return ENTRY_BY_ID.get(id)?.group ?? null;
}

const ARCANA_BY_VALUE = new Map<number, CatalogEntry>();
for (const entry of CATALOG.arcanas) {
  if (entry.value !== null) ARCANA_BY_VALUE.set(entry.value, entry);
}

/** The save stores arcanas as enum numbers, not as names. */
export function arcanaByValue(value: number): CatalogEntry | undefined {
  return ARCANA_BY_VALUE.get(value);
}

/** The twenty-two numbered cards of the base game. */
export const STANDARD_ARCANAS = CATALOG.arcanas.filter((entry) => /^T\d\d_/.test(entry.id));
/** The darkana cards that the Bloodmoon content adds. */
export const DARKANAS = CATALOG.arcanas.filter((entry) => /^D\d\d_/.test(entry.id));

/** Every add-on name that the catalog mentions, in alphabetical order. */
export const GROUP_NAMES = [
  ...new Set(
    Object.values(CATALOG)
      .flat()
      .map((entry) => entry.group)
      .filter((group): group is string => group !== null),
  ),
].sort();

export { ARCANA_PREFIX_DARKANA, ARCANA_PREFIX_STANDARD };
