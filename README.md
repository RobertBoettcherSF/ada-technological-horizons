# Ada Technological Horizons

An independent interactive exploration inspired by Stanisław Lem’s Summa Technologiae.

This is original educational software, not an official edition or an endorsed adaptation. The sentence above acknowledges a literary inspiration. It is not permission to copy the book, and it is not a software licence.

**No code licence has been selected.** Do not treat this repository as open-source software, and do not assume a right to copy, modify, or redistribute it. The compiled `ath_addition.wasm` file also contains the GNAT WebAssembly run-time from AdaWebPack, which is covered by the GNU General Public License with the GCC Runtime Library Exception. That exception is a term of the embedded run-time, not a licence chosen for the original Ada, HTML, CSS, or JavaScript in this repository.

## This release

Version **0.1.0** is the scaffold and the Ada-to-WebAssembly boundary only.

- Eight book chapters, plus Conclusion and Afterword, with the planned sections named in `docs/DESIGN.md`.
- A catalogue with search, chapter/topic/type filters, reading order, calculators-first, topic, and title sorting, and Open all / Close all.
- Shell text in UK English (`en-GB`, the default), German (`de`), Spanish (`es`), and French (`fr`).
- One technical demonstration: Ada adds two finite binary64 values, natively and in the browser. It is not a scientific calculator.

Not in this release: the historical four-fate weighted mean, any civilisation-lifetime model, any other scientific calculator, chapter essays, book text, scans, or a backend.

`docs/PLAN-1.md` is the scope of this increment. `docs/DESIGN.md` is the longer design, including later queue items that are not implemented here.

## Layout

- `ada/core/` — plain Ada addition and validation.
- `ada/browser/` — the fixed-width export used by WebAssembly.
- `tests/native/` — the native fixture.
- `tests/` — catalogue, translation, state, and browser checks.
- `web/` — the shell source.
- `dist/` — the static snapshot served as-is. Paths inside it are relative.
- `docs/` — the plan, the design, the toolchain pins, and the addition contract.

## Build

The verified host is Ubuntu 24.04. Install:

```bash
sudo apt-get install gnat gprbuild llvm-16 lld-16 curl ca-certificates python3
```

Then:

```bash
bash tools/build.sh
```

That downloads AdaWebPack 24.0.0, checks its SHA-256, runs the native fixture, links `dist/ath_addition.wasm`, and stamps `dist/version.json`. Pins and the reason for this toolchain are in `docs/TOOLCHAIN.md`. The addition contract is in `docs/ADDITION-CONTRACT.md`.

Serve the snapshot locally:

```bash
python3 -m http.server 8765 --directory dist
```

Open `http://127.0.0.1:8765/`. The page loads `ath_addition.wasm` with a byte buffer, so it still runs when the server does not label the file `application/wasm`.

## Tests

```bash
bash tools/test.sh
```

The script rebuilds, runs the Node checks, and drives the static page in headless Chromium, including a second pass that serves the module as `application/octet-stream`. Outcomes from the implementation run are in `docs/VERIFICATION.md`.

## Publication

The static tree in `dist/` is what a raw.githack URL should serve. Use an immutable commit URL of the form:

`https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/<commit>/dist/index.html`

The page shows release `0.1.0`. On that host it shows the commit from the URL as the published identity.

Verified snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/fecd1d9154dfbef5a69a306ef3409d9219d7958e/dist/index.html

A browser meets raw.githack’s confirmation screen first. After “Open the page”, the Ada module loads and the default sum is 5. Details are in `docs/VERIFICATION.md`.
