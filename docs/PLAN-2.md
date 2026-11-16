# Plan 2 — Civilisation weighted mean

**Ada Technological Horizons · approved with “OK” and implemented in release 0.1.2**

The visitor-facing calculator is Statistics of Cosmic Civilisations. It uses four historical alternative fates. Ada computes the weighted mean. JavaScript only marshals the fields and draws the contributions Ada returns.

## Defaults

| Fate | Probability | Mean duration |
| --- | ---: | ---: |
| Complete destruction of life | 5% | 100 years |
| Destruction of higher life | 60% | 30 years |
| Physical or mental degeneration | 15% | 30,000 years |
| Loss of scientific or technical interest | 20% | 10,000 years |

Weights are the probabilities divided by 100. The mean is Σ pᵢ lᵢ.

These defaults calculate to **6523 years**. The headline shows that mean to the nearest 100 years, so the defaults read **6500**. Changing only the last duration to 20,000 years calculates **8523** and displays **8500**. Contributions stay exact. A positive mean that would round to 0 is shown exactly instead. The exact mean is also listed under Technical details.

## Rebalancing

Editing one valid probability leaves that value fixed. Ada moves the other three by equal additions or subtractions until they sum with it to 100, stopping each of them at 0 and at 100. If a binary64 leftover remains, it is added to the lowest-index of those three that can accept it inside 0 .. 100. The page writes those adjusted probabilities into the other fields immediately. It does not scale them in proportion, and it does not rewrite the field being typed. An empty, malformed, negative, non-finite, or above-100 entry does not rebalance and clears the mean. Changing a duration does not rebalance probabilities. Reset restores 5, 60, 15, 20 and the original durations.

From the defaults, changing 60 to 30 yields 15, 30, 25, 30. Changing 5 to 95 yields 95, 5, 0, 0. Changing the first value to 100 yields 100, 0, 0, 0. Changing that 100 to 0 shares 100 equally across the other three.

## Validation

- Every probability must be finite and in 0 .. 100. The edited value is not clamped.
- Every duration must be finite and nonnegative.
- `Weighted_Mean` still requires a total of 100 within `1.0e-6` percentage points. Rebalance is what produces that total after an edit.
- A non-finite contribution or mean is rejected.
- On any error the headline and the contribution table are cleared.
- Empty or non-decimal text is rejected before Ada runs, because it is not a numeric value.

The assumptions are historical and subjective. They describe a communication-oriented technological phase. They are not a forecast for humanity, and the end of that phase is not automatically an extinction.

## Out of scope

Spacing, contact age, recurrence, survival curves, and the zero-weight fifth case are not implemented. Release 0.1.4 adds the separate growth calculator. It does not change this mean, the rebalance rule, or the headline rounding.

## Presentation

Release 0.1.2 also replaces the beige opening. The page uses an original dark palette chosen for the same kind of hierarchy as the syllabus screenshots: near-black navy, blue-grey rounded cards, lime for the active calculator and the result, cyan for labels, and a sans-serif face. The syllabus archive’s only named colours, rain head `#d9ffc3` and trail `#83c79d`, are not used as the page tokens. Rain and audio are not part of this release.

The addition fixture remains a working Ada/Wasm proof inside Technical details, which is closed until opened.
