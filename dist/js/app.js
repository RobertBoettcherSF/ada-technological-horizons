import { buildInfo } from "./build-info.js";
import {
  chapters,
  entries,
  sections,
  topics,
  typeOptions,
  chapterById,
  topicById,
} from "./catalogue-data.js";
import {
  activeFilterCount,
  countWorkingCalculators,
  entryVisible,
  groupEntries,
  neighbors,
  visibleEntries,
} from "./catalogue.js";
import { t } from "./messages.js";
import { formatCanonical, formatDuration, formatHeadlineYears, formatProbability, formatReadable, formatShortDuration, interpretOperand } from "./numbers.js";
import {
  clearFilters,
  closeAll,
  createState,
  expandCard,
  openAll,
  resetDelay,
  resetDemo,
  resetGrowth,
  resetLifetime,
  resetChoice,
  resetLottery,
  resetThroughput,
  setChoiceInput,
  setLotteryInput,
  setDelayInput,
  setDemoInput,
  setGrowthInput,
  setThroughputInput,
  setLanguage,
  setLifetimeInput,
  setQuery,
  setSort,
} from "./state.js";
import { callAddition, callChoice, callDelay, callExplore, callLottery, callThroughput, delayPreset, callLifetime, callRebalance, callTarget, createSession, loadAdditionModule, throughputPreset } from "./wasm-loader.js";

const session = createSession();
let state = createState();
let loadToken = 0;

state.collapsedCards = new Set(sections.map((section) => section.id));

const bookChapters = chapters.filter((chapter) => chapter.kind !== "technical");

function labelsFor(lang) {
  return (entry) => ({
    title: entry.title[lang],
    summary: t(lang, entry.summaryKey),
    topic: topicById(entry.topicId).title[lang],
  });
}

function domId(id) {
  return `section-${id.replaceAll("/", "-")}`;
}

function publishedCommit() {
  const match = location.pathname.match(/\/([0-9a-f]{40})\//i);
  if (match) {
    return match[1];
  }
  if (buildInfo.builtFrom === "not-stamped") {
    return "local build";
  }
  return `local build (${buildInfo.builtFrom})`;
}

function h(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") {
      node.textContent = value ?? "";
    } else if (key === "dataset") {
      for (const [dataKey, dataValue] of Object.entries(value)) {
        node.dataset[dataKey] = String(dataValue);
      }
    } else if (value === true) {
      node.setAttribute(key, "");
    } else if (value !== false && value != null) {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    if (child) {
      node.append(child);
    }
  }
  return node;
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  document.title = t(state.lang, "app.title");
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(state.lang, node.dataset.i18n);
  }
  for (const node of document.querySelectorAll("[data-chapter-title]")) {
    const chapter = chapterById(node.dataset.chapterTitle);
    node.textContent = chapter.title[state.lang];
  }
  for (const input of document.querySelectorAll("[data-filter-category]")) {
    const label = input.closest("label");
    const caption = label?.querySelector("[data-filter-caption]");
    if (!caption) {
      continue;
    }
    if (input.dataset.filterCategory === "chapter") {
      caption.textContent = chapterById(input.value).title[state.lang];
    } else if (input.dataset.filterCategory === "topic") {
      caption.textContent = topicById(input.value).title[state.lang];
    } else {
      caption.textContent = t(state.lang, `type.${input.value}`);
    }
  }
  const sort = document.getElementById("sort");
  if (sort) {
    for (const option of sort.options) {
      option.textContent = t(state.lang, option.dataset.i18n);
    }
  }
}

const CALCULATOR_CARDS = [
  { cardId: "lifetime-card", sectionId: "cosmic-civilisations/statistics-of-cosmic-civilisations" },
  { cardId: "growth-card", sectionId: "intellectronics/return-to-earth" },
  { cardId: "lottery-card", sectionId: "intellectronics/return-to-earth" },
  { cardId: "delay-card", sectionId: "phantomology/teletaxy-and-phantomultiplication" },
  { cardId: "throughput-card", sectionId: "a-lampoon-of-evolution/constructing-life" },
  { cardId: "choice-card", sectionId: "creating-worlds/cultivating-information" },
];

const CARD_TO_SECTION = Object.fromEntries(CALCULATOR_CARDS.map((item) => [item.cardId, item.sectionId]));

