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
  entryVisible,
  groupEntries,
  neighbors,
  visibleEntries,
} from "./catalogue.js";
import { t } from "./messages.js";
import { creditHref, displayName, isUnlinked, parseScientists, scientistsForChapter } from "./scientists.js";
import { starHref, tcStars } from "./tc-stars.js";
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
  resetResearch,
  resetThroughput,
  setChoiceInput,
  setLotteryInput,
  setResearchInput,
  setDelayInput,
  setDemoInput,
  setGrowthInput,
  setThroughputInput,
  setLanguage,
  setLifetimeInput,
  setQuery,
  setSort,
} from "./state.js";
import { callAddition, callChoice, callColony, callDelay, callEggs, callEnergy, callExplore, callGalaxy, callHear, callLottery, callResearch, callSixes, callSixesRoll, callSixesUntil, callSpectrum, callThroughput, delayPreset, callLifetime, callRebalance, callTarget, createSession, loadAdditionModule, throughputPreset } from "./wasm-loader.js";

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

const LINE_KEYS = [
  "spectrum.line.caK",
  "spectrum.line.caH",
  "spectrum.line.hd",
  "spectrum.line.caI",
  "spectrum.line.hg",
  "spectrum.line.tc",
  "spectrum.line.tc",
  "spectrum.line.tc",
  "spectrum.line.tc",
];

