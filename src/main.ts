import { Plugin } from "obsidian";
import { ChartBasesView } from "./core/base/index.ts";
import { BarChartRenderer } from "./layouts/bar/index.ts";
import { LineChartRenderer } from "./layouts/line/index.ts";
import { PieChartRenderer } from "./layouts/pie/index.ts";
import {
  BAR_CHART_REGISTRATION,
  BAR_CHART_VIEW_ID,
} from "./layouts/bar/index.ts";
import {
  LINE_CHART_REGISTRATION,
  LINE_CHART_VIEW_ID,
} from "./layouts/line/index.ts";
import {
  PIE_CHART_REGISTRATION,
  PIE_CHART_VIEW_ID,
} from "./layouts/pie/index.ts";

export default class BasesChartLayoutsPlugin extends Plugin {
  override onload() {
    this.registerBasesView(BAR_CHART_VIEW_ID, {
      ...BAR_CHART_REGISTRATION,
      factory: (controller, parent) =>
        new ChartBasesView(
          controller,
          parent,
          BAR_CHART_VIEW_ID,
          BarChartRenderer,
        ),
    });

    this.registerBasesView(LINE_CHART_VIEW_ID, {
      ...LINE_CHART_REGISTRATION,
      factory: (controller, parent) =>
        new ChartBasesView(
          controller,
          parent,
          LINE_CHART_VIEW_ID,
          LineChartRenderer,
        ),
    });

    this.registerBasesView(PIE_CHART_VIEW_ID, {
      ...PIE_CHART_REGISTRATION,
      factory: (controller, parent) =>
        new ChartBasesView(
          controller,
          parent,
          PIE_CHART_VIEW_ID,
          PieChartRenderer,
        ),
    });
  }
}
