import assert from "node:assert/strict";
import test from "node:test";
import { BASE_GAME, filterEntries } from "../frontend/src/lib/filter.ts";
import type { CatalogEntry } from "../frontend/src/lib/types.ts";

const ENTRIES: CatalogEntry[] = [
  { id: "ANTONIO", label: "Antonio", value: 1, group: null },
  { id: "TP_ALUCARD", label: "Tp Alucard", value: 2, group: "Ode to Castlevania" },
  { id: "IMELDA", label: "Imelda", value: 3, group: null },
];

const HELD = new Set(["ANTONIO"]);

test("shows what the save holds by default", () => {
  const shown = filterEntries(ENTRIES, HELD, { search: "", group: null, missing: false });
  assert.deepEqual(
    shown.map((entry) => entry.id),
    ["ANTONIO"],
  );
});

test("shows what the save misses", () => {
  const shown = filterEntries(ENTRIES, HELD, { search: "", group: null, missing: true });
  assert.deepEqual(
    shown.map((entry) => entry.id),
    ["TP_ALUCARD", "IMELDA"],
  );
});

test("filters by content group and treats no group as the base game", () => {
  const addOn = filterEntries(ENTRIES, HELD, { search: "", group: "Ode to Castlevania", missing: true });
  assert.deepEqual(
    addOn.map((entry) => entry.id),
    ["TP_ALUCARD"],
  );
  const base = filterEntries(ENTRIES, HELD, { search: "", group: BASE_GAME, missing: true });
  assert.deepEqual(
    base.map((entry) => entry.id),
    ["IMELDA"],
  );
});

test("ignores a search term below the minimum length", () => {
  const shown = filterEntries(ENTRIES, HELD, { search: "z", group: null, missing: false });
  assert.equal(shown.length, 1);
});

test("searches the label and the identifier", () => {
  const byLabel = filterEntries(ENTRIES, HELD, { search: "anto", group: null, missing: false });
  assert.equal(byLabel.length, 1);
  const byId = filterEntries(ENTRIES, HELD, { search: "tp_", group: null, missing: true });
  assert.equal(byId.length, 1);
});