const CALCULATOR_CARDS = [
  { cardId: "lifetime-card", sectionId: "cosmic-civilisations/statistics-of-cosmic-civilisations" },
  { cardId: "energy-card", sectionId: "cosmic-civilisations/formulating-the-method" },
  { cardId: "hear-card", sectionId: "cosmic-civilisations/formulating-the-method" },
  { cardId: "galaxy-card", sectionId: "cosmic-civilisations/statistics-of-cosmic-civilisations" },
  { cardId: "colony-card", sectionId: "cosmic-civilisations/cosmic-catastrophism" },
  { cardId: "spectrum-card", sectionId: "cosmic-civilisations/a-metatheory-of-miracles" },
  { cardId: "sixes-card", sectionId: "cosmic-civilisations/human-uniqueness" },
  { cardId: "growth-card", sectionId: "intellectronics/return-to-earth" },
  { cardId: "lottery-card", sectionId: "intellectronics/return-to-earth" },
  { cardId: "research-card", sectionId: "intellectronics/the-megabit-bomb" },
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
  if (entry.id === "cosmic-civilisations/cosmic-catastrophism") {
    body.append(h("p", {}, [h("a", { href: "#colony-card", dataset: { i18n: "colony.open" } })]));
  }
  if (entry.id === "intellectronics/the-megabit-bomb") {
    body.append(h("p", {}, [h("a", { href: "#research-card", dataset: { i18n: "research.open" } })]));
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
  document.getElementById("working-count").textContent = String(
    CALCULATOR_CARDS.filter((item) => item.cardId !== "spectrum-card").length,
  );

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
    updateResearch();
    renderSelectedCredits();
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
    if (group.kind === "chapter") {
      const credits = creditBlock(group.key);
      if (credits) body.append(credits);
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
  updateResearch();
  renderSelectedCredits();
  applyVisibility();
}

let scientistRows = [];

function creditBlock(chapterId) {
  const rows = scientistsForChapter(scientistRows, chapterId);
  if (rows.length === 0) return null;
  const list = h("ul", { class: "credit-list" });
  for (const row of rows) {
    const name = displayName(row);
    const sentence = h("span", { text: t(state.lang, "credits.line").replace("{name}", name) });
    const children = [sentence];
    if (row.category === "eponym") {
      children.push(h("span", { class: "credit-tag", text: t(state.lang, "credits.tag.eponym") }));
    } else if (row.category === "borderline") {
      children.push(h("span", { class: "credit-tag", text: t(state.lang, "credits.tag.borderline") }));
    }
    const link = creditHref(row, state.lang);
    if (link) {
      children.push(h("a", {
        href: link.href,
        target: "_blank",
        rel: "noopener",
        text: t(state.lang, link.kind === "ru" ? "credits.wikiRussian" : "credits.wiki"),
      }));
    } else if (isUnlinked(row)) {
      children.push(h("span", { class: "credit-tag", text: t(state.lang, "credits.unlinked") }));
    }
    list.append(h("li", {}, children));
  }
  return h("section", { class: "chapter-credits", dataset: { chapterCredits: chapterId } }, [
    h("h3", { text: t(state.lang, "credits.heading") }),
    list,
  ]);
}

function renderSelectedCredits() {
  const host = document.getElementById("chapter-credits");
  if (!host) return;
  const route = contentRoute();
  const chapterId = !route ? "" : chapterById(route) ? route : entries.find((item) => item.id === route)?.chapterId || "";
  const block = chapterId ? creditBlock(chapterId) : null;
  host.hidden = !block;
  host.replaceChildren(...(block ? [...block.childNodes] : []));
  if (block) host.dataset.chapterCredits = chapterId;
  else delete host.dataset.chapterCredits;
}

async function loadScientists() {
  try {
    const response = await fetch("data/scientists.tsv");
    if (!response.ok) throw new Error(String(response.status));
    scientistRows = parseScientists(await response.text());
  } catch (error) {
    scientistRows = [];
    console.error(error);
  }
  renderResults();
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

const LOTTERY_SLIDER_CAP = 1_000_000;

function lotteryInteger(text) {
  if (!/^\d+$/.test(String(text).trim())) return null;
  const value = Number(text);
  return Number.isSafeInteger(value) ? value : null;
}

function lotterySliderMax(field) {
  if (field === "tickets") return LOTTERY_SLIDER_CAP;
  const tickets = lotteryInteger(state.lottery.tickets);
  return Math.max(1, Math.min(LOTTERY_SLIDER_CAP, tickets ?? 1));
}

function logSliderPosition(value, max) {
  const cap = Math.max(1, max);
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 1 || cap <= 1) return 0;
  if (count >= cap) return 1000;
  return Math.round((1000 * Math.log10(count)) / Math.log10(cap));
}

function valueFromLogSlider(position, max) {
  const cap = Math.max(1, max);
  if (cap <= 1) return 1;
  const phase = Math.min(1, Math.max(0, Number(position) / 1000));
  return Math.max(1, Math.min(cap, Math.round(10 ** (phase * Math.log10(cap)))));
}

let lotteryCapped = false;

function enforceLotteryLimits() {
  const tickets = lotteryInteger(state.lottery.tickets);
  if (tickets == null) {
    lotteryCapped = false;
    return;
  }
  let capped = false;
  for (const field of ["prizes", "bought"]) {
    const value = lotteryInteger(state.lottery[field]);
    if (value != null && value > tickets) {
      state = setLotteryInput(state, field, String(tickets));
      capped = true;
    }
  }
  lotteryCapped = capped;
}

function syncLotteryForm() {
  const fields = [
    ["tickets", "lottery-m", "lottery-m-slider"],
    ["prizes", "lottery-w", "lottery-w-slider"],
    ["bought", "lottery-k", "lottery-k-slider"],
  ];
  for (const [field, textId, sliderId] of fields) {
    const text = document.getElementById(textId);
    const slider = document.getElementById(sliderId);
    if (text && text.value !== state.lottery[field]) text.value = state.lottery[field];
    if (slider) {
      slider.value = String(logSliderPosition(state.lottery[field], lotterySliderMax(field)));
      slider.setAttribute("aria-valuetext", state.lottery[field]);
    }
  }
}

function updateLottery() {
  const statusNode = document.getElementById("lottery-status");
  if (!statusNode) return;
  enforceLotteryLimits();
  syncLotteryForm();
  const capNote = document.getElementById("lottery-cap-note");
  if (capNote) capNote.textContent = lotteryCapped ? t(state.lang, "lottery.capNote") : "";
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

const RESEARCH_PRESETS = {
  book: { discoveries0: "1", researchers0: "1", discoveryDoubling: "30", researcherDoubling: "10", elapsed: "30" },
  pace: { discoveries0: "1", researchers0: "1", discoveryDoubling: "30", researcherDoubling: "30", elapsed: "30" },
};

function researchSummary(outcome) {
  const values = {
    years: formatReadable(Number(state.research.elapsed), state.lang),
    discoveries: formatReadable(outcome.discoveries, state.lang),
    researchers: formatReadable(outcome.researchers, state.lang),
    ratio: formatReadable(outcome.ratio, state.lang),
  };
  const key = state.research.preset === "book"
    ? "research.summary.book"
    : state.research.preset === "pace"
      ? "research.summary.pace"
      : "research.summary.custom";
  return t(state.lang, key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function researchMessage(code) {
  if (code === "loading") return "demo.loading";
  if (code === "load-failed") return "demo.loadFailed";
  if (code === "empty") return "demo.empty";
  if (code === "malformed") return "demo.malformed";
  if (code === 0) return "research.ok";
  if (code === 1) return "demo.nonFinite";
  if (code === 2) return "research.notPositive";
  if (code === 3) return "research.badYears";
  if (code === 4) return "research.badDoubling";
  if (code === 5) return "research.overflow";
  return "demo.loadFailed";
}

function clearResearchView() {
  for (const id of ["research-discoveries", "research-researchers", "research-ratio", "research-note", "research-exact-discoveries", "research-exact-researchers", "research-exact-ratio"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = "";
  }
  for (const id of ["research-index-plot", "research-ratio-plot", "research-index-legend", "research-ratio-legend", "research-index-x-ticks", "research-ratio-x-ticks", "research-index-y-ticks", "research-ratio-y-ticks"]) {
    document.getElementById(id)?.replaceChildren();
  }
}

function researchLine(plot, className, points) {
  const line = document.createElementNS(SVG_NS, "polyline");
  line.setAttribute("class", className);
  line.setAttribute("fill", "none");
  line.setAttribute("points", points.join(" "));
  plot.append(line);
}

function researchMark(plot, x, y) {
  const mark = document.createElementNS(SVG_NS, "circle");
  mark.setAttribute("class", "research-mark");
  mark.setAttribute("cx", String(x));
  mark.setAttribute("cy", String(y));
  mark.setAttribute("r", "1.8");
  plot.append(mark);
}

function renderResearch(outcome) {
  document.getElementById("research-discoveries").textContent = formatReadable(outcome.discoveries, state.lang);
  document.getElementById("research-researchers").textContent = formatReadable(outcome.researchers, state.lang);
  document.getElementById("research-ratio").textContent = formatReadable(outcome.ratio, state.lang);
  document.getElementById("research-exact-discoveries").textContent = formatCanonical(outcome.discoveries);
  document.getElementById("research-exact-researchers").textContent = formatCanonical(outcome.researchers);
  document.getElementById("research-exact-ratio").textContent = formatCanonical(outcome.ratio);
  const note = document.getElementById("research-note");
  if (note) note.textContent = researchSummary(outcome);
  for (const name of ["book", "pace"]) {
    document.getElementById(`research-preset-${name}`)?.setAttribute("aria-pressed", state.research.preset === name ? "true" : "false");
  }
  const indexPlot = document.getElementById("research-index-plot");
  const ratioPlot = document.getElementById("research-ratio-plot");
  if (!indexPlot || !ratioPlot || !outcome.samples.length) return;
  const xOf = (value) => (outcome.xMax === 0 ? 0 : (value / outcome.xMax) * 100);
  const yOfIndex = (value) => (outcome.indexMax === 0 ? 100 : 100 - (value / outcome.indexMax) * 100);
  const yOfRatio = (value) => (outcome.ratioMax === 0 ? 100 : 100 - (value / outcome.ratioMax) * 100);
  researchLine(indexPlot, "series-discoveries", outcome.samples.map((sample) => `${xOf(sample.time)},${yOfIndex(sample.discoveries)}`));
  researchLine(indexPlot, "series-researchers", outcome.samples.map((sample) => `${xOf(sample.time)},${yOfIndex(sample.researchers)}`));
  researchLine(ratioPlot, "series-ratio", outcome.samples.map((sample) => `${xOf(sample.time)},${yOfRatio(sample.ratio)}`));
  const end = outcome.samples[outcome.samples.length - 1];
  researchMark(indexPlot, xOf(end.time), yOfIndex(outcome.discoveries));
  researchMark(indexPlot, xOf(end.time), yOfIndex(outcome.researchers));
  researchMark(ratioPlot, xOf(end.time), yOfRatio(outcome.ratio));
  const indexLegend = document.getElementById("research-index-legend");
  const ratioLegend = document.getElementById("research-ratio-legend");
  indexLegend?.append(legendEntry("series-discoveries", t(state.lang, "research.seriesDiscoveries"), { role: "series" }));
  indexLegend?.append(legendEntry("series-researchers", t(state.lang, "research.seriesResearchers"), { role: "series" }));
  indexLegend?.append(legendEntry("", t(state.lang, "research.marker"), { role: "marker", mark: true, markClass: "research-mark" }));
  ratioLegend?.append(legendEntry("series-ratio", t(state.lang, "research.seriesRatio"), { role: "series" }));
  ratioLegend?.append(legendEntry("", t(state.lang, "research.marker"), { role: "marker", mark: true, markClass: "research-mark" }));
  const place = (host, values, yOf) => {
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
  const xValues = [0, outcome.xMax].filter((value, index, all) => all.indexOf(value) === index);
  place(document.getElementById("research-index-x-ticks"), xValues);
  place(document.getElementById("research-ratio-x-ticks"), xValues);
  const indexTicks = [outcome.indexMax, outcome.discoveries, outcome.researchers, 0]
    .filter((value, index, all) => all.indexOf(value) === index);
  place(document.getElementById("research-index-y-ticks"), indexTicks, yOfIndex);
  const ratioTicks = [outcome.ratioMax, outcome.ratio, 0]
    .filter((value, index, all) => all.indexOf(value) === index);
  place(document.getElementById("research-ratio-y-ticks"), ratioTicks, yOfRatio);
}

function syncResearchForm() {
  document.getElementById("research-d0").value = state.research.discoveries0;
  document.getElementById("research-r0").value = state.research.researchers0;
  document.getElementById("research-dd").value = state.research.discoveryDoubling;
  document.getElementById("research-rd").value = state.research.researcherDoubling;
  document.getElementById("research-t").value = state.research.elapsed;
}

function updateResearch() {
  const statusNode = document.getElementById("research-status");
  if (!statusNode) return;
  clearResearchView();
  let code = "loading";
  if (session.phase === "loading") {
    code = "loading";
  } else if (session.phase !== "ready" || !session.exports) {
    code = "load-failed";
  } else {
    const fields = ["discoveries0", "researchers0", "discoveryDoubling", "researcherDoubling", "elapsed"];
    const parsed = fields.map((field) => interpretOperand(state.research[field]));
    if (parsed.some((item) => item.kind === "empty")) code = "empty";
    else if (parsed.some((item) => item.kind !== "value")) code = "malformed";
    else {
      const outcome = callResearch(session, ...parsed.map((item) => item.value));
      code = outcome.status;
      if (outcome.status === 0) {
        try {
          renderResearch(outcome);
        } catch (error) {
          clearResearchView();
          code = "load-failed";
          console.error(error);
        }
      }
    }
  }
  statusNode.dataset.status = String(code);
  statusNode.textContent = t(state.lang, researchMessage(code));
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
    "Energy",
    `Years: ${energy.report ? formatCanonical(energy.report.years) : "(not ready)"}`,
    `Stated factor: ${energy.report ? formatCanonical(energy.report.stated) : "(not ready)"}`,
    `Third factor: ${energy.report ? formatCanonical(energy.report.third) : "(not ready)"}`,
    `Rate: ${energy.report ? formatCanonical(energy.report.rate) : "(not ready)"}`,
    `Energy erg/s: ${energy.report ? formatCanonical(energy.report.energy) : "(not ready)"}`,
    `Sun share: ${energy.report ? formatCanonical(energy.report.share) : "(not ready)"}`,
    `Play: ${energy.report ? energy.report.play : "(not ready)"}`,
    `Calm: ${energy.report ? energy.report.calm : "(not ready)"}`,
    `Stage: ${energy.report ? energy.report.stage : "(not ready)"}`,
    "",
    "Hear them",
    `Distance ly: ${hear.report ? formatCanonical(hear.report.distance) : "(not ready)"}`,
    `Power factor: ${hear.report ? formatCanonical(hear.report.power) : "(not ready)"}`,
    `Volume: ${hear.report ? formatCanonical(hear.report.gain) : "(not ready)"}`,
    `Muted: ${hear.report ? hear.report.muted : "(not ready)"}`,
    `Letter: ${hear.report ? hear.report.letter : "(not ready)"}`,
    `Distance set: ${hear.report ? hear.report.source : "(not ready)"}`,
    `Letter distance: ${hear.report ? formatCanonical(hear.report.letterDistance) : "(not ready)"}`,
    "",
    "Stubborn thousand",
    `Escapers: ${colony.report ? formatCanonical(colony.report.escapers) : "(not ready)"}`,
    `Lifetime years: ${colony.report ? formatCanonical(colony.report.years) : "(not ready)"}`,
    `Alive now: ${colony.report ? formatCanonical(colony.report.alive) : "(not ready)"}`,
    `Nearest ly: ${colony.report?.distance == null ? "(none)" : formatCanonical(colony.report.distance)}`,
    `Self deaths: ${colony.report ? formatCanonical(colony.report.self) : "(not ready)"}`,
    `Other deaths: ${colony.report ? formatCanonical(colony.report.other) : "(not ready)"}`,
    `Faded later: ${colony.report ? formatCanonical(colony.report.faded) : "(not ready)"}`,
    `Shown: ${colony.report ? colony.report.shown : "(not ready)"}`,
    `Chance one in: ${colony.report?.oneIn ? formatCanonical(colony.report.oneIn) : "(count)"}`,
    `Step: ${colony.report ? String(colony.report.step) : "(not ready)"}`,
    `Highlighted group: ${colony.report?.group ? colony.report.group : "(none)"}`,
    `Play: ${colony.report ? colony.report.play : "(not ready)"}`,
    `Calm: ${colony.report ? colony.report.calm : "(not ready)"}`,
    "",
    "Spreading colony",
    `Hop ly: ${colony.report ? formatCanonical(colony.report.hopLy) : "(not ready)"}`,
    `Hop years: ${colony.report ? formatCanonical(colony.report.hopYears) : "(not ready)"}`,
    `Hops: ${colony.report ? formatCanonical(colony.report.hops) : "(not ready)"}`,
    `Fill years: ${colony.report ? formatCanonical(colony.report.fillYears) : "(not ready)"}`,
    `Times over: ${colony.report ? formatCanonical(colony.report.times) : "(not ready)"}`,
    `Origin: ${colony.report ? String(colony.report.origin) : "(not ready)"}`,
    `Status: ${colony.report ? String(colony.report.status) : "(not ready)"}`,
    "",
    "Galaxy",
    `Lifetime years: ${galaxy.report ? formatCanonical(galaxy.report.years) : "(not ready)"}`,
    `Count: ${galaxy.report ? formatCanonical(galaxy.report.count) : "(not ready)"}`,
    `Nearest distance: ${galaxy.report?.distance == null ? "(none)" : formatCanonical(galaxy.report.distance)}`,
    `Drawn dots: ${galaxy.report ? String(galaxy.report.drawn) : "(not ready)"}`,
    `Play: ${galaxy.report ? galaxy.report.play : "(not ready)"}`,
    `Speed: ${galaxy.report ? galaxy.report.speed : "(not ready)"}`,
    `Calm: ${galaxy.report ? galaxy.report.calm : "(not ready)"}`,
    "",
    "Ten sixes",
    `Players: ${sixes.report ? formatCanonical(sixes.report.players) : "(not ready)"}`,
    `Chance: ${sixes.report ? formatCanonical(sixes.report.chance) : "(not ready)"}`,
    `Roll: ${sixes.report ? String(sixes.report.setIndex) : "(not ready)"}`,
    `Faces: ${sixes.report ? sixes.report.faces.join(" ") : "(not ready)"}`,
    `Sixes: ${sixes.report ? String(sixes.report.sixes) : "(not ready)"}`,
    `Eggs: ${sixes.report ? formatCanonical(sixes.report.eggs) : "(not ready)"}`,
    `Expected fish: ${sixes.report ? formatCanonical(sixes.report.expected) : "(not ready)"}`,
    `Egg chance: ${sixes.report ? formatCanonical(sixes.report.eggChance) : "(not ready)"}`,
    `Expected winners: ${sixes.report ? formatCanonical(sixes.report.winners) : "(not ready)"}`,
    `Ladder: ${sixes.report ? sixes.report.ladder : "(not ready)"}`,
    `Until: ${sixes.report?.until == null ? "(not drawn)" : formatCanonical(sixes.report.until)}`,
    `Play: ${sixes.report ? sixes.report.play : "(not ready)"}`,
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
    "Researchers and discoveries",
    `Discovery start: ${valueOf("research-d0")}`,
    `Researcher start: ${valueOf("research-r0")}`,
    `Discovery doubling: ${valueOf("research-dd")}`,
    `Researcher doubling: ${valueOf("research-rd")}`,
    `Years: ${valueOf("research-t")}`,
    `Preset: ${state.research.preset}`,
    `Discovery index: ${textOf("research-discoveries")}`,
    `Researcher index: ${textOf("research-researchers")}`,
    `Ratio: ${textOf("research-ratio")}`,
    `Status: ${textOf("research-status")}`,
    "",
    "Lottery",
    `Tickets: ${valueOf("lottery-m")}`,
    `Prizes: ${valueOf("lottery-w")}`,
    `Bought: ${valueOf("lottery-k")}`,
    `Tickets slider: ${valueOf("lottery-m-slider")}`,
    `Prizes slider: ${valueOf("lottery-w-slider")}`,
    `Bought slider: ${valueOf("lottery-k-slider")}`,
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
  updateResearch();
  renderSpectrum();
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
  updateResearch();
  renderSpectrum();
  bootGalaxy();
  bootColony();
  bootEnergy();
  bootHear();
  bootSixes();
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
  updateResearch();
  renderSpectrum();
  stopGalaxyDemo();
  renderGalaxy();
  stopSixesPlay();
  renderSixes();
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
  document.getElementById("research-form").addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement) || !field.dataset.research) return;
    state = setResearchInput(state, field.dataset.research, field.value);
    state = setResearchInput(state, "preset", "custom");
    updateResearch();
  });
  document.getElementById("research-form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateResearch();
  });
  document.getElementById("research-reset").addEventListener("click", () => {
    state = resetResearch(state);
    syncResearchForm();
    updateResearch();
  });
  document.getElementById("research-form").addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-research-preset]") : null;
    if (!(button instanceof HTMLButtonElement)) return;
    const preset = RESEARCH_PRESETS[button.dataset.researchPreset];
    if (!preset) return;
    for (const [field, value] of Object.entries(preset)) {
      state = setResearchInput(state, field, value);
    }
    state = setResearchInput(state, "preset", button.dataset.researchPreset);
    syncResearchForm();
    updateResearch();
  });
  document.getElementById("lottery-form").addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement)) return;
    if (field.dataset.lotterySlider) {
      const which = field.dataset.lotterySlider;
      const value = valueFromLogSlider(field.value, lotterySliderMax(which));
      state = setLotteryInput(state, which, String(value));
      state = setLotteryInput(state, "preset", "custom");
      updateLottery();
      return;
    }
    if (!field.dataset.lottery) return;
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
  document.getElementById("galaxy-life")?.addEventListener("input", () => {
    if (galaxySettingSlider || !session.exports) return;
    stopGalaxyDemo();
    galaxy.phase = Number(document.getElementById("galaxy-life").value) / 1000;
    galaxy.years = session.exports.ath_galaxy_years_of(galaxy.phase);
    renderGalaxy();
  });
  document.getElementById("galaxy-pins")?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-galaxy-pin]") : null;
    if (!(button instanceof HTMLButtonElement) || !session.exports) return;
    stopGalaxyDemo();
    galaxy.years = Number(button.dataset.galaxyYears);
    renderGalaxy();
  });
  document.getElementById("galaxy-play")?.addEventListener("click", () => {
    if (!session.exports) return;
    if (galaxy.playing) {
      stopGalaxyDemo();
      renderGalaxy();
    } else {
      startGalaxyDemo();
    }
  });
  document.getElementById("galaxy-restart")?.addEventListener("click", () => {
    if (!session.exports) return;
    galaxy.phase = 0;
    galaxy.years = session.exports.ath_galaxy_years_of(0);
    if (galaxy.playing) {
      galaxy.stamp = performance.now();
      renderGalaxy();
    } else {
      stopGalaxyDemo();
      renderGalaxy();
    }
  });
  document.getElementById("galaxy-card")?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-galaxy-speed]") : null;
    if (!(button instanceof HTMLButtonElement)) return;
    const speed = button.dataset.galaxySpeed;
    if (!GALAXY_SPEEDS[speed]) return;
    galaxy.speed = speed;
    if (galaxy.playing) {
      galaxy.stamp = performance.now() - galaxy.phase * GALAXY_SPEEDS[speed] * 1000;
    }
    renderGalaxy();
  });
  document.getElementById("galaxy-calm")?.addEventListener("click", () => {
    galaxy.calm = !galaxy.calm;
    document.getElementById("galaxy-calm")?.setAttribute("aria-pressed", galaxy.calm ? "true" : "false");
    if (galaxy.calm) {
      holdGalaxyAtBook();
    } else {
      renderGalaxy();
    }
  });
  document.getElementById("galaxy-reset")?.addEventListener("click", () => {
    galaxy.modern = false;
    const modern = document.getElementById("galaxy-modern");
    if (modern) modern.checked = false;
    holdGalaxyAtBook();
  });
  document.getElementById("galaxy-modern")?.addEventListener("change", (event) => {
    galaxy.modern = event.target instanceof HTMLInputElement && event.target.checked;
    renderGalaxy();
  });
  document.getElementById("colony-life")?.addEventListener("input", () => {
    if (!session.exports || colonySetting) return;
    colony.years = session.exports.ath_colony_life_of(Number(document.getElementById("colony-life").value) / 1000);
    renderColony();
  });
  document.getElementById("colony-hop")?.addEventListener("input", () => {
    if (!session.exports || colonySetting) return;
    colony.hopLy = session.exports.ath_colony_hop_of(Number(document.getElementById("colony-hop").value) / 1000);
    renderColony();
  });
  document.getElementById("colony-time")?.addEventListener("input", () => {
    if (!session.exports || colonySetting) return;
    colony.hopYears = session.exports.ath_colony_time_of(Number(document.getElementById("colony-time").value) / 1000);
    const exact = document.getElementById("colony-time-exact");
    if (exact && document.activeElement !== exact) exact.value = String(Math.round(colony.hopYears));
    renderColony();
  });
  document.getElementById("colony-time-exact")?.addEventListener("input", () => {
    const raw = document.getElementById("colony-time-exact").value.trim();
    colony.hopYears = raw === "" ? Number.NaN : Number(raw);
    renderColony();
  });
  document.getElementById("colony-choices")?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-colony-choice]") : null;
    if (!(button instanceof HTMLButtonElement)) return;
    colony.choice = Number(button.dataset.colonyChoice);
    renderColony();
  });
  document.getElementById("colony-sieve")?.addEventListener("click", () => {
    advanceColonyStep();
  });
  document.getElementById("colony-sieve")?.addEventListener("keydown", (event) => {
    if (event.target !== document.getElementById("colony-sieve")) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    advanceColonyStep();
  });
  document.getElementById("colony-counts")?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-colony-fate]") : null;
    if (!(button instanceof HTMLButtonElement)) return;
    colony.step = Number(button.dataset.colonyFate) + 1;
    colony.group = colony.step - 1;
    renderColony();
  });
  document.getElementById("colony-play")?.addEventListener("click", () => {
    if (!session.exports) return;
    if (colony.playing) {
      stopColonyPlay();
      renderColony();
      return;
    }
    if (colony.calm) {
      colony.calm = false;
      document.getElementById("colony-calm")?.setAttribute("aria-pressed", "false");
    }
    startColonyPlay();
  });
  document.getElementById("colony-restart")?.addEventListener("click", () => {
    colony.sieve = 0;
    colony.generation = 0;
    if (colony.playing) colony.stamp = performance.now();
    renderColony();
  });
  document.getElementById("colony-calm")?.addEventListener("click", () => {
    colony.calm = !colony.calm;
    document.getElementById("colony-calm")?.setAttribute("aria-pressed", colony.calm ? "true" : "false");
    if (colony.calm) stopColonyPlay();
    renderColony();
  });
  document.getElementById("colony-sky")?.addEventListener("click", (event) => {
    const star = event.target instanceof Element ? event.target.closest("[data-star]") : null;
    if (!star) return;
    chooseColonyStar(Number(star.dataset.star));
  });
  document.getElementById("colony-sky")?.addEventListener("keydown", (event) => {
    const star = event.target instanceof Element ? event.target.closest("[data-star]") : null;
    if (!star || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    chooseColonyStar(Number(star.dataset.star));
  });
  document.getElementById("sixes-roll")?.addEventListener("click", () => {
    if (!session.exports) return;
    stopSixesPlay();
    rollSixes(sixes.setIndex + 1);
    renderSixes();
  });
  document.getElementById("sixes-play")?.addEventListener("click", () => {
    if (!session.exports) return;
    if (sixes.playing) {
      stopSixesPlay();
      renderSixes();
    } else {
      startSixesPlay();
    }
  });
  document.getElementById("sixes-restart")?.addEventListener("click", () => {
    if (!session.exports) return;
    rollSixes(1);
    if (sixes.playing) startSixesPlay();
    else renderSixes();
  });
  document.getElementById("sixes-players")?.addEventListener("input", () => {
    if (!session.exports) return;
    stopSixesPlay();
    const phase = Number(document.getElementById("sixes-players").value) / 1000;
    sixes.players = session.exports.ath_sixes_players_of(phase);
    sixes.ladder = "slider";
    renderSixes();
  });
  document.getElementById("sixes-egg-slider")?.addEventListener("input", () => {
    if (!session.exports) return;
    const phase = Number(document.getElementById("sixes-egg-slider").value) / 1000;
    sixes.eggs = session.exports.ath_sixes_eggs_of(phase);
    renderSixes();
  });
  document.getElementById("sixes-tab-dice")?.addEventListener("click", () => {
    sixes.tab = "dice";
    document.getElementById("sixes-dice").hidden = false;
    document.getElementById("sixes-eggs").hidden = true;
    document.getElementById("sixes-tab-dice").setAttribute("aria-selected", "true");
    document.getElementById("sixes-tab-eggs").setAttribute("aria-selected", "false");
    renderSixes();
  });
  document.getElementById("sixes-tab-eggs")?.addEventListener("click", () => {
    sixes.tab = "eggs";
    document.getElementById("sixes-dice").hidden = true;
    document.getElementById("sixes-eggs").hidden = false;
    document.getElementById("sixes-tab-dice").setAttribute("aria-selected", "false");
    document.getElementById("sixes-tab-eggs").setAttribute("aria-selected", "true");
    renderSixes();
  });
  document.getElementById("sixes-ladder")?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-sixes-ladder]") : null;
    if (!(button instanceof HTMLButtonElement) || !session.exports) return;
    stopSixesPlay();
    sixes.players = Number(button.dataset.sixesLadder);
    sixes.ladder = button.dataset.sixesLadder;
    renderSixes();
  });
  document.getElementById("sixes-until")?.addEventListener("click", () => {
    if (!session.exports) return;
    sixes.untilDraw += 1;
    showUntil(callSixesUntil(session, sixes.untilDraw), true);
    renderSixes();
  });
  document.getElementById("sixes-card")?.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.type === "text") return;
    if (event.key === " " && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      if (sixes.playing) {
        stopSixesPlay();
        renderSixes();
      } else {
        startSixesPlay();
      }
    } else if (event.key === "r" || event.key === "R") {
      if (event.target instanceof HTMLInputElement) return;
      rollSixes(1);
      if (sixes.playing) startSixesPlay();
      else renderSixes();
    }
  });
  document.getElementById("energy-years")?.addEventListener("input", () => {
    if (!session.exports) return;
    stopEnergyPlay();
    energy.years = Number(document.getElementById("energy-years").value);
    renderEnergy();
  });
  document.getElementById("energy-play")?.addEventListener("click", () => {
    if (energy.playing) stopEnergyPlay();
    else startEnergyPlay();
    renderEnergy();
  });
  document.getElementById("energy-calm")?.addEventListener("click", () => {
    energy.calm = !energy.calm;
    document.getElementById("energy-calm")?.setAttribute("aria-pressed", energy.calm ? "true" : "false");
    if (energy.calm) stopEnergyPlay();
    renderEnergy();
  });
  document.getElementById("hear-distance")?.addEventListener("input", () => {
    if (!session.exports || hear.setting) return;
    const phase = Number(document.getElementById("hear-distance").value) / 1000;
    hear.distance = session.exports.ath_hear_distance_of(phase);
    hear.source = "slider";
    renderHear();
  });
  document.getElementById("hear-chart")?.addEventListener("pointerdown", (event) => {
    if (!session.exports || (event.button != null && event.button !== 0)) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    hear.dragging = true;
    hear.source = "drag";
    setHearFromPointer(event);
  });
  document.getElementById("hear-chart")?.addEventListener("pointermove", (event) => {
    if (!hear.dragging) return;
    setHearFromPointer(event);
  });
  document.getElementById("hear-chart")?.addEventListener("pointerup", () => {
    hear.dragging = false;
  });
  document.getElementById("hear-chart")?.addEventListener("pointercancel", () => {
    hear.dragging = false;
  });
  document.getElementById("hear-chart")?.addEventListener("keydown", (event) => {
    if (!session.exports) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const factor = event.key === "ArrowRight" ? 10 : 0.1;
    const min = session.exports.ath_hear_min();
    const max = session.exports.ath_hear_max();
    hear.distance = Math.min(max, Math.max(min, hear.distance * factor));
    hear.source = "key";
    renderHear();
  });
  document.getElementById("hear-letter-lem")?.addEventListener("click", () => {
    if (!session.exports) return;
    hear.distance = session.exports.ath_hear_far();
    hear.source = "preset";
    renderHear();
  });
  document.getElementById("hear-sound")?.addEventListener("click", () => {
    toggleHearSound();
  });
  document.getElementById("hear-send")?.addEventListener("click", () => {
    sendLetter();
  });
  document.getElementById("hear-calm")?.addEventListener("click", () => {
    hear.calm = !hear.calm;
    document.getElementById("hear-calm")?.setAttribute("aria-pressed", hear.calm ? "true" : "false");
    if (hear.calm) {
      hear.muted = true;
      stopHearSound();
      stopLetter();
      if (hear.letter > 0) hear.letter = 1;
    }
    renderHear();
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

function formatNm(value, lang) {
  const text = Number(value).toFixed(3);
  return lang === "en-GB" ? text : text.replace(".", ",");
}

function svgEl(tag, attrs, children = []) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") {
      node.textContent = value ?? "";
    } else {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    if (child) node.append(child);
  }
  return node;
}

