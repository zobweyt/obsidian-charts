import { t } from "../../lib/i18n/index.ts";
import { ViewOption } from "obsidian";

export const SHOW_LEGEND_OPTION = {
  key: "showLegend",
  type: "toggle",
  displayName: t("showLegend"),
  default: false,
} satisfies ViewOption;

export const LEGEND_POSITION_OPTION = {
  key: "legendPosition",
  type: "dropdown",
  displayName: t("legendPositionLabel"),
  default: "bottom-center",
  options: {
    "top-start": t("legendPositionTopStart"),
    "top-center": t("legendPositionTopCenter"),
    "top-end": t("legendPositionTopEnd"),
    "right-start": t("legendPositionRightStart"),
    "right-center": t("legendPositionRightCenter"),
    "right-end": t("legendPositionRightEnd"),
    "bottom-start": t("legendPositionBottomStart"),
    "bottom-center": t("legendPositionBottomCenter"),
    "bottom-end": t("legendPositionBottomEnd"),
    "left-start": t("legendPositionLeftStart"),
    "left-center": t("legendPositionLeftCenter"),
    "left-end": t("legendPositionLeftEnd"),
  },
  shouldHide: (config) =>
    !(config.get(SHOW_LEGEND_OPTION.key) || SHOW_LEGEND_OPTION.default),
} satisfies ViewOption;

export const LEGEND_OPTION = {
  type: "group",
  displayName: t("legendGroup"),
  items: [SHOW_LEGEND_OPTION, LEGEND_POSITION_OPTION],
} satisfies ViewOption;
