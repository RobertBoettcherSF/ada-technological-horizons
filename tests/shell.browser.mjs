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
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.textContent === "6500");
  assert.equal(await page.locator("#lifetime-result").getAttribute("data-exact-mean"), "6523");
  await page.waitForFunction(() => document.querySelector("#growth-quantity")?.textContent === "4");
  assert.equal(await page.locator("#growth-factor").textContent(), "4");
  assert.equal(await page.locator("#growth-eval-year").textContent(), "2056");
  assert.equal(await page.locator("#growth-end-year").textContent(), "2076");
  await page.waitForFunction(() => document.querySelector("#delay-one-way")?.textContent === "1000 years");
  assert.equal(await page.locator("#delay-round").textContent(), "2000 years");
  assert.equal(await page.locator("#delay-sources").evaluate((element) => element.open), false);
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
  assert.equal(
    await page.locator('[data-chapter-link="intellectronics"]').getAttribute("data-calculator"),
    "ready",
  );
  assert.equal(
    await page.locator('[data-chapter-link="phantomology"]').getAttribute("data-calculator"),
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
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.textContent === "8500");
  assert.equal(await page.locator("#lifetime-result").getAttribute("data-exact-mean"), "8523");
  assert.equal(await page.locator("#prob-2").inputValue(), "60");
  await shot(page, label, "lifetime-changed.png");
  await page.click("#lifetime-reset");
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.textContent === "6500");
  assert.equal(await page.locator("#years-4").inputValue(), "10000");
  assert.equal(await page.locator("#prob-1").inputValue(), "5");
  await page.fill("#prob-2", "30");
  await page.waitForFunction(() => document.querySelector("#prob-1").value === "15");
  assert.equal(await page.locator("#prob-2").inputValue(), "30");
  assert.equal(await page.locator("#prob-3").inputValue(), "25");
  assert.equal(await page.locator("#prob-4").inputValue(), "30");
  await shot(page, label, "lifetime-rebalanced.png");
  await page.fill("#prob-2", "60");
  await page.waitForFunction(() => document.querySelector("#prob-1").value === "5");
  assert.equal(await page.locator("#prob-3").inputValue(), "15");
  assert.equal(await page.locator("#prob-4").inputValue(), "20");
  await page.fill("#prob-1", "95");
  await page.waitForFunction(() => document.querySelector("#prob-2").value === "5");
  assert.equal(await page.locator("#prob-1").inputValue(), "95");
  assert.equal(await page.locator("#prob-3").inputValue(), "0");
  assert.equal(await page.locator("#prob-4").inputValue(), "0");
  await page.fill("#prob-1", "100");
  await page.waitForFunction(() => document.querySelector("#prob-2").value === "0");
  assert.equal(await page.locator("#prob-3").inputValue(), "0");
  assert.equal(await page.locator("#prob-4").inputValue(), "0");
  await page.fill("#prob-1", "0");
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.dataset.exactMean);
  const thirds = await page.evaluate(() => ({
    edited: document.getElementById("prob-1").value,
    others: [2, 3, 4].map((index) => Number(document.getElementById(`prob-${index}`).value)),
  }));
  assert.equal(thirds.edited, "0");
  assert.ok(Math.abs(thirds.others[0] + thirds.others[1] + thirds.others[2] - 100) < 1e-6);
  assert.ok(Math.abs(thirds.others[0] - thirds.others[1]) < 1e-6);
  await page.fill("#prob-2", "-1");
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.textContent === "");
  assert.equal(await page.locator("#prob-2").inputValue(), "-1");
  assert.equal(await page.locator("#prob-3").inputValue(), String(thirds.others[1]));
  await page.click("#lifetime-reset");
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.textContent === "6500");
  await page.fill("#prob-2", "abc");
  await page.waitForFunction(() => document.querySelector("#lifetime-result")?.textContent === "");
  assert.equal(await page.locator("#prob-1").inputValue(), "5");
  await page.click("#lifetime-reset");
  await page.waitForFunction(() => document.querySelector("#prob-2").value === "60");
  await page.locator("#growth-curve").scrollIntoViewIfNeeded();
  await shot(page, label, "growth-card.png");
  assert.equal(await page.locator("#growth-quantity").textContent(), "4");
  assert.equal(await page.locator("#growth-eval-year").textContent(), "2056");
  assert.equal(await page.locator("#growth-end-year").textContent(), "2076");
  assert.equal(await page.locator("#growth-end-year").getAttribute("data-extended"), "1");
  assert.equal(await page.locator("#growth-target-status").getAttribute("data-target-status"), "3");
  assert.ok((await page.locator("#growth-target-year").textContent()).trim() !== "");
  assert.match(await page.locator("#growth-target-text").textContent(), /reached in/i);
  assert.doesNotMatch(await page.locator("#growth-target-text").textContent(), /after this chart/i);
  const endpoint = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("#growth-samples tr")];
    const last = rows.at(-1);
    return {
      rows: rows.length,
      firstYear: rows[0]?.children[0]?.textContent,
      lastYear: last?.children[0]?.textContent,
      lastChosen: last?.children[1]?.textContent,
      lastBaseline: last?.children[2]?.textContent,
      xLabel: document.getElementById("growth-x-label").textContent,
      yLabel: document.getElementById("growth-y-label").textContent,
      xTicks: document.querySelectorAll("#growth-x-ticks span").length,
      yTicks: document.querySelectorAll("#growth-y-ticks span").length,
      series: document.querySelectorAll("#growth-curve polyline").length,
    };
  });
  assert.ok(endpoint.rows > 11);
  assert.equal(endpoint.firstYear, "2026");
  assert.equal(endpoint.lastYear, "2076");
  assert.notEqual(endpoint.lastChosen, "4");
  assert.notEqual(endpoint.lastBaseline, "4");
  assert.equal(endpoint.xLabel, "Calendar year");
  assert.equal(endpoint.yLabel, "Quantity (index)");
  assert.ok(endpoint.xTicks >= 2);
  assert.ok(endpoint.yTicks >= 2);
  assert.equal(endpoint.series, 2);
  assert.equal(await page.locator("#growth-curve").getAttribute("aria-hidden"), "true");
  assert.equal(await page.locator("#growth-table caption").count(), 1);
  const beforeLog = await page.locator("#growth-samples tr").nth(1).locator("td").nth(1).textContent();
  await page.locator("#growth-log").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#growth-curve")?.dataset.scale === "log");
  assert.equal(await page.locator("#growth-samples tr").nth(1).locator("td").nth(1).textContent(), beforeLog);
  assert.equal(await page.locator("#growth-quantity").textContent(), "4");
  await page.click("#growth-linear");
  await page.waitForFunction(() => document.querySelector("#growth-curve")?.dataset.scale === "linear");
  await page.fill("#growth-target", "4");
  await page.waitForFunction(() => document.querySelector("#growth-target-year")?.textContent === "2056");
  assert.equal(await page.locator("#growth-target-status").getAttribute("data-target-status"), "0");
  assert.equal(await page.locator("#growth-end-year").textContent(), "2056");
  assert.equal(await page.locator("#growth-end-year").getAttribute("data-extended"), "0");
  assert.equal(await page.locator("#growth-eval-year").textContent(), "2056");
  await page.locator("#growth-target-year").scrollIntoViewIfNeeded();
  await shot(page, label, "growth-target.png");
  await page.fill("#growth-doubling", "14");
  await page.waitForFunction(() => document.querySelector("#growth-target-year")?.textContent === "2054");
  assert.equal(await page.locator("#growth-end-year").textContent(), "2056");
  const compared = await page.evaluate(() => {
    const last = document.querySelector("#growth-samples tr:last-child");
    return {
      chosen: last.children[1].dataset.exact,
      baseline: last.children[2].dataset.exact,
      year: last.children[0].textContent,
      series: document.querySelectorAll("#growth-curve polyline").length,
    };
  });
  assert.equal(compared.year, "2056");
  assert.equal(compared.baseline, "4");
  assert.notEqual(compared.chosen, compared.baseline);
  assert.equal(compared.series, 2);
  await page.locator("#growth-curve").scrollIntoViewIfNeeded();
  await shot(page, label, "growth-edited.png");
  await page.fill("#growth-initial", "1");
  await page.fill("#growth-doubling", "14");
  await page.fill("#growth-elapsed", "30");
  await page.fill("#growth-start-year", "2026");
  await page.fill("#growth-target", "20");
  await page.waitForFunction(() => document.querySelector("#growth-end-year")?.textContent === "2087");
  assert.equal(await page.locator("#growth-quantity").textContent(), "4.41636");
  assert.equal(await page.locator("#growth-factor").textContent(), "4.41636");
  assert.equal(await page.locator("#growth-eval-year").textContent(), "2056");
  assert.equal(await page.locator("#growth-end-year").getAttribute("data-extended"), "1");
  assert.match(await page.locator("#growth-target-text").textContent(), /reached in/i);
  assert.doesNotMatch(await page.locator("#growth-target-text").textContent(), /after this chart/i);
  const reached = await page.evaluate(() => {
    const last = document.querySelector("#growth-samples tr:last-child");
    return {
      year: last.children[0].textContent,
      chosenExact: last.children[1].dataset.exact,
      headline: document.getElementById("growth-quantity").dataset.exact,
      series: document.querySelectorAll("#growth-curve polyline").length,
      evalLine: document.querySelectorAll("#growth-curve .eval-line").length,
      mark: document.querySelectorAll("#growth-curve .target-mark").length,
    };
  });
  assert.equal(reached.year, "2087");
  assert.notEqual(reached.chosenExact, reached.headline);
  assert.equal(reached.series, 2);
  assert.equal(reached.evalLine, 1);
  assert.equal(reached.mark, 1);
  await page.locator("#growth-curve").scrollIntoViewIfNeeded();
  await shot(page, label, "growth-extended.png");
  await page.fill("#growth-target", "4");
  await page.waitForFunction(() => document.querySelector("#growth-end-year")?.textContent === "2056");
  assert.equal(await page.locator("#growth-quantity").textContent(), "4.41636");
  assert.equal(await page.locator("#growth-factor").textContent(), "4.41636");
  assert.equal(await page.locator("#growth-eval-year").textContent(), "2056");
  assert.equal(await page.locator("#growth-target-year").textContent(), "2054");
  assert.equal(await page.locator("#growth-end-year").getAttribute("data-extended"), "0");
  assert.equal(await page.locator("#growth-curve .eval-line").count(), 0);
  await page.fill("#growth-doubling", "15");
  await page.fill("#growth-target", "1");
  await page.waitForFunction(() => document.querySelector("#growth-target-status")?.dataset.targetStatus === "1");
  assert.equal(await page.locator("#growth-target-year").textContent(), "2026");
  await page.fill("#growth-target", "0.5");
  await page.waitForFunction(() => document.querySelector("#growth-target-year")?.textContent === "2026");
  assert.equal(await page.locator("#growth-target-status").getAttribute("data-target-status"), "1");
  await page.fill("#growth-elapsed", "15");
  await page.waitForFunction(() => document.querySelector("#growth-quantity")?.textContent === "2");
  assert.equal(await page.locator("#growth-factor").textContent(), "2");
  assert.equal(await page.locator("#growth-end-year").textContent(), "2041");
  await page.fill("#growth-elapsed", "0");
  await page.waitForFunction(() => document.querySelector("#growth-quantity")?.textContent === "1");
  assert.equal(await page.locator("#growth-factor").textContent(), "1");
  assert.equal(await page.locator("#growth-end-year").textContent(), "2026");
  await page.fill("#growth-initial", "0");
  await page.fill("#growth-elapsed", "30");
  await page.fill("#growth-target", "10");
  await page.waitForFunction(() => document.querySelector("#growth-quantity")?.textContent === "0");
  assert.equal(await page.locator("#growth-factor").textContent(), "4");
  assert.equal(await page.locator("#growth-target-status").getAttribute("data-target-status"), "2");
  assert.equal((await page.locator("#growth-target-year").textContent()).trim(), "");
  assert.equal(await page.locator("#growth-end-year").textContent(), "2056");
  assert.equal(await page.locator("#growth-end-year").getAttribute("data-extended"), "0");
  assert.equal(await page.locator("#growth-log").isDisabled(), true);
  assert.equal(await page.locator("#growth-log-note").isVisible(), true);
  assert.match(await page.locator("#growth-log-note").textContent(), /zero/i);
  assert.equal(await page.locator("#growth-curve").getAttribute("data-scale"), "linear");
  await page.fill("#growth-initial", "1");
  await page.waitForFunction(() => document.querySelector("#growth-quantity")?.textContent === "4");
  await page.fill("#growth-target", "");
  await page.waitForFunction(() => document.querySelector("#growth-target-status")?.dataset.targetStatus === "empty");
  assert.equal((await page.locator("#growth-target-year").textContent()).trim(), "");
  assert.equal(await page.locator("#growth-quantity").textContent(), "4");
  await page.fill("#growth-target", "-3");
  await page.waitForFunction(() => document.querySelector("#growth-target-status")?.dataset.targetStatus === "4");
  assert.equal((await page.locator("#growth-target-year").textContent()).trim(), "");
  assert.equal(await page.locator("#growth-quantity").textContent(), "4");
  await page.fill("#growth-start-year", "2026.5");
  await page.waitForFunction(() => document.querySelector("#growth-status")?.dataset.status === "6");
  assert.equal(await page.locator("#growth-quantity").textContent(), "");
  assert.equal(await page.locator("#growth-samples tr").count(), 0);
  await page.fill("#growth-start-year", "10001");
  await page.waitForFunction(() => document.querySelector("#growth-status")?.dataset.status === "7");
  await page.fill("#growth-start-year", "2026");
  await page.fill("#growth-doubling", "0");
  await page.waitForFunction(() => document.querySelector("#growth-status")?.dataset.status === "4");
  assert.equal(await page.locator("#growth-quantity").textContent(), "");
  assert.equal(await page.locator("#growth-factor").textContent(), "");
  assert.equal(await page.locator("#growth-samples tr").count(), 0);
  assert.equal((await page.locator("#growth-target-year").textContent()).trim(), "");
  await page.fill("#growth-doubling", "-2");
  await page.waitForFunction(() => document.querySelector("#growth-status")?.dataset.status === "4");
  await page.fill("#growth-doubling", "15");
  await page.fill("#growth-elapsed", "-1");
  await page.waitForFunction(() => document.querySelector("#growth-status")?.dataset.status === "3");
  await page.fill("#growth-elapsed", "30");
  await page.fill("#growth-initial", "-1");
  await page.waitForFunction(() => document.querySelector("#growth-status")?.dataset.status === "2");
  await page.fill("#growth-initial", "NaN");
  await page.waitForFunction(() => document.querySelector("#growth-status")?.dataset.status === "1");
  await page.fill("#growth-initial", "");
  await page.waitForFunction(() => document.querySelector("#growth-status")?.dataset.status === "empty");
  await page.fill("#growth-initial", "1");
  await page.fill("#growth-elapsed", "20000");
  await page.fill("#growth-doubling", "1");
  await page.waitForFunction(() => document.querySelector("#growth-status")?.dataset.status === "5");
  assert.equal(await page.locator("#growth-quantity").textContent(), "");
  assert.equal(await page.locator("#growth-curve polyline").count(), 0);
  await page.click("#growth-reset");
  await page.waitForFunction(() => document.querySelector("#growth-quantity")?.textContent === "4");
  assert.equal(await page.locator("#growth-doubling").inputValue(), "15");
  assert.equal(await page.locator("#growth-start-year").inputValue(), "2026");
  assert.equal(await page.locator("#growth-target").inputValue(), "10");
  assert.equal(await page.locator("#growth-eval-year").textContent(), "2056");
  assert.equal(await page.locator("#growth-end-year").textContent(), "2076");
  assert.equal(await page.locator("#growth-log").getAttribute("aria-pressed"), "false");
  assert.equal(await page.locator("#lifetime-result").textContent(), "6500");
  await page.locator("#delay-card").scrollIntoViewIfNeeded();
  await shot(page, label, "delay-card.png");
  assert.equal(await page.locator("#delay-events li").count(), 3);
  assert.match(await page.locator("#delay-events li").first().textContent(), /0 s/);
  await page.click("#delay-form [data-preset='1']");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "384400");
  assert.equal(await page.locator("#delay-unit").inputValue(), "0");
  assert.match(await page.locator("#delay-one-way").textContent(), /s$/);
  assert.match(await page.locator("#delay-round").textContent(), /s$/);
  await page.click("#delay-form [data-preset='2']");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "225000000");
  assert.match(await page.locator("#delay-one-way").textContent(), /min$/);
  assert.match(await page.locator("#delay-note").textContent(), /not the distance today/i);
  await page.locator("#delay-card").scrollIntoViewIfNeeded();
  await shot(page, label, "delay-mars.png");
  await page.selectOption("#delay-unit", "2");
  await page.waitForFunction(() => document.querySelector("#delay-one-way")?.textContent?.includes("years"));
  await page.fill("#delay-distance", "0");
  await page.waitForFunction(() => document.querySelector("#delay-one-way")?.textContent === "0 s");
  assert.equal(await page.locator("#delay-round").textContent(), "0 s");
  assert.equal(await page.locator("#delay-events li").count(), 3);
  await page.fill("#delay-distance", "-4");
  await page.waitForFunction(() => document.querySelector("#delay-status")?.dataset.status === "2");
  assert.equal(await page.locator("#delay-one-way").textContent(), "");
  await page.fill("#delay-distance", "");
  await page.waitForFunction(() => document.querySelector("#delay-status")?.dataset.status === "empty");
  await page.fill("#delay-distance", "1e307");
  await page.waitForFunction(() => document.querySelector("#delay-status")?.dataset.status === "4");
  assert.equal(await page.locator("#delay-round").textContent(), "");
  await page.click("#delay-reset");
  await page.waitForFunction(() => document.querySelector("#delay-one-way")?.textContent === "1000 years");
  assert.equal(await page.locator("#delay-distance").inputValue(), "1000");
  assert.equal(await page.locator("#delay-unit").inputValue(), "2");
  assert.equal(await page.locator("#growth-quantity").textContent(), "4");
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
  assert.equal(await page.locator("#diag-version").textContent(), "0.1.7");
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
  assert.equal(await page.locator("#working-count").textContent(), "3");

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
  assert.equal(await page.locator("#working-count").textContent(), "3");

  if (!(await page.locator("#technical-details").evaluate((element) => element.open))) {
    await page.locator("#technical-details summary").focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector("#technical-details").open);
  }
  await page.fill("#operand-left", "8");
  await page.fill("#operand-right", "-3");
  await page.waitForFunction(() => document.querySelector("#addition-result")?.textContent === "5");
  const beforeLang = await page.locator("a.section-link").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  await page.fill("#growth-target", "2");
  await page.fill("#growth-elapsed", "15");
  await page.fill("#growth-start-year", "1990");
  await page.click("#growth-log");
  await page.waitForFunction(() => document.querySelector("#growth-end-year")?.textContent === "2005");
  await page.click("#close-all");
  await page.click("#open-all");
  assert.equal(await page.locator("#growth-elapsed").inputValue(), "15");
  assert.equal(await page.locator("#growth-start-year").inputValue(), "1990");
  assert.equal(await page.locator("#growth-quantity").textContent(), "2");
  await page.selectOption("#language", "de");
  await page.waitForFunction(() => document.documentElement.lang === "de");
  assert.equal(await page.locator("#growth-elapsed").inputValue(), "15");
  assert.equal(await page.locator("#growth-start-year").inputValue(), "1990");
  assert.equal(await page.locator("#growth-quantity").textContent(), "2");
  assert.equal(await page.locator("#growth-end-year").textContent(), "2005");
  assert.equal(await page.locator("#delay-distance").inputValue(), "1000");
  assert.equal(await page.locator("#delay-one-way").textContent(), "1000 Jahre");
  assert.equal(await page.locator("#growth-log").getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator("#growth-x-label").textContent(), "Kalenderjahr");
  assert.match(await page.locator("#growth-status").textContent(), /Ada/);
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
  await page.locator("#growth-card").scrollIntoViewIfNeeded();
  await shot(page, label, "growth-narrow.png");
  assert.ok((await overflow(page)) <= 1, "narrow growth");
  await page.locator("#delay-card").scrollIntoViewIfNeeded();
  await shot(page, label, "delay-narrow.png");
  assert.ok((await overflow(page)) <= 1, "narrow delay");
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
