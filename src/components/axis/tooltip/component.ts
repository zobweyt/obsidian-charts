import type { AxisContext } from "../context.ts";

export class AxisTooltip {
  private element: HTMLElement;
  private titleElement: HTMLElement;
  private rows: { indicator: HTMLElement; value: HTMLElement }[] = [];

  constructor(private context: AxisContext) {
    this.element = createDiv({ cls: "bases-chart-tooltip" });
    this.titleElement = this.element.createDiv({
      cls: "bases-chart-tooltip-title",
    });
    context.chart.seriesNames.forEach((name: string, index: number) => {
      const row = this.element.createDiv({ cls: "bases-chart-tooltip-row" });
      const left = row.createDiv({ cls: "bases-chart-tooltip-row-left" });
      const indicator = left.createDiv({
        cls: "bases-chart-tooltip-indicator",
      });
      indicator.style.backgroundColor = context.chart.colors[index];
      left.createSpan({ cls: "bases-chart-tooltip-name", text: name });
      this.rows.push({
        indicator,
        value: row.createSpan({ cls: "bases-chart-tooltip-value" }),
      });
    });
  }

  show(index: number, rx: number, ry: number) {
    const chart = this.context.chart;
    this.titleElement.textContent = chart.xLabels[index];
    chart.values.forEach((values: (number | null)[], seriesIndex: number) => {
      this.rows[seriesIndex].value.textContent = (values[index] ?? 0)
        .toString();
      this.rows[seriesIndex].indicator.style.backgroundColor =
        chart.colors[seriesIndex];
    });
    chart.wrapper.appendChild(this.element);
    this.position(rx, ry);
  }

  hide() {
    this.element.remove();
  }

  isVisible() {
    return !!this.element.parentNode;
  }

  destroy() {
    this.element.remove();
  }

  position(rx: number, ry: number) {
    const wrapper = this.context.chart.wrapper;
    const wrapperRect = wrapper.getBoundingClientRect();
    const scaleX = wrapperRect.width > 0
      ? wrapper.offsetWidth / wrapperRect.width
      : 1;
    const scaleY = wrapperRect.height > 0
      ? wrapper.offsetHeight / wrapperRect.height
      : 1;
    const scale = Math.min(scaleX, scaleY);
    const viewX = rx * scaleX;
    const viewY = ry * scaleY;
    const margin = 24 * scale;
    const edgePadding = 8 * scale;
    this.element.style.left = "0px";
    this.element.style.top = "0px";
    const tooltipRect = this.element.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width * scaleX;
    const tooltipHeight = tooltipRect.height * scaleY;
    const maxX = wrapper.offsetWidth - tooltipWidth - edgePadding;
    const maxY = wrapper.offsetHeight - tooltipHeight - edgePadding;
    const positions = [
      { left: viewX + margin, top: viewY + margin },
      { left: viewX + margin, top: viewY - tooltipHeight - margin },
      { left: viewX - tooltipWidth - margin, top: viewY + margin },
      {
        left: viewX - tooltipWidth - margin,
        top: viewY - tooltipHeight - margin,
      },
    ];
    for (const position of positions) {
      if (
        position.left >= edgePadding &&
        position.left <= maxX &&
        position.top >= edgePadding &&
        position.top <= maxY
      ) {
        this.element.style.left = `${position.left}px`;
        this.element.style.top = `${position.top}px`;
        return;
      }
    }
    this.element.style.left = `${
      Math.max(edgePadding, Math.min(viewX - margin, maxX))
    }px`;
    this.element.style.top = `${
      Math.max(edgePadding, Math.min(viewY - margin, maxY))
    }px`;
  }
}
