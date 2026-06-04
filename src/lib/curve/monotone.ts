import { Point } from "../point.ts";

function sign(x: number): number {
  return x < 0 ? -1 : 1;
}

function slope3(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const h0 = x1 - x0;
  const h1 = x2 - x1;
  const s0 = h0 !== 0 ? (y1 - y0) / h0 : 0;
  const s1 = h1 !== 0 ? (y2 - y1) / h1 : 0;
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (h0 !== 0 && h1 !== 0)
    ? (sign(s0) + sign(s1)) *
      Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p))
    : 0;
}

function slope2(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  t: number,
): number {
  const h = x1 - x0;
  return h !== 0 ? (3 * (y1 - y0) / h - t) / 2 : t;
}

function bezierSegment(p0: Point, p1: Point, t0: number, t1: number): string {
  const dx = (p1.x - p0.x) / 3;
  return ` C ${p0.x + dx} ${p0.y + dx * t0}, ${p1.x - dx} ${
    p1.y - dx * t1
  }, ${p1.x} ${p1.y}`;
}

export function monotone(
  points: Point[],
  close?: boolean,
  bottom?: number,
): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x} ${points[0].y}`;
  if (n === 2) {
    let d = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    if (close && bottom !== undefined) {
      d += ` L ${points[1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
    }
    return d;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  const t0 = slope3(
    points[0].x,
    points[0].y,
    points[1].x,
    points[1].y,
    points[2].x,
    points[2].y,
  );
  const t1 = slope2(points[0].x, points[0].y, points[1].x, points[1].y, t0);
  d += bezierSegment(points[0], points[1], t0, t1);

  for (let i = 1; i < n - 2; i++) {
    const t = slope3(
      points[i].x,
      points[i].y,
      points[i + 1].x,
      points[i + 1].y,
      points[i + 2].x,
      points[i + 2].y,
    );
    d += bezierSegment(points[i], points[i + 1], t, t);
  }

  if (n > 2) {
    const lastT = slope2(
      points[n - 2].x,
      points[n - 2].y,
      points[n - 1].x,
      points[n - 1].y,
      0,
    );
    d += bezierSegment(points[n - 2], points[n - 1], lastT, lastT);
  }

  if (close && bottom !== undefined) {
    d += ` L ${points[n - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }
  return d;
}
