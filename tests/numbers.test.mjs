import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { formatCanonical, interpretOperand } from "../web/js/numbers.js";

test("operand adaptation rejects empty and malformed text without adding", () => {
  assert.equal(interpretOperand("   ").kind, "empty");
  assert.equal(interpretOperand("").kind, "empty");
  assert.equal(interpretOperand("2+3").kind, "malformed");
  assert.equal(interpretOperand("1,5").kind, "malformed");
  assert.equal(interpretOperand("abc").kind, "malformed");
  assert.deepEqual(interpretOperand("  -2 "), { kind: "value", value: -2 });
  assert.deepEqual(interpretOperand("0"), { kind: "value", value: 0 });
  assert.deepEqual(interpretOperand("2.5e1"), { kind: "value", value: 25 });
  assert.equal(interpretOperand("NaN").kind, "value");
  assert.ok(Number.isNaN(interpretOperand("NaN").value));
  assert.equal(interpretOperand("-Infinity").value, Number.NEGATIVE_INFINITY);
  assert.equal(interpretOperand("1e999").value, Number.POSITIVE_INFINITY);
});

test("headline years round to the nearest 100 without hiding a small exact mean", async () => {
  const { formatHeadlineYears } = await import("../web/js/numbers.js");
  assert.deepEqual(formatHeadlineYears(6523), { text: "6500", mode: "nearest-100" });
  assert.deepEqual(formatHeadlineYears(8523), { text: "8500", mode: "nearest-100" });
  assert.deepEqual(formatHeadlineYears(0), { text: "0", mode: "exact" });
  assert.equal(formatHeadlineYears(42).mode, "exact");
  assert.equal(formatHeadlineYears(42).text, "42");
});

test("readable growth figures keep exact integers and shorten long values", async () => {
  const { formatReadable } = await import("../web/js/numbers.js");
  assert.equal(formatReadable(4, "en-GB"), "4");
  assert.equal(formatReadable(2056, "en-GB", "year"), "2056");
  assert.equal(formatReadable(2054, "de", "year"), "2054");
  const long = formatReadable(1.1486983549970349, "en-GB");
  assert.ok(long.length < 12, long);
  assert.equal(long.includes(" "), false);
  assert.notEqual(formatReadable(1.5, "de"), formatReadable(1.5, "en-GB"));
});

test("duration formatting follows the size of the light-time", async () => {
  const { formatDuration } = await import("../web/js/numbers.js");
  assert.deepEqual(formatDuration(0, "en-GB"), { text: "0", unit: "s" });
  assert.deepEqual(formatDuration(31557600 * 1000, "en-GB"), { text: "1000", unit: "y" });
  assert.deepEqual(formatDuration(31557600 * 2000, "de"), { text: "2000", unit: "y" });
  assert.equal(formatDuration(90, "en-GB").unit, "min");
});

test("canonical rendering is unambiguous and ignores language", () => {
  assert.equal(formatCanonical(5), "5");
  assert.equal(formatCanonical(-3), "-3");
  assert.equal(formatCanonical(0), "0");
  assert.equal(formatCanonical(-0), "0");
  assert.equal(formatCanonical(2.5), "2.5");
  assert.throws(() => formatCanonical(Number.NaN));
  assert.throws(() => formatCanonical(Number.POSITIVE_INFINITY));
});

test("marshalling source does not add the operands", () => {
  const source = fs.readFileSync(new URL("../web/js/numbers.js", import.meta.url), "utf8");
  assert.equal(source.includes("left +"), false);
  assert.equal(source.includes("eval("), false);
});
