import { App, BasesQueryResult, BasesViewConfig, ViewOption } from "obsidian";
import { t } from "../../lib/i18n/index.ts";

export const TYPE_OPTION = {
  key: "chartType",
  type: "dropdown",
  displayName: t("chartTypeLabel"),
  default: "bar",
  options: { "bar": t("chartTypeBar"), "line": t("chartTypeLine") },
} satisfies ViewOption;

export const BAR_WIDTH_OPTION = {
  key: "barWidth",
  type: "slider",
  displayName: t("barWidthLabel"),
  min: 5,
  max: 95,
  step: 1,
  default: 50,
  shouldHide: (config) =>
    (config.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "bar",
} satisfies ViewOption;

export const LINE_SMOOTH_OPTION = {
  key: "lineSmooth",
  type: "dropdown",
  displayName: t("curveLabel"),
  default: "linear",
  options: {
    "linear": t("curveLinear"),
    "bump": t("curveBump"),
    "natural": t("curveNatural"),
    "monotone": t("curveMonotone"),
    "step": t("curveStep"),
    "stepbefore": t("curveStepBefore"),
    "stepafter": t("curveStepAfter"),
  },
  shouldHide: (config) =>
    (config.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "line",
} satisfies ViewOption;

export const LINE_AREA_OPTION = {
  key: "lineArea",
  type: "dropdown",
  displayName: t("areaLabel"),
  default: "none",
  options: {
    "none": t("areaNone"),
    "fill": t("areaFill"),
    "gradient": t("areaGradient"),
  },
  shouldHide: (config) =>
    (config.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "line",
} satisfies ViewOption;

export const LINE_WIDTH_OPTION = {
  key: "lineWidth",
  type: "slider",
  displayName: t("lineWidthLabel"),
  min: 0.5,
  max: 3,
  step: 0.25,
  default: 1,
  shouldHide: (config) =>
    (config.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "line",
} satisfies ViewOption;

export const SHOW_POINTS_OPTION = {
  key: "showPoints",
  type: "toggle",
  displayName: t("showPointsLabel"),
  default: false,
  shouldHide: (config) =>
    (config.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "line",
} satisfies ViewOption;

export const CONNECT_ZEROS_OPTION = {
  key: "connectZeros",
  type: "toggle",
  displayName: t("connectZerosLabel"),
  default: false,
  shouldHide: (config) =>
    (config.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "line",
} satisfies ViewOption;

export const SHOW_LABELS_OPTION = {
  key: "showLabels",
  type: "toggle",
  displayName: t("showValuesLabel"),
  default: false,
} satisfies ViewOption;

export const AGGREGATION_OPTION = {
  key: "aggregation",
  type: "dropdown",
  displayName: t("aggregationLabel"),
  default: "none",
  options: { "none": t("aggregationNone"), "sum": t("aggregationSum") },
} satisfies ViewOption;

export const SERIES_BY_OPTION = {
  key: "seriesBy",
  type: "property",
  displayName: t("seriesByLabel"),
  placeholder: t("seriesByPlaceholder"),
  shouldHide: (config) =>
    (config.get(AGGREGATION_OPTION.key) || AGGREGATION_OPTION.default) !==
      "sum",
} satisfies ViewOption;

export const COLORS_OPTION = {
  key: "colors",
  type: "multitext",
  displayName: t("colorsLabel"),
} satisfies ViewOption;

export const STYLE_OPTION = {
  type: "group",
  displayName: t("styleGroup"),
  items: [COLORS_OPTION],
} satisfies ViewOption;

export interface ChartOptions {
  app: App;
  data: BasesQueryResult;
  config: BasesViewConfig;
  container: HTMLElement;
}