function spectrumStrip(lines, label, gradientId) {
  const width = 640;
  const height = 78;
  const left = 28;
  const span = 584;
  const marks = lines.map((line) => {
    const x = left + line.position * span;
    const technetium = line.kind === 1;
    return svgEl("g", { class: technetium ? "line tc" : "line" }, [
      svgEl("line", {
        x1: x,
        x2: x,
        y1: technetium ? 8 : 16,
        y2: 70,
        stroke: technetium ? "#f0b429" : "#d7e7ff",
        "stroke-width": technetium ? 2.4 : 1.4,
      }),
    ]);
  });
  return svgEl("svg", {
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    role: "img",
    "aria-label": label,
  }, [
    svgEl("defs", {}, [
      svgEl("linearGradient", { id: gradientId, x1: "0", x2: "1", y1: "0", y2: "0" }, [
        svgEl("stop", { offset: "0", "stop-color": "#3a2a6a", "stop-opacity": "0.55" }),
        svgEl("stop", { offset: "1", "stop-color": "#1d4e89", "stop-opacity": "0.35" }),
      ]),
    ]),
    svgEl("rect", { x: 0, y: 8, width, height: height - 8, rx: 6, fill: "#142033" }),
    svgEl("rect", { x: 0, y: 8, width, height: height - 8, rx: 6, fill: `url(#${gradientId})` }),
    ...marks,
  ]);
}

function renderSpectrum() {
  const sun = document.getElementById("sun-strip");
  const star = document.getElementById("tc-strip");
  const axis = document.getElementById("spectrum-axis");
  const legend = document.getElementById("spectrum-legend");
  const lineList = document.getElementById("spectrum-lines");
  const stars = document.getElementById("tc-stars");
  const half = document.getElementById("spectrum-halflife");
  if (!sun || !star || !axis || !legend || !lineList || !stars || !half) return;
  stars.replaceChildren(...tcStars.map((item) => h("li", {}, [
    h("a", {
      href: starHref(item, state.lang),
      target: "_blank",
      rel: "noopener",
      text: item.name,
    }),
    h("span", {
      class: "note",
      text: t(state.lang, item.note === "disputed" ? "spectrum.notePrzy" : "spectrum.noteAgb"),
    }),
  ])));
  if (!session.exports) {
    sun.replaceChildren();
    star.replaceChildren();
    axis.replaceChildren();
    legend.replaceChildren();
    lineList.replaceChildren();
    half.textContent = "";
    return;
  }
  const spec = callSpectrum(session);
  const shared = spec.lines.filter((line) => line.kind === 0);
  sun.replaceChildren(spectrumStrip(shared, t(state.lang, "spectrum.sun"), "spectrum-wash-sun"));
  star.replaceChildren(spectrumStrip(spec.lines, t(state.lang, "spectrum.star"), "spectrum-wash-star"));
  const width = 640;
  const left = 28;
  const span = 584;
  axis.replaceChildren(svgEl("svg", {
    viewBox: `0 0 ${width} 36`,
    width,
    height: 36,
    role: "img",
    "aria-label": t(state.lang, "spectrum.axis"),
  }, [
    ...spec.ticks.map((tick) => {
      const x = left + tick.position * span;
      return svgEl("g", {}, [
        svgEl("line", { x1: x, x2: x, y1: 0, y2: 8, stroke: "#9fb0c3" }),
        svgEl("text", {
          x,
          y: 24,
          fill: "#d7e2ee",
          "font-size": 12,
          "text-anchor": "middle",
          text: String(Math.round(tick.wavelength)),
        }),
      ]);
    }),
  ]));
  legend.replaceChildren(
    h("li", {}, [h("span", { class: "swatch shared" }), document.createTextNode(t(state.lang, "spectrum.legendShared"))]),
    h("li", {}, [h("span", { class: "swatch tc" }), document.createTextNode(t(state.lang, "spectrum.legendTc"))]),
  );
  lineList.replaceChildren(...spec.lines.map((line, index) => h("li", { class: line.kind === 1 ? "tc-label" : "shared-label" }, [
    h("span", { class: line.kind === 1 ? "swatch tc" : "swatch shared" }),
    document.createTextNode(`${t(state.lang, LINE_KEYS[index])} ${formatNm(line.wavelength, state.lang)} nm`),
  ])));
  half.textContent = t(state.lang, "spectrum.half")
    .replace("{tc99}", formatReadable(spec.tc99, state.lang, "year"))
    .replace("{tc97}", formatReadable(spec.tc97, state.lang, "year"))
    .replace("{tc98}", formatReadable(spec.tc98, state.lang, "year"));
}

