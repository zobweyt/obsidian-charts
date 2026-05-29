import { ChartContext } from "../chart/context.ts";
import {
  ROTATE_X_LABELS_OPTION,
  SHOW_X_LABELS_OPTION,
  SHOW_Y_LABELS_OPTION,
} from "./labels/options.ts";
import {
  SHOW_X_LINE_OPTION,
  SHOW_Y_LINE_OPTION,
  X_LINE_STYLE_OPTION,
  X_LINE_WIDTH_OPTION,
  Y_LINE_STYLE_OPTION,
  Y_LINE_WIDTH_OPTION,
} from "./lines/options.ts";
import {
  REFERENCE_LINE_COLOR_OPTION,
  REFERENCE_LINE_NAME_OPTION,
  REFERENCE_LINE_STYLE_OPTION,
  REFERENCE_LINE_VALUE_OPTION,
  REFERENCE_LINE_WIDTH_OPTION,
} from "./reference/options.ts";
import { Y_MAX_OPTION, Y_MIN_OPTION } from "./options.ts";

export type AxisType = "x" | "y";

export interface AxisContext {
  chart: ChartContext;
  type: AxisType;
  showLine: boolean;
  lineWidth: number;
  lineStyle: string;
  showLabels: boolean;
  rotateLabels: number;
  labels: (string | number)[];
  yMax?: number;
  yMin?: number;
  referenceValue?: string;
  referenceColor: string;
  referenceStyle: string;
  referenceWidth: number;
  referenceName: string;
}

export function createAxisContext(
  chart: ChartContext,
  axisType: AxisType,
): AxisContext {
  const config = chart.config;
  const xCommon = {
    chart,
    labels: [] as (string | number)[],
    referenceValue: undefined as string | undefined,
    referenceColor: "var(--text-error)",
    referenceStyle: "dashed",
    referenceWidth: 1,
    referenceName: "",
  };
  if (axisType === "x") {
    return {
      ...xCommon,
      type: axisType,
      showLine: (config.get(SHOW_X_LINE_OPTION.key) ??
        SHOW_X_LINE_OPTION.default) as boolean,
      lineWidth: (config.get(X_LINE_WIDTH_OPTION.key) ||
        X_LINE_WIDTH_OPTION.default) as number,
      lineStyle: (config.get(X_LINE_STYLE_OPTION.key) ||
        X_LINE_STYLE_OPTION.default) as string,
      showLabels: (config.get(SHOW_X_LABELS_OPTION.key) ??
        SHOW_X_LABELS_OPTION.default) as boolean,
      rotateLabels: (config.get(ROTATE_X_LABELS_OPTION.key) ||
        ROTATE_X_LABELS_OPTION.default) as number,
    };
  }
  const rawMax = config.get(Y_MAX_OPTION.key);
  const rawMin = config.get(Y_MIN_OPTION.key);
  return {
    ...xCommon,
    type: axisType,
    showLine: (config.get(SHOW_Y_LINE_OPTION.key) ??
      SHOW_Y_LINE_OPTION.default) as boolean,
    lineWidth: (config.get(Y_LINE_WIDTH_OPTION.key) ||
      Y_LINE_WIDTH_OPTION.default) as number,
    lineStyle: (config.get(Y_LINE_STYLE_OPTION.key) ||
      Y_LINE_STYLE_OPTION.default) as string,
    showLabels: (config.get(SHOW_Y_LABELS_OPTION.key) ??
      SHOW_Y_LABELS_OPTION.default) as boolean,
    rotateLabels: 0,
    yMax: typeof rawMax === "string" && rawMax.trim() !== ""
      ? Number(rawMax)
      : undefined,
    yMin: typeof rawMin === "string" && rawMin.trim() !== ""
      ? Number(rawMin)
      : undefined,
    referenceValue:
      (config.get(REFERENCE_LINE_VALUE_OPTION.key) as string | undefined) ||
      undefined,
    referenceColor: (config.get(REFERENCE_LINE_COLOR_OPTION.key) as string) ||
      "var(--text-error)",
    referenceStyle: (config.get(REFERENCE_LINE_STYLE_OPTION.key) ||
      REFERENCE_LINE_STYLE_OPTION.default) as string,
    referenceWidth: (config.get(REFERENCE_LINE_WIDTH_OPTION.key) ||
      REFERENCE_LINE_WIDTH_OPTION.default) as number,
    referenceName: config.get(REFERENCE_LINE_NAME_OPTION.key) as string,
  };
}
