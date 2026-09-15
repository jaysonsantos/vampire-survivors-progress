import assert from "node:assert/strict";
import test from "node:test";
import { searchTerm, WIKI_BASE, wikiEntryUrl, wikiPageUrl, wikiSearchUrl } from "../frontend/src/lib/wiki.ts";

test("builds the URL of a known wiki page", () => {
  assert.equal(wikiPageUrl("characters"), `${WIKI_BASE}/Characters`);
  assert.equal(wikiPageUrl("unlocks"), `${WIKI_BASE}/Achievements`);
});

test("builds a search URL and escapes the label", () => {
  const url = new URL(wikiSearchUrl("Bloody Tear"));
  assert.equal(url.pathname, "/wiki/Special:Search");
  assert.equal(url.searchParams.get("query"), "Bloody Tear");
  assert.equal(url.searchParams.get("scope"), "internal");
});

test("drops the arcana card number before searching", () => {
  assert.equal(searchTerm("VII. Iron Blue"), "Iron Blue");
  assert.equal(searchTerm("D01. Dark Aquarius"), "Dark Aquarius");
  assert.equal(searchTerm("0. Killer"), "Killer");
  assert.equal(searchTerm("Antonio"), "Antonio");
});

test("links a catalog entry through its label", () => {
  const url = new URL(wikiEntryUrl({ label: "VII. Iron Blue" }));
  assert.equal(url.searchParams.get("query"), "Iron Blue");
});
