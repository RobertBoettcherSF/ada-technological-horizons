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
