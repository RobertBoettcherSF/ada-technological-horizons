# Plan 6 — Information and possible choices

Implemented in 0.1.18 under Creating Worlds / Cultivating Information.

One selection among N equally likely possibilities carries I = log2(N) bits. k independent repetitions have N^k combinations and k·log2(N) bits. k = 0 is one empty combination and 0 bits. N = 1 is 0 bits.

A fixed-length binary code uses ceil(log2(N)) bits per selection. That whole number is not the ideal information. Neither quantity is meaning or intelligence.

The fair coin, the six-sided die and the 26-letter alphabet are teaching examples. They are not quotations. The book’s own context, kept in the collapsed source note, is a logarithmic measure of selective information and a contrast between a small set of element statements, about 100, and a vocabulary-sized set. 100 is not treated as a quoted exact vocabulary.

N and k must be whole numbers. N is at least 1. Values above 2^53 are rejected because binary64 cannot store every larger integer exactly. When N^k exceeds the finite range, the count is not replaced by a largest finite stand-in. The ideal information and log10 of the count remain when they are finite.

This calculator does not compute unequal-probability entropy and it does not implement the research-coverage lottery.
