# Verification

## v0.1.19 section entry and plain choices

Choosing Creating Worlds from the chapter menu opens at the chapter heading, then Cultivating Information, then the calculator. The other calculators stay hidden, and the full section list is not shown underneath. The heading sits below the fixed debug bar. Back and All chapters return to the full page.

The choices page says a bit is one yes-or-no. The fair-coin button fills 2 outcomes and 8 times, and the page says: eight coin tosses can produce 256 different sequences, and recording which one happened takes 8 bits. The die stays a fraction, **2.58496 bits** for one roll and **5.16993 bits** for two, with **36** sequences. The whole-number code length stays in the collapsed technical details. The arithmetic is unchanged.

Verified in a browser on 8 November 2026:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/5a6f8237d5eb014a206118493defbf0d9e4b13a3/dist/index.html

The page showed release `0.1.19`, commit `5a6f8237d5eb014a206118493defbf0d9e4b13a3`, and `application/wasm`. Creating Worlds showed the heading **Cultivating Information** before the calculator. The coin sentence named **256** sequences and **8 bits**. The die showed **2.58496 bits**. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (91027 bytes, SHA-256 `7174eb34320291609f0ec1a0db257f232c3ffe810ca777f987fcec664e57f5a9`, `access-control-allow-origin: *`).

## v0.1.18 equally likely choices

Cultivating Information, under Creating Worlds, computes ideal information for equally likely possibilities. A fair coin, N = 2 and k = 8, is **1 bit** for one toss, **8 bits** for eight tosses, and **256** combinations. A six-sided die is about **2.58496 bits** for one roll and **36** combinations for two rolls. The 26-letter alphabet, three independent letters, is **17576** combinations. These three are teaching examples, not quotations. The collapsed source note keeps the book’s logarithmic measure and the contrast with a set of about 100 element statements. k = 0 is one combination and 0 bits. N = 1 is 0 bits. N = 0, a fraction, and an integer above 2^53 are rejected. For N = 10 and k = 400 the count is not a finite exact value; log10 of the count is 400 and the ideal information stays finite. Choosing Creating Worlds leaves only this calculator. The catalogue counts five working calculators.

Verified in a browser on 8 November 2026:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/b92d72bb5fa653c3a4d2499105a9a0c57233d1a8/dist/index.html

The page showed release `0.1.18`, commit `b92d72bb5fa653c3a4d2499105a9a0c57233d1a8`, and `application/wasm`. The coin read **1 bit**, **8 bits**, and **256**. The die read **2.58496 bits** and **36**. The chart legend read **Total information** and **Reported total**. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (91027 bytes, SHA-256 `7174eb34320291609f0ec1a0db257f232c3ffe810ca777f987fcec664e57f5a9`, `access-control-allow-origin: *`).

## v0.1.17 near-zero reference

On the linear 1000BASE-T chart the human reference is drawn clear of the axis in lime, with a pale outline, and labelled **Human figure — near zero, not to scale**. The legend uses that same lime stroke and the same words. The listed values stay **1000000000 bits/s — 10 µs** and **25 bits/s — 400 s — after this chart**. A logarithmic chart does not use this lift. An actual zero rate is not drawn as a positive line.

Verified in a browser on 8 November 2026:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/aa55ce5c6a15dc5b3355e12dc22837c0e7a6b5be/dist/index.html

The page showed release `0.1.17`, commit `aa55ce5c6a15dc5b3355e12dc22837c0e7a6b5be`, and `application/wasm`. The human display line sat near y 96.9 in the 0–100 chart, stroke `rgb(200, 242, 90)` at 4.5px, matching the legend. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (81923 bytes, SHA-256 `bba920516c88c2c730951bf9c173bcdecb37933dc07e6f9f906db8a71bdab081`, `access-control-allow-origin: *`).

## v0.1.16 curve legend

