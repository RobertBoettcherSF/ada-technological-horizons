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
import { formatCanonical, formatHeadlineYears, formatProbability, interpretOperand } from "./numbers.js";
import {
  clearFilters,
  closeAll,
  createState,
  expandCard,
  openAll,
  resetDemo,
  resetGrowth,
  resetLifetime,
  setDemoInput,
  setGrowthInput,
  setLanguage,
  setLifetimeInput,
  setQuery,
  setSort,
} from "./state.js";
import { callAddition, callGrowth, callLifetime, callRebalance, createSession, loadAdditionModule } from "./wasm-loader.js";

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

function renderChapterNav() {
  const list = document.getElementById("chapter-list");
  list.replaceChildren();
  for (const chapter of bookChapters) {
    const first = sections.find((section) => section.chapterId === chapter.id);
    const ready = chapter.id === "cosmic-civilisations" || chapter.id === "intellectronics";
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
    pager.replaceChildren();
    return;
  }
  panel.hidden = false;

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
  if (entry.id === "cosmic-civilisations/statistics-of-cosmic-civilisations") {
    body.append(h("p", {}, [h("a", { href: "#lifetime-card", dataset: { i18n: "lifetime.open" } })]));
  }
  if (entry.id === "intellectronics/return-to-earth") {
    body.append(h("p", {}, [h("a", { href: "#growth-card", dataset: { i18n: "growth.open" } })]));
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
  const quantity = document.getElementById("growth-quantity");
  const factor = document.getElementById("growth-factor");
  const samples = document.getElementById("growth-samples");
  const curve = document.getElementById("growth-curve");
  if (quantity) quantity.textContent = "";
  if (factor) factor.textContent = "";
  if (samples) samples.replaceChildren();
  if (curve) curve.replaceChildren();
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
  return "demo.loadFailed";
}

function renderGrowthCurve(samples) {
  const curve = document.getElementById("growth-curve");
  const body = document.getElementById("growth-samples");
  if (!curve || !body) return;
  curve.replaceChildren();
  body.replaceChildren();
  const maxTime = samples.reduce((max, sample) => Math.max(max, sample.time), 0);
  const maxQuantity = samples.reduce((max, sample) => Math.max(max, sample.quantity), 0);
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "currentColor");
  polyline.setAttribute("points", samples.map((sample) => {
    const x = maxTime === 0 ? 0 : (sample.time / maxTime) * 100;
    const y = maxQuantity === 0 ? 100 : 100 - (sample.quantity / maxQuantity) * 100;
    return `${x},${y}`;
  }).join(" "));
  curve.append(polyline);
  for (const sample of samples) {
    const row = document.createElement("tr");
    const time = document.createElement("td");
    const quantity = document.createElement("td");
    time.textContent = formatCanonical(sample.time);
    quantity.textContent = formatCanonical(sample.quantity);
    row.append(time, quantity);
    body.append(row);
  }
}

function updateGrowth() {
  const statusNode = document.getElementById("growth-status");
  const quantityNode = document.getElementById("growth-quantity");
  const factorNode = document.getElementById("growth-factor");
  if (!statusNode || !quantityNode || !factorNode) return;
  clearGrowthView();
  let code = "loading";
  let shown = false;
  if (session.phase === "loading") {
    code = "loading";
  } else if (session.phase !== "ready" || !session.exports) {
    code = "load-failed";
  } else {
    const initial = interpretOperand(state.growth.initial);
    const doubling = interpretOperand(state.growth.doubling);
    const elapsed = interpretOperand(state.growth.elapsed);
    if (initial.kind === "empty" || doubling.kind === "empty" || elapsed.kind === "empty") {
      code = "empty";
    } else if (initial.kind !== "value" || doubling.kind !== "value" || elapsed.kind !== "value") {
      code = "malformed";
    } else {
      const outcome = callGrowth(session, initial.value, doubling.value, elapsed.value);
      code = outcome.status;
      if (outcome.status === 0 && outcome.quantity !== null && outcome.factor !== null && outcome.samples) {
        try {
          quantityNode.textContent = formatCanonical(outcome.quantity);
          factorNode.textContent = formatCanonical(outcome.factor);
          quantityNode.dataset.exactQuantity = formatCanonical(outcome.quantity);
          factorNode.dataset.exactFactor = formatCanonical(outcome.factor);
          renderGrowthCurve(outcome.samples);
          shown = true;
        } catch {
          clearGrowthView();
          code = 5;
        }
      }
    }
  }
  if (!shown) {
    clearGrowthView();
    quantityNode.dataset.exactQuantity = "";
    factorNode.dataset.exactFactor = "";
  }
  statusNode.dataset.status = String(code);
  statusNode.textContent = t(state.lang, growthMessage(code));
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
  if (route === "lifetime-card" || route === "growth-card" || route === "about" || route === "content") {
    return "";
  }
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
  updateLifetime();
  updateGrowth();
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
}

function simulateFailure() {
  loadToken += 1;
  session.phase = "failed";
  session.exports = null;
  session.message = "simulated";
  updateDemo();
  updateLifetime();
  updateGrowth();
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
  });
  document.getElementById("growth-form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateGrowth();
  });
  document.getElementById("growth-reset").addEventListener("click", () => {
    state = resetGrowth(state);
    document.getElementById("growth-initial").value = state.growth.initial;
    document.getElementById("growth-doubling").value = state.growth.doubling;
    document.getElementById("growth-elapsed").value = state.growth.elapsed;
    updateGrowth();
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
