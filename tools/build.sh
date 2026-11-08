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
compile_wasm "$ROOT/ada/browser/ath_addition_exports.adb" ath_addition_exports.o
compile_wasm "$ROOT/ada/browser/ath_lifetime_exports.adb" ath_lifetime_exports.o
compile_wasm "$ROOT/ada/browser/ath_growth_exports.adb" ath_growth_exports.o
compile_wasm "$ROOT/ada/browser/ath_delay_exports.adb" ath_delay_exports.o
compile_wasm "$ROOT/ada/browser/ath_throughput_exports.adb" ath_throughput_exports.o
compile_wasm "$ROOT/ada/browser/ath_choice_exports.adb" ath_choice_exports.o
compile_wasm "$ROOT/ada/browser/ath_lottery_exports.adb" ath_lottery_exports.o
compile_wasm "$ROOT/ada/browser/ath_browser.ads" ath_browser.o
(
  cd "$ROOT/build/wasm"
  "$TOOLCHAIN/bin/llvm-gnatbind" -n ath_browser.ali \
    -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
  "$TOOLCHAIN/bin/llvm-gcc" -c -x ada b~ath_browser.adb \
    --target=wasm32 -gnatA -I"$ROOT/ada/core" -I"$ROOT/ada/browser" \
    -o b~ath_browser.o
  "$TOOLCHAIN/bin/llvm-gcc" --target=wasm32 -o ath_addition.wasm \
    ath_addition.o ath_lifetime.o ath_growth.o ath_delay.o ath_throughput.o ath_choice.o ath_lottery.o \
    ath_addition_exports.o ath_lifetime_exports.o ath_growth_exports.o ath_delay_exports.o ath_throughput_exports.o ath_choice_exports.o ath_lottery_exports.o \
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
    -Wl,--export-memory
)

cp "$ROOT/build/wasm/ath_addition.wasm" "$ROOT/dist/ath_addition.wasm"
rm -rf "$ROOT/dist/js"
mkdir -p "$ROOT/dist/js"
cp "$ROOT/web/index.html" "$ROOT/web/styles.css" "$ROOT/dist/"
cp "$ROOT/web/js/"*.js "$ROOT/dist/js/"

WASM_SHA="$(sha256sum "$ROOT/dist/ath_addition.wasm" | awk '{print $1}')"
BUILT_FROM="$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo not-stamped)"
NATIVE_VERSION="$(gnatmake --version | head -n 1)"

cat > "$ROOT/dist/js/build-info.js" <<EOF
export const buildInfo = {
  version: "0.1.20",
  builtFrom: "${BUILT_FROM}",
  wasmSha256: "${WASM_SHA}",
  toolchain: "AdaWebPack 24.0.0 / GNAT-LLVM (llvm-gcc 14) / LLD 16.0.6",
  nativeCompiler: "${NATIVE_VERSION}",
};
EOF

cat > "$ROOT/dist/version.json" <<EOF
{
  "name": "ada-technological-horizons",
  "version": "0.1.20",
  "builtFrom": "${BUILT_FROM}",
  "wasmSha256": "${WASM_SHA}",
  "toolchain": "AdaWebPack 24.0.0 / GNAT-LLVM (llvm-gcc 14) / LLD 16.0.6",
  "nativeCompiler": "${NATIVE_VERSION}"
}
EOF

echo "dist ready: $ROOT/dist"
echo "wasm sha256: $WASM_SHA"
echo "built from: $BUILT_FROM"
