/**
 * Turns a game identifier into a readable label and a content group.
 *
 * Both the app and `tools/build-catalog.ts` use this, so a label never differs
 * between the generated catalog and an identifier that the catalog misses.
 */

/** Identifiers whose humanised form differs from the name the game shows. */
const LABEL_OVERRIDES: Record<string, string> = {
  HOLYBOOK: "King Bible",
  MAGIC_MISSILE: "Magic Wand",
  HOLY_MISSILE: "Holy Wand",
  VAMPIRICA: "Bloody Tear",
  SCYTHE: "Death Spiral",
  EX_LYCAEUM: "Lycaeum",
  EX_WESTWOODS: "Westwoods",
  EX_MAZERELLA: "Mazerella",
  BMN_BLOODMOON: "Bloodmoon",
  CARLOCART: "Carlo Cart",
  LABORRATORY: "Laborratory",
  BONEZONE: "Bone Zone",
  GREENACRES: "Green Acres",
  WHITEOUT: "Whiteout",
  MOONSPELL: "Moonspell",
  BATCOUNTRY: "Bat Country",
  ASTRALSTAIR: "Astral Stair",
  TOWERBRIDGE: "Tower Bridge",
  DEVILROOM: "Room 1665",
  STAGEX: "Eudaimonia Machine",
};

const ROMAN_NUMERALS = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/** Prefixes that the game uses to keep add-on content apart from the base game. */
export const CONTENT_GROUPS: Record<string, string> = {
  TP: "Ode to Castlevania",
  LEM: "Balatro",
  FB: "Operation Guns",
  EME: "Emerald Diorama",
  BMN: "Bloodmoon",
  ADV: "Adventures",
  MS: "Moonspell",
  FS: "Foscari",
  CHAL: "Emergency Meeting",
};

/** The group an identifier belongs to, or `null` for the base game. */
export function groupOf(id: string): string | null {
  const prefix = /^([A-Z0-9]+)_/.exec(id)?.[1];
  if (prefix === undefined) return null;
  return CONTENT_GROUPS[prefix] ?? null;
}

/** Turns `MAGIC_MISSILE` or `ReachLV5` into a readable label. */
export function humanise(id: string): string {
  const override = LABEL_OVERRIDES[id];
  if (override !== undefined) return override;

  // Arcana members look like `T07_IRON_BLUE`: the prefix is the card number.
  const arcana = /^([TD])(\d{2})_(.+)$/.exec(id);
  if (arcana !== null) {
    const number = Number(arcana[2]);
    const numeral = arcana[1] === "T" ? (ROMAN_NUMERALS[number] ?? String(number)) : `D${arcana[2]}`;
    return `${numeral}. ${titleCase(arcana[3] ?? "")}`;
  }

  // Most identifiers are upper case, with or without underscores.
  if (/^[A-Z0-9_]+$/.test(id)) return titleCase(id);

  // A few add-on secrets are lower case with underscores, such as `tp_clocktower`.
  if (id.includes("_")) return titleCase(id.toUpperCase());

  // Achievements are CamelCase: split before each capital and around digits.
  const spaced = id
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Enemy size prefixes that the game glues to the name, as in `XLBAT` or `BOSS_XLMEDUSA`. */
const ENEMY_SIZE_PREFIX = /^(XL|XXL)([A-Z]{3,})$/;
/** A size that stands alone as its own word, as in `EX_PHALIEN_XL`. */
const ENEMY_SIZE_WORD = /^X{1,2}L$/;
/** `EX_` marks base-game extra content. It carries no meaning for the player. */
const ENEMY_EXTRA_PREFIX = "EX";

/**
 * Turns an `EnemyType` member into a label. Enemy identifiers glue a size
 * prefix to the name, so `XLBAT` is "XL Bat" and not "Xlbat".
 */
export function humaniseEnemy(id: string): string {
  const override = LABEL_OVERRIDES[id];
  if (override !== undefined) return override;
  return id
    .split("_")
    .filter((word, index) => word.length > 0 && !(index === 0 && word === ENEMY_EXTRA_PREFIX))
    .map((word) => {
      if (ENEMY_SIZE_WORD.test(word)) return word;
      const sized = ENEMY_SIZE_PREFIX.exec(word);
      if (sized === null) return titleCase(word);
      return `${sized[1]} ${titleCase(sized[2] ?? "")}`;
    })
    .join(" ");
}

function titleCase(value: string): string {
  return value
    .split("_")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .map((word) => word.replace(/([A-Za-z])(\d)/g, "$1 $2"))
    .join(" ");
}