const GALAXY_SPEEDS = { slow: 40, normal: 20, fast: 10 };

const galaxy = {
  years: null,
  modern: false,
  calm: false,
  playing: false,
  phase: 0,
  speed: "normal",
  stamp: 0,
  frame: 0,
  report: null,
};

let galaxySettingSlider = false;

function formatGalaxySpan(value, lang) {
  if (value >= 1e9) return t(lang, "galaxy.billion").replace("{n}", formatGalaxyNumber(value / 1e9, lang));
  if (value >= 1e6) return t(lang, "galaxy.million").replace("{n}", formatGalaxyNumber(value / 1e6, lang));
  return t(lang, "galaxy.years").replace("{n}", formatReadable(Math.round(value), lang, "year"));
}

function formatGalaxyCount(value, lang) {
  if (value > 0 && value < 10000) {
    const text = value.toFixed(2);
    return lang === "en-GB" ? text : text.replace(".", ",");
  }
  return formatReadable(Math.round(value), lang);
}

function formatGalaxyNumber(value, lang) {
  const text = value >= 100 || Math.abs(value - Math.round(value)) < 1e-6
    ? String(Math.round(value))
    : value.toFixed(1);
  return lang === "en-GB" ? text : text.replace(".", ",");
}

function formatGalaxyDistance(value, lang) {
  return t(lang, "galaxy.ly").replace("{n}", formatGalaxyNumber(value, lang));
}

function stopGalaxyDemo() {
  galaxy.playing = false;
  if (galaxy.frame) cancelAnimationFrame(galaxy.frame);
  galaxy.frame = 0;
}

function stepGalaxy(now) {
  if (!galaxy.playing || !session.exports) return;
  const duration = GALAXY_SPEEDS[galaxy.speed] ?? GALAXY_SPEEDS.normal;
  if (!galaxy.stamp) galaxy.stamp = now - galaxy.phase * duration * 1000;
  const elapsed = (now - galaxy.stamp) / 1000;
  galaxy.phase = (elapsed / duration) % 1;
  galaxy.years = session.exports.ath_galaxy_years_of(galaxy.phase);
  renderGalaxy();
  galaxy.frame = requestAnimationFrame(stepGalaxy);
}

function startGalaxyDemo() {
  if (!session.exports) return;
  galaxy.playing = true;
  galaxy.calm = false;
  const duration = GALAXY_SPEEDS[galaxy.speed] ?? GALAXY_SPEEDS.normal;
  galaxy.stamp = performance.now() - galaxy.phase * duration * 1000;
  if (galaxy.frame) cancelAnimationFrame(galaxy.frame);
  galaxy.frame = requestAnimationFrame(stepGalaxy);
  const calmButton = document.getElementById("galaxy-calm");
  if (calmButton) calmButton.setAttribute("aria-pressed", "false");
  renderGalaxy();
}

function holdGalaxyAtBook() {
  stopGalaxyDemo();
  galaxy.years = session.exports.ath_galaxy_book_years();
  galaxy.phase = session.exports.ath_galaxy_slider_of(galaxy.years);
  renderGalaxy();
}

function bootGalaxy() {
  if (!session.exports) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  galaxy.calm = reduce;
  galaxy.speed = "normal";
  galaxy.phase = 0;
  const calmButton = document.getElementById("galaxy-calm");
  if (calmButton) calmButton.setAttribute("aria-pressed", reduce ? "true" : "false");
  if (reduce) {
    holdGalaxyAtBook();
    return;
  }
  galaxy.years = session.exports.ath_galaxy_years_of(0);
  startGalaxyDemo();
}

function renderGalaxy() {
  const caption = document.getElementById("galaxy-caption");
  const count = document.getElementById("galaxy-count");
  const distance = document.getElementById("galaxy-distance");
  const readout = document.getElementById("galaxy-life-readout");
  const sky = document.getElementById("galaxy-sky");
  const legend = document.getElementById("galaxy-legend");
  const pins = document.getElementById("galaxy-pins");
  const chart = document.getElementById("galaxy-chart");
  const playing = document.getElementById("galaxy-playing");
  const slider = document.getElementById("galaxy-life");
  const tech = document.getElementById("galaxy-tech");
  const calmButton = document.getElementById("galaxy-calm");
  if (!caption || !sky || !session.exports || galaxy.years == null) return;
  const spec = callGalaxy(session, galaxy.years, galaxy.modern);
  if (spec.status !== 0) {
    caption.textContent = "";
    count.textContent = "";
    distance.textContent = "";
    return;
  }
  const countText = formatGalaxyCount(spec.count, state.lang);
  const shownDistance = spec.distanceKnown ? formatGalaxyNumber(spec.distance, state.lang) : "";
  const distanceText = spec.distanceKnown
    ? formatGalaxyDistance(spec.distance, state.lang)
    : t(state.lang, "galaxy.noDistance");
  caption.textContent = spec.caption === 0
    ? t(state.lang, "galaxy.caption.0")
    : t(state.lang, `galaxy.caption.${spec.caption}`).replace("{n}", countText).replace("{d}", shownDistance);
  count.textContent = countText;
  distance.textContent = distanceText;
  const lifetimeText = formatGalaxySpan(galaxy.years, state.lang);
  const lifetimeOut = document.getElementById("galaxy-lifetime");
  if (lifetimeOut) lifetimeOut.textContent = lifetimeText;
  if (readout) readout.textContent = lifetimeText;
  if (playing) playing.hidden = !galaxy.playing;
  const playButton = document.getElementById("galaxy-play");
  if (playButton) {
    playButton.dataset.state = galaxy.playing ? "playing" : "paused";
    playButton.textContent = t(state.lang, galaxy.playing ? "galaxy.pause" : "galaxy.play");
    playButton.setAttribute("aria-pressed", galaxy.playing ? "true" : "false");
  }
  for (const button of document.querySelectorAll("[data-galaxy-speed]")) {
    button.setAttribute("aria-pressed", button.dataset.galaxySpeed === galaxy.speed ? "true" : "false");
  }
  if (calmButton) calmButton.setAttribute("aria-pressed", galaxy.calm ? "true" : "false");
  if (slider && document.activeElement !== slider) {
    galaxySettingSlider = true;
    slider.value = String(Math.round(spec.slider * 1000));
    slider.setAttribute("aria-valuetext", lifetimeText);
    galaxySettingSlider = false;
  }
  tech.textContent = t(state.lang, "galaxy.tech")
    .replace("{window}", formatReadable(spec.windowYears, state.lang, "year"))
    .replace("{systems}", formatReadable(spec.systems, state.lang, "year"))
    .replace("{radius}", formatReadable(spec.radius, state.lang, "year"));
  const signature = `${state.lang}|${galaxy.modern}`;
  if (sky.dataset.signature !== signature) {
    sky.dataset.signature = signature;
    const marks = spec.dots.map((dot) => {
      const cx = 100 + dot.x * 82;
      const cy = 100 - dot.y * 82;
      return svgEl("g", {}, [
        svgEl("circle", { class: "glow", cx, cy, r: 1.85, fill: "#f0b429", opacity: 0 }),
        svgEl("circle", { class: "star", cx, cy, r: 1.5, fill: "#8fb4d4" }),
      ]);
    });
    sky.replaceChildren(svgEl("svg", {
      viewBox: "0 0 200 200",
      role: "img",
      "aria-label": t(state.lang, "galaxy.title"),
    }, [
      svgEl("rect", { x: 0, y: 0, width: 200, height: 200, rx: 12, fill: "#101820" }),
      svgEl("circle", { cx: 100, cy: 100, r: 28, fill: "none", stroke: "#f0b429", "stroke-dasharray": "3 2" }),
      svgEl("text", { x: 100, y: 14, fill: "#f0b429", "font-size": 7, "text-anchor": "middle", text: formatGalaxyDistance(spec.ring, state.lang) }),
      ...marks,
    ]));
    legend.replaceChildren(
      h("li", {}, [h("span", { class: "swatch tc" }), document.createTextNode(t(state.lang, "galaxy.legend.lit"))]),
      h("li", {}, [h("span", { class: "swatch shared" }), document.createTextNode(t(state.lang, "galaxy.legend.quiet"))]),
      h("li", {}, [document.createTextNode(t(state.lang, "galaxy.legend.ring"))]),
    );
    pins.replaceChildren(...spec.pins.map((pin, index) => {
      const distanceLabel = pin.upper
        ? t(state.lang, "galaxy.underLy").replace("{n}", formatGalaxyNumber(pin.distance, state.lang))
        : formatGalaxyDistance(pin.distance, state.lang);
      return h("button", {
        type: "button",
        class: "secondary",
        dataset: { galaxyPin: String(index), galaxyYears: String(pin.life) },
        text: `${formatGalaxySpan(pin.life, state.lang)} · ${distanceLabel}`,
      });
    }));
    const left = 56;
    const top = 16;
    const width = 560;
    const height = 150;
    const curve = spec.samples.map((sample) => `${left + sample.x * width},${top + (1 - sample.y) * height}`).join(" ");
    const pinMarks = spec.pins.map((pin) => svgEl("circle", {
      cx: left + pin.slider * width,
      cy: top + (1 - pin.y) * height,
      r: 5,
      fill: "#f0b429",
    }));
    chart.replaceChildren(svgEl("svg", {
      viewBox: "0 0 640 210",
      role: "img",
      "aria-label": t(state.lang, "galaxy.axis.y"),
    }, [
      svgEl("text", { x: left, y: 12, fill: "#9fb0c3", "font-size": 12, text: t(state.lang, "galaxy.axis.y") }),
      svgEl("polyline", { id: "galaxy-curve", points: curve, fill: "none", stroke: "#d7e7ff", "stroke-width": 2 }),
      ...pinMarks,
      svgEl("circle", { id: "galaxy-now", r: 6, fill: "#c8f25a" }),
      svgEl("text", { x: left, y: 196, fill: "#d7e2ee", "font-size": 12, text: formatReadable(spec.samples[0].life, state.lang, "year") }),
      svgEl("text", { x: left + width, y: 196, fill: "#d7e2ee", "font-size": 12, "text-anchor": "end", text: formatReadable(spec.samples.at(-1).life, state.lang, "year") }),
      svgEl("text", { x: 320, y: 208, fill: "#9fb0c3", "font-size": 12, "text-anchor": "middle", text: t(state.lang, "galaxy.axis.x") }),
      svgEl("text", { x: 8, y: top + 8, fill: "#d7e2ee", "font-size": 11, text: formatReadable(spec.distanceMax, state.lang, "year") }),
      svgEl("text", { x: 8, y: top + height, fill: "#d7e2ee", "font-size": 11, text: formatReadable(spec.distanceMin, state.lang, "year") }),
    ]));
    legend.append(
      h("li", {}, [h("span", { class: "swatch shared" }), document.createTextNode(t(state.lang, "galaxy.legend.curve"))]),
      h("li", {}, [h("span", { class: "swatch tc" }), document.createTextNode(t(state.lang, "galaxy.legend.pin"))]),
    );
  }
  const circles = sky.querySelectorAll("circle.star");
  const glows = sky.querySelectorAll("circle.glow");
  spec.dots.forEach((dot, index) => {
    const node = circles[index];
    const glow = glows[index];
    if (!node) return;
    const brightness = dot.brightness ?? (dot.lit ? 1 : 0);
    node.setAttribute("data-lit", brightness >= 0.5 ? "1" : "0");
    node.setAttribute("r", "1.5");
    node.style.opacity = "1";
    node.setAttribute("fill", brightness >= 0.5 ? "#f0b429" : "#8fb4d4");
    if (glow) {
      glow.setAttribute("r", "1.85");
      glow.style.opacity = String(0.4 * brightness);
    }
  });
  galaxy.report = {
    years: galaxy.years,
    count: spec.count,
    distance: spec.distanceKnown ? spec.distance : null,
    drawn: spec.dots.filter((dot) => dot.lit).length,
    play: galaxy.playing ? "playing" : "paused",
    speed: galaxy.speed,
    calm: galaxy.calm ? "on" : "off",
  };
  const now = chart.querySelector("#galaxy-now");
  if (now && spec.distancePos != null) {
    now.setAttribute("cx", String(56 + spec.slider * 560));
    now.setAttribute("cy", String(16 + (1 - spec.distancePos) * 150));
  }
}

