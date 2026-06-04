import { createSvgTextElement } from "../chart/svg.ts";

export const GAP = 6;
export const MIN_LABEL_HEIGHT = 10;

export function createBarPath(
  barX: number,
  barY: number,
  barWidth: number,
  barHeight: number,
  radius: number,
): string {
  const r = Math.min(radius, barWidth / 2, barHeight / 2);
  return `M ${barX + r} ${barY} L ${
    barX + barWidth - r
  } ${barY} A ${r} ${r} 0 0 1 ${barX + barWidth} ${barY + r} L ${
    barX + barWidth
  } ${barY + barHeight - r} A ${r} ${r} 0 0 1 ${barX + barWidth - r} ${
    barY + barHeight
  } L ${barX + r} ${barY + barHeight} A ${r} ${r} 0 0 1 ${barX} ${
    barY + barHeight - r
  } L ${barX} ${barY + r} A ${r} ${r} 0 0 1 ${barX + r} ${barY} Z`;
}

export function createBarLabel(
  parent: SVGGElement,
  barX: number,
  barY: number,
  barWidth: number,
  value: number,
) {
  createSvgTextElement(
    parent,
    barX + barWidth / 2,
    barY - 4,
    value.toString(),
    {
      cls: "bases-chart-value-label",
    },
  );
}
