import { REFERENCE_LINE_OPTION } from "../axis/index.ts";
import { X_OPTION, Y_OPTION } from "../axis/options.ts";
import {
  BAR_WIDTH_OPTION,
  LINE_AREA_OPTION,
  LINE_SMOOTH_OPTION,
  LINE_WIDTH_OPTION,
  STYLE_OPTION,
  TYPE_OPTION,
} from "../chart/options.ts";
import { LEGEND_OPTION } from "../legend/options.ts";

export const options = () => [
  TYPE_OPTION,
  LINE_AREA_OPTION,
  LINE_SMOOTH_OPTION,
  LINE_WIDTH_OPTION,
  BAR_WIDTH_OPTION,
  X_OPTION,
  Y_OPTION,
  LEGEND_OPTION,
  REFERENCE_LINE_OPTION,
  STYLE_OPTION,
];