const sixes = {
  tab: "dice",
  players: null,
  eggs: null,
  setIndex: 1,
  ladder: "1000000000",
  untilDraw: 0,
  untilTarget: null,
  untilFrame: 0,
  playing: false,
  timer: 0,
  faces: [],
  sixCount: 0,
  report: null,
};

function formatChance(value, lang) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const text = value > 0 && value < 0.001
    ? value.toExponential(4)
    : value > 0.99
      ? value.toFixed(10)
      : value.toFixed(4);
  return lang === "en-GB" ? text : text.replaceAll(".", ",");
}

function stopSixesPlay() {
  sixes.playing = false;
  if (sixes.timer) clearInterval(sixes.timer);
  sixes.timer = 0;
}

function rollSixes(setIndex) {
  const outcome = callSixesRoll(session, setIndex);
  sixes.setIndex = setIndex;
  sixes.faces = outcome.faces;
  sixes.sixCount = outcome.sixes;
}

function startSixesPlay() {
  if (!session.exports) return;
  sixes.playing = true;
  if (sixes.timer) clearInterval(sixes.timer);
  sixes.timer = setInterval(() => {
    rollSixes(sixes.setIndex + 1);
    renderSixes();
  }, 1200);
  renderSixes();
}

function drawChanceChart(host, samples, axisKey, pins) {
  if (!host) return;
  const left = 48;
  const top = 16;
  const width = 560;
  const height = 140;
  const curve = samples.map((sample) => `${left + sample.x * width},${top + (1 - sample.chance) * height}`).join(" ");
  host.replaceChildren(svgEl("svg", {
    viewBox: "0 0 640 190",
    role: "img",
    "aria-label": t(state.lang, "sixes.axis.chance"),
  }, [
    svgEl("text", { x: left, y: 12, fill: "#9fb0c3", "font-size": 12, text: t(state.lang, "sixes.axis.chance") }),
    svgEl("line", { x1: left, x2: left + width, y1: top + height, y2: top + height, stroke: "#9fb0c3" }),
    svgEl("polyline", { points: curve, fill: "none", stroke: "#d7e7ff", "stroke-width": 2, "stroke-dasharray": "6 4" }),
    ...pins.map((pin) => svgEl("circle", {
      cx: left + pin * width,
      cy: top + height - 4,
      r: 5,
      fill: "#f0b429",
    })),
    svgEl("text", { x: left, y: 186, fill: "#d7e2ee", "font-size": 12, text: formatReadable(samples[0].amount, state.lang) }),
    svgEl("text", { x: left + width, y: 186, fill: "#d7e2ee", "font-size": 12, "text-anchor": "end", text: formatReadable(samples.at(-1).amount, state.lang) }),
    svgEl("text", { x: 320, y: 188, fill: "#9fb0c3", "font-size": 12, "text-anchor": "middle", text: t(state.lang, axisKey) }),
  ]));
}

function formatPeople(value, lang) {
  const rounded = Math.round(value);
  if (rounded >= 1e9) return t(lang, "sixes.billion").replace("{n}", formatGalaxyNumber(rounded / 1e9, lang));
  if (rounded >= 1e6) return t(lang, "sixes.million").replace("{n}", formatGalaxyNumber(rounded / 1e6, lang));
  return formatReadable(rounded, lang);
}

function formatWinners(value, lang) {
  if (value >= 0.05 && value < 100) {
    const text = value.toFixed(1);
    return lang === "en-GB" ? text : text.replace(".", ",");
  }
  if (value >= 100) return formatReadable(Math.round(value), lang);
  return formatChance(value, lang);
}

function drawLadder(steps) {
  const host = document.getElementById("sixes-ladder");
  if (!host) return;
  host.replaceChildren(...steps.map((step) => {
    const button = h("button", {
      type: "button",
      dataset: { sixesLadder: String(step.amount) },
    }, [
      h("span", { class: "bar" }),
      h("span", { class: "label", text: `${formatPeople(step.amount, state.lang)} · ${t(state.lang, `sixes.word.${step.word}`)}` }),
    ]);
    button.querySelector(".bar").style.width = `${Math.min(100, step.chance * 100)}%`;
    button.setAttribute("aria-pressed", sixes.ladder === String(step.amount) ? "true" : "false");
    return button;
  }));
}

function drawCrowd(marks) {
  const host = document.getElementById("sixes-crowd");
  if (!host) return;
  host.replaceChildren(...marks.map((marked) => h("span", { class: marked ? "is-winner" : "" })));
}

function showUntil(target, animate) {
  const note = document.getElementById("sixes-until-note");
  sixes.untilTarget = target;
  if (sixes.untilFrame) cancelAnimationFrame(sixes.untilFrame);
  if (note) note.dataset.until = String(Math.round(target));
  const write = (value) => {
    if (note) {
      note.textContent = t(state.lang, "sixes.untilNote").replace("{n}", formatReadable(Math.round(value), state.lang));
    }
  };
  if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    write(target);
    return;
  }
  const started = performance.now();
  const frame = (now) => {
    const portion = Math.min(1, (now - started) / 2500);
    write(target * portion);
    if (portion < 1) sixes.untilFrame = requestAnimationFrame(frame);
  };
  sixes.untilFrame = requestAnimationFrame(frame);
}

function renderSixes() {
  const faces = document.getElementById("sixes-faces");
  if (!faces || !session.exports || sixes.players == null) return;
  const playButton = document.getElementById("sixes-play");
  if (playButton) {
    playButton.dataset.state = sixes.playing ? "playing" : "paused";
    playButton.textContent = t(state.lang, sixes.playing ? "galaxy.pause" : "galaxy.play");
    playButton.setAttribute("aria-pressed", sixes.playing ? "true" : "false");
  }
  const playing = document.getElementById("sixes-playing");
  if (playing) playing.hidden = !sixes.playing;
  faces.replaceChildren(...sixes.faces.map((face) => h("span", {
    class: face === 6 ? "die is-six" : "die",
    text: String(face),
  })));
  const note = document.getElementById("sixes-roll-note");
  if (note) {
    const key = sixes.sixCount === 10 ? "sixes.rollHit" : "sixes.rollNote";
    note.textContent = t(state.lang, key)
      .replace("{n}", formatReadable(sixes.setIndex, state.lang))
      .replace("{k}", formatReadable(sixes.sixCount, state.lang));
  }
  const dice = callSixes(session, sixes.players);
  const eggs = callEggs(session, sixes.eggs);
  if (dice.status === 0) {
    document.getElementById("sixes-player-count").textContent = formatReadable(Math.round(sixes.players), state.lang);
    document.getElementById("sixes-chance").textContent = formatChance(dice.chance, state.lang);
    const slider = document.getElementById("sixes-players");
    if (slider && document.activeElement !== slider) slider.value = String(Math.round(dice.slider * 1000));
    if (sixes.tab === "dice") {
      document.getElementById("sixes-winners").textContent = t(state.lang, "sixes.winnersLine")
        .replace("{players}", formatPeople(sixes.players, state.lang))
        .replace("{winners}", formatWinners(dice.expected, state.lang));
      document.getElementById("sixes-winner-count").textContent = formatWinners(dice.expected, state.lang);
      document.getElementById("sixes-crowd-note").textContent = t(state.lang, "sixes.crowdNote")
        .replace("{pictures}", formatReadable(dice.crowd.length, state.lang))
        .replace("{group}", formatPeople(Math.max(dice.group, 1), state.lang));
      drawLadder(dice.ladder);
      drawCrowd(dice.crowd);
      drawChanceChart(document.getElementById("sixes-chart"), dice.samples, "sixes.axis.players", [0, 1]);
      fillSixesTable(dice.samples);
    }
  }
  if (eggs.status === 0) {
    document.getElementById("sixes-egg-count").textContent = formatReadable(Math.round(sixes.eggs), state.lang);
    document.getElementById("sixes-fish").textContent = formatReadable(eggs.expected, state.lang);
    document.getElementById("sixes-egg-chance").textContent = formatChance(eggs.chance, state.lang);
    const slider = document.getElementById("sixes-egg-slider");
    if (slider && document.activeElement !== slider) slider.value = String(Math.round(eggs.slider * 1000));
    if (sixes.tab === "eggs") {
      drawChanceChart(
        document.getElementById("sixes-egg-chart"),
        eggs.samples,
        "sixes.axis.eggs",
        [session.exports.ath_sixes_egg_slider(session.exports.ath_sixes_egg_count())],
      );
      fillSixesTable(eggs.samples);
    }
  }
  sixes.report = {
    players: sixes.players,
    chance: dice.chance ?? 0,
    setIndex: sixes.setIndex,
    faces: sixes.faces,
    sixes: sixes.sixCount,
    eggs: sixes.eggs,
    expected: eggs.expected ?? 0,
    eggChance: eggs.chance ?? 0,
    winners: dice.expected ?? 0,
    ladder: sixes.ladder,
    until: sixes.untilTarget,
    play: sixes.playing ? "playing" : "paused",
  };
}

function fillSixesTable(samples) {
  const body = document.querySelector("#sixes-table tbody");
  if (!body) return;
  const picked = [samples[0], samples[Math.floor(samples.length / 2)], samples.at(-1)].filter(Boolean);
  body.replaceChildren(...picked.map((sample) => h("tr", {}, [
    h("td", { text: formatReadable(Math.round(sample.amount), state.lang) }),
    h("td", { text: formatChance(sample.chance, state.lang) }),
  ])));
}

function bootSixes() {
  if (!session.exports) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  sixes.players = session.exports.ath_sixes_players_of(1);
  sixes.eggs = session.exports.ath_sixes_egg_count();
  rollSixes(1);
  if (reduce) {
    stopSixesPlay();
    renderSixes();
    return;
  }
  startSixesPlay();
}

const energy = {
  years: 0,
  playing: false,
  calm: false,
  frame: 0,
  stamp: 0,
  report: null,
};

function stopEnergyPlay() {
  energy.playing = false;
  if (energy.frame) cancelAnimationFrame(energy.frame);
  energy.frame = 0;
}

function stepEnergy(now) {
  if (!energy.playing) return;
  const span = ((now - energy.stamp) / 20000) * 2500;
  energy.years = span >= 2500 ? 0 : span;
  if (span >= 2500) energy.stamp = now;
  renderEnergy();
  energy.frame = requestAnimationFrame(stepEnergy);
}

function startEnergyPlay() {
  if (!session.exports) return;
  energy.playing = true;
  energy.calm = false;
  document.getElementById("energy-calm")?.setAttribute("aria-pressed", "false");
  energy.stamp = performance.now() - (energy.years / 2500) * 20000;
  energy.frame = requestAnimationFrame(stepEnergy);
}

function formatSci(value, lang) {
  if (!Number.isFinite(value) || value <= 0) return "";
  let exp = Math.floor(Math.log10(value) + 1e-12);
  let mantissa = value / 10 ** exp;
  if (mantissa >= 9.995) {
    mantissa /= 10;
    exp += 1;
  }
  const text = `${mantissa.toFixed(1)}×10^${exp}`;
  return lang === "en-GB" ? text : text.replace(".", ",");
}

function formatTimes(value, lang) {
  if (Math.abs(value - 1e10) / 1e10 < 1e-6) return t(lang, "energy.tenBillion");
  if (value >= 1000) return formatSci(value, lang);
  const text = Math.abs(value - Math.round(value)) < 0.05 ? String(Math.round(value)) : value.toFixed(1);
  return lang === "en-GB" ? text : text.replace(".", ",");
}

function renderEnergy() {
  const scene = document.getElementById("energy-scene");
  if (!scene || !session.exports) return;
  const model = callEnergy(session, energy.years);
  const years = document.getElementById("energy-year-count");
  const times = document.getElementById("energy-times");
  const third = document.getElementById("energy-third");
  const share = document.getElementById("energy-share");
  if (years) years.textContent = formatReadable(Math.round(model.years), state.lang);
  if (times) times.textContent = formatTimes(model.statedFactor, state.lang);
  if (third) third.textContent = formatTimes(model.thirdFactor, state.lang);
  if (share) share.textContent = formatSci(model.sunShare, state.lang);
  const slider = document.getElementById("energy-years");
  if (slider && document.activeElement !== slider) slider.value = String(Math.round(model.years));
  const play = document.getElementById("energy-play");
  if (play) {
    play.dataset.state = energy.playing ? "playing" : "paused";
    play.textContent = t(state.lang, energy.playing ? "galaxy.pause" : "galaxy.play");
    play.setAttribute("aria-pressed", energy.playing ? "true" : "false");
  }
  drawEnergyScene(model);
  drawEnergyStrip(energyStage(model));
  drawEnergyBar(model);
  drawEnergyChart(model);
  drawEnergyStairs(model);
  const stage = document.getElementById("energy-stage");
  if (stage) {
    const portion = model.years / model.horizon;
    const key = portion < 0.34 ? "energy.stageCity" : portion < 0.67 ? "energy.stageEarth" : "energy.stageSun";
    stage.textContent = t(state.lang, key);
  }
  const tech = document.getElementById("energy-tech");
  if (tech) {
    tech.textContent = t(state.lang, "energy.tech")
      .replace("{third}", formatTimes(model.samples.at(-1).third / model.today, state.lang))
      .replace("{rate}", (model.rate * 100).toFixed(3).replace(".", state.lang === "en-GB" ? "." : ","))
      .replace("{sun}", formatSci(model.sun, state.lang))
      .replace("{modern}", formatSci(model.modernSun, state.lang));
  }
  energy.report = {
    years: model.years,
    stated: model.statedFactor,
    third: model.thirdFactor,
    rate: model.rate,
    energy: model.energy,
    share: model.sunShare,
    play: energy.playing ? "playing" : "paused",
    calm: energy.calm ? "on" : "off",
    stage: energyStage(model),
  };
}

