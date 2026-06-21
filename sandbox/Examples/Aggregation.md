---
tags:
  - type/bar
  - option/aggregation
aliases:
  - Sales
  - Revenue
description: Example aggregation sales.
rank: 2
---

```base
filters:
  and:
    - file.hasProperty("sales_test_revenue")
views:
  - type: chart
    name: Revenue by Quarter
    order:
      - sales_test_revenue
    xAxis: sales_test_quarter
    aggregation: sum
    barWidth: 55
    showLegend: true
    showLabels: true
    showXLabels: true
    showYLabels: true
    yMin: "0"
  - type: chart
    name: Revenue by Quarter and Region
    order:
      - sales_test_revenue
    xAxis: sales_test_quarter
    aggregation: sum
    seriesBy: note.sales_test_region
    barWidth: 55
    showLegend: true
    showLabels: true
    showXLabels: true
    showYLabels: true
    yMin: "0"
  - type: table
    name: Aggregation Test Data
    order:
      - sales_test_quarter
      - sales_test_region
      - sales_test_revenue

```