The bacterial chart names the steep cyan dotted line **Bacterial figure (chosen)** and the low lime line **Human figure (reference)**. The dashed line is **Target — 10000 bits**. The white dot is **Target reached**. Those swatches use the same stroke as the plotted series. A curve that is not drawn is not left in the legend. Lem’s example, the human figure, the line rate, a custom rate, and both scales follow the same rule. The exact time list remains.

Verified in a browser on 8 November 2026:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/52f9411e728b7936896146ddfd1febd4bc7d8466/dist/index.html

The page showed release `0.1.16`, commit `52f9411e728b7936896146ddfd1febd4bc7d8466`, and `application/wasm`. The bacterial legend read **Bacterial figure (chosen)**, **Human figure (reference)**, **Target — 10000 bits**, and **Target reached**. The bacterial stroke was `rgb(143, 208, 222)` with dash `1.4px, 3.2px` on both the curve and the swatch. The human stroke was lime `rgb(200, 242, 90)`, solid. The target stroke was `rgb(183, 201, 220)`, dashed. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (81923 bytes, SHA-256 `bba920516c88c2c730951bf9c173bcdecb37933dc07e6f9f906db8a71bdab081`, `access-control-allow-origin: *`).

## v0.1.15 information transmitted against time

Lem’s example draws two curves for 10,000 bits. The chosen human figure is **25 bits/s — 400 s**. The bacterial lower bound is **at least 1000 bits/s — at most 10 s**. Both cross the dashed 10,000-bit line on the linear chart, and the ratio is **40**. Information stays rate times time. A log chart keeps only positive time and positive information; zero is omitted, and each constant rate is a slope of 1. The 1000BASE-T choice draws **1000000000 bits/s — 10 µs** with the human figure and no bacterial curve. On the linear window the human crossing is after the chart, at 400 s. On the log window both crossings are on the chart, so the human curve is not drawn as zero. Reset and Lem’s example restore 10,000 bits, 25 bits/s and 400 s.

Verified in a browser on 8 November 2026:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/b04846bfb91b8d5ac96dc65f5a81612bb36666b0/dist/index.html

The page showed release `0.1.15`, commit `b04846bfb91b8d5ac96dc65f5a81612bb36666b0`, and `application/wasm`. The default curves were **25** and **1000**, with two crossing marks and ratio **40**. The line-rate list was **1000000000 bits/s — 10 µs** and **25 bits/s — 400 s — after this chart**. After Logarithmic, both crossings were on the chart. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (81923 bytes, SHA-256 `bba920516c88c2c730951bf9c173bcdecb37933dc07e6f9f906db8a71bdab081`, `access-control-allow-origin: *`).

## v0.1.14 separate rate scenarios

Human figure is one full bar: **25 bits/s — 400 s**, and the ratio reads **Bacterial figure ÷ this rate** = **40**. Bacterial figure is a different chart: a full lower-bound bar **at least 1000 bits/s — at most 10 s** and a true one-fortieth human bar. 1000BASE-T is a full line-rate bar **1000000000 bits/s — 10 µs** plus that tiny human reference, and no bacterial row. The ratio is **40000000**. Historical example restores **10000** bits, rate **25** bits/s, duration **400** s, and the two-row historical comparison with ratio **40**. Typing **50** marks the row **Your rate** and gives **200 s**, twice the human figure. Reset returns the historical example. The debug report includes `Preset: historical` after that reset.

Verified in a browser on 8 November 2026:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/de76eb33099ede3169ab6f5322b1ec478f1609eb/dist/index.html

The page showed release `0.1.14`, that commit, and `application/wasm`. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (69073 bytes, SHA-256 `9d58e2b28aeeca115deceb5a3e0cdf89192f498d91e3c6b5cfb814bf3590bc51`, `access-control-allow-origin: *`).

## v0.1.13 chosen rate and debug report

Choosing the 1000BASE-T line rate puts that rate first on the chart: **1000000000 bits/s — 10 µs**, marked chosen. The human figure stays **25 bits/s — 400 s** and the bacterial figure stays **at least 1000 bits/s — at most 10 s**. The headline ratio is **40000000**, labelled chosen rate divided by the human figure. The linear shares are **1**, **2.5e-8** and **0.000001**, the true fractions, with no padded minimum. The note names the line rate and says it is not machine understanding. The nominal-rate labels are cyan `rgb(143, 208, 222)`. Debug and F9 open a dialog, not Technical details. Saving downloads a text report that includes the release, commit, locale, active address, Wasm status and the expectation comment. Nothing is uploaded.

