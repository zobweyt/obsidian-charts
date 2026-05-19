import { BasesViewRegistration } from "obsidian";
import { t } from "../i18n/index.ts";
import { ChartConfig, ChartData } from "../renderers/ChartRenderer.ts";
import { PieChartRenderer } from "../renderers/PieChartRenderer.ts";
import { ChartBasesView } from "./ChartBasesView.ts";
import {
  PIE_DONUT_OPTION,
  STYLE_SHOW_LABELS_OPTION,
  STYLE_SHOW_LEGEND_OPTION,
} from "../options/style.ts";

const ID = "pie-chart";

export class PieChartBasesView extends ChartBasesView {
  readonly type = ID;

  protected override createRenderer(
    container: HTMLElement,
    data: ChartData,
    config: ChartConfig,
  ) {
    return new PieChartRenderer(container, data, config);
  }

  public static create() {
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
