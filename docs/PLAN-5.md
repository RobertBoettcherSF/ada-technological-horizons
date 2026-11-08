# Plan 5 — biological information throughput

Release 0.1.10. Same branch and pull request as the earlier calculators. Not merged.

## Question

How long does a stated quantity take at a constant rate, and how much does that rate convey in a stated duration?

## Place

A Lampoon of Evolution / Constructing Life. The design queue already places this comparison there. The English translation of that section sets three unlike figures side by side: a low-redundancy printed page of about 10,000 bits, a human mind coping with about 25 bits each second, and a bacterium producing at least 1,000 bits each second. The bacterial figure is tied to a sketch in which *E. coli* divides about every 20 minutes and produces about 1,000 protein molecules a second, each of about 1,000 amino acids. Those are Lem’s historical estimates, not a Shannon measurement and not a modern assay.

## What the card does

Ada divides quantity by rate, and multiplies rate by duration. A kilobit is 1,000 bits. One page unit is the historical 10,000-bit page. Bits per minute are divided by 60. Hours are 3,600 seconds. The prefilled example is one such page at 25 bits/s for 400 seconds: the time is 400 seconds and the total is 10,000 bits. The same page at the bacterial figure takes at most 10 seconds. The rate ratio is 40.

The chart plots information transmitted against time, and information equals rate times time. Lem’s example draws the human and bacterial curves for 10,000 bits: 25 bits/s crosses at 400 s, and the bacterial lower bound crosses at 10 s. A logarithmic scale uses positive time and positive information only, so zero is left off. On those axes a constant rate is a line of slope 1, and the rate is the gap between the lines. The nominal 1000 Mb/s 1000BASE-T line rate, from IEEE Std 802.3, is an ideal constant-rate comparison with the human figure, not framed payload and not a processing speed. Ten thousand bits at that rate take 10 µs. A rate of zero with a positive quantity is unreachable: no finite time is shown. Zero divided by zero is not given a fabricated time.

## What it does not do

It does not claim a universal brain bandwidth. It does not show that a bacterium reads a page. It does not load a contemporary spike rate, a DNA alphabet capacity, or a task-information estimate. Those are different definitions, so converting them into these bits would mix measurements. Edited numbers are the visitor’s own assumption. No biological simulation is added. The lifetime, growth, and light-time calculators stay as they were, including the cumulative reply line.