Verified in a browser on 8 November 2026:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/78f6302b79c0a572d760902ba65300744cb9e147/dist/index.html

The page showed release `0.1.13`, that commit, and `application/wasm`. Constructing Life was the only calculator on that address. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (68279 bytes, SHA-256 `87cf9eae2f336c475de8381c3daa1d1db3c07ea3f59938455fb786a8d96e4300`, `access-control-allow-origin: *`).

## v0.1.12 information-rate chart

The linear bars are rates. For the historical figures the bacterial bar is 40 times the human bar: 1,000 bits/s and 25 bits/s. The times stay beside them, 400 s and at most 10 s. The digital reference is the nominal 1000 Mb/s line rate in IEEE Std 802.3 for 1000BASE-T, 1,000,000,000 bits/s. It is not framed payload and not a processing speed. Ten thousand bits at that ideal constant rate take 10 µs. The logarithmic chart may include the link and says that its lengths are not the 40-to-1 ratio. Chapter selection and F9 remain.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/42cad6bde0bb249d9298db396c45dcd84c485b90/dist/index.html

The page showed release `0.1.12`, that commit, and `application/wasm`. The linear shares were **0.025** and **1**, so the bacterial bar is 40 times the human bar. The list read **25 bits/s — 400 s** and **at least 1000 bits/s — at most 10 s**. The separate 1000BASE-T line rate was **1000000000 bits/s**, and 10,000 bits at that ideal rate took **10 µs**. Technical details started closed. Choosing Phantomology still left only the light-time card, with **Reply arrives — 2000 years**. The headline mean stayed **6500**. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (59033 bytes, SHA-256 `ff17470117dc72a8aa74b7fc8139d3d7b43c92d4b06b2fbb0ed21c671362dc95`, `access-control-allow-origin: *`).

## v0.1.11 selection and technical details

All chapters is the default: the four calculators are on the page together. Choosing Phantomology leaves only the light-time calculator. Choosing two chapters in the catalogue leaves only those calculators. A direct `#growth-card` address leaves only the growth calculator. All chapters restores the four without clearing their edited values. The Technical details button and F9 open and close the same disclosure. Escape closes it when focus is inside it. It starts closed.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/1eb76f803512bb57fcff9e1e518935d8a34a2c82/dist/index.html

The page showed release `0.1.11`, that commit, and `application/wasm`. Technical details started closed. All four calculators were visible. Choosing Phantomology left only the light-time card, still reading **1000 years** and **Reply arrives — 2000 years**. The other results stayed in place: headline **6500**, growth quantity **4**, and **400 s**. F9 opened Technical details and Escape closed it. All chapters showed the growth card again. At 320px, `scrollWidth - clientWidth` was 0 and the Technical details button was visible. `curl` received `text/html` with `access-control-allow-origin: *`.

## v0.1.10 constant-rate information

The prefilled Constructing Life example is 10,000 bits at 25 bits/s for 400 seconds. Ada reports 400 seconds and 10,000 bits. The same quantity at the bacterial lower bound of 1,000 bits/s is at most 10 seconds, and the historical rate ratio is 40. One page unit is that 10,000-bit convention. 1,500 bits per minute matches 25 bits per second. A rate of zero leaves the time unreachable and the total at 0 bits. A negative value clears the chart. The other calculators stay at headline 6500, growth quantity 4, and a Venus reply list of 4.6 min.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/5c73a565e34e7332532e73c713614182321d061e/dist/index.html