function rawHash() {
  return decodeURIComponent(location.hash.replace(/^#/, ""));
}

function contentRoute() {
  const route = rawHash();
  if (!route || route === "about" || route === "content") {
    return "";
  }
  return CARD_TO_SECTION[route] || route;
}

function routeChapterId(route) {
  if (!route) return "";
  if (chapterById(route)) return route;
  return entries.find((entry) => entry.id === route)?.chapterId || "";
}

function catalogueLimits() {
  return state.query.trim() !== "" || activeFilterCount(state) > 0;
}

function clearAddressHash() {
  if (!rawHash()) return;
  history.pushState(null, "", `${location.pathname}${location.search}`);
}

function applyVisibility() {
  const route = contentRoute();
  const limited = Boolean(route) || catalogueLimits();
  for (const item of CALCULATOR_CARDS) {
    const entry = entries.find((candidate) => candidate.id === item.sectionId);
    let show = !limited;
    if (limited && entry) {
      const routeMatch = !route
        || (chapterById(route) ? entry.chapterId === route : entry.id === route);
      const filterMatch = catalogueLimits() ? entryVisible(entry, state, labelsFor(state.lang)) : true;
      show = routeMatch && filterMatch;
    }
    const node = document.getElementById(item.cardId);
    if (node) node.hidden = !show;
  }
  const catalogueResults = document.getElementById("catalogue-results");
  if (catalogueResults) catalogueResults.hidden = Boolean(route);
  const note = document.getElementById("selection-note");
  if (note) {
    if (!limited) {
      note.textContent = t(state.lang, "nav.showingAll");
    } else if (route && chapterById(route)) {
      note.textContent = `${t(state.lang, "nav.showing")} ${chapterById(route).title[state.lang]}`;
    } else if (route) {
      const entry = entries.find((candidate) => candidate.id === route);
      note.textContent = entry
        ? `${t(state.lang, "nav.showing")} ${entry.title[state.lang]}`
        : t(state.lang, "nav.showingMatch");
    } else {
      note.textContent = t(state.lang, "nav.showingMatch");
    }
  }
  const showAll = document.getElementById("show-all");
  if (showAll) {
    showAll.setAttribute("aria-pressed", limited ? "false" : "true");
  }
  for (const link of document.querySelectorAll("[data-chapter-link]")) {
    const selectedByRoute = routeChapterId(route) === link.dataset.chapterLink;
    const selectedByFilter = !route
      && state.filters.chapter.has(link.dataset.chapterLink)
      && state.filters.topic.size === 0
      && state.filters.type.size === 0
      && state.query.trim() === "";
    link.setAttribute("aria-current", selectedByRoute || selectedByFilter ? "true" : "false");
  }
}

function renderChapterNav() {
  const list = document.getElementById("chapter-list");
  list.replaceChildren();
  list.append(
    h("li", {}, [
      h("button", {
        type: "button",
        id: "show-all",
        class: "chapter-tile is-default",
        dataset: { i18n: "nav.allChapters" },
      }),
    ]),
  );
  for (const chapter of bookChapters) {
    const first = sections.find((section) => section.chapterId === chapter.id);
    const ready = CALCULATOR_CARDS.some((item) => item.sectionId.startsWith(`${chapter.id}/`));
    const statusKey = chapter.kind === "closing" ? "tile.retrospective" : ready ? "tile.calculator" : "tile.planned";
    list.append(
      h("li", {}, [
        h(
          "a",
          {
            href: `#${chapter.id}`,
            class: ready ? "chapter-tile is-ready" : chapter.kind === "closing" ? "chapter-tile is-retrospective" : "chapter-tile is-planned",
            dataset: {
              chapterLink: chapter.id,
              chapterKind: chapter.kind,
              firstSection: first.id,
              calculator: ready ? "ready" : "none",
            },
          },
          [
            h("span", { class: "tile-status", dataset: { i18n: statusKey } }),
            h("span", { class: "tile-title", dataset: { chapterTitle: chapter.id } }),
            h("span", { class: "tile-blurb", dataset: { i18n: `chapter.${chapter.id}.blurb` } }),
          ],
        ),
      ]),
    );
  }
}

function renderFilters() {
  const host = document.getElementById("filters");
  host.replaceChildren();
  const groups = [
    ["chapter", "catalogue.filter.chapter", chapters],
    ["topic", "catalogue.filter.topic", topics],
    ["type", "catalogue.filter.type", typeOptions.map((id) => ({ id }))],
  ];
  for (const [category, legendKey, options] of groups) {
    const field = h("fieldset", {}, [h("legend", { dataset: { i18n: legendKey } })]);
    const box = h("div", { class: "filter-options" });
    for (const option of options) {
      const input = h("input", {
        type: "checkbox",
        value: option.id,
        dataset: { filterCategory: category },
      });
      input.checked = state.filters[category].has(option.id);
      const caption = h("span", { dataset: { filterCaption: option.id } });
      box.append(h("label", {}, [input, caption]));
    }
    field.append(box);
    host.append(field);
  }
}

function renderReading(route) {
  const panel = document.getElementById("reading");
  const title = document.getElementById("reading-title");
  const summary = document.getElementById("reading-summary");
  const meta = document.getElementById("reading-meta");
  const pager = document.getElementById("reading-pager");
  panel.dataset.route = route || "";

  if (!route) {
    panel.hidden = true;
    title.textContent = "";
    summary.textContent = "";
    meta.textContent = "";
    const sectionTitle = document.getElementById("reading-section-title");
    const sectionSummary = document.getElementById("reading-section-summary");
    if (sectionTitle) {
      sectionTitle.hidden = true;
      sectionTitle.textContent = "";
    }
    if (sectionSummary) {
      sectionSummary.hidden = true;
      sectionSummary.textContent = "";
    }
    pager.replaceChildren();
    return;
  }
  panel.hidden = false;

  const chapter = chapterById(route);
  if (chapter && chapter.kind !== "technical") {
    title.textContent = chapter.title[state.lang];
    meta.textContent = `${t(state.lang, "reading.chapter")} · ${chapter.id}`;
    const chapterHasCalculator = CALCULATOR_CARDS.some((item) => routeChapterId(item.sectionId) === chapter.id);
    summary.textContent = chapter.kind === "closing"
      ? t(state.lang, "summary.closing")
      : chapterHasCalculator
        ? t(state.lang, `chapter.${chapter.id}.blurb`)
        : t(state.lang, "summary.planned");
    const working = sections.find((item) => item.chapterId === chapter.id && CALCULATOR_CARDS.some((card) => card.sectionId === item.id));
    const sectionTitle = document.getElementById("reading-section-title");
    const sectionSummary = document.getElementById("reading-section-summary");
    if (sectionTitle && sectionSummary) {
      sectionTitle.hidden = !working;
      sectionSummary.hidden = !working;
      sectionTitle.textContent = working ? working.title[state.lang] : "";
      sectionSummary.textContent = working ? t(state.lang, working.summaryKey) : "";
    }
    const list = h("ul", { class: "section-jump" });
    for (const section of sections.filter((item) => item.chapterId === chapter.id)) {
      list.append(
        h("li", {}, [
          h("a", {
            href: `#${section.id}`,
            class: "section-link",
            text: section.title[state.lang],
            dataset: { sectionId: section.id },
          }),
        ]),
      );
    }
    pager.replaceChildren(list);
    return;
  }

  const sectionTitle = document.getElementById("reading-section-title");
  const sectionSummary = document.getElementById("reading-section-summary");
  if (sectionTitle) sectionTitle.hidden = true;
  if (sectionSummary) sectionSummary.hidden = true;
  const entry = entries.find((item) => item.id === route);
  if (!entry) {
    title.textContent = t(state.lang, "reading.prompt");
    summary.textContent = "";
    meta.textContent = "";
    pager.replaceChildren();
    return;
  }

  title.textContent = entry.title[state.lang];
  summary.textContent = t(state.lang, entry.summaryKey);
  const chapterTitle = chapterById(entry.chapterId).title[state.lang];
  const availability = t(state.lang, `availability.${entry.availability}`);
  meta.textContent = `${chapterTitle} · ${entry.id} · ${availability}`;

  if (!entry.inBook) {
    pager.replaceChildren(h("p", { text: t(state.lang, "reading.notInBook") }));
    return;
  }

  const { previous, next } = neighbors(entries, entry.id);
  const previousLink = previous
    ? h("a", { id: "reading-prev", href: `#${previous.id}`, text: `${t(state.lang, "nav.previous")}: ${previous.title[state.lang]}` })
    : h("span", { id: "reading-prev", class: "pager-disabled", text: t(state.lang, "nav.previous"), "aria-disabled": "true" });
  const nextLink = next
    ? h("a", { id: "reading-next", href: `#${next.id}`, text: `${t(state.lang, "nav.next")}: ${next.title[state.lang]}` })
    : h("span", { id: "reading-next", class: "pager-disabled", text: t(state.lang, "nav.next"), "aria-disabled": "true" });
  pager.replaceChildren(previousLink, nextLink);
}

function renderCard(entry) {
  const open = !state.collapsedCards.has(entry.id);
  const chapter = chapterById(entry.chapterId);
  const button = h("button", {
    type: "button",
    class: "collapse",
    "aria-expanded": open ? "true" : "false",
    dataset: { collapseCard: entry.id, i18nTitle: "collapse.card" },
    text: open ? "–" : "+",
  });
  button.title = t(state.lang, "collapse.card");
  button.setAttribute("aria-label", t(state.lang, "collapse.card"));
  const link = h("a", {
    href: `#${entry.id}`,
    class: "section-link",
    text: entry.title[state.lang],
    dataset: { sectionId: entry.id },
  });
  const badge = h("span", {
    class: entry.availability === "available" ? "badge operational" : "badge",
    text: `${t(state.lang, `type.${entry.type}`)} · ${t(state.lang, `availability.${entry.availability}`)}`,
  });
  const body = h("div", { class: "card-body", id: `body-${domId(entry.id)}` });
  body.hidden = !open;
  const summary = h("p", { text: t(state.lang, entry.summaryKey) });
  const topic = h("p", {
    class: "topic-line",
    text: `${t(state.lang, "catalogue.filter.topic")}: ${topicById(entry.topicId).title[state.lang]} · ${chapter.title[state.lang]}`,
  });
  body.append(summary, topic);
  if (entry.id === "cosmic-civilisations/statistics-of-cosmic-civilisations") {
    body.append(h("p", {}, [h("a", { href: "#lifetime-card", dataset: { i18n: "lifetime.open" } })]));
  }
  if (entry.id === "intellectronics/return-to-earth") {
    body.append(h("p", {}, [
      h("a", { href: "#growth-card", dataset: { i18n: "growth.open" } }),
      " ",
      h("a", { href: "#lottery-card", dataset: { i18n: "lottery.open" } }),
    ]));
  }
  if (entry.id === "phantomology/teletaxy-and-phantomultiplication") {
    body.append(h("p", {}, [h("a", { href: "#delay-card", dataset: { i18n: "delay.open" } })]));
  }
  if (entry.id === "a-lampoon-of-evolution/constructing-life") {
    body.append(h("p", {}, [h("a", { href: "#throughput-card", dataset: { i18n: "throughput.open" } })]));
  }
  if (entry.id === "creating-worlds/cultivating-information") {
    body.append(h("p", {}, [h("a", { href: "#choice-card", dataset: { i18n: "choice.open" } })]));
  }
  return h("article", { class: "card", id: domId(entry.id), dataset: { sectionId: entry.id } }, [
    h("div", { class: "card-bar" }, [button, h("h3", {}, [link]), badge]),
    body,
  ]);
}

function renderResults() {
  const host = document.getElementById("catalogue-results");
  const visible = visibleEntries(entries, state, labelsFor(state.lang));
  document.getElementById("result-count").textContent = String(visible.length);
  document.getElementById("active-count").textContent = String(activeFilterCount(state));
  document.getElementById("working-count").textContent = String(countWorkingCalculators(entries));

  if (visible.length === 0) {
    host.replaceChildren(
      h("div", { class: "empty", id: "no-results" }, [
        h("p", { dataset: { i18n: "catalogue.none" } }),
        h("p", { dataset: { i18n: "catalogue.noneHelp" } }),
      ]),
    );
    applyI18n();
    updateDemo();
    updateLifetime();
    updateGrowth();
    updateDelay();
    updateThroughput();
    updateChoice();
    updateLottery();
    applyVisibility();
    return;
  }

  const groups = groupEntries(visible, state.sort);
  const fragment = document.createDocumentFragment();
  for (const group of groups) {
    if (group.kind === "flat") {
      for (const entry of group.entries) {
        fragment.append(renderCard(entry));
      }
      continue;
    }
    const open = !state.collapsedChapters.has(group.key);
    const headingText =
      group.kind === "topic"
        ? topicById(group.key).title[state.lang]
        : chapterById(group.key).title[state.lang];
    const button = h("button", {
      type: "button",
      class: "collapse",
      "aria-expanded": open ? "true" : "false",
      dataset: { collapseChapter: group.key },
    });
    button.textContent = open ? "–" : "+";
    button.setAttribute("aria-label", t(state.lang, "collapse.chapter"));
    const body = h("div", { class: "group-body" });
    body.hidden = !open;
    for (const entry of group.entries) {
      body.append(renderCard(entry));
    }
    const section = h("section", { class: "group", id: group.kind === "chapter" ? `chapter-${group.key}` : `topic-${group.key}` }, [
      h("div", { class: "group-bar" }, [button, h("h2", { text: headingText })]),
      body,
    ]);
    fragment.append(section);
  }
  host.replaceChildren(fragment);
  applyI18n();
  updateDemo();
  updateLifetime();
  updateGrowth();
  updateDelay();
  updateThroughput();
  updateChoice();
  updateLottery();
  applyVisibility();
}

function updateDiagnostics() {
  document.getElementById("diag-version").textContent = buildInfo.version;
  const headerVersion = document.getElementById("header-version");
  if (headerVersion) {
    headerVersion.textContent = buildInfo.version;
  }
  document.getElementById("diag-commit").textContent = publishedCommit();
  document.getElementById("diag-module").textContent = buildInfo.wasmSha256;
  document.getElementById("diag-module").title = buildInfo.wasmSha256;
  document.getElementById("diag-toolchain").textContent = buildInfo.toolchain;
  document.getElementById("diag-execution").textContent = t(state.lang, executionKey(session.phase));
  document.getElementById("diag-execution").dataset.execution = session.phase;
  document.getElementById("diag-calls").textContent = String(session.invocations);
  document.getElementById("diag-locale").textContent = state.lang;
  document.getElementById("diag-mime").textContent = session.mime || "—";
  window.__ath = {
    invocations: session.invocations,
    phase: session.phase,
    mime: session.mime,
    lang: state.lang,
    version: buildInfo.version,
  };
}

function executionKey(phase) {
  if (phase === "ready") return "exec.ready";
  if (phase === "failed") return "exec.failed";
  if (phase === "loading") return "exec.loading";
  return "exec.idle";
}

function updateDemo() {
  const statusNode = document.getElementById("addition-status");
  const resultNode = document.getElementById("addition-result");
  updateDiagnostics();
  if (!statusNode || !resultNode) {
    return;
  }
  resultNode.textContent = "";
  let code = "loading";
  if (session.phase === "loading") {
    code = "loading";
  } else if (session.phase !== "ready" || !session.exports) {
    code = "load-failed";
  } else {
    const left = interpretOperand(state.demo.left);
    const right = interpretOperand(state.demo.right);
    if (left.kind === "empty" || right.kind === "empty") {
      code = "empty";
    } else if (left.kind === "malformed" || right.kind === "malformed") {
      code = "malformed";
    } else {
      const outcome = callAddition(session, left.value, right.value);
      code = outcome.status;
      if (outcome.status === 0 && outcome.result !== null) {
        try {
          resultNode.textContent = formatCanonical(outcome.result);
        } catch {
          resultNode.textContent = "";
          code = 2;
        }
      }
    }
  }
  statusNode.dataset.status = String(code);
  statusNode.textContent = t(state.lang, statusMessage(code));
  const live = document.getElementById("live-result");
  if (live) {
    live.dataset.status = String(code);
  }
  updateDiagnostics();
}

function clearLifetimeView() {
  const result = document.getElementById("lifetime-result");
  if (result) {
    result.textContent = "";
  }
  for (let index = 1; index <= 4; index += 1) {
    const share = document.getElementById(`contrib-${index}`);
    const shownProbability = document.getElementById(`shown-prob-${index}`);
    const shownYears = document.getElementById(`shown-years-${index}`);
    const bar = document.getElementById(`bar-${index}`);
    if (share) share.textContent = "";
    if (shownProbability) shownProbability.textContent = "";
    if (shownYears) shownYears.textContent = "";
    if (bar) bar.style.width = "0%";
  }
}

function lifetimeMessage(code) {
  if (code === "loading") return "demo.loading";
  if (code === "load-failed") return "demo.loadFailed";
  if (code === "empty") return "lifetime.empty";
  if (code === "malformed") return "lifetime.malformed";
  if (code === 0) return "lifetime.ok";
  if (code === 1) return "lifetime.nonFinite";
  if (code === 2) return "lifetime.range";
  if (code === 3) return "lifetime.durationNegative";
  if (code === 4) return "lifetime.total";
  if (code === 5) return "lifetime.overflow";
  return "demo.loadFailed";
}

function updateLifetime() {
  const statusNode = document.getElementById("lifetime-status");
  const resultNode = document.getElementById("lifetime-result");
  if (!statusNode || !resultNode) {
    return;
  }
  clearLifetimeView();
  let code = "loading";
  let parsed = null;
  if (session.phase === "loading") {
    code = "loading";
  } else if (session.phase !== "ready" || !session.exports) {
    code = "load-failed";
  } else {
    const percentages = [];
    const durations = [];
    for (let index = 0; index < 4; index += 1) {
      const probability = interpretOperand(state.lifetime.probabilities[index]);
      const duration = interpretOperand(state.lifetime.durations[index]);
      if (probability.kind === "empty" || duration.kind === "empty") {
        code = "empty";
        break;
      }
      if (probability.kind === "malformed" || duration.kind === "malformed") {
        code = "malformed";
        break;
      }
      percentages.push(probability.value);
      durations.push(duration.value);
    }
    if (code === "loading") {
      const outcome = callLifetime(session, percentages, durations);
      code = outcome.status;
      if (outcome.status === 0 && outcome.mean !== null && outcome.contributions) {
        try {
          const headline = formatHeadlineYears(outcome.mean);
          resultNode.textContent = headline.text;
          resultNode.dataset.exactMean = formatCanonical(outcome.mean);
          resultNode.dataset.displayMode = headline.mode;
          const precision = document.getElementById("lifetime-precision");
          if (precision) {
            precision.textContent = t(
              state.lang,
              headline.mode === "nearest-100" ? "lifetime.precision" : "lifetime.exact",
            );
          }
          const exactMean = document.getElementById("diag-exact-mean");
          if (exactMean) {
            exactMean.textContent = formatCanonical(outcome.mean);
          }
          const largest = outcome.contributions.reduce((max, value) => Math.max(max, value), 0);
          outcome.contributions.forEach((value, index) => {
            const share = formatCanonical(value);
            document.getElementById(`contrib-${index + 1}`).textContent = share;
            document.getElementById(`shown-prob-${index + 1}`).textContent = state.lifetime.probabilities[index].trim();
            document.getElementById(`shown-years-${index + 1}`).textContent = state.lifetime.durations[index].trim();
            const width = largest === 0 ? 0 : (value / largest) * 100;
            document.getElementById(`bar-${index + 1}`).style.width = `${width}%`;
          });
          parsed = true;
        } catch {
          clearLifetimeView();
          code = 5;
        }
      }
    }
  }
  if (!parsed) {
    clearLifetimeView();
    const precision = document.getElementById("lifetime-precision");
    if (precision) precision.textContent = "";
    const exactMean = document.getElementById("diag-exact-mean");
    if (exactMean) exactMean.textContent = "—";
    resultNode.dataset.exactMean = "";
    resultNode.dataset.displayMode = "";
  }
  statusNode.dataset.status = String(code);
  statusNode.textContent = t(state.lang, lifetimeMessage(code));
  updateDiagnostics();
}

function clearGrowthView() {
  for (const id of ["growth-quantity", "growth-factor", "growth-end-year", "growth-eval-year"]) {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = "";
      delete node.dataset.exact;
    }
  }
  const chartNote = document.getElementById("growth-chart-note");
  if (chartNote) chartNote.textContent = "";
  const evalLegend = document.getElementById("growth-eval-legend");
  if (evalLegend) evalLegend.hidden = true;
  document.getElementById("growth-samples")?.replaceChildren();
  document.getElementById("growth-curve")?.replaceChildren();
  document.getElementById("growth-x-ticks")?.replaceChildren();
  document.getElementById("growth-y-ticks")?.replaceChildren();
  const exactQuantity = document.getElementById("growth-exact-quantity");
  const exactFactor = document.getElementById("growth-exact-factor");
  if (exactQuantity) exactQuantity.textContent = "";
  if (exactFactor) exactFactor.textContent = "";
  const warning = document.getElementById("growth-baseline-warning");
  if (warning) {
    warning.hidden = true;
    warning.textContent = "";
  }
}

function clearTargetView() {
  const statusNode = document.getElementById("growth-target-status");
  const text = document.getElementById("growth-target-text");
  const year = document.getElementById("growth-target-year");
  const exactYear = document.getElementById("growth-exact-year");
  const exactElapsed = document.getElementById("growth-exact-elapsed");
  if (text) text.textContent = "";
  if (year) {
    year.textContent = "";
    delete year.dataset.exactYear;
    delete year.dataset.exactElapsed;
  }
  if (statusNode) statusNode.dataset.targetStatus = "";
  if (exactYear) exactYear.textContent = "";
  if (exactElapsed) exactElapsed.textContent = "";
}

function growthMessage(code) {
  if (code === "loading") return "demo.loading";
  if (code === "load-failed") return "demo.loadFailed";
  if (code === "empty") return "growth.empty";
  if (code === "malformed") return "growth.malformed";
  if (code === 0) return "growth.ok";
  if (code === 1) return "growth.nonFinite";
  if (code === 2) return "growth.quantityNegative";
  if (code === 3) return "growth.elapsedNegative";
  if (code === 4) return "growth.doublingInvalid";
  if (code === 5) return "growth.overflow";
  if (code === 6) return "growth.yearNotInteger";
  if (code === 7) return "growth.yearRange";
  return "demo.loadFailed";
}

function tickCount() {
  return window.matchMedia("(max-width: 40rem)").matches ? 3 : 5;
}

function axisTicks(min, max, count) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];
  const span = max - min;
  const rough = span / Math.max(1, count - 1);
  const magnitude = 10 ** Math.floor(Math.log10(Math.abs(rough)));
  const step = [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough) ?? rough;
  const ticks = [];
  const first = Math.ceil((min - step * 1e-9) / step) * step;
  for (let value = first; value <= max + step * 1e-8; value += step) {
    if (value >= min - step * 1e-8) ticks.push(value);
  }
  const whole = (value) => Math.abs(value - Math.round(value)) <= 1e-6;
  if ((ticks.length === 0 || Math.abs(ticks[0] - min) > span * 0.04) && whole(min)) ticks.unshift(min);
  if (ticks.length === 0 || (Math.abs(ticks.at(-1) - max) > span * 0.04 && whole(max))) ticks.push(max);
  return ticks;
}

