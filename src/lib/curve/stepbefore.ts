import { Point } from "../point.ts";

export function stepbefore(
  points: Point[],
  close?: boolean,
  bottom?: number,
): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i], p1 = points[i + 1];
    d += ` L ${p0.x} ${p1.y} L ${p1.x} ${p1.y}`;
  }
  if (close && bottom !== undefined) {
    d += ` L ${points[n - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }
  return d;
}
