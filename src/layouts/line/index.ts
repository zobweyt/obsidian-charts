import { BasesViewRegistration } from "obsidian";
import { style } from "../../core/base/index.ts";
import { x, y } from "../../core/cartesian/index.ts";
import { t } from "../../i18n/index.ts";
import { lineArea, lineSmooth, lineWidth } from "./options.ts";
import { LINE_CHART_VIEW_ID, LineChartBasesView } from "./view.ts";
import { referenceLine } from "../../core/cartesian/options.ts";

export const LINE_CHART_VIEW = {
  id: LINE_CHART_VIEW_ID,
  registration: {
    name: t("line_chart_name"),
    icon: "lucide-line-chart",
    factory: (controller, parent) => new LineChartBasesView(controller, parent),
    options: () => [
      x,
      y,
      referenceLine,
      style,
      lineSmooth,
      lineArea,
      lineWidth,
    ],
  } satisfies BasesViewRegistration,
};
