#!/usr/bin/env bash
# Build the native fixture, the Wasm module, and the static dist/ snapshot.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ADAWEBPACK_URL="https://github.com/godunko/adawebpack/releases/download/24.0.0/adawebpack-24.0.0.tar.gz"
ADAWEBPACK_SHA256="8edaae8b9987a20aec430d750f30033f12f953ce2b6437afb87fbf8cc1063796"
TOOLCHAIN="${ATH_ADAWEBPACK:-$ROOT/toolchain/adawebpack}"
CACHE="$ROOT/toolchain/adawebpack-24.0.0.tar.gz"

if ! command -v gnatmake >/dev/null; then
  echo "gnatmake is required (Ubuntu package: gnat)." >&2
  exit 1
fi
if ! command -v curl >/dev/null || ! command -v sha256sum >/dev/null; then
  echo "curl and sha256sum are required." >&2
  exit 1
fi

mkdir -p "$ROOT/toolchain" "$ROOT/build/native" "$ROOT/build/wasm" "$ROOT/dist/js"

if [[ ! -x "$TOOLCHAIN/bin/llvm-gcc" ]]; then
  if [[ ! -f "$CACHE" ]]; then
    echo "Downloading AdaWebPack 24.0.0…"
    curl -fL --retry 3 -o "$CACHE.partial" "$ADAWEBPACK_URL"
    mv "$CACHE.partial" "$CACHE"
  fi
  echo "$ADAWEBPACK_SHA256  $CACHE" | sha256sum -c -
  tar -xzf "$CACHE" -C "$ROOT/toolchain"
fi

if [[ ! -x "$TOOLCHAIN/bin/llvm-gcc" ]]; then
  echo "AdaWebPack llvm-gcc was not found at $TOOLCHAIN/bin/llvm-gcc" >&2
  exit 1
fi

WASM_LD_BIN=""
for candidate in \
  "${WASM_LD:-}" \
  /usr/lib/llvm-16/bin/wasm-ld \
  /usr/bin/wasm-ld-16 \
  /usr/bin/wasm-ld
do
  if [[ -n "$candidate" && -x "$candidate" ]]; then
    WASM_LD_BIN="$candidate"
    break
  fi
done
if [[ -z "$WASM_LD_BIN" ]]; then
  echo "wasm-ld is required (Ubuntu packages: llvm-16 and lld-16)." >&2
  exit 1
fi
export PATH="$(dirname "$WASM_LD_BIN"):$TOOLCHAIN/bin:$PATH"

echo "Native GNAT: $(gnatmake --version | head -n 1)"
echo "Wasm compiler: $("$TOOLCHAIN/bin/llvm-gcc" -v 2>&1 | tail -n 1)"
echo "Linker: $WASM_LD_BIN ($("$WASM_LD_BIN" --version | head -n 1))"

rm -rf "$ROOT/build/native" "$ROOT/build/wasm"
mkdir -p "$ROOT/build/native" "$ROOT/build/wasm"

gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/addition_tests" \
  "$ROOT/tests/native/addition_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/addition_tests" | tee "$ROOT/build/native/fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/lifetime_tests" \
  "$ROOT/tests/native/lifetime_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/lifetime_tests" | tee "$ROOT/build/native/lifetime-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/growth_tests" \
  "$ROOT/tests/native/growth_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/growth_tests" | tee "$ROOT/build/native/growth-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/delay_tests" \
  "$ROOT/tests/native/delay_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/delay_tests" | tee "$ROOT/build/native/delay-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/throughput_tests" \
  "$ROOT/tests/native/throughput_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/throughput_tests" | tee "$ROOT/build/native/throughput-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/choice_tests" \
  "$ROOT/tests/native/choice_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/choice_tests" | tee "$ROOT/build/native/choice-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/lottery_tests" \
  "$ROOT/tests/native/lottery_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/lottery_tests" | tee "$ROOT/build/native/lottery-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/research_tests" \
  "$ROOT/tests/native/research_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/research_tests" | tee "$ROOT/build/native/research-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/spectrum_tests" \
  "$ROOT/tests/native/spectrum_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/spectrum_tests" | tee "$ROOT/build/native/spectrum-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/galaxy_tests" \
  "$ROOT/tests/native/galaxy_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/galaxy_tests" | tee "$ROOT/build/native/galaxy-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/sixes_tests" \
  "$ROOT/tests/native/sixes_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/sixes_tests" | tee "$ROOT/build/native/sixes-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/hear_tests" \
  "$ROOT/tests/native/hear_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/hear_tests" | tee "$ROOT/build/native/hear-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/energy_tests" \
  "$ROOT/tests/native/energy_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/energy_tests" | tee "$ROOT/build/native/energy-fixtures.txt"
