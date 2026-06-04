import { ChartContext } from "../chart/context.ts";

export function createLegend(chart: ChartContext): HTMLElement | null {
  if (!chart.showLegend) return null;
  const items = chart.seriesNames.map(
    (name, index) => ({
      name,
      color: chart.colors[index % chart.colors.length],
    }),
  );
  if (items.length === 0) return null;
  const element = createDiv({
    cls:
      `bases-chart-legend bases-chart-legend-${chart.legendSide} bases-chart-legend-${chart.legendAlign}`,
  });
  for (const item of items) {
    const itemElement = element.createDiv({ cls: "bases-chart-legend-item" });
    itemElement.createSpan({ cls: "bases-chart-legend-indicator" }).style
      .backgroundColor = item.color;
    itemElement.createSpan({
      cls: "bases-chart-legend-text",
      text: item.name,
    });
  }
  return element;
}