The page showed release `0.1.10`, that commit, and `application/wasm`. The prefilled example read **400 s**, **10000 bits**, and ratio **40**. The comparison list read **400 s** and **at most 10 s**. Setting the rate to zero showed **Unreachable** and **0 bits**, while the bacterial comparison stayed **at most 10 s**. The headline mean stayed **6500**, growth quantity stayed **4**, and the Venus reply line stayed **Reply arrives — 4.6 min**. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (56767 bytes, SHA-256 `3efe4a6877626529acce19c1061a5a2b3a0bbb4c7dd8cda0f31499d540300694`, `access-control-allow-origin: *`).

`bash tools/test.sh` printed `NATIVE OK`, `LIFETIME OK`, `GROWTH OK`, `DELAY OK`, and `THROUGHPUT OK`. Node: 28 passed. Headless Chromium printed `BROWSER OK` for both MIME types.

## v0.1.9 cumulative event list

The event list shows time since the signal leaves. For Earth–Venus the reply line is **4.6 min**, matching the headline, while each connecting leg stays **2.3 min**. The Moon list ends at **2.56 s** with legs of **1.28 s**. One thousand light-years lists **2000 years** with legs of **1000 years**. The same cumulative line is checked in German, French, and Spanish.

`bash tools/test.sh` is recorded with this release. Headless Chromium checks the list against the reply result on desktop and at 320px.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/6df84abf338462fe643c55d636bf5ca1a7bf65e4/dist/index.html

