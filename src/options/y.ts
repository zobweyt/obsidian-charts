import { TextOption, ToggleOption } from "obsidian";
import { t } from "../i18n/index.ts";

export const Y_AXIS_MIN_OPTION: TextOption = {
  type: "text",
  displayName: t("min_label"),
  key: "yMin",
  default: "",
  placeholder: t("auto_placeholder"),
};

export const Y_AXIS_SHOW_LINE_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("show_line_label"),
  key: "showYLine",
  default: true,
};

export const Y_AXIS_SHOW_LABELS_OPTION: ToggleOption = {
  type: "toggle",
  displayName: t("show_labels_label"),
  key: "showYLabels",
  default: true,
};
