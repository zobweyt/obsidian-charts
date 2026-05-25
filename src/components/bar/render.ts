import { createSvgTextElement } from "../chart/svg.ts";

export const GAP = 6;
export const MIN_LABEL_HEIGHT = 10;

export function createBarPath(
  barX: number,
  barY: number,
  barWidth: number,
  barHeight: number,
): string {
  const radius = 4;
  return `M ${barX + radius} ${barY} L ${
    barX + barWidth - radius
  } ${barY} A ${radius} ${radius} 0 0 1 ${barX + barWidth} ${barY + radius} L ${
    barX + barWidth
  } ${barY + barHeight} L ${barX} ${barY + barHeight} L ${barX} ${
    barY + radius
  } A ${radius} ${radius} 0 0 1 ${barX + radius} ${barY} Z`;
}

export function createBarLabel(
  parent: SVGGElement,
  barX: number,
  barY: number,
  barWidth: number,
  value: number,
) {
  createSvgTextElement(parent, barX + barWidth / 2, barY - 4, value.toString());
}