function logTicks(min, max) {
  const ticks = [];
  const start = Math.floor(Math.log10(min));
  const end = Math.ceil(Math.log10(max));
  for (let power = start; power <= end; power += 1) {
    for (const factor of [1, 2, 5]) {
      const value = factor * 10 ** power;
      if (value >= min * 0.999 && value <= max * 1.001) ticks.push(value);
    }
  }
  if (!ticks.includes(min)) ticks.unshift(min);
  if (ticks.at(-1) !== max) ticks.push(max);
  return ticks;
}

function renderGrowthCurve(outcome, target) {
  const curve = document.getElementById("growth-curve");
  const body = document.getElementById("growth-samples");
  const xTicks = document.getElementById("growth-x-ticks");
  const yTicks = document.getElementById("growth-y-ticks");
  if (!curve || !body || !xTicks || !yTicks) return;
  curve.replaceChildren();
  body.replaceChildren();
  xTicks.replaceChildren();
  yTicks.replaceChildren();
  const samples = outcome.samples;
  const baselineDrawn = outcome.baselineStatus === 0;
  const quantities = samples.flatMap((sample) => baselineDrawn ? [sample.quantity, sample.baseline] : [sample.quantity]);
  const hasZero = quantities.some((value) => value === 0);
  const requestedLog = state.growth.scale === "log";
  const scale = requestedLog && !hasZero ? "log" : "linear";
  const logNote = document.getElementById("growth-log-note");
  const logButton = document.getElementById("growth-log");
  const linearButton = document.getElementById("growth-linear");
  if (logButton && linearButton) {
    logButton.disabled = hasZero;
    logButton.setAttribute("aria-pressed", String(state.growth.scale === "log"));
    linearButton.setAttribute("aria-pressed", String(state.growth.scale !== "log"));
  }
  if (logNote) {
    logNote.hidden = !hasZero;
    logNote.textContent = hasZero ? t(state.lang, "growth.logUnavailable") : "";
  }
  const warning = document.getElementById("growth-baseline-warning");
  if (warning) {
    const showWarning = outcome.baselineStatus !== 0;
    warning.hidden = !showWarning;
    warning.textContent = showWarning ? t(state.lang, "growth.baselineOverflow") : "";
  }
  const dataMax = quantities.reduce((max, value) => Math.max(max, value), 0);
  let includeTarget = false;
  if (target && (target.status === 0 || target.status === 1 || target.status === 3) && Number.isFinite(target.level) && target.level > 0) {
    includeTarget = target.status === 0 || target.status === 1 || outcome.extended;
  }
  const yMax = scale === "log"
    ? Math.max(...quantities.filter((value) => value > 0), includeTarget ? target.level : 0)
    : Math.max(dataMax, includeTarget ? target.level : 0);
  const yMin = scale === "log"
    ? Math.min(...quantities.filter((value) => value > 0), includeTarget ? target.level : Number.POSITIVE_INFINITY)
    : 0;
  const xMin = samples[0].time;
  const xMax = samples.at(-1).time;
  const xOf = (time) => xMax === xMin ? 0 : ((time - xMin) / (xMax - xMin)) * 100;
  const yOf = (quantity) => {
    if (scale === "log") {
      const span = Math.log10(yMax) - Math.log10(yMin);
      if (!Number.isFinite(span) || span === 0) return 50;
      return 100 - ((Math.log10(quantity) - Math.log10(yMin)) / span) * 100;
    }
    if (yMax === 0) return 100;
    return 100 - (quantity / yMax) * 100;
  };
  const svg = "http://www.w3.org/2000/svg";
  const addSeries = (className, read) => {
    const polyline = document.createElementNS(svg, "polyline");
    polyline.setAttribute("class", className);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("points", samples.map((sample) => `${xOf(sample.time)},${yOf(read(sample))}`).join(" "));
    curve.append(polyline);
  };
  addSeries("series-chosen", (sample) => sample.quantity);
  if (baselineDrawn) addSeries("series-baseline", (sample) => sample.baseline);
  if (outcome.extended && Number.isFinite(outcome.evalYear)) {
    const mark = document.createElementNS(svg, "line");
    const x = xOf(outcome.evalYear);
    mark.setAttribute("class", "eval-line");
    mark.setAttribute("x1", String(x));
    mark.setAttribute("x2", String(x));
    mark.setAttribute("y1", "0");
    mark.setAttribute("y2", "100");
    curve.append(mark);
  }
  const evalLegend = document.getElementById("growth-eval-legend");
  if (evalLegend) evalLegend.hidden = !outcome.extended;
  if (includeTarget) {
    const y = yOf(target.level);
    const line = document.createElementNS(svg, "line");
    line.setAttribute("class", "target-line");
    line.setAttribute("x1", "0");
    line.setAttribute("x2", "100");
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    curve.append(line);
    if ((target.status === 0 || target.status === 1 || (target.status === 3 && outcome.extended))
      && target.year >= xMin && target.year <= xMax) {
      const mark = document.createElementNS(svg, "circle");
      mark.setAttribute("class", "target-mark");
      mark.setAttribute("cx", String(xOf(target.year)));
      mark.setAttribute("cy", String(y));
      mark.setAttribute("r", "1.4");
      curve.append(mark);
    }
  }
  const years = axisTicks(xMin, xMax, tickCount());
  for (const year of years) {
    const tick = document.createElement("span");
    const fraction = xMax === xMin ? 0 : (year - xMin) / (xMax - xMin);
    tick.textContent = formatReadable(year, state.lang, "year");
    tick.style.left = `${fraction * 100}%`;
    tick.style.transform = fraction <= 0.04 ? "translateX(0)" : fraction >= 0.96 ? "translateX(-100%)" : "translateX(-50%)";
    xTicks.append(tick);
  }
  const levels = scale === "log" && yMin > 0 && yMax > 0 ? logTicks(yMin, yMax) : axisTicks(0, yMax === 0 ? 0 : yMax, tickCount());
  for (const level of levels) {
    const tick = document.createElement("span");
    const y = yOf(level);
    tick.textContent = formatReadable(level, state.lang, "quantity");
    tick.style.top = `${y}%`;
    tick.style.right = "0";
    tick.style.transform = y < 10 ? "translateY(0)" : y > 90 ? "translateY(-100%)" : "translateY(-50%)";
    yTicks.append(tick);
  }
  curve.dataset.scale = scale;
  for (const sample of samples) {
    const row = document.createElement("tr");
    const year = document.createElement("td");
    const chosen = document.createElement("td");
    const baseline = document.createElement("td");
    year.textContent = formatReadable(sample.time, state.lang, "year");
    chosen.textContent = formatReadable(sample.quantity, state.lang, "quantity");
    baseline.textContent = baselineDrawn ? formatReadable(sample.baseline, state.lang, "quantity") : "";
    year.dataset.exact = formatCanonical(sample.time);
    chosen.dataset.exact = formatCanonical(sample.quantity);
    if (baselineDrawn) baseline.dataset.exact = formatCanonical(sample.baseline);
    row.append(year, chosen, baseline);
    body.append(row);
  }
}

function showTarget(code, yearText, exactYear, exactElapsed, extended = false) {
  const statusNode = document.getElementById("growth-target-status");
  const text = document.getElementById("growth-target-text");
  const year = document.getElementById("growth-target-year");
  const exactYearNode = document.getElementById("growth-exact-year");
  const exactElapsedNode = document.getElementById("growth-exact-elapsed");
  const keys = {
    0: "growth.targetWithin",
    1: "growth.targetAlready",
    2: "growth.targetNever",
    3: extended ? "growth.targetWithin" : "growth.targetOutside",
    4: "growth.targetInvalid",
    5: "growth.targetOverflow",
    empty: "growth.targetEmpty",
    malformed: "growth.malformed",
  };
  if (statusNode) statusNode.dataset.targetStatus = String(code);
  if (text) text.textContent = keys[code] ? t(state.lang, keys[code]) : "";
  if (year) {
    year.textContent = yearText;
    year.dataset.exactYear = exactYear;
    year.dataset.exactElapsed = exactElapsed;
  }
  if (exactYearNode) exactYearNode.textContent = exactYear;
  if (exactElapsedNode) exactElapsedNode.textContent = exactElapsed;
}

function updateGrowth() {
  const statusNode = document.getElementById("growth-status");
  const quantityNode = document.getElementById("growth-quantity");
  const factorNode = document.getElementById("growth-factor");
  const endNode = document.getElementById("growth-end-year");
  if (!statusNode || !quantityNode || !factorNode || !endNode) return;
  clearGrowthView();
  clearTargetView();
  let code = "loading";
  let shown = false;
  let outcome = null;
  const initial = interpretOperand(state.growth.initial);
  const doubling = interpretOperand(state.growth.doubling);
  const elapsed = interpretOperand(state.growth.elapsed);
  const startYear = interpretOperand(state.growth.startYear);
  const target = interpretOperand(state.growth.target);
  const useTarget = target.kind === "value" && Number.isFinite(target.value) && target.value > 0;
  if (session.phase === "loading") {
    code = "loading";
  } else if (session.phase !== "ready" || !session.exports) {
    code = "load-failed";
  } else if ([initial, doubling, elapsed, startYear].some((item) => item.kind === "empty")) {
    code = "empty";
  } else if ([initial, doubling, elapsed, startYear].some((item) => item.kind !== "value")) {
    code = "malformed";
  } else {
    outcome = callExplore(
      session,
      initial.value,
      doubling.value,
      elapsed.value,
      startYear.value,
      useTarget ? target.value : 0,
      useTarget,
    );
    code = outcome.status;
    if (outcome.status === 0 && outcome.quantity !== null && outcome.samples) {
      try {
        const evalNode = document.getElementById("growth-eval-year");
        const chartNote = document.getElementById("growth-chart-note");
        quantityNode.textContent = formatReadable(outcome.quantity, state.lang);
        factorNode.textContent = formatReadable(outcome.factor, state.lang);
        endNode.textContent = formatReadable(outcome.endYear, state.lang, "year");
        evalNode.textContent = formatReadable(outcome.evalYear, state.lang, "year");
        quantityNode.dataset.exact = formatCanonical(outcome.quantity);
        factorNode.dataset.exact = formatCanonical(outcome.factor);
        endNode.dataset.exact = formatCanonical(outcome.endYear);
        endNode.dataset.extended = outcome.extended ? "1" : "0";
        evalNode.dataset.exact = formatCanonical(outcome.evalYear);
        chartNote.textContent = t(state.lang, outcome.extended ? "growth.chartExtended" : "growth.chartHorizon");
        document.getElementById("growth-exact-quantity").textContent = formatCanonical(outcome.quantity);
        document.getElementById("growth-exact-factor").textContent = formatCanonical(outcome.factor);
        shown = true;
      } catch {
        clearGrowthView();
        outcome = null;
        code = 5;
      }
    }
  }
  let targetView = null;
  if (!shown) {
    clearGrowthView();
    clearTargetView();
  } else if (target.kind === "empty") {
    showTarget("empty", "", "", "");
  } else if (target.kind !== "value") {
    showTarget("malformed", "", "", "");
  } else {
    const crossing = callTarget(
      session,
      initial.value,
      doubling.value,
      elapsed.value,
      startYear.value,
      target.value,
    );
    const reportsYear = crossing.status === 0 || crossing.status === 1 || crossing.status === 3;
    if (!reportsYear) {
      showTarget(crossing.status, "", "", "");
      targetView = null;
    } else {
      showTarget(
        crossing.status,
        formatReadable(crossing.year, state.lang, "year"),
        formatCanonical(crossing.year),
        formatCanonical(crossing.elapsed),
        outcome.extended,
      );
      targetView = { status: crossing.status, year: crossing.year, level: target.value };
    }
  }
  if (shown && outcome) {
    try {
      renderGrowthCurve(outcome, targetView);
    } catch {
      clearGrowthView();
      clearTargetView();
      code = 5;
      shown = false;
    }
  }
  statusNode.dataset.status = String(code);
  statusNode.textContent = t(state.lang, growthMessage(code));
  updateDiagnostics();
}

