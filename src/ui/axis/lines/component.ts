import type { AxisContext } from "../context.ts";
import { TYPE_OPTION } from "../../chart/options.ts";
import { computeYPosition } from "../../chart/layout.ts";
import { createSvgGridLine } from "../../chart/svg.ts";

export class AxisLines {
  constructor(private context: AxisContext) {}

  renderGrid(group: SVGGElement) {
    if (!this.context.showLine) return;
    const chart = this.context.chart;
    if (this.context.type === "y") {
      for (const value of this.context.labels as number[]) {
        const y = computeYPosition(
          chart.baseline,
          value,
          chart.minValue,
          chart.valueRange,
          chart.plotHeight,
        );
        createSvgGridLine(
          group,
          chart.padding.left,
          y,
          chart.width - chart.padding.right,
          y,
          this.context.lineWidth,
          this.context.lineStyle,
        );
      }
    } else {
      const chartType = (chart.config.get(TYPE_OPTION.key) ||
        TYPE_OPTION.default) as string;
      const count = chartType === "bar"
        ? chart.groupCount
        : chart.groupCount - 1;
      const offset = chartType === "bar" ? 0 : 0.5;
      for (let index = 0; index <= count; index++) {
        const x = chart.padding.left + chart.groupWidth * (index + offset);
        createSvgGridLine(
          group,
          x,
          chart.padding.top,
          x,
          chart.baseline,
          this.context.lineWidth,
          this.context.lineStyle,
        );
      }
    }
  }
}
