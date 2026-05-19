import type { ECharts } from "echarts";
import {
  type BasesPropertyOption,
  type BasesQueryResult,
  type BasesTextOption,
  type BasesToggleOption,
  BasesView,
  Menu,
  type QueryController,
  TFile,
} from "obsidian";
import { t } from "../i18n";
import type {
  ChartConfig,
  ChartData,
  ChartRenderer,
} from "../renderers/ChartRenderer";

export const X_AXIS_PROPERTY_OPTION: BasesPropertyOption = {
  type: "property",
  displayName: t("property_label"),
  placeholder: t("property_placeholder_category"),
  key: "xAxis",
  default: "file.name",
};

export const X_AXIS_SHOW_LINES_OPTION: BasesToggleOption = {
  type: "toggle",
  displayName: t("show_line_label"),
  key: "showXLine",
  default: false,
};

export const X_AXIS_SHOW_LABELS_OPTION: BasesToggleOption = {
  type: "toggle",
  displayName: t("show_labels_label"),
  key: "showXLabels",
  default: true,
};

export const X_AXIS_OMIT_ZERO_OPTION: BasesToggleOption = {
  type: "toggle",
  displayName: t("omit_zero_values_label"),
  key: "omitZero",
  default: false,
};

export const Y_AXIS_MAX_OPTION: BasesTextOption = {
  type: "text",
  displayName: t("max_label"),
  key: "yMax",
  default: "",
  placeholder: t("auto_placeholder"),
};

export const Y_AXIS_MIN_OPTION: BasesTextOption = {
  type: "text",
  displayName: t("min_label"),
  key: "yMin",
  default: "",
  placeholder: t("auto_placeholder"),
};

export const Y_AXIS_SHOW_LINE_OPTION: BasesToggleOption = {
  type: "toggle",
  displayName: t("show_line_label"),
  key: "showYLine",
  default: true,
};

export const Y_AXIS_SHOW_LABELS_OPTION: BasesToggleOption = {
  type: "toggle",
  displayName: t("show_labels_label"),
  key: "showYLabels",
  default: true,
};

export const STYLE_COLOR_OPTION: BasesTextOption = {
  type: "text",
  displayName: t("color_label"),
  key: "color",
  placeholder: "var(--interactive-accent)",
};

export const STYLE_SHOW_LEGEND_OPTION: BasesToggleOption = {
  type: "toggle",
  displayName: t("show_leged"),
  key: "showLegend",
  default: true,
};

export const STYLE_SHOW_LABELS_OPTION: BasesToggleOption = {
  type: "toggle",
  displayName: t("show_labels_label"),
  key: "showLabels",
  default: false,
};

export abstract class ChartBasesView extends BasesView {
  protected chartInstance: ECharts | null = null;
  protected containerEl: HTMLElement;
  protected renderer: ChartRenderer | null = null;
  private resizeObserver: ResizeObserver | null = null;

  abstract createRenderer(
    container: HTMLElement,
    data: ChartData,
    config: ChartConfig,
  ): ChartRenderer;

  constructor(controller: QueryController, parentEl: HTMLElement) {
    super(controller);
    this.containerEl = parentEl.createDiv();
    this.containerEl.style.width = "100%";
    this.containerEl.style.height = "100%";
    this.containerEl.style.position = "relative";
    this.containerEl.style.minHeight = "320px";
  }

