import { BasesView, QueryController } from "obsidian";
import { Chart } from "./components/chart/chart.ts";
import type { ChartOptions } from "./components/chart/options.ts";
import {
  BAR_WIDTH_OPTION,
  LINE_AREA_OPTION,
  LINE_SMOOTH_OPTION,
  LINE_WIDTH_OPTION,
  STYLE_OPTION,
  TYPE_OPTION,
} from "./components/chart/options.ts";
import {
  REFERENCE_LINE_OPTION,
  X_OPTION,
  Y_OPTION,
} from "./components/axis/index.ts";
import { LEGEND_OPTION } from "./components/legend/options.ts";

export const CHART_VIEW_ID = "chart";

export class ChartBasesView extends BasesView {
  readonly type = CHART_VIEW_ID;
  readonly container: HTMLElement;
  protected renderer: Chart | null = null;

  constructor(controller: QueryController, parent: HTMLElement) {
    super(controller);
    this.container = parent.createDiv({ cls: "bases-chart-container" });
  }

  override onDataUpdated() {
    this.renderer?.destroy();
    this.container.empty();
    this.renderer = new Chart(
      {
        container: this.container,
        data: this.data,
        config: this.config,
        app: this.app,
      } satisfies ChartOptions,
    );
    this.renderer.render();
  }

  override onunload() {
    this.renderer?.destroy();
    this.container.remove();
    super.onunload();
  }
}

export function options() {
  return [
    TYPE_OPTION,
    LINE_AREA_OPTION,
    LINE_SMOOTH_OPTION,
    LINE_WIDTH_OPTION,
    BAR_WIDTH_OPTION,
    X_OPTION,
    Y_OPTION,
    LEGEND_OPTION,
    REFERENCE_LINE_OPTION,
    STYLE_OPTION,
  ];
}
