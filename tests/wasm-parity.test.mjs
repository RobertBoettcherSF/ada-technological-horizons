import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { callAddition, callGrowth, callLifetime, callRebalance, callTarget, createSession, loadAdditionModule } from "../web/js/wasm-loader.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wasmPath = path.join(root, "dist", "ath_addition.wasm");
const fixturePath = path.join(root, "build", "native", "fixtures.txt");
const lifetimePath = path.join(root, "build", "native", "lifetime-fixtures.txt");
const growthPath = path.join(root, "build", "native", "growth-fixtures.txt");

function bitsToFloat(hex) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(`0x${hex}`), true);
  return view.getFloat64(0, true);
}

function ulpDistance(actual, expected) {
  const left = BigInt(`0x${actual}`);
  const right = BigInt(`0x${expected}`);
  return left > right ? left - right : right - left;
}

function assertBitsOrOneUlp(actual, expected, name) {
  if (actual === expected) return;
  const distance = ulpDistance(actual, expected);
  assert.ok(
    distance <= 1n,
    `${name} differed by ${distance} ulp; native and Wasm libm may differ by one ulp on a non-integer power of two`,
  );
}

function floatToBits(value) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value, true);
  return view.getBigUint64(0, true).toString(16).padStart(16, "0");
}

function readFixtures() {
  return fs
    .readFileSync(fixturePath, "utf8")
    .split("\n")
    .filter((line) => line.startsWith("FIXTURE "))
    .map((line) => {
      const [, name, left, right, status, result] = line.trim().split(/\s+/);
      return { name, left, right, status: Number(status), result };
    });
}

test("browser exports match the native fixture bits", async (t) => {
  if (!fs.existsSync(wasmPath) || !fs.existsSync(fixturePath)) {
    t.skip("run tools/build.sh before the parity test");
    return;
  }
  const bytes = fs.readFileSync(wasmPath);
  const session = createSession();
  const loaded = await loadAdditionModule({
    url: "http://fixture.invalid/ath_addition.wasm",
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => "application/octet-stream" },
      arrayBuffer: async () => bytes,
    }),
  });
  session.phase = "ready";
  session.exports = loaded.exports;
  assert.equal(loaded.mime, "application/octet-stream");

  for (const fixture of readFixtures()) {
    const outcome = callAddition(session, bitsToFloat(fixture.left), bitsToFloat(fixture.right));
    assert.equal(outcome.status, fixture.status, fixture.name);
    if (fixture.status === 0) {
      assert.equal(floatToBits(outcome.result), fixture.result, fixture.name);
    } else {
      assert.equal(outcome.result, null, fixture.name);
      assert.equal(floatToBits(session.exports.ath_last_sum()), "0000000000000000", fixture.name);
    }
  }
});

test("lifetime exports match the native fixture bits", async (t) => {
  if (!fs.existsSync(wasmPath) || !fs.existsSync(lifetimePath)) {
    t.skip("run tools/build.sh before the parity test");
    return;
  }
  const bytes = fs.readFileSync(wasmPath);
  const session = createSession();
  const loaded = await loadAdditionModule({
    url: "http://fixture.invalid/ath_addition.wasm",
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => "application/wasm" },
      arrayBuffer: async () => bytes,
    }),
  });
  session.exports = loaded.exports;
  const lines = fs
    .readFileSync(lifetimePath, "utf8")
    .split("\n")
    .filter((line) => line.startsWith("LIFE "));
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const [, name, status, mean, c1, c2, c3, c4, ...inputs] = parts;
    const percentages = inputs.slice(0, 4).map(bitsToFloat);
    const durations = inputs.slice(4, 8).map(bitsToFloat);
    const outcome = callLifetime(session, percentages, durations);
    assert.equal(outcome.status, Number(status), name);
    if (Number(status) === 0) {
      assert.equal(floatToBits(outcome.mean), mean, name);
      assert.deepEqual(outcome.contributions.map(floatToBits), [c1, c2, c3, c4], name);
    } else {
      assert.equal(outcome.mean, null, name);
      assert.equal(floatToBits(session.exports.ath_lifetime_mean()), "0000000000000000", name);
    }
  }
});

test("rebalance exports match the native fixture bits", async (t) => {
  if (!fs.existsSync(wasmPath) || !fs.existsSync(lifetimePath)) {
    t.skip("run tools/build.sh before the parity test");
    return;
  }
  const bytes = fs.readFileSync(wasmPath);
  const session = createSession();
  const loaded = await loadAdditionModule({
    url: "http://fixture.invalid/ath_addition.wasm",
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => "application/wasm" },
      arrayBuffer: async () => bytes,
    }),
  });
  session.exports = loaded.exports;
  const lines = fs
    .readFileSync(lifetimePath, "utf8")
    .split("\n")
    .filter((line) => line.startsWith("REBALANCE "));
  assert.ok(lines.length >= 4);
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const name = parts[1];
    const status = Number(parts[2]);
    const results = parts.slice(3, 7);
    const index = Number(parts[7]);
    const edited = bitsToFloat(parts[8]);
    const base = parts.slice(9, 13).map(bitsToFloat);
    const outcome = callRebalance(session, base, index, edited);
    assert.equal(outcome.status, status, name);
    if (status === 0) {
      assert.deepEqual(outcome.probabilities.map(floatToBits), results, name);
    }
  }
});

