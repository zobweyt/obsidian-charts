import { ChartContext } from "../chart/context.ts";
import { computePosition } from "./position.ts";

export class Tooltip {
  private element: HTMLElement;
  private titleElement: HTMLElement;
  private rows: { indicator: HTMLElement; value: HTMLElement }[] = [];

  constructor(private chart: ChartContext) {
    this.element = createDiv({ cls: "tooltip bases-chart-tooltip" });
    this.titleElement = this.element.createDiv({
      cls: "bases-chart-tooltip-title",
    });
    chart.seriesNames.forEach((name, index) => {
      const row = this.element.createDiv({ cls: "bases-chart-tooltip-row" });
      const left = row.createDiv({ cls: "bases-chart-tooltip-row-left" });
      const indicator = left.createDiv({
        cls: "bases-chart-tooltip-indicator",
      });
      indicator.style.backgroundColor = chart.colors[index];
      left.createSpan({ cls: "bases-chart-tooltip-name", text: name });
      this.rows.push({
        indicator,
        value: row.createSpan({ cls: "bases-chart-tooltip-value" }),
      });
    });
  }

  show(index: number, rx: number, ry: number) {
    this.titleElement.textContent = this.chart.xLabels[index];
    this.chart.values.forEach(
      (values, seriesIndex) => {
        this.rows[seriesIndex].value.textContent = (values[index] ?? 0)
          .toString();
        this.rows[seriesIndex].indicator.style.backgroundColor =
          this.chart.colors[seriesIndex];
      },
    );
    this.chart.wrapper.appendChild(this.element);
    this.position(rx, ry);
  }

  hide() {
    this.element.remove();
  }

  isVisible() {
    return !!this.element.parentNode;
  }

  position(rx: number, ry: number) {
    const { left, top } = computePosition(
      this.element,
      this.chart.wrapper,
      rx,
      ry,
    );
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  destroy() {
    this.element.remove();
  }
}
