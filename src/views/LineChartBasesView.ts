import { BasesViewRegistration } from "obsidian";
import { t } from "../i18n/index.ts";
import { ChartConfig, ChartData } from "../renderers/ChartRenderer.ts";
import { LineChartRenderer } from "../renderers/LineChartRenderer.ts";
import { ChartBasesView } from "./ChartBasesView.ts";
import {
  LINE_AREA_OPTION,
  LINE_SMOOTH_OPTION,
  LINE_WIDTH_OPTION,
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

const ID = "line-chart";

export class LineChartBasesView extends ChartBasesView {
  public readonly type = ID;

  protected override createRenderer(
    container: HTMLElement,
    data: ChartData,
    config: ChartConfig,
  ) {
    return new LineChartRenderer(container, data, config);
  }

  public static create() {
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
              LINE_SMOOTH_OPTION,
              LINE_AREA_OPTION,
              LINE_WIDTH_OPTION,
            ],
          },
        ],
      } satisfies BasesViewRegistration,
    ] as const;
  }
}
