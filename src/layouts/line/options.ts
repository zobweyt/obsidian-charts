import { ViewOption } from "obsidian";
import { t } from "../../i18n/index.ts";

export const LINE_SMOOTH_OPTION = {
  key: "lineSmooth",
  type: "toggle",
  displayName: t("smooth_curve_label"),
  default: false,
} satisfies ViewOption;

export const LINE_AREA_OPTION = {
  key: "lineArea",
  type: "toggle",
  displayName: t("show_area_label"),
  default: false,
} satisfies ViewOption;

export const LINE_WIDTH_OPTION = {
  key: "lineWidth",
  type: "slider",
  displayName: t("line_width_label"),
  min: 1,
  max: 10,
  step: 0.5,
  default: 1,
} satisfies ViewOption;
