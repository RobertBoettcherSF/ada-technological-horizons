// Marshalling only. This module never adds the two operands.

const DECIMAL = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
const NON_FINITE = /^[+-]?(?:Infinity|Inf|NaN)$/i;

export function interpretOperand(raw) {
  const text = String(raw).trim();
  if (text === "") {
    return { kind: "empty" };
  }
  if (NON_FINITE.test(text)) {
    return { kind: "value", value: Number(text) };
  }
  if (!DECIMAL.test(text)) {
    return { kind: "malformed" };
  }
  return { kind: "value", value: Number(text) };
}

export function formatCanonical(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Refusing to present a non-finite value as a result");
  }
  if (value === 0) {
    return "0";
  }
  const text = value.toString();
  if (text.includes(",") || text.includes(" ")) {
    throw new Error("Ambiguous numeric rendering");
  }
  return text;
}
