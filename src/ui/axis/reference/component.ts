import type { AxisContext } from "../context.ts";
import { computeYPosition } from "../../chart/layout.ts";
import { computeDashArray, createSvgTextElement } from "../../chart/svg.ts";

export class AxisReferenceLine {
  constructor(private context: AxisContext) {}

  render(group: SVGGElement) {
    if (!this.context.referenceValue) return;
    const referenceValue = Number(this.context.referenceValue);
    if (isNaN(referenceValue)) return;
    const chart = this.context.chart;
    const y = computeYPosition(
      chart.baseline,
      referenceValue,
      chart.minValue,
      chart.valueRange,
      chart.plotHeight,
    );
    if (y < chart.padding.top || y > chart.baseline) return;
    group.appendChild(createSvg("line", {
      attr: {
        x1: chart.padding.left,
        x2: chart.width - chart.padding.right,
        y1: y,
        y2: y,
        stroke: this.context.referenceColor,
        "stroke-dasharray": this.context.referenceStyle !== "solid"
          ? computeDashArray(this.context.referenceStyle)
          : "",
        "stroke-width": this.context.referenceWidth,
      },
    }));
    if (this.context.referenceName) {
      createSvgTextElement(
        group,
        chart.padding.left + 4,
        y - 4,
        this.context.referenceName,
        { anchor: "start", fill: this.context.referenceColor },
      );
    }
    const match = chart.svg.querySelector(
      `[data-y-value="${referenceValue}"]`,
    ) as
      | SVGTextElement
      | null;
    if (match) {
      match.style.fill = this.context.referenceColor;
    } else {
      createSvgTextElement(
        group,
        chart.padding.left - 8,
        y + 4,
        referenceValue.toString(),
        {
          anchor: "end",
          fill: this.context.referenceColor,
        },
      );
    }
  }
}