The page showed release `0.1.9`, that commit, and `application/wasm`. Earth–Venus listed **Signal leaves — 0 s**, **Signal arrives — 2.3 min**, and **Reply arrives — 4.6 min**. The headline reply was **4.6 min**. Both connecting legs stayed **2.3 min**, and the circles stayed 1, 2 and 3. The headline mean stayed **6500**. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` with `access-control-allow-origin: *`. The Wasm module is unchanged from 0.1.8 (44567 bytes, SHA-256 `5e5290d84fe58e7af3a32fb3c9ad5593fad4261c5dd3860c43de4235e3c497f1`).

## v0.1.8 numbered timeline and more presets

`bash tools/test.sh` printed `NATIVE OK`, `LIFETIME OK`, `GROWTH OK`, and `DELAY OK`. The eight presets are the distances named in `docs/PLAN-4.md`. For 1,000 light-years each leg equals the one-way time. Moon display rounds to 1.28 s and 2.56 s, with both legs 1.28 s. Lifetime and growth behaviour is unchanged.

Node suites passed, including Wasm preset and leg checks. Headless Chromium printed `BROWSER OK` for `application/wasm` and for `application/octet-stream`, including a 320px timeline. The catalogue still counts 3 working calculators.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/2c548eda8f3a2d8640b9c50852351a21d31ec554/dist/index.html

The page showed release `0.1.8`, that commit, `application/wasm`, headline **6500** with exact mean **6523**, growth quantity **4** with chart end **2076**, three working calculators, and closed sources. The prefilled 1,000 light-years read **1000 years** and **2000 years**, with the same duration on each leg. Earth–Moon read **1.28 s** and **2.56 s**, with numbered circles 1, 2 and 3 and both legs **1.28 s**. The other presets read: Venus **2.3 min** / **4.6 min**, Sun **8.32 min** / **16.63 min**, Mars **12.51 min** / **25.02 min**, Europa **35 min** / **1.17 h**, Titan **1.19 h** / **2.38 h**, Proxima Centauri **4.25 years** / **8.49 years**. At 320px the numbered timeline did not overflow. `curl` received `text/html` and `application/wasm` (44567 bytes, SHA-256 `5e5290d84fe58e7af3a32fb3c9ad5593fad4261c5dd3860c43de4235e3c497f1`, `access-control-allow-origin: *`).

## v0.1.7 light-time

`bash tools/test.sh` printed `NATIVE OK`, `LIFETIME OK`, `GROWTH OK`, and `DELAY OK`. One thousand light-years is exactly 1,000 Julian years one way and 2,000 for the reply. Zero distance is zero. The Moon preset is 384,400 km and the Mars preset is 225,000,000 km. A negative distance, a bad unit, and an overflowing distance clear the previous times. Wasm replay matched those bits. The lifetime and growth fixtures are unchanged, including exact 6523 and the extended growth horizon.

Node suites passed, including the new light-time parity. Headless Chromium printed `BROWSER OK` for `application/wasm` and for `application/octet-stream`. The prefilled card showed 1000 years and 2000 years, with Sources closed. The Mars preset showed a minute-scale delay and the note that it is not the distance today. At 320px, `scrollWidth - clientWidth` was at most 1. The catalogue counted 3 working calculators.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/7b947fa0d9ac201b0b75955e509d592e311a7fc7/dist/index.html

The page showed release `0.1.7`, that commit, `application/wasm`, Sources and Technical details closed, three working calculators, growth quantity **4** with chart end **2076**, and headline **6500** with exact mean **6523**. The prefilled light-time was **1000 years** one way and **2000 years** for the reply. The Earth–Mars example showed **12.5087 min** and **25.0173 min**, with the note that 225 million km is not the distance today. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (44229 bytes, SHA-256 `19cb4b895f476b4518a4092562c8b04ab3f93a47f9c5240ffa45d98cc7d2b4ff`, `access-control-allow-origin: *`).

## v0.1.6 extended chart horizon

`bash tools/test.sh` printed `NATIVE OK`, `LIFETIME OK`, and `GROWTH OK`. For N₀ = 1, doubling time 14 years, 30 elapsed years, start 2026 and target 20, the quantity and factor stay at the 30-year value and the chart ends at 2087, with both curves sampled through that year. The crossing is on the chart. Lowering the target to 4 restores the chart end to 2056 and leaves the 30-year quantity unchanged. An already-reached target and a starting quantity of zero do not extend the chart. Lifetime fixtures are unchanged, including exact 6523.

Node suites: 25 passed, including bit-matched Wasm replay of that extended case. Headless Chromium printed `BROWSER OK` for `application/wasm` and for `application/octet-stream`. The page showed quantity 4.41636 and factor 4.41636 at year 2056, chart end 2087, and the target year 2086.507. At 320px, `scrollWidth - clientWidth` was at most 1.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/6e5533ccf57bb18489e8da6a127c5372961bc1fa/dist/index.html

The page showed release `0.1.6`, that commit, `application/wasm`, headline **6500** with exact mean **6523**, and closed Technical details. With doubling time 14, elapsed time 30, start 2026 and target 20, the quantity and factor were **4.41636** at year **2056**, the chart ended at **2087**, and the target was reached in **2086.507**. Both curves were drawn through 2087. Lowering the target to 4 restored the chart end to **2056**, left the quantity at **4.41636**, and showed the target in **2054**. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (40908 bytes, SHA-256 `3934138457f4c18216b02d41c9dd45e2948c6733e48877a3e5379162b684b504`, `access-control-allow-origin: *`).

## v0.1.5 calendar, baseline, and target year

`bash tools/build.sh` printed `NATIVE OK`, `LIFETIME OK`, and `GROWTH OK`. The lifetime fixtures are unchanged, including exact 6523 and 8523. Growth defaults remain quantity 4 and factor 4. With starting year 2026 the chart ends at 2056. Target 4 is reached in 2056 when the doubling time is 15, and in 2054 when it is 14. A target already at or below the starting quantity stays at 2026. A starting quantity of 0 does not invent a year for a positive target. Target 10 is reported after the 30-year chart. A fractional year and a year outside -10000..10000 clear the curve. An invalid target clears only the target year.

Node suites: 25 passed. Integer results and calendar years matched Wasm by bits. The slow-doubling case 2^0.2 differed by one ulp between native GNAT and the wasm32 maths library; the check allows that one ulp and still requires a non-finite 15-year baseline to be omitted rather than capped. Headless Chromium printed `BROWSER OK` for `application/wasm` and for `application/octet-stream`. The page showed quantity 4, factor 4, and chart end 2056, with both curves, year labels, and the outside-horizon target. Doubling time 14 with target 4 showed 2054 and a higher chosen curve on the same years. At 320px, `scrollWidth - clientWidth` was at most 1. The civilisation headline stayed 6500 with exact mean 6523.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/86a341b1541993fcafc28617572242d8fb421924/dist/index.html

The page showed release `0.1.5`, that commit, `application/wasm`, quantity **4**, factor **4**, chart end **2056**, two curves, calendar-year and quantity labels, headline **6500** with exact mean **6523**, and closed Technical details. The default illustrative target 10 was reported after the chart, in **2075.8289**. Setting the target to 4 showed **2056**. Doubling time 14 with that target showed **2054**, with the chart still ending in 2056. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (37887 bytes, SHA-256 `b0e52442bc48360c9754bf46181ace5268a76dc256076b21c58e8cc13f7c8bf7`, `access-control-allow-origin: *`).

## v0.1.4 scientific-information growth

`bash tools/build.sh` printed `NATIVE OK`, `LIFETIME OK` and `GROWTH OK`. The lifetime and rebalance fixtures are unchanged. Growth checks: defaults quantity 4 and factor 4; one doubling gives 2 and 2; elapsed 0 keeps the starting quantity and factor 1; starting quantity 0 gives quantity 0 and factor 4; doubling 0 or a negative doubling is status 4; a negative elapsed time is status 3; a negative starting quantity is status 2; NaN is status 1; t = 20000 with d = 1 is status 5 and clears the previous result. The last of the 11 samples matches the reported quantity.

Node suites: 24 passed, including bit-exact Wasm replay of the addition, lifetime, rebalance and growth fixtures. Headless Chromium printed `BROWSER OK` for `application/wasm` and for `application/octet-stream`. The default growth card showed quantity 4 and factor 4, with the table endpoint equal to that quantity. Elapsed time 15 showed 2 and 2. Reset restored 1, 15 and 30. Invalid doubling, a negative elapsed time, a negative start, NaN, an empty field and the overflow case cleared the quantity, factor and curve. The civilisation card still showed 6500 with exact mean 6523, and editing 60 to 30 still showed 15, 30, 25, 30. Technical details stayed closed until opened. The catalogue counted 2 working calculators. At 320px, `scrollWidth - clientWidth` was at most 1.

Verified in a browser on 8 November 2026 at the immutable URL:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/5d55a2adbf1b4f04d4076f24d975a57ad4fdd3cd/dist/index.html

The page showed release `0.1.4`, that commit, `application/wasm`, quantity **4**, factor **4**, headline **6500** with exact mean **6523**, two working calculators, and closed Technical details. The curve table had 11 rows and its last quantity was 4. Editing the elapsed time to 15 showed quantity **2** and factor **2**. At 320px, `scrollWidth - clientWidth` was 0. `curl` received `text/html` and `application/wasm` (31832 bytes, SHA-256 `7f9036f33539b86fb8f36ad2e5461b2ddf1cebc6730b534fe5846ed64c4093bf`, `access-control-allow-origin: *`).

## v0.1.3 rebalance and headline

`bash tools/build.sh` printed `NATIVE OK` and `LIFETIME OK`. Rebalance checks: 60 edited to 30 becomes 15, 30, 25, 30; 5 edited to 95 becomes 95, 5, 0, 0; a single 100 leaves the others at 0; 100 edited to 0 shares the remainder equally and the total stays within `1.0e-9` of 100. The exact default mean remains 6523 and the 20000-year case remains 8523. Wasm replay matched the addition, lifetime, and rebalance bits.

Node suites: 23 passed, plus the headline check that 6523 displays as 6500 and 8523 as 8500. Headless Chromium printed `BROWSER OK` twice. The default card showed 6500 with exact mean 6523. Editing 60 to 30 showed 15, 30, 25, 30. A duration of 20000 showed 8500 without moving the probabilities. Invalid text cleared the headline. Technical details stayed closed until opened.

Verified in a browser on 8 November 2026, after raw.githack’s “Open the page” confirmation:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/72fc54fc4378c7d3fda7f21e5540b8a7c30edf43/dist/index.html

The page showed release `0.1.3`, that commit, `application/wasm`, headline **6500** with exact mean **6523**, and closed Technical details. Editing 60 to 30 showed probabilities 15, 30, 25, 30 and headline **10500** (exact 10524). `curl` received `text/html` and `application/wasm` (14874 bytes, `access-control-allow-origin: *`).

## v0.1.2 calculator and theme

`bash tools/build.sh` on Ubuntu 24.04.5 printed `NATIVE OK` and `LIFETIME OK`.

Native lifetime checks include defaults **6523** years with contributions 5, 18, 4500 and 2000; last duration 20000 giving **8523**; a single 100% fate; zero durations giving 0; totals 90 and 110; a negative probability; a negative duration; NaN and infinity. The export clears a previous mean when the total is rejected. Wasm replay of those fixture bits matched. The addition fixtures still match as well.

Node suites: 21 passed. Headless Chromium printed `BROWSER OK` for `application/wasm` and for `application/octet-stream`. That run checked the closed Technical details disclosure, the lifetime card showing 6523, an edit to 8523, reset, chapter tiles, filters, languages, the addition proof after the disclosure is opened, and a 320px viewport.

Verified in a browser on 8 November 2026, after raw.githack’s “Open the page” confirmation:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/c7a2ea1e7df52e4a649402c698a5bd23fababf68/dist/index.html

The page showed release `0.1.2`, that commit, `application/wasm`, two Ada calls, mean **6523**, and closed Technical details. Editing the last duration to 20000 changed the mean to **8523**. `curl` received `text/html` and `application/wasm` (10361 bytes, `access-control-allow-origin: *`).

## v0.1.1 opening

Checked on the same Ubuntu 24.04.5 host after `bash tools/build.sh`.

- Native fixture: `NATIVE OK`. The Wasm module SHA-256 is unchanged, `92a552be9ee7c1421a17948e35caa50dbd746b043d19297db05af07f67f7b5d1`, because the Ada units did not change.
- `node --test` on the catalogue, translation, state, number and Wasm-parity suites: 20 passed.
- Headless Chromium against `dist/` printed `BROWSER OK` for `Content-Type: application/wasm` and again for `application/octet-stream`.
- On first load, `#technical-details` is closed. Enter on its summary opens it and Enter closes it. The visible release label is `0.1.1`.
- The addition card is before the section list, shows prefilled `2` and `3`, and shows result `5` from Ada. Chapter tiles expose a description in the active language.
- Search, order and filters start closed. Enter on that summary opens them. The existing language, filter, sort, reset, collapse, error and load-failure checks still pass. At 320px, `scrollWidth - clientWidth` is at most 1.

