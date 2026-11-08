import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { callAddition, createSession, loadAdditionModule } from "../web/js/wasm-loader.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wasmPath = path.join(root, "dist", "ath_addition.wasm");
const fixturePath = path.join(root, "build", "native", "fixtures.txt");

function bitsToFloat(hex) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(`0x${hex}`), true);
  return view.getFloat64(0, true);
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