function energyStage(model) {
  const portion = model.years / model.horizon;
  if (portion < 0.34) return "city";
  if (portion < 0.67) return "earth";
  return "sun";
}

function energyLabel(text) {
  return svgEl("text", {
    x: 320,
    y: 236,
    "text-anchor": "middle",
    fill: "#e8eef7",
    "font-size": 20,
    text,
  });
}

function drawEnergyScene(model) {
  const host = document.getElementById("energy-scene");
  if (!host) return;
  const stage = energyStage(model);
  const portion = model.years / model.horizon;
  const parts = [
    svgEl("defs", {}, [
      svgEl("filter", { id: "energy-glow", x: "-40%", y: "-40%", width: "180%", height: "180%" }, [
        svgEl("feGaussianBlur", { stdDeviation: "8" }),
      ]),
      svgEl("clipPath", { id: "earth-clip" }, [
        svgEl("circle", { cx: 320, cy: 104, r: 46 }),
      ]),
    ]),
  ];
  const decades = Math.log10(Math.max(model.statedFactor, 1));
  const decadePerYear = Math.log10(1 + model.rate);
  const cityDecades = 0.34 * model.horizon * decadePerYear;
  const earthDecades = 0.67 * model.horizon * decadePerYear;
  if (stage === "city") {
    const growth = cityDecades <= 0 ? 0 : Math.min(1, decades / cityDecades);
    const count = 3 + Math.round(growth * 6);
    const ground = 186;
    const width = 26 + growth * 10;
    const gap = 6;
    let x = 320 - (count * width + (count - 1) * gap) / 2;
    parts.push(svgEl("ellipse", {
      cx: 320,
      cy: 156,
      rx: 48 + growth * 130,
      ry: 14 + growth * 28,
      fill: "#c8f25a",
      opacity: 0.18 + growth * 0.55,
      filter: "url(#energy-glow)",
    }));
    parts.push(svgEl("line", { x1: 150, y1: ground, x2: 490, y2: ground, stroke: "#314863", "stroke-width": 2 }));
    for (let index = 0; index < count; index += 1) {
      const height = (26 + (index % 4) * 12) * (0.5 + growth);
      const top = ground - height;
      parts.push(svgEl("rect", { class: "building", x, y: top, width, height, fill: "#d7e7ff" }));
      const cols = 1 + Math.round(growth * 2);
      const rows = 1 + Math.round(growth * 4);
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const wx = x + 5 + col * 10;
          const wy = top + 6 + row * 12;
          if (wx + 4 < x + width && wy + 4 < ground) {
            parts.push(svgEl("rect", { class: "window", x: wx, y: wy, width: 4, height: 4, fill: "#f0b429" }));
          }
        }
      }
      x += width + gap;
    }
    parts.push(energyLabel(t(state.lang, "energy.strip.city")));
  } else if (stage === "earth") {
    const along = earthDecades <= cityDecades ? 1 : Math.min(1, Math.max(0, (decades - cityDecades) / (earthDecades - cityDecades)));
    const globeR = 46;
    const stroke = 1.5 + along * 6.5;
    const ringR = globeR + 4 + stroke / 2;
    const lights = [
      [300, 90], [308, 94], [314, 88], [302, 96],
      [328, 110], [336, 112], [344, 114], [332, 108], [348, 110],
      [308, 118], [314, 116], [312, 122], [318, 118], [306, 114],
    ];
    const lit = 2 + Math.round(along * (lights.length - 2));
    parts.push(
      svgEl("circle", { class: "globe", cx: 320, cy: 104, r: globeR, fill: "#3c6e8f" }),
      svgEl("ellipse", { cx: 306, cy: 92, rx: 16, ry: 10, fill: "#7dcea0", "clip-path": "url(#earth-clip)" }),
      svgEl("ellipse", { cx: 338, cy: 112, rx: 18, ry: 8, fill: "#7dcea0", "clip-path": "url(#earth-clip)" }),
      svgEl("ellipse", { cx: 312, cy: 118, rx: 8, ry: 6, fill: "#7dcea0", "clip-path": "url(#earth-clip)" }),
    );
    for (let index = 0; index < lit; index += 1) {
      parts.push(svgEl("circle", {
        class: "city-light",
        cx: lights[index][0],
        cy: lights[index][1],
        r: 1.6,
        fill: "#f0b429",
      }));
    }
    parts.push(
      svgEl("circle", {
        class: "glow",
        cx: 320,
        cy: 104,
        r: ringR,
        fill: "none",
        stroke: "#c8f25a",
        "stroke-width": stroke,
        opacity: 0.22 + along * 0.73,
      }),
      energyLabel(t(state.lang, "energy.strip.earth")),
    );
  } else {
    const close = Math.min(1, (portion - 0.67) / 0.33);
    const shellR = 70;
    const turn = 2 * Math.PI * shellR;
    const earthX = 320 + shellR * Math.cos(-0.45);
    const earthY = 104 + shellR * Math.sin(-0.45);
    parts.push(
      svgEl("circle", { cx: 320, cy: 104, r: 20, fill: "#f0b429" }),
      svgEl("circle", {
        class: "shell",
        cx: 320,
        cy: 104,
        r: shellR,
        fill: "none",
        stroke: "#c8f25a",
        "stroke-width": 5,
        "stroke-dasharray": `${close * turn} ${turn}`,
        opacity: 0.95,
      }),
      svgEl("circle", { class: "earth-dot", cx: earthX, cy: earthY, r: 5, fill: "#8fd0de" }),
      energyLabel(t(state.lang, "energy.strip.sun")),
    );
  }
  host.replaceChildren(svgEl("svg", {
    viewBox: "0 0 640 250",
    role: "img",
    "aria-label": t(state.lang, "energy.scene"),
  }, parts));
}

function drawEnergyStrip(stage) {
  const host = document.getElementById("energy-stages");
  if (!host) return;
  const items = [
    ["city", "energy.strip.city"],
    ["earth", "energy.strip.earth"],
    ["sun", "energy.strip.sun"],
  ];
  host.replaceChildren(...items.map(([id, key]) => {
    const node = h("span", { text: t(state.lang, key) });
    if (id === stage) {
      node.classList.add("is-current");
      node.setAttribute("aria-current", "true");
    }
    return node;
  }));
}

function drawEnergyBar(model) {
  const host = document.getElementById("energy-bar");
  if (!host) return;
  const start = Math.log10(model.today);
  const end = Math.log10(model.sun);
  const width = Math.max(2, Math.min(100, (Math.log10(model.energy) - start) / (end - start) * 100));
  host.replaceChildren(h("span", { style: `width:${width}%` }));
  host.setAttribute("aria-label", t(state.lang, "energy.bar"));
}

function drawEnergyChart(model) {
  const host = document.getElementById("energy-chart");
  if (!host) return;
  const left = 64;
  const top = 16;
  const width = 540;
  const height = 150;
  const yMin = 19;
  const yMax = 34;
  const yOf = (value) => top + (1 - (Math.log10(value) - yMin) / (yMax - yMin)) * height;
  const xOf = (years) => left + (years / model.horizon) * width;
  const line = (key) => model.samples.map((sample) => `${xOf(sample.years)},${yOf(sample[key])}`).join(" ");
  host.replaceChildren(svgEl("svg", {
    viewBox: "0 0 640 200",
    role: "img",
    "aria-label": t(state.lang, "energy.chart"),
  }, [
    svgEl("line", { x1: left, y1: top, x2: left, y2: top + height, stroke: "#9fb0c3" }),
    svgEl("line", { x1: left, y1: top + height, x2: left + width, y2: top + height, stroke: "#9fb0c3" }),
    svgEl("line", { x1: left, y1: yOf(model.sun), x2: left + width, y2: yOf(model.sun), stroke: "#f0b429", "stroke-width": 2 }),
    svgEl("polyline", { points: line("third"), fill: "none", stroke: "#9fb0c3", "stroke-dasharray": "6 4", "stroke-width": 2 }),
    svgEl("polyline", { points: line("stated"), fill: "none", stroke: "#d7e7ff", "stroke-width": 2 }),
    svgEl("circle", { cx: xOf(model.horizon), cy: yOf(model.today * 1e10), r: 5, fill: "#f0b429" }),
    svgEl("text", { x: 8, y: yOf(model.sun) + 4, fill: "#f0b429", "font-size": 11, text: "10^33" }),
    svgEl("text", { x: 8, y: top + height, fill: "#b7c9dc", "font-size": 11, text: "10^19" }),
    svgEl("text", { x: left, y: 194, fill: "#b7c9dc", "font-size": 12, text: "0" }),
    svgEl("text", { x: left + width - 36, y: 194, fill: "#b7c9dc", "font-size": 12, text: "2500" }),
    svgEl("text", { x: left + width / 2 - 18, y: 12, fill: "#b7c9dc", "font-size": 12, text: "erg/s" }),
  ]));
}

function drawEnergyStairs(model) {
  const host = document.getElementById("energy-stairs");
  if (!host) return;
  const names = ["energy.step1", "energy.step2", "energy.step3"];
  const here = model.energy < model.steps[1] ? 0 : model.energy < model.steps[2] ? 1 : 2;
  host.replaceChildren(...model.steps.map((step, index) => h("li", { class: index === here ? "is-here" : "" }, [
    h("strong", { text: t(state.lang, names[index]) }),
    document.createTextNode(` ${formatSci(step, state.lang)} erg/s`),
    index === 2 ? document.createTextNode(` · ${formatSci(model.stars, state.lang)} ${t(state.lang, "energy.stars")}`) : null,
  ])));
}

function bootEnergy() {
  if (!session.exports) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  energy.calm = reduce;
  energy.years = 0;
  document.getElementById("energy-calm")?.setAttribute("aria-pressed", reduce ? "true" : "false");
  if (reduce) {
    stopEnergyPlay();
    renderEnergy();
    return;
  }
  startEnergyPlay();
}

const hear = {
  distance: null,
  source: "slider",
  dragging: false,
  setting: false,
  muted: true,
  calm: false,
  letter: 0,
  letterFrame: 0,
  sending: false,
  ping: 0,
  context: null,
  report: null,
};

function motionReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function stopHearSound() {
  if (hear.ping) clearInterval(hear.ping);
  hear.ping = 0;
}

function stopLetter() {
  if (hear.letterFrame) cancelAnimationFrame(hear.letterFrame);
  hear.letterFrame = 0;
  hear.sending = false;
}

function hearPing(gain) {
  const ctx = hear.context;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const level = Math.max(0.0008, Math.min(0.2, 0.08 * gain));
  const now = ctx.currentTime;
  osc.type = "sine";
  osc.frequency.value = 660;
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(level, now + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

function syncHearSound() {
  const blocked = hear.muted || hear.calm || motionReduced();
  if (blocked || !hear.context) {
    stopHearSound();
    return;
  }
  if (hear.ping) return;
  const ping = () => {
    if (!session.exports || hear.distance == null) return;
    hearPing(session.exports.ath_hear_gain(hear.distance));
  };
  ping();
  hear.ping = setInterval(ping, 1000);
}

function toggleHearSound() {
  if (hear.calm || motionReduced()) {
    hear.muted = true;
    stopHearSound();
    renderHear();
    return;
  }
  hear.muted = !hear.muted;
  if (!hear.muted && !hear.context) {
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) {
        hear.context = new Context();
        if (hear.context.state === "suspended") hear.context.resume();
      }
    } catch {
      hear.context = null;
    }
  }
  syncHearSound();
  renderHear();
}

function snapHearDistance(distance) {
  if (!session.exports) return distance;
  const pins = [session.exports.ath_hear_reference(), session.exports.ath_hear_far()];
  const here = session.exports.ath_hear_slider_of(distance);
  for (const pin of pins) {
    if (Math.abs(here - session.exports.ath_hear_slider_of(pin)) < 0.04) return pin;
  }
  return distance;
}

function setHearFromPointer(event) {
  const svg = document.querySelector("#hear-chart svg");
  if (!svg || !session.exports) return;
  const rect = svg.getBoundingClientRect();
  if (rect.width <= 0) return;
  const x = ((event.clientX - rect.left) / rect.width) * 640;
  const phase = Math.min(1, Math.max(0, (x - 58) / 540));
  hear.distance = snapHearDistance(session.exports.ath_hear_distance_of(phase));
  hear.source = "drag";
  renderHear();
}

