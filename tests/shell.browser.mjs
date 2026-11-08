import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { sections } from "../web/js/catalogue-data.js";
import { t } from "../web/js/messages.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shots = path.join(root, "docs", "review");
fs.mkdirSync(shots, { recursive: true });

function startServer(port, wasmType) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, "tools", "static-server.mjs"), path.join(root, "dist")], {
      env: { ...process.env, PORT: String(port), WASM_CONTENT_TYPE: wasmType },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let settled = false;
    let log = "";
    const onData = (chunk) => {
      log += chunk.toString();
      if (!settled && log.includes("serving ")) {
        settled = true;
        resolve(child);
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("exit", (code) => {
      if (!settled) {
        reject(new Error(`server exited ${code}: ${log}`));
      }
    });
  });
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function shot(page, label, name) {
  if (label !== "primary") {
    return;
  }
  await page.screenshot({ path: path.join(shots, name) });
}

async function exercise(page, label) {
  await page.goto(page.url() === "about:blank" ? page.context()._base : page.context()._base, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector("#addition-result")?.textContent === "5");
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.textContent === "6523");
  assert.equal(await page.locator("#technical-details").evaluate((element) => element.open), false);
  assert.equal(await page.locator("#header-version").isVisible(), true);
  const layout = await page.evaluate(() => {
    const form = document.getElementById("addition-form");
    const details = document.getElementById("technical-details");
    const card = document.getElementById("lifetime-card");
    const catalogue = document.getElementById("catalogue");
    return {
      additionInsideDetails: details.contains(form),
      cardBeforeCatalogue: Boolean(card.compareDocumentPosition(catalogue) & Node.DOCUMENT_POSITION_FOLLOWING),
    };
  });
  assert.equal(layout.additionInsideDetails, true);
  assert.equal(layout.cardBeforeCatalogue, true);
  assert.equal(
    await page.locator('[data-chapter-link="cosmic-civilisations"]').getAttribute("data-calculator"),
    "ready",
  );
  const blurbs = await page.locator(".tile-blurb").evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  assert.equal(blurbs.length, 10);
  assert.ok(blurbs.every((blurb) => blurb.length > 12));
  await page.locator("#technical-details summary").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#technical-details").open);
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#technical-details").open === false);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, label, "desktop-top.png");
  await shot(page, label, "opening.png");
  await page.locator("#lifetime-card").scrollIntoViewIfNeeded();
  await shot(page, label, "lifetime-card.png");
  await page.fill("#years-4", "20000");
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.textContent === "8523");
  await shot(page, label, "lifetime-changed.png");
  await page.click("#lifetime-reset");
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.textContent === "6523");
  assert.equal(await page.locator("#years-4").inputValue(), "10000");
  await page.locator("#technical-details summary").scrollIntoViewIfNeeded();
  await shot(page, label, "technical-collapsed.png");
  await page.locator("#technical-details summary").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#technical-details").open);
  await page.locator("#addition-form").scrollIntoViewIfNeeded();
  await shot(page, label, "demo-result.png");
  await shot(page, label, "demo-card.png");
  await page.locator("#technical-details summary").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#technical-details").open === false);
  assert.equal(await page.locator("#diag-version").textContent(), "0.1.2");
  assert.equal(await page.locator("#diag-execution").getAttribute("data-execution"), "ready");
  assert.match(await page.locator("#diag-mime").textContent(), /wasm|octet-stream/);
  const calls = Number(await page.locator("#diag-calls").textContent());
  assert.ok(calls > 0);

  const bookLinks = await page.locator('[data-chapter-kind="book"]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("href")),
  );
  assert.deepEqual(bookLinks, [
    "#dilemmas",
    "#two-evolutions",
    "#cosmic-civilisations",
    "#intellectronics",
    "#prolegomena-to-omnipotence",
    "#phantomology",
    "#creating-worlds",
    "#a-lampoon-of-evolution",
  ]);

  const hrefs = await page.locator("a.section-link").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  const expected = new Set(sections.map((section) => `#${section.id}`).concat(["#technical/binary64-addition"]));
  assert.deepEqual(new Set(hrefs), expected);

  await page.locator('a[href="#dilemmas"]').focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#reading")?.dataset.route === "dilemmas");
  const dilemmaLinks = await page.locator("#reading-pager a.section-link").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("href")),
  );
  assert.deepEqual(dilemmaLinks, ["#dilemmas/part-1", "#dilemmas/part-2", "#dilemmas/part-3"]);

  await page.locator('a[href="#dilemmas/part-1"]').first().focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#reading")?.dataset.route === "dilemmas/part-1");
  assert.equal(await page.locator("#reading-prev").getAttribute("aria-disabled"), "true");
  assert.equal(await page.locator("#reading-next").getAttribute("href"), "#dilemmas/part-2");

  await page.locator('a[href="#cosmic-civilisations/formulating-the-method"]').first().focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#reading")?.dataset.route === "cosmic-civilisations/formulating-the-method");
  const bookNext = await page.locator("#reading-next").getAttribute("href");
  assert.equal(bookNext, "#cosmic-civilisations/statistics-of-cosmic-civilisations");
  const tools = page.locator("#catalogue-tools");
  if (!(await tools.evaluate((element) => element.open))) {
    await tools.locator("summary").focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector("#catalogue-tools").open);
  }
  await page.selectOption("#sort", "title");
  assert.equal(await page.locator("#reading-next").getAttribute("href"), bookNext);
  await page.selectOption("#sort", "calculators");
  assert.equal(await page.locator("#reading-next").getAttribute("href"), bookNext);

  await page.locator('input[data-filter-category="chapter"][value="dilemmas"]').check();
  await page.locator('input[data-filter-category="type"][value="planned"]').check();
  await page.waitForFunction(() => document.querySelector("#result-count")?.textContent === "3");
  assert.equal(await page.locator("#active-count").textContent(), "2");
  assert.equal(await page.locator("#working-count").textContent(), "1");

  await page.locator('input[data-filter-category="type"][value="planned"]').uncheck();
  await page.locator('input[data-filter-category="type"][value="calculator"]').check();
  await page.waitForFunction(() => document.querySelector("#result-count")?.textContent === "0");
  assert.equal(await page.locator("#no-results").count(), 1);
  await page.locator('input[data-filter-category="type"][value="calculator"]').uncheck();
  await page.locator('input[data-filter-category="type"][value="planned"]').check();
  await page.waitForFunction(() => document.querySelector("#result-count")?.textContent === "3");

  await page.fill("#search", "  part  ");
  await page.waitForFunction(() => document.querySelector("#active-count")?.textContent === "3");
  await page.click("#clear-filters");
  await page.waitForFunction(() => document.querySelector("#result-count")?.textContent === "74");
  assert.equal(await page.locator("#sort").inputValue(), "reading");
  assert.equal(await page.locator("#search").inputValue(), "");
  assert.equal(await page.locator("#active-count").textContent(), "0");
  assert.equal(await page.locator("#working-count").textContent(), "1");

  if (!(await page.locator("#technical-details").evaluate((element) => element.open))) {
    await page.locator("#technical-details summary").focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector("#technical-details").open);
  }
  await page.fill("#operand-left", "8");
  await page.fill("#operand-right", "-3");
  await page.waitForFunction(() => document.querySelector("#addition-result")?.textContent === "5");
  const beforeLang = await page.locator("a.section-link").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  await page.selectOption("#language", "de");
  await page.waitForFunction(() => document.documentElement.lang === "de");
  assert.equal(await page.locator("#operand-left").inputValue(), "8");
  assert.equal(await page.locator("#operand-right").inputValue(), "-3");
  assert.equal(await page.locator("#addition-result").textContent(), "5");
  const afterLang = await page.locator("a.section-link").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  assert.deepEqual(afterLang, beforeLang);
  assert.equal(await page.locator("h1").textContent(), t("de", "app.title"));
  assert.match(await page.locator("#addition-status").textContent(), /Ada/);

  await page.click("#reset-demo");
  await page.waitForFunction(() => document.querySelector("#addition-result")?.textContent === "5");
  assert.equal(await page.locator("#operand-left").inputValue(), "2");
  assert.equal(await page.locator("#operand-right").inputValue(), "3");
  assert.equal(await page.locator("#language").inputValue(), "de");

  await page.fill("#operand-left", "9");
  await page.click("#close-all");
  await page.click("#open-all");
  assert.equal(await page.locator("#operand-left").inputValue(), "9");
  assert.equal(await page.locator("#language").inputValue(), "de");

  await page.fill("#operand-left", "0");
  await page.fill("#operand-right", "0");
  await page.waitForFunction(() => document.querySelector("#addition-result")?.textContent === "0");
  await page.fill("#operand-left", "-2");
  await page.fill("#operand-right", "-3");
  await page.waitForFunction(() => document.querySelector("#addition-result")?.textContent === "-5");

  await page.fill("#operand-left", "   ");
  await page.waitForFunction(() => document.querySelector("#addition-status")?.dataset.status === "empty");
  assert.equal(await page.locator("#addition-result").textContent(), "");

  await page.fill("#operand-left", "2+3");
  await page.fill("#operand-right", "1");
  await page.waitForFunction(() => document.querySelector("#addition-status")?.dataset.status === "malformed");
  assert.equal(await page.locator("#addition-result").textContent(), "");

  await page.fill("#operand-left", "NaN");
  await page.waitForFunction(() => document.querySelector("#addition-status")?.dataset.status === "1");
  assert.equal(await page.locator("#addition-result").textContent(), "");

  await page.fill("#operand-left", "1.7976931348623157e+308");
  await page.fill("#operand-right", "1.7976931348623157e+308");
  await page.waitForFunction(() => document.querySelector("#addition-status")?.dataset.status === "2");
  assert.equal(await page.locator("#addition-result").textContent(), "");

  await page.click("#reset-demo");
  await page.waitForFunction(() => document.querySelector("#addition-result")?.textContent === "5");
  await page.click("#simulate-failure");
  await page.waitForFunction(() => document.querySelector("#addition-status")?.dataset.status === "load-failed");
  assert.equal(await page.locator("#addition-result").textContent(), "");
  assert.equal(await page.locator("#diag-execution").getAttribute("data-execution"), "failed");
  await shot(page, label, "load-failure.png");
  await page.click("#retry-load");
  await page.waitForFunction(() => document.querySelector("#addition-result")?.textContent === "5");
  assert.equal(await page.locator("#diag-execution").getAttribute("data-execution"), "ready");

  await page.selectOption("#language", "fr");
  assert.equal(await page.locator(".credit").first().textContent(), t("fr", "app.credit"));
  await page.selectOption("#language", "es");
  assert.equal(await page.locator("#clear-filters").textContent(), t("es", "catalogue.clear"));
  await page.selectOption("#language", "en-GB");
  assert.equal(
    await page.locator(".credit").first().textContent(),
    "An independent interactive exploration inspired by Stanisław Lem’s Summa Technologiae.",
  );

  await page.setViewportSize({ width: 1280, height: 900 });
  assert.ok((await overflow(page)) <= 1, "desktop overflow");
  await page.locator("#addition-form").scrollIntoViewIfNeeded();
  await shot(page, label, "desktop-demo.png");

  await page.setViewportSize({ width: 320, height: 800 });
  assert.ok((await overflow(page)) <= 1, "narrow overflow");
  await page.locator("#lifetime-card").scrollIntoViewIfNeeded();
  await shot(page, label, "narrow.png");
  await page.locator("#addition-form button[type=submit]").scrollIntoViewIfNeeded();
  assert.equal(await page.locator("#addition-form button[type=submit]").isVisible(), true);
}

const port = Number(process.env.PORT ?? 8765);
const server = await startServer(port, process.env.WASM_CONTENT_TYPE ?? "application/wasm");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", (error) => console.error("PAGEERROR", error));
  page.context()._base = `http://127.0.0.1:${port}/`;
  await exercise(page, process.env.SHOT_LABEL ?? "primary");
  console.log("BROWSER OK");
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
