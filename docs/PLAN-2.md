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

These defaults calculate to **6523 years**. A historical account rounded that case to about **6500 years**. The page shows 6523, not the rounding.

Changing only the last duration to 20,000 years calculates **8523 years**.

## Validation

- Every probability must be finite and in 0 .. 100.
- Every duration must be finite and nonnegative.
- The probabilities must total 100 within an absolute tolerance of `1.0e-6` percentage points.
- A total of 90 or 110 is rejected. The page does not renormalise.
- A non-finite contribution or mean is rejected.
- On any error the result and the contribution table are cleared.
- Empty or non-decimal text is rejected before Ada runs, because it is not a numeric value.

The assumptions are historical and subjective. They describe a communication-oriented technological phase. They are not a forecast for humanity, and the end of that phase is not automatically an extinction.

## Out of scope

Spacing, contact age, recurrence, survival curves, and the zero-weight fifth case are not implemented. The design queue in `docs/DESIGN.md` is otherwise unchanged.

## Presentation

Release 0.1.2 also replaces the beige opening. The page uses an original dark palette chosen for the same kind of hierarchy as the syllabus screenshots: near-black navy, blue-grey rounded cards, lime for the active calculator and the result, cyan for labels, and a sans-serif face. The syllabus archive’s only named colours, rain head `#d9ffc3` and trail `#83c79d`, are not used as the page tokens. Rain and audio are not part of this release.

The addition fixture remains a working Ada/Wasm proof inside Technical details, which is closed until opened.