function delayMessage(code) {
  if (code === "loading") return "demo.loading";
  if (code === "load-failed") return "demo.loadFailed";
  if (code === "empty") return "delay.empty";
  if (code === "malformed") return "delay.malformed";
  if (code === 0) return "delay.ok";
  if (code === 1) return "delay.nonFinite";
  if (code === 2) return "delay.negative";
  if (code === 3) return "delay.badUnit";
  if (code === 4) return "delay.overflow";
  return "demo.loadFailed";
}

function clearDelayView() {
  for (const id of ["delay-one-way", "delay-round", "delay-exact-one", "delay-exact-round"]) {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = "";
      delete node.dataset.exact;
    }
  }
  document.getElementById("delay-events")?.replaceChildren();
  document.getElementById("delay-track")?.replaceChildren();
}

function durationLabel(seconds) {
  const shown = formatDuration(seconds, state.lang);
  return `${shown.text} ${t(state.lang, `delay.unitWord.${shown.unit}`)}`;
}

function renderDelay(outcome) {
  const one = document.getElementById("delay-one-way");
  const round = document.getElementById("delay-round");
  const list = document.getElementById("delay-events");
  const track = document.getElementById("delay-track");
  const labels = ["delay.send", "delay.oneWay", "delay.roundTrip"];
  one.textContent = durationLabel(outcome.oneWay);
  round.textContent = durationLabel(outcome.roundTrip);
  one.dataset.exact = formatCanonical(outcome.oneWay);
  round.dataset.exact = formatCanonical(outcome.roundTrip);
  document.getElementById("delay-exact-one").textContent = formatCanonical(outcome.oneWay);
  document.getElementById("delay-exact-round").textContent = formatCanonical(outcome.roundTrip);
  list.replaceChildren();
  track.replaceChildren();
  outcome.events.forEach((time, index) => {
    const item = document.createElement("li");
    item.textContent = `${t(state.lang, labels[index])} — ${durationLabel(time)}`;
    list.append(item);
    if (index > 0) {
      const legNode = document.createElement("span");
      legNode.className = "delay-leg";
      legNode.textContent = durationLabel(outcome.legs[index - 1]);
      track.append(legNode);
    }
    const node = document.createElement("span");
    node.className = "delay-node";
    const number = document.createElement("span");
    number.className = index === outcome.events.length - 1 ? "delay-num reply" : "delay-num";
    number.textContent = String(index + 1);
    const name = document.createElement("span");
    name.className = "delay-name";
    name.textContent = t(state.lang, labels[index]);
    node.append(number, name);
    track.append(node);
  });
}

function updateDelay() {
  const statusNode = document.getElementById("delay-status");
  if (!statusNode) return;
  clearDelayView();
  let code = "loading";
  if (session.phase === "loading") {
    code = "loading";
  } else if (session.phase !== "ready" || !session.exports) {
    code = "load-failed";
  } else {
    const distance = interpretOperand(state.delay.distance);
    const unit = interpretOperand(state.delay.unit);
    if (distance.kind === "empty" || unit.kind === "empty") {
      code = "empty";
    } else if (distance.kind !== "value" || unit.kind !== "value") {
      code = "malformed";
    } else {
      const outcome = callDelay(session, distance.value, unit.value);
      code = outcome.status;
      if (outcome.status === 0 && outcome.oneWay !== null) {
        try {
          renderDelay(outcome);
        } catch (error) {
          clearDelayView();
          code = "load-failed";
          console.error(error);
        }
      }
    }
  }
  statusNode.dataset.status = String(code);
  statusNode.textContent = t(state.lang, delayMessage(code));
  updateDiagnostics();
}

function bitsLabel(bits) {
  return `${formatReadable(bits, state.lang)} ${t(state.lang, "throughput.bits")}`;
}

function timeLabel(seconds, upper) {
  const shown = formatShortDuration(seconds, state.lang);
  const text = `${shown.text} ${t(state.lang, shown.unit === "us" || shown.unit === "ms" ? `throughput.unitWord.${shown.unit}` : `delay.unitWord.${shown.unit}`)}`;
  return upper ? `${t(state.lang, "throughput.atMost")} ${text}` : text;
}

function throughputNoteKey(match) {
  if (match === 2) return "throughput.note.lower";
  if (match === 1) return "throughput.note.historical";
  if (match === 3) return "throughput.note.link";
  return "throughput.note.assumption";
}

const THROUGHPUT_KIND = {
  0: "throughput.customBar",
  1: "throughput.humanBar",
  2: "throughput.bacterialBar",
  3: "throughput.linkBar",
};

const THROUGHPUT_SERIES = {
  0: "series-custom",
  1: "series-human",
  2: "series-bacterial",
  3: "series-link",
};

const SVG_NS = "http://www.w3.org/2000/svg";

function throughputChosen(outcome, row) {
  return outcome.match === 0 ? row.kind === 0 : row.kind === outcome.match;
}

function seriesSwatch(className, mark = false, markClass = "target-mark") {
  const swatch = document.createElementNS(SVG_NS, "svg");
  swatch.setAttribute("class", "legend-swatch");
  swatch.setAttribute("viewBox", "0 0 36 10");
  swatch.setAttribute("aria-hidden", "true");
  if (mark) {
    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("class", markClass);
    dot.setAttribute("cx", "18");
    dot.setAttribute("cy", "5");
    dot.setAttribute("r", "2.6");
    swatch.append(dot);
  } else {
    if (className.includes("series-near-zero")) {
      const series = className.split(" ").find((name) => name.startsWith("series-") && name !== "series-chosen" && name !== "series-near-zero");
      const halo = document.createElementNS(SVG_NS, "line");
      halo.setAttribute("class", `${series} series-halo`);
      halo.setAttribute("x1", "1");
      halo.setAttribute("x2", "35");
      halo.setAttribute("y1", "5");
      halo.setAttribute("y2", "5");
      swatch.append(halo);
    }
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("class", className);
    line.setAttribute("x1", "1");
    line.setAttribute("x2", "35");
    line.setAttribute("y1", "5");
    line.setAttribute("y2", "5");
    swatch.append(line);
  }
  return swatch;
}

function legendEntry(className, text, data) {
  const item = document.createElement("li");
  if (data.kind != null) item.dataset.kind = String(data.kind);
  if (data.role) item.dataset.role = data.role;
  const label = document.createElement("span");
  label.textContent = text;
  item.append(seriesSwatch(className, data.mark === true, data.markClass || "target-mark"), label);
  return item;
}

