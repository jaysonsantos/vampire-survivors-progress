/**
 * Writes the sample save that the "Load a sample" button loads.
 *
 * Input is a real save file. The output keeps only the fields that the app
 * reads, so nothing else of the file enters the repository. The save name is
 * the one value a player types, so it becomes a fixed label. The remaining
 * fields are game identifiers and play counters.
 *
 * Usage: node --experimental-transform-types tools/make-sample-save.ts <path-to-SaveData>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { SAMPLE_SAVE_NAME, SAVE_FIELDS } from "../frontend/src/lib/save/fields.ts";
import { parseSave } from "../frontend/src/lib/save/parse.ts";
import type { SaveData } from "../frontend/src/lib/types.ts";

const OUTPUT = join("frontend", "static", "sample-save.json");

/** Keeps the fields the app reads and replaces the player's save name. */
export function stripSave(save: SaveData): SaveData {
  const sample: Record<string, unknown> = {};
  for (const field of SAVE_FIELDS) {
    if (save[field] !== undefined) sample[field] = save[field];
  }
  sample.saveName = SAMPLE_SAVE_NAME;
  return sample as SaveData;
}

function main(): void {
  const path = process.argv[2];
  if (path === undefined) {
    process.stderr.write("usage: make-sample-save.ts <path-to-SaveData>\n");
    process.exit(1);
  }
  const sample = stripSave(parseSave(readFileSync(path, "utf8")));
  writeFileSync(OUTPUT, `${JSON.stringify(sample)}\n`);
  process.stdout.write(`${OUTPUT}: ${Object.keys(sample).length} fields\n`);
}

if (process.argv[1]?.endsWith("make-sample-save.ts") === true) main();