function sendLetter() {
  stopLetter();
  if (hear.calm || motionReduced()) {
    hear.letter = 1;
    renderHear();
    return;
  }
  const started = performance.now();
  hear.sending = true;
  const frame = (now) => {
    hear.letter = Math.min(1, (now - started) / 8000);
    renderHear();
    if (hear.letter < 1) hear.letterFrame = requestAnimationFrame(frame);
    else hear.sending = false;
  };
  hear.letterFrame = requestAnimationFrame(frame);
}

function renderHear() {
  const scene = document.getElementById("hear-scene");
  if (!scene || !session.exports || hear.distance == null) return;
  const model = callHear(session, hear.distance);
  const distance = document.getElementById("hear-distance-count");
  const power = document.getElementById("hear-power");
  const gain = document.getElementById("hear-gain");
  if (distance) distance.textContent = t(state.lang, "hear.ly").replace("{n}", formatGalaxyNumber(model.distance, state.lang));
  if (power) {
    const shown = model.power < 1
      ? model.power.toFixed(2).replace(".", state.lang === "en-GB" ? "." : ",")
      : model.power >= 100
        ? formatReadable(Math.round(model.power), state.lang)
        : formatGalaxyNumber(model.power, state.lang);
    power.textContent = t(state.lang, "hear.times").replace("{n}", shown);
  }
  if (gain) gain.textContent = t(state.lang, "hear.percent").replace("{n}", formatReadable(Math.round(model.gain * 100), state.lang));
  const slider = document.getElementById("hear-distance");
  if (slider && document.activeElement !== slider) {
    hear.setting = true;
    slider.value = String(Math.round(model.slider * 1000));
    hear.setting = false;
  }
  const lead = document.getElementById("hear-letter-lead");
  if (lead) {
    lead.textContent = t(state.lang, "hear.letterLead")
      .replace("{distance}", formatGalaxyNumber(model.distance, state.lang))
      .replace("{out}", formatGalaxyNumber(model.oneWay, state.lang))
      .replace("{back}", formatGalaxyNumber(model.round - model.oneWay, state.lang))
      .replace("{generations}", formatReadable(Math.round(model.generations), state.lang));
  }
  const sound = document.getElementById("hear-sound");
  const sounding = !hear.muted && !hear.calm && !motionReduced();
  if (sound) {
    const label = t(state.lang, sounding ? "hear.soundOff" : "hear.soundOn");
    sound.textContent = label;
    sound.setAttribute("aria-label", label);
    sound.setAttribute("aria-pressed", sounding ? "true" : "false");
  }
  const soundNote = document.getElementById("hear-sound-note");
  if (soundNote) {
    soundNote.textContent = t(state.lang, sounding ? "hear.sounding" : "hear.silent");
  }
  drawHearScene(model);
  drawHearChart(model);
  drawHearGenerations(model);
  const tech = document.getElementById("hear-tech");
  if (tech) {
    tech.textContent = t(state.lang, "hear.tech")
      .replace("{lem}", formatReadable(model.dishLem, state.lang))
      .replace("{feet}", formatReadable(model.ozmaFeet, state.lang))
      .replace("{metres}", model.ozmaMetres.toFixed(3).replace(".", state.lang === "en-GB" ? "." : ","))
      .replace("{years}", formatReadable(model.generationYears, state.lang));
  }
  hear.report = {
    distance: model.distance,
    power: model.power,
    gain: model.gain,
    muted: sounding ? "no" : "yes",
    letter: hear.sending ? "playing" : hear.letter >= 1 ? "done" : "idle",
    source: hear.source,
    letterDistance: model.distance,
  };
}

function drawHearScene(model) {
  const host = document.getElementById("hear-scene");
  if (!host) return;
  const starX = 130 + model.slider * 460;
  const rings = [26, 46, 70, 98].map((radius, index) => svgEl("circle", {
    cx: 78,
    cy: 96,
    r: radius,
    fill: "none",
    stroke: "#8fd0de",
    "stroke-width": 2,
    opacity: Math.max(0.04, Math.min(0.9, model.intensity * (1 - index * 0.12))),
  }));
  const waves = [14, 22, 30].map((radius) => svgEl("path", {
    d: `M 108 ${96 - radius} A ${radius} ${radius} 0 0 1 108 ${96 + radius}`,
    fill: "none",
    stroke: "#c8f25a",
    "stroke-width": 2,
    opacity: Math.max(0.08, model.gain),
  }));
  host.replaceChildren(svgEl("svg", {
    viewBox: "0 0 640 180",
    role: "img",
    "aria-label": t(state.lang, "hear.scene"),
  }, [
    svgEl("line", { x1: 40, y1: 150, x2: 610, y2: 150, stroke: "#314863", "stroke-width": 2 }),
    ...rings,
    svgEl("path", { d: "M 58 132 L 98 132 L 88 78 L 68 78 Z", fill: "#d7e7ff" }),
    svgEl("rect", { x: 74, y: 70, width: 8, height: 28, fill: "#8fd0de" }),
    ...waves,
    svgEl("circle", { cx: starX, cy: 78, r: 12, fill: "#f0b429" }),
  ]));
}

function hearChartY(power) {
  const log = Math.log10(Math.max(power, 1e-6));
  return 16 + (1 - (log + 2) / 6) * 140;
}

function drawHearChart(model) {
  const host = document.getElementById("hear-chart");
  if (!host) return;
  const left = 58;
  const top = 16;
  const width = 540;
  const height = 140;
  const youX = left + model.slider * width;
  const youY = hearChartY(model.power);
  if (host.dataset.signature !== state.lang) {
    host.dataset.signature = state.lang;
    const curve = model.samples.map((sample) => `${left + sample.x * width},${hearChartY(sample.power)}`).join(" ");
    const pins = [model.reference, model.far].map((distance) => svgEl("circle", {
      class: "hear-pin",
      cx: left + session.exports.ath_hear_slider_of(distance) * width,
      cy: hearChartY(session.exports.ath_hear_power(distance)),
      r: 6,
      fill: "#f0b429",
    }));
    host.replaceChildren(svgEl("svg", {
      viewBox: "0 0 640 190",
      role: "img",
      "aria-label": t(state.lang, "hear.chart"),
    }, [
      svgEl("line", { x1: left, y1: top, x2: left, y2: top + height, stroke: "#9fb0c3" }),
      svgEl("line", { x1: left, y1: top + height, x2: left + width, y2: top + height, stroke: "#9fb0c3" }),
      svgEl("polyline", { points: curve, fill: "none", stroke: "#d7e7ff", "stroke-dasharray": "6 4", "stroke-width": 3 }),
      ...pins,
      svgEl("circle", { id: "hear-you", cx: youX, cy: youY, r: 8, fill: "#ffffff", stroke: "#14210a", "stroke-width": 2 }),
      svgEl("text", { x: left, y: 12, fill: "#b7c9dc", "font-size": 12, text: "10,000×" }),
      svgEl("text", { x: left - 18, y: top + (height * 2) / 3, fill: "#b7c9dc", "font-size": 12, text: "1×" }),
      svgEl("text", { x: 8, y: top + height, fill: "#b7c9dc", "font-size": 12, text: "0.01×" }),
      svgEl("text", { x: left, y: 184, fill: "#b7c9dc", "font-size": 12, text: "1 ly" }),
      svgEl("text", { x: left + width / 3 - 16, y: 184, fill: "#b7c9dc", "font-size": 12, text: "10 ly" }),
      svgEl("text", { x: left + width - 48, y: 184, fill: "#b7c9dc", "font-size": 12, text: "1,000 ly" }),
    ]));
  }
  const you = host.querySelector("#hear-you");
  if (you) {
    you.setAttribute("cx", String(youX));
    you.setAttribute("cy", String(youY));
  }
}

function drawHearGenerations(model) {
  const host = document.getElementById("hear-generations");
  const note = document.getElementById("hear-letter-note");
  if (!host) return;
  const count = Math.round(model.generations);
  const passed = Math.round(count * hear.letter);
  host.replaceChildren(...Array.from({ length: count }, (_, index) => h("span", {
    class: index < passed ? "is-passed" : "",
  })));
  if (!note) return;
  const key = hear.letter <= 0 ? "hear.letterIdle" : hear.letter < 0.5 ? "hear.letterOut" : hear.letter < 1 ? "hear.letterBack" : "hear.letterDone";
  note.textContent = t(state.lang, key)
    .replace("{generations}", formatReadable(count, state.lang))
    .replace("{years}", formatReadable(model.generationYears, state.lang));
}

function bootHear() {
  if (!session.exports) return;
  hear.calm = motionReduced();
  hear.muted = true;
  hear.distance = session.exports.ath_hear_reference();
  document.getElementById("hear-calm")?.setAttribute("aria-pressed", hear.calm ? "true" : "false");
  stopHearSound();
  renderHear();
}

const colony = {
  choice: 1,
  years: null,
  hopLy: 1000,
  hopYears: 10000,
  origin: 1,
  calm: false,
  playing: false,
  sievePlaying: false,
  sieve: 0,
  sieveStamp: 0,
  sieveFrame: 0,
  step: 1,
  group: 0,
  generation: 0,
  stamp: 0,
  frame: 0,
  report: null,
};

let colonySetting = false;

function stopColonyPlay() {
  colony.playing = false;
  colony.sievePlaying = false;
  if (colony.frame) cancelAnimationFrame(colony.frame);
  if (colony.sieveFrame) cancelAnimationFrame(colony.sieveFrame);
  colony.frame = 0;
  colony.sieveFrame = 0;
}

function stepSieve(now) {
  if (!colony.sievePlaying) return;
  if (!colony.sieveStamp) colony.sieveStamp = now;
  colony.sieve = Math.min(1, (now - colony.sieveStamp) / 2800);
  renderColony();
  if (colony.sieve >= 1) {
    colony.sievePlaying = false;
    renderColony();
    return;
  }
  colony.sieveFrame = requestAnimationFrame(stepSieve);
}

function stepColony(now) {
  if (!colony.playing) return;
  if (!colony.stamp) colony.stamp = now;
  colony.generation = Math.floor((now - colony.stamp) / 220);
  renderColony();
  if (colony.generation >= (colony.maxGeneration ?? 0)) {
    colony.playing = false;
    if (colony.frame) cancelAnimationFrame(colony.frame);
    colony.frame = 0;
    renderColony();
    return;
  }
  colony.frame = requestAnimationFrame(stepColony);
}

function startColonyPlay() {
  if (!session.exports || colony.report?.status) return;
  if (motionReduced()) {
    colony.sieve = 1;
    colony.generation = 1_000_000;
    stopColonyPlay();
    renderColony();
    return;
  }
  colony.playing = true;
  colony.stamp = performance.now();
  colony.generation = 0;
  if (colony.frame) cancelAnimationFrame(colony.frame);
  colony.frame = requestAnimationFrame(stepColony);
  renderColony();
}

const COLONY_GROUPS = ["self", "other", "faded", "escaper"];

function advanceColonyStep() {
  colony.step = colony.step % 4 + 1;
  colony.group = colony.step - 1;
  renderColony();
}

function chooseColonyStar(index) {
  if (!Number.isInteger(index) || index < 1) return;
  colony.origin = index;
  colony.generation = 0;
  colony.stamp = 0;
  if (colony.calm || motionReduced()) {
    stopColonyPlay();
    renderColony();
    return;
  }
  startColonyPlay();
}

function colonyAxisCount(value, lang) {
  if (!session.exports) return formatGalaxyCount(value, lang);
  const oneIn = session.exports.ath_colony_one_in(value);
  if (session.exports.ath_colony_shows_count(value) === 0 && oneIn > 0) {
    return t(lang, "colony.chanceShort").replace("{n}", formatReadable(oneIn, lang));
  }
  return formatGalaxyCount(value, lang);
}

function formatColonyTimes(value, lang) {
  if (Math.abs(value - Math.round(value)) < 1e-4) return formatReadable(Math.round(value), lang);
  return formatGalaxyCount(value, lang);
}

function colonyLog(value, low, high) {
  if (value <= low) return 0;
  if (value >= high) return 1;
  return Math.log(value / low) / Math.log(high / low);
}

function bootColony() {
  if (!session.exports) return;
  const reduce = motionReduced();
  colony.calm = reduce;
  colony.choice = 1;
  colony.years = session.exports.ath_colony_life_min();
  colony.hopLy = 1000;
  colony.hopYears = 10000;
  colony.origin = 1;
  colony.step = 1;
  colony.group = 0;
  colony.sieve = 1;
  colony.generation = reduce ? 1_000_000 : 0;
  document.getElementById("colony-calm")?.setAttribute("aria-pressed", colony.calm ? "true" : "false");
  const exact = document.getElementById("colony-time-exact");
  if (exact) exact.value = "10000";
  stopColonyPlay();
  renderColony();
}

