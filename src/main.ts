import { Plugin } from "obsidian";
import { t } from "./i18n/index.ts";
import { CHART_VIEW_ID, ChartBasesView, options } from "./view.ts";

export default class ChartsPlugin extends Plugin {
  override onload() {
    this.registerBasesView(CHART_VIEW_ID, {
      name: t("chartName"),
      icon: "lucide-bar-chart-3",
      options,
      factory: (controller, parent) => new ChartBasesView(controller, parent),
    });
  }
}
