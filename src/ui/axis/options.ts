import { ViewOption } from "obsidian";
import { t } from "../../lib/i18n/index.ts";
import {
  AGGREGATION_OPTION,
  SERIES_BY_OPTION,
  SHOW_LABELS_OPTION,
} from "../chart/options.ts";
import {
  SHOW_X_LINE_OPTION,
  SHOW_Y_LINE_OPTION,
  X_LINE_STYLE_OPTION,
  X_LINE_WIDTH_OPTION,
  Y_LINE_STYLE_OPTION,
  Y_LINE_WIDTH_OPTION,
} from "./lines/options.ts";
import {
  ROTATE_X_LABELS_OPTION,
  SHOW_X_LABELS_OPTION,
  SHOW_Y_LABELS_OPTION,
} from "./labels/options.ts";

export const X_AXIS_OPTION = {
  key: "xAxis",
  type: "property",
  displayName: t("propertyLabel"),
  placeholder: t("propertyPlaceholderCategory"),
  default: "file.name",
} satisfies ViewOption;

export const X_AXIS_SCALE_OPTION = {
  key: "xAxisScale",
  type: "dropdown",
  displayName: t("xAxisScaleLabel"),
  default: "auto",
  options: {
    auto: t("xAxisScaleAuto"),
    category: t("xAxisScaleCategory"),
    numeric: t("xAxisScaleNumeric"),
  },
} satisfies ViewOption;

export const Y_MAX_OPTION = {
  key: "yMax",
  type: "text",
  displayName: t("maxLabel"),
  placeholder: t("autoPlaceholder"),
} satisfies ViewOption;

export const Y_MIN_OPTION = {
  key: "yMin",
  type: "text",
  displayName: t("minLabel"),
  placeholder: t("autoPlaceholder"),
} satisfies ViewOption;

export const X_OPTION = {
  type: "group",
  displayName: t("xAxisGroup"),
  items: [
    X_AXIS_OPTION,
    X_AXIS_SCALE_OPTION,
    SHOW_X_LINE_OPTION,
    X_LINE_WIDTH_OPTION,
    X_LINE_STYLE_OPTION,
    SHOW_X_LABELS_OPTION,
    ROTATE_X_LABELS_OPTION,
    SHOW_LABELS_OPTION,
  ],
} satisfies ViewOption;

export const Y_OPTION = {
  type: "group",
  displayName: t("yAxisGroup"),
  items: [
    Y_MAX_OPTION,
    Y_MIN_OPTION,
    AGGREGATION_OPTION,
    SERIES_BY_OPTION,
    SHOW_Y_LINE_OPTION,
    Y_LINE_WIDTH_OPTION,
    Y_LINE_STYLE_OPTION,
    SHOW_Y_LABELS_OPTION,
  ],
} satisfies ViewOption;
