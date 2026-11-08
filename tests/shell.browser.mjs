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

async function shotElement(page, label, name, selector) {
  if (label !== "primary") {
    return;
  }
  await page.locator(selector).screenshot({ path: path.join(shots, name) });
}

async function assertLegendMatches(page) {
  const curves = await page.locator("#throughput-plot polyline[data-kind]").evaluateAll((nodes) => nodes.map((node) => {
    const style = getComputedStyle(node);
    return {
      kind: node.dataset.kind,
      series: [...node.classList].find((name) => name.startsWith("series-") && name !== "series-chosen"),
      chosen: node.classList.contains("series-chosen"),
      stroke: style.stroke,
      dash: style.strokeDasharray,
      width: style.strokeWidth,
    };
  }));
  const entries = await page.locator("#throughput-legend li[data-kind]").evaluateAll((nodes) => nodes.map((node) => {
    const line = node.querySelector("line:not(.series-halo)");
    const style = getComputedStyle(line);
    return {
      kind: node.dataset.kind,
      role: node.dataset.role,
      series: [...line.classList].find((name) => name.startsWith("series-") && name !== "series-chosen"),
      chosen: line.classList.contains("series-chosen"),
      stroke: style.stroke,
      dash: style.strokeDasharray,
      width: style.strokeWidth,
      text: node.textContent,
    };
  }));
  assert.equal(entries.length, curves.length);
  for (const curve of curves) {
    const entry = entries.find((item) => item.kind === curve.kind);
    assert.ok(entry, curve.kind);
    assert.equal(entry.series, curve.series);
    assert.equal(entry.stroke, curve.stroke);
    assert.equal(entry.dash, curve.dash);
    assert.equal(entry.width, curve.width);
    assert.equal(entry.chosen, curve.chosen);
    assert.equal(entry.role, curve.chosen ? "chosen" : "reference");
    assert.match(entry.text, curve.chosen ? /\(.*\)/ : /reference|Referenz|referencia|référence/);
  }
  const targetCount = await page.locator("#throughput-plot .target-line").count();
  assert.equal(await page.locator("#throughput-legend li[data-role='target']").count(), targetCount > 0 ? 1 : 0);
  if (targetCount > 0) {
    const plotStroke = await page.locator("#throughput-plot .target-line").evaluate((node) => getComputedStyle(node).stroke);
    const legendStroke = await page.locator("#throughput-legend .target-line").evaluate((node) => getComputedStyle(node).stroke);
    const plotDash = await page.locator("#throughput-plot .target-line").evaluate((node) => getComputedStyle(node).strokeDasharray);
    const legendDash = await page.locator("#throughput-legend .target-line").evaluate((node) => getComputedStyle(node).strokeDasharray);
    assert.equal(legendStroke, plotStroke);
    assert.equal(legendDash, plotDash);
    assert.match(await page.locator("#throughput-legend li[data-role='target']").innerText(), /\d/);
  }
  const marks = await page.locator("#throughput-plot .target-mark").count();
  assert.equal(await page.locator("#throughput-legend li[data-role='reached']").count(), marks > 0 ? 1 : 0);
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
  assert.equal(await page.locator("#debug-dialog").evaluate((node) => node.open), false);
  assert.equal(await page.locator("#debug-toggle").isVisible(), true);
  assert.equal(await page.locator("#debug-toggle").textContent(), "Debug");
  await page.locator("#debug-toggle").click();
  await page.waitForFunction(() => document.querySelector("#debug-dialog")?.open);
  assert.equal(await page.locator("#technical-details").evaluate((node) => node.open), false);
  assert.equal(await page.locator("#debug-toggle").getAttribute("aria-expanded"), "true");
  assert.equal(await page.locator("#debug-expectation").evaluate((node) => document.activeElement === node), true);
  await page.fill("#debug-expectation", "The selected rate should lead the chart");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#debug-save"),
  ]);
  const report = fs.readFileSync(await download.path(), "utf8");
  assert.match(report, /Release: 0\.1\.17/);
  assert.match(report, /Preset: historical/);
  assert.match(report, /The selected rate should lead the chart/);
  assert.match(report, /Headline: 6500/);
  assert.doesNotMatch(report, /localStorage|cookie|password/i);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.querySelector("#debug-dialog")?.open === false);
  assert.equal(await page.locator("#debug-toggle").evaluate((node) => document.activeElement === node), true);
  await page.locator("#years-4").focus();
  await page.keyboard.press("F9");
  await page.waitForFunction(() => document.querySelector("#debug-dialog")?.open);
  assert.equal(await page.locator("#technical-details").evaluate((node) => node.open), false);
  assert.equal(await page.locator("#years-4").inputValue(), "10000");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.querySelector("#debug-dialog")?.open === false);
  assert.equal(await page.locator("#lifetime-result").textContent(), "6500");
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
  await page.locator("#throughput-card").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "400 s");
  assert.equal(await page.locator("#throughput-total").textContent(), "10000 bits");
  assert.equal(await page.locator("#throughput-ratio").textContent(), "40");
  assert.equal(await page.locator("#throughput-compare li").nth(1).textContent(), "Bacterial figure — at least 1000 bits/s — at most 10 s");
  assert.equal(await page.locator("#throughput-compare li").first().textContent(), "Human figure (chosen) — 25 bits/s — 400 s");
  const curves = await page.locator("#throughput-plot polyline[data-kind]").evaluateAll((nodes) => nodes.map((node) => node.dataset.rate));
  assert.deepEqual(curves, ["25", "1000"]);
  assert.equal(await page.locator("#throughput-plot .target-line").count(), 1);
  assert.equal(await page.locator("#throughput-plot .target-mark").count(), 2);
  await assertLegendMatches(page);
  assert.equal(await page.locator(".near-zero-label").count(), 0);
  assert.equal(await page.locator("#throughput-legend li[data-kind='1']").innerText(), "Human figure (chosen)");
  assert.equal(await page.locator("#throughput-legend li[data-kind='2']").innerText(), "Bacterial figure (reference)");
  assert.match(await page.locator("#throughput-legend li[data-role='target']").innerText(), /Target — 10000 bits/);
  assert.equal(await page.locator("#throughput-legend li[data-role='reached']").innerText(), "Target reached");
  assert.equal(await page.locator("#throughput-preset-page").textContent(), "Lem’s example (default)");
  assert.match(await page.locator("#throughput-preset-help").textContent(), /10,000 bits, 25 bits\/s and 400 s/);
  assert.equal(await page.locator("#throughput-x-label").textContent(), t("en-GB", "throughput.axisTime"));
  assert.equal(await page.locator("#throughput-y-label").textContent(), t("en-GB", "throughput.axisInfo"));
  await shotElement(page, label, "throughput-default-plot.png", "#throughput-plot-wrap");
  assert.equal(await page.locator("#throughput-link-time").textContent(), "10 µs");
  assert.equal(await page.locator("#throughput-link-rate").textContent(), "1000000000 bits/s");
  assert.match(await page.locator("#throughput-link").textContent(), /not machine understanding/);
  await page.click("#throughput-log");
  await page.waitForFunction(() => document.querySelector("#throughput-plot")?.dataset.scale === "log");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 2);
  assert.match(await page.locator("#throughput-scale-note").textContent(), /not the 40-to-1/);
  assert.equal(await page.locator("#throughput-plot").getAttribute("data-scale"), "log");
  await assertLegendMatches(page);
  const logPoints = await page.locator("#throughput-plot polyline[data-kind]").first().getAttribute("points");
  assert.doesNotMatch(logPoints, /^0,100/);
  await page.click("#throughput-linear");
  await page.waitForFunction(() => document.querySelectorAll("#throughput-plot polyline[data-kind]").length === 2);
  await page.click("#throughput-preset-link");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "10 µs");
  assert.equal(await page.locator("#throughput-rate-unit").inputValue(), "3");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 2);
  assert.equal(await page.locator("#throughput-ratio").textContent(), "40000000");
  assert.equal(await page.locator("#throughput-ratio-label").textContent(), "Chosen rate ÷ human figure");
  assert.match(await page.locator("#throughput-note").textContent(), /1000BASE-T/);
  assert.doesNotMatch(await page.locator("#throughput-note").textContent(), /your assumption/);
  assert.match(await page.locator("#throughput-compare").textContent(), /1000000000 bits\/s/);
  assert.match(await page.locator("#throughput-compare").textContent(), /25 bits\/s — 400 s/);
  assert.doesNotMatch(await page.locator("#throughput-compare").textContent(), /Bacterial/);
  assert.doesNotMatch(await page.locator("#throughput-legend").innerText(), /Bacterial/);
  await assertLegendMatches(page);
  assert.equal(await page.locator("#throughput-legend li[data-kind='3']").getAttribute("data-role"), "chosen");
  assert.equal(await page.locator("#throughput-legend li[data-kind='1']").getAttribute("data-role"), "reference");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind='1']").getAttribute("data-display"), "near-zero");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind='3']").getAttribute("data-display"), null);
  const humanYs = (await page.locator("#throughput-plot polyline[data-kind='1']").getAttribute("points")).split(" ").map((pair) => Number(pair.split(",")[1]));
  assert.ok(Math.max(...humanYs) < 98);
  assert.ok(Math.min(...humanYs) > 80);
  assert.equal(await page.locator(".near-zero-label[data-kind='1']").innerText(), "Human figure — near zero, not to scale");
  assert.match(await page.locator("#throughput-legend li[data-kind='1']").innerText(), /near zero, not to scale/);
  assert.match(await page.locator("#throughput-compare li").nth(1).innerText(), /25 bits\/s — 400 s — after this chart/);
  const humanStroke = await page.locator("#throughput-plot polyline[data-kind='1']").evaluate((node) => getComputedStyle(node).stroke);
  const legendStroke = await page.locator("#throughput-legend li[data-kind='1'] line:not(.series-halo)").evaluate((node) => getComputedStyle(node).stroke);
  assert.equal(humanStroke, legendStroke);
  assert.equal(humanStroke, "rgb(200, 242, 90)");
  await shotElement(page, label, "throughput-machine-visible.png", "#throughput-chart-block");
  assert.equal(await page.locator("#throughput-compare li").nth(1).getAttribute("data-inside"), "false");
  assert.match(await page.locator("#throughput-compare li").nth(1).textContent(), /after this chart/);
  assert.equal(await page.locator("#throughput-compare li").first().getAttribute("data-inside"), "true");
  await shotElement(page, label, "throughput-machine-plot.png", "#throughput-plot-wrap");
  const linkLabel = await page.locator("#throughput-link .field-label").first().evaluate((node) => getComputedStyle(node).color);
  assert.equal(linkLabel, "rgb(143, 208, 222)");
  await page.click("#throughput-reset");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "400 s");
  assert.match(await page.locator("[data-i18n='throughput.limit']").textContent(), /unlike/);
  await shot(page, label, "throughput-card.png");
  await page.click("#throughput-preset-human");
  await page.waitForFunction(() => document.querySelectorAll("#throughput-plot polyline[data-kind]").length === 1);
  assert.equal(await page.locator("#throughput-time").textContent(), "400 s");
  assert.equal(await page.locator("#throughput-ratio-label").textContent(), "Bacterial figure ÷ this rate");
  assert.equal(await page.locator("#throughput-preset-human").getAttribute("aria-pressed"), "true");
  await assertLegendMatches(page);
  assert.equal(await page.locator("#throughput-legend li[data-kind]").count(), 1);
  assert.equal(await page.locator("#throughput-legend li[data-kind='1']").getAttribute("data-role"), "chosen");
  assert.equal(await page.locator("#throughput-legend li[data-kind='2']").count(), 0);
  await page.click("#throughput-preset-bacterial");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "at most 10 s");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 2);
  assert.equal(await page.locator("#throughput-compare li").first().textContent(), "Bacterial figure (chosen) — at least 1000 bits/s — at most 10 s");
  assert.match(await page.locator("#throughput-compare li").nth(1).textContent(), /Human figure — 25 bits\/s/);
  assert.doesNotMatch(await page.locator("#throughput-compare").textContent(), /1000BASE-T/);
  await assertLegendMatches(page);
  assert.equal(await page.locator("#throughput-legend li[data-kind='2']").innerText(), "Bacterial figure (chosen)");
  assert.match(await page.locator("#throughput-legend li[data-kind='1']").innerText(), /^Human figure \(reference\)/);
  assert.equal(await page.locator("#throughput-legend li[data-kind='3']").count(), 0);
  await shotElement(page, label, "throughput-bacterial-legend.png", "#throughput-chart-block");
  await page.click("#throughput-preset-link");
  await page.waitForFunction(() => document.querySelector("#throughput-compare li")?.textContent?.includes("1000000000"));
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 2);
  assert.doesNotMatch(await page.locator("#throughput-compare").textContent(), /Bacterial/);
  await page.click("#throughput-log");
  await page.waitForFunction(() => document.querySelector("#throughput-plot")?.dataset.scale === "log");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 2);
  assert.equal(await page.locator("#throughput-compare li").nth(1).getAttribute("data-inside"), "true");
  assert.equal(await page.locator(".near-zero-label").count(), 0);
  assert.equal(await page.locator("#throughput-plot polyline[data-display='near-zero']").count(), 0);
  assert.doesNotMatch(await page.locator("#throughput-legend").innerText(), /not to scale|nicht maßstäblich|no a escala|hors échelle/);
  await assertLegendMatches(page);
  assert.doesNotMatch(await page.locator("#throughput-legend").innerText(), /Bacterial/);
  assert.doesNotMatch(await page.locator("#throughput-compare").textContent(), /Bacterial/);
  await page.click("#throughput-linear");
  await page.click("#throughput-preset-page");
  await page.waitForFunction(() => document.querySelector("#throughput-quantity")?.value === "10000");
  assert.equal(await page.locator("#throughput-quantity-unit").inputValue(), "0");
  assert.equal(await page.locator("#throughput-rate").inputValue(), "25");
  assert.equal(await page.locator("#throughput-rate-unit").inputValue(), "0");
  assert.equal(await page.locator("#throughput-duration").inputValue(), "400");
  assert.equal(await page.locator("#throughput-time").textContent(), "400 s");
  assert.equal(await page.locator("#throughput-ratio").textContent(), "40");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 2);
  assert.match(await page.locator("#throughput-compare").textContent(), /Bacterial figure/);
  await page.fill("#throughput-rate", "50");
  await page.waitForFunction(() => document.querySelector("#throughput-compare li")?.textContent?.startsWith("Your rate"));
  assert.equal(await page.locator("#throughput-preset-page").getAttribute("aria-pressed"), "false");
  assert.equal(await page.locator("#throughput-preset-link").getAttribute("aria-pressed"), "false");
  assert.match(await page.locator("#throughput-note").textContent(), /your assumption/);
  await assertLegendMatches(page);
  assert.equal(await page.locator("#throughput-legend li[data-kind='0']").innerText(), "Your rate (chosen)");
  assert.equal(await page.locator("#throughput-legend li[data-kind='1']").getAttribute("data-role"), "reference");
  assert.equal(await page.locator("#throughput-legend li[data-kind='2']").count(), 0);
  await page.click("#throughput-preset-bacterial");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "at most 10 s");
  assert.equal(await page.locator("#throughput-total").textContent(), "at least 400000 bits");
  assert.equal(await page.locator("#throughput-compare li").first().textContent(), "Bacterial figure (chosen) — at least 1000 bits/s — at most 10 s");
  await page.selectOption("#throughput-rate-unit", "1");
  await page.fill("#throughput-rate", "1500");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "400 s");
  assert.equal(await page.locator("#throughput-total").textContent(), "10000 bits");
  await page.fill("#throughput-rate", "0");
  await page.selectOption("#throughput-rate-unit", "0");
  await page.waitForFunction(() => document.querySelector("#throughput-status")?.dataset.status === "5");
  assert.equal(await page.locator("#throughput-time").textContent(), "Unreachable");
  assert.equal(await page.locator("#throughput-total").textContent(), "0 bits");
  assert.match(await page.locator("#throughput-compare").textContent(), /Unreachable/);
  assert.doesNotMatch(await page.locator("#throughput-compare").textContent(), /Bacterial/);
  assert.equal(await page.locator("#throughput-plot polyline[data-display='near-zero']").count(), 0);
  assert.equal(await page.locator(".near-zero-label").count(), 0);
  await page.click("#throughput-log");
  await page.waitForFunction(() => document.querySelector("#throughput-plot")?.dataset.scale === "log");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 1);
  await assertLegendMatches(page);
  assert.equal(await page.locator("#throughput-legend li[data-kind='0']").count(), 0);
  assert.doesNotMatch(await page.locator("#throughput-legend").innerText(), /Bacterial/);
  await page.fill("#throughput-quantity", "0");
  await page.waitForFunction(() => document.querySelector("#throughput-plot")?.dataset.ready === "false");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 0);
  assert.equal(await page.locator("#throughput-legend li").count(), 0);
  assert.match(await page.locator("#throughput-plot-empty").textContent(), /Zero is not drawn/);
  await page.click("#throughput-linear");
  await page.fill("#throughput-rate", "-1");
  await page.waitForFunction(() => document.querySelector("#throughput-status")?.dataset.status === "2");
  assert.equal(await page.locator("#throughput-time").textContent(), "");
  assert.equal(await page.locator("#throughput-compare li").count(), 0);
  assert.equal(await page.locator("#throughput-legend li").count(), 0);
  await page.fill("#throughput-quantity", "");
  await page.waitForFunction(() => document.querySelector("#throughput-status")?.dataset.status === "empty");
  await page.click("#throughput-reset");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "400 s");
  assert.equal(await page.locator("#throughput-quantity").inputValue(), "10000");
  assert.equal(await page.locator("#throughput-rate").inputValue(), "25");
  await page.fill("#throughput-duration", "1e308");
  await page.waitForFunction(() => document.querySelector("#throughput-status")?.dataset.status === "4");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 0);
  assert.equal(await page.locator("#throughput-time").textContent(), "");
  await page.click("#throughput-reset");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "400 s");
  assert.equal(await page.locator("#lifetime-result").textContent(), "6500");
  await page.locator("#delay-card").scrollIntoViewIfNeeded();
  await shot(page, label, "delay-card.png");
  assert.equal(await page.locator("#delay-events li").count(), 3);
  assert.match(await page.locator("#delay-events li").first().textContent(), /0 s/);
  assert.equal(await page.locator("#delay-events li").nth(2).textContent(), "Reply arrives — 2000 years");
  assert.deepEqual(await page.locator(".delay-leg").allTextContents(), ["1000 years", "1000 years"]);
  await page.click("#delay-preset-moon");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "384400");
  assert.equal(await page.locator("#delay-unit").inputValue(), "0");
  assert.equal(await page.locator("#delay-one-way").textContent(), "1.28 s");
  assert.equal(await page.locator("#delay-round").textContent(), "2.56 s");
  const track = await page.locator(".delay-num").allTextContents();
  assert.deepEqual(track, ["1", "2", "3"]);
  const legs = await page.locator(".delay-leg").allTextContents();
  assert.deepEqual(legs, ["1.28 s", "1.28 s"]);
  assert.equal(await page.locator("#delay-events li").nth(1).textContent(), "Signal arrives — 1.28 s");
  assert.equal(await page.locator("#delay-events li").nth(2).textContent(), "Reply arrives — 2.56 s");
  await page.locator("#delay-track").scrollIntoViewIfNeeded();
  await shot(page, label, "delay-moon.png");
  await page.click("#delay-preset-venus");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "41390000");
  assert.equal(await page.locator("#delay-one-way").textContent(), "2.3 min");
  assert.equal(await page.locator("#delay-round").textContent(), "4.6 min");
  assert.equal(await page.locator("#delay-events li").nth(2).textContent(), "Reply arrives — 4.6 min");
  assert.deepEqual(await page.locator(".delay-leg").allTextContents(), ["2.3 min", "2.3 min"]);
  await page.locator("#delay-events").scrollIntoViewIfNeeded();
  await shot(page, label, "delay-venus.png");
  await page.click("#delay-preset-sun");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "1");
  assert.equal(await page.locator("#delay-unit").inputValue(), "1");
  assert.match(await page.locator("#delay-one-way").textContent(), /min$/);
  await page.click("#delay-preset-mars");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "225000000");
  assert.match(await page.locator("#delay-one-way").textContent(), /min$/);
  await page.click("#delay-preset-europa");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "629481000");
  await page.click("#delay-preset-titan");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "1283665000");
  assert.match(await page.locator("#delay-one-way").textContent(), /h$/);
  await page.click("#delay-preset-proxima");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "4.2465");
  assert.equal(await page.locator("#delay-unit").inputValue(), "2");
  assert.match(await page.locator("#delay-one-way").textContent(), /years$/);
  assert.match(await page.locator("#delay-note").textContent(), /Proxima Centauri/);
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
  assert.equal(await page.locator("#diag-version").textContent(), "0.1.17");
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
  assert.equal(await page.locator("#working-count").textContent(), "4");

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
  assert.equal(await page.locator("#working-count").textContent(), "4");

  const cardVisible = async (id) => page.locator(id).isVisible();
  assert.equal(await cardVisible("#lifetime-card"), true);
  assert.equal(await cardVisible("#growth-card"), true);
  assert.equal(await cardVisible("#delay-card"), true);
  assert.equal(await cardVisible("#throughput-card"), true);
  assert.equal(await page.locator("#show-all").getAttribute("aria-pressed"), "true");
  await page.locator('a[href="#phantomology"]').click();
  await page.waitForFunction(() => document.querySelector("#reading")?.dataset.route === "phantomology");
  assert.equal(await cardVisible("#delay-card"), true);
  assert.equal(await cardVisible("#lifetime-card"), false);
  assert.equal(await cardVisible("#growth-card"), false);
  assert.equal(await cardVisible("#throughput-card"), false);
  assert.equal(await page.locator('[data-chapter-link="phantomology"]').getAttribute("aria-current"), "true");
  assert.equal(await page.locator("#delay-one-way").textContent(), "1000 years");
  await page.click("#delay-preset-moon");
  await page.waitForFunction(() => document.querySelector("#delay-one-way")?.textContent === "1.28 s");
  assert.equal(await cardVisible("#delay-card"), true);
  assert.equal(await cardVisible("#lifetime-card"), false);
  await page.click("#delay-reset");
  await page.waitForFunction(() => document.querySelector("#delay-one-way")?.textContent === "1000 years");
  await page.click("#show-all");
  await page.waitForFunction(() => document.querySelector("#show-all")?.getAttribute("aria-pressed") === "true");
  assert.equal(await page.evaluate(() => location.hash), "");
  assert.equal(await cardVisible("#lifetime-card"), true);
  assert.equal(await cardVisible("#growth-card"), true);
  assert.equal(await cardVisible("#delay-card"), true);
  assert.equal(await cardVisible("#throughput-card"), true);
  assert.equal(await page.locator("#delay-one-way").textContent(), "1000 years");
  assert.equal(await page.locator("#lifetime-result").textContent(), "6500");
  await page.locator('input[data-filter-category="chapter"][value="cosmic-civilisations"]').check();
  await page.locator('input[data-filter-category="chapter"][value="intellectronics"]').check();
  await page.waitForFunction(() => document.querySelector("#lifetime-card") && !document.querySelector("#lifetime-card").hidden && document.querySelector("#growth-card") && !document.querySelector("#growth-card").hidden && document.querySelector("#delay-card").hidden);
  assert.equal(await cardVisible("#throughput-card"), false);
  assert.equal(await page.locator('[data-chapter-link="cosmic-civilisations"]').getAttribute("aria-current"), "true");
  assert.equal(await page.locator('[data-chapter-link="intellectronics"]').getAttribute("aria-current"), "true");
  await page.goto(`${page.context()._base}#growth-card`);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector("#growth-quantity")?.textContent === "4" && document.querySelector("#lifetime-card")?.hidden && !document.querySelector("#growth-card")?.hidden);
  assert.equal(await page.locator("#reading").getAttribute("data-route"), "intellectronics/return-to-earth");
  assert.equal(await page.locator("#delay-card").isVisible(), false);
  await page.click("#show-all");
  await page.waitForFunction(() => document.querySelector("#show-all")?.getAttribute("aria-pressed") === "true");
  assert.equal(await cardVisible("#delay-card"), true);

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
  const toolsAfterLoad = page.locator("#catalogue-tools");
  if (!(await toolsAfterLoad.evaluate((element) => element.open))) {
    await toolsAfterLoad.locator("summary").click();
    await page.waitForFunction(() => document.querySelector("#catalogue-tools").open);
  }
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
  assert.equal(await page.locator("#show-all").textContent(), t("de", "nav.allChapters"));
  assert.equal(await page.locator("#debug-toggle").textContent(), t("de", "debug.open"));
  assert.equal(await page.locator("#throughput-time").textContent(), "400 s");
  assert.equal(await page.locator("#throughput-time-label").textContent(), t("de", "throughput.timeLabel"));
  assert.equal(await page.locator("#throughput-preset-page").textContent(), t("de", "throughput.preset.page"));
  assert.equal(await page.locator("#throughput-legend li[data-kind='1']").innerText(), `${t("de", "throughput.humanBar")} (${t("de", "throughput.chosen")})`);
  assert.equal(await page.locator("#throughput-legend li[data-kind='2']").innerText(), `${t("de", "throughput.bacterialBar")} (${t("de", "throughput.reference")})`);
  assert.match(await page.locator("#throughput-legend li[data-role='target']").innerText(), new RegExp(t("de", "throughput.legendTarget")));
  assert.equal(await page.locator("#throughput-legend li[data-role='reached']").innerText(), t("de", "throughput.legendReached"));
  assert.equal(await page.locator("#throughput-preset-help").textContent(), t("de", "throughput.presetHelp"));
  assert.equal(await page.locator("#throughput-ratio").textContent(), "40");
  assert.equal(await page.locator("#delay-events li").nth(2).textContent(), `${t("de", "delay.roundTrip")} — 2000 Jahre`);
  await page.click("#delay-preset-venus");
  await page.waitForFunction(() => document.querySelector("#delay-distance")?.value === "41390000");
  assert.equal(
    await page.locator("#delay-events li").nth(2).textContent(),
    `${t("de", "delay.roundTrip")} — ${await page.locator("#delay-round").textContent()}`,
  );
  assert.deepEqual(
    await page.locator(".delay-leg").allTextContents(),
    [await page.locator("#delay-one-way").textContent(), await page.locator("#delay-one-way").textContent()],
  );
  await page.click("#delay-preset-stars");
  await page.waitForFunction(() => document.querySelector("#delay-one-way")?.textContent === "1000 Jahre");
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
  assert.equal(await page.locator("#throughput-preset-page").textContent(), t("fr", "throughput.preset.page"));
  assert.equal(await page.locator("#throughput-legend li[data-kind='2']").innerText(), `${t("fr", "throughput.bacterialBar")} (${t("fr", "throughput.reference")})`);
  assert.equal(
    await page.locator("#delay-events li").nth(2).textContent(),
    `${t("fr", "delay.roundTrip")} — ${await page.locator("#delay-round").textContent()}`,
  );
  await page.selectOption("#language", "es");
  assert.equal(await page.locator("#clear-filters").textContent(), t("es", "catalogue.clear"));
  assert.equal(await page.locator("#throughput-preset-page").textContent(), t("es", "throughput.preset.page"));
  assert.equal(await page.locator("#throughput-legend li[data-kind='1']").innerText(), `${t("es", "throughput.humanBar")} (${t("es", "throughput.chosen")})`);
  assert.equal(
    await page.locator("#delay-events li").nth(2).textContent(),
    `${t("es", "delay.roundTrip")} — ${await page.locator("#delay-round").textContent()}`,
  );
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
  const debugBox = await page.locator("#debug-toggle").boundingBox();
  assert.ok(debugBox);
  assert.ok(debugBox.x >= 0 && debugBox.y >= 0);
  assert.ok(debugBox.x + debugBox.width <= 320);
  assert.ok(debugBox.y + debugBox.height <= 800);
  assert.equal(await page.locator("#debug-toggle").isVisible(), true);
  await page.locator("#lifetime-card").scrollIntoViewIfNeeded();
  await shot(page, label, "narrow.png");
  await page.locator("#growth-card").scrollIntoViewIfNeeded();
  await shot(page, label, "growth-narrow.png");
  assert.ok((await overflow(page)) <= 1, "narrow growth");
  await page.locator("#throughput-card").scrollIntoViewIfNeeded();
  await shot(page, label, "throughput-narrow.png");
  await page.click("#throughput-preset-link");
  await page.waitForFunction(() => document.querySelector(".near-zero-label")?.textContent?.includes("Human figure"));
  await shotElement(page, label, "throughput-machine-visible-narrow.png", "#throughput-chart-block");
  const narrowLabel = await page.locator(".near-zero-label").boundingBox();
  const narrowPlot = await page.locator("#throughput-plot").boundingBox();
  assert.ok(narrowLabel && narrowPlot);
  assert.ok(narrowLabel.x >= narrowPlot.x - 1);
  assert.ok(narrowLabel.x + narrowLabel.width <= narrowPlot.x + narrowPlot.width + 1);
  assert.ok(narrowLabel.y >= narrowPlot.y - 1);
  assert.ok(narrowLabel.y + narrowLabel.height <= narrowPlot.y + narrowPlot.height + 1);
  await page.click("#throughput-preset-page");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "400 s");
  await page.click("#throughput-preset-bacterial");
  await page.waitForFunction(() => document.querySelector("#throughput-legend li[data-kind='2']")?.dataset.role === "chosen");
  await shotElement(page, label, "throughput-bacterial-legend-narrow.png", "#throughput-chart-block");
  assert.match(await page.locator("#throughput-legend li[data-kind='1']").innerText(), /^Human figure \(reference\)/);
  await page.click("#throughput-preset-page");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "400 s");
  await shotElement(page, label, "throughput-default-plot-narrow.png", "#throughput-plot-wrap");
  assert.equal(await page.locator("#throughput-time").textContent(), "400 s");
  await page.click("#throughput-preset-link");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "10 µs");
  await shotElement(page, label, "throughput-machine-plot-narrow.png", "#throughput-plot-wrap");
  assert.equal(await page.locator("#throughput-plot polyline[data-kind]").count(), 2);
  assert.doesNotMatch(await page.locator("#throughput-compare").textContent(), /Bacterial|bacterian|bactérien|bakteriell/i);
  await page.click("#throughput-preset-page");
  await page.waitForFunction(() => document.querySelector("#throughput-time")?.textContent === "400 s");
  assert.ok((await overflow(page)) <= 1, "narrow throughput");
  await page.click("#delay-preset-venus");
  await page.waitForFunction(() => document.querySelector("#delay-events li:nth-child(3)")?.textContent === "Reply arrives — 4.6 min");
  await page.locator("#delay-events").scrollIntoViewIfNeeded();
  await shot(page, label, "delay-narrow.png");
  assert.deepEqual(await page.locator(".delay-leg").allTextContents(), ["2.3 min", "2.3 min"]);
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