Verified in a browser on 8 November 2026, after raw.githack’s “Open the page” confirmation, at:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/7ed60133a77e6b1a3ac22c9dc0b390e2823a064f/dist/index.html

The page showed release `0.1.1`, that commit, execution `Ada WebAssembly`, `application/wasm`, one Ada call, and result `5`. Technical details and the search disclosure were closed. Ten chapter tiles were present. `curl` received `text/html` for the page and `application/wasm` for the 6818-byte module, with `access-control-allow-origin: *`.

## v0.1.0

These commands were run on the implementation host (Ubuntu 24.04.5, x86_64).

## Build

```text
bash tools/build.sh
```

Result: `NATIVE OK`, then `dist ready`.

Native fixture lines:

```text
FIXTURE two-plus-three 4000000000000000 4008000000000000  0 4014000000000000
FIXTURE zero-plus-zero 0000000000000000 0000000000000000  0 0000000000000000
FIXTURE negative-left c000000000000000 4014000000000000  0 4008000000000000
FIXTURE negative-both c000000000000000 c008000000000000  0 c014000000000000
FIXTURE negative-sum 3ff0000000000000 c010000000000000  0 c008000000000000
FIXTURE tenth-plus-fifth 3fb999999999999a 3fc999999999999a  0 3fd3333333333334
FIXTURE negative-zero 8000000000000000 8000000000000000  0 8000000000000000
FIXTURE nan-left 7ff8000000000001 3ff0000000000000  1 0000000000000000
FIXTURE infinity-right 3ff0000000000000 7ff0000000000000  1 0000000000000000
FIXTURE overflow-positive 7fefffffffffffff 7fefffffffffffff  2 0000000000000000
FIXTURE overflow-negative ffefffffffffffff ffefffffffffffff  2 0000000000000000
```

