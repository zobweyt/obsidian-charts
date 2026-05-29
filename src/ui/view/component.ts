import { BasesView, QueryController } from "obsidian";
import { Chart } from "../chart/chart.ts";

export const CHART_VIEW_ID = "chart";

export class ChartBasesView extends BasesView {
  readonly type = CHART_VIEW_ID;
  readonly container: HTMLElement;
  protected chart: Chart | null = null;

  constructor(controller: QueryController, parent: HTMLElement) {
    super(controller);
    this.container = parent.createDiv({ cls: "bases-chart-container" });
  }

  override onDataUpdated() {
    this.chart?.destroy();
    this.container.empty();
    this.chart = new Chart({
      app: this.app,
      data: this.data,
      config: this.config,
      container: this.container,
    });
    this.chart.render();
  }

  override onunload() {
    this.chart?.destroy();
    this.container.remove();
  }
}
