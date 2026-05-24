import { ViewOption } from "obsidian";
import { t } from "../../i18n/index.ts";

export const COLOR_OPTION = {
  key: "color",
  type: "text",
  displayName: t("color_label"),
  placeholder: t("auto_placeholder"),
} satisfies ViewOption;

export const SHOW_LEGEND_OPTION = {
  key: "showLegend",
  type: "toggle",
  displayName: t("show_leged"),
  default: false,
} satisfies ViewOption;

export const SHOW_LABELS_OPTION = {
  key: "showLabels",
  type: "toggle",
  displayName: t("show_labels_label"),
  default: false,
} satisfies ViewOption;

const legendPositionOptions: Record<string, string> = {
  "top-start": t("legend_position_top_start"),
  "top-center": t("legend_position_top_center"),
  "top-end": t("legend_position_top_end"),
  "right-start": t("legend_position_right_start"),
  "right-center": t("legend_position_right_center"),
  "right-end": t("legend_position_right_end"),
  "bottom-start": t("legend_position_bottom_start"),
  "bottom-center": t("legend_position_bottom_center"),
  "bottom-end": t("legend_position_bottom_end"),
  "left-start": t("legend_position_left_start"),
  "left-center": t("legend_position_left_center"),
  "left-end": t("legend_position_left_end"),
};

export const LEGEND_POSITION_OPTION = {
  key: "legendPosition",
  type: "dropdown",
  displayName: t("legend_position_label"),
  default: "bottom-center",
  options: legendPositionOptions,
  shouldHide: (config) =>
    !(config.get(SHOW_LEGEND_OPTION.key) ?? SHOW_LEGEND_OPTION.default),
} satisfies ViewOption;

export const STYLE_OPTION = {
  type: "group",
  displayName: t("style_group"),
  items: [
    COLOR_OPTION,
    SHOW_LEGEND_OPTION,
    LEGEND_POSITION_OPTION,
    SHOW_LABELS_OPTION,
  ],
} satisfies ViewOption;
