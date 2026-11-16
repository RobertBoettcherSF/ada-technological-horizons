# Toolchain pins for v0.1.0

The addition core is plain Ada. The same units are compiled with native GNAT and with GNAT-LLVM, then linked to a WebAssembly module. JavaScript only fetches that module, passes two binary64 values, and renders the status Ada returns.

## Choice

AdaWebPack 24.0.0 is the pinned route. Its release archive contains a GNAT-LLVM driver aimed at `wasm32` and a run-time archive, `lib/rts-native/adalib/libgnat.a`, whose objects are already WebAssembly. The system linker is Ubuntu’s `wasm-ld` from LLVM 16, which matches the LLVM 16 dependency stated for that AdaWebPack release.

A short probe compiled an exported `ath_add_f64`, linked it, instantiated it in Node, and got `2 + 3 = 5` before the shell was built. Building GNAT-LLVM from source was not required. The run-time profile used here has `No_Exception_Propagation`, `No_Tasking`, and `Machine_Overflows => False`. The addition package therefore returns status codes and tests finiteness from the IEEE exponent. It does not use tasking, files, or calendars.

## Pins verified on this build

| Piece | Pin |
| --- | --- |
| Archive | [adawebpack-24.0.0.tar.gz](https://github.com/godunko/adawebpack/releases/download/24.0.0/adawebpack-24.0.0.tar.gz) |
| SHA-256 | `8edaae8b9987a20aec430d750f30033f12f953ce2b6437afb87fbf8cc1063796` |
| Wasm compiler | `llvm-gcc` from that archive, `llvm-gcc version 14` (GNATLS 1.0, copyright line 1997–2024) |
| Wasm run-time | `lib/rts-native` inside the same archive |
| Linker | Ubuntu LLD 16.0.6 (`/usr/lib/llvm-16/bin/wasm-ld`, packages `llvm-16` and `lld-16` `1:16.0.6-23ubuntu4`) |
| Native compiler | GNATMAKE 13.3.0 (Ubuntu `gnat` `13.2ubuntu2`, `gnat-13` `13.3.0-6ubuntu2~24.04.1`) |
| Host | Ubuntu 24.04.5, x86_64 |
| Node, for tests | v22.23.4 |
| Browser, for tests | Playwright Chromium (Chrome for Testing 158.0.8127.18) |

`tools/build.sh` downloads the archive into `toolchain/` (gitignored), checks the SHA-256, and stops if `gnatmake` or `wasm-ld` is missing.

## Commands the script runs

Native:

```bash
gnatmake -D build/native -o build/native/addition_tests \
  tests/native/addition_tests.adb -Iada/core -Iada/browser
build/native/addition_tests
```

Wasm, with `PATH` including the AdaWebPack `bin` directory and LLVM 16’s `wasm-ld`:

```bash
llvm-gcc -c -x ada ada/core/ath_addition.adb --target=wasm32 -gnatA -Iada/core -Iada/browser
llvm-gcc -c -x ada ada/browser/ath_addition_exports.adb --target=wasm32 -gnatA -Iada/core -Iada/browser
llvm-gnatbind -n ath_addition_exports.ali
llvm-gcc -c -x ada b~ath_addition_exports.adb --target=wasm32 -gnatA
llvm-gcc --target=wasm32 -o ath_addition.wasm *.o \
  -L<adawebpack>/lib/rts-native/adalib -lgnat -nostdlib \
  -Wl,--no-entry -Wl,--allow-undefined -Wl,--gc-sections \
  -Wl,--export=adainit -Wl,--export=adafinal \
  -Wl,--export=ath_add_f64 -Wl,--export=ath_last_sum \
  -Wl,--export-memory
```

The linked module is about 7 KB and exports `memory`, `adainit`, `adafinal`, `ath_add_f64`, and `ath_last_sum`. Its only import is `env.__gnat_put_exception`. The browser calls `adainit` before any addition.

## Loading

`WebAssembly.instantiate` receives an `ArrayBuffer` from `fetch`. That avoids `instantiateStreaming`, which requires `Content-Type: application/wasm`. A static server that answers with `application/octet-stream` still executes Ada. The diagnostics line “Wasm response type” shows the header the browser actually received.
