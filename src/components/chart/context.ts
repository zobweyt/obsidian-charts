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
import { COLORS, INTERACTIVE_ACCENT_COLOR } from "./colors.ts";
import { ChartOptions, COLORS_OPTION, SHOW_LABELS_OPTION } from "./options.ts";

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
  const values = data.properties.map((property: BasesPropertyId) =>
    data.data.map((entry) => {
      const rawValue = entry.getValue(property);
      const parsedNumber = rawValue !== null
        ? Number.parseFloat(String(rawValue))
        : NaN;
      return isNaN(parsedNumber) ? null : parsedNumber;
    })
  );
  const customColor = config.get(COLORS_OPTION.key) as string[] | undefined;
  let colors: string[];
  if (Array.isArray(customColor) && !!customColor.length) {
    colors = propertyNames.map((_, index) =>
      customColor[index % customColor.length]
    );
  } else if (propertyNames.length === 1) {
    colors = [INTERACTIVE_ACCENT_COLOR];
  } else {
    colors = propertyNames.map((_, index) => COLORS[index % COLORS.length]);
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
