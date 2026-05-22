import { Plugin } from "obsidian";
import { BAR_CHART_VIEW } from "./layouts/bar/index.ts";
import { LINE_CHART_VIEW } from "./layouts/line/index.ts";
import { PIE_CHART_VIEW } from "./layouts/pie/index.ts";

export default class BasesChartLayoutsPlugin extends Plugin {
  override onload() {
    this.registerBasesView(BAR_CHART_VIEW.id, BAR_CHART_VIEW.registration);
    this.registerBasesView(LINE_CHART_VIEW.id, LINE_CHART_VIEW.registration);
    this.registerBasesView(PIE_CHART_VIEW.id, PIE_CHART_VIEW.registration);
  }
}
