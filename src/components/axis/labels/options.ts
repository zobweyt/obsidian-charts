import { BasesViewConfig, ViewOption } from "obsidian";
import { t } from "../../../i18n/index.ts";

export const SHOW_X_LABELS_OPTION = {
  key: "showXLabels",
  type: "toggle",
  displayName: t("xShowLabels"),
  default: true,
} satisfies ViewOption;

export const ROTATE_X_LABELS_OPTION = {
  key: "rotateXLabels",
  type: "slider",
  displayName: t("rotateLabelsLabel"),
  default: 0,
  min: -90,
  max: 90,
  step: 15,
  shouldHide: (c: BasesViewConfig) =>
    !(c.get(SHOW_X_LABELS_OPTION.key) ?? SHOW_X_LABELS_OPTION.default),
} satisfies ViewOption;

export const SHOW_Y_LABELS_OPTION = {
  key: "showYLabels",
  type: "toggle",
  displayName: t("yShowLabels"),
  default: true,
} satisfies ViewOption;
