import { BasesViewConfig, ViewOption } from "obsidian";
import { t } from "../../../i18n/index.ts";

export const REFERENCE_LINE_VALUE_OPTION = {
  key: "referenceLineValue",
  type: "text",
  displayName: t("referenceLineValueLabel"),
  placeholder: "50",
} satisfies ViewOption;

export const REFERENCE_LINE_NAME_OPTION = {
  key: "referenceLineName",
  type: "text",
  displayName: t("referenceLineNameLabel"),
  placeholder: t("referenceLineNamePlaceholder"),
  shouldHide: (c: BasesViewConfig) => !c.get(REFERENCE_LINE_VALUE_OPTION.key),
} satisfies ViewOption;

export const REFERENCE_LINE_COLOR_OPTION = {
  key: "referenceLineColor",
  type: "text",
  displayName: t("referenceLineColorLabel"),
  placeholder: t("autoPlaceholder"),
  shouldHide: (c: BasesViewConfig) => !c.get(REFERENCE_LINE_VALUE_OPTION.key),
} satisfies ViewOption;

export const REFERENCE_LINE_STYLE_OPTION = {
  key: "referenceLineStyle",
  type: "dropdown",
  displayName: t("referenceLineStyleLabel"),
  default: "dashed",
  options: {
    "solid": t("solid"),
    "dashed": t("dashed"),
    "dotted": t("dotted"),
  },
  shouldHide: (c: BasesViewConfig) => !c.get(REFERENCE_LINE_VALUE_OPTION.key),
} satisfies ViewOption;

export const REFERENCE_LINE_WIDTH_OPTION = {
  key: "referenceLineWidth",
  type: "slider",
  displayName: t("referenceLineWidthLabel"),
  min: 0.5,
  max: 3,
  step: 0.5,
  default: 1,
  shouldHide: (c: BasesViewConfig) => !c.get(REFERENCE_LINE_VALUE_OPTION.key),
} satisfies ViewOption;

export const REFERENCE_LINE_OPTION = {
  type: "group",
  displayName: t("referenceLineGroup"),
  items: [
    REFERENCE_LINE_VALUE_OPTION,
    REFERENCE_LINE_NAME_OPTION,
    REFERENCE_LINE_COLOR_OPTION,
    REFERENCE_LINE_STYLE_OPTION,
    REFERENCE_LINE_WIDTH_OPTION,
  ],
} satisfies ViewOption;
