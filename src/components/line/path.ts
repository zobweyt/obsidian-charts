export function createPath(
  points: { x: number; y: number }[],
  smooth: boolean,
  close: boolean,
  bottom: number,
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  if (smooth && points.length > 2) {
    const n = points.length;
    const slopes = points.slice(0, -1).map((p, i) => {
      const dx = points[i + 1].x - p.x;
      return dx !== 0 ? (points[i + 1].y - p.y) / dx : 0;
    });
    const tangents = points.map((_, i) => {
      if (i === 0 || i === n - 1) return i === 0 ? slopes[0] : slopes[n - 2];
      const s1 = slopes[i - 1], s2 = slopes[i];
      if (s1 * s2 <= 0) return 0;
      return Math.sign(s1) *
        Math.min(
          Math.abs(2 * s1 * s2 / (s1 + s2)),
          3 * Math.min(Math.abs(s1), Math.abs(s2)),
        );
    });
    for (let i = 0; i < n - 1; i++) {
      const p0 = points[i], p1 = points[i + 1], dx = p1.x - p0.x;
      if (dx === 0) {
        d += ` L ${p1.x} ${p1.y}`;
        continue;
      }
      d += ` C ${p0.x + dx / 3} ${p0.y + tangents[i] * dx / 3}, ${
        p1.x - dx / 3
      } ${p1.y - tangents[i + 1] * dx / 3}, ${p1.x} ${p1.y}`;
    }
  } else {
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
  }
  if (close) {
    d += ` L ${points[points.length - 1].x} ${bottom} L ${
      points[0].x
    } ${bottom} Z`;
  }
  return d;
}
