import assert from "node:assert/strict";
import test from "node:test";
import { entries } from "../web/js/catalogue-data.js";
import {
  clearFilters,
  closeAll,
  createState,
  openAll,
  resetDemo,
  setDemoInput,
  setLanguage,
  setQuery,
  setSort,
} from "../web/js/state.js";

test("language changes keep the demo values", () => {
  let state = setDemoInput(createState(), "left", "8");
  state = setDemoInput(state, "right", "-3");
  state = setSort(state, "title");
  state = setQuery(state, "life");
  state.filters.chapter.add("dilemmas");
  state = setLanguage(state, "de");
  assert.equal(state.lang, "de");
  assert.deepEqual(state.demo, { left: "8", right: "-3" });
  assert.equal(state.sort, "title");
  assert.equal(state.query, "life");
  assert.ok(state.filters.chapter.has("dilemmas"));
});

test("reset restores demo inputs and keeps locale and catalogue settings", () => {
  let state = setLanguage(createState(), "fr");
  state = setSort(state, "topic");
  state = setQuery(state, "chaos");
  state.filters.type.add("planned");
  state = setDemoInput(state, "left", "");
  state = setDemoInput(state, "right", "NaN");
  state = resetDemo(state);
  assert.deepEqual(state.demo, { left: "2", right: "3" });
  assert.equal(state.lang, "fr");
  assert.equal(state.sort, "topic");
  assert.equal(state.query, "chaos");
  assert.ok(state.filters.type.has("planned"));
});

test("collapse does not erase edited fixture inputs", () => {
  let state = setDemoInput(createState(), "left", "8");
  state = setDemoInput(state, "right", "1.5");
  state = closeAll(
    state,
    ["technical"],
    entries.map((entry) => entry.id),
  );
  assert.ok(state.collapsedCards.has("technical/binary64-addition"));
  assert.deepEqual(state.demo, { left: "8", right: "1.5" });
  state = openAll(state);
  assert.equal(state.collapsedCards.size, 0);
  assert.deepEqual(state.demo, { left: "8", right: "1.5" });
  state = clearFilters(state);
  assert.deepEqual(state.demo, { left: "8", right: "1.5" });
});
