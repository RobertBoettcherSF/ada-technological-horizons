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
  if (typeof instance.exports.ath_throughput_f64 !== "function") {
    throw new Error("Ada module is missing ath_throughput_f64");
  }
  if (typeof instance.exports.ath_spectrum_map !== "function") {
    throw new Error("Ada module is missing ath_spectrum_map");
  }
  if (typeof instance.exports.ath_galaxy_f64 !== "function") {
    throw new Error("Ada module is missing ath_galaxy_f64");
  }
  if (typeof instance.exports.ath_sixes_chance !== "function") {
    throw new Error("Ada module is missing ath_sixes_chance");
  }
  if (typeof instance.exports.ath_hear_power !== "function") {
    throw new Error("Ada module is missing ath_hear_power");
  }
  if (typeof instance.exports.ath_energy_stated !== "function") {
    throw new Error("Ada module is missing ath_energy_stated");
  }
  if (typeof instance.exports.ath_colony_left !== "function") {
    throw new Error("Ada module is missing ath_colony_left");
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

export function callThroughput(
  session,
  quantity,
  quantityUnit,
  rate,
  rateUnit,
  bound,
  duration,
  durationUnit,
  mode = 0,
  scale = 0,
) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  session.exports.ath_throughput_set_mode(mode);
  session.exports.ath_throughput_set_scale(scale);
  const status = session.exports.ath_throughput_f64(
    quantity,
    quantityUnit,
    rate,
    rateUnit,
    bound,
    duration,
    durationUnit,
  );
  session.invocations += 1;
  const timeValid = session.exports.ath_throughput_time_valid() === 1;
  const totalValid = session.exports.ath_throughput_total_valid() === 1;
  const chartValid = session.exports.ath_throughput_chart_valid() === 1;
  return {
    status,
    time: timeValid ? session.exports.ath_throughput_time() : null,
    timeUpper: session.exports.ath_throughput_time_upper() === 1,
    total: totalValid ? session.exports.ath_throughput_total() : null,
    totalLower: session.exports.ath_throughput_total_lower() === 1,
    human: chartValid ? session.exports.ath_throughput_human() : null,
    bacterial: chartValid ? session.exports.ath_throughput_bacterial() : null,
    ratio: chartValid ? session.exports.ath_throughput_ratio() : null,
    quantityBits: totalValid || chartValid ? session.exports.ath_throughput_quantity_bits() : null,
    rateBits: totalValid ? session.exports.ath_throughput_rate_bits() : null,
    humanRate: chartValid ? session.exports.ath_throughput_human_rate() : null,
    bacterialRate: chartValid ? session.exports.ath_throughput_bacterial_rate() : null,
    linkRate: chartValid ? session.exports.ath_throughput_link_rate() : null,
    humanLinear: chartValid ? session.exports.ath_throughput_human_linear() : null,
    bacterialLinear: chartValid ? session.exports.ath_throughput_bacterial_linear() : null,
    humanLog: chartValid ? session.exports.ath_throughput_human_log() : null,
    bacterialLog: chartValid ? session.exports.ath_throughput_bacterial_log() : null,
    linkLog: chartValid ? session.exports.ath_throughput_link_log() : null,
    linkTime: session.exports.ath_throughput_link_valid() === 1
      ? session.exports.ath_throughput_link_time()
      : null,
    match: session.exports.ath_throughput_match(),
    overHuman: session.exports.ath_throughput_ratio_valid() === 1
      ? session.exports.ath_throughput_over_human()
      : null,
    overBacterial: session.exports.ath_throughput_ratio_valid() === 1
      ? session.exports.ath_throughput_over_bacterial()
      : null,
    linearRows: readRows(session, 0, session.exports.ath_throughput_linear_count()),
    logRows: readRows(session, 1, session.exports.ath_throughput_log_count()),
    plotReady: session.exports.ath_throughput_plot_ready() === 1,
    logEmpty: session.exports.ath_throughput_log_empty() === 1,
    xMin: session.exports.ath_throughput_x_min(),
    xMax: session.exports.ath_throughput_x_max(),
    yMin: session.exports.ath_throughput_y_min(),
    yMax: session.exports.ath_throughput_y_max(),
  };
}

function readSamples(session, row) {
  const count = session.exports.ath_throughput_sample_count();
  const samples = [];
  for (let index = 1; index <= count; index += 1) {
    if (session.exports.ath_throughput_sample_ok(row, index) !== 1) continue;
    samples.push({
      time: session.exports.ath_throughput_sample_time(row, index),
      info: session.exports.ath_throughput_sample_info(row, index),
    });
  }
  return samples;
}

