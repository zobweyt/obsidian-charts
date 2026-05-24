import { t } from "../../i18n/index.ts";
import { STYLE_OPTION } from "../../core/base/index.ts";
import {
  REFERENCE_LINE_OPTION,
  X_OPTION,
  Y_OPTION,
} from "../../core/cartesian/index.ts";
import { BAR_WIDTH_OPTION } from "./options.ts";

export const BAR_CHART_VIEW_ID = "bar-chart";
export const BAR_CHART_REGISTRATION = {
  name: t("bar_chart_name"),
  icon: "lucide-bar-chart-3",
  options: () => [
    X_OPTION,
    Y_OPTION,
    REFERENCE_LINE_OPTION,
    STYLE_OPTION,
    BAR_WIDTH_OPTION,
  ],
};
export { BarChartRenderer } from "./renderer.ts";
