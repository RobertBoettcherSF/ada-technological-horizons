// Names verified against the Polish text. Line numbers refer to the
// 1184-line plain-text edition. The book text is not stored here.

export const CHAPTER_KEYS = {
  "I": "dilemmas",
  "II": "two-evolutions",
  "III": "cosmic-civilisations",
  "IV": "intellectronics",
  "V": "prolegomena-to-omnipotence",
  "VI": "phantomology",
  "VII": "creating-worlds",
  "VIII": "a-lampoon-of-evolution",
  "Zakończenie": "conclusion",
  "Posłowie": "afterword",
};

const RU_LINKS = {
  "Oleg K. Tikhomirov": "https://ru.wikipedia.org/wiki/Тихомиров,_Олег_Константинович",
  "Leonid S. Marochnik": "https://ru.wikipedia.org/wiki/Марочник,_Леонид_Самойлович",
};

const UNLINKED = new Set(["Baumsztejn", "Jasper", "Jacobsen"]);

export function parseScientists(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim() !== "");
  const [header, ...rows] = lines;
  const columns = header.split("\t");
  const expected = ["chapter", "written", "lines", "full_name", "category", "status", "en", "de", "es", "fr", "pl"];
  if (columns.join("|") !== expected.join("|")) {
    throw new Error(`Unexpected scientist table header: ${header}`);
  }
  return rows.map((line, index) => {
    const cells = line.split("\t");
    if (cells.length !== expected.length) {
      throw new Error(`Scientist row ${index + 2} has ${cells.length} columns`);
    }
    const row = Object.fromEntries(expected.map((name, cell) => [name, cells[cell]]));
    if (!row.lines.trim()) {
      throw new Error(`Scientist row ${index + 2} has no line locator`);
    }
    return row;
  });
}

export function displayName(row) {
  if (row.full_name && row.full_name !== "-") return row.full_name;
  return row.written;
}

export function isUnlinked(row) {
  return row.status === "unlinked" || UNLINKED.has(row.written);
}

function articleUrl(lang, title) {
  if (!title || title === "-") return "";
  const host = lang === "en-GB" ? "en" : lang;
  return `https://${host}.wikipedia.org/wiki/${encodeURI(title)}`;
}

export function creditHref(row, lang) {
  if (isUnlinked(row)) return null;
  if (row.status === "ru-only") {
    if (lang === "pl") {
      const polish = articleUrl("pl", row.pl);
      if (polish) return { href: polish, kind: "locale" };
    }
    const href = RU_LINKS[row.full_name];
    return href ? { href, kind: "ru" } : null;
  }
  const code = lang === "en-GB" ? "en" : lang;
  const local = articleUrl(code, row[code]);
  if (local) return { href: local, kind: "locale" };
  const english = articleUrl("en", row.en);
  return english ? { href: english, kind: "locale" } : null;
}

export function scientistsForChapter(rows, chapterId) {
  return rows.filter((row) => CHAPTER_KEYS[row.chapter] === chapterId);
}

export { UNLINKED };
