import { PropertyOption, TextOption, ToggleOption } from "obsidian";
import { t } from "../i18n/index.ts";

export const X_AXIS_PROPERTY_OPTION: PropertyOption = {
  type: "property",
  displayName: t("property_label"),
  placeholder: t("property_placeholder_category"),
  key: "xAxis",
  default: "file.name",
};

export const X_AXIS_SHOW_LINES_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("show_line_label"),
  key: "showXLine",
  default: false,
};

export const X_AXIS_SHOW_LABELS_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("show_labels_label"),
  key: "showXLabels",
  default: true,
};

export const X_AXIS_OMIT_ZERO_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("omit_zero_values_label"),
  key: "omitZero",
  default: false,
};

export const Y_AXIS_MAX_OPTION: TextOption = {
  type: "text",
  displayName: t("max_label"),
  key: "yMax",
  default: "",
  placeholder: t("auto_placeholder"),
};
