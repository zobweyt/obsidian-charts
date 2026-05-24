import { t } from "../../i18n/index.ts";
import { STYLE_OPTION } from "../../core/base/index.ts";
import { PIE_HOLE_RADIUS_OPTION } from "./options.ts";

export const PIE_CHART_VIEW_ID = "pie-chart";
export const PIE_CHART_REGISTRATION = {
  name: t("pie_chart_name"),
  icon: "lucide-pie-chart",
  options: () => [STYLE_OPTION, PIE_HOLE_RADIUS_OPTION],
};
export { PieChartRenderer } from "./renderer.ts";
