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

These are chosen alignments held in Ada, not a live ephemeris. For Europa and Titan the distance is a mean Earth–planet separation plus the moon’s own orbital radius on the far side of the planet. It is not the planet’s distance from the Sun.

| Preset | Distance | What it is |
| --- | --- | --- |
| Earth–Moon | 384,400 km | NASA’s stated average distance |
| Earth–Venus | 41,390,000 km | NASA fact sheet, mean distance at inferior conjunction |
| Earth–Sun | 1 au | IAU conventional length for the mean Sun–Earth distance |
| Earth–Mars example | 225,000,000 km | A round figure for the often cited average of about 140 million miles |
| Earth–Europa | 629,481,000 km | NASA mean Jupiter opposition, 628.81 million km, plus Europa’s 671,000 km orbit |
| Earth–Titan | 1,283,665,000 km | Difference of the NASA Saturn and Earth semimajor axes, plus Titan’s 1,222,000 km orbit |
| Proxima Centauri | 4.2465 ly | Alpha Centauri C, the nearest star of the system, from the Gaia DR3 parallax. Not Alpha Centauri A or B |
| 1,000 light-years | 1,000 ly | An illustrative interstellar distance. The prefilled example. |

The timeline circles are numbered 1, 2 and 3. Each connecting leg shows that leg’s duration. The list under the graphic shows cumulative time since the signal leaves: 0, the one-way time, then the full round trip. Exact one-way and round-trip seconds stay in the closed sources disclosure. Displayed durations use at most two decimal places. Release 0.1.9 restores the cumulative list; 0.1.8 had put the leg duration on the reply line.

1,000 light-years gives a one-way time of 1,000 Julian years and a reply in 2,000. Zero distance gives zero for both. A negative, empty, non-finite, or overflowing distance clears both times and the timeline.

## Out of scope

Orbital motion, processing or relay delay, bandwidth, and any feedback model are not included. Spacing, contact, and recurrence remain unimplemented.
