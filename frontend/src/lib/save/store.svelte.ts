/** Holds the loaded save for every page. The browser keeps the last one. */
import { browser } from "$app/environment";
import { STORAGE_KEY_SAVE, STORAGE_KEY_SOURCE } from "../constants.ts";
import type { SaveData } from "../types.ts";

let save = $state<SaveData | null>(null);
let source = $state<string | null>(null);

/** Reads the save that a previous visit stored. */
export function restore(): void {
  if (!browser || save !== null) return;
  const stored = localStorage.getItem(STORAGE_KEY_SAVE);
  if (stored === null) return;
  try {
    save = JSON.parse(stored) as SaveData;
    source = localStorage.getItem(STORAGE_KEY_SOURCE);
  } catch {
    clear();
  }
}

/** Keeps a newly loaded save, in memory and in the browser. */
export function load(next: SaveData, fileName: string): void {
  save = next;
  source = fileName;
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY_SAVE, JSON.stringify(next));
    localStorage.setItem(STORAGE_KEY_SOURCE, fileName);
  } catch {
    // A save larger than the browser quota still works for this visit.
  }
}

/** Forgets the save everywhere. */
export function clear(): void {
  save = null;
  source = null;
  if (!browser) return;
  localStorage.removeItem(STORAGE_KEY_SAVE);
  localStorage.removeItem(STORAGE_KEY_SOURCE);
}

export const saveStore = {
  get current(): SaveData | null {
    return save;
  },
  get source(): string | null {
    return source;
  },
  get loaded(): boolean {
    return save !== null;
  },
};
