import { SliderOption, TextOption, ToggleOption } from "obsidian";
import { t } from "../i18n/index.ts";

export const STYLE_COLOR_OPTION: TextOption = {
  type: "text",
  displayName: t("color_label"),
  key: "color",
  placeholder: "var(--interactive-accent)",
};

export const STYLE_SHOW_LEGEND_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("show_leged"),
  key: "showLegend",
  default: false,
};

export const STYLE_SHOW_LABELS_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("show_labels_label"),
  key: "showLabels",
  default: false,
};

export const BAR_WIDTH_OPTION: SliderOption = {
  type: "slider",
  displayName: t("bar_width_label"),
  min: 5,
  max: 95,
  step: 1,
  key: "barWidth",
  default: 15,
};

export const LINE_SMOOTH_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("smooth_curve_label"),
  key: "lineSmooth",
  default: false,
};

export const LINE_AREA_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("show_area_label"),
  key: "lineArea",
  default: false,
};

export const LINE_WIDTH_OPTION: SliderOption = {
  type: "slider",
  displayName: t("line_width_label"),
  min: 1,
  max: 10,
  step: 1,
  key: "lineWidth",
  default: 1,
};

export const PIE_DONUT_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("pie_donut"),
  key: "pieDonut",
  default: false,
};
