import { ViewOption } from "obsidian";
import { t } from "../../i18n/index.ts";

export const X_AXIS_OPTION = {
  key: "xAxis",
  type: "property",
  displayName: t("property_label"),
  placeholder: t("property_placeholder_category"),
  default: "file.basename",
} satisfies ViewOption;

export const SHOW_X_LINE_OPTION = {
  key: "showXLine",
  type: "toggle",
  displayName: t("show_line_label"),
  default: false,
} satisfies ViewOption;

export const X_LINE_WIDTH_OPTION = {
  key: "xLineWidth",
  type: "slider",
  displayName: t("line_width_label"),
  min: 0.5,
  max: 3,
  step: 0.5,
  default: 1,
  shouldHide: (config) =>
    !(config.get(SHOW_X_LINE_OPTION.key) ?? SHOW_X_LINE_OPTION.default),
} satisfies ViewOption;

export const X_LINE_STYLE_OPTION = {
  key: "xLineStyle",
  type: "dropdown",
  displayName: t("line_style_label"),
  default: "solid",
  options: {
    "solid": t("solid"),
    "dashed": t("dashed"),
    "dotted": t("dotted"),
  },
  shouldHide: (config) =>
    !(config.get(SHOW_X_LINE_OPTION.key) ?? SHOW_X_LINE_OPTION.default),
} satisfies ViewOption;

export const SHOW_X_LABELS_OPTION = {
  key: "showXLabels",
  type: "toggle",
  displayName: t("show_labels_label"),
  default: true,
} satisfies ViewOption;

export const ROTATE_X_LABELS_OPTION = {
  key: "rotateXLabels",
  type: "slider",
  displayName: t("rotate_labels_label"),
  default: 0,
  min: -90,
  max: 90,
  step: 15,
  shouldHide: (config) =>
    !(config.get(SHOW_X_LABELS_OPTION.key) ?? SHOW_X_LABELS_OPTION.default),
} satisfies ViewOption;

export const Y_MAX_OPTION = {
  key: "yMax",
  type: "text",
  displayName: t("max_label"),
  placeholder: t("auto_placeholder"),
} satisfies ViewOption;

export const Y_MIN_OPTION = {
  key: "yMin",
  type: "text",
  displayName: t("min_label"),
  placeholder: t("auto_placeholder"),
} satisfies ViewOption;

export const SHOW_Y_LINE_OPTION = {
  key: "showYLine",
  type: "toggle",
  displayName: t("show_line_label"),
  default: true,
} satisfies ViewOption;

export const Y_LINE_WIDTH_OPTION = {
  key: "yLineWidth",
  type: "slider",
  displayName: t("line_width_label"),
  min: 0.5,
  max: 3,
  step: 0.5,
  default: 1,
  shouldHide: (config) =>
    !(config.get(SHOW_Y_LINE_OPTION.key) ?? SHOW_Y_LINE_OPTION.default),
} satisfies ViewOption;

export const Y_LINE_STYLE_OPTION = {
  key: "yLineStyle",
  type: "dropdown",
  displayName: t("line_style_label"),
  default: "solid",
  options: {
    "solid": t("solid"),
    "dashed": t("dashed"),
    "dotted": t("dotted"),
  },
  shouldHide: (config) =>
    !(config.get(SHOW_Y_LINE_OPTION.key) ?? SHOW_Y_LINE_OPTION.default),
} satisfies ViewOption;

export const SHOW_Y_LABELS_OPTION = {
  key: "showYLabels",
  type: "toggle",
  displayName: t("show_labels_label"),
  default: true,
} satisfies ViewOption;

export const Y_FORMAT_OPTION = {
  key: "yFormat",
  type: "text",
  displayName: t("y_format_label"),
  placeholder: "{value}",
  shouldHide: (config) =>
    !(config.get(SHOW_Y_LABELS_OPTION.key) ?? SHOW_Y_LABELS_OPTION.default),
} satisfies ViewOption;

export const REFERENCE_LINE_VALUE_OPTION = {
  key: "referenceLineValue",
  type: "text",
  displayName: t("reference_line_value_label"),
  placeholder: "50",
} satisfies ViewOption;

export const REFERENCE_LINE_NAME_OPTION = {
  key: "referenceLineName",
  type: "text",
  displayName: t("reference_line_name_label"),
  placeholder: t("reference_line_name_placeholder"),
  shouldHide: (config) => !config.get(REFERENCE_LINE_VALUE_OPTION.key),
} satisfies ViewOption;

export const REFERENCE_LINE_COLOR_OPTION = {
  key: "referenceLineColor",
  type: "text",
  displayName: t("reference_line_color_label"),
  placeholder: t("auto_placeholder"),
  shouldHide: (config) => !config.get(REFERENCE_LINE_VALUE_OPTION.key),
} satisfies ViewOption;

export const REFERENCE_LINE_STYLE_OPTION = {
  key: "referenceLineStyle",
  type: "dropdown",
  displayName: t("reference_line_style_label"),
  default: "dashed",
  options: {
    "solid": t("solid"),
    "dashed": t("dashed"),
    "dotted": t("dotted"),
  },
  shouldHide: (config) => !config.get(REFERENCE_LINE_VALUE_OPTION.key),
} satisfies ViewOption;

export const REFERENCE_LINE_WIDTH_OPTION = {
  key: "referenceLineWidth",
  type: "slider",
  displayName: t("reference_line_width_label"),
  min: 0.5,
  max: 3,
  step: 0.5,
  default: 1,
  shouldHide: (config) => !config.get(REFERENCE_LINE_VALUE_OPTION.key),
} satisfies ViewOption;

export const X_OPTION = {
  type: "group",
  displayName: t("x_axis_group"),
  items: [
    X_AXIS_OPTION,
    SHOW_X_LINE_OPTION,
    X_LINE_WIDTH_OPTION,
    X_LINE_STYLE_OPTION,
    SHOW_X_LABELS_OPTION,
    ROTATE_X_LABELS_OPTION,
  ],
} satisfies ViewOption;

export const Y_OPTION = {
  type: "group",
  displayName: t("y_axis_group"),
  items: [
    Y_MAX_OPTION,
    Y_MIN_OPTION,
    SHOW_Y_LINE_OPTION,
    Y_LINE_WIDTH_OPTION,
    Y_LINE_STYLE_OPTION,
    SHOW_Y_LABELS_OPTION,
    Y_FORMAT_OPTION,
  ],
} satisfies ViewOption;

export const REFERENCE_LINE_OPTION = {
  type: "group",
  displayName: t("reference_line_group"),
  items: [
    REFERENCE_LINE_VALUE_OPTION,
    REFERENCE_LINE_NAME_OPTION,
    REFERENCE_LINE_COLOR_OPTION,
    REFERENCE_LINE_STYLE_OPTION,
    REFERENCE_LINE_WIDTH_OPTION,
  ],
} satisfies ViewOption;