function readRows(session, which, count) {
  const rows = [];
  for (let index = 1; index <= count; index += 1) {
    rows.push({
      kind: session.exports.ath_throughput_row_kind(which, index),
      rate: session.exports.ath_throughput_row_rate(which, index),
      seconds: session.exports.ath_throughput_row_time_valid(which, index) === 1
        ? session.exports.ath_throughput_row_seconds(which, index)
        : null,
      share: session.exports.ath_throughput_row_share(which, index),
      lower: session.exports.ath_throughput_row_lower(which, index) === 1,
      inside: which === 0 && session.exports.ath_throughput_crossing_inside(index) === 1,
      samples: which === 0 ? readSamples(session, index) : [],
    });
  }
  return rows;
}

export function throughputPreset(session, index) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  return {
    quantity: session.exports.ath_throughput_preset_quantity(index),
    quantityUnit: session.exports.ath_throughput_preset_quantity_unit(index),
    rate: session.exports.ath_throughput_preset_rate(index),
    rateUnit: session.exports.ath_throughput_preset_rate_unit(index),
    bound: session.exports.ath_throughput_preset_bound(index),
    setsQuantity: session.exports.ath_throughput_preset_sets_quantity(index) === 1,
    setsRate: session.exports.ath_throughput_preset_sets_rate(index) === 1,
  };
}

export function callChoice(session, possibilities, repeats) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_choice_f64(possibilities, repeats);
  session.invocations += 1;
  const ready = status === 0;
  const count = ready ? session.exports.ath_choice_sample_count() : 0;
  const samples = [];
  for (let index = 1; index <= count; index += 1) {
    samples.push({
      repeats: session.exports.ath_choice_sample_repeat(index),
      bits: session.exports.ath_choice_sample_bits(index),
    });
  }
  return {
    status,
    bitsPer: ready ? session.exports.ath_choice_bits_per() : null,
    totalBits: ready ? session.exports.ath_choice_total_bits() : null,
    codePer: ready ? session.exports.ath_choice_code_per() : null,
    codeTotal: ready && session.exports.ath_choice_code_total_valid() === 1
      ? session.exports.ath_choice_code_total()
      : null,
    combinations: ready && session.exports.ath_choice_combinations_valid() === 1
      ? session.exports.ath_choice_combinations()
      : null,
    combinationsExact: ready && session.exports.ath_choice_combinations_exact() === 1,
    log10Count: ready ? session.exports.ath_choice_log10_count() : null,
    xMax: ready ? session.exports.ath_choice_x_max() : null,
    yMax: ready ? session.exports.ath_choice_y_max() : null,
    samples,
  };
}

export function callLottery(session, tickets, prizes, bought) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_lottery_f64(tickets, prizes, bought);
  session.invocations += 1;
  const ready = status === 0;
  const count = ready ? session.exports.ath_lottery_sample_count() : 0;
  const samples = [];
  for (let index = 1; index <= count; index += 1) {
    samples.push({
      bought: session.exports.ath_lottery_sample_bought(index),
      expected: session.exports.ath_lottery_sample_expected(index),
      chance: session.exports.ath_lottery_sample_chance(index),
      kind: session.exports.ath_lottery_sample_kind(index),
    });
  }
  return {
    status,
    expected: ready ? session.exports.ath_lottery_expected() : null,
    none: ready ? session.exports.ath_lottery_none() : null,
    noneRepresentable: ready && session.exports.ath_lottery_none_representable() === 1,
    noneExactZero: ready && session.exports.ath_lottery_none_exact_zero() === 1,
    noneLog10: ready ? session.exports.ath_lottery_none_log10() : null,
    atLeast: ready ? session.exports.ath_lottery_at_least() : null,
    atLeastExact: ready && session.exports.ath_lottery_at_least_exact() === 1,
    fractionValid: ready && session.exports.ath_lottery_fraction_valid() === 1,
    fractionNum: ready ? session.exports.ath_lottery_fraction_num() : null,
    fractionDen: ready ? session.exports.ath_lottery_fraction_den() : null,
    xMax: ready ? session.exports.ath_lottery_x_max() : null,
    expectedMax: ready ? session.exports.ath_lottery_expected_max() : null,
    samples,
  };
}

