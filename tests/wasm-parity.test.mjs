import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { callAddition, callChoice, callDelay, callExplore, callGrowth, callLifetime, callLottery, callRebalance, callTarget, callThroughput, createSession, loadAdditionModule } from "../web/js/wasm-loader.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wasmPath = path.join(root, "dist", "ath_addition.wasm");
const fixturePath = path.join(root, "build", "native", "fixtures.txt");
const lifetimePath = path.join(root, "build", "native", "lifetime-fixtures.txt");
const growthPath = path.join(root, "build", "native", "growth-fixtures.txt");
const delayPath = path.join(root, "build", "native", "delay-fixtures.txt");
const throughputPath = path.join(root, "build", "native", "throughput-fixtures.txt");

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

  const extendInputs = {
    "target-20": [1, 14, 30, 2026, 20, true],
    "target-lowered": [1, 14, 30, 2026, 4, true],
  };
  const extensions = fs.readFileSync(growthPath, "utf8").split("\n").filter((line) => line.startsWith("EXTEND "));
  assert.ok(extensions.length >= 2);
  for (const line of extensions) {
    const parts = line.trim().split(/\s+/);
    const name = parts[1];
    const inputs = extendInputs[name];
    assert.ok(inputs, name);
    const outcome = callExplore(session, ...inputs);
    assert.equal(outcome.status, Number(parts[2]), name);
    assert.equal(outcome.extended, parts[3] === "1", name);
    assert.equal(floatToBits(outcome.quantity), parts[4], `${name} quantity`);
    assert.equal(floatToBits(outcome.factor), parts[5], `${name} factor`);
    assert.equal(floatToBits(outcome.evalYear), parts[6], name);
    assert.equal(floatToBits(outcome.endYear), parts[7], name);
    assert.equal(floatToBits(outcome.samples.at(-1).time), parts[8], name);
    assertBitsOrOneUlp(floatToBits(outcome.samples.at(-1).quantity), parts[9], `${name} end quantity`);
    assertBitsOrOneUlp(floatToBits(outcome.samples.at(-1).baseline), parts[10], `${name} baseline`);
    if (outcome.extended) {
      assert.notEqual(floatToBits(outcome.quantity), floatToBits(outcome.samples.at(-1).quantity), name);
      assert.ok(outcome.endYear > outcome.evalYear, name);
    }
  }
});

test("light-time exports match the native fixture bits", async (t) => {
  if (!fs.existsSync(wasmPath) || !fs.existsSync(delayPath)) {
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
  const lines = fs.readFileSync(delayPath, "utf8").split("\n").filter((line) => /^DELAY [a-z0-9-]+ /.test(line));
  assert.ok(lines.length >= 8);
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const name = parts[1];
    const status = Number(parts[2]);
    const oneWay = parts[3];
    const roundTrip = parts[4];
    const distance = bitsToFloat(parts[5]);
    const unit = bitsToFloat(parts[6]);
    const outcome = callDelay(session, distance, unit);
    assert.equal(outcome.status, status, name);
    if (status === 0) {
      assert.equal(floatToBits(outcome.oneWay), oneWay, name);
      assert.equal(floatToBits(outcome.roundTrip), roundTrip, name);
      assert.equal(outcome.events.length, 3, name);
      assert.equal(outcome.events[0], 0, name);
      assert.equal(floatToBits(outcome.events[1]), oneWay, name);
      assert.equal(floatToBits(outcome.events[2]), roundTrip, name);
    } else {
      assert.equal(outcome.oneWay, null, name);
      assert.equal(floatToBits(session.exports.ath_delay_one_way()), "0000000000000000", name);
    }
  }
  assert.equal(session.exports.ath_delay_preset_count(), 8);
  assert.equal(session.exports.ath_delay_preset_distance(1), 384400);
  assert.equal(session.exports.ath_delay_preset_distance(2), 41390000);
  assert.equal(session.exports.ath_delay_preset_distance(3), 1);
  assert.equal(session.exports.ath_delay_preset_unit(3), 1);
  assert.equal(session.exports.ath_delay_preset_distance(4), 225000000);
  assert.equal(session.exports.ath_delay_preset_distance(5), 629481000);
  assert.equal(session.exports.ath_delay_preset_distance(6), 1283665000);
  assert.equal(session.exports.ath_delay_preset_distance(7), 4.2465);
  assert.equal(session.exports.ath_delay_preset_unit(7), 2);
  assert.equal(session.exports.ath_delay_preset_distance(8), 1000);
  assert.equal(session.exports.ath_delay_preset_unit(8), 2);
  const legs = callDelay(session, 1000, 2);
  assert.equal(session.exports.ath_delay_leg_time(2), legs.oneWay);
  assert.equal(session.exports.ath_delay_leg_time(3), legs.oneWay);
});

