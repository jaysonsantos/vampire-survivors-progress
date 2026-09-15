import assert from "node:assert/strict";
import test from "node:test";
import { parseSave, SaveParseError } from "../frontend/src/lib/save/parse.ts";
import { SAVE } from "./fixture.ts";

test("parses a save file", () => {
  const parsed = parseSave(JSON.stringify(SAVE));
  assert.equal(parsed.saveName, "Slot 1");
  assert.deepEqual(parsed.UnlockedStages, ["FOREST", "LIBRARY"]);
});

test("rejects text that is not JSON", () => {
  assert.throws(
    () => parseSave("not json at all"),
    (error: unknown) => error instanceof SaveParseError && error.reason === "not-json",
  );
});

test("rejects JSON that is not an object", () => {
  assert.throws(
    () => parseSave("[1, 2, 3]"),
    (error: unknown) => error instanceof SaveParseError && error.reason === "not-a-save",
  );
});

test("rejects an object without any progress field", () => {
  assert.throws(
    () => parseSave(JSON.stringify({ hello: "world" })),
    (error: unknown) => error instanceof SaveParseError && error.reason === "not-a-save",
  );
});

test("accepts a save that holds only some known fields", () => {
  const parsed = parseSave(JSON.stringify({ Achievements: ["ReachLV5"] }));
  assert.deepEqual(parsed.Achievements, ["ReachLV5"]);
});
