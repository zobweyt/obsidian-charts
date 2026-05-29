import {
  App,
  BasesPropertyId,
  BasesQueryResult,
  BasesViewConfig,
} from "obsidian";
import {
  LEGEND_POSITION_OPTION,
  SHOW_LEGEND_OPTION,
} from "../legend/options.ts";
import { t } from "../../lib/i18n/t.ts";
import { COLORS, INTERACTIVE_ACCENT_COLOR } from "./colors.ts";
import { X_AXIS_OPTION } from "../axis/options.ts";
import {
  AGGREGATION_OPTION,
  ChartOptions,
  COLORS_OPTION,
  SERIES_BY_OPTION,
  SHOW_LABELS_OPTION,
} from "./options.ts";

const DEFAULT_FONT_SIZE = 13;
const PADDING = 24;

export interface ChartContext {
  container: HTMLElement;
  wrapper: HTMLElement;
  svg: SVGSVGElement;
  data: BasesQueryResult;
  config: BasesViewConfig;
  app: App;
  values: (number | null)[][];
  xLabels: string[];
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
  showLabels: boolean;
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
  const rawXLabels = data.data.map((entry) =>
    entry.getValue(xProperty)?.toString() ?? entry.file.name
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
  const { values, xLabels, groupFilePaths, seriesNames } = aggregation === "sum"
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
  const [legendSide, legendAlign] =
    (config.get(LEGEND_POSITION_OPTION.key) as string || "bottom-center")
      .split("-");
  const wrapper = createDiv({
    cls: `bases-chart-wrapper bases-chart-legend-${legendSide}`,
  });
  options.container.appendChild(wrapper);
  const svg = createSvg("svg", { cls: "bases-chart-svg" });
  wrapper.appendChild(svg);
  const fontSize = parseFloat(getComputedStyle(wrapper).fontSize) ||
    DEFAULT_FONT_SIZE;
  return {
    container: options.container,
    wrapper,
    svg,
    data: options.data,
    config: options.config,
    app: options.app,
    values,
    xLabels,
    groupFilePaths,
    seriesNames,
    colors,
    fontSize,
    width: 0,
    height: 0,
    padding: { top: PADDING, bottom: PADDING, left: PADDING, right: PADDING },
    areaBottom: 0,
    plotHeight: 0,
    baseline: 0,
    minValue: 0,
    valueRange: 1,
    groupWidth: 0,
    groupCount: 0,
    showLegend,
    showLabels,
    legendSide,
    legendAlign: legendAlign || "center",
  };
}

function parseNumericValue(rawValue: unknown): number | null {
  if (rawValue === null || rawValue === undefined) return null;
  if (typeof rawValue === "number") {
    return Number.isFinite(rawValue) ? rawValue : null;
  }
  const normalized = String(rawValue).replace(/[^0-9.-]/g, "");
  if (!normalized) return null;
  const parsedNumber = Number.parseFloat(normalized);
  return Number.isFinite(parsedNumber) ? parsedNumber : null;
}

function aggregateValuesByLabel(
  rawValues: (number | null)[][],
  rawXLabels: string[],
  propertyNames: string[],
  data: BasesQueryResult,
): {
  values: (number | null)[][];
  xLabels: string[];
  groupFilePaths: string[][];
  seriesNames: string[];
} {
  const labelToIndex = new Map<string, number>();
  const xLabels: string[] = [];
  const groupFilePaths: string[][] = [];
  const values = rawValues.map(() => [] as (number | null)[]);
  const hasValue = rawValues.map(() => [] as boolean[]);

  rawXLabels.forEach((label, rowIndex) => {
    let groupIndex = labelToIndex.get(label);
    if (groupIndex === undefined) {
      groupIndex = xLabels.length;
      labelToIndex.set(label, groupIndex);
      xLabels.push(label);
      groupFilePaths.push([]);
      values.forEach((series, seriesIndex) => {
        series[groupIndex!] = 0;
        hasValue[seriesIndex][groupIndex!] = false;
      });
    }

    groupFilePaths[groupIndex].push(data.data[rowIndex].file.path);
    rawValues.forEach((series, seriesIndex) => {
      const value = series[rowIndex];
      if (value === null) return;
      values[seriesIndex][groupIndex!] =
        (values[seriesIndex][groupIndex!] ?? 0) + value;
      hasValue[seriesIndex][groupIndex!] = true;
    });
  });

  values.forEach((series, seriesIndex) => {
    series.forEach((_value, groupIndex) => {
      if (!hasValue[seriesIndex][groupIndex]) series[groupIndex] = null;
    });
  });

  return { values, xLabels, groupFilePaths, seriesNames: propertyNames };
}

function aggregateValuesByLabelAndSeries(
  rawValues: (number | null)[][],
  rawXLabels: string[],
  rawSeriesLabels: string[],
  propertyNames: string[],
  data: BasesQueryResult,
): {
  values: (number | null)[][];
  xLabels: string[];
  groupFilePaths: string[][];
  seriesNames: string[];
} {
  const labelToIndex = new Map<string, number>();
  const seriesToIndex = new Map<string, number>();
  const xLabels: string[] = [];
  const seriesNames: string[] = [];
  const groupFilePaths: string[][] = [];
  const values: (number | null)[][] = [];
  const hasValue: boolean[][] = [];

  const ensureXIndex = (label: string): number => {
    let groupIndex = labelToIndex.get(label);
    if (groupIndex !== undefined) return groupIndex;
    groupIndex = xLabels.length;
    labelToIndex.set(label, groupIndex);
    xLabels.push(label);
    groupFilePaths.push([]);
    values.forEach((series, seriesIndex) => {
      series[groupIndex!] = 0;
      hasValue[seriesIndex][groupIndex!] = false;
    });
    return groupIndex;
  };

  const ensureSeriesIndex = (name: string): number => {
    let seriesIndex = seriesToIndex.get(name);
    if (seriesIndex !== undefined) return seriesIndex;
    seriesIndex = seriesNames.length;
    seriesToIndex.set(name, seriesIndex);
    seriesNames.push(name);
    values.push(xLabels.map(() => 0));
    hasValue.push(xLabels.map(() => false));
    return seriesIndex;
  };

  rawXLabels.forEach((label, rowIndex) => {
    const groupIndex = ensureXIndex(label);
    groupFilePaths[groupIndex].push(data.data[rowIndex].file.path);
    rawValues.forEach((series, propertyIndex) => {
      const value = series[rowIndex];
      if (value === null) return;
      const seriesLabel = rawSeriesLabels[rowIndex];
      const seriesName = rawValues.length === 1
        ? seriesLabel
        : `${seriesLabel} / ${propertyNames[propertyIndex]}`;
      const seriesIndex = ensureSeriesIndex(seriesName);
      values[seriesIndex][groupIndex] = (values[seriesIndex][groupIndex] ?? 0) +
        value;
      hasValue[seriesIndex][groupIndex] = true;
    });
  });

  values.forEach((series, seriesIndex) => {
    xLabels.forEach((_label, groupIndex) => {
      if (!hasValue[seriesIndex][groupIndex]) series[groupIndex] = null;
    });
  });

  return { values, xLabels, groupFilePaths, seriesNames };
}
