const TYPE_RANK = {
  calculator: 0,
  explanation: 1,
  exploratory: 2,
  "technical-demo": 3,
  planned: 4,
};

function bookCompare(left, right) {
  if (left.bookOrder !== right.bookOrder) {
    return left.bookOrder - right.bookOrder;
  }
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

export function sortEntries(entries, mode, locale, labelOf) {
  const copy = entries.slice();
  copy.sort((left, right) => {
    if (mode === "calculators") {
      const rank =
        (TYPE_RANK[left.type] ?? 9) - (TYPE_RANK[right.type] ?? 9);
      if (rank !== 0) {
        return rank;
      }
      return bookCompare(left, right);
    }
    if (mode === "topic") {
      const compared = labelOf(left).topic.localeCompare(labelOf(right).topic, locale, {
        sensitivity: "base",
        numeric: true,
      });
      if (compared !== 0) {
        return compared;
      }
      return bookCompare(left, right);
    }
    if (mode === "title") {
      const compared = labelOf(left).title.localeCompare(labelOf(right).title, locale, {
        sensitivity: "base",
        numeric: true,
      });
      if (compared !== 0) {
        return compared;
      }
      return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
    }
    return bookCompare(left, right);
  });
  return copy;
}

export function activeFilterCount(state) {
  return (
    state.filters.chapter.size +
    state.filters.topic.size +
    state.filters.type.size +
    (state.query.trim() === "" ? 0 : 1)
  );
}

export function entryVisible(entry, state, labelOf) {
  const query = state.query.trim().toLocaleLowerCase(state.lang);
  if (query !== "") {
    const labels = labelOf(entry);
    const haystack = `${labels.title}\n${labels.summary}\n${labels.topic}`.toLocaleLowerCase(
      state.lang,
    );
    if (!haystack.includes(query)) {
      return false;
    }
  }
  if (state.filters.chapter.size > 0 && !state.filters.chapter.has(entry.chapterId)) {
    return false;
  }
  if (state.filters.topic.size > 0 && !state.filters.topic.has(entry.topicId)) {
    return false;
  }
  if (state.filters.type.size > 0 && !state.filters.type.has(entry.type)) {
    return false;
  }
  return true;
}

export function visibleEntries(entries, state, labelOf) {
  return sortEntries(
    entries.filter((entry) => entryVisible(entry, state, labelOf)),
    state.sort,
    state.lang,
    labelOf,
  );
}

export function countWorkingCalculators(entries) {
  return entries.filter(
    (entry) => entry.type === "calculator" && entry.availability === "available",
  ).length;
}

export function bookSequence(entries) {
  return entries
    .filter((entry) => entry.inBook)
    .slice()
    .sort(bookCompare);
}

export function neighbors(entries, id) {
  const sequence = bookSequence(entries);
  const index = sequence.findIndex((entry) => entry.id === id);
  if (index < 0) {
    return { previous: null, next: null };
  }
  return {
    previous: sequence[index - 1] ?? null,
    next: sequence[index + 1] ?? null,
  };
}

export function groupEntries(entries, mode) {
  if (mode !== "reading" && mode !== "topic") {
    return [{ key: "flat", kind: "flat", entries }];
  }
  const groups = [];
  for (const entry of entries) {
    const key = mode === "topic" ? entry.topicId : entry.chapterId;
    const last = groups[groups.length - 1];
    if (!last || last.key !== key) {
      groups.push({
        key,
        kind: mode === "topic" ? "topic" : "chapter",
        entries: [entry],
      });
    } else {
      last.entries.push(entry);
    }
  }
  return groups;
}
