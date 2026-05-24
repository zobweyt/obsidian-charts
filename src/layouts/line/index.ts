import { t } from "../../i18n/index.ts";
import { STYLE_OPTION } from "../../core/base/index.ts";
import {
  REFERENCE_LINE_OPTION,
  X_OPTION,
  Y_OPTION,
} from "../../core/cartesian/index.ts";
import {
  LINE_AREA_OPTION,
  LINE_SMOOTH_OPTION,
  LINE_WIDTH_OPTION,
} from "./options.ts";

export const LINE_CHART_VIEW_ID = "line-chart";
export const LINE_CHART_REGISTRATION = {
  name: t("line_chart_name"),
  icon: "lucide-line-chart",
  options: () => [
    X_OPTION,
    Y_OPTION,
    REFERENCE_LINE_OPTION,
    STYLE_OPTION,
    LINE_SMOOTH_OPTION,
    LINE_AREA_OPTION,
    LINE_WIDTH_OPTION,
  ],
};
export { LineChartRenderer } from "./renderer.ts";