test("constant-rate exports match the native fixture bits", async (t) => {
  if (!fs.existsSync(wasmPath) || !fs.existsSync(throughputPath)) {
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
  const lines = fs.readFileSync(throughputPath, "utf8").split("\n").filter((line) => /^THROUGHPUT [a-z0-9-]+ /.test(line));
  assert.ok(lines.length >= 8);
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const name = parts[1];
    const status = Number(parts[2]);
    const timeValid = Number(parts[3]);
    const totalValid = Number(parts[4]);
    const chartValid = Number(parts[5]);
    const outcome = callThroughput(
      session,
      bitsToFloat(parts[11]),
      bitsToFloat(parts[12]),
      bitsToFloat(parts[13]),
      bitsToFloat(parts[14]),
      bitsToFloat(parts[15]),
      bitsToFloat(parts[16]),
      bitsToFloat(parts[17]),
    );
    assert.equal(outcome.status, status, name);
    assert.equal(outcome.time === null ? 0 : 1, timeValid, name);
    assert.equal(outcome.total === null ? 0 : 1, totalValid, name);
    assert.equal(outcome.human === null ? 0 : 1, chartValid, name);
    if (timeValid === 1) assert.equal(floatToBits(outcome.time), parts[6], name);
    if (totalValid === 1) assert.equal(floatToBits(outcome.total), parts[7], name);
    if (chartValid === 1) {
      assert.equal(floatToBits(outcome.human), parts[8], name);
      assert.equal(floatToBits(outcome.bacterial), parts[9], name);
      assert.equal(floatToBits(outcome.ratio), parts[10], name);
    }
  }
  assert.equal(session.exports.ath_throughput_preset_count(), 4);
  assert.equal(session.exports.ath_throughput_preset_quantity(1), 1);
  assert.equal(session.exports.ath_throughput_preset_quantity_unit(1), 2);
  assert.equal(session.exports.ath_throughput_preset_rate(2), 25);
  assert.equal(session.exports.ath_throughput_preset_rate(3), 1000);
  assert.equal(session.exports.ath_throughput_preset_bound(3), 1);
  const page = callThroughput(session, 10000, 0, 25, 0, 0, 400, 0);
  assert.equal(page.time, 400);
  assert.equal(page.total, 10000);
  assert.equal(page.bacterial, 10);
  assert.equal(page.ratio, 40);
  assert.equal(page.humanRate, 25);
  assert.equal(page.bacterialRate, 1000);
  assert.equal(page.linkRate, 1_000_000_000);
  assert.equal(page.bacterialLinear, 1);
  assert.equal(page.linkLog, 1);
  assert.ok(Math.abs(page.bacterialLinear / page.humanLinear - 40) < 1e-9);
  assert.equal(page.linkTime, 10000 / 1_000_000_000);
  assert.equal(session.exports.ath_throughput_preset_rate(4), 1);
  assert.equal(session.exports.ath_throughput_preset_rate_unit(4), 3);
  const stalled = callThroughput(session, 10000, 0, 0, 0, 0, 400, 0);
  assert.equal(stalled.status, 5);
  assert.equal(stalled.time, null);
  assert.equal(stalled.total, 0);
});

test("choice exports keep finite information when the count overflows", async (t) => {
  if (!fs.existsSync(wasmPath)) {
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
  const coin = callChoice(session, 2, 8);
  assert.equal(coin.status, 0);
  assert.equal(coin.bitsPer, 1);
  assert.equal(coin.totalBits, 8);
  assert.equal(coin.combinations, 256);
  assert.equal(coin.combinationsExact, true);
  assert.equal(coin.samples.at(-1).bits, 8);
  const huge = callChoice(session, 10, 400);
  assert.equal(huge.status, 0);
  assert.equal(huge.combinations, null);
  assert.equal(huge.combinationsExact, false);
  assert.ok(huge.totalBits > 1300 && huge.totalBits < 1400);
  assert.ok(Math.abs(huge.log10Count - 400) < 1e-6);
  assert.equal(callChoice(session, 1, 5).totalBits, 0);
  assert.equal(callChoice(session, 2, 0).combinations, 1);
  assert.equal(callChoice(session, 0, 1).status, 3);
});

test("lottery exports keep the hypergeometric chance off zero when it underflows", async (t) => {
  if (!fs.existsSync(wasmPath)) {
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
  const small = callLottery(session, 10, 2, 3);
  assert.equal(small.status, 0);
  assert.ok(Math.abs(small.expected - 0.6) < 1e-9);
  assert.equal(small.fractionNum, 7);
  assert.equal(small.fractionDen, 15);
  assert.equal(small.samples.length, 11);
  assert.equal(small.samples[9].kind, 1);
  const book = callLottery(session, 1_000_000, 1_000, 500_000);
  assert.equal(book.expected, 500);
  assert.ok(Math.abs(book.noneLog10 + 301.247142832478) < 1e-6);
  assert.equal(book.noneExactZero, false);
  assert.equal(book.noneRepresentable, true);
  const tiny = callLottery(session, 1_000_000, 5_000, 500_000);
  assert.equal(tiny.expected, 2500);
  assert.equal(tiny.noneRepresentable, false);
  assert.equal(tiny.noneExactZero, false);
  assert.ok(Math.abs(tiny.noneLog10 + 1510.604868167756) < 1e-4);
  assert.equal(callLottery(session, 10, 2, 0).fractionNum, 1);
  assert.equal(callLottery(session, 10, 2, 10).noneExactZero, true);
  assert.equal(callLottery(session, 10, 11, 1).status, 4);
  assert.equal(callLottery(session, 0, 0, 0).status, 3);
  assert.equal(callLottery(session, 0, 0, 0).samples.length, 0);
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