export function callResearch(session, discoveries0, researchers0, discoveryDoubling, researcherDoubling, elapsed) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_research_f64(
    discoveries0,
    researchers0,
    discoveryDoubling,
    researcherDoubling,
    elapsed,
  );
  session.invocations += 1;
  const ready = status === 0;
  const count = ready ? session.exports.ath_research_sample_count() : 0;
  const samples = [];
  for (let index = 1; index <= count; index += 1) {
    samples.push({
      time: session.exports.ath_research_sample_time(index),
      discoveries: session.exports.ath_research_sample_discoveries(index),
      researchers: session.exports.ath_research_sample_researchers(index),
      ratio: session.exports.ath_research_sample_ratio(index),
    });
  }
  return {
    status,
    discoveries: ready ? session.exports.ath_research_discoveries() : null,
    researchers: ready ? session.exports.ath_research_researchers() : null,
    ratio: ready ? session.exports.ath_research_ratio() : null,
    xMax: ready ? session.exports.ath_research_x_max() : null,
    indexMax: ready ? session.exports.ath_research_index_max() : null,
    ratioMax: ready ? session.exports.ath_research_ratio_max() : null,
    samples,
  };
}

export function callSpectrum(session) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  session.exports.ath_spectrum_map();
  session.invocations += 1;
  const lines = [];
  const count = session.exports.ath_spectrum_line_count();
  for (let index = 1; index <= count; index += 1) {
    lines.push({
      wavelength: session.exports.ath_spectrum_wavelength(index),
      kind: session.exports.ath_spectrum_kind(index),
      position: session.exports.ath_spectrum_position(index),
    });
  }
  const ticks = [];
  const tickCount = session.exports.ath_spectrum_tick_count();
  for (let index = 1; index <= tickCount; index += 1) {
    ticks.push({
      wavelength: session.exports.ath_spectrum_tick_wavelength(index),
      position: session.exports.ath_spectrum_tick_position(index),
    });
  }
  return {
    lines,
    ticks,
    axisMin: session.exports.ath_spectrum_axis_min(),
    axisMax: session.exports.ath_spectrum_axis_max(),
    tc99: session.exports.ath_spectrum_tc99_years(),
    tc97: session.exports.ath_spectrum_tc97_years(),
    tc98: session.exports.ath_spectrum_tc98_years(),
  };
}

export function callGalaxy(session, years, modern) {
  if (!session.exports) {
    throw new Error("Ada module is not loaded");
  }
  const status = session.exports.ath_galaxy_f64(years, modern ? 1 : 0);
  session.invocations += 1;
  const ready = status === 0;
  const samples = [];
  const sampleCount = ready ? session.exports.ath_galaxy_sample_count() : 0;
  for (let index = 1; index <= sampleCount; index += 1) {
    samples.push({
      life: session.exports.ath_galaxy_sample_life(index),
      count: session.exports.ath_galaxy_sample_count_n(index),
      distance: session.exports.ath_galaxy_sample_distance(index),
      x: session.exports.ath_galaxy_sample_x(index),
      y: session.exports.ath_galaxy_sample_y(index),
    });
  }
  const pins = [];
  const pinCount = ready ? session.exports.ath_galaxy_pin_count() : 0;
  for (let index = 1; index <= pinCount; index += 1) {
    pins.push({
      life: session.exports.ath_galaxy_pin_life(index),
      distance: session.exports.ath_galaxy_pin_distance(index),
      upper: session.exports.ath_galaxy_pin_upper(index) === 1,
      slider: session.exports.ath_galaxy_pin_slider(index),
      y: session.exports.ath_galaxy_pin_y(index),
    });
  }
  const dots = [];
  const dotCount = session.exports.ath_galaxy_dot_count();
  for (let index = 1; index <= dotCount; index += 1) {
    const brightness = ready ? session.exports.ath_galaxy_dot_brightness(index, years) : 0;
    dots.push({
      x: session.exports.ath_galaxy_dot_x(index),
      y: session.exports.ath_galaxy_dot_y(index),
      brightness,
      lit: brightness >= 0.5,
    });
  }
  return {
    status,
    count: ready ? session.exports.ath_galaxy_count() : null,
    distance: ready ? session.exports.ath_galaxy_distance() : null,
    distanceKnown: ready && session.exports.ath_galaxy_distance_known() === 1,
    share: ready ? session.exports.ath_galaxy_share() : 0,
    saturated: ready && session.exports.ath_galaxy_saturated() === 1,
    caption: ready ? session.exports.ath_galaxy_caption() : 0,
    systems: ready ? session.exports.ath_galaxy_systems() : null,
    windowYears: session.exports.ath_galaxy_window(),
    radius: session.exports.ath_galaxy_radius(),
    ring: session.exports.ath_galaxy_ring(),
    bookYears: session.exports.ath_galaxy_book_years(),
    distanceMin: session.exports.ath_galaxy_distance_min(),
    distanceMax: session.exports.ath_galaxy_distance_max(),
    distancePos: ready && session.exports.ath_galaxy_distance_known() === 1
      ? session.exports.ath_galaxy_distance_pos(session.exports.ath_galaxy_distance())
      : null,
    slider: session.exports.ath_galaxy_slider_of(years),
    samples,
    pins,
    dots,
  };
}

