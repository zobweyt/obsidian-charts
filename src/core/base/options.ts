import { ViewOption } from "obsidian";
import { t } from "../../i18n/index.ts";

export const color = {
  key: "color",
  type: "text",
  displayName: t("color_label"),
  placeholder: t("auto_placeholder"),
} satisfies ViewOption;

export const animation = {
  key: "animation",
  type: "toggle",
  displayName: t("animation"),
  default: false,
} satisfies ViewOption;

export const showLegend = {
  key: "showLegend",
  type: "toggle",
  displayName: t("show_leged"),
  default: false,
} satisfies ViewOption;

export const showLabels = {
  key: "showLabels",
  type: "toggle",
  displayName: t("show_labels_label"),
  default: false,
} satisfies ViewOption;

export const style = {
  type: "group",
  displayName: t("style_group"),
  items: [
    color,
    animation,
    showLegend,
    showLabels,
  ],
} satisfies ViewOption;
