import type { BasesPropertyId } from "obsidian";
import type { ChartContext } from "../chart/context.ts";

export class Legend {
  private elements: HTMLElement[] = [];

  constructor(private chart: ChartContext) {}

  render() {
    this.destroy();
    if (!this.chart.showLegend) return;
    const propertyNames = this.chart.data.properties.map(
      (property: BasesPropertyId) => this.chart.config.getDisplayName(property),
    );
    const items = propertyNames.map(
      (name: string, index: number) => ({
        name,
        color: this.chart.colors[index % this.chart.colors.length],
      }),
    );
    if (items.length === 0) return;
    const element = createDiv({
      cls:
        `bases-chart-legend bases-chart-legend-${this.chart.legendSide} bases-chart-legend-${this.chart.legendAlign}`,
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
    this.chart.wrapper.appendChild(element);
    this.elements.push(element);
  }

  destroy() {
    this.elements.forEach((element) => element.remove());
    this.elements = [];
  }
}
