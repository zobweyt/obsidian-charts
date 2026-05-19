import { BasesViewRegistration } from "obsidian";
import { t } from "../i18n/index.ts";
import {
  BAR_WIDTH_OPTION,
  STYLE_COLOR_OPTION,
  STYLE_SHOW_LABELS_OPTION,
  STYLE_SHOW_LEGEND_OPTION,
} from "../options/style.ts";
import {
  X_AXIS_OMIT_ZERO_OPTION,
  X_AXIS_PROPERTY_OPTION,
  X_AXIS_SHOW_LABELS_OPTION,
  X_AXIS_SHOW_LINES_OPTION,
  Y_AXIS_MAX_OPTION,
} from "../options/x.ts";
import {
  Y_AXIS_MIN_OPTION,
  Y_AXIS_SHOW_LABELS_OPTION,
  Y_AXIS_SHOW_LINE_OPTION,
} from "../options/y.ts";
import { BarChartRenderer } from "../renderers/BarChartRenderer.ts";
import {
  ChartConfig,
  ChartData,
  ChartRenderer,
} from "../renderers/ChartRenderer.ts";
import { ChartBasesView } from "./ChartBasesView.ts";

const ID = "bar-chart";

export class BarChartBasesView extends ChartBasesView {
  public readonly type = ID;

  protected override createRenderer(
    container: HTMLElement,
    data: ChartData,
    config: ChartConfig,
  ): ChartRenderer {
    return new BarChartRenderer(container, data, config);
  }

  public static create() {
    return [
      ID,
      {
        name: t("bar_chart_name"),
        icon: "lucide-bar-chart-3",
        factory: (controller, containerEl) =>
          new BarChartBasesView(controller, containerEl),
        options: () => [
          {
            type: "group",
            displayName: t("x_axis_group"),
            items: [
              X_AXIS_PROPERTY_OPTION,
              X_AXIS_SHOW_LINES_OPTION,
              X_AXIS_SHOW_LABELS_OPTION,
              X_AXIS_OMIT_ZERO_OPTION,
            ],
          },
          {
            type: "group",
            displayName: t("y_axis_group"),
            items: [
              Y_AXIS_MAX_OPTION,
              Y_AXIS_MIN_OPTION,
              Y_AXIS_SHOW_LINE_OPTION,
              Y_AXIS_SHOW_LABELS_OPTION,
            ],
          },
          {
            type: "group",
            displayName: t("style_group"),
            items: [
              STYLE_COLOR_OPTION,
              STYLE_SHOW_LEGEND_OPTION,
              STYLE_SHOW_LABELS_OPTION,
              BAR_WIDTH_OPTION,
            ],
          },
        ],
      } satisfies BasesViewRegistration,
    ] as const;
  }
}
