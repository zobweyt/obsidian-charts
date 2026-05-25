import type { AxisContext } from "../context.ts";
import {
  computeRotatedTextHalfWidth,
  computeRotatedTextHeight,
  computeYPosition,
} from "../../chart/layout.ts";
import { createSvgTextElement } from "../../chart/svg.ts";

export class AxisLabels {
  constructor(private context: AxisContext) {}

  renderLabels() {
    if (!this.context.showLabels) return;
    this.context.type === "y" ? this.renderY() : this.renderX();
  }

  private renderY() {
    const chart = this.context.chart;
    const group = createSvg("g");
    for (const value of this.context.labels as number[]) {
      const y = computeYPosition(
        chart.baseline,
        value,
        chart.minValue,
        chart.valueRange,
        chart.plotHeight,
      );
      const element = createSvgTextElement(
        group,
        chart.padding.left - 8,
        y + 4,
        value.toString(),
        { anchor: "end" },
      );
      element.dataset.yValue = value.toString();
    }
    chart.svg.appendChild(group);
  }

  private renderX() {
    const chart = this.context.chart;
    const rotation = this.context.rotateLabels;
    const fontSize = chart.fontSize;
    const group = createSvg("g");
    const maxHeight = rotation === 0
      ? 0
      : Math.max(...(this.context.labels as string[]).map(
        (label: string) => computeRotatedTextHeight(label, fontSize, rotation),
      ));
    const y = chart.baseline +
      (rotation === 0 ? Math.round(fontSize * 0.75) + 8 : maxHeight / 2 + 8);
    let previousRight = -Infinity;
    (this.context.labels as string[]).forEach(
      (label: string, index: number) => {
        const x = chart.padding.left + chart.groupWidth * (index + 0.5);
        const halfWidth = computeRotatedTextHalfWidth(label, rotation);
        if (x - halfWidth < previousRight) return;
        previousRight = x + halfWidth;
        createSvgTextElement(group, x, y, label, {
          transform: `rotate(${-rotation}, ${x}, ${y})`,
        });
      },
    );
    chart.svg.appendChild(group);
  }
}
