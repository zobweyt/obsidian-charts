import { ECharts, init } from "echarts";
import { BasesQueryResult, BasesViewConfig, Menu, TFile } from "obsidian";
import { BasesView, QueryController } from "obsidian";
import { BaseChartBuilder } from "./builder.ts";

export abstract class BaseChartView extends BasesView {
  abstract readonly builder: new (
    result: BasesQueryResult,
    config: BasesViewConfig,
  ) => BaseChartBuilder;

  readonly container: HTMLElement;
  readonly echarts: ECharts;
  readonly resizeObserver: ResizeObserver;

  constructor(controller: QueryController, parent: HTMLElement) {
    super(controller);

    this.container = parent.createDiv();
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.minHeight = "var(--bases-chart-container-min-height)";

    this.echarts = init(this.container, null, {
      renderer: "svg",
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    });

    this.resizeObserver = new ResizeObserver(
      this.handleContainerResize.bind(this),
    );
    this.resizeObserver.observe(this.container);
  }

  override onDataUpdated() {
    const option = new this.builder(this.data, this.config).build();
    this.echarts.setOption(option, {
      replaceMerge: ["series", "xAxis", "yAxis"],
    });
  }

  private handleContainerResize([entry]: ResizeObserverEntry[]) {
    const { width, height } = entry.contentRect;
    if (width === 0 || height === 0) return;
    this.echarts.resize({ width, height });
  }

  protected openFileByIndex(index: number, event: MouseEvent) {
    const filePaths = this.data.data.map((entry) => entry.file.path);
    const filePath = filePaths[index];
    if (!filePath) return;

    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
      const isNewTab = event.button === 1 || event.ctrlKey || event.metaKey;
      this.app.workspace.openLinkText(file.path, "", isNewTab);
    }
  }

  protected openContextMenuByIndex(index: number, event: MouseEvent) {
    const filePaths = this.data.data.map((entry) => entry.file.path);
    const filePath = filePaths[index];
    if (!filePath) return;

    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return;

    event.preventDefault();
    const menu = Menu.forEvent(event);
    this.app.workspace.handleLinkContextMenu(menu, file.path, "");
    menu.showAtMouseEvent(event);
  }

  override onunload() {
    this.resizeObserver.disconnect();
    this.echarts.dispose();
    this.container.empty();
  }
}