gnatmake -D "$ROOT/build/native" -o "$ROOT/build/native/colony_tests" \
  "$ROOT/tests/native/colony_tests.adb" \
  -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
"$ROOT/build/native/colony_tests" | tee "$ROOT/build/native/colony-fixtures.txt"

compile_wasm() {
  local Source="$1"
  local Object="$2"
  "$TOOLCHAIN/bin/llvm-gcc" -c -x ada "$Source" \
    --target=wasm32 -gnatA -I"$ROOT/ada/core" -I"$ROOT/ada/browser" \
    -o "$ROOT/build/wasm/$Object"
}
compile_wasm "$ROOT/ada/core/ath_addition.adb" ath_addition.o
compile_wasm "$ROOT/ada/core/ath_lifetime.adb" ath_lifetime.o
compile_wasm "$ROOT/ada/core/ath_growth.adb" ath_growth.o
compile_wasm "$ROOT/ada/core/ath_delay.adb" ath_delay.o
compile_wasm "$ROOT/ada/core/ath_throughput.adb" ath_throughput.o
compile_wasm "$ROOT/ada/core/ath_choice.adb" ath_choice.o
compile_wasm "$ROOT/ada/core/ath_lottery.adb" ath_lottery.o
compile_wasm "$ROOT/ada/core/ath_research.adb" ath_research.o
compile_wasm "$ROOT/ada/core/ath_spectrum.adb" ath_spectrum.o
compile_wasm "$ROOT/ada/core/ath_galaxy.adb" ath_galaxy.o
compile_wasm "$ROOT/ada/core/ath_sixes.adb" ath_sixes.o
compile_wasm "$ROOT/ada/core/ath_hear.adb" ath_hear.o
compile_wasm "$ROOT/ada/core/ath_energy.adb" ath_energy.o
compile_wasm "$ROOT/ada/core/ath_colony.adb" ath_colony.o
compile_wasm "$ROOT/ada/browser/ath_addition_exports.adb" ath_addition_exports.o
compile_wasm "$ROOT/ada/browser/ath_lifetime_exports.adb" ath_lifetime_exports.o
compile_wasm "$ROOT/ada/browser/ath_growth_exports.adb" ath_growth_exports.o
compile_wasm "$ROOT/ada/browser/ath_delay_exports.adb" ath_delay_exports.o
compile_wasm "$ROOT/ada/browser/ath_throughput_exports.adb" ath_throughput_exports.o
compile_wasm "$ROOT/ada/browser/ath_choice_exports.adb" ath_choice_exports.o
compile_wasm "$ROOT/ada/browser/ath_lottery_exports.adb" ath_lottery_exports.o
compile_wasm "$ROOT/ada/browser/ath_research_exports.adb" ath_research_exports.o
compile_wasm "$ROOT/ada/browser/ath_spectrum_exports.adb" ath_spectrum_exports.o
compile_wasm "$ROOT/ada/browser/ath_galaxy_exports.adb" ath_galaxy_exports.o
compile_wasm "$ROOT/ada/browser/ath_sixes_exports.adb" ath_sixes_exports.o
compile_wasm "$ROOT/ada/browser/ath_hear_exports.adb" ath_hear_exports.o
compile_wasm "$ROOT/ada/browser/ath_energy_exports.adb" ath_energy_exports.o
compile_wasm "$ROOT/ada/browser/ath_colony_exports.adb" ath_colony_exports.o
compile_wasm "$ROOT/ada/browser/ath_browser.ads" ath_browser.o
(
  cd "$ROOT/build/wasm"
  "$TOOLCHAIN/bin/llvm-gnatbind" -n ath_browser.ali \
    -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
  "$TOOLCHAIN/bin/llvm-gcc" -c -x ada b~ath_browser.adb \
    --target=wasm32 -gnatA -I"$ROOT/ada/core" -I"$ROOT/ada/browser" \
    -o b~ath_browser.o
  "$TOOLCHAIN/bin/llvm-gcc" --target=wasm32 -o ath_addition.wasm \
    ath_addition.o ath_lifetime.o ath_growth.o ath_delay.o ath_throughput.o ath_choice.o ath_lottery.o ath_research.o ath_spectrum.o ath_galaxy.o ath_sixes.o ath_hear.o ath_energy.o ath_colony.o \
    ath_addition_exports.o ath_lifetime_exports.o ath_growth_exports.o ath_delay_exports.o ath_throughput_exports.o ath_choice_exports.o ath_lottery_exports.o ath_research_exports.o ath_spectrum_exports.o ath_galaxy_exports.o ath_sixes_exports.o ath_hear_exports.o ath_energy_exports.o ath_colony_exports.o \
    ath_browser.o b~ath_browser.o \
    -L"$TOOLCHAIN/lib/rts-native/adalib" -lgnat \
    -nostdlib \
    -Wl,--no-entry \
    -Wl,--allow-undefined \
    -Wl,--gc-sections \
    -Wl,--export=adainit \
    -Wl,--export=adafinal \
    -Wl,--export=ath_add_f64 \
    -Wl,--export=ath_last_sum \
    -Wl,--export=ath_lifetime_f64 \
    -Wl,--export=ath_lifetime_mean \
    -Wl,--export=ath_lifetime_contribution \
    -Wl,--export=ath_rebalance_f64 \
    -Wl,--export=ath_rebalanced \
    -Wl,--export=ath_growth_f64 \
    -Wl,--export=ath_growth_quantity \
    -Wl,--export=ath_growth_factor \
    -Wl,--export=ath_growth_sample_count \
    -Wl,--export=ath_growth_sample_time \
    -Wl,--export=ath_growth_sample_quantity \
    -Wl,--export=ath_growth_end_year \
    -Wl,--export=ath_growth_eval_year \
    -Wl,--export=ath_growth_extended \
    -Wl,--export=ath_growth_explore_f64 \
    -Wl,--export=ath_growth_baseline_status \
    -Wl,--export=ath_growth_sample_baseline \
    -Wl,--export=ath_growth_target_f64 \
    -Wl,--export=ath_growth_target_elapsed \
    -Wl,--export=ath_growth_target_year \
    -Wl,--export=ath_delay_f64 \
    -Wl,--export=ath_delay_one_way \
    -Wl,--export=ath_delay_round_trip \
    -Wl,--export=ath_delay_event_count \
    -Wl,--export=ath_delay_event_time \
    -Wl,--export=ath_delay_preset_count \
    -Wl,--export=ath_delay_preset_distance \
    -Wl,--export=ath_delay_preset_unit \
    -Wl,--export=ath_delay_leg_time \
    -Wl,--export=ath_throughput_set_mode \
    -Wl,--export=ath_throughput_set_scale \
    -Wl,--export=ath_throughput_f64 \
    -Wl,--export=ath_throughput_time_valid \
    -Wl,--export=ath_throughput_time \
    -Wl,--export=ath_throughput_time_upper \
    -Wl,--export=ath_throughput_total_valid \
    -Wl,--export=ath_throughput_total \
    -Wl,--export=ath_throughput_total_lower \
    -Wl,--export=ath_throughput_chart_valid \
    -Wl,--export=ath_throughput_human \
    -Wl,--export=ath_throughput_bacterial \
    -Wl,--export=ath_throughput_ratio \
    -Wl,--export=ath_throughput_quantity_bits \
    -Wl,--export=ath_throughput_rate_bits \
    -Wl,--export=ath_throughput_preset_count \
    -Wl,--export=ath_throughput_preset_quantity \
    -Wl,--export=ath_throughput_preset_quantity_unit \
    -Wl,--export=ath_throughput_preset_rate \
    -Wl,--export=ath_throughput_preset_rate_unit \
    -Wl,--export=ath_throughput_preset_bound \
    -Wl,--export=ath_throughput_preset_sets_quantity \
    -Wl,--export=ath_throughput_preset_sets_rate \
    -Wl,--export=ath_throughput_human_rate \
    -Wl,--export=ath_throughput_bacterial_rate \
    -Wl,--export=ath_throughput_link_rate \
    -Wl,--export=ath_throughput_human_linear \
    -Wl,--export=ath_throughput_bacterial_linear \
    -Wl,--export=ath_throughput_human_log \
    -Wl,--export=ath_throughput_bacterial_log \
    -Wl,--export=ath_throughput_link_log \
    -Wl,--export=ath_throughput_link_time \
    -Wl,--export=ath_throughput_link_valid \
    -Wl,--export=ath_throughput_match \
    -Wl,--export=ath_throughput_over_human \
    -Wl,--export=ath_throughput_over_bacterial \
    -Wl,--export=ath_throughput_ratio_valid \
    -Wl,--export=ath_throughput_linear_count \
    -Wl,--export=ath_throughput_log_count \
    -Wl,--export=ath_throughput_row_kind \
    -Wl,--export=ath_throughput_row_rate \
    -Wl,--export=ath_throughput_row_seconds \
    -Wl,--export=ath_throughput_row_share \
    -Wl,--export=ath_throughput_row_lower \
    -Wl,--export=ath_throughput_row_time_valid \
    -Wl,--export=ath_throughput_plot_ready \
    -Wl,--export=ath_throughput_log_empty \
    -Wl,--export=ath_throughput_x_min \
    -Wl,--export=ath_throughput_x_max \
    -Wl,--export=ath_throughput_y_min \
    -Wl,--export=ath_throughput_y_max \
    -Wl,--export=ath_throughput_sample_count \
    -Wl,--export=ath_throughput_sample_time \
    -Wl,--export=ath_throughput_sample_info \
    -Wl,--export=ath_throughput_sample_ok \
    -Wl,--export=ath_throughput_crossing_inside \
    -Wl,--export=ath_choice_f64 \
    -Wl,--export=ath_choice_bits_per \
    -Wl,--export=ath_choice_total_bits \
    -Wl,--export=ath_choice_code_per \
    -Wl,--export=ath_choice_code_total \
    -Wl,--export=ath_choice_code_total_valid \
    -Wl,--export=ath_choice_combinations \
    -Wl,--export=ath_choice_combinations_valid \
    -Wl,--export=ath_choice_combinations_exact \
    -Wl,--export=ath_choice_log10_count \
    -Wl,--export=ath_choice_x_max \
    -Wl,--export=ath_choice_y_max \
    -Wl,--export=ath_choice_sample_count \
    -Wl,--export=ath_choice_sample_repeat \
    -Wl,--export=ath_choice_sample_bits \
    -Wl,--export=ath_lottery_f64 \
    -Wl,--export=ath_lottery_expected \
    -Wl,--export=ath_lottery_none \
    -Wl,--export=ath_lottery_none_representable \
    -Wl,--export=ath_lottery_none_exact_zero \
    -Wl,--export=ath_lottery_none_log10 \
    -Wl,--export=ath_lottery_at_least \
    -Wl,--export=ath_lottery_at_least_exact \
    -Wl,--export=ath_lottery_fraction_valid \
    -Wl,--export=ath_lottery_fraction_num \
    -Wl,--export=ath_lottery_fraction_den \
    -Wl,--export=ath_lottery_x_max \
    -Wl,--export=ath_lottery_expected_max \
    -Wl,--export=ath_lottery_sample_count \
    -Wl,--export=ath_lottery_sample_bought \
    -Wl,--export=ath_lottery_sample_expected \
    -Wl,--export=ath_lottery_sample_chance \
    -Wl,--export=ath_lottery_sample_kind \
    -Wl,--export=ath_research_f64 \
    -Wl,--export=ath_research_discoveries \
    -Wl,--export=ath_research_researchers \
    -Wl,--export=ath_research_ratio \
    -Wl,--export=ath_research_x_max \
    -Wl,--export=ath_research_index_max \
    -Wl,--export=ath_research_ratio_max \
    -Wl,--export=ath_research_sample_count \
    -Wl,--export=ath_research_sample_time \
    -Wl,--export=ath_research_sample_discoveries \
    -Wl,--export=ath_research_sample_researchers \
    -Wl,--export=ath_research_sample_ratio \
    -Wl,--export=ath_spectrum_map \
    -Wl,--export=ath_spectrum_line_count \
    -Wl,--export=ath_spectrum_wavelength \
    -Wl,--export=ath_spectrum_kind \
    -Wl,--export=ath_spectrum_position \
    -Wl,--export=ath_spectrum_axis_min \
    -Wl,--export=ath_spectrum_axis_max \
    -Wl,--export=ath_spectrum_tick_count \
    -Wl,--export=ath_spectrum_tick_wavelength \
    -Wl,--export=ath_spectrum_tick_position \
    -Wl,--export=ath_spectrum_tc99_years \
    -Wl,--export=ath_spectrum_tc97_years \
    -Wl,--export=ath_spectrum_tc98_years \
    -Wl,--export=ath_spectrum_place \
    -Wl,--export=ath_spectrum_place_position \
    -Wl,--export=ath_galaxy_f64 \
    -Wl,--export=ath_galaxy_count \
    -Wl,--export=ath_galaxy_distance \
    -Wl,--export=ath_galaxy_distance_known \
    -Wl,--export=ath_galaxy_share \
    -Wl,--export=ath_galaxy_saturated \
    -Wl,--export=ath_galaxy_caption \
    -Wl,--export=ath_galaxy_systems \
    -Wl,--export=ath_galaxy_window \
    -Wl,--export=ath_galaxy_radius \
    -Wl,--export=ath_galaxy_ring \
    -Wl,--export=ath_galaxy_book_years \
    -Wl,--export=ath_galaxy_slider_of \
    -Wl,--export=ath_galaxy_years_of \
    -Wl,--export=ath_galaxy_dot_count \
    -Wl,--export=ath_galaxy_dot_x \
    -Wl,--export=ath_galaxy_dot_y \
    -Wl,--export=ath_galaxy_dot_brightness \
    -Wl,--export=ath_galaxy_dot_lit \
    -Wl,--export=ath_galaxy_sample_count \
    -Wl,--export=ath_galaxy_sample_life \
    -Wl,--export=ath_galaxy_sample_count_n \
    -Wl,--export=ath_galaxy_sample_distance \
    -Wl,--export=ath_galaxy_sample_x \
    -Wl,--export=ath_galaxy_sample_y \
    -Wl,--export=ath_galaxy_distance_min \
    -Wl,--export=ath_galaxy_distance_max \
    -Wl,--export=ath_galaxy_distance_pos \
    -Wl,--export=ath_galaxy_pin_count \
    -Wl,--export=ath_galaxy_pin_life \
    -Wl,--export=ath_galaxy_pin_distance \
    -Wl,--export=ath_galaxy_pin_upper \
    -Wl,--export=ath_galaxy_pin_slider \
    -Wl,--export=ath_galaxy_pin_y \
    -Wl,--export=ath_sixes_single \
    -Wl,--export=ath_sixes_chance \
    -Wl,--export=ath_sixes_chance_value \
    -Wl,--export=ath_sixes_caption \
    -Wl,--export=ath_sixes_players_of \
    -Wl,--export=ath_sixes_slider_of \
    -Wl,--export=ath_sixes_sample_count \
    -Wl,--export=ath_sixes_sample_players \
    -Wl,--export=ath_sixes_sample_chance \
    -Wl,--export=ath_sixes_sample_x \
    -Wl,--export=ath_sixes_egg_count \
    -Wl,--export=ath_sixes_egg_single \
    -Wl,--export=ath_sixes_eggs_of \
    -Wl,--export=ath_sixes_egg_slider \
    -Wl,--export=ath_sixes_egg_chance \
    -Wl,--export=ath_sixes_egg_chance_value \
    -Wl,--export=ath_sixes_egg_expected \
    -Wl,--export=ath_sixes_egg_sample_eggs \
    -Wl,--export=ath_sixes_egg_sample_chance \
    -Wl,--export=ath_sixes_egg_sample_x \
    -Wl,--export=ath_sixes_roll \
    -Wl,--export=ath_sixes_face \
    -Wl,--export=ath_sixes_six_count \
    -Wl,--export=ath_sixes_expected \
    -Wl,--export=ath_sixes_crowd_count \
    -Wl,--export=ath_sixes_crowd_group \
    -Wl,--export=ath_sixes_crowd_mark \
    -Wl,--export=ath_sixes_throws_until \
    -Wl,--export=ath_sixes_ladder_count \
    -Wl,--export=ath_sixes_ladder_players \
    -Wl,--export=ath_sixes_word \
    -Wl,--export=ath_hear_power \
    -Wl,--export=ath_hear_intensity \
    -Wl,--export=ath_hear_gain \
    -Wl,--export=ath_hear_distance_of \
    -Wl,--export=ath_hear_slider_of \
    -Wl,--export=ath_hear_reference \
    -Wl,--export=ath_hear_far \
    -Wl,--export=ath_hear_min \
    -Wl,--export=ath_hear_max \
    -Wl,--export=ath_hear_letter_years \
    -Wl,--export=ath_hear_letter_round \
    -Wl,--export=ath_hear_generations \
    -Wl,--export=ath_hear_generation_years \
    -Wl,--export=ath_hear_dish_lem \
    -Wl,--export=ath_hear_ozma_feet \
    -Wl,--export=ath_hear_ozma_metres \
    -Wl,--export=ath_hear_sample_count \
    -Wl,--export=ath_hear_sample_distance \
    -Wl,--export=ath_hear_sample_power \
    -Wl,--export=ath_hear_sample_x \
    -Wl,--export=ath_energy_rate \
    -Wl,--export=ath_energy_third \
    -Wl,--export=ath_energy_stated \
    -Wl,--export=ath_energy_today \
    -Wl,--export=ath_energy_on_path \
    -Wl,--export=ath_energy_on_third \
    -Wl,--export=ath_energy_sun_share \
    -Wl,--export=ath_energy_sun \
    -Wl,--export=ath_energy_modern_sun \
    -Wl,--export=ath_energy_kardashev \
    -Wl,--export=ath_energy_stars \
    -Wl,--export=ath_energy_horizon \
    -Wl,--export=ath_energy_sample_count \
    -Wl,--export=ath_energy_sample_years \
    -Wl,--export=ath_colony_left \
    -Wl,--export=ath_colony_self \
    -Wl,--export=ath_colony_other \
    -Wl,--export=ath_colony_escapers \
    -Wl,--export=ath_colony_survivors \
    -Wl,--export=ath_colony_alive \
    -Wl,--export=ath_colony_distance \
    -Wl,--export=ath_colony_life_of \
    -Wl,--export=ath_colony_slider_of \
    -Wl,--export=ath_colony_cell_count \
    -Wl,--export=ath_colony_cell_role \
    -Wl,--export=ath_colony_fill \
    -Wl,--export=ath_colony_hops \
    -Wl,--export=ath_colony_fill_years \
    -Wl,--export=ath_colony_times \
    -Wl,--export=ath_colony_star_count \
    -Wl,--export=ath_colony_star_x \
    -Wl,--export=ath_colony_star_y \
    -Wl,--export=ath_colony_generation \
    -Wl,--export=ath_colony_sample_count \
    -Wl,--export=ath_colony_sample_years \
    -Wl,--export=ath_colony_window \
    -Wl,--export=ath_colony_radius \
    -Wl,--export=ath_colony_life_min \
    -Wl,--export=ath_colony_life_max \
    -Wl,--export=ath_colony_hop_min \
    -Wl,--export=ath_colony_hop_max \
    -Wl,--export=ath_colony_time_min \
    -Wl,--export=ath_colony_time_max \
    -Wl,--export=ath_colony_hop_of \
    -Wl,--export=ath_colony_time_of \
    -Wl,--export-memory
)

