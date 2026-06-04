import { Point } from "../point.ts";

export function bump(
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
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  if (close && bottom !== undefined) {
    d += ` L ${points[n - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }
  return d;
}
