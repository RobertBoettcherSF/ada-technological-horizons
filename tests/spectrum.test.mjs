import assert from "node:assert/strict";
import test from "node:test";
import { starHref, tcStars } from "../web/js/tc-stars.js";

test("technetium examples keep a locale article or the English one", () => {
  const rAnd = tcStars.find((star) => star.id === "r-andromedae");
  const chi = tcStars.find((star) => star.id === "chi-cygni");
  const mira = tcStars.find((star) => star.id === "mira");
  const hydrae = tcStars.find((star) => star.id === "r-hydrae");
  const przy = tcStars.find((star) => star.id === "przybylski");
  assert.equal(starHref(rAnd, "pl"), "https://pl.wikipedia.org/wiki/R_Andromedae");
  assert.equal(starHref(chi, "pl"), "https://en.wikipedia.org/wiki/Chi_Cygni");
  assert.equal(starHref(hydrae, "de"), "https://de.wikipedia.org/wiki/R_Hydrae");
  assert.equal(starHref(mira, "fr"), "https://fr.wikipedia.org/wiki/Mira_(%C3%A9toile)");
  assert.equal(starHref(przy, "de"), "https://en.wikipedia.org/wiki/Przybylski's_Star");
  assert.equal(starHref(przy, "pl"), "https://pl.wikipedia.org/wiki/Gwiazda_Przybylskiego");
  assert.equal(starHref(przy, "es"), "https://es.wikipedia.org/wiki/Estrella_de_Przybylski");
  assert.equal(tcStars.filter((star) => star.note === "agb").length, 4);
  assert.equal(tcStars.filter((star) => star.note === "disputed").length, 1);
});
