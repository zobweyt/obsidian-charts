import { Point } from "../point.ts";

function solveControlPoints(values: number[]): [number[], number[]] {
  const n = values.length - 1;
  const a = new Array(n);
  const b = new Array(n);
  const r = new Array(n);

  a[0] = 0;
  b[0] = 2;
  r[0] = values[0] + 2 * values[1];

  for (let i = 1; i < n - 1; i++) {
    a[i] = 1;
    b[i] = 4;
    r[i] = 4 * values[i] + 2 * values[i + 1];
  }

  a[n - 1] = 2;
  b[n - 1] = 7;
  r[n - 1] = 8 * values[n - 1] + values[n];

  for (let i = 1; i < n; i++) {
    const m = a[i] / b[i - 1];
    b[i] -= m;
    r[i] -= m * r[i - 1];
  }

  const c1 = new Array(n);
  const c2 = new Array(n);

  c1[n - 1] = r[n - 1] / b[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    c1[i] = (r[i] - c1[i + 1]) / b[i];
  }

  c2[n - 1] = (values[n] + c1[n - 1]) / 2;
  for (let i = 0; i < n - 1; i++) {
    c2[i] = 2 * values[i + 1] - c1[i + 1];
  }

  return [c1, c2];
}

export function natural(
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

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [cx1, cx2] = solveControlPoints(xs);
  const [cy1, cy2] = solveControlPoints(ys);

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    d += ` C ${cx1[i]} ${cy1[i]}, ${cx2[i]} ${cy2[i]}, ${points[i + 1].x} ${
      points[i + 1].y
    }`;
  }
  if (close && bottom !== undefined) {
    d += ` L ${points[n - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  }
  return d;
}
