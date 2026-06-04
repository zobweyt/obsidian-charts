import { Point } from "../point.ts";

export function linear(
  points: Point[],
  close?: boolean,
  bottom?: number,
): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < n; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  if (close && bottom !== undefined) {
    d += ` L ${points[n - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }
  return d;
}
