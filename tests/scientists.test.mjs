import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { creditHref, isUnlinked, parseScientists } from "../web/js/scientists.js";

const text = fs.readFileSync(new URL("../data/scientists.tsv", import.meta.url), "utf8");
const rows = parseScientists(text);
const UNLINKED = new Set(["Baumsztejn", "Jasper", "Jacobsen"]);

test("every scientist row has a line locator and a link or an explicit omission", () => {
  assert.ok(rows.length > 100);
  const unlinked = rows.filter((row) => row.status === "unlinked").map((row) => row.written);
  assert.deepEqual(new Set(unlinked), UNLINKED);
  for (const row of rows) {
    assert.match(row.lines, /^[0-9]+(,[0-9]+)*$/);
    const link = creditHref(row, "en-GB");
    if (UNLINKED.has(row.written)) {
      assert.equal(link, null);
      assert.equal(isUnlinked(row), true);
    } else if (row.status === "ru-only") {
      assert.match(link.href, /^https:\/\/ru\.wikipedia\.org\/wiki\//);
    } else {
      assert.equal(row.status, "linked");
      assert.ok(row.en !== "-");
      assert.match(link.href, /^https:\/\/[a-z]+\.wikipedia\.org\/wiki\//);
    }
  }
});

test("a missing local article falls back to English, and Polish uses plwiki", () => {
  const cocconi = rows.find((row) => row.full_name === "Giuseppe Cocconi" && row.chapter === "III");
  assert.equal(cocconi.es, "-");
  assert.equal(creditHref(cocconi, "es").href, "https://en.wikipedia.org/wiki/Giuseppe_Cocconi");
  const ashby = rows.find((row) => row.full_name === "W. Ross Ashby");
  assert.equal(ashby.pl, "-");
  assert.equal(creditHref(ashby, "pl").href, "https://en.wikipedia.org/wiki/W._Ross_Ashby");
  const shklovsky = rows.find((row) => row.full_name === "Iosif Shklovsky" && row.chapter === "III");
  assert.equal(creditHref(shklovsky, "pl").href, "https://pl.wikipedia.org/wiki/Iosif_Szk%C5%82owski");
  assert.equal(creditHref(shklovsky, "en-GB").href, "https://en.wikipedia.org/wiki/Iosif_Shklovsky");
  const tikhomirov = rows.find((row) => row.full_name === "Oleg K. Tikhomirov");
  assert.equal(creditHref(tikhomirov, "pl").kind, "ru");
  assert.equal(creditHref(tikhomirov, "fr").kind, "ru");
});
