# Ada Technological Horizons

An independent interactive exploration inspired by Stanisław Lem’s Summa Technologiae.

This is original educational software, not an official edition or an endorsed adaptation. The sentence above acknowledges a literary inspiration. It is not permission to copy the book, and it is not a software licence.

**No code licence has been selected.** Do not treat this repository as open-source software, and do not assume a right to copy, modify, or redistribute it. The compiled `ath_addition.wasm` file also contains the GNAT WebAssembly run-time from AdaWebPack, which is covered by the GNU General Public License with the GCC Runtime Library Exception. That exception is a term of the embedded run-time, not a licence chosen for the original Ada, HTML, CSS, or JavaScript in this repository.

## This release

Version **0.1.14** gives each information-rate choice its own chart. Historical example restores 10,000 bits at 25 bits/s for 400 seconds. The line rate is shown with the human figure only. Debug still saves a local report.

Version **0.1.13** makes that rate chart follow the rate you chose, and Debug / F9 opens a dialog that saves a local report. Nothing is uploaded.

Version **0.1.12** compares information rates. On the linear chart the bacterial bar is 40 times the human bar. The nominal 1000 Mb/s line rate of IEEE 802.3 1000BASE-T is a separate digital-link reference, not a claim about machine understanding. A logarithmic scale can include that link and says that its lengths are not the 40-to-1 ratio.

Version **0.1.11** shows every calculator until a chapter, section, or catalogue filter is chosen. All chapters brings them back. Technical details stays closed until its button or F9 opens it.

Version **0.1.10** adds a constant-rate information calculator under A Lampoon of Evolution / Constructing Life. The prefilled example is Lem’s historical page of about 10,000 bits at about 25 bits/s: 400 seconds, and 10,000 bits again over that same duration. The bacterial figure of at least 1,000 bits/s gives at most 10 seconds for the same page. The ratio of those rates is 40. A rate of zero does not invent a time for a positive quantity. No contemporary spike rate, DNA capacity, or task-information estimate is loaded.

Version **0.1.9** keeps the numbered light-time steps. The list shows time since the signal leaves, so the reply line matches the round trip, while each connecting leg still shows the one-way duration. Displayed times use at most two decimal places, with the exact seconds in the closed sources. Presets now also include Earth–Sun, Earth–Venus, Earth–Europa, Earth–Titan and Proxima Centauri (Alpha Centauri C). Europa and Titan are placed beyond their planets. None of the variable distances is today’s sky.

Version 0.1.7 added the light-time calculator. The prefilled example remains an illustrative 1,000 light-years: 1,000 years one way and 2,000 years for the reply.

Version 0.1.6 remains the growth chart that extends through a reachable target while the quantity stays at the elapsed time you enter. Those defaults still give quantity 4 and factor 4 at 2056.

Version 0.1.3 remains the four-fate calculator under Cosmic Civilisations / Statistics of Cosmic Civilisations. Ada computes that mean and rebalances the other probabilities when one of them is edited. The headline mean is shown to the nearest 100 years, so those defaults read 6500 while the exact value remains 6523. The addition check stays inside Technical details, closed until opened.

- Eight book chapters, plus Conclusion and Afterword, with the planned sections named in `docs/DESIGN.md`.
- A catalogue with search, chapter/topic/type filters, reading order, calculators-first, topic, and title sorting, and Open all / Close all. Four sections are working calculators.
- Shell text in UK English (`en-GB`, the default), German (`de`), Spanish (`es`), and French (`fr`).
- One technical demonstration: Ada adds two finite binary64 values, natively and in the browser.

Not in this release: the researcher/discoveries comparison, logistic or resource limits, spacing, contact, recurrence, chapter essays, book text, scans, or a backend.

`docs/PLAN-5.md` is the scope of this increment. `docs/DESIGN.md` is the longer design. Queue items after item 5 are not implemented.

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

The page shows release `0.1.14`. On that host it shows the commit from the URL as the published identity.

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

Verified v0.1.6 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/6e5533ccf57bb18489e8da6a127c5372961bc1fa/dist/index.html

Verified v0.1.7 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/7b947fa0d9ac201b0b75955e509d592e311a7fc7/dist/index.html

Verified v0.1.8 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/2c548eda8f3a2d8640b9c50852351a21d31ec554/dist/index.html

Verified v0.1.9 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/6df84abf338462fe643c55d636bf5ca1a7bf65e4/dist/index.html

Verified v0.1.10 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/5c73a565e34e7332532e73c713614182321d061e/dist/index.html

Verified v0.1.11 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/1eb76f803512bb57fcff9e1e518935d8a34a2c82/dist/index.html

Verified v0.1.12 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/42cad6bde0bb249d9298db396c45dcd84c485b90/dist/index.html

Verified v0.1.13 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/78f6302b79c0a572d760902ba65300744cb9e147/dist/index.html

Verified v0.1.14 snapshot:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/de76eb33099ede3169ab6f5322b1ec478f1609eb/dist/index.html

A browser may meet raw.githack’s confirmation screen first. After the page itself loads, the Constructing Life example shows 400 seconds and 10,000 bits, with the bacterial comparison at most 10 seconds. Earth–Venus still lists the reply at 4.6 min. The civilisation headline remains 6500 years. Details are in `docs/VERIFICATION.md`.
