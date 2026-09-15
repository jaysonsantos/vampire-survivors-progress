/** Names that both the UI and the save reader need. Nothing here is a literal in logic. */

/** Key under which the browser keeps the last loaded save. */
export const STORAGE_KEY_SAVE = "vsp:save";
/** Key under which the browser keeps the name of the loaded file. */
export const STORAGE_KEY_SOURCE = "vsp:source";

/** The file that the game writes. Steam keeps it in the cloud-sync folder. */
export const SAVE_FILE_NAME = "SaveData";
/** Largest file the reader accepts, to fail fast on a wrong file. */
export const MAX_SAVE_BYTES = 16 * 1024 * 1024;
/** The stripped sample save that ships with the app, relative to the base path. */
export const SAMPLE_SAVE_PATH = "sample-save.json";

/** Query key that carries the selected character on the characters page. */
export const QUERY = {
  character: "character",
  search: "q",
  tab: "tab",
} as const;

/** Shortest search term that filters a list. */
export const MIN_SEARCH_LENGTH = 2;

export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_HOUR = MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
export const HOURS_PER_DAY = 24;

/** Standard arcanas are the `T00`-`T21` cards; darkanas use the `D` prefix. */
export const ARCANA_PREFIX_STANDARD = "T";
export const ARCANA_PREFIX_DARKANA = "D";

/** Stage completion counts as done when the game logged at least one clear. */
export const COMPLETE_THRESHOLD = 1;
