import assert from "node:assert/strict";
import test from "node:test";
import { formatMinutes, formatRatio, formatSeconds } from "../frontend/src/lib/save/format.ts";

test("formats minutes as hours and minutes", () => {
  assert.equal(formatMinutes(45), "45m");
  assert.equal(formatMinutes(90), "1h 30m");
  assert.equal(formatMinutes(0), "0m");
  assert.equal(formatMinutes(undefined), "0m");
});

test("formats seconds as days, hours and minutes", () => {
  assert.equal(formatSeconds(90), "1m");
  assert.equal(formatSeconds(3900), "1h 5m");
  assert.equal(formatSeconds(90000), "1d 1h");
});

test("returns an em dash when a ratio has no denominator", () => {
  assert.equal(formatRatio(1, 0), "—");
});
