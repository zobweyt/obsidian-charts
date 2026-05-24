import { ViewOption } from "obsidian";
import { t } from "../../i18n/index.ts";

export const PIE_HOLE_RADIUS_OPTION = {
  key: "pieHoleRadius",
  type: "slider",
  displayName: t("pie_hole_radius_label"),
  min: 0,
  max: 90,
  step: 5,
  default: 10,
} satisfies ViewOption;
