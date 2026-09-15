import assert from "node:assert/strict";
import test from "node:test";
import { arcanaByValue, CATALOG, GROUP_NAMES, groupFor, labelFor } from "../frontend/src/lib/catalog.ts";
import { groupOf, humanise } from "../frontend/src/lib/label.ts";
import { parseEnum } from "../tools/build-catalog.ts";

test("every catalog is not empty", () => {
  for (const [name, entries] of Object.entries(CATALOG)) {
    assert.ok(entries.length > 0, `${name} is empty`);
  }
});

test("looks an arcana up by its enum number", () => {
  assert.equal(arcanaByValue(0)?.id, "T00_KILLER");
  assert.equal(arcanaByValue(-999), undefined);
});

test("humanises an identifier that no catalog holds", () => {
  // Enemy names live in KillCount and in no enum this tool reads.
  assert.equal(labelFor("SOME_UNKNOWN_ID"), "Some Unknown Id");
  assert.equal(labelFor("ANTONIO"), "Antonio");
});

test("tags add-on content with its group", () => {
  assert.equal(groupOf("TP_ALUCARD"), "Ode to Castlevania");
  assert.equal(groupOf("ANTONIO"), null);
  assert.equal(groupFor("ANTONIO"), null);
  assert.ok(GROUP_NAMES.includes("Ode to Castlevania"));
});

test("parses both numbered and bare enum members", () => {
  const entries = parseEnum("public enum X\n{\n\tVOID = 0,\n\tALPHA = 1,\n\tBETA,\n}\n");
  assert.deepEqual(
    entries.map((entry) => entry.id),
    ["ALPHA", "BETA"],
  );
  assert.equal(entries[0]?.value, 1);
  assert.equal(entries[1]?.value, null);
});

test("drops enum members that a player can never own", () => {
  const entries = parseEnum(
    "public enum X\n{\n\tREAL = 0,\n\tLEGION_TEST = 1,\n\tDEBUGROOM = 2,\n\tFOLLOWER_X = 3,\n\tCUSTOM_RANGE_START = 4,\n}\n",
  );
  assert.deepEqual(
    entries.map((entry) => entry.id),
    ["REAL"],
  );
});

test("turns identifiers into readable labels", () => {
  assert.equal(humanise("MAGIC_MISSILE"), "Magic Wand");
  assert.equal(humanise("BAT_COUNTRY"), "Bat Country");
  assert.equal(humanise("ReachLV5"), "Reach LV 5");
  assert.equal(humanise("Have6DifferentWeapons"), "Have 6 Different Weapons");
  assert.equal(humanise("T07_IRON_BLUE"), "VII. Iron Blue");
  assert.equal(humanise("D02_EMERALD_ELEGY"), "D02. Emerald Elegy");
});

test("keeps every catalog entry tagged with a group field", () => {
  for (const entry of CATALOG.characters) {
    assert.ok(entry.group === null || typeof entry.group === "string");
  }
});
