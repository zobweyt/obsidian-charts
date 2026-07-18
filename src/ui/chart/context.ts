import {
  App,
  BasesPropertyId,
  BasesQueryResult,
  BasesViewConfig,
  DateValue,
  NumberValue,
} from "obsidian";
import {
  LEGEND_POSITION_OPTION,
  SHOW_LEGEND_OPTION,
} from "../legend/options.ts";
import { t } from "../../lib/i18n/index.ts";
import { COLORS, INTERACTIVE_ACCENT_COLOR } from "./colors.ts";
import { X_AXIS_OPTION, X_AXIS_SCALE_OPTION } from "../axis/options.ts";
import {
  AGGREGATION_OPTION,
  ChartOptions,
  COLORS_OPTION,
  CONNECT_ZEROS_OPTION,
  SERIES_BY_OPTION,
  SHOW_LABELS_OPTION,
  SHOW_POINTS_OPTION,
} from "./options.ts";
import {
  aggregateValuesByLabel,
  aggregateValuesByLabelAndSeries,
  parseNumericValue,
} from "./aggregate.ts";

declare const moment: {
  (value: number | string | Date): {
    format(template: string): string;
    isValid(): boolean;
    valueOf(): number;
  };
};

function formatDateLabel(value: number, showTime: boolean): string {
  const m = moment(value);
  if (!m.isValid()) return "";
  const formatted = showTime ? m.format("MMM D HH:mm") : m.format("MMM D");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

const HOUR = 3600000;
const DAY = 86400000;
const NICE_STEPS = [
  HOUR,
  2 * HOUR,
  3 * HOUR,
  6 * HOUR,
  12 * HOUR,
  DAY,
  2 * DAY,
  7 * DAY,
  30 * DAY,
  90 * DAY,
  365 * DAY,
];

function roundToNiceTimeStep(ms: number): number {
  for (const s of NICE_STEPS) {
    if (ms <= s) return s;
  }
  return NICE_STEPS[NICE_STEPS.length - 1];
}

export interface ChartContext {
  container: HTMLElement;
  wrapper: HTMLElement;
  svg: SVGSVGElement;
  data: BasesQueryResult;
  config: BasesViewConfig;
  app: App;
  values: (number | null)[][];
  xLabels: string[];
  xScale: "category" | "numeric";
  xValuesRaw: (number | null)[];
  xPositions: number[];
  groupFilePaths: string[][];
  seriesNames: string[];
  colors: string[];
  fontSize: number;
  width: number;
  height: number;
  padding: { top: number; bottom: number; left: number; right: number };
  areaBottom: number;
  plotHeight: number;
  baseline: number;
  minValue: number;
  valueRange: number;
  groupWidth: number;
  groupCount: number;
  showLegend: boolean;
  xCellsExpanded: boolean;
  showLabels: boolean;
  showPoints: boolean;
  connectZeros: boolean;
  legendSide: string;
  legendAlign: string;
}

export function createChartContext(options: ChartOptions): ChartContext {
  const data = options.data;
  const config = options.config;
  const propertyNames = data.properties.map(
    (property: BasesPropertyId) => config.getDisplayName(property),
  );
  const xProperty = (config.get(X_AXIS_OPTION.key) ||
    X_AXIS_OPTION.default) as BasesPropertyId;
  const xEntries = data.data.map((entry) => {
    const value = entry.getValue(xProperty);
    const rawValue = value instanceof NumberValue
      ? parseFloat(value.toString())
      : value instanceof DateValue
      ? moment(value.toString()).valueOf()
      : null;
    if (
      value !== null && !(value instanceof NumberValue) &&
      !(value instanceof DateValue)
    ) {
      return { label: value.toString(), rawValue, hasStringXValue: true };
    }
    return {
      label: value?.toString() ?? entry.file.name,
      rawValue,
      hasStringXValue: false,
    };
  });
  const hasStringXValue = xEntries.some((e) => e.hasStringXValue);
  const rawXLabels = xEntries.map((e) => e.label);
  const rawXValues = xEntries.map((e) =>
    e.rawValue !== null && isNaN(e.rawValue) ? null : e.rawValue
  );
  const rawValues = data.properties.map((property: BasesPropertyId) =>
    data.data.map((entry) => {
      const rawValue = entry.getValue(property);
      const parsedNumber = parseNumericValue(rawValue);
      return parsedNumber === null ? null : parsedNumber;
    })
  );
  const aggregation = (config.get(AGGREGATION_OPTION.key) ||
    AGGREGATION_OPTION.default) as string;
  const seriesByProperty = config.get(SERIES_BY_OPTION.key) as
    | BasesPropertyId
    | undefined;
  const rawSeriesLabels = seriesByProperty
    ? data.data.map((entry) =>
      entry.getValue(seriesByProperty)?.toString() || t("noSeriesValue")
    )
    : [];
  let { values, xLabels, groupFilePaths, seriesNames } = aggregation === "sum"
    ? seriesByProperty
      ? aggregateValuesByLabelAndSeries(
        rawValues,
        rawXLabels,
        rawSeriesLabels,
        propertyNames,
        data,
      )
      : aggregateValuesByLabel(rawValues, rawXLabels, propertyNames, data)
    : {
      values: rawValues,
      xLabels: rawXLabels,
      groupFilePaths: data.data.map((entry) => [entry.file.path]),
      seriesNames: propertyNames,
    };
  const xValueMap = new Map<string, number>();
  rawXLabels.forEach((label, i) => {
    if (rawXValues[i] !== null && !xValueMap.has(label)) {
      xValueMap.set(label, rawXValues[i]!);
    }
  });
  let resolvedXValues = xLabels.map((label) => xValueMap.get(label) ?? null);
  const allValidValues = resolvedXValues.filter((v): v is number => v !== null);
  const isTimestamp = allValidValues.length > 0 &&
    Math.abs(allValidValues[0]) > 1e11;
  const showTime = isTimestamp &&
    allValidValues.some((v) => v % 86400000 !== 0);
  if (isTimestamp) {
    xLabels = xLabels.map((_, i) =>
      resolvedXValues[i] !== null
        ? formatDateLabel(resolvedXValues[i]!, showTime)
        : ""
    );
  }
  const xAxisScaleMode = (config.get(X_AXIS_SCALE_OPTION.key) ||
    X_AXIS_SCALE_OPTION.default) as string;
  const xScale: "category" | "numeric" = xAxisScaleMode === "category"
    ? "category"
    : xAxisScaleMode === "numeric"
    ? "numeric"
    : !hasStringXValue && resolvedXValues.some((v) => v !== null)
    ? "numeric"
    : "category";
  let xCellsExpanded = false;
  if (xScale === "numeric") {
    const indices = resolvedXValues
      .map((v, i) => ({ v, i }))
      .sort((a, b) => {
        if (a.v === null && b.v === null) return 0;
        if (a.v === null) return 1;
        if (b.v === null) return -1;
        return a.v - b.v;
      })
      .map((item) => item.i);
    xLabels = indices.map((i) => xLabels[i]);
    resolvedXValues = indices.map((i) => resolvedXValues[i]);
    groupFilePaths = indices.map((i) => groupFilePaths[i]);
    values = values.map((series) => indices.map((i) => series[i]));
    const validValues = resolvedXValues.filter((v): v is number => v !== null);
    if (validValues.length >= 2) {
      const diffs: number[] = [];
      for (let i = 1; i < validValues.length; i++) {
        diffs.push(validValues[i] - validValues[i - 1]);
      }
      let step = diffs[0];
      for (let i = 1; i < diffs.length; i++) {
        let a = step;
        let b = diffs[i];
        while (b) {
          const t = b;
          b = a % b;
          a = t;
        }
        step = a;
      }
      if (step > 0) {
        const xMin = validValues[0];
        const xMax = validValues[validValues.length - 1];
        let cellCount = Math.round((xMax - xMin) / step) + 1;
        if (isTimestamp && cellCount > 100) {
          step = roundToNiceTimeStep((xMax - xMin) / 59);
          cellCount = Math.round((xMax - xMin) / step) + 1;
        }
        if (cellCount <= 100) {
          const newXLabels: string[] = [];
          const newXValues: (number | null)[] = [];
          const newFilePaths: string[][] = [];
          const newValues = values.map(() => [] as (number | null)[]);
          const dataMap = new Map(resolvedXValues.map((v, i) => [v, i]));
          for (let cell = 0; cell < cellCount; cell++) {
            const cellValue = xMin + cell * step;
            const rounded = validValues.every((v) =>
                Number.isInteger(v) || Math.abs(v - Math.round(v)) < 0.0001
              )
              ? Math.round(cellValue)
              : cellValue;
            const dataIndex = dataMap.get(rounded) ?? dataMap.get(cellValue) ??
              -1;
            const label = dataIndex >= 0
              ? isTimestamp
                ? formatDateLabel(cellValue, showTime)
                : xLabels[dataIndex]
              : "";
            newXLabels.push(label);
            if (dataIndex >= 0) {
              newXValues.push(cellValue);
              newFilePaths.push(groupFilePaths[dataIndex]);
              values.forEach((series, si) => {
                newValues[si].push(series[dataIndex]);
              });
            } else {
              newXValues.push(null);
              newFilePaths.push([]);
              values.forEach((_, si) => {
                newValues[si].push(null);
              });
            }
          }
          xLabels = newXLabels;
          resolvedXValues = newXValues;
          groupFilePaths = newFilePaths;
          values = newValues;
          xCellsExpanded = true;
        }
      }
    }
  }
  const customColor = config.get(COLORS_OPTION.key) as string[] | undefined;
  let colors: string[];
  if (Array.isArray(customColor) && !!customColor.length) {
    colors = seriesNames.map((_, index) =>
      customColor[index % customColor.length]
    );
  } else if (seriesNames.length === 1) {
    colors = [INTERACTIVE_ACCENT_COLOR];
  } else {
    colors = seriesNames.map((_, index) => COLORS[index % COLORS.length]);
  }
  const showLegend = (config.get(SHOW_LEGEND_OPTION.key) ??
    SHOW_LEGEND_OPTION.default) as boolean;
  const showLabels = (config.get(SHOW_LABELS_OPTION.key) ??
    SHOW_LABELS_OPTION.default) as boolean;
  const showPoints = (config.get(SHOW_POINTS_OPTION.key) ??
    SHOW_POINTS_OPTION.default) as boolean;
  const connectZeros = (config.get(CONNECT_ZEROS_OPTION.key) ??
    CONNECT_ZEROS_OPTION.default) as boolean;
  const [legendSide, legendAlign] =
    (config.get(LEGEND_POSITION_OPTION.key) as string || "bottom-center")
      .split("-");
  const wrapper = createDiv({
    cls: `bases-chart-wrapper bases-chart-legend-${legendSide}`,
  });
  options.container.appendChild(wrapper);
  const svg = createSvg("svg", { cls: "bases-chart-svg" });
  wrapper.appendChild(svg);
  const fontSize = parseFloat(getComputedStyle(wrapper).fontSize);
  return {
    container: options.container,
    wrapper,
    svg,
    data: options.data,
    config: options.config,
    app: options.app,
    values,
    xLabels,
    xScale,
    xValuesRaw: resolvedXValues,
    xPositions: [],
    xCellsExpanded,
    groupFilePaths,
    seriesNames,
    colors,
    fontSize,
    width: 0,
    height: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    areaBottom: 0,
    plotHeight: 0,
    baseline: 0,
    minValue: 0,
    valueRange: 1,
    groupWidth: 0,
    groupCount: 0,
    showLegend,
    showLabels,
    showPoints,
    connectZeros,
    legendSide,
    legendAlign: legendAlign || "center",
  };
}
