export const DEMO_LEFT = "2";
export const DEMO_RIGHT = "3";

export function createState() {
  return {
    lang: "en-GB",
    sort: "reading",
    query: "",
    filters: {
      chapter: new Set(),
      topic: new Set(),
      type: new Set(),
    },
    collapsedChapters: new Set(),
    collapsedCards: new Set(),
    demo: { left: DEMO_LEFT, right: DEMO_RIGHT },
  };
}

export function setLanguage(state, lang) {
  return { ...state, lang };
}

export function setSort(state, sort) {
  return { ...state, sort };
}

export function setQuery(state, query) {
  return { ...state, query };
}

export function setDemoInput(state, side, value) {
  return { ...state, demo: { ...state.demo, [side]: value } };
}

export function resetDemo(state) {
  return { ...state, demo: { left: DEMO_LEFT, right: DEMO_RIGHT } };
}

export function toggleFilter(state, category, id) {
  const next = new Set(state.filters[category]);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return { ...state, filters: { ...state.filters, [category]: next } };
}

export function clearFilters(state) {
  return {
    ...state,
    sort: "reading",
    query: "",
    filters: {
      chapter: new Set(),
      topic: new Set(),
      type: new Set(),
    },
  };
}

export function openAll(state) {
  return {
    ...state,
    collapsedChapters: new Set(),
    collapsedCards: new Set(),
  };
}

export function closeAll(state, chapterIds, cardIds) {
  return {
    ...state,
    collapsedChapters: new Set(chapterIds),
    collapsedCards: new Set(cardIds),
  };
}

export function expandCard(state, chapterId, cardId) {
  const collapsedChapters = new Set(state.collapsedChapters);
  const collapsedCards = new Set(state.collapsedCards);
  collapsedChapters.delete(chapterId);
  collapsedCards.delete(cardId);
  return { ...state, collapsedChapters, collapsedCards };
}
