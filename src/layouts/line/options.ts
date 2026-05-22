import { ViewOption } from "obsidian";
import { t } from "../../i18n/index.ts";

export const lineSmooth = {
  key: "lineSmooth",
  type: "toggle",
  displayName: t("smooth_curve_label"),
  default: false,
} satisfies ViewOption;

export const lineArea = {
  key: "lineArea",
  type: "toggle",
  displayName: t("show_area_label"),
  default: false,
} satisfies ViewOption;

export const lineWidth = {
  key: "lineWidth",
  type: "slider",
  displayName: t("line_width_label"),
  min: 1,
  max: 10,
  step: 1,
  default: 1,
} satisfies ViewOption;
