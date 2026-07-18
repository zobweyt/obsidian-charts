---
tags:
  - type/line
  - option/xAxisScale
aliases:
  - Temperature
  - xAxisScale
description: Demonstrating numeric X-axis scale with date and number properties.
rank: 4
---

# Temperature Readings

Body temperature readings taken at irregular intervals over two weeks.

**Category** — all points equally spaced, data in file order.  
**Numeric** — points positioned proportionally to their actual number/date value, sorted correctly.

With numeric scale, `reading_day` values `[1, 2, 4, 7, 8, 15]` create gaps:
- Between 2 and 4 → 2× the space of 1→2 (the "3" is empty)
- Between 4 and 7 → 3× the space  
- Between 8 and 15 → 7× the space

## By Date

![[Temperature Readings.base#By Date — Category]]

![[Temperature Readings.base#By Date — Numeric]]

## By Day Number

![[Temperature Readings.base#By Day Number — Category]]

![[Temperature Readings.base#By Day Number — Numeric]]