function sixesSamples(session, kind) {
  const count = session.exports.ath_sixes_sample_count();
  const samples = [];
  for (let index = 1; index <= count; index += 1) {
    if (kind === "eggs") {
      samples.push({
        amount: session.exports.ath_sixes_egg_sample_eggs(index),
        chance: session.exports.ath_sixes_egg_sample_chance(index),
        x: session.exports.ath_sixes_egg_sample_x(index),
      });
    } else {
      samples.push({
        amount: session.exports.ath_sixes_sample_players(index),
        chance: session.exports.ath_sixes_sample_chance(index),
        x: session.exports.ath_sixes_sample_x(index),
      });
    }
  }
  return samples;
}

export function callSixes(session, players) {
  if (!session.exports) throw new Error("Ada module is not loaded");
  const ladder = [];
  const ladderCount = session.exports.ath_sixes_ladder_count();
  for (let index = 1; index <= ladderCount; index += 1) {
    const amount = session.exports.ath_sixes_ladder_players(index);
    session.exports.ath_sixes_chance(amount);
    const chance = session.exports.ath_sixes_chance_value();
    ladder.push({
      amount,
      chance,
      word: session.exports.ath_sixes_word(chance),
    });
  }
  const status = session.exports.ath_sixes_chance(players);
  session.invocations += 1;
  const ready = status === 0;
  const crowdCount = session.exports.ath_sixes_crowd_count();
  const crowd = [];
  for (let index = 1; index <= crowdCount; index += 1) {
    crowd.push(session.exports.ath_sixes_crowd_mark(index, players) === 1);
  }
  return {
    status,
    chance: ready ? session.exports.ath_sixes_chance_value() : null,
    caption: ready ? session.exports.ath_sixes_caption() : 0,
    single: session.exports.ath_sixes_single(),
    expected: session.exports.ath_sixes_expected(players),
    group: session.exports.ath_sixes_crowd_group(players),
    word: ready ? session.exports.ath_sixes_word(session.exports.ath_sixes_chance_value()) : 0,
    crowd,
    ladder,
    slider: session.exports.ath_sixes_slider_of(players),
    samples: ready ? sixesSamples(session, "players") : [],
  };
}

export function callSixesUntil(session, draw) {
  if (!session.exports) throw new Error("Ada module is not loaded");
  session.invocations += 1;
  return session.exports.ath_sixes_throws_until(draw);
}

export function callSixesRoll(session, setIndex) {
  if (!session.exports) throw new Error("Ada module is not loaded");
  const status = session.exports.ath_sixes_roll(setIndex);
  session.invocations += 1;
  const faces = [];
  for (let die = 1; die <= 10; die += 1) {
    faces.push(session.exports.ath_sixes_face(die));
  }
  return { status, faces, sixes: session.exports.ath_sixes_six_count() };
}

export function callEggs(session, eggs) {
  if (!session.exports) throw new Error("Ada module is not loaded");
  const status = session.exports.ath_sixes_egg_chance(eggs);
  session.invocations += 1;
  const ready = status === 0;
  return {
    status,
    chance: ready ? session.exports.ath_sixes_egg_chance_value() : null,
    expected: ready ? session.exports.ath_sixes_egg_expected() : null,
    caption: ready ? session.exports.ath_sixes_caption(session.exports.ath_sixes_egg_chance_value()) : 0,
    clutch: session.exports.ath_sixes_egg_count(),
    single: session.exports.ath_sixes_egg_single(),
    slider: session.exports.ath_sixes_egg_slider(eggs),
    samples: ready ? sixesSamples(session, "eggs") : [],
  };
}