  extract(config: ChartConfig): ChartData {
    const groupedData = this.data?.groupedData || [];
    const labels: string[] = [];
    const filePaths: string[] = [];

    const seriesNames = this.data?.properties || [];
    const values: number[][] = seriesNames.map(() => []);

    const displayNames = seriesNames.map((name) =>
      this.config.getDisplayName(name),
    );

    for (const group of groupedData) {
      for (const entry of group.entries) {
        let xVal = entry.file?.name || "";

        if (config.xProp && config.xProp !== "file.name") {
          const xObj = entry.getValue(
            String(config.xProp) as BasesQueryResult["properties"][0],
          );
          if (xObj) {
            const extractedVal =
              typeof xObj.toString === "function"
                ? xObj.toString()
                : String((xObj as { value?: unknown }).value || xObj);
            if (extractedVal && extractedVal !== "[object Object]") {
              xVal = extractedVal;
            }
          }
        }

        let shouldAdd = false;
        const rowValues: number[] = [];

        for (let i = 0; i < seriesNames.length; i++) {
          const prop = seriesNames[i];
          const yObj = entry.getValue(prop);
          let yVal = 0;

          if (yObj) {
            const rawVal =
              (yObj as { value?: unknown }).value !== undefined
                ? (yObj as { value?: unknown }).value
                : yObj;
            yVal = Number(rawVal);
            if (Number.isNaN(yVal)) yVal = 0;
          }

          if (config.omitZero && yVal === 0) {
            rowValues.push(0);
          } else {
            rowValues.push(yVal);
            shouldAdd = true;
          }
        }

        if (!config.omitZero || shouldAdd) {
          labels.push(xVal);
          filePaths.push(entry.file?.path || "");

          for (let i = 0; i < rowValues.length; i++) {
            values[i].push(rowValues[i]);
          }
        }
      }
    }

    return { labels, values, filePaths, seriesNames: displayNames };
  }

  override onDataUpdated(): void {
    this.cleanup();

    const groupedData = this.data?.groupedData || [];
    if (groupedData.length === 0) return;

    const config = this.buildFullConfig();
    const extractedData = this.extract(config);

    if (
      extractedData.labels.length === 0 ||
      extractedData.seriesNames.length === 0
    )
      return;

    this.renderChart(extractedData, config);
  }

  private buildFullConfig(): ChartConfig {
    return {
      xProp: this.config?.get("xAxis") as string | undefined,
      showLabels: this.config?.get("showLabels") === true,
      omitZero: this.config?.get("omitZero") === true,
      yMin: this.parseNumberConfig("yMin"),
      yMax: this.parseNumberConfig("yMax"),
      color: String(this.config?.get("color")),
      barWidth: this.parseNumberConfig("barWidth", 15),
      lineWidth: this.parseNumberConfig("lineWidth", 1),
      lineSmooth: this.config?.get("lineSmooth") === true,
      lineArea: this.config?.get("lineArea") === true,
      showXLine:
        typeof this.config?.get("showXLine") === "boolean"
          ? this.config?.get("showXLine") === true
          : false,
      showYLine:
        typeof this.config?.get("showYLine") === "boolean"
          ? this.config?.get("showYLine") === true
          : true,
      showXAxisLabel:
        typeof this.config?.get("showXLabels") === "boolean"
          ? this.config?.get("showXLabels") === true
          : true,
      showYAxisLabel:
        typeof this.config?.get("showYLabels") === "boolean"
          ? this.config?.get("showYLabels") === true
          : true,
      showLegend:
        typeof this.config?.get("showLegend") === "boolean"
          ? this.config?.get("showLegend") === true
          : true,
      pieDonut:
        typeof this.config?.get("pieDonut") === "boolean"
          ? this.config?.get("pieDonut") === true
          : false,
    };
  }