function clearThroughputView() {
  for (const id of ["throughput-time", "throughput-total", "throughput-ratio", "throughput-exact-quantity", "throughput-exact-rate", "throughput-exact-time", "throughput-exact-total", "throughput-link-rate", "throughput-link-time", "throughput-exact-link"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = "";
  }
  document.getElementById("throughput-plot")?.replaceChildren();
  document.getElementById("throughput-plot-labels")?.replaceChildren();
  document.getElementById("throughput-compare")?.replaceChildren();
  const legend = document.getElementById("throughput-legend");
  legend?.replaceChildren();
  if (legend) legend.hidden = true;
  const note = document.getElementById("throughput-note");
  if (note) note.textContent = "";
}

function rateLabel(rate, lower) {
  const text = `${formatReadable(rate, state.lang)} ${t(state.lang, "throughput.bits")}/${t(state.lang, "delay.unitWord.s")}`;
  return lower ? `${t(state.lang, "throughput.atLeast")} ${text}` : text;
}

function renderThroughput(outcome) {
  const timeNode = document.getElementById("throughput-time");
  const totalNode = document.getElementById("throughput-total");
  const ratioNode = document.getElementById("throughput-ratio");
  if (outcome.time === null) {
    timeNode.textContent = outcome.status === 5
      ? t(state.lang, "throughput.unreachableValue")
      : t(state.lang, "throughput.indeterminateValue");
  } else {
    timeNode.textContent = timeLabel(outcome.time, outcome.timeUpper);
  }
  if (outcome.total !== null) {
    const bits = bitsLabel(outcome.total);
    totalNode.textContent = outcome.totalLower ? `${t(state.lang, "throughput.atLeast")} ${bits}` : bits;
  }
  const ratioLabel = document.getElementById("throughput-ratio-label");
  const preset = state.throughput.preset;
  if (preset === "historical") {
    if (ratioLabel) ratioLabel.textContent = t(state.lang, "throughput.ratioLabel");
    ratioNode.textContent = outcome.ratio === null ? "" : formatReadable(outcome.ratio, state.lang);
  } else if (preset === "human" || (preset === "custom" && outcome.match === 1)) {
    if (ratioLabel) ratioLabel.textContent = t(state.lang, "throughput.ratioFromHuman");
    ratioNode.textContent = outcome.ratio === null ? "" : formatReadable(outcome.ratio, state.lang);
  } else if (outcome.overHuman !== null) {
    if (ratioLabel) ratioLabel.textContent = t(state.lang, "throughput.ratioToHuman");
    ratioNode.textContent = formatReadable(outcome.overHuman, state.lang);
  } else if (ratioLabel) {
    ratioLabel.textContent = t(state.lang, "throughput.ratioToHuman");
    ratioNode.textContent = "";
  }
  document.getElementById("throughput-exact-quantity").textContent = outcome.quantityBits === null ? "" : formatCanonical(outcome.quantityBits);
  document.getElementById("throughput-exact-rate").textContent = outcome.rateBits === null ? "" : formatCanonical(outcome.rateBits);
  document.getElementById("throughput-exact-time").textContent = outcome.time === null ? "" : formatCanonical(outcome.time);
  document.getElementById("throughput-exact-total").textContent = outcome.total === null ? "" : formatCanonical(outcome.total);
  const list = document.getElementById("throughput-compare");
  const scaleNote = document.getElementById("throughput-scale-note");
  list.replaceChildren();
  const logarithmic = state.throughput.scale === "log";
  document.getElementById("throughput-linear")?.setAttribute("aria-pressed", logarithmic ? "false" : "true");
  document.getElementById("throughput-log")?.setAttribute("aria-pressed", logarithmic ? "true" : "false");
  if (scaleNote) {
    const humanFocus = state.throughput.preset === "human"
      || (state.throughput.preset === "custom" && outcome.match === 1);
    scaleNote.textContent = logarithmic
      ? t(state.lang, "throughput.logNote")
      : state.throughput.preset === "historical"
        ? t(state.lang, "throughput.linearNote")
        : humanFocus
          ? t(state.lang, "throughput.humanNote")
          : t(state.lang, "throughput.linearWide");
  }
  const note = document.getElementById("throughput-note");
  if (note) {
    note.textContent = state.throughput.preset === "custom"
      ? t(state.lang, "throughput.note.assumption")
      : t(state.lang, throughputNoteKey(outcome.match));
  }
  for (const [name, id] of [["historical", "throughput-preset-page"], ["human", "throughput-preset-human"], ["bacterial", "throughput-preset-bacterial"], ["link", "throughput-preset-link"]]) {
    document.getElementById(id)?.setAttribute("aria-pressed", state.throughput.preset === name ? "true" : "false");
  }
  if (outcome.linkTime !== null && outcome.linkRate !== null) {
    document.getElementById("throughput-link-rate").textContent = rateLabel(outcome.linkRate, false);
    document.getElementById("throughput-link-time").textContent = timeLabel(outcome.linkTime, false);
    document.getElementById("throughput-exact-link").textContent = formatCanonical(outcome.linkTime);
  }
  const rows = outcome.linearRows || [];
  const plot = document.getElementById("throughput-plot");
  const xTicks = document.getElementById("throughput-x-ticks");
  const yTicks = document.getElementById("throughput-y-ticks");
  plot?.replaceChildren();
  document.getElementById("throughput-plot-labels")?.replaceChildren();
  xTicks?.replaceChildren();
  yTicks?.replaceChildren();
  if (plot) plot.dataset.scale = logarithmic ? "log" : "linear";
  if (plot) plot.dataset.ready = outcome.plotReady ? "true" : "false";
  const legend = document.getElementById("throughput-legend");
  legend?.replaceChildren();
  if (legend) legend.hidden = true;
  const emptyNote = document.getElementById("throughput-plot-empty");
  if (emptyNote) {
    emptyNote.hidden = outcome.plotReady;
    emptyNote.textContent = outcome.logEmpty
      ? t(state.lang, "throughput.logEmpty")
      : t(state.lang, "throughput.plotEmpty");
  }
  for (const row of rows) {
    const chosen = throughputChosen(outcome, row);
    const name = t(state.lang, THROUGHPUT_KIND[row.kind]);
    const marked = chosen ? `${name} (${t(state.lang, "throughput.chosen")})` : name;
    const when = row.seconds === null
      ? t(state.lang, "throughput.unreachableValue")
      : timeLabel(row.seconds, row.lower && row.seconds > 0);
    const place = row.seconds !== null && !row.inside ? ` — ${t(state.lang, "throughput.afterChart")}` : "";
    const item = document.createElement("li");
    item.dataset.inside = row.inside ? "true" : "false";
    item.dataset.kind = String(row.kind);
    item.textContent = `${marked} — ${rateLabel(row.rate, row.lower)} — ${when}${place}`;
    list.append(item);
  }
  if (!plot || !outcome.plotReady || !rows.length) return;
  const svg = SVG_NS;
  const xOf = (time) => {
    if (logarithmic) {
      const span = Math.log10(outcome.xMax) - Math.log10(outcome.xMin);
      if (!Number.isFinite(span) || span === 0 || time <= 0) return null;
      return ((Math.log10(time) - Math.log10(outcome.xMin)) / span) * 100;
    }
    if (outcome.xMax === outcome.xMin) return 0;
    return ((time - outcome.xMin) / (outcome.xMax - outcome.xMin)) * 100;
  };
  const yOf = (info) => {
    if (logarithmic) {
      const span = Math.log10(outcome.yMax) - Math.log10(outcome.yMin);
      if (!Number.isFinite(span) || span === 0 || info <= 0) return null;
      return 100 - ((Math.log10(info) - Math.log10(outcome.yMin)) / span) * 100;
    }
    if (outcome.yMax === outcome.yMin) return 100;
    return 100 - ((info - outcome.yMin) / (outcome.yMax - outcome.yMin)) * 100;
  };
  const targetY = outcome.quantityBits > 0 ? yOf(outcome.quantityBits) : null;
  let targetDrawn = false;
  if (targetY !== null && targetY >= 0 && targetY <= 100) {
    const line = document.createElementNS(svg, "line");
    line.setAttribute("class", "target-line");
    line.setAttribute("x1", "0");
    line.setAttribute("x2", "100");
    line.setAttribute("y1", String(targetY));
    line.setAttribute("y2", String(targetY));
    plot.append(line);
    targetDrawn = true;
  }
  const plotted = [];
  const labels = document.getElementById("throughput-plot-labels");
  const plotHeight = plot.clientHeight || 256;
  const minVisiblePx = 8;
  const liftUnits = (minVisiblePx / plotHeight) * 100;
  let labelStack = 0;
  rows.forEach((row, index) => {
    const chosen = throughputChosen(outcome, row);
    const points = (row.samples || []).flatMap((sample) => {
      const x = xOf(sample.time);
      const y = yOf(sample.info);
      if (x === null || y === null) return [];
      return [`${x},${y}`];
    });
    if (!points.length) return;
    const series = THROUGHPUT_SERIES[row.kind] || "series-custom";
    const ys = points.map((pair) => Number(pair.split(",")[1]));
    const risePx = ((100 - Math.min(...ys)) / 100) * plotHeight;
    const positive = (row.samples || []).some((sample) => sample.info > 0);
    const nearZero = !logarithmic && positive && risePx < minVisiblePx;
    const drawn = nearZero
      ? points.map((pair) => {
        const [x, y] = pair.split(",").map(Number);
        return `${x},${Math.max(2, y - liftUnits)}`;
      })
      : points;
    plotted.push({ row, chosen, series, nearZero });
    const className = `${series}${chosen ? " series-chosen" : ""}${nearZero ? " series-near-zero" : ""}`;
    if (nearZero) {
      const halo = document.createElementNS(svg, "polyline");
      halo.setAttribute("class", `${series} series-halo`);
      halo.setAttribute("fill", "none");
      halo.setAttribute("points", drawn.join(" "));
      plot.append(halo);
    }
    const polyline = document.createElementNS(svg, "polyline");
    polyline.setAttribute("class", className);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("data-kind", String(row.kind));
    polyline.setAttribute("data-rate", formatCanonical(row.rate));
    polyline.setAttribute("data-inside", row.inside ? "true" : "false");
    if (nearZero) polyline.setAttribute("data-display", "near-zero");
    polyline.setAttribute("points", drawn.join(" "));
    const tip = document.createElementNS(svg, "title");
    const exact = `${t(state.lang, THROUGHPUT_KIND[row.kind])} — ${rateLabel(row.rate, row.lower)}`;
    tip.textContent = nearZero ? `${exact}. ${t(state.lang, "throughput.nearZero")}` : exact;
    polyline.append(tip);
    plot.append(polyline);
    if (nearZero && labels) {
      const tag = document.createElement("p");
      tag.className = "near-zero-label";
      tag.dataset.kind = String(row.kind);
      const endY = Number(drawn[drawn.length - 1].split(",")[1]);
      tag.style.bottom = `calc(${100 - endY}% + ${labelStack * 1.35}rem + 0.35rem)`;
      tag.textContent = `${t(state.lang, THROUGHPUT_KIND[row.kind])} — ${t(state.lang, "throughput.nearZero")}`;
      labels.append(tag);
      labelStack += 1;
    }
    if (row.inside && row.seconds !== null && targetY !== null && xOf(row.seconds) !== null) {
      const mark = document.createElementNS(svg, "circle");
      mark.setAttribute("class", "target-mark");
      mark.setAttribute("data-kind", String(row.kind));
      mark.setAttribute("cx", String(xOf(row.seconds)));
      mark.setAttribute("cy", String(targetY));
      mark.setAttribute("r", "1.6");
      plot.append(mark);
      plotted[plotted.length - 1].reached = true;
    }
    void index;
  });
  if (legend) {
    for (const entry of plotted) {
      const name = t(state.lang, THROUGHPUT_KIND[entry.row.kind]);
      const status = t(state.lang, entry.chosen ? "throughput.chosen" : "throughput.reference");
      const near = entry.nearZero ? ` — ${t(state.lang, "throughput.nearZero")}` : "";
      legend.append(legendEntry(
        `${entry.series}${entry.chosen ? " series-chosen" : ""}${entry.nearZero ? " series-near-zero" : ""}`,
        `${name} (${status})${near}`,
        { kind: entry.row.kind, role: entry.chosen ? "chosen" : "reference" },
      ));
    }
    if (targetDrawn && outcome.quantityBits > 0) {
      legend.append(legendEntry(
        "target-line",
        `${t(state.lang, "throughput.legendTarget")} — ${bitsLabel(outcome.quantityBits)}`,
        { role: "target" },
      ));
    }
    if (plotted.some((entry) => entry.reached)) {
      legend.append(legendEntry("", t(state.lang, "throughput.legendReached"), { role: "reached", mark: true }));
    }
    legend.hidden = legend.childElementCount === 0;
  }
  const xLabels = [outcome.xMin, outcome.xMax].filter((value, index, all) => all.indexOf(value) === index);
  for (const value of xLabels) {
    const tick = document.createElement("span");
    tick.textContent = timeLabel(value, false);
    xTicks?.append(tick);
  }
  const yLabels = [outcome.yMax, outcome.quantityBits, outcome.yMin].filter((value, index, all) => Number.isFinite(value) && (logarithmic ? value > 0 : value >= 0) && all.indexOf(value) === index);
  for (const value of yLabels) {
    const y = yOf(value);
    if (y === null) continue;
    const tick = document.createElement("span");
    tick.textContent = bitsLabel(value);
    tick.style.top = `${y}%`;
    tick.style.transform = y <= 0 ? "translateY(0)" : y >= 100 ? "translateY(-100%)" : "translateY(-50%)";
    yTicks?.append(tick);
  }
}

function throughputMessage(code, outcome) {
  if (code === "loading") return "demo.loading";
  if (code === "load-failed") return "demo.loadFailed";
  if (code === "empty") return "throughput.empty";
  if (code === "malformed") return "throughput.malformed";
  if (code === 0) return outcome && outcome.timeUpper ? "throughput.okLower" : "throughput.ok";
  if (code === 1) return "throughput.nonFinite";
  if (code === 2) return "throughput.negative";
  if (code === 3) return "throughput.badUnit";
  if (code === 4) return "throughput.overflow";
  if (code === 5) return "throughput.unreachable";
  if (code === 6) return "throughput.indeterminate";
  return "demo.loadFailed";
}

function updateThroughput() {
  const statusNode = document.getElementById("throughput-status");
  if (!statusNode) return;
  clearThroughputView();
  let code = "loading";
  let outcome = null;
  if (session.phase === "loading") {
    code = "loading";
  } else if (session.phase !== "ready" || !session.exports) {
    code = "load-failed";
  } else {
    const fields = ["quantity", "quantityUnit", "rate", "rateUnit", "bound", "duration", "durationUnit"];
    const parsed = {};
    let empty = false;
    let malformed = false;
    for (const field of fields) {
      const value = interpretOperand(state.throughput[field]);
      if (value.kind === "empty") empty = true;
      else if (value.kind !== "value") malformed = true;
      else parsed[field] = value.value;
    }
    if (empty) code = "empty";
    else if (malformed) code = "malformed";
    else {
      const presetMode = { historical: 0, human: 1, bacterial: 2, link: 3, custom: 4 };
      outcome = callThroughput(
        session,
        parsed.quantity,
        parsed.quantityUnit,
        parsed.rate,
        parsed.rateUnit,
        parsed.bound,
        parsed.duration,
        parsed.durationUnit,
        presetMode[state.throughput.preset] ?? 4,
        state.throughput.scale === "log" ? 1 : 0,
      );
      code = outcome.status;
      if (outcome.status === 0 || outcome.status === 5 || outcome.status === 6) {
        try {
          renderThroughput(outcome);
        } catch (error) {
          clearThroughputView();
          code = "load-failed";
          console.error(error);
        }
      }
    }
  }
  statusNode.dataset.status = String(code);
  statusNode.textContent = t(state.lang, throughputMessage(code, outcome));
  updateDiagnostics();
}

function syncThroughputForm() {
  document.getElementById("throughput-quantity").value = state.throughput.quantity;
  document.getElementById("throughput-quantity-unit").value = state.throughput.quantityUnit;
  document.getElementById("throughput-rate").value = state.throughput.rate;
  document.getElementById("throughput-rate-unit").value = state.throughput.rateUnit;
  document.getElementById("throughput-duration").value = state.throughput.duration;
  document.getElementById("throughput-duration-unit").value = state.throughput.durationUnit;
}

function statusMessage(code) {
  if (code === "loading") return "demo.loading";
  if (code === "load-failed") return "demo.loadFailed";
  if (code === "empty") return "demo.empty";
  if (code === "malformed") return "demo.malformed";
  if (code === 0) return "demo.ok";
  if (code === 1) return "demo.nonFinite";
  if (code === 2) return "demo.overflow";
  return "demo.loadFailed";
}

function routeFromHash() {
  return contentRoute();
}

function showRoute(route, options = {}) {
  if (route && catalogueLimits()) {
    state = {
      ...state,
      query: "",
      filters: { chapter: new Set(), topic: new Set(), type: new Set() },
    };
    const search = document.getElementById("search");
    if (search) search.value = "";
    renderFilters();
  }
  const entry = route ? entries.find((item) => item.id === route) : null;
  if (entry) {
    state = expandCard(state, entry.chapterId, entry.id);
  }
  renderReading(route);
  renderResults();
  const alignSelection = () => {
    const dock = document.querySelector(".debug-dock");
    const offset = (dock?.getBoundingClientRect().height ?? 0) + 12;
    const target = route ? document.getElementById("reading") : document.getElementById("chapters-label");
    if (!target || target.hidden) return;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), left: 0 });
    if (route && options.focus) document.getElementById("reading-title")?.focus({ preventScroll: true });
  };
  alignSelection();
  requestAnimationFrame(alignSelection);
}

const CHOICE_PRESETS = {
  coin: { possibilities: "2", repeats: "8" },
  die: { possibilities: "6", repeats: "2" },
  alphabet: { possibilities: "26", repeats: "3" },
};

function bitsPhrase(value) {
  const one = Math.abs(value - 1) < 1e-9;
  const unit = t(state.lang, state.lang === "de" || !one ? "choice.bits" : "choice.bit");
  if (state.lang === "de") {
    return `${formatReadable(value, state.lang)} ${t(state.lang, "choice.bit")}`;
  }
  return `${formatReadable(value, state.lang)} ${unit}`;
}

function choiceCountText(outcome) {
  if (outcome.combinationsExact) return formatCanonical(outcome.combinations);
  const log = `${t(state.lang, "choice.log10")} ${formatReadable(outcome.log10Count, state.lang)}`;
  if (outcome.combinations !== null) {
    const estimate = t(state.lang, "choice.countEstimate").replace("{value}", outcome.combinations.toExponential(6));
    return `${t(state.lang, "choice.countBeyond")} ${estimate} ${log}`;
  }
  return `${t(state.lang, "choice.countBeyond")} ${log}`;
}

function fillTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function choiceSummary(outcome) {
  const possibilities = Number(state.choice.possibilities);
  const repeats = Number(state.choice.repeats);
  const values = {
    n: formatReadable(possibilities, state.lang),
    k: formatReadable(repeats, state.lang),
    count: outcome.combinationsExact ? formatCanonical(outcome.combinations) : "",
    total: bitsPhrase(outcome.totalBits),
    per: bitsPhrase(outcome.bitsPer),
  };
  let key = "choice.summary.sequence";
  if (possibilities === 1) key = "choice.summary.oneOutcome";
  else if (repeats === 0) key = "choice.summary.zeroTimes";
  else if (!outcome.combinationsExact) key = "choice.summary.huge";
  else if (state.choice.preset === "coin") key = "choice.summary.coin";
  else if (state.choice.preset === "die") key = "choice.summary.die";
  else if (state.choice.preset === "alphabet") key = "choice.summary.alphabet";
  else if (repeats === 1) key = "choice.summary.once";
  return fillTemplate(t(state.lang, key), values);
}

function choiceMessage(code) {
  if (code === "loading") return "demo.loading";
  if (code === "load-failed") return "demo.loadFailed";
  if (code === "empty") return "choice.empty";
  if (code === "malformed") return "choice.malformed";
  if (code === 0) return "choice.ok";
  if (code === 1) return "choice.nonFinite";
  if (code === 2) return "choice.notInteger";
  if (code === 3) return "choice.notPositive";
  if (code === 4) return "choice.negativeRepeats";
  if (code === 5) return "choice.outOfRange";
  if (code === 6) return "choice.overflow";
  return "demo.loadFailed";
}

