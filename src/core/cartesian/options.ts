import { ViewOption } from "obsidian";
import { t } from "../../i18n/index.ts";

export const xAxis = {
  key: "xAxis",
  type: "property",
  displayName: t("property_label"),
  placeholder: t("property_placeholder_category"),
  default: "file.basename",
} satisfies ViewOption;

export const showXLine = {
  key: "showXLine",
  type: "toggle",
  displayName: t("show_line_label"),
  default: false,
} satisfies ViewOption;

export const showXLabels = {
  key: "showXLabels",
  type: "toggle",
  displayName: t("show_labels_label"),
  default: true,
} satisfies ViewOption;

export const rotateXLabels = {
  key: "rotateXLabels",
  type: "slider",
  displayName: t("rotate_labels_label"),
  default: 0,
  min: -90,
  max: 90,
  step: 15,
  shouldHide: (config) => !(config.get(showXLabels.key) ?? showXLabels.default),
} satisfies ViewOption;

export const yMax = {
  key: "yMax",
  type: "text",
  displayName: t("max_label"),
  placeholder: t("auto_placeholder"),
} satisfies ViewOption;

export const yMin = {
  key: "yMin",
  type: "text",
  displayName: t("min_label"),
  placeholder: t("auto_placeholder"),
} satisfies ViewOption;

export const showYLine = {
  key: "showYLine",
  type: "toggle",
  displayName: t("show_line_label"),
  default: true,
} satisfies ViewOption;

export const showYLabels = {
  key: "showYLabels",
  type: "toggle",
  displayName: t("show_labels_label"),
  default: true,
} satisfies ViewOption;

export const referenceLineValue = {
  key: "referenceLineValue",
  type: "text",
  displayName: t("reference_line_value_label"),
  placeholder: "50",
} satisfies ViewOption;

export const referenceLineName = {
  key: "referenceLineName",
  type: "text",
  displayName: t("reference_line_name_label"),
  placeholder: t("reference_line_name_placeholder"),
  shouldHide: (config) => !config.get(referenceLineValue.key),
} satisfies ViewOption;

export const referenceLineColor = {
  key: "referenceLineColor",
  type: "text",
  displayName: t("reference_line_color_label"),
  placeholder: t("auto_placeholder"),
  shouldHide: (config) => !config.get(referenceLineValue.key),
} satisfies ViewOption;

export const referenceLineStyle = {
  key: "referenceLineStyle",
  type: "dropdown",
  displayName: t("reference_line_style_label"),
  default: "dashed",
  options: {
    "solid": t("solid"),
    "dashed": t("dashed"),
    "dotted": t("dotted"),
  },
  shouldHide: (config) => !config.get(referenceLineValue.key),
} satisfies ViewOption;

export const referenceLineWidth = {
  key: "referenceLineWidth",
  type: "slider",
  displayName: t("reference_line_width_label"),
  min: 0.5,
  max: 3,
  step: 0.5,
  default: 1,
  shouldHide: (config) => !config.get(referenceLineValue.key),
} satisfies ViewOption;

export const x = {
  type: "group",
  displayName: t("x_axis_group"),
  items: [
    xAxis,
    showXLine,
    showXLabels,
    rotateXLabels,
  ],
} satisfies ViewOption;

export const y = {
  type: "group",
  displayName: t("y_axis_group"),
  items: [
    yMax,
    yMin,
    showYLine,
    showYLabels,
  ],
} satisfies ViewOption;

export const referenceLine = {
  type: "group",
  displayName: t("reference_line_group"),
  items: [
    referenceLineValue,
    referenceLineName,
    referenceLineColor,
    referenceLineStyle,
    referenceLineWidth,
  ],
} satisfies ViewOption;
