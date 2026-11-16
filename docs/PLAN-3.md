# Plan 3 — Scientific-information growth

**Ada Technological Horizons · approved with “OK” and implemented in release 0.1.4. Release 0.1.5 adds the calendar, baseline, and target year. Release 0.1.6 extends the chart through a reachable target.**

The visitor-facing calculator is Intellectronics / Return to Earth. Ada computes unrestricted exponential growth of a normalised index. JavaScript only marshals the fields and draws the samples Ada returns. It does not evaluate the power, the factor, or the curve.

## Model

N = N₀ · 2^(t / d)

- N₀ is the starting quantity, in index units. The default **1** is a presentation choice, not a historical count.
- d is the doubling time in years. The default **15** follows the historical discussion of scientific periodicals.
- t is the elapsed time in years. The default is **30**.

The growth factor is 2^(t / d), including when N₀ is 0. The quantity is then 0. The factor is not the quotient N / N₀.

An integer exponent in 0 .. 1023 uses an exact power of two. Any other finite exponent uses `Ada.Numerics.Long_Elementary_Functions` (`Exp` of the exponent times `Log` 2). A non-finite power or product is an error. The result is never replaced by a finite stand-in.

The curve is 11 samples. Sample i (1 .. 10) is at time t · (i − 1) / 10. The last sample is exactly the reported elapsed time and quantity. The SVG scales those samples for display. The table is the accessible alternative.

## Accepted examples

| Inputs | Quantity | Factor |
| --- | ---: | ---: |
| N₀ = 1, d = 15, t = 30 | 4 | 4 |
| N₀ = 1, d = 15, t = 15 | 2 | 2 |
| t = 0, any finite nonnegative N₀ and positive d | N₀ | 1 |
| N₀ = 0, d = 15, t = 30 | 0 | 4 |

These four results are exact binary64 values. Native and Wasm tests compare them by bits, so the tolerance is zero. The same bit comparison covers the fractional curve samples from this toolchain: native GNAT 13.3.0 and the AdaWebPack wasm32 run-time both use `Ada.Numerics.Long_Elementary_Functions`, and the replay requires identical bits. Display text is the canonical decimal of the binary64 value Ada returned. It is not rounded to a nearby integer and it is not capped.

## Validation

- N₀ must be finite and nonnegative.
- t must be finite and nonnegative.
- d must be finite and greater than 0.
- Empty or non-decimal text is rejected in the browser before Ada runs, because it is not a numeric value. `NaN` and infinities are passed through and Ada rejects them.
- Overflow, including t = 20000 and d = 1, returns status 5. Quantity, factor and every sample are cleared.
- A failed input clears the previous quantity, factor, curve and table.

Status codes: 0 ok, 1 non-finite input, 2 negative starting quantity, 3 negative elapsed time, 4 doubling time not positive, 5 result not finite.

Reset restores 1, 15 and 30. Language, catalogue filters and the collapsed state do not change the three fields. The civilisation calculator is left as it was in 0.1.3.

## Explorer clarity in 0.1.5

The quantity model is unchanged. The chart adds a presentation calendar and a comparison, still computed in Ada.

- The starting year is a whole number from -10000 to 10000. The default **2026** only places the horizon on a calendar. It is not a measured date. The chart runs from that year through start + t. With the defaults, quantity 4 is at **2056**.
- A second curve uses the same starting quantity, horizon, and year, with the historical doubling time fixed at 15 years. It is a baseline on the same axes, not a forecast. Changing d moves only the chosen curve.
- Linear and logarithmic are display switches. The table values do not change. A quantity of zero cannot be shown on a logarithmic axis, so that switch is disabled and the chart stays linear.
- The target quantity defaults to **10**, an illustrative level. Ada computes t = d · log₂(target / N₀) and the year start + t. Target 4 with d = 15 is **2056**. The same target with d = 14 is **2054**. A target already at or below N₀ is the starting year, not a crossing placed in the past. N₀ = 0 never reaches a positive target. A finite year beyond the chart is reported as outside the displayed horizon. An invalid target clears that year and leaves a valid curve in place.
- Ada returns 61 samples for both curves. The page shows those values with a short significant-digit form. Exact canonical figures stay in the closed Exact figures disclosure.
- There is no tipping point in a fixed exponential. The note on the card says so in one sentence.

An integer power of two, and every calendar sum of the default years, is bit-exact in native GNAT and in Wasm. A non-integer power may differ by one binary64 ulp between the native maths library and the wasm32 run-time. The parity check allows that one ulp and still requires the baseline to be cleared, rather than capped, when it overflows.

## Chart horizon in 0.1.6

The quantity and the factor stay at the elapsed time the visitor entered. When a positive target is reached later, Ada samples both the chosen curve and the 15-year baseline through the next whole calendar year at or after that crossing. For a start of 2026, a doubling time of 14 years, 30 elapsed years and a target of 20, the quantity is about 4.41636 at 2056 and the chart ends at 2087, which includes the crossing. Lowering the target back inside the 30 years restores the chart end to 2056. A target already reached at the start, and a starting quantity of zero, do not add any future years. If the longer curve is not finite, the chart stays on the elapsed time and nothing is capped.

## Out of scope

The researcher/discoveries comparison, logistic or resource limits, spacing, contact, recurrence, feedback, and every later queue item stay unimplemented. The addition proof remains inside Technical details, closed until opened.
