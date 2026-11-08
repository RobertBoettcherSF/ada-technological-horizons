export const DEMO_LEFT = "2";
export const DEMO_RIGHT = "3";

export const DELAY_DEFAULTS = {
  distance: "1000",
  unit: "2",
};

export const LOTTERY_DEFAULTS = {
  tickets: "10",
  prizes: "2",
  bought: "3",
  preset: "small",
};

export const CHOICE_DEFAULTS = {
  possibilities: "2",
  repeats: "8",
  preset: "coin",
};

export const THROUGHPUT_DEFAULTS = {
  quantity: "10000",
  quantityUnit: "0",
  rate: "25",
  rateUnit: "0",
  bound: "0",
  duration: "400",
  durationUnit: "0",
  scale: "linear",
  preset: "historical",
};

export const GROWTH_DEFAULTS = {
  initial: "1",
  doubling: "15",
  elapsed: "30",
  startYear: "2026",
  target: "10",
  scale: "linear",
};

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
    growth: { ...GROWTH_DEFAULTS },
    delay: { ...DELAY_DEFAULTS },
    throughput: { ...THROUGHPUT_DEFAULTS },
    choice: { ...CHOICE_DEFAULTS },
    lottery: { ...LOTTERY_DEFAULTS },
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

export function setGrowthInput(state, field, value) {
  return { ...state, growth: { ...state.growth, [field]: value } };
}

export function resetGrowth(state) {
  return { ...state, growth: { ...GROWTH_DEFAULTS } };
}

export function setDelayInput(state, field, value) {
  return { ...state, delay: { ...state.delay, [field]: value } };
}

export function resetDelay(state) {
  return { ...state, delay: { ...DELAY_DEFAULTS } };
}

export function setThroughputInput(state, field, value) {
  return { ...state, throughput: { ...state.throughput, [field]: value } };
}

export function resetThroughput(state) {
  return { ...state, throughput: { ...THROUGHPUT_DEFAULTS } };
}

export function setChoiceInput(state, field, value) {
  return { ...state, choice: { ...state.choice, [field]: value } };
}

export function resetChoice(state) {
  return { ...state, choice: { ...CHOICE_DEFAULTS } };
}

export function setLotteryInput(state, field, value) {
  return { ...state, lottery: { ...state.lottery, [field]: value } };
}

export function resetLottery(state) {
  return { ...state, lottery: { ...LOTTERY_DEFAULTS } };
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
