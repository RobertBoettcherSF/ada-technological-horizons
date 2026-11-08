# Plan 5 — biological information throughput

Release 0.1.10. Same branch and pull request as the earlier calculators. Not merged.

## Question

How long does a stated quantity take at a constant rate, and how much does that rate convey in a stated duration?

## Place

A Lampoon of Evolution / Constructing Life. The design queue already places this comparison there. The English translation of that section sets three unlike figures side by side: a low-redundancy printed page of about 10,000 bits, a human mind coping with about 25 bits each second, and a bacterium producing at least 1,000 bits each second. The bacterial figure is tied to a sketch in which *E. coli* divides about every 20 minutes and produces about 1,000 protein molecules a second, each of about 1,000 amino acids. Those are Lem’s historical estimates, not a Shannon measurement and not a modern assay.

## What the card does

Ada divides quantity by rate, and multiplies rate by duration. A kilobit is 1,000 bits. One page unit is the historical 10,000-bit page. Bits per minute are divided by 60. Hours are 3,600 seconds. The prefilled example is one such page at 25 bits/s for 400 seconds: the time is 400 seconds and the total is 10,000 bits. The same page at the bacterial figure takes at most 10 seconds. The rate ratio is 40.

The chart shows those two historical rates on a linear scale. The bacterial bar is 40 times the human bar. The times remain beside the rates, and the bacterial time is an upper bound because 1,000 bits/s is a lower bound. A separate nominal 1000 Mb/s 1000BASE-T line rate, from IEEE Std 802.3, gives the ideal constant-rate time for the same quantity. It is not placed on the linear bars. A logarithmic scale can include it and is labelled as not the 40-to-1 ratio. A rate of zero with a positive quantity is unreachable: no finite time is shown. Zero divided by zero is not given a fabricated time.

## What it does not do

It does not claim a universal brain bandwidth. It does not show that a bacterium reads a page. It does not load a contemporary spike rate, a DNA alphabet capacity, or a task-information estimate. Those are different definitions, so converting them into these bits would mix measurements. Edited numbers are the visitor’s own assumption. No biological simulation is added. The lifetime, growth, and light-time calculators stay as they were, including the cumulative reply line.
