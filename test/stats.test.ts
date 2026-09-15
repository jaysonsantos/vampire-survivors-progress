import assert from "node:assert/strict";
import test from "node:test";
import { DARKANAS, STANDARD_ARCANAS } from "../frontend/src/lib/catalog.ts";
import {
  characterRows,
  completionMatrix,
  overview,
  powerUpRanks,
  stageRows,
  topKills,
  unlockedArcanas,
} from "../frontend/src/lib/save/stats.ts";
import { SAVE } from "./fixture.ts";

test("lists every character the save mentions", () => {
  const rows = characterRows(SAVE);
  const antonio = rows.find((row) => row.id === "ANTONIO");
  assert.ok(antonio);
  assert.equal(antonio.unlocked, true);
  assert.equal(antonio.bought, true);
  assert.equal(antonio.stagesCompleted, 1);
  assert.equal(antonio.stagesPlayed, 2);
  assert.equal(antonio.eggTotal, 12);
  assert.equal(antonio.skins, 2);
  // `EggData.total` is a number the game writes next to the characters, not a character.
  assert.equal(
    rows.some((row) => row.id === "total"),
    false,
  );
});

test("counts a coffin character as unlocked", () => {
  const rows = characterRows(SAVE);
  assert.equal(rows.find((row) => row.id === "GIOVANNA")?.unlocked, true);
});

test("aggregates stage rows across characters", () => {
  const forest = stageRows(SAVE).find((row) => row.id === "FOREST");
  assert.ok(forest);
  assert.equal(forest.charactersPlayed, 2);
  assert.equal(forest.charactersCompleted, 2);
  assert.equal(forest.totalRuns, 7);
  assert.equal(forest.bestSurvivedMinutes, 31);
  assert.equal(forest.hyperUnlocked, true);
});

test("builds a character by stage grid", () => {
  const matrix = completionMatrix(SAVE);
  assert.deepEqual([...matrix.stages].sort(), ["FOREST", "LIBRARY"]);
  const antonio = matrix.rows.find((row) => row.character === "ANTONIO");
  assert.equal(antonio?.cells.length, matrix.stages.length);
});

test("resolves arcanas from their enum numbers", () => {
  assert.deepEqual(
    unlockedArcanas(SAVE).map((entry) => entry.id),
    ["T00_KILLER", "T07_IRON_BLUE"],
  );
});

test("counts how often each power-up was bought", () => {
  const ranks = powerUpRanks(SAVE);
  assert.equal(ranks.find((rank) => rank.id === "POWER")?.rank, 2);
  assert.equal(ranks.find((rank) => rank.id === "ARMOR")?.rank, 1);
});

test("sorts the most killed enemies first", () => {
  assert.deepEqual(
    topKills(SAVE, 1).map((row) => row.id),
    ["BAT1"],
  );
});

test("ignores identifiers that the catalog does not know", () => {
  const summary = overview(SAVE, STANDARD_ARCANAS, DARKANAS);
  // NOT_A_REAL_WEAPON is in the save but not in the catalog.
  assert.equal(summary.weapons.owned, 3);
  assert.equal(summary.characters.owned, 4);
  assert.equal(summary.standardArcanas.known, STANDARD_ARCANAS.length);
  assert.equal(summary.totalKills, 200);
  assert.equal(summary.totalRuns, 9);
  assert.equal(summary.stageClears, 3);
});

test("counts exact ratios against the unlocked stages", () => {
  const summary = overview(SAVE, STANDARD_ARCANAS, DARKANAS);
  // FOREST and LIBRARY are unlocked; only FOREST was cleared.
  assert.deepEqual(summary.stagesCleared, { owned: 1, known: 2 });
  assert.deepEqual(summary.hypersUnlocked, { owned: 1, known: 2 });
  assert.deepEqual(summary.standardArcanas, { owned: 2, known: STANDARD_ARCANAS.length });
  assert.deepEqual(summary.darkanas, { owned: 0, known: DARKANAS.length });
  // POWER and ARMOR are two distinct power-up types.
  assert.equal(summary.powerUps.owned, 2);
  assert.equal(summary.unlockedStages, 2);
});
