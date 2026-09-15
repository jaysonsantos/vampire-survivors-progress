/**
 * Links into the community wiki. The app never fetches the wiki. It only
 * builds URLs, so a wrong guess costs the player one click, not a broken page.
 */
import type { CatalogEntry } from "./types.ts";

/** The community wiki that documents unlock conditions. */
export const WIKI_BASE = "https://vampire-survivors.fandom.com/wiki";

/**
 * Page titles that exist on the wiki, checked against its API on 2026-09-15.
 * `unlocks` points at the achievements page because the wiki redirects
 * `Unlock` and `Unlocks` there: it lists every unlock condition in one table.
 */
export const WIKI_PAGE = {
  home: "Vampire_Survivors_Wiki",
  characters: "Characters",
  stages: "Stages",
  weapons: "Weapons",
  items: "Item",
  arcanas: "Arcanas",
  achievements: "Achievements",
  secrets: "Secret",
  powerUps: "PowerUps",
  unlocks: "Achievements",
  enemies: "Enemies",
  coffins: "Coffin",
} as const;

export type WikiPage = keyof typeof WIKI_PAGE;

/** The wiki's own search page, which lands on the article when the title matches. */
const WIKI_SEARCH_PATH = "Special:Search";
const WIKI_SEARCH_QUERY = "query";
const WIKI_SEARCH_SCOPE = "scope";
const WIKI_SEARCH_SCOPE_INTERNAL = "internal";

/** Arcana labels start with a card number, such as `VII. ` or `D01. `, that the wiki does not use in titles. */
const ARCANA_NUMERAL_PREFIX = /^[IVXD\d]+\. /;

/** URL of a known wiki page. */
export function wikiPageUrl(page: WikiPage): string {
  return `${WIKI_BASE}/${WIKI_PAGE[page]}`;
}

/** URL of a wiki search for a label. Most catalog labels differ from the wiki titles, so a search is the safe route. */
export function wikiSearchUrl(label: string): string {
  const params = new URLSearchParams({
    [WIKI_SEARCH_QUERY]: searchTerm(label),
    [WIKI_SEARCH_SCOPE]: WIKI_SEARCH_SCOPE_INTERNAL,
  });
  return `${WIKI_BASE}/${WIKI_SEARCH_PATH}?${params.toString()}`;
}

/** URL for one catalog entry: a search for its label. */
export function wikiEntryUrl(entry: Pick<CatalogEntry, "label">): string {
  return wikiSearchUrl(entry.label);
}

/** Strips the parts of a label that only this app adds. */
export function searchTerm(label: string): string {
  return label.replace(ARCANA_NUMERAL_PREFIX, "").trim();
}
