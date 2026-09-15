import assert from "node:assert/strict";
import test from "node:test";
import { arcanaByValue, CATALOG, GROUP_NAMES, groupFor, labelFor } from "../frontend/src/lib/catalog.ts";
import { groupOf, humanise, humaniseEnemy } from "../frontend/src/lib/label.ts";
import { applyGameData, type GameTable, parseEnum } from "../tools/build-catalog.ts";

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
  assert.equal(humanise("tp_clocktower"), "Tp Clocktower");
});

test("keeps every catalog entry tagged with a group field", () => {
  for (const entry of CATALOG.characters) {
    assert.ok(entry.group === null || typeof entry.group === "string");
  }
});

test("labels enemies with their size prefix as a word", () => {
  assert.equal(humaniseEnemy("XLBAT"), "XL Bat");
  assert.equal(humaniseEnemy("BOSS_XLMEDUSA"), "Boss XL Medusa");
  assert.equal(humaniseEnemy("EX_PHALIEN_XL_BOSS"), "Phalien XL Boss");
  assert.equal(humaniseEnemy("EX_SCALING_BAT3"), "Scaling Bat 3");
  assert.equal(humaniseEnemy("BAT1"), "Bat 1");
  assert.equal(labelFor("XLBAT"), "XL Bat");
  assert.ok(CATALOG.enemies.length > 0);
});

test("keeps only the secrets the game data defines, with their rewards", () => {
  const entries = parseEnum(
    "public enum X\n{\n\tKissMe = 0,\n\tIlCarro = 1,\n\tNoData = 2,\n\ttp_gears = 3,\n\tGetMagiStoneToLevel7 = 4,\n}\n",
  );
  const tables: GameTable[] = [
    {
      group: null,
      rows: {
        KissMe: { description: "text", characterToUnlock: "POE", requiresRelic: "RELIC_X" },
        IlCarro: { arcanaToUnlock: 7, isSpell: true, spell: "ilcarro" },
      },
    },
    {
      group: "Ode to Castlevania",
      rows: {
        tp_gears: { weaponListToUnlock: ["TP_A", "TP_B"], skinsToUnlock: [{ skin: "S" }] },
        // The table spells this one with a lower-case `to`; the enum and the save do not.
        GetMagiStonetoLevel7: { weaponToUnlock: "TP_C" },
      },
    },
  ];
  const result = applyGameData(
    entries,
    tables,
    (value) => (value === 7 ? "T07_IRON_BLUE" : undefined),
    (id) => (id === "POE" ? "character" : undefined),
  );
  assert.deepEqual(
    result.map((entry) => entry.id),
    ["KissMe", "IlCarro", "tp_gears", "GetMagiStoneToLevel7"],
  );
  assert.deepEqual(result[3]?.rewards, [{ kind: "weapon", id: "TP_C" }]);
  assert.deepEqual(result[0]?.rewards, [{ kind: "character", id: "POE" }]);
  assert.deepEqual(result[0]?.requires, ["RELIC_X"]);
  assert.equal(result[0]?.spell, undefined);
  assert.deepEqual(result[1]?.rewards, [{ kind: "arcana", id: "T07_IRON_BLUE" }]);
  assert.equal(result[1]?.spell, true);
  assert.equal(result[2]?.group, "Ode to Castlevania");
  assert.deepEqual(result[2]?.rewards, [
    { kind: "weapon", id: "TP_A" },
    { kind: "weapon", id: "TP_B" },
    { kind: "skin", id: "S" },
  ]);
  // No row of any table may leak game text into the catalog.
  assert.equal(JSON.stringify(result).includes("text"), false);
});
