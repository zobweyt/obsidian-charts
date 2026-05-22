import { QueryController } from "obsidian";
import { BaseChartView } from "../base/view.ts";

export abstract class CartesianChartView extends BaseChartView {
  private lastTargetIndex = -1;

  constructor(
    controller: QueryController,
    parent: HTMLElement,
  ) {
    super(controller, parent);

    this.registerDomEvent(
      this.container,
      "auxclick",
      this.handleContainerAuxClick,
    );
    this.registerDomEvent(
      this.container,
      "contextmenu",
      this.handleContainerContextMenu,
    );

    this.echarts.on("updateAxisPointer", this.handleAxisPointerUpdate);
    this.echarts.getZr().on("mousemove", this.handleZrMouseMove);
    this.echarts.getZr().on("click", this.handleZrClick);
  }

  override onDataUpdated() {
    super.onDataUpdated();
    this.lastTargetIndex = -1;
  }

  private handleAxisPointerUpdate = (params: unknown) => {
    const payload = params as { axesInfo?: { value: number }[] };
    if (payload.axesInfo?.[0]) {
      this.lastTargetIndex = payload.axesInfo[0].value;
    }
  };

  private handleZrMouseMove = (event: MouseEvent) => {
    if (this.echarts.containPixel("grid", [event.offsetX, event.offsetY])) {
      this.echarts.getZr().setCursorStyle("pointer");
    } else {
      this.echarts.getZr().setCursorStyle("default");
    }
  };

  private handleZrClick = (event: MouseEvent) => {
    if (this.echarts.containPixel("grid", [event.offsetX, event.offsetY])) {
      if (this.lastTargetIndex !== -1) {
        this.openFileByIndex(this.lastTargetIndex, event);
      }
    }
  };

  private handleContainerAuxClick = (event: MouseEvent) => {
    if (
      event.button === 1 &&
      this.echarts.containPixel("grid", [event.offsetX, event.offsetY])
    ) {
      if (this.lastTargetIndex !== -1) {
        event.preventDefault();
        this.openFileByIndex(this.lastTargetIndex, event);
      }
    }
  };

  private handleContainerContextMenu = (event: MouseEvent) => {
    if (this.echarts.containPixel("grid", [event.offsetX, event.offsetY])) {
      if (this.lastTargetIndex !== -1) {
        this.openContextMenuByIndex(this.lastTargetIndex, event);
      }
    }
  };

  override onunload() {
    this.echarts.off("updateAxisPointer", this.handleAxisPointerUpdate);
    this.echarts.getZr().off("mousemove", this.handleZrMouseMove);
    this.echarts.getZr().off("click", this.handleZrClick);
    super.onunload();
  }
}
