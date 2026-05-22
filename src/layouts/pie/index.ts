import { BasesViewRegistration } from "obsidian";
import { style } from "../../core/base/index.ts";
import { t } from "../../i18n/index.ts";
import { pieHoleRadius } from "./options.ts";
import { PIE_CHART_VIEW_ID, PieChartBasesView } from "./view.ts";

export const PIE_CHART_VIEW = {
  id: PIE_CHART_VIEW_ID,
  registration: {
    name: t("pie_chart_name"),
    icon: "lucide-pie-chart",
    factory: (controller, parent) => new PieChartBasesView(controller, parent),
    options: () => [
      style,
      pieHoleRadius,
    ],
  } satisfies BasesViewRegistration,
};