  private parseNumberConfig(
    key: string,
    defaultValue?: number,
  ): number | undefined {
    const value = this.config?.get(key);
    if (value !== undefined && value !== "") {
      const num = Number(value);
      return Number.isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
  }

  private renderChart(data: ChartData, config: ChartConfig): void {
    this.containerEl.empty();

    const chartContainer = this.containerEl.createDiv();
    chartContainer.style.width = "100%";
    chartContainer.style.height = "100%";
    chartContainer.style.minHeight = "320px";

    this.renderer = this.createRenderer(chartContainer, data, config);
    this.chartInstance = this.renderer.render();
    this.setupInteractions(chartContainer, data.filePaths);

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        if (width === 0 || height === 0) continue;

        if (this.chartInstance) {
          this.chartInstance.resize({
            width: width,
            height: height,
          });
        }
      }
    });

    this.resizeObserver.observe(this.containerEl);
  }

  private setupInteractions(container: HTMLElement, filePaths: string[]): void {
    if (!this.chartInstance) return;

    let lastTargetIndex = -1;

    this.chartInstance.on("updateAxisPointer", (params) => {
      const axesInfo = (params as { axesInfo?: { value: number }[] }).axesInfo;
      if (axesInfo?.[0]) {
        lastTargetIndex = axesInfo[0].value;
      }
    });

    const series = this.chartInstance.getOption().series;
    const seriesArray = Array.isArray(series) ? series : [series];
    const isPieChart = seriesArray.some(
      (s) => s && (s as { type?: string }).type === "pie",
    );

    if (!isPieChart) {
      this.chartInstance.getZr().on("mousemove", (event) => {
        if (
          this.chartInstance?.containPixel("grid", [
            event.offsetX,
            event.offsetY,
          ])
        ) {
          this.chartInstance.getZr().setCursorStyle("pointer");
        } else {
          this.chartInstance?.getZr().setCursorStyle("default");
        }
      });
    }

    this.chartInstance.getZr().on("click", (event) => {
      if (
        this.chartInstance?.containPixel("grid", [event.offsetX, event.offsetY])
      ) {
        if (lastTargetIndex !== -1 && event.event) {
          this.openFileByIndex(
            lastTargetIndex,
            filePaths,
            event.event as unknown as MouseEvent,
          );
        }
      }
    });

    container.addEventListener("auxclick", (event: MouseEvent) => {
      if (!this.chartInstance || isPieChart) return;
      if (event.button === 1) {
        if (
          this.chartInstance.containPixel("grid", [
            event.offsetX,
            event.offsetY,
          ])
        ) {
          if (lastTargetIndex !== -1) {
            event.preventDefault();
            this.openFileByIndex(lastTargetIndex, filePaths, event);
          }
        }
      }
    });

    container.addEventListener("mouseup", (event: MouseEvent) => {
      if (!this.chartInstance || isPieChart) return;
      if (
        event.button === 1 &&
        this.chartInstance.containPixel("grid", [event.offsetX, event.offsetY])
      ) {
        event.preventDefault();
      }
    });

    this.chartInstance.on("click", (params) => {
      if (params.componentType === "series" && params.seriesType === "pie") {
        this.openFileByIndex(
          params.dataIndex,
          filePaths,
          params.event?.event as unknown as MouseEvent,
        );
      }
    });

    this.chartInstance.on("contextmenu", (params) => {
      if (params.seriesType === "pie") {
        this.openContextMenuByIndex(
          params.dataIndex,
          filePaths,
          params.event?.event as unknown as MouseEvent,
        );
      }
    });

    container.addEventListener("mousedown", (event: MouseEvent) => {
      if (!this.chartInstance || isPieChart) return;
      if (
        event.button === 1 &&
        this.chartInstance.containPixel("grid", [event.offsetX, event.offsetY])
      ) {
        event.preventDefault();
      }
    });

    container.addEventListener("contextmenu", (event: MouseEvent) => {
      if (!this.chartInstance) return;

      if (
        this.chartInstance.containPixel("grid", [event.offsetX, event.offsetY])
      ) {
        if (lastTargetIndex !== -1) {
          this.openContextMenuByIndex(lastTargetIndex, filePaths, event);
        }
      }
    });
  }

  private openContextMenuByIndex(
    index: number,
    filePaths: string[],
    event: MouseEvent,
  ): void {
    const filePath = filePaths[index];
    if (!filePath) return;

    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return;

    event.preventDefault();
    const menu = new Menu();
    this.app.workspace.trigger("file-menu", menu, file);
    menu.showAtMouseEvent(event);
  }

  private openFileByIndex(
    index: number,
    filePaths: string[],
    event: MouseEvent,
  ): void {
    const filePath = filePaths[index];
    if (!filePath) return;

    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
      const isNewTab = event.button === 1 || event.ctrlKey || event.metaKey;
      this.app.workspace.getLeaf(isNewTab ? "tab" : false).openFile(file);
    }
  }

  private cleanup(): void {
    this.renderer?.dispose();
    this.renderer = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.chartInstance = null;
    this.containerEl.empty();
  }

  override onunload() {
    this.cleanup();
  }
}
