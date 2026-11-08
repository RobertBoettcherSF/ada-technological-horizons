# Ada Technological Horizons

An independent interactive exploration inspired by Stanisław Lem’s Summa Technologiae.

This is original educational software, not an official edition or an endorsed adaptation. The sentence above acknowledges a literary inspiration. It is not permission to copy the book, and it is not a software licence.

**No code licence has been selected.** Do not treat this repository as open-source software, and do not assume a right to copy, modify, or redistribute it. The compiled `ath_addition.wasm` file also contains the GNAT WebAssembly run-time from AdaWebPack, which is covered by the GNU General Public License with the GCC Runtime Library Exception. That exception is a term of the embedded run-time, not a licence chosen for the original Ada, HTML, CSS, or JavaScript in this repository.

## This release

Version **0.1.5** keeps the scientific-information growth calculator under Intellectronics / Return to Earth and makes the chart easier to read. Ada still computes N = N₀ · 2^(t / d), the factor 2^(t / d), both curves, and the year a chosen level is reached. The defaults are a normalised index of 1, a 15-year doubling time, 30 elapsed years, and the presentation year 2026, which give quantity 4 and factor 4 at 2056. A second curve keeps the 15-year doubling on the same axes. The starting 1 and the year 2026 are presentation choices, and the exponential is the scenario, not a forecast.

Version 0.1.3 remains the four-fate calculator under Cosmic Civilisations / Statistics of Cosmic Civilisations. Ada computes that mean and rebalances the other probabilities when one of them is edited. The headline mean is shown to the nearest 100 years, so those defaults read 6500 while the exact value remains 6523. The addition check stays inside Technical details, closed until opened.

- Eight book chapters, plus Conclusion and Afterword, with the planned sections named in `docs/DESIGN.md`.
- A catalogue with search, chapter/topic/type filters, reading order, calculators-first, topic, and title sorting, and Open all / Close all. Two sections are working calculators.
- Shell text in UK English (`en-GB`, the default), German (`de`), Spanish (`es`), and French (`fr`).
- One technical demonstration: Ada adds two finite binary64 values, natively and in the browser.

Not in this release: the researcher/discoveries comparison, logistic or resource limits, spacing, contact, recurrence, chapter essays, book text, scans, or a backend.

`docs/PLAN-3.md` is the scope of this increment. `docs/DESIGN.md` is the longer design. Queue items after item 3 are not implemented.

## Layout

- `ada/core/` — plain Ada addition, lifetime, growth, and validation.
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

The page shows release `0.1.5`. On that host it shows the commit from the URL as the published identity.

The v0.1.0 snapshot remains at:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/fecd1d9154dfbef5a69a306ef3409d9219d7958e/dist/index.html

The v0.1.1 opening remains at:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/7ed60133a77e6b1a3ac22c9dc0b390e2823a064f/dist/index.html

The v0.1.2 calculator, before rebalancing and headline rounding, remains at:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/c7a2ea1e7df52e4a649402c698a5bd23fababf68/dist/index.html

Verified v0.1.3 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/72fc54fc4378c7d3fda7f21e5540b8a7c30edf43/dist/index.html

Verified v0.1.4 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/5d55a2adbf1b4f04d4076f24d975a57ad4fdd3cd/dist/index.html

Verified v0.1.5 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/86a341b1541993fcafc28617572242d8fb421924/dist/index.html

A browser may meet raw.githack’s confirmation screen first. After the page itself loads, the default growth quantity is 4 and the factor is 4, at the year 2056. The civilisation headline remains 6500 years. Details are in `docs/VERIFICATION.md`.