function clearChoiceView() {
  for (const id of ["choice-per", "choice-total", "choice-count", "choice-code", "choice-exact-per", "choice-exact-total", "choice-exact-code", "choice-exact-count"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = "";
  }
  document.getElementById("choice-plot")?.replaceChildren();
  document.getElementById("choice-legend")?.replaceChildren();
  document.getElementById("choice-x-ticks")?.replaceChildren();
  document.getElementById("choice-y-ticks")?.replaceChildren();
}

function renderChoice(outcome) {
  document.getElementById("choice-per").textContent = bitsPhrase(outcome.bitsPer);
  document.getElementById("choice-total").textContent = bitsPhrase(outcome.totalBits);
  document.getElementById("choice-count").textContent = choiceCountText(outcome);
  document.getElementById("choice-exact-per").textContent = formatCanonical(outcome.bitsPer);
  document.getElementById("choice-exact-total").textContent = formatCanonical(outcome.totalBits);
  document.getElementById("choice-exact-code").textContent = outcome.codeTotal === null
    ? ""
    : `${formatCanonical(outcome.codePer)} / ${formatCanonical(outcome.codeTotal)}`;
  document.getElementById("choice-exact-count").textContent = outcome.combinationsExact
    ? formatCanonical(outcome.combinations)
    : formatCanonical(outcome.log10Count);
  const code = document.getElementById("choice-code");
  if (code) {
    const totalText = outcome.codeTotal === null ? "—" : bitsPhrase(outcome.codeTotal);
    code.textContent = t(state.lang, "choice.codeLine")
      .replace("{per}", bitsPhrase(outcome.codePer))
      .replace("{total}", totalText);
  }
  const note = document.getElementById("choice-note");
  if (note) note.textContent = choiceSummary(outcome);
  for (const name of ["coin", "die", "alphabet"]) {
    document.getElementById(`choice-preset-${name}`)?.setAttribute("aria-pressed", state.choice.preset === name ? "true" : "false");
  }
  const plot = document.getElementById("choice-plot");
  const legend = document.getElementById("choice-legend");
  const xTicks = document.getElementById("choice-x-ticks");
  const yTicks = document.getElementById("choice-y-ticks");
  if (!plot || !legend || !outcome.samples.length) return;
  const xOf = (value) => (outcome.xMax === 0 ? 0 : (value / outcome.xMax) * 100);
  const yOf = (value) => (outcome.yMax === 0 ? 100 : 100 - (value / outcome.yMax) * 100);
  const points = outcome.samples.map((sample) => `${xOf(sample.repeats)},${yOf(sample.bits)}`);
  const line = document.createElementNS(SVG_NS, "polyline");
  line.setAttribute("class", "series-choice");
  line.setAttribute("fill", "none");
  line.setAttribute("data-series", "choice");
  line.setAttribute("points", points.join(" "));
  plot.append(line);
  const end = outcome.samples[outcome.samples.length - 1];
  const mark = document.createElementNS(SVG_NS, "circle");
  mark.setAttribute("class", "choice-mark");
  mark.setAttribute("cx", String(xOf(end.repeats)));
  mark.setAttribute("cy", String(yOf(end.bits)));
  mark.setAttribute("r", "1.8");
  plot.append(mark);
  legend.append(legendEntry("series-choice", t(state.lang, "choice.series"), { role: "series" }));
  legend.append(legendEntry("", t(state.lang, "choice.marker"), { role: "marker", mark: true, markClass: "choice-mark" }));
  const xValues = [0, end.repeats].filter((value, index, all) => all.indexOf(value) === index);
  for (const value of xValues) {
    const tick = document.createElement("span");
    tick.textContent = formatReadable(value, state.lang);
    xTicks?.append(tick);
  }
  const yValues = [outcome.yMax, outcome.totalBits, 0].filter((value, index, all) => all.indexOf(value) === index);
  for (const value of yValues) {
    const tick = document.createElement("span");
    const y = yOf(value);
    tick.textContent = bitsPhrase(value);
    tick.style.top = `${y}%`;
    tick.style.transform = y <= 0 ? "translateY(0)" : y >= 100 ? "translateY(-100%)" : "translateY(-50%)";
    yTicks?.append(tick);
  }
}

function syncChoiceForm() {
  document.getElementById("choice-n").value = state.choice.possibilities;
  document.getElementById("choice-k").value = state.choice.repeats;
}

function updateChoice() {
  const statusNode = document.getElementById("choice-status");
  if (!statusNode) return;
  clearChoiceView();
  let code = "loading";
  if (session.phase === "loading") {
    code = "loading";
  } else if (session.phase !== "ready" || !session.exports) {
    code = "load-failed";
  } else {
    const possibilities = interpretOperand(state.choice.possibilities);
    const repeats = interpretOperand(state.choice.repeats);
    if (possibilities.kind === "empty" || repeats.kind === "empty") code = "empty";
    else if (possibilities.kind !== "value" || repeats.kind !== "value") code = "malformed";
    else {
      const outcome = callChoice(session, possibilities.value, repeats.value);
      code = outcome.status;
      if (outcome.status === 0) {
        try {
          renderChoice(outcome);
        } catch (error) {
          clearChoiceView();
          code = "load-failed";
          console.error(error);
        }
      }
    }
  }
  statusNode.dataset.status = String(code);
  statusNode.textContent = t(state.lang, choiceMessage(code));
  updateDiagnostics();
}

const LOTTERY_PRESETS = {
  small: { tickets: "10", prizes: "2", bought: "3" },
  book: { tickets: "1000000", prizes: "1000", bought: "500000" },
};

function fillLottery(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function powerOfTen(log10) {
  let exponent = Math.floor(log10);
  let mantissa = 10 ** (log10 - exponent);
  if (!Number.isFinite(mantissa) || mantissa === 0) {
    return `10^${formatReadable(log10, state.lang)}`;
  }
  if (mantissa >= 10) {
    mantissa /= 10;
    exponent += 1;
  } else if (mantissa < 1) {
    mantissa *= 10;
    exponent -= 1;
  }
  const sign = exponent < 0 ? "−" : "";
  return `${formatReadable(mantissa, state.lang)} × 10^${sign}${formatReadable(Math.abs(exponent), state.lang)}`;
}

function lotteryChanceText(outcome, which) {
  if (outcome.fractionValid) {
    const numerator = which === "none"
      ? outcome.fractionNum
      : outcome.fractionDen - outcome.fractionNum;
    return `${formatCanonical(numerator)}/${formatCanonical(outcome.fractionDen)}`;
  }
  if (outcome.noneExactZero) return which === "none" ? "0" : "1";
  if (outcome.none === 1) return which === "none" ? "1" : "0";
  if (!outcome.noneRepresentable) {
    return which === "none" ? powerOfTen(outcome.noneLog10) : t(state.lang, "lottery.oneMinusTiny");
  }
  if (which === "none" && outcome.none < 1e-4) return powerOfTen(outcome.noneLog10);
  if (which === "some" && outcome.none > 0 && outcome.none < 1e-6) return t(state.lang, "lottery.oneMinusTiny");
  return formatReadable(which === "none" ? outcome.none : outcome.atLeast, state.lang);
}

function lotterySummary(outcome) {
  const values = {
    m: formatReadable(Number(state.lottery.tickets), state.lang),
    w: formatReadable(Number(state.lottery.prizes), state.lang),
    k: formatReadable(Number(state.lottery.bought), state.lang),
    expected: formatReadable(outcome.expected, state.lang),
    none: lotteryChanceText(outcome, "none"),
    some: lotteryChanceText(outcome, "some"),
  };
  const bought = Number(state.lottery.bought);
  const prizes = Number(state.lottery.prizes);
  let key = "lottery.summary.general";
  if (state.lottery.preset === "book") key = "lottery.summary.book";
  else if (bought === 0) key = "lottery.summary.noneBought";
  else if (prizes === 0) key = "lottery.summary.noPrizes";
  else if (outcome.noneExactZero) key = "lottery.summary.must";
  return fillLottery(t(state.lang, key), values);
}

function lotteryMessage(code) {
  if (code === "loading") return "demo.loading";
  if (code === "load-failed") return "demo.loadFailed";
  if (code === "empty") return "demo.empty";
  if (code === "malformed") return "demo.malformed";
  if (code === 0) return "lottery.ok";
  if (code === 1) return "demo.nonFinite";
  if (code === 2) return "lottery.notInteger";
  if (code === 3) return "lottery.notPositive";
  if (code === 4) return "lottery.badPrizes";
  if (code === 5) return "lottery.badBought";
  if (code === 6) return "lottery.range";
  return "demo.loadFailed";
}

function clearLotteryView() {
  for (const id of ["lottery-expected", "lottery-none", "lottery-some", "lottery-note", "lottery-exact-expected", "lottery-exact-none", "lottery-exact-log"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = "";
  }
  for (const id of ["lottery-expected-plot", "lottery-chance-plot", "lottery-expected-legend", "lottery-chance-legend", "lottery-expected-x-ticks", "lottery-chance-x-ticks", "lottery-expected-y-ticks", "lottery-chance-y-ticks"]) {
    document.getElementById(id)?.replaceChildren();
  }
}

function appendLotteryLine(plot, samples, xOf, yOf) {
  let points = [];
  const flush = () => {
    if (points.length === 0) return;
    const line = document.createElementNS(SVG_NS, "polyline");
    line.setAttribute("fill", "none");
    line.setAttribute("points", points.join(" "));
    plot.append(line);
    points = [];
    return line;
  };
  for (const sample of samples) {
    if (sample.skip) {
      flush();
      continue;
    }
    points.push(`${xOf(sample.x)},${yOf(sample.y)}`);
  }
  return flush();
}

function renderLottery(outcome) {
  document.getElementById("lottery-expected").textContent = formatReadable(outcome.expected, state.lang);
  document.getElementById("lottery-none").textContent = lotteryChanceText(outcome, "none");
  document.getElementById("lottery-some").textContent = lotteryChanceText(outcome, "some");
  document.getElementById("lottery-exact-expected").textContent = formatCanonical(outcome.expected);
  document.getElementById("lottery-exact-none").textContent = outcome.noneExactZero
    ? "0"
    : outcome.fractionValid
      ? `${formatCanonical(outcome.fractionNum)}/${formatCanonical(outcome.fractionDen)}`
      : outcome.noneRepresentable
        ? formatCanonical(outcome.none)
        : "";
  document.getElementById("lottery-exact-log").textContent = outcome.noneExactZero
    ? ""
    : formatCanonical(outcome.noneLog10);
  const note = document.getElementById("lottery-note");
  if (note) note.textContent = lotterySummary(outcome);
  for (const name of ["small", "book"]) {
    document.getElementById(`lottery-preset-${name}`)?.setAttribute("aria-pressed", state.lottery.preset === name ? "true" : "false");
  }
  const xMax = outcome.xMax;
  const xOf = (value) => (xMax === 0 ? 0 : (value / xMax) * 100);
  const bought = Number(state.lottery.bought);
  const expectedPlot = document.getElementById("lottery-expected-plot");
  const chancePlot = document.getElementById("lottery-chance-plot");
  if (!expectedPlot || !chancePlot || !outcome.samples.length) return;
  const yMax = outcome.expectedMax;
  const yOfExpected = (value) => (yMax === 0 ? 100 : 100 - (value / yMax) * 100);
  const expectedLine = appendLotteryLine(
    expectedPlot,
    outcome.samples.map((sample) => ({ x: sample.bought, y: sample.expected })),
    xOf,
    yOfExpected,
  );
  expectedLine?.setAttribute("class", "series-lottery");
  const expectedMark = document.createElementNS(SVG_NS, "circle");
  expectedMark.setAttribute("class", "lottery-mark");
  expectedMark.setAttribute("cx", String(xOf(bought)));
  expectedMark.setAttribute("cy", String(yOfExpected(outcome.expected)));
  expectedMark.setAttribute("r", "1.8");
  expectedPlot.append(expectedMark);
  const chanceSamples = outcome.samples.map((sample) => ({
    x: sample.bought,
    y: sample.chance,
    skip: sample.kind === 2 || (sample.kind === 0 && sample.chance > 0 && sample.chance < 1.0e-3),
  }));
  let segmentClass = false;
  const drawChance = () => {
    let points = [];
    const flush = () => {
      if (points.length === 0) return;
      const line = document.createElementNS(SVG_NS, "polyline");
      line.setAttribute("class", "series-lottery-chance");
      line.setAttribute("fill", "none");
      line.setAttribute("points", points.join(" "));
      chancePlot.append(line);
      points = [];
      segmentClass = true;
    };
    for (const sample of chanceSamples) {
      if (sample.skip) {
        flush();
        continue;
      }
      points.push(`${xOf(sample.x)},${100 - sample.y * 100}`);
    }
    flush();
  };
  drawChance();
  if (!segmentClass && outcome.samples.length) {
    const axis = document.createElementNS(SVG_NS, "polyline");
    axis.setAttribute("class", "series-lottery-chance");
    axis.setAttribute("fill", "none");
    axis.setAttribute("points", "0,100 100,100");
    chancePlot.append(axis);
  }
  const userTooSmall = (!outcome.noneRepresentable && !outcome.noneExactZero)
    || (outcome.noneRepresentable && outcome.none > 0 && outcome.none < 1.0e-3);
  if (!userTooSmall) {
    const chanceMark = document.createElementNS(SVG_NS, "circle");
    chanceMark.setAttribute("class", "lottery-mark");
    chanceMark.setAttribute("cx", String(xOf(bought)));
    chanceMark.setAttribute("cy", String(100 - (outcome.noneExactZero ? 0 : outcome.none) * 100));
    chanceMark.setAttribute("r", "1.8");
    chancePlot.append(chanceMark);
  }
  const expectedLegend = document.getElementById("lottery-expected-legend");
  const chanceLegend = document.getElementById("lottery-chance-legend");
  expectedLegend?.append(legendEntry("series-lottery", t(state.lang, "lottery.seriesExpected"), { role: "series" }));
  expectedLegend?.append(legendEntry("", t(state.lang, "lottery.marker"), { role: "marker", mark: true, markClass: "lottery-mark" }));
  chanceLegend?.append(legendEntry("series-lottery-chance", t(state.lang, "lottery.seriesChance"), { role: "series" }));
  chanceLegend?.append(legendEntry("", t(state.lang, "lottery.marker"), { role: "marker", mark: true, markClass: "lottery-mark" }));
  const placeTicks = (host, values, yOf) => {
    if (!host) return;
    for (const value of values) {
      const tick = document.createElement("span");
      tick.textContent = formatReadable(value, state.lang);
      if (yOf) {
        const y = yOf(value);
        tick.style.top = `${y}%`;
        tick.style.transform = y <= 0 ? "translateY(0)" : y >= 100 ? "translateY(-100%)" : "translateY(-50%)";
      }
      host.append(tick);
    }
  };
  const xValues = [0, xMax].filter((value, index, all) => all.indexOf(value) === index);
  placeTicks(document.getElementById("lottery-expected-x-ticks"), xValues);
  placeTicks(document.getElementById("lottery-chance-x-ticks"), xValues);
  const expectedTicks = [yMax, outcome.expected, 0].filter((value, index, all) => all.indexOf(value) === index);
  placeTicks(document.getElementById("lottery-expected-y-ticks"), expectedTicks, yOfExpected);
  placeTicks(document.getElementById("lottery-chance-y-ticks"), [1, 0], (value) => 100 - value * 100);
}

function syncLotteryForm() {
  document.getElementById("lottery-m").value = state.lottery.tickets;
  document.getElementById("lottery-w").value = state.lottery.prizes;
  document.getElementById("lottery-k").value = state.lottery.bought;
}

function updateLottery() {
  const statusNode = document.getElementById("lottery-status");
  if (!statusNode) return;
  clearLotteryView();
  let code = "loading";
  if (session.phase === "loading") {
    code = "loading";
  } else if (session.phase !== "ready" || !session.exports) {
    code = "load-failed";
  } else {
    const tickets = interpretOperand(state.lottery.tickets);
    const prizes = interpretOperand(state.lottery.prizes);
    const bought = interpretOperand(state.lottery.bought);
    if (tickets.kind === "empty" || prizes.kind === "empty" || bought.kind === "empty") code = "empty";
    else if (tickets.kind !== "value" || prizes.kind !== "value" || bought.kind !== "value") code = "malformed";
    else {
      const outcome = callLottery(session, tickets.value, prizes.value, bought.value);
      code = outcome.status;
      if (outcome.status === 0) {
        try {
          renderLottery(outcome);
        } catch (error) {
          clearLotteryView();
          code = "load-failed";
          console.error(error);
        }
      }
    }
  }
  statusNode.dataset.status = String(code);
  statusNode.textContent = t(state.lang, lotteryMessage(code));
  updateDiagnostics();
}

function debugReport() {
  const comment = document.getElementById("debug-expectation")?.value ?? "";
  const textOf = (id) => document.getElementById(id)?.textContent ?? "";
  const valueOf = (id) => document.getElementById(id)?.value ?? "";
  const lines = [
    "Ada Technological Horizons debug report",
    `Release: ${textOf("diag-version") || textOf("header-version")}`,
    `Published commit: ${textOf("diag-commit")}`,
    `Locale: ${document.documentElement.lang}`,
    `Active address: ${location.hash || "(all chapters)"}`,
    `Wasm response type: ${textOf("diag-mime")}`,
    `Execution: ${textOf("diag-execution")}`,
    `Ada calls: ${textOf("diag-calls")}`,
    `Toolchain: ${textOf("diag-toolchain")}`,
    `Module fingerprint: ${textOf("diag-module")}`,
    "",
    "Expectation:",
    comment.trim() === "" ? "(none)" : comment,
    "",
    "Lifetime",
    `Probabilities: ${[1, 2, 3, 4].map((index) => valueOf(`prob-${index}`)).join(", ")}`,
    `Durations: ${[1, 2, 3, 4].map((index) => valueOf(`years-${index}`)).join(", ")}`,
    `Headline: ${textOf("lifetime-result")}`,
    `Status: ${textOf("lifetime-status")}`,
    "",
    "Growth",
    `Initial: ${valueOf("growth-initial")}`,
    `Doubling: ${valueOf("growth-doubling")}`,
    `Elapsed: ${valueOf("growth-elapsed")}`,
    `Start year: ${valueOf("growth-start-year")}`,
    `Target: ${valueOf("growth-target")}`,
    `Quantity: ${textOf("growth-quantity")}`,
    `Factor: ${textOf("growth-factor")}`,
    `Evaluation year: ${textOf("growth-eval-year")}`,
    `Chart end: ${textOf("growth-end-year")}`,
    `Status: ${textOf("growth-status")}`,
    "",
    "Light time",
    `Distance: ${valueOf("delay-distance")}`,
    `Unit: ${valueOf("delay-unit")}`,
    `One way: ${textOf("delay-one-way")}`,
    `Reply: ${textOf("delay-round")}`,
    `Events: ${[...document.querySelectorAll("#delay-events li")].map((node) => node.textContent).join(" | ")}`,
    `Status: ${textOf("delay-status")}`,
    "",
    "Information rate",
    `Quantity: ${valueOf("throughput-quantity")}`,
    `Quantity unit: ${valueOf("throughput-quantity-unit")}`,
    `Rate: ${valueOf("throughput-rate")}`,
    `Rate unit: ${valueOf("throughput-rate-unit")}`,
    `Duration: ${valueOf("throughput-duration")}`,
    `Duration unit: ${valueOf("throughput-duration-unit")}`,
    `Scale: ${state.throughput.scale}`,
    `Preset: ${state.throughput.preset}`,
    `Time: ${textOf("throughput-time")}`,
    `Total: ${textOf("throughput-total")}`,
    `Ratio label: ${textOf("throughput-ratio-label")}`,
    `Ratio: ${textOf("throughput-ratio")}`,
    `Comparison: ${[...document.querySelectorAll("#throughput-compare li")].map((node) => node.textContent).join(" | ")}`,
    `Link rate: ${textOf("throughput-link-rate")}`,
    `Link time: ${textOf("throughput-link-time")}`,
    `Status: ${textOf("throughput-status")}`,
    `Note: ${textOf("throughput-note")}`,
    "",
    "Lottery",
    `Tickets: ${valueOf("lottery-m")}`,
    `Prizes: ${valueOf("lottery-w")}`,
    `Bought: ${valueOf("lottery-k")}`,
    `Preset: ${state.lottery.preset}`,
    `Expected prizes: ${textOf("lottery-expected")}`,
    `Chance of nothing: ${textOf("lottery-none")}`,
    `Chance of at least one: ${textOf("lottery-some")}`,
    `Status: ${textOf("lottery-status")}`,
    "",
    "Choices",
    `Possibilities: ${valueOf("choice-n")}`,
    `Repetitions: ${valueOf("choice-k")}`,
    `Preset: ${state.choice.preset}`,
    `Ideal per selection: ${textOf("choice-per")}`,
    `Ideal total: ${textOf("choice-total")}`,
    `Combinations: ${textOf("choice-count")}`,
    `Code: ${textOf("choice-code")}`,
    `Status: ${textOf("choice-status")}`,
    "",
    "Addition",
    `Left: ${valueOf("operand-left")}`,
    `Right: ${valueOf("operand-right")}`,
    `Result: ${textOf("addition-result")}`,
    `Status: ${textOf("addition-status")}`,
    "",
  ];
  return lines.join("\n");
}

function downloadReport(text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = "ath-debug.txt";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function saveDebugReport() {
  const text = debugReport();
  const headless = /Headless/i.test(navigator.userAgent);
  if (!headless && typeof window.showSaveFilePicker === "function") {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "ath-debug.txt",
        types: [{ description: "Text", accept: { "text/plain": [".txt"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }
  downloadReport(text);
}

function setDebugDialog(open) {
  const dialog = document.getElementById("debug-dialog");
  const button = document.getElementById("debug-toggle");
  if (!dialog || !button) return;
  if (open && !dialog.open) {
    dialog.showModal();
    document.getElementById("debug-expectation")?.focus();
  } else if (!open && dialog.open) {
    dialog.close();
    button.focus();
  }
  button.setAttribute("aria-expanded", dialog.open ? "true" : "false");
}

async function boot() {
  const token = ++loadToken;
  session.phase = "loading";
  session.exports = null;
  session.mime = "";
  updateDemo();
  updateLifetime();
  updateGrowth();
  updateDelay();
  updateThroughput();
  updateChoice();
  updateLottery();
  try {
    const loaded = await loadAdditionModule();
    if (token !== loadToken) {
      return;
    }
    session.phase = "ready";
    session.exports = loaded.exports;
    session.mime = loaded.mime;
  } catch (error) {
    if (token !== loadToken) {
      return;
    }
    session.phase = "failed";
    session.exports = null;
    session.message = error instanceof Error ? error.message : "load failed";
  }
  updateDemo();
  updateLifetime();
  updateGrowth();
  updateDelay();
  updateThroughput();
  updateChoice();
  updateLottery();
}

function simulateFailure() {
  loadToken += 1;
  session.phase = "failed";
  session.exports = null;
  session.message = "simulated";
  updateDemo();
  updateLifetime();
  updateGrowth();
  updateDelay();
  updateThroughput();
  updateChoice();
  updateLottery();
}

function bind() {
  document.getElementById("language").addEventListener("change", (event) => {
    state = setLanguage(state, event.target.value);
    refresh();
    document.getElementById("language").focus();
  });
  document.getElementById("sort").addEventListener("change", (event) => {
    state = setSort(state, event.target.value);
    renderResults();
    renderReading(routeFromHash());
  });
  document.getElementById("search").addEventListener("input", (event) => {
    state = setQuery(state, event.target.value);
    clearAddressHash();
    renderReading("");
    renderResults();
  });
  document.getElementById("filters").addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const category = input.dataset.filterCategory;
    const next = new Set(state.filters[category]);
    if (input.checked) {
      next.add(input.value);
    } else {
      next.delete(input.value);
    }
    state = { ...state, filters: { ...state.filters, [category]: next } };
    clearAddressHash();
    renderReading("");
    renderResults();
  });
  document.getElementById("clear-filters").addEventListener("click", () => {
    state = clearFilters(state);
    document.getElementById("search").value = "";
    document.getElementById("sort").value = "reading";
    for (const input of document.querySelectorAll("#filters input")) {
      input.checked = false;
    }
    clearAddressHash();
    renderReading("");
    renderResults();
  });
  document.getElementById("open-all").addEventListener("click", () => {
    state = openAll(state);
    renderResults();
    renderReading(routeFromHash());
  });
  document.getElementById("close-all").addEventListener("click", () => {
    state = closeAll(
      state,
      chapters.map((chapter) => chapter.id),
      entries.map((entry) => entry.id),
    );
    renderResults();
    renderReading(routeFromHash());
  });

  const results = document.getElementById("catalogue-results");
  results.addEventListener("click", (event) => {
    const cardButton = event.target.closest("[data-collapse-card]");
    if (cardButton) {
      const id = cardButton.dataset.collapseCard;
      const collapsed = new Set(state.collapsedCards);
      const opening = collapsed.has(id);
      if (opening) {
        collapsed.delete(id);
      } else {
        collapsed.add(id);
      }
      state = { ...state, collapsedCards: collapsed };
      const body = document.getElementById(`body-${domId(id)}`);
      if (body) {
        body.hidden = !opening;
      }
      cardButton.setAttribute("aria-expanded", opening ? "true" : "false");
      cardButton.textContent = opening ? "–" : "+";
      return;
    }
    const chapterButton = event.target.closest("[data-collapse-chapter]");
    if (chapterButton) {
      const id = chapterButton.dataset.collapseChapter;
      const collapsed = new Set(state.collapsedChapters);
      const opening = collapsed.has(id);
      if (opening) {
        collapsed.delete(id);
      } else {
        collapsed.add(id);
      }
      state = { ...state, collapsedChapters: collapsed };
      const body = chapterButton.closest("section")?.querySelector(".group-body");
      if (body) {
        body.hidden = !opening;
      }
      chapterButton.setAttribute("aria-expanded", opening ? "true" : "false");
      chapterButton.textContent = opening ? "–" : "+";
      return;
    }
  });
  const form = document.getElementById("addition-form");
  form.addEventListener("input", (event) => {
    if (event.target.id === "operand-left") {
      state = setDemoInput(state, "left", event.target.value);
      updateDemo();
    }
    if (event.target.id === "operand-right") {
      state = setDemoInput(state, "right", event.target.value);
      updateDemo();
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateDemo();
  });
  document.getElementById("reset-demo").addEventListener("click", () => {
    state = resetDemo(state);
    document.getElementById("operand-left").value = state.demo.left;
    document.getElementById("operand-right").value = state.demo.right;
    updateDemo();
  });
  document.getElementById("simulate-failure").addEventListener("click", () => {
    simulateFailure();
  });
  document.getElementById("retry-load").addEventListener("click", () => {
    boot();
  });
  document.getElementById("growth-form").addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement) || !field.dataset.growth) return;
    state = setGrowthInput(state, field.dataset.growth, field.value);
    updateGrowth();
    updateDelay();
  });
  document.getElementById("growth-form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateGrowth();
    updateDelay();
  });
  document.getElementById("growth-reset").addEventListener("click", () => {
    state = resetGrowth(state);
    document.getElementById("growth-initial").value = state.growth.initial;
    document.getElementById("growth-doubling").value = state.growth.doubling;
    document.getElementById("growth-elapsed").value = state.growth.elapsed;
    document.getElementById("growth-start-year").value = state.growth.startYear;
    document.getElementById("growth-target").value = state.growth.target;
    updateGrowth();
    updateDelay();
  });
  document.getElementById("growth-linear").addEventListener("click", () => {
    state = setGrowthInput(state, "scale", "linear");
    updateGrowth();
    updateDelay();
  });
  document.getElementById("delay-form").addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement) || !field.dataset.delay) return;
    state = setDelayInput(state, field.dataset.delay, field.value);
    updateDelay();
  });
  document.getElementById("delay-form").addEventListener("change", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement) || !field.dataset.delay) return;
    state = setDelayInput(state, field.dataset.delay, field.value);
    updateDelay();
  });
  document.getElementById("delay-form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateDelay();
  });
  document.getElementById("delay-reset").addEventListener("click", () => {
    state = resetDelay(state);
    document.getElementById("delay-distance").value = state.delay.distance;
    document.getElementById("delay-unit").value = state.delay.unit;
    updateDelay();
  });
  document.getElementById("delay-form").addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-preset]") : null;
    if (!(button instanceof HTMLButtonElement) || !session.exports) return;
    const preset = delayPreset(session, Number(button.dataset.preset));
    state = setDelayInput(state, "distance", formatCanonical(preset.distance));
    state = setDelayInput(state, "unit", String(preset.unit));
    document.getElementById("delay-distance").value = state.delay.distance;
    document.getElementById("delay-unit").value = state.delay.unit;
    updateDelay();
  });
  document.getElementById("growth-log").addEventListener("click", () => {
    if (document.getElementById("growth-log").disabled) return;
    state = setGrowthInput(state, "scale", "log");
    updateGrowth();
    updateDelay();
  });
  document.getElementById("lifetime-form").addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement) || !field.dataset.lifetime) {
      return;
    }
    const index = Number(field.dataset.index);
    state = setLifetimeInput(state, field.dataset.lifetime, index, field.value);
    if (field.dataset.lifetime !== "probabilities") {
      updateLifetime();
      return;
    }
    const parsed = interpretOperand(field.value);
    const acceptable = parsed.kind === "value"
      && Number.isFinite(parsed.value)
      && parsed.value >= 0
      && parsed.value <= 100;
    if (!acceptable || session.phase !== "ready" || !session.exports) {
      updateLifetime();
      return;
    }
    const outcome = callRebalance(session, state.lifetime.modelProbabilities, index + 1, parsed.value);
    if (outcome.status !== 0 || !outcome.probabilities) {
      updateLifetime();
      return;
    }
    const strings = state.lifetime.probabilities.slice();
    for (let other = 0; other < 4; other += 1) {
      if (other === index) {
        continue;
      }
      strings[other] = formatProbability(outcome.probabilities[other]);
      const input = document.getElementById(`prob-${other + 1}`);
      if (input && document.activeElement !== input) {
        input.value = strings[other];
      }
    }
    strings[index] = field.value;
    state = {
      ...state,
      lifetime: {
        ...state.lifetime,
        probabilities: strings,
        modelProbabilities: outcome.probabilities.slice(),
      },
    };
    updateLifetime();
  });
  document.getElementById("lifetime-form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateLifetime();
  });
  document.getElementById("lifetime-reset").addEventListener("click", () => {
    state = resetLifetime(state);
    for (let index = 0; index < 4; index += 1) {
      document.getElementById(`prob-${index + 1}`).value = state.lifetime.probabilities[index];
      document.getElementById(`years-${index + 1}`).value = state.lifetime.durations[index];
    }
    updateLifetime();
  });
  document.getElementById("lottery-form").addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement) || !field.dataset.lottery) return;
    state = setLotteryInput(state, field.dataset.lottery, field.value);
    state = setLotteryInput(state, "preset", "custom");
    updateLottery();
  });
  document.getElementById("lottery-form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateLottery();
  });
  document.getElementById("lottery-reset").addEventListener("click", () => {
    state = resetLottery(state);
    syncLotteryForm();
    updateLottery();
  });
  document.getElementById("lottery-form").addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-lottery-preset]") : null;
    if (!(button instanceof HTMLButtonElement)) return;
    const preset = LOTTERY_PRESETS[button.dataset.lotteryPreset];
    if (!preset) return;
    state = setLotteryInput(state, "tickets", preset.tickets);
    state = setLotteryInput(state, "prizes", preset.prizes);
    state = setLotteryInput(state, "bought", preset.bought);
    state = setLotteryInput(state, "preset", button.dataset.lotteryPreset);
    syncLotteryForm();
    updateLottery();
  });
  document.getElementById("choice-form").addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement) || !field.dataset.choice) return;
    state = setChoiceInput(state, field.dataset.choice, field.value);
    state = setChoiceInput(state, "preset", "custom");
    updateChoice();
  });
  document.getElementById("choice-form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateChoice();
  });
  document.getElementById("choice-reset").addEventListener("click", () => {
    state = resetChoice(state);
    syncChoiceForm();
    updateChoice();
  });
  document.getElementById("choice-form").addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-choice-preset]") : null;
    if (!(button instanceof HTMLButtonElement)) return;
    const preset = CHOICE_PRESETS[button.dataset.choicePreset];
    if (!preset) return;
    state = setChoiceInput(state, "possibilities", preset.possibilities);
    state = setChoiceInput(state, "repeats", preset.repeats);
    state = setChoiceInput(state, "preset", button.dataset.choicePreset);
    syncChoiceForm();
    updateChoice();
  });
  document.getElementById("throughput-form").addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement) || !field.dataset.throughput) return;
    state = setThroughputInput(state, field.dataset.throughput, field.value);
    if (field.dataset.throughput === "rate" || field.dataset.throughput === "rateUnit") {
      state = setThroughputInput(state, "bound", "0");
    }
    state = setThroughputInput(state, "preset", "custom");
    updateThroughput();
  });
  document.getElementById("throughput-form").addEventListener("change", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement) || !field.dataset.throughput) return;
    state = setThroughputInput(state, field.dataset.throughput, field.value);
    if (field.dataset.throughput === "rate" || field.dataset.throughput === "rateUnit") {
      state = setThroughputInput(state, "bound", "0");
    }
    state = setThroughputInput(state, "preset", "custom");
    updateThroughput();
  });
  document.getElementById("throughput-form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateThroughput();
  });
  document.getElementById("throughput-reset").addEventListener("click", () => {
    state = resetThroughput(state);
    syncThroughputForm();
    updateThroughput();
  });
  document.getElementById("throughput-linear").addEventListener("click", () => {
    state = setThroughputInput(state, "scale", "linear");
    updateThroughput();
  });
  document.getElementById("throughput-log").addEventListener("click", () => {
    state = setThroughputInput(state, "scale", "log");
    updateThroughput();
  });
  document.getElementById("throughput-form").addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-throughput-preset]") : null;
    if (!(button instanceof HTMLButtonElement) || !session.exports) return;
    const preset = throughputPreset(session, Number(button.dataset.throughputPreset));
    const presetName = { 1: "historical", 2: "human", 3: "bacterial", 4: "link" }[Number(button.dataset.throughputPreset)];
    if (presetName === "historical") {
      state = resetThroughput(state);
    } else {
      if (preset.setsQuantity) {
        state = setThroughputInput(state, "quantity", formatCanonical(preset.quantity));
        state = setThroughputInput(state, "quantityUnit", String(preset.quantityUnit));
      }
      if (preset.setsRate) {
        state = setThroughputInput(state, "rate", formatCanonical(preset.rate));
        state = setThroughputInput(state, "rateUnit", String(preset.rateUnit));
        state = setThroughputInput(state, "bound", String(preset.bound));
      }
      state = setThroughputInput(state, "preset", presetName);
    }
    syncThroughputForm();
    updateThroughput();
  });
  document.getElementById("chapter-list").addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("#show-all")) return;
    state = clearFilters(state);
    const search = document.getElementById("search");
    if (search) search.value = "";
    document.getElementById("sort").value = "reading";
    clearAddressHash();
    refresh();
    document.getElementById("show-all")?.focus();
  });
  document.querySelector(".skip")?.addEventListener("click", (event) => {
    const card = CALCULATOR_CARDS
      .map((item) => document.getElementById(item.cardId))
      .find((node) => node && !node.hidden);
    if (!card) return;
    event.preventDefault();
    card.tabIndex = -1;
    card.focus();
    card.scrollIntoView({ block: "nearest" });
  });
  const debugButton = document.getElementById("debug-toggle");
  const debugDialog = document.getElementById("debug-dialog");
  debugButton?.addEventListener("click", () => {
    setDebugDialog(!debugDialog.open);
  });
  document.getElementById("debug-cancel")?.addEventListener("click", () => {
    setDebugDialog(false);
  });
  document.getElementById("debug-save")?.addEventListener("click", () => {
    saveDebugReport();
  });
  debugDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    setDebugDialog(false);
  });
  debugDialog?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !debugDialog.open) return;
    const items = [...debugDialog.querySelectorAll("textarea, button")].filter((node) => !node.disabled);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "F9" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      if (event.repeat) return;
      event.preventDefault();
      setDebugDialog(!debugDialog?.open);
    }
  });
  window.addEventListener("hashchange", () => {
    showRoute(routeFromHash(), { focus: true });
  });
  window.addEventListener("popstate", () => {
    showRoute(routeFromHash(), { focus: false });
  });
}

function refresh() {
  applyI18n();
  renderChapterNav();
  renderFilters();
  renderResults();
  renderReading(routeFromHash());
  document.getElementById("language").value = state.lang;
  document.getElementById("sort").value = state.sort;
  document.getElementById("search").value = state.query;
}

function main() {
  bind();
  refresh();
  if (location.hash) {
    showRoute(routeFromHash(), { focus: false });
  }
  boot();
}

main();