`4014000000000000` is binary64 `5`. Status `1` is a non-finite operand. Status `2` is a non-finite sum. The module SHA-256 is `92a552be9ee7c1421a17948e35caa50dbd746b043d19297db05af07f67f7b5d1`.

Compiler lines printed by the script:

```text
Native GNAT: GNATMAKE 13.3.0
Wasm compiler: llvm-gcc version 14
Linker: /usr/lib/llvm-16/bin/wasm-ld (Ubuntu LLD 16.0.6)
```

## Node checks

```text
node --test tests/catalogue.test.mjs tests/i18n.test.mjs tests/state.test.mjs tests/numbers.test.mjs tests/wasm-parity.test.mjs
```

Result: 20 passed, 0 failed. The parity test instantiated `dist/ath_addition.wasm` through the page’s loader, called Ada, and matched every native status and success bit pattern. A forced HTTP 404 left the session unloaded and did not produce a sum.

## Browser

```text
SHOT_LABEL=primary node tests/shell.browser.mjs
WASM_CONTENT_TYPE=application/octet-stream PORT=8766 SHOT_LABEL=skip node tests/shell.browser.mjs
```

Both printed `BROWSER OK`.

The page was served from `dist/` with relative paths. The first server sent `Content-Type: application/wasm`. The second sent `application/octet-stream`. In both cases the diagnostics showed Ada WebAssembly, the call count was greater than zero, and `2 + 3` rendered `5` only after the module loaded.

