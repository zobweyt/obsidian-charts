import { AxisContext } from "../axis/context.ts";

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
  if (valueRange === 0 || chartHeight <= 0) return chartBottom;
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
  let maxWidth = showYAxis && yLabels.length > 0
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
  if (rotation === 0 || xLabels.length === 0) {
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
  const maxV = ay.yMax ?? computeDataMax(chart.values) ?? 100;
  const minV = ay.yMin ?? 0;
  ay.labels = computeNiceLabels(maxV, minV);
  ax.labels = chart.xLabels;
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
  if (ay.yMax != null) {
    const dataMax = computeDataMax(chart.values) ?? maxV;
    const headroomFrac = Math.max(0, (maxV - dataMax) / maxV);
    const factor = Math.max(0, 1 - headroomFrac * 2);
    const basePad = chart.showLabels
      ? Math.round(chart.fontSize * 1.2)
      : Math.round(chart.fontSize * 0.5);
    chart.padding.top = Math.round(basePad * factor);
  } else {
    chart.padding.top = chart.showLabels
      ? Math.round(chart.fontSize * 1.2) + 8
      : Math.round(chart.fontSize * 0.5);
  }
  const cssPad = parseFloat(
    getComputedStyle(chart.wrapper).getPropertyValue("--size-4-2"),
  ) || 8;
  chart.padding.left += cssPad;
  chart.padding.top += cssPad;
  chart.padding.bottom += cssPad;
  chart.padding.right = 8;
  chart.plotHeight = Math.max(
    0,
    chart.areaBottom - chart.padding.top - chart.padding.bottom,
  );
  chart.baseline = Math.max(0, chart.areaBottom - chart.padding.bottom);
  chart.groupWidth = Math.max(
    0,
    (chart.width - chart.padding.left - chart.padding.right) / chart.groupCount,
  );
  if (chart.xScale === "numeric" && !chart.xCellsExpanded) {
    const valid = chart.xValuesRaw.filter((v): v is number => v !== null);
    if (valid.length > 0) {
      const xMin = Math.min(...valid);
      const xMax = Math.max(...valid);
      const xRange = xMax - xMin || 1;
      const plotWidth = chart.width - chart.padding.left - chart.padding.right;
      chart.xPositions = chart.xValuesRaw.map((v) =>
        v !== null
          ? chart.padding.left + ((v - xMin) / xRange) * plotWidth
          : chart.padding.left
      );
    } else {
      chart.xPositions = chart.xLabels.map((_, i) =>
        chart.padding.left + chart.groupWidth * (i + 0.5)
      );
    }
  } else {
    chart.xPositions = chart.xLabels.map((_, i) =>
      chart.padding.left + chart.groupWidth * (i + 0.5)
    );
  }
}
