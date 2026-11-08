import assert from "node:assert/strict";
import test from "node:test";
import { chapters, entries, sections } from "../web/js/catalogue-data.js";
import {
  bookSequence,
  countWorkingCalculators,
  neighbors,
  sortEntries,
  visibleEntries,
} from "../web/js/catalogue.js";
import { clearFilters, createState } from "../web/js/state.js";

const fixture = [
  {
    id: "expl",
    type: "explanation",
    availability: "available",
    inBook: true,
    bookOrder: 1,
    chapterId: "one",
    topicId: "zeta",
    title: "Alpha explanation",
    summary: "First note",
    topic: "Zeta",
  },
  {
    id: "calc",
    type: "calculator",
    availability: "available",
    inBook: true,
    bookOrder: 2,
    chapterId: "one",
    topicId: "alpha",
    title: "Beta calculator",
    summary: "Second note",
    topic: "Alpha",
  },
  {
    id: "calc-early",
    type: "calculator",
    availability: "available",
    inBook: true,
    bookOrder: 0,
    chapterId: "one",
    topicId: "alpha",
    title: "Beta calculator",
    summary: "Tied title",
    topic: "Alpha",
  },
  {
    id: "planned-calc",
    type: "calculator",
    availability: "planned",
    inBook: true,
    bookOrder: 3,
    chapterId: "two",
    topicId: "zeta",
    title: "Planned tool",
    summary: "Not ready",
    topic: "Zeta",
  },
  {
    id: "plan",
    type: "planned",
    availability: "planned",
    inBook: true,
    bookOrder: 4,
    chapterId: "two",
    topicId: "mu",
    title: "Gamma planned",
    summary: "Later",
    topic: "Mu",
  },
];

function labelOf(entry) {
  return { title: entry.title, summary: entry.summary, topic: entry.topic };
}

function ids(list) {
  return list.map((entry) => entry.id);
}

test("reading order places the explanation before the later calculator", () => {
  const ordered = sortEntries(
    fixture.filter((entry) => entry.id === "expl" || entry.id === "calc"),
    "reading",
    "en-GB",
    labelOf,
  );
  assert.deepEqual(ids(ordered), ["expl", "calc"]);
});

test("calculators first reverses that pair and keeps equal-type book order", () => {
  const pair = sortEntries(
    fixture.filter((entry) => entry.id === "expl" || entry.id === "calc"),
    "calculators",
    "en-GB",
    labelOf,
  );
  assert.deepEqual(ids(pair), ["calc", "expl"]);

  const ties = sortEntries(fixture, "calculators", "en-GB", labelOf);
  assert.deepEqual(ids(ties.filter((entry) => entry.type === "calculator" && entry.availability === "available")), [
    "calc-early",
    "calc",
  ]);
  const plannedIndex = ids(ties).indexOf("plan");
  const explanationIndex = ids(ties).indexOf("expl");
  assert.ok(explanationIndex < plannedIndex);
});

test("topic and title ordering are deterministic", () => {
  const byTopic = sortEntries(fixture, "topic", "en-GB", labelOf);
  assert.deepEqual(ids(byTopic), ["calc-early", "calc", "plan", "expl", "planned-calc"]);

  const byTitle = sortEntries(fixture, "title", "en-GB", labelOf);
  const beta = byTitle.filter((entry) => entry.title === "Beta calculator").map((entry) => entry.id);
  assert.deepEqual(beta, ["calc", "calc-early"]);
});

test("search is trimmed and case-insensitive; filters AND across categories and OR within", () => {
  const state = createState();
  state.query = "  BeTa ";
  let visible = visibleEntries(fixture, state, labelOf);
  assert.deepEqual(ids(visible), ["calc-early", "calc"]);

  state.query = "";
  state.filters.chapter.add("one");
  state.filters.type.add("calculator");
  state.filters.type.add("explanation");
  visible = visibleEntries(fixture, state, labelOf);
  assert.deepEqual(ids(visible), ["calc-early", "expl", "calc"]);

  state.filters.type.delete("explanation");
  visible = visibleEntries(fixture, state, labelOf);
  assert.deepEqual(ids(visible), ["calc-early", "calc"]);

  state.filters.chapter.delete("one");
  state.filters.chapter.add("two");
  state.filters.type.clear();
  state.filters.type.add("explanation");
  visible = visibleEntries(fixture, state, labelOf);
  assert.equal(visible.length, 0);
});

test("clear filters restores reading order", () => {
  let state = createState();
  state = { ...state, sort: "title", query: "beta" };
  state.filters.chapter.add("one");
  state = clearFilters(state);
  assert.equal(state.sort, "reading");
  assert.equal(state.query, "");
  assert.equal(state.filters.chapter.size, 0);
  const visible = visibleEntries(fixture, state, labelOf);
  assert.deepEqual(ids(visible), ids(sortEntries(fixture, "reading", "en-GB", labelOf)));
});

test("planned entries are never counted as working calculators", () => {
  assert.equal(countWorkingCalculators(fixture), 2);
  assert.equal(countWorkingCalculators(entries), 2);
  const calculators = entries.filter((entry) => entry.type === "calculator" && entry.availability === "available").map((entry) => entry.id);
  assert.deepEqual(calculators, [
    "cosmic-civilisations/statistics-of-cosmic-civilisations",
    "intellectronics/return-to-earth",
  ]);
});

test("book neighbours ignore catalogue order", () => {
  const shuffled = sections.slice().reverse();
  const sequence = bookSequence(shuffled);
  assert.equal(sequence[0].id, "dilemmas/part-1");
  assert.equal(sequence.at(-1).id, "afterword/part-ii");
  const around = neighbors(shuffled, "cosmic-civilisations/formulating-the-problem");
  assert.equal(around.previous.id, "two-evolutions/a-few-naive-questions");
  assert.equal(around.next.id, "cosmic-civilisations/formulating-the-method");
  assert.equal(neighbors(entries, "technical/binary64-addition").previous, null);
});

test("production catalogue keeps eight book chapters and stable English ids", () => {
  const book = chapters.filter((chapter) => chapter.kind === "book");
  assert.equal(book.length, 8);
  assert.deepEqual(book.map((chapter) => chapter.id), [
    "dilemmas",
    "two-evolutions",
    "cosmic-civilisations",
    "intellectronics",
    "prolegomena-to-omnipotence",
    "phantomology",
    "creating-worlds",
    "a-lampoon-of-evolution",
  ]);
  const ids = new Set(entries.map((entry) => entry.id));
  assert.equal(ids.size, entries.length);
  for (const entry of entries) {
    assert.match(entry.id, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    for (const locale of ["en-GB", "de", "es", "fr"]) {
      assert.equal(typeof entry.title[locale], "string");
      assert.ok(entry.title[locale].trim() !== "");
    }
  }
  assert.equal(sections.length, 73);
  assert.equal(entries.filter((entry) => entry.type === "calculator").length, 2);
});
