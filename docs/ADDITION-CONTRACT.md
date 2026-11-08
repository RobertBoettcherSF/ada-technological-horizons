# Binary64 addition contract

`Ath_Addition` adds two `Long_Float` values. Both pinned compilers use a 64-bit `Long_Float`, so the values are IEEE-754 binary64. The package does not read text. An empty field has no binary64 value, and the page rejects it before calling Ada. That rejection is marshalling, not a second implementation of the sum.

## Status codes

| Code | Name | Meaning |
| --- | --- | --- |
| 0 | `Ok` | Both operands and the sum are finite. |
| 1 | `Non_Finite_Input` | At least one operand is an infinity or a NaN. |
| 2 | `Result_Not_Finite` | Both operands are finite and the sum is not. |

On any non-zero status the result parameter is `0.0`, the exported last-sum slot is cleared to `0.0`, and the page leaves the result blank. A cleared slot must not be shown as the sum.

## Rules

- A negative finite operand is an ordinary value. `-2 + 5` is `3`, and `-2 + -3` is `-5`.
- `2 + 3` is `5`. `0 + 0` is `0`.
- Overflow of two finite values to ±infinity is `Result_Not_Finite`. The checked cases are `Long_Float'Last + Long_Float'Last` and `Long_Float'First + Long_Float'First`.
- Underflow to a finite result, including zero, is success.
- The sum of two negative zeros is negative zero in this Ada addition. The page still prints `0`, because `0` and `-0` are the same numeric value and the canonical rendering has no sign on zero.
- Tokens `NaN`, `Infinity`, and `Inf`, with an optional sign, are passed through as IEEE values so Ada can reject them. Text such as `2+3`, `1,5`, or `abc` is malformed and is not evaluated.
- The decimal separator is `.` in every language. Ada never sees translated text.
- Published integer fixtures must match bit for bit (absolute tolerance zero). The native program prints those bits. The Wasm test replays the same bits and requires the same status and, on success, the same result bits.

JavaScript calls `ath_add_f64` and, only when the status is `0`, `ath_last_sum`. It does not add the operands itself.
