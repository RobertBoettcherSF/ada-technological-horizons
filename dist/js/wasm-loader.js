// Loads the Ada module and calls its exports. Arithmetic stays in the module.

const STATUS_OK = 0;

export function createSession() {
  return {
    phase: "idle",
    invocations: 0,
    mime: "",
    message: "",
    exports: null,
  };
}

export async function loadAdditionModule(options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const instantiate = options.instantiate ?? WebAssembly.instantiate.bind(WebAssembly);
  const url = options.url ?? new URL("../ath_addition.wasm", import.meta.url);
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Ada module request failed (${response.status})`);
  }
  const mime = response.headers?.get?.("content-type") ?? "";
  const bytes = await response.arrayBuffer();
  const holder = { instance: null };
  const imports = {
    env: {
      __gnat_put_exception() {
        throw new Error("Ada runtime reported an exception");
      },
      __gnat_grow(pages) {
        const memory = holder.instance?.exports?.memory;
        if (!memory) {
          return -1;
        }
        try {
          return memory.grow(pages);
        } catch {
          return -1;
        }
      },
    },
  };
  const { instance } = await instantiate(bytes, imports);
  holder.instance = instance;
  if (typeof instance.exports.adainit !== "function") {
    throw new Error("Ada module is missing adainit");
  }
  if (typeof instance.exports.ath_add_f64 !== "function") {
    throw new Error("Ada module is missing ath_add_f64");
  }
  if (typeof instance.exports.ath_lifetime_f64 !== "function") {
    throw new Error("Ada module is missing ath_lifetime_f64");
  }
  if (typeof instance.exports.ath_rebalance_f64 !== "function") {
    throw new Error("Ada module is missing ath_rebalance_f64");
  }
  if (typeof instance.exports.ath_growth_f64 !== "function") {
    throw new Error("Ada module is missing ath_growth_f64");
  }
  if (typeof instance.exports.ath_growth_target_f64 !== "function") {
    throw new Error("Ada module is missing ath_growth_target_f64");
  }
  if (typeof instance.exports.ath_growth_explore_f64 !== "function") {
    throw new Error("Ada module is missing ath_growth_explore_f64");
  }
  if (typeof instance.exports.ath_delay_f64 !== "function") {
    throw new Error("Ada module is missing ath_delay_f64");
  }
  instance.exports.adainit();
  return {
    mime,
    exports: instance.exports,
  };
}

export function callRebalance(session, probabilities, editedIndex, editedValue) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_rebalance_f64(
    probabilities[0],
    probabilities[1],
    probabilities[2],
    probabilities[3],
    editedIndex,
    editedValue,
  );
  session.invocations += 1;
  if (status !== STATUS_OK) {
    return { status, probabilities: null };
  }
  return {
    status,
    probabilities: [1, 2, 3, 4].map((index) => session.exports.ath_rebalanced(index)),
  };
}

export function callLifetime(session, percentages, durations) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_lifetime_f64(
    percentages[0],
    percentages[1],
    percentages[2],
    percentages[3],
    durations[0],
    durations[1],
    durations[2],
    durations[3],
  );
  session.invocations += 1;
  if (status !== STATUS_OK) {
    return { status, mean: null, contributions: null };
  }
  return {
    status,
    mean: session.exports.ath_lifetime_mean(),
    contributions: [1, 2, 3, 4].map((index) => session.exports.ath_lifetime_contribution(index)),
  };
}

export function callGrowth(session, initial, doubling, elapsed, startYear) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_growth_f64(initial, doubling, elapsed, startYear);
  session.invocations += 1;
  if (status !== STATUS_OK) {
    return {
      status,
      quantity: null,
      factor: null,
      endYear: null,
      baselineStatus: null,
      samples: null,
    };
  }
  const count = session.exports.ath_growth_sample_count();
  const samples = [];
  for (let index = 1; index <= count; index += 1) {
    samples.push({
      time: session.exports.ath_growth_sample_time(index),
      quantity: session.exports.ath_growth_sample_quantity(index),
      baseline: session.exports.ath_growth_sample_baseline(index),
    });
  }
  return {
    status,
    quantity: session.exports.ath_growth_quantity(),
    factor: session.exports.ath_growth_factor(),
    endYear: session.exports.ath_growth_end_year(),
    baselineStatus: session.exports.ath_growth_baseline_status(),
    samples,
  };
}

export function callExplore(session, initial, doubling, elapsed, startYear, target, useTarget) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_growth_explore_f64(
    initial,
    doubling,
    elapsed,
    startYear,
    useTarget ? target : 0,
    useTarget ? 1 : 0,
  );
  session.invocations += 1;
  if (status !== STATUS_OK) {
    return {
      status,
      quantity: null,
      factor: null,
      evalYear: null,
      endYear: null,
      extended: false,
      baselineStatus: null,
      samples: null,
    };
  }
  const count = session.exports.ath_growth_sample_count();
  const samples = [];
  for (let index = 1; index <= count; index += 1) {
    samples.push({
      time: session.exports.ath_growth_sample_time(index),
      quantity: session.exports.ath_growth_sample_quantity(index),
      baseline: session.exports.ath_growth_sample_baseline(index),
    });
  }
  return {
    status,
    quantity: session.exports.ath_growth_quantity(),
    factor: session.exports.ath_growth_factor(),
    evalYear: session.exports.ath_growth_eval_year(),
    endYear: session.exports.ath_growth_end_year(),
    extended: session.exports.ath_growth_extended() === 1,
    baselineStatus: session.exports.ath_growth_baseline_status(),
    samples,
  };
}

export function callTarget(session, initial, doubling, elapsed, startYear, target) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_growth_target_f64(
    initial,
    doubling,
    elapsed,
    startYear,
    target,
  );
  session.invocations += 1;
  return {
    status,
    elapsed: session.exports.ath_growth_target_elapsed(),
    year: session.exports.ath_growth_target_year(),
  };
}

export function callDelay(session, distance, unit) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_delay_f64(distance, unit);
  session.invocations += 1;
  if (status !== STATUS_OK) {
    return { status, oneWay: null, roundTrip: null, events: null };
  }
  const count = session.exports.ath_delay_event_count();
  const events = [];
  for (let index = 1; index <= count; index += 1) {
    events.push(session.exports.ath_delay_event_time(index));
  }
  return {
    status,
    oneWay: session.exports.ath_delay_one_way(),
    roundTrip: session.exports.ath_delay_round_trip(),
    events,
    legs: [session.exports.ath_delay_leg_time(2), session.exports.ath_delay_leg_time(3)],
  };
}

export function delayPreset(session, index) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  return {
    distance: session.exports.ath_delay_preset_distance(index),
    unit: session.exports.ath_delay_preset_unit(index),
  };
}

export function callAddition(session, left, right) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_add_f64(left, right);
  session.invocations += 1;
  if (status !== STATUS_OK) {
    return { status, result: null };
  }
  const result = session.exports.ath_last_sum();
  return { status, result };
}
