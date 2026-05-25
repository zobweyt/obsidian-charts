import type { BasesPropertyId } from "obsidian";
import type { AxisContext } from "../axis/context.ts";
import { X_AXIS_OPTION } from "../axis/options.ts";

const EPSILON = 1e-10;
const FONT_WIDTH_FACTOR = 0.6;
const CHAR_WIDTH = 3.5;
const LABEL_PADDING = 16;
const ROTATED_PADDING = 12;
const MIN_LABEL_PADDING = 4;
const LINE_HEIGHT_FACTOR = 0.75;

export function computeNiceStep(rawValue: number): number {
  if (rawValue <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawValue)));
  const normalized = rawValue / magnitude;
  const nice = normalized <= 1.5
    ? 1
    : normalized <= 3.5
    ? 2
    : normalized <= 7.5
    ? 5
    : 10;
  return nice * magnitude;
}

export function computeNiceLabels(
  maxValue: number,
  minimumValue: number,
): number[] {
  const range = maxValue - minimumValue || 1;
  const rawStep = range / 4;
  const step = computeNiceStep(rawStep);
  const decimals = Math.max(0, Math.ceil(-Math.log10(step)));
  const labels: number[] = [];
  for (let current = 0; current <= maxValue + EPSILON; current += step) {
    labels.push(parseFloat(current.toFixed(decimals)));
  }
  if (labels[labels.length - 1] !== maxValue) {
    labels.push(maxValue);
  }
  return labels;
}

export function computeDataMax(
  values: (number | null)[][],
): number | undefined {
  let result: number | undefined;
  for (const series of values) {
    for (const value of series) {
      if (value !== null && (result === undefined || value > result)) {
        result = value;
      }
    }
  }
  return result;
}

export function computeYPosition(
  chartBottom: number,
  value: number,
  minimumValue: number,
  valueRange: number,
  chartHeight: number,
): number {
  return chartBottom - ((value - minimumValue) / valueRange) * chartHeight;
}

export function computeRotatedTextHeight(
  text: string,
  fontSize: number,
  angleInDegrees: number,
): number {
  const textWidth = text.length * fontSize * FONT_WIDTH_FACTOR;
  const radians = Math.abs(angleInDegrees) * Math.PI / 180;
  return textWidth * Math.sin(radians) + fontSize * Math.cos(radians);
}

export function computeRotatedTextHalfWidth(
  text: string,
  angleInDegrees: number,
): number {
  if (angleInDegrees === 0) return text.length * CHAR_WIDTH;
  const radians = Math.abs(angleInDegrees) * Math.PI / 180;
  return text.length * CHAR_WIDTH * Math.cos(radians) +
    ROTATED_PADDING * Math.sin(radians);
}

export function computeYLabelPadding(
  yLabels: number[],
  showYAxis: boolean,
  fontSize: number,
  referenceValue?: string,
): number {
  if (!showYAxis && !referenceValue) return LABEL_PADDING;
  let maxWidth = showYAxis
    ? Math.max(...yLabels.map((label) => label.toString().length)) * fontSize *
      FONT_WIDTH_FACTOR
    : 0;
  if (referenceValue) {
    maxWidth = Math.max(
      maxWidth,
      Number(referenceValue).toString().length * fontSize * FONT_WIDTH_FACTOR,
    );
  }
  return Math.max(maxWidth + LABEL_PADDING, LABEL_PADDING);
}

export function computeXLabelPadding(
  xLabels: string[],
  showXAxis: boolean,
  rotation: number,
  fontSize: number,
): number {
  if (!showXAxis) return MIN_LABEL_PADDING;
  if (rotation === 0) {
    return Math.round(fontSize * LINE_HEIGHT_FACTOR) + ROTATED_PADDING;
  }
  return Math.max(
    ...xLabels.map((label) =>
      computeRotatedTextHeight(label, fontSize, rotation)
    ),
  ) + ROTATED_PADDING;
}

export function computeLayout(ax: AxisContext, ay: AxisContext) {
  const chart = ay.chart;
  const maxV = Math.max(ay.yMax ?? computeDataMax(chart.values) ?? 100, 1);
  const minV = ay.yMin ?? 0;
  ay.labels = computeNiceLabels(maxV, minV);
  const xProperty = (chart.config.get(X_AXIS_OPTION.key) ||
    X_AXIS_OPTION.default) as BasesPropertyId;
  ax.labels = chart.data.data.map((entry) =>
    entry.getValue(xProperty)?.toString() ?? entry.file.name
  );
  chart.minValue = minV;
  chart.valueRange = maxV - minV || 1;
  chart.groupCount = Math.max(ax.labels.length, 1);
  chart.padding.left = computeYLabelPadding(
    ay.labels as number[],
    ay.showLabels,
    chart.fontSize,
    ay.referenceValue,
  );
  chart.padding.bottom = computeXLabelPadding(
    ax.labels as string[],
    ax.showLabels,
    ax.rotateLabels,
    chart.fontSize,
  );
  chart.plotHeight = Math.max(
    0,
    chart.areaBottom - chart.padding.top - chart.padding.bottom,
  );
  chart.baseline = chart.areaBottom - chart.padding.bottom;
  chart.groupWidth = Math.max(
    0,
    (chart.width - chart.padding.left - chart.padding.right) / chart.groupCount,
  );
}