Also checked in that run:

- Eight chapter links and every planned section link, with English-slug hashes unchanged in German.
- Keyboard activation of Dilemmas and of Part 1. Previous is unavailable on the first section. Next from Formulating the Method stays Statistics of Cosmic Civilisations after switching the catalogue to title order and to calculators first.
- Chapter plus type filters, a search, an empty calculator filter with the no-results note, and Clear filters returning 74 entries in reading order. Working calculators stay 0.
- Language switch to German keeps edited operands and the canonical result `5`. Reset restores `2` and `3` and keeps German. Close all / Open all keeps an edited operand.
- `0 + 0` shows `0`. `-2 + -3` shows `-5`. An empty field, `2+3`, `NaN`, and `1.7976931348623157e+308` added to itself show an error and a blank result.
- Simulated load failure clears the result and shows the translated retry guidance. Retry loads the module again and shows `5`.
- At 1280×900 and at 320×800, `scrollWidth - clientWidth` was at most 1.

Screenshots from that run are in `docs/review/`.

## Published snapshot

Verified on 8 November 2026 against commit `fecd1d9154dfbef5a69a306ef3409d9219d7958e`:

https://rawcdn.githack.com/RobertBoettcherSF/ada-technological-horizons/fecd1d9154dfbef5a69a306ef3409d9219d7958e/dist/index.html

`curl` received `200` with `text/html` for the page, `application/javascript` for `dist/js/app.js`, and `application/wasm` for `dist/ath_addition.wasm` (6818 bytes). The Wasm response also sent `access-control-allow-origin: *` and `cache-control: max-age=31536000, public, immutable`.

A browser is shown raw.githack’s confirmation screen first (“One more step” / “Open the page”). After that button, headless Chromium loaded this URL and reported:

- release `0.1.0`
- published commit `fecd1d9154dfbef5a69a306ef3409d9219d7958e`
- execution `Ada WebAssembly`
- Wasm response type `application/wasm`
- one Ada call
- result `5` for the default operands `2` and `3`
- eight chapter links

Screenshots of that session are `docs/review/githack-live.png` and `docs/review/githack-demo.png`.
