import type { BasesViewRegistration } from "obsidian";
import { t } from "../i18n";
import type { ChartConfig, ChartData } from "../renderers/ChartRenderer";
import { LineChartRenderer } from "../renderers/LineChartRenderer";
import {
  ChartBasesView,
  STYLE_COLOR_OPTION,
  STYLE_SHOW_LABELS_OPTION,
  STYLE_SHOW_LEGEND_OPTION,
  X_AXIS_OMIT_ZERO_OPTION,
  X_AXIS_PROPERTY_OPTION,
  X_AXIS_SHOW_LABELS_OPTION,
  X_AXIS_SHOW_LINES_OPTION,
  Y_AXIS_MAX_OPTION,
  Y_AXIS_MIN_OPTION,
  Y_AXIS_SHOW_LABELS_OPTION,
  Y_AXIS_SHOW_LINE_OPTION,
} from "./ChartBasesView";

const ID = "line-chart";

export class LineChartBasesView extends ChartBasesView {
  readonly type = ID;

  createRenderer(container: HTMLElement, data: ChartData, config: ChartConfig) {
    return new LineChartRenderer(container, data, config);
  }

  static create() {
    return [
      ID,
      {
        name: t("line_chart_name"),
        icon: "lucide-line-chart",
        factory: (controller, containerEl) =>
          new LineChartBasesView(controller, containerEl),

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
              {
                type: "toggle",
                displayName: t("smooth_curve_label"),
                key: "lineSmooth",
                default: false,
              },
              {
                type: "toggle",
                displayName: t("show_area_label"),
                key: "lineArea",
                default: false,
              },
              {
                type: "slider",
                displayName: t("line_width_label"),
                min: 1,
                max: 10,
                step: 1,
                key: "lineWidth",
                default: 1,
              },
            ],
          },
        ],
      } satisfies BasesViewRegistration,
    ] as const;
  }
}
