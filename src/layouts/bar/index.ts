import { BasesViewRegistration } from "obsidian";
import { style } from "../../core/base/options.ts";
import { referenceLine, x, y } from "../../core/cartesian/options.ts";
import { t } from "../../i18n/index.ts";
import { barWidth } from "./options.ts";
import { BAR_CHART_VIEW_ID, BarChartView } from "./view.ts";

export const BAR_CHART_VIEW = {
  id: BAR_CHART_VIEW_ID,
  registration: {
    name: t("bar_chart_name"),
    icon: "lucide-bar-chart-3",
    factory: (controller, parent) => new BarChartView(controller, parent),
    options: () => [
      x,
      y,
      referenceLine,
      style,
      barWidth,
    ],
  } satisfies BasesViewRegistration,
};
