import type {
  App,
  BasesQueryResult,
  BasesViewConfig,
  ViewOption,
} from "obsidian";
import { t } from "../../i18n/index.ts";

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
  shouldHide: (c: BasesViewConfig) =>
    (c.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "bar",
} satisfies ViewOption;

export const LINE_SMOOTH_OPTION = {
  key: "lineSmooth",
  type: "dropdown",
  displayName: t("curveLabel"),
  default: "linear",
  options: { "linear": t("curveLinear"), "smooth": t("curveSmooth") },
  shouldHide: (c: BasesViewConfig) =>
    (c.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "line",
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
  shouldHide: (c: BasesViewConfig) =>
    (c.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "line",
} satisfies ViewOption;

export const LINE_WIDTH_OPTION = {
  key: "lineWidth",
  type: "slider",
  displayName: t("lineWidthLabel"),
  min: 1,
  max: 10,
  step: 0.5,
  default: 1,
  shouldHide: (c: BasesViewConfig) =>
    (c.get(TYPE_OPTION.key) || TYPE_OPTION.default) !== "line",
} satisfies ViewOption;

export const SHOW_LABELS_OPTION = {
  key: "showLabels",
  type: "toggle",
  displayName: t("showValuesLabel"),
  default: false,
} satisfies ViewOption;

export const COLOR_OPTION = {
  key: "color",
  type: "text",
  displayName: t("colorLabel"),
  placeholder: t("autoPlaceholder"),
} satisfies ViewOption;

export const STYLE_OPTION = {
  type: "group",
  displayName: t("styleGroup"),
  items: [COLOR_OPTION],
} satisfies ViewOption;

export interface ChartOptions {
  container: HTMLElement;
  data: BasesQueryResult;
  config: BasesViewConfig;
  app: App;
}
