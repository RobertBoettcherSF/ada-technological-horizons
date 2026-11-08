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

export function formatHeadlineYears(exact) {
  if (typeof exact !== "number" || !Number.isFinite(exact)) {
    throw new Error("Refusing to present a non-finite duration");
  }
  if (exact === 0) {
    return { text: "0", mode: "exact" };
  }
  const rounded = Math.round(Math.abs(exact) / 100) * 100;
  if (rounded === 0) {
    return { text: formatCanonical(exact), mode: "exact" };
  }
  const sign = exact < 0 ? "-" : "";
  return { text: `${sign}${rounded}`, mode: "nearest-100" };
}

export function formatProbability(value) {
  return formatCanonical(value);
}

const JULIAN_YEAR_SECONDS = 31557600;

export function formatDuration(seconds, lang) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
    throw new Error("Refusing to present a non-finite duration");
  }
  const absolute = Math.abs(seconds);
  let value = absolute;
  let unit = "s";
  if (absolute >= JULIAN_YEAR_SECONDS) {
    value = absolute / JULIAN_YEAR_SECONDS;
    unit = "y";
  } else if (absolute >= 86400) {
    value = absolute / 86400;
    unit = "d";
  } else if (absolute >= 3600) {
    value = absolute / 3600;
    unit = "h";
  } else if (absolute >= 60) {
    value = absolute / 60;
    unit = "min";
  }
  const sign = seconds < 0 ? "-" : "";
  const locale = lang === "de" || lang === "es" || lang === "fr" || lang === "en-GB" ? lang : "en-GB";
  const text = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    useGrouping: false,
  }).format(value);
  return { text: `${sign}${text}`, unit };
}

export function formatShortDuration(seconds, lang) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
    throw new Error("Refusing to present a non-finite duration");
  }
  const absolute = Math.abs(seconds);
  const sign = seconds < 0 ? "-" : "";
  const locale = lang === "de" || lang === "es" || lang === "fr" || lang === "en-GB" ? lang : "en-GB";
  const write = (value, unit) => {
    const near = Math.abs(value - Math.round(value));
    const shown = near < 1e-6 && Math.abs(value) < 1e15 ? Math.round(value) : value;
    const text = new Intl.NumberFormat(locale, {
      maximumSignificantDigits: 6,
      useGrouping: false,
    }).format(shown);
    return { text: `${sign}${text}`, unit };
  };
  if (absolute > 0 && absolute < 0.001) {
    return write(absolute * 1e6, "us");
  }
  if (absolute >= 0.001 && absolute < 1) {
    return write(absolute * 1e3, "ms");
  }
  if (absolute < 3600) {
    return write(absolute, "s");
  }
  return formatDuration(seconds, lang);
}

export function formatReadable(value, lang, kind = "quantity") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Refusing to present a non-finite value as a result");
  }
  const locale = lang === "de" || lang === "es" || lang === "fr" || lang === "en-GB" ? lang : "en-GB";
  if (kind === "year" && Math.abs(value - Math.round(value)) <= 1e-6) {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      useGrouping: false,
    }).format(Math.round(value));
  }
  if (kind === "year") {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
      useGrouping: false,
    }).format(value);
  }
  if (Number.isInteger(value) && Math.abs(value) < 1e15) {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      useGrouping: false,
    }).format(value);
  }
  return new Intl.NumberFormat(locale, {
    maximumSignificantDigits: 6,
    useGrouping: false,
  }).format(value);
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
