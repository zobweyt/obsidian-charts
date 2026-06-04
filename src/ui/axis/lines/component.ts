import { AxisContext } from "../context.ts";
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
      for (let index = 0; index <= chart.groupCount; index++) {
        const x = chart.padding.left + chart.groupWidth * index;
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
