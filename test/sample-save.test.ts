import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SAMPLE_SAVE_NAME, SAVE_FIELDS } from "../frontend/src/lib/save/fields.ts";
import { parseSave } from "../frontend/src/lib/save/parse.ts";
import { stripSave } from "../tools/make-sample-save.ts";
import { SAVE } from "./fixture.ts";

const KNOWN_FIELDS = new Set<string>(SAVE_FIELDS);

test("the committed sample holds only the fields the app reads and no save name", () => {
  const sample = parseSave(readFileSync("frontend/static/sample-save.json", "utf8"));
  for (const field of Object.keys(sample)) {
    assert.ok(KNOWN_FIELDS.has(field), `${field} is not a field the app reads`);
  }
  assert.equal(sample.saveName, SAMPLE_SAVE_NAME);
  assert.ok((sample.Achievements?.length ?? 0) > 0);
});

test("stripping a save drops unknown fields and the save name", () => {
  const stripped = stripSave({ ...SAVE, saveName: "Jayson", checksum: "x" } as typeof SAVE);
  assert.equal(stripped.saveName, SAMPLE_SAVE_NAME);
  assert.equal("checksum" in stripped, false);
  assert.deepEqual(stripped.Achievements, SAVE.Achievements);
});
