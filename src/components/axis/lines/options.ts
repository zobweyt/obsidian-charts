import { BasesViewConfig, ViewOption } from "obsidian";
import { t } from "../../../i18n/index.ts";

export const SHOW_X_LINE_OPTION = {
  key: "showXLine",
  type: "toggle",
  displayName: t("xShowLine"),
  default: false,
} satisfies ViewOption;

export const X_LINE_WIDTH_OPTION = {
  key: "xLineWidth",
  type: "slider",
  displayName: t("xLineWidth"),
  min: 0.5,
  max: 3,
  step: 0.5,
  default: 1,
  shouldHide: (c: BasesViewConfig) =>
    !(c.get(SHOW_X_LINE_OPTION.key) || SHOW_X_LINE_OPTION.default),
} satisfies ViewOption;

export const X_LINE_STYLE_OPTION = {
  key: "xLineStyle",
  type: "dropdown",
  displayName: t("xLineStyle"),
  default: "solid",
  options: {
    "solid": t("solid"),
    "dashed": t("dashed"),
    "dotted": t("dotted"),
  },
  shouldHide: (c: BasesViewConfig) =>
    !(c.get(SHOW_X_LINE_OPTION.key) || SHOW_X_LINE_OPTION.default),
} satisfies ViewOption;

export const SHOW_Y_LINE_OPTION = {
  key: "showYLine",
  type: "toggle",
  displayName: t("yShowLine"),
  default: true,
} satisfies ViewOption;

export const Y_LINE_WIDTH_OPTION = {
  key: "yLineWidth",
  type: "slider",
  displayName: t("yLineWidth"),
  min: 0.5,
  max: 3,
  step: 0.5,
  default: 1,
  shouldHide: (c: BasesViewConfig) =>
    !(c.get(SHOW_Y_LINE_OPTION.key) || SHOW_Y_LINE_OPTION.default),
} satisfies ViewOption;

export const Y_LINE_STYLE_OPTION = {
  key: "yLineStyle",
  type: "dropdown",
  displayName: t("yLineStyle"),
  default: "solid",
  options: {
    "solid": t("solid"),
    "dashed": t("dashed"),
    "dotted": t("dotted"),
  },
  shouldHide: (c: BasesViewConfig) =>
    !(c.get(SHOW_Y_LINE_OPTION.key) || SHOW_Y_LINE_OPTION.default),
} satisfies ViewOption;
