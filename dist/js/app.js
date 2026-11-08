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
  groupEntries,
  neighbors,
  visibleEntries,
} from "./catalogue.js";
import { t } from "./messages.js";
import { formatCanonical, interpretOperand } from "./numbers.js";
import {
  clearFilters,
  closeAll,
  createState,
  expandCard,
  openAll,
  resetDemo,
  setDemoInput,
  setLanguage,
  setQuery,
  setSort,
} from "./state.js";
import { callAddition, createSession, loadAdditionModule } from "./wasm-loader.js";

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
  for (const link of document.querySelectorAll("[data-chapter-link]")) {
    const chapter = chapterById(link.dataset.chapterLink);
    link.textContent = chapter.title[state.lang];
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

function renderChapterNav() {
  const list = document.getElementById("chapter-list");
  list.replaceChildren();
  for (const chapter of bookChapters) {
    const first = sections.find((section) => section.chapterId === chapter.id);
    list.append(
      h("li", {}, [
        h("a", {
          href: `#${chapter.id}`,
          text: chapter.title[state.lang],
          dataset: { chapterLink: chapter.id, chapterKind: chapter.kind, firstSection: first.id },
        }),
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
    title.textContent = t(state.lang, "reading.prompt");
    summary.textContent = "";
    meta.textContent = "";
    pager.replaceChildren();
    return;
  }

  const chapter = chapterById(route);
  if (chapter && chapter.kind !== "technical") {
    title.textContent = chapter.title[state.lang];
    meta.textContent = `${t(state.lang, "reading.chapter")} · ${chapter.id}`;
    summary.textContent =
      chapter.kind === "closing" ? t(state.lang, "summary.closing") : t(state.lang, "summary.planned");
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
  if (entry.id === "technical/binary64-addition") {
    body.append(renderDemo());
  }
  return h("article", { class: "card", id: domId(entry.id), dataset: { sectionId: entry.id } }, [
    h("div", { class: "card-bar" }, [button, h("h3", {}, [link]), badge]),
    body,
  ]);
}

function renderDemo() {
  const form = h("form", { id: "addition-form" });
  const leftLabel = h("label", { for: "operand-left", dataset: { i18n: "demo.left" } });
  const left = h("input", {
    id: "operand-left",
    type: "text",
    inputmode: "decimal",
    autocomplete: "off",
    spellcheck: "false",
    "aria-describedby": "decimal-note",
  });
  left.value = state.demo.left;
  const rightLabel = h("label", { for: "operand-right", dataset: { i18n: "demo.right" } });
  const right = h("input", {
    id: "operand-right",
    type: "text",
    inputmode: "decimal",
    autocomplete: "off",
    spellcheck: "false",
    "aria-describedby": "decimal-note",
  });
  right.value = state.demo.right;
  form.append(
    h("div", { class: "operands" }, [
      h("div", {}, [leftLabel, left]),
      h("div", {}, [rightLabel, right]),
    ]),
    h("p", { id: "decimal-note", class: "note", dataset: { i18n: "demo.separator" } }),
    h("p", { class: "note", dataset: { i18n: "demo.contract" } }),
    h("div", { class: "button-row" }, [
      h("button", { type: "submit", dataset: { i18n: "demo.compute" } }),
      h("button", { type: "button", id: "reset-demo", class: "secondary", dataset: { i18n: "demo.reset" } }),
      h("button", { type: "button", id: "retry-load", class: "secondary", dataset: { i18n: "demo.retry" } }),
      h("button", { type: "button", id: "simulate-failure", class: "secondary", dataset: { i18n: "demo.simulate" } }),
    ]),
    h("p", {}, [h("span", { dataset: { i18n: "demo.result" } }), h("span", { text: " " }), h("output", { id: "addition-result", for: "operand-left operand-right" })]),
    h("p", { id: "addition-status", role: "status", "aria-live": "polite" }),
  );
  return form;
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
    updateDiagnostics();
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
}

function updateDiagnostics() {
  document.getElementById("diag-version").textContent = buildInfo.version;
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
  updateDiagnostics();
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
  const route = decodeURIComponent(location.hash.replace(/^#/, ""));
  return route;
}

function showRoute(route, options = {}) {
  renderReading(route);
  if (!route) {
    return;
  }
  const entry = entries.find((item) => item.id === route);
  if (entry) {
    state = expandCard(state, entry.chapterId, entry.id);
    renderResults();
    renderReading(route);
  }
  if (options.focus) {
    const title = document.getElementById("reading-title");
    title.focus();
  }
  const target = document.getElementById(route.startsWith("chapter-") ? route : "reading");
  target?.scrollIntoView({ block: "nearest" });
}

async function boot() {
  const token = ++loadToken;
  session.phase = "loading";
  session.exports = null;
  session.mime = "";
  updateDemo();
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
}

function simulateFailure() {
  loadToken += 1;
  session.phase = "failed";
  session.exports = null;
  session.message = "simulated";
  updateDemo();
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
    renderResults();
  });
  document.getElementById("clear-filters").addEventListener("click", () => {
    state = clearFilters(state);
    document.getElementById("search").value = "";
    document.getElementById("sort").value = "reading";
    for (const input of document.querySelectorAll("#filters input")) {
      input.checked = false;
    }
    renderResults();
    renderReading(routeFromHash());
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
    if (event.target.id === "reset-demo") {
      state = resetDemo(state);
      const left = document.getElementById("operand-left");
      const right = document.getElementById("operand-right");
      if (left) left.value = state.demo.left;
      if (right) right.value = state.demo.right;
      updateDemo();
    }
    if (event.target.id === "simulate-failure") {
      simulateFailure();
    }
    if (event.target.id === "retry-load") {
      boot();
    }
  });
  results.addEventListener("input", (event) => {
    if (event.target.id === "operand-left") {
      state = setDemoInput(state, "left", event.target.value);
      updateDemo();
    }
    if (event.target.id === "operand-right") {
      state = setDemoInput(state, "right", event.target.value);
      updateDemo();
    }
  });
  results.addEventListener("submit", (event) => {
    if (event.target.id === "addition-form") {
      event.preventDefault();
      updateDemo();
    }
  });
  window.addEventListener("hashchange", () => {
    showRoute(routeFromHash(), { focus: true });
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
