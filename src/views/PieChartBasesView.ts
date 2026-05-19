import type { BasesToggleOption, BasesViewRegistration } from "obsidian";
import { t } from "../i18n";
import type { ChartConfig, ChartData } from "../renderers/ChartRenderer";
import { PieChartRenderer } from "../renderers/PieChartRenderer";
import {
  ChartBasesView,
  STYLE_SHOW_LABELS_OPTION,
  STYLE_SHOW_LEGEND_OPTION,
} from "./ChartBasesView";

export const PIE_DONUT_OPTION: BasesToggleOption = {
  type: "toggle",
  displayName: t("pie_donut"),
  key: "pieDonut",
  default: false,
};

const ID = "pie-chart";

export class PieChartBasesView extends ChartBasesView {
  readonly type = ID;

  createRenderer(container: HTMLElement, data: ChartData, config: ChartConfig) {
    return new PieChartRenderer(container, data, config);
  }

  static create() {
    return [
      ID,
      {
        name: t("pie_chart_name"),
        icon: "lucide-pie-chart",
        factory: (controller, containerEl) =>
          new PieChartBasesView(controller, containerEl),

        options: () => [
          {
            type: "group",
            displayName: t("style_group"),
            items: [
              STYLE_SHOW_LEGEND_OPTION,
              STYLE_SHOW_LABELS_OPTION,
              PIE_DONUT_OPTION,
            ],
          },
        ],
      } satisfies BasesViewRegistration,
    ] as const;
  }
}
