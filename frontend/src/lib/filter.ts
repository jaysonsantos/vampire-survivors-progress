/** The filters that the collection and achievement pages share. */
import { MIN_SEARCH_LENGTH } from "./constants.ts";
import type { CatalogEntry } from "./types.ts";

/** The option that means "content that no add-on brought". */
export const BASE_GAME = "Base game";

export interface EntryFilter {
  search: string;
  /** `null` shows every group. */
  group: string | null;
  /** `true` shows what the save does not hold yet. */
  missing: boolean;
}

/** Applies the search box, the group select, and the missing switch. */
export function filterEntries(entries: CatalogEntry[], held: ReadonlySet<string>, filter: EntryFilter): CatalogEntry[] {
  const term = filter.search.trim().toLowerCase();
  return entries.filter((entry) => {
    if (filter.missing === held.has(entry.id)) return false;
    if (filter.group !== null) {
      const group = entry.group ?? BASE_GAME;
      if (group !== filter.group) return false;
    }
    if (term.length < MIN_SEARCH_LENGTH) return true;
    return entry.label.toLowerCase().includes(term) || entry.id.toLowerCase().includes(term);
  });
}
