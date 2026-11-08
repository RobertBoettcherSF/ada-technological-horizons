export const DEMO_LEFT = "2";
export const DEMO_RIGHT = "3";

export const LIFETIME_DEFAULTS = {
  probabilities: ["5", "60", "15", "20"],
  durations: ["100", "30", "30000", "10000"],
};

function lifetimeDefaults() {
  return {
    probabilities: LIFETIME_DEFAULTS.probabilities.slice(),
    durations: LIFETIME_DEFAULTS.durations.slice(),
    modelProbabilities: LIFETIME_DEFAULTS.probabilities.map(Number),
  };
}

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
    lifetime: lifetimeDefaults(),
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

export function setLifetimeInput(state, kind, index, value) {
  const next = state.lifetime[kind].slice();
  next[index] = value;
  return { ...state, lifetime: { ...state.lifetime, [kind]: next } };
}

export function resetLifetime(state) {
  return { ...state, lifetime: lifetimeDefaults() };
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
