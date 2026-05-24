import { ViewOption } from "obsidian";
import { t } from "../../i18n/index.ts";

export const BAR_WIDTH_OPTION = {
  key: "barWidth",
  type: "slider",
  displayName: t("bar_width_label"),
  min: 5,
  max: 95,
  step: 1,
  default: 15,
} satisfies ViewOption;
