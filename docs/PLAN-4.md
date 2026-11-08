# Plan 4 — Communication delay and remote control

**Ada Technological Horizons · implemented in release 0.1.7**

The calculator sits under Phantomology / Teletaxy and Phantomultiplication. Teletaxy is action somewhere you are not. The same light-time is why a conversation at interstellar distance cannot stay prompt, which is the scale discussed with cosmic civilisations. This page does not decide whether contact happens, and it does not quote one formula from the book.

## Model

A distance is fixed. The signal travels in vacuum at the speed of light. Nothing is added for thinking, relays, orbits, or bandwidth.

- One-way time = distance / c
- Reply time = twice the one-way time, a command and its immediate reply

Ada returns those two times and the timeline: the signal leaves at 0, arrives at the one-way time, and the reply arrives at the round-trip time. JavaScript only renders that timeline and chooses a readable unit.

## Constants

- Speed of light in vacuum: 299,792,458 m/s, the SI definition of the metre.
- Astronomical unit: 149,597,870,700 m exactly, IAU 2012 Resolution B2.
- Light-year: the distance light travels in one Julian year of 365.25 days of 86,400 s, as recognised by the IAU. One light-year therefore takes exactly one Julian year, 31,557,600 s.

## Presets

These are chosen examples held in Ada.

| Preset | Distance | What it is |
| --- | --- | --- |
| Earth–Moon | 384,400 km | NASA’s stated average distance |
| Earth–Mars example | 225,000,000 km | A round figure for the often cited average of about 140 million miles. Not the distance today. |
| 1,000 light-years | 1,000 ly | An illustrative interstellar distance. The prefilled example. |

1,000 light-years gives a one-way time of 1,000 Julian years and a reply in 2,000. Zero distance gives zero for both. A negative, empty, non-finite, or overflowing distance clears both times and the timeline.

## Out of scope

Orbital motion, processing or relay delay, bandwidth, and any feedback model are not included. Spacing, contact, and recurrence remain unimplemented.
