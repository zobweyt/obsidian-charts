import { QueryController } from "obsidian";
import { BaseChartView } from "../base/view.ts";
import { ECElementEvent } from "echarts";

export abstract class PolarChartView extends BaseChartView {
  constructor(
    controller: QueryController,
    parent: HTMLElement,
  ) {
    super(controller, parent);

    this.echarts.on("click", this.handleEChartsClick);
    this.echarts.on("contextmenu", this.handleEChartsContextMenu);
  }

  private handleEChartsClick = (params: ECElementEvent) => {
    if (params.componentType === "series" && params.event?.event) {
      this.openFileByIndex(params.dataIndex, params.event.event as MouseEvent);
    }
  };

  private handleEChartsContextMenu = (params: ECElementEvent) => {
    if (params.event?.event) {
      this.openContextMenuByIndex(
        params.dataIndex,
        params.event.event as MouseEvent,
      );
    }
  };

  override onunload() {
    this.echarts.off("click", this.handleEChartsClick);
    this.echarts.off("contextmenu", this.handleEChartsContextMenu);
    super.onunload();
  }
}