export function callEnergy(session, years) {
  if (!session.exports) throw new Error("Ada module is not loaded");
  session.invocations += 1;
  const count = session.exports.ath_energy_sample_count();
  const samples = [];
  for (let index = 1; index <= count; index += 1) {
    const sampleYears = session.exports.ath_energy_sample_years(index);
    samples.push({
      years: sampleYears,
      stated: session.exports.ath_energy_on_path(sampleYears),
      third: session.exports.ath_energy_on_third(sampleYears),
    });
  }
  return {
    years,
    rate: session.exports.ath_energy_rate(),
    thirdFactor: session.exports.ath_energy_third(years),
    statedFactor: session.exports.ath_energy_stated(years),
    today: session.exports.ath_energy_today(),
    energy: session.exports.ath_energy_on_path(years),
    thirdEnergy: session.exports.ath_energy_on_third(years),
    sunShare: session.exports.ath_energy_sun_share(years),
    sun: session.exports.ath_energy_sun(),
    modernSun: session.exports.ath_energy_modern_sun(),
    steps: [1, 2, 3].map((index) => session.exports.ath_energy_kardashev(index)),
    stars: session.exports.ath_energy_stars(),
    horizon: session.exports.ath_energy_horizon(),
    samples,
  };
}

export function callColony(session, choice, years, hopLy, hopYears, origin) {
  if (!session.exports) throw new Error("Ada module is not loaded");
  session.invocations += 1;
  const cellCount = session.exports.ath_colony_cell_count();
  const cells = [];
  for (let index = 1; index <= cellCount; index += 1) {
    cells.push(session.exports.ath_colony_cell_role(index, choice));
  }
  const starCount = session.exports.ath_colony_star_count();
  const stars = [];
  for (let index = 1; index <= starCount; index += 1) {
    stars.push({
      x: session.exports.ath_colony_star_x(index),
      y: session.exports.ath_colony_star_y(index),
      generation: session.exports.ath_colony_generation(index, origin, hopLy),
    });
  }
  const sampleCount = session.exports.ath_colony_sample_count();
  const samples = [];
  for (let index = 1; index <= sampleCount; index += 1) {
    const sampleYears = session.exports.ath_colony_sample_years(index);
    session.exports.ath_colony_survivors(choice, sampleYears);
    samples.push({ years: sampleYears, alive: session.exports.ath_colony_alive() });
  }
  const survivorStatus = session.exports.ath_colony_survivors(choice, years);
  const fillStatus = session.exports.ath_colony_fill(hopLy, hopYears);
  const fillYears = session.exports.ath_colony_fill_years();
  return {
    survivorStatus,
    fillStatus,
    left: session.exports.ath_colony_left(),
    self: session.exports.ath_colony_self(),
    other: session.exports.ath_colony_other(),
    escapers: session.exports.ath_colony_escapers(choice),
    faded: session.exports.ath_colony_faded(choice),
    alive: session.exports.ath_colony_alive(),
    distance: session.exports.ath_colony_distance(),
    oneIn: session.exports.ath_colony_one_in(session.exports.ath_colony_alive()),
    showsCount: session.exports.ath_colony_shows_count(session.exports.ath_colony_alive()) === 1,
    distanceOk: session.exports.ath_colony_distance_fits(
      session.exports.ath_colony_alive(),
      session.exports.ath_colony_distance(),
    ) === 1,
    hops: session.exports.ath_colony_hops(),
    fillYears,
    times: session.exports.ath_colony_times(years, fillYears),
    cells,
    stars,
    samples,
    windowYears: session.exports.ath_colony_window(),
    radius: session.exports.ath_colony_radius(),
    lifeMin: session.exports.ath_colony_life_min(),
    lifeMax: session.exports.ath_colony_life_max(),
  };
}

export function callHear(session, distance) {
  if (!session.exports) throw new Error("Ada module is not loaded");
  session.invocations += 1;
  const count = session.exports.ath_hear_sample_count();
  const samples = [];
  for (let index = 1; index <= count; index += 1) {
    samples.push({
      distance: session.exports.ath_hear_sample_distance(index),
      power: session.exports.ath_hear_sample_power(index),
      x: session.exports.ath_hear_sample_x(index),
    });
  }
  return {
    distance,
    power: session.exports.ath_hear_power(distance),
    intensity: session.exports.ath_hear_intensity(distance),
    gain: session.exports.ath_hear_gain(distance),
    slider: session.exports.ath_hear_slider_of(distance),
    reference: session.exports.ath_hear_reference(),
    far: session.exports.ath_hear_far(),
    oneWay: session.exports.ath_hear_letter_years(distance),
    round: session.exports.ath_hear_letter_round(distance),
    generations: session.exports.ath_hear_generations(distance),
    generationYears: session.exports.ath_hear_generation_years(),
    dishLem: session.exports.ath_hear_dish_lem(),
    ozmaFeet: session.exports.ath_hear_ozma_feet(),
    ozmaMetres: session.exports.ath_hear_ozma_metres(),
    samples,
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