test("growth exports match the native fixture bits", async (t) => {
  if (!fs.existsSync(wasmPath) || !fs.existsSync(growthPath)) {
    t.skip("run tools/build.sh before the parity test");
    return;
  }
  const bytes = fs.readFileSync(wasmPath);
  const session = createSession();
  const loaded = await loadAdditionModule({
    url: "http://fixture.invalid/ath_addition.wasm",
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => "application/wasm" },
      arrayBuffer: async () => bytes,
    }),
  });
  session.exports = loaded.exports;
  const lines = fs.readFileSync(growthPath, "utf8").split("\n").filter((line) => line.startsWith("GROW "));
  assert.ok(lines.length >= 8);
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const name = parts[1];
    const status = Number(parts[2]);
    const quantity = parts[3];
    const factor = parts[4];
    const initial = bitsToFloat(parts[5]);
    const doubling = bitsToFloat(parts[6]);
    const elapsed = bitsToFloat(parts[7]);
    const samples = [];
    for (let index = 8; index < parts.length; index += 2) {
      samples.push({ time: parts[index], quantity: parts[index + 1] });
    }
    const outcome = callGrowth(session, initial, doubling, elapsed, 0);
    assert.equal(outcome.status, status, name);
    if (status === 0) {
      assert.equal(floatToBits(outcome.quantity), quantity, name);
      assert.equal(floatToBits(outcome.factor), factor, name);
      assert.equal(outcome.samples.length, samples.length, name);
      assert.equal(floatToBits(outcome.samples.at(-1).quantity), quantity, `${name} endpoint`);
      assert.equal(floatToBits(outcome.samples[0].time), samples[0].time, `${name} start`);
    } else {
      assert.equal(outcome.quantity, null, name);
      assert.equal(floatToBits(session.exports.ath_growth_quantity()), "0000000000000000", name);
    }
  }

  const chartInputs = {
    "calendar-defaults": [1, 15, 30, 2026],
    "doubling-14": [1, 14, 30, 2026],
    "baseline-overflow": [1, 100000, 20000, 2026],
  };
  const charts = fs.readFileSync(growthPath, "utf8").split("\n").filter((line) => line.startsWith("CHART "));
  assert.ok(charts.length >= 3);
  for (const line of charts) {
    const parts = line.trim().split(/\s+/);
    const name = parts[1];
    const inputs = chartInputs[name];
    assert.ok(inputs, name);
    const outcome = callGrowth(session, ...inputs);
    assert.equal(outcome.status, Number(parts[2]), name);
    assert.equal(outcome.baselineStatus, Number(parts[3]), name);
    assertBitsOrOneUlp(floatToBits(outcome.quantity), parts[4], `${name} quantity`);
    assertBitsOrOneUlp(floatToBits(outcome.factor), parts[5], `${name} factor`);
    assert.equal(floatToBits(outcome.endYear), parts[6], name);
    assert.equal(floatToBits(outcome.samples[0].time), parts[7], name);
    assert.equal(floatToBits(outcome.samples.at(-1).time), parts[9], name);
    assertBitsOrOneUlp(floatToBits(outcome.samples.at(-1).quantity), parts[10], `${name} end quantity`);
    assert.equal(floatToBits(outcome.samples.at(-1).baseline), parts[11], name);
    assert.equal(outcome.samples.at(-1).time, outcome.endYear, `${name} shared end`);
  }

  const targetInputs = {
    "target-four-fifteen": [1, 15, 30, 2026, 4],
    "target-four-fourteen": [1, 14, 30, 2026, 4],
    "target-already": [1, 15, 30, 2026, 1],
    "target-below": [1, 15, 30, 2026, 0.5],
    "target-never": [0, 15, 30, 2026, 10],
    "target-outside": [1, 15, 30, 2026, 10],
    "target-zero": [1, 15, 30, 2026, 0],
    "target-negative": [1, 15, 30, 2026, -2],
  };
  const targets = fs.readFileSync(growthPath, "utf8").split("\n").filter((line) => line.startsWith("TARGET "));
  assert.ok(targets.length >= 8);
  for (const line of targets) {
    const parts = line.trim().split(/\s+/);
    const name = parts[1];
    const inputs = targetInputs[name];
    assert.ok(inputs, name);
    const outcome = callTarget(session, ...inputs);
    assert.equal(outcome.status, Number(parts[2]), name);
    assert.equal(floatToBits(outcome.elapsed), parts[3], name);
    assert.equal(floatToBits(outcome.year), parts[4], name);
  }
});

test("a failed module load does not invent a sum", async () => {
  const session = createSession();
  await assert.rejects(
    loadAdditionModule({
      url: "http://fixture.invalid/missing.wasm",
      fetchImpl: async () => ({ ok: false, status: 404, headers: { get: () => "" } }),
    }),
    /404/,
  );
  assert.equal(session.exports, null);
  assert.throws(() => callAddition(session, 2, 3), /not loaded/);
});