function renderColony() {
  const sieve = document.getElementById("colony-sieve");
  if (!sieve || !session.exports || colony.years == null) return;
  const model = callColony(session, colony.choice, colony.years, colony.hopLy, colony.hopYears, colony.origin);
  colony.group = colony.step - 1;
  const roleClass = ["is-self", "is-other", "is-faded", "is-escaper"];
  const signature = `${state.lang}|${colony.choice}`;
  if (sieve.dataset.signature !== signature) {
    sieve.dataset.signature = signature;
    sieve.tabIndex = 0;
    sieve.setAttribute("role", "button");
    sieve.replaceChildren(...model.cells.map((role) => h("span", {
      class: roleClass[role] || "is-self",
      dataset: { role: String(role) },
    })));
    sieve.setAttribute("aria-label", t(state.lang, "colony.sieveLabel"));
    document.getElementById("colony-sieve-legend")?.replaceChildren(
      h("li", {}, [h("span", { class: "swatch self" }), document.createTextNode(t(state.lang, "colony.legend.self"))]),
      h("li", {}, [h("span", { class: "swatch other" }), document.createTextNode(t(state.lang, "colony.legend.other"))]),
      h("li", {}, [h("span", { class: "swatch faded" }), document.createTextNode(t(state.lang, "colony.legend.faded"))]),
      h("li", {}, [h("span", { class: "swatch tc" }), document.createTextNode(t(state.lang, "colony.legend.survivor"))]),
    );
  }
  sieve.querySelectorAll("span").forEach((node) => {
    const role = Number(node.dataset.role);
    node.classList.toggle("is-lit", role === colony.group || role === 3);
    node.classList.toggle("is-quiet", role !== colony.group && role !== 3);
  });
  const caption = document.getElementById("colony-sieve-caption");
  if (caption) {
    caption.textContent = t(state.lang, "colony.sieveCaption")
      .replace("{escapers}", formatReadable(model.escapers, state.lang));
  }
  const step = document.getElementById("colony-step");
  if (step) {
    step.textContent = t(state.lang, "colony.step")
      .replace("{n}", String(colony.step))
      .replace("{name}", t(state.lang, `colony.fate.${colony.group}`));
  }
  const fate = document.getElementById("colony-fate");
  if (fate) {
    const count = [model.self, model.other, model.faded, model.escapers][colony.group];
    fate.textContent = t(state.lang, `colony.stepExplain.${colony.group}`)
      .replace("{n}", formatReadable(count, state.lang));
  }
  for (const button of document.querySelectorAll("#colony-counts [data-colony-fate]")) {
    const chosen = colony.group === Number(button.dataset.colonyFate);
    button.classList.toggle("is-current", chosen);
    button.setAttribute("aria-pressed", chosen ? "true" : "false");
  }
  const setText = (id, text) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  };
  setText("colony-self", formatReadable(model.self, state.lang));
  setText("colony-other", formatReadable(model.other, state.lang));
  setText("colony-faded", formatReadable(model.faded, state.lang));
  setText("colony-stay", formatReadable(model.escapers, state.lang));
  const sum = document.getElementById("colony-sum");
  if (sum) {
    sum.textContent = t(state.lang, "colony.sum").replace("{n}", formatReadable(model.self + model.other + model.faded + model.escapers, state.lang));
  }
  setText("colony-alive", model.showsCount
    ? formatGalaxyCount(model.alive, state.lang)
    : t(state.lang, "colony.chance").replace("{n}", formatReadable(model.oneIn, state.lang)));
  setText("colony-distance", model.distanceOk
    ? formatGalaxyDistance(model.distance, state.lang)
    : t(state.lang, "colony.noneNow"));
  setText("colony-life-readout", formatGalaxySpan(colony.years, state.lang));
  setText("colony-hop-readout", formatGalaxyDistance(colony.hopLy, state.lang));
  for (const button of document.querySelectorAll("[data-colony-choice]")) {
    const chosen = Number(button.dataset.colonyChoice) === colony.choice;
    button.setAttribute("aria-pressed", chosen ? "true" : "false");
    const count = session.exports.ath_colony_escapers(Number(button.dataset.colonyChoice));
    button.textContent = formatReadable(count, state.lang);
  }
  colonySetting = true;
  const life = document.getElementById("colony-life");
  if (life && document.activeElement !== life) {
    life.value = String(Math.round(session.exports.ath_colony_slider_of(colony.years) * 1000));
  }
  const hop = document.getElementById("colony-hop");
  if (hop && document.activeElement !== hop && colony.hopLy > 0) {
    const phase = colonyLog(colony.hopLy, session.exports.ath_colony_hop_min(), session.exports.ath_colony_hop_max());
    hop.value = String(Math.round(phase * 1000));
  }
  const time = document.getElementById("colony-time");
  if (time && document.activeElement !== time && colony.hopYears > 0) {
    const phase = colonyLog(colony.hopYears, session.exports.ath_colony_time_min(), session.exports.ath_colony_time_max());
    time.value = String(Math.round(phase * 1000));
  }
  colonySetting = false;
  const status = document.getElementById("colony-status");
  const fillOk = model.fillStatus === 0;
  if (!fillOk && colony.playing) {
    colony.playing = false;
    if (colony.frame) cancelAnimationFrame(colony.frame);
    colony.frame = 0;
  }
  if (status) {
    status.dataset.status = String(model.fillStatus);
    status.textContent = fillOk ? "" : t(state.lang, model.fillStatus === 2 ? "colony.status.2" : "colony.status.1");
  }
  setText("colony-hops", fillOk ? formatReadable(model.hops, state.lang) : "");
  setText("colony-fill", fillOk ? t(state.lang, "galaxy.years").replace("{n}", formatReadable(Math.round(model.fillYears), state.lang, "year")) : "");
  const punch = document.getElementById("colony-punch");
  if (punch) {
    punch.textContent = fillOk
      ? t(state.lang, "colony.punch")
        .replace("{life}", formatGalaxySpan(colony.years, state.lang))
        .replace("{times}", formatColonyTimes(model.times, state.lang))
      : "";
  }
  const sky = document.getElementById("colony-sky");
  const skyKey = `${state.lang}|${colony.origin}`;
  if (sky && sky.dataset.signature !== skyKey) {
    sky.dataset.signature = skyKey;
    sky.replaceChildren(svgEl("svg", {
      viewBox: "0 0 200 200",
      role: "img",
      "aria-label": t(state.lang, "colony.sky"),
    }, [
      svgEl("rect", { x: 0, y: 0, width: 200, height: 200, rx: 12, fill: "#101820" }),
      svgEl("circle", { cx: 100, cy: 100, r: 82, fill: "none", stroke: "#314863", "stroke-dasharray": "3 2" }),
      ...model.stars.map((star, index) => svgEl("g", {
        role: "button",
        tabindex: "0",
        "data-star": String(index + 1),
        "aria-label": t(state.lang, "colony.star").replace("{n}", String(index + 1)),
      }, [
        svgEl("circle", { class: "glow", cx: 100 + star.x * 82, cy: 100 - star.y * 82, r: 5, fill: "#f0b429" }),
        svgEl("circle", { class: "star", cx: 100 + star.x * 82, cy: 100 - star.y * 82, r: 3.2, fill: "#8fb4d4" }),
      ])),
    ]));
  }
  const reached = colony.generation;
  sky?.querySelectorAll("[data-star]").forEach((node, index) => {
    const star = model.stars[index];
    const lit = star && star.generation >= 0 && star.generation <= reached;
    const dot = node.querySelector("circle.star");
    const glow = node.querySelector("circle.glow");
    if (dot) dot.setAttribute("fill", lit ? "#f0b429" : "#8fb4d4");
    if (glow) glow.style.opacity = lit ? "0.55" : "0";
    const origin = Number(node.dataset.star) === colony.origin;
    node.setAttribute("aria-pressed", origin ? "true" : "false");
    if (dot && origin) dot.setAttribute("stroke", "#c8f25a");
    if (dot && origin) dot.setAttribute("stroke-width", "1.2");
    if (dot && !origin) dot.setAttribute("stroke", "none");
  });
  const note = document.getElementById("colony-sky-note");
  if (note) note.textContent = t(state.lang, "colony.skyNote").replace("{n}", String(colony.origin));
  const maxGeneration = model.stars.reduce((max, star) => Math.max(max, star.generation), 0);
  colony.maxGeneration = maxGeneration;
  const chart = document.getElementById("colony-chart");
  const chartKey = `${state.lang}|${colony.choice}`;
  if (chart && chart.dataset.signature !== chartKey) {
    chart.dataset.signature = chartKey;
    const left = 72;
    const top = 22;
    const width = 540;
    const height = 140;
    const low = model.samples[0].years;
    const high = model.samples.at(-1).years;
    const aliveValues = model.samples.map((sample) => sample.alive);
    const yLow = Math.min(...aliveValues);
    const yHigh = Math.max(...aliveValues);
    const yPos = (value) => {
      const span = Math.log(yHigh / yLow);
      if (!Number.isFinite(span) || span === 0) return 0.5;
      return Math.log(value / yLow) / span;
    };
    const points = model.samples.map((sample) => {
      const x = left + colonyLog(sample.years, low, high) * width;
      const y = top + (1 - yPos(sample.alive)) * height;
      return `${x},${y}`;
    }).join(" ");
    chart.replaceChildren(svgEl("svg", {
      viewBox: "0 0 640 210",
      role: "img",
      "aria-label": t(state.lang, "colony.axis.y"),
    }, [
      svgEl("text", { x: left, y: 14, fill: "#9fb0c3", "font-size": 12, text: t(state.lang, "colony.axis.y") }),
      svgEl("polyline", { points, fill: "none", stroke: "#d7e7ff", "stroke-width": 2 }),
      svgEl("circle", { id: "colony-now", r: 6, fill: "#c8f25a" }),
      svgEl("text", { x: left, y: 186, fill: "#d7e2ee", "font-size": 12, text: formatGalaxySpan(low, state.lang) }),
      svgEl("text", { x: left + width, y: 186, fill: "#d7e2ee", "font-size": 12, "text-anchor": "end", text: formatGalaxySpan(high, state.lang) }),
      svgEl("text", { x: 320, y: 204, fill: "#9fb0c3", "font-size": 12, "text-anchor": "middle", text: t(state.lang, "colony.axis.x") }),
      svgEl("text", { x: 8, y: top + 8, fill: "#d7e2ee", "font-size": 11, text: colonyAxisCount(yHigh, state.lang) }),
      svgEl("text", { x: 8, y: top + height, fill: "#d7e2ee", "font-size": 11, text: colonyAxisCount(yLow, state.lang) }),
    ]));
    document.getElementById("colony-chart-legend")?.replaceChildren(
      h("li", {}, [h("span", { class: "swatch shared" }), document.createTextNode(t(state.lang, "colony.legend.curve"))]),
    );
    chart.dataset.yLow = String(yLow);
    chart.dataset.yHigh = String(yHigh);
  }
  const now = chart?.querySelector("#colony-now");
  if (now && chart?.dataset.yLow) {
    const yLow = Number(chart.dataset.yLow);
    const yHigh = Number(chart.dataset.yHigh);
    const span = Math.log(yHigh / yLow);
    const yPos = !Number.isFinite(span) || span === 0 ? 0.5 : Math.log(model.alive / yLow) / span;
    now.setAttribute("cx", String(72 + colonyLog(colony.years, model.lifeMin, model.lifeMax) * 540));
    now.setAttribute("cy", String(22 + (1 - yPos) * 140));
  }
  const play = document.getElementById("colony-play");
  if (play) {
    play.dataset.state = colony.playing ? "playing" : "paused";
    play.textContent = t(state.lang, colony.playing ? "galaxy.pause" : "galaxy.play");
    play.setAttribute("aria-pressed", colony.playing ? "true" : "false");
  }
  const playing = document.getElementById("colony-playing");
  if (playing) playing.hidden = !colony.playing;
  const tech = document.getElementById("colony-tech");
  if (tech) {
    tech.textContent = t(state.lang, "colony.tech")
      .replace("{left}", formatReadable(model.left, state.lang))
      .replace("{self}", formatReadable(model.self, state.lang))
      .replace("{other}", formatReadable(model.other, state.lang))
      .replace("{window}", formatReadable(model.windowYears, state.lang, "year"))
      .replace("{radius}", formatReadable(model.radius, state.lang, "year"));
  }
  colony.report = {
    escapers: model.escapers,
    years: colony.years,
    alive: model.alive,
    distance: model.distanceOk ? model.distance : null,
    self: model.self,
    other: model.other,
    faded: model.faded,
    shown: model.showsCount ? "count" : "chance",
    oneIn: model.showsCount ? 0 : model.oneIn,
    step: colony.step,
    group: COLONY_GROUPS[colony.group] || "",
    play: colony.playing ? "playing" : "paused",
    calm: colony.calm ? "on" : "off",
    hopLy: colony.hopLy,
    hopYears: colony.hopYears,
    hops: fillOk ? model.hops : 0,
    fillYears: fillOk ? model.fillYears : 0,
    times: fillOk ? model.times : 0,
    origin: colony.origin,
    status: model.fillStatus,
  };
}

function refresh() {
  applyI18n();
  renderChapterNav();
  renderFilters();
  renderResults();
  renderReading(routeFromHash());
  renderSpectrum();
  renderGalaxy();
  renderColony();
  renderEnergy();
  renderHear();
  renderSixes();
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
  loadScientists();
}

main();
