import { PolarChartView } from "../../core/polar/index.ts";
import { PieChartBuilder } from "./builder.ts";

export const PIE_CHART_VIEW_ID = "pie-chart";

export class PieChartBasesView extends PolarChartView {
  readonly type = PIE_CHART_VIEW_ID;
  readonly builder = PieChartBuilder;
}
