import { CartesianChartView } from "../../core/cartesian/index.ts";
import { BarChartBuilder } from "./builder.ts";

export const BAR_CHART_VIEW_ID = "bar-chart";

export class BarChartView extends CartesianChartView {
  readonly type = BAR_CHART_VIEW_ID;
  readonly builder = BarChartBuilder;
}