cp "$ROOT/build/wasm/ath_addition.wasm" "$ROOT/dist/ath_addition.wasm"
rm -rf "$ROOT/dist/js"
mkdir -p "$ROOT/dist/js"
cp "$ROOT/web/index.html" "$ROOT/web/styles.css" "$ROOT/dist/"
cp "$ROOT/web/js/"*.js "$ROOT/dist/js/"
mkdir -p "$ROOT/dist/data"
cp "$ROOT/data/scientists.tsv" "$ROOT/dist/data/scientists.tsv"

WASM_SHA="$(sha256sum "$ROOT/dist/ath_addition.wasm" | awk '{print $1}')"
BUILT_FROM="$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo not-stamped)"
NATIVE_VERSION="$(gnatmake --version | head -n 1)"

cat > "$ROOT/dist/js/build-info.js" <<EOF
export const buildInfo = {
  version: "0.1.35",
  builtFrom: "${BUILT_FROM}",
  wasmSha256: "${WASM_SHA}",
  toolchain: "AdaWebPack 24.0.0 / GNAT-LLVM (llvm-gcc 14) / LLD 16.0.6",
  nativeCompiler: "${NATIVE_VERSION}",
};
EOF

cat > "$ROOT/dist/version.json" <<EOF
{
  "name": "ada-technological-horizons",
  "version": "0.1.35",
  "builtFrom": "${BUILT_FROM}",
  "wasmSha256": "${WASM_SHA}",
  "toolchain": "AdaWebPack 24.0.0 / GNAT-LLVM (llvm-gcc 14) / LLD 16.0.6",
  "nativeCompiler": "${NATIVE_VERSION}"
}
EOF

echo "dist ready: $ROOT/dist"
echo "wasm sha256: $WASM_SHA"
echo "built from: $BUILT_FROM"
