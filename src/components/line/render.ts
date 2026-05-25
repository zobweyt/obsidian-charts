import type { ChartContext } from "../chart/context.ts";
import { createSvgTextElement, gradientFill } from "../chart/svg.ts";
import { createPath } from "./path.ts";

export interface Point {
  x: number;
  y: number;
}

export function computePoints(
  chart: ChartContext,
  values: (number | null)[],
): Point[] {
  return values.map((value: number | null, index: number) => {
    const x = chart.padding.left + chart.groupWidth * (index + 0.5);
    const pointValue = value ?? 0;
    return {
      x,
      y: chart.baseline -
        ((pointValue - chart.minValue) / chart.valueRange) * chart.plotHeight,
    };
  });
}

export function renderArea(
  parent: SVGGElement,
  points: Point[],
  smooth: boolean,
  baseline: number,
  resolvedColor: string,
  areaMode: string,
) {
  const path = createSvg("path", {
    attr: {
      d: createPath(points, smooth, true, baseline),
    },
  });
  path.style.fill = areaMode === "gradient"
    ? gradientFill(resolvedColor)
    : resolvedColor;
  path.style.opacity = areaMode === "gradient" ? "1" : "0.25";
  path.style.pointerEvents = "none";
  parent.appendChild(path);
}

export function renderLinePath(
  parent: SVGGElement,
  points: Point[],
  smooth: boolean,
  baseline: number,
  color: string,
  lineWidth: number,
) {
  const path = createSvg("path", {
    attr: {
      d: createPath(points, smooth, false, baseline),
      fill: "none",
      stroke: color,
      "stroke-width": lineWidth,
      "stroke-linejoin": "round",
    },
  });
  path.style.pointerEvents = "none";
  parent.appendChild(path);
}

export function renderPoints(
  parent: SVGGElement,
  points: Point[],
  values: (number | null)[],
  lineWidth: number,
  color: string,
) {
  values.forEach((_value: number | null, index: number) => {
    const circle = createSvg("circle", {
      attr: {
        cx: points[index].x,
        cy: points[index].y,
        r: 3 * lineWidth,
        fill: color,
        opacity: "1",
      },
    });
    circle.style.pointerEvents = "none";
    parent.appendChild(circle);
  });
}

export function renderLabels(
  parent: SVGGElement,
  points: Point[],
  values: (number | null)[],
) {
  values.forEach((value: number | null, index: number) => {
    createSvgTextElement(
      parent,
      points[index].x,
      points[index].y - 8,
      (value ?? 0).toString(),
    );
  });
}
