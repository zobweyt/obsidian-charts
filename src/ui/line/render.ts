import { ChartContext } from "../chart/context.ts";
import { createGradient, createSvgTextElement } from "../chart/svg.ts";
import { createPath } from "./path.ts";

import { Point } from "../../lib/point.ts";

export function computePoints(
  chart: ChartContext,
  values: (number | null)[],
  connectZeros: boolean,
): (Point | null)[] {
  return values.map((value, index) => {
    if ((value === null || value === 0) && !connectZeros) return null;
    const x = chart.padding.left + chart.groupWidth * (index + 0.5);
    const pointValue = value ?? 0;
    return {
      x,
      y: chart.baseline -
        ((pointValue - chart.minValue) / chart.valueRange) * chart.plotHeight,
    };
  });
}

export function segmentsFromPoints(points: (Point | null)[]): Point[][] {
  const segments: Point[][] = [];
  let current: Point[] = [];
  for (const p of points) {
    if (p) {
      current.push(p);
    } else {
      if (current.length) {
        segments.push(current);
        current = [];
      }
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

export function renderArea(
  parent: SVGGElement,
  svg: SVGSVGElement,
  points: Point[],
  curve: string,
  baseline: number,
  resolvedColor: string,
  areaMode: string,
  seriesIndex: number,
  segmentIndex: number,
) {
  const path = createSvg("path", {
    attr: {
      d: createPath(points, curve, true, baseline),
    },
  });
  path.setAttribute(
    "fill",
    areaMode === "gradient"
      ? createGradient(svg, resolvedColor, seriesIndex, segmentIndex)
      : resolvedColor,
  );
  path.style.opacity = areaMode === "gradient" ? "1" : "0.25";
  path.style.pointerEvents = "none";
  parent.appendChild(path);
}

export function renderLinePath(
  parent: SVGGElement,
  points: Point[],
  curve: string,
  baseline: number,
  color: string,
  lineWidth: number,
) {
  const path = createSvg("path", {
    attr: {
      d: createPath(points, curve, false, baseline),
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
  points: (Point | null)[],
  values: (number | null)[],
  lineWidth: number,
  color: string,
) {
  values.forEach((_, index) => {
    const point = points[index];
    if (!point) return;
    const circle = createSvg("circle", {
      cls: "bases-chart-dot",
      attr: {
        cx: point.x,
        cy: point.y,
        r: 2 + lineWidth,
        fill: "var(--background-secondary)",
        stroke: color,
        "stroke-width": lineWidth,
        opacity: "1",
      },
    });
    circle.dataset.index = index.toString();
    circle.dataset.color = color;
    circle.style.pointerEvents = "none";
    parent.appendChild(circle);
  });
}

export function renderLabels(
  parent: SVGGElement,
  points: (Point | null)[],
  values: (number | null)[],
  lineWidth: number,
) {
  const gap = Math.round(2 + 1.5 * lineWidth) + 4;
  values.forEach((value, index) => {
    const point = points[index];
    if (!point) return;
    createSvgTextElement(
      parent,
      point.x,
      point.y - gap,
      (value ?? 0).toString(),
      { cls: "bases-chart-value-label" },
    );
  });
}
