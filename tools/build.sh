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

compile_wasm() {
  local Source="$1"
  local Object="$2"
  "$TOOLCHAIN/bin/llvm-gcc" -c -x ada "$Source" \
    --target=wasm32 -gnatA -I"$ROOT/ada/core" -I"$ROOT/ada/browser" \
    -o "$ROOT/build/wasm/$Object"
}
compile_wasm "$ROOT/ada/core/ath_addition.adb" ath_addition.o
compile_wasm "$ROOT/ada/core/ath_lifetime.adb" ath_lifetime.o
compile_wasm "$ROOT/ada/browser/ath_addition_exports.adb" ath_addition_exports.o
compile_wasm "$ROOT/ada/browser/ath_lifetime_exports.adb" ath_lifetime_exports.o
compile_wasm "$ROOT/ada/browser/ath_browser.ads" ath_browser.o
(
  cd "$ROOT/build/wasm"
  "$TOOLCHAIN/bin/llvm-gnatbind" -n ath_browser.ali \
    -I"$ROOT/ada/core" -I"$ROOT/ada/browser"
  "$TOOLCHAIN/bin/llvm-gcc" -c -x ada b~ath_browser.adb \
    --target=wasm32 -gnatA -I"$ROOT/ada/core" -I"$ROOT/ada/browser" \
    -o b~ath_browser.o
  "$TOOLCHAIN/bin/llvm-gcc" --target=wasm32 -o ath_addition.wasm \
    ath_addition.o ath_lifetime.o \
    ath_addition_exports.o ath_lifetime_exports.o \
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
  version: "0.1.2",
  builtFrom: "${BUILT_FROM}",
  wasmSha256: "${WASM_SHA}",
  toolchain: "AdaWebPack 24.0.0 / GNAT-LLVM (llvm-gcc 14) / LLD 16.0.6",
  nativeCompiler: "${NATIVE_VERSION}",
};
EOF

cat > "$ROOT/dist/version.json" <<EOF
{
  "name": "ada-technological-horizons",
  "version": "0.1.2",
  "builtFrom": "${BUILT_FROM}",
  "wasmSha256": "${WASM_SHA}",
  "toolchain": "AdaWebPack 24.0.0 / GNAT-LLVM (llvm-gcc 14) / LLD 16.0.6",
  "nativeCompiler": "${NATIVE_VERSION}"
}
EOF

echo "dist ready: $ROOT/dist"
echo "wasm sha256: $WASM_SHA"
echo "built from: $BUILT_FROM"
