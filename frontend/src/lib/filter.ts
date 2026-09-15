/** The filters that the collection and achievement pages share. */
import { MIN_SEARCH_LENGTH } from "./constants.ts";
import type { CatalogEntry } from "./types.ts";

/** The option that means "content that no add-on brought". */
export const BASE_GAME = "Base game";

/** Which entries a list shows, relative to what the save holds. */
export const VIEW = {
  all: "all",
  owned: "owned",
  missing: "missing",
} as const;

export type EntryView = (typeof VIEW)[keyof typeof VIEW];

export interface EntryFilter {
  search: string;
  /** `null` shows every group. */
  group: string | null;
  view: EntryView;
}

/** Applies the search box, the group select, and the view switch. */
export function filterEntries(entries: CatalogEntry[], held: ReadonlySet<string>, filter: EntryFilter): CatalogEntry[] {
  const term = filter.search.trim().toLowerCase();
  return entries.filter((entry) => {
    if (filter.view === VIEW.owned && !held.has(entry.id)) return false;
    if (filter.view === VIEW.missing && held.has(entry.id)) return false;
    if (filter.group !== null) {
      const group = entry.group ?? BASE_GAME;
      if (group !== filter.group) return false;
    }
    if (term.length < MIN_SEARCH_LENGTH) return true;
    return entry.label.toLowerCase().includes(term) || entry.id.toLowerCase().includes(term);
  });
}

/** How many entries of a list the save holds. */
export function countHeld(entries: CatalogEntry[], held: ReadonlySet<string>): number {
  return entries.filter((entry) => held.has(entry.id)).length;
}
