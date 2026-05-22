import { CartesianChartView } from "../../core/cartesian/index.ts";
import { LineChartBuilder } from "./builder.ts";

export const LINE_CHART_VIEW_ID = "line-chart";

export class LineChartBasesView extends CartesianChartView {
  readonly type = LINE_CHART_VIEW_ID;
  readonly builder = LineChartBuilder;
}
