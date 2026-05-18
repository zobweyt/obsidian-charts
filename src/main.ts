import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import type {
  EChartsOption,
  EChartsType,
  TooltipOption,
  XAXisOption,
  YAXisOption,
} from "echarts/types/dist/shared.d.ts";
import {
  type BasesAllOptions,
  BasesView,
  Menu,
  Plugin,
  type QueryController,
  TFile,
} from "obsidian";

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  SVGRenderer,
]);

export const BAR_VIEW_TYPE = "bar-chart";
export const LINE_VIEW_TYPE = "line-chart";

interface ChartData {
  labels: string[];
  values: number[];
  filePaths: string[];
}

interface ChartConfig {
  type: "bar" | "line";
  xProp?: string;
  yProp?: string;
  showLabels: boolean;
  omitZero: boolean;
  yMin?: number;
  yMax?: number;
  barWidth?: number;
  color?: string;
  lineSmooth?: boolean;
  lineArea?: boolean;
  showXLine: boolean;
  showYLine: boolean;
}

interface GroupEntry {
  file?: { path?: string; name?: string };
  getValue(key: string): { value?: unknown; toString?(): string } | unknown;
}

interface GroupData {
  entries: GroupEntry[];
}

interface QueryData {
  groupedData?: GroupData[];
}

class ChartDataExtractor {
  static extract(data: QueryData, config: ChartConfig): ChartData {
    const groupedData = data?.groupedData || [];
    const labels: string[] = [];
    const values: number[] = [];
    const filePaths: string[] = [];

    for (const group of groupedData) {
      for (const entry of group.entries) {
        const xVal = ChartDataExtractor.extractXValue(entry, config.xProp);
        const yVal = ChartDataExtractor.extractYValue(entry, config.yProp);

        if (!config.omitZero || yVal !== 0) {
          labels.push(xVal);
          values.push(yVal);
          filePaths.push(entry.file?.path || "");
        }
      }
    }

    return { labels, values, filePaths };
  }

  private static extractXValue(entry: GroupEntry, xProp?: string): string {
    if (!xProp) {
      return entry.file?.name || "Untitled";
    }

    const xObj = entry.getValue(String(xProp));
    if (xObj) {
      const xVal =
        typeof xObj.toString === "function"
          ? xObj.toString()
          : String((xObj as { value?: unknown }).value || xObj);
      if (xVal && xVal !== "[object Object]") {
        return xVal;
      }
    }

    return entry.file?.name || "Untitled";
  }

  private static extractYValue(entry: GroupEntry, yProp?: string): number {
    if (!yProp) return 0;

    const yObj = entry.getValue(String(yProp));
    if (!yObj) return 0;

    const rawVal =
      (yObj as { value?: unknown }).value !== undefined
        ? (yObj as { value?: unknown }).value
        : yObj;
    const num = Number(rawVal);
    return Number.isNaN(num) ? 0 : num;
  }
}

abstract class BaseEChartsRenderer {
  protected chartInstance: EChartsType | null = null;
  protected containerEl: HTMLElement;
  protected data: ChartData;
  protected config: ChartConfig;

  constructor(containerEl: HTMLElement, data: ChartData, config: ChartConfig) {
    this.containerEl = containerEl;
    this.data = data;
    this.config = config;
  }

  abstract createSeriesOption(): unknown;

  protected getBaseOption(): Partial<EChartsOption> {
    return {
      backgroundColor: "transparent",
      animation: false,
      animationDuration: 0,
      animationDurationUpdate: 0,
      animationEasing: "linear",
      tooltip: this.createTooltipOption(),
      grid: {
        top: 40,
        bottom: 40,
        left: 50,
        right: 20,
        backgroundColor: "transparent",
        containLabel: false,
        show: true,
        borderWidth: 0,
      },
      xAxis: this.createXAxisOption(),
      yAxis: this.createYAxisOption(),
    };
  }

  protected createTooltipOption(): TooltipOption {
    return {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        animation: false,
      },
      backgroundColor: "var(--background-modifier-message)",
      borderColor: "transparent",
      borderWidth: 0,
      padding: [4, 8],
      extraCssText:
        "box-shadow: 0 2px 8px var(--background-modifier-box-shadow);",
      transitionDuration: 0,
      formatter: (params) => {
        const firstParam = (
          params as unknown as {
            color?: string;
            name?: string;
            value?: number;
          }[]
        )?.[0];
        if (firstParam) {
          return ` 
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <div style="width: 12px; height: 12px; border-radius: 2px; background-color: ${firstParam.color};"></div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 16px; font-size: var(--font-ui-small); line-height: var(--line-height-tight); color: #FAFAFA; font-family: var(--font-interface);">
                                <span>${firstParam.name}</span>
                                <span>${firstParam.value}</span>
                            </div>
                        </div>
                    `;
        }
        return "";
      },
    };
  }

  protected createXAxisOption(): XAXisOption {
    return {
      type: "category",
      data: this.data.labels,
      splitLine: {
        show: this.config.showXLine,
        lineStyle: { color: `var(--bases-table-border-color)`, type: "dotted" },
      },
      axisLabel: {
        color: `var(--text-muted)`,
        fontFamily: "var(--font-interface)",
        fontSize: `var(--font-ui-smaller)`,
      },
      axisLine: {
        show: this.config.showYLine,
        lineStyle: { color: `var(--bases-table-border-color)` },
      },
      axisPointer: {
        show: true,
        animation: false,
        type: "shadow",
        label: {
          backgroundColor: this.config.color || "var(--interactive-accent)",
          color: `var(--background-primary)`,
        },
        shadowStyle: {
          color: `var(--background-modifier-hover)`,
          opacity: 0.5,
        },
      },
    };
  }

  protected createYAxisOption(): YAXisOption {
    return {
      type: "value",
      min: this.config.yMin,
      max: this.config.yMax,
      axisLabel: {
        color: `var(--text-muted)`,
        fontFamily: "var(--font-interface)",
        fontSize: `var(--font-ui-smaller)`,
      },
      axisLine: {
        show: this.config.showXLine,
        lineStyle: { color: `var(--bases-table-border-color)` },
      },
      splitLine: {
        show: this.config.showYLine,
        lineStyle: { color: `var(--bases-table-border-color)`, type: "dotted" },
      },
    };
  }

  render(): EChartsType {
    const baseOption = this.getBaseOption();
    const seriesOption = this.createSeriesOption();

    this.chartInstance = echarts.init(this.containerEl, undefined, {
      renderer: "svg",
    });
    this.chartInstance.setOption({
      ...baseOption,
      series: [seriesOption],
    });

    return this.chartInstance;
  }

  dispose(): void {
    this.chartInstance?.dispose();
    this.chartInstance = null;
  }

  resize(): void {
    this.chartInstance?.resize();
  }

  getChartInstance(): EChartsType | null {
    return this.chartInstance;
  }
}

class BarChartRenderer extends BaseEChartsRenderer {
  createSeriesOption(): unknown {
    const configColor = this.config.color?.trim();
    const accentColor =
      configColor && configColor !== "" && configColor !== "undefined"
        ? configColor
        : "var(--interactive-accent)";

    return {
      data: this.data.values,
      type: "bar",
      animation: false,
      label: {
        show: this.config.showLabels,
        position: "top",
        color: `var(--text-muted)`,
        fontFamily: "var(--font-interface)",
        fontSize: `var(--font-ui-small)`,
        formatter: (params: { value: number }) => params.value,
        offset: [0, -4],
      },
      itemStyle: {
        color: accentColor,
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: `${this.config.barWidth || 15}%`,
      emphasis: {
        disabled: true,
      },
    };
  }
}

class LineChartRenderer extends BaseEChartsRenderer {
  createSeriesOption(): unknown {
    const configColor = this.config.color?.trim();
    const accentColor =
      configColor && configColor !== "" && configColor !== "undefined"
        ? configColor
        : "var(--interactive-accent)";

    return {
      data: this.data.values,
      type: "line",
      animation: false,
      smooth: this.config.lineSmooth || false,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: {
        color: accentColor,
        width: 2,
      },
      areaStyle: this.config.lineArea
        ? {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: accentColor,
                },
                {
                  offset: 1,
                  color: "rgba(0, 0, 0, 0)",
                },
              ],
            },
            opacity: 0.25,
          }
        : undefined,
      label: {
        show: this.config.showLabels,
        position: "top",
        color: `var(--text-muted)`,
        fontFamily: "var(--font-interface)",
        fontSize: `var(--font-ui-small)`,
        formatter: (params: { value: number }) => params.value,
        offset: [0, -8],
      },
      itemStyle: {
        color: accentColor,
        borderColor: accentColor,
        borderWidth: 2,
      },
      emphasis: {
        disabled: true,
        scale: false,
        focus: "none",
      },
    };
  }
}

class ChartRendererFactory {
  static createRenderer(
    containerEl: HTMLElement,
    data: ChartData,
    config: ChartConfig,
  ): BaseEChartsRenderer {
    const renderers: Record<
      ChartConfig["type"],
      new (
        container: HTMLElement,
        data: ChartData,
        config: ChartConfig,
      ) => BaseEChartsRenderer
    > = {
      bar: BarChartRenderer,
      line: LineChartRenderer,
    };

    const RendererClass = renderers[config.type];
    if (!RendererClass) {
      throw new Error(`Unsupported chart type: ${config.type}`);
    }

    return new RendererClass(containerEl, data, config);
  }
}

export abstract class BaseChartView extends BasesView {
  protected chartInstance: EChartsType | null = null;
  protected containerEl: HTMLElement;
  protected renderer: BaseEChartsRenderer | null = null;
  private resizeObserver: ResizeObserver | null = null;

  abstract getChartType(): "bar" | "line";
  abstract getAdditionalConfig(): Partial<ChartConfig>;

  constructor(controller: QueryController, parentEl: HTMLElement) {
    super(controller);
    this.containerEl = parentEl.createDiv();
    this.containerEl.style.width = "100%";
    this.containerEl.style.height = "100%";
    this.containerEl.style.position = "relative";
  }

  override onDataUpdated(): void {
    this.cleanup();

    const groupedData = this.data?.groupedData || [];
    if (groupedData.length === 0) return;

    const config = this.buildFullConfig();
    const extractedData = ChartDataExtractor.extract(
      this.data as QueryData,
      config,
    );

    if (extractedData.labels.length === 0) return;

    this.renderChart(extractedData, config);
  }

  private buildFullConfig(): ChartConfig {
    return {
      type: this.getChartType(),
      xProp: String(this.config?.get("xAxis")),
      yProp: String(this.config?.get("yAxis")),
      showLabels: this.config?.get("showLabels") === true,
      omitZero: this.config?.get("omitZero") === true,
      yMin: this.parseNumberConfig("yMin"),
      yMax: this.parseNumberConfig("yMax"),
      color: String(this.config?.get("color")),
      barWidth: this.parseNumberConfig("barWidth", 15),
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
      ...this.getAdditionalConfig(),
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
    const chartContainer = this.containerEl.createDiv();
    chartContainer.style.width = "100%";
    chartContainer.style.height = "100%";
    chartContainer.style.cursor = "pointer";

    this.renderer = ChartRendererFactory.createRenderer(
      chartContainer,
      data,
      config,
    );
    this.chartInstance = this.renderer.render();

    this.setupInteractions(chartContainer, data.filePaths);

    this.resizeObserver = new ResizeObserver(() => this.renderer?.resize());
    this.resizeObserver.observe(chartContainer);
  }

  private setupInteractions(container: HTMLElement, filePaths: string[]): void {
    const getIndexFromCoordinates = (
      clientX: number,
      clientY: number,
    ): number => {
      const rect = container.getBoundingClientRect();
      const mouseX = clientX - rect.left;

      // biome-ignore lint/suspicious/noExplicitAny: TODO: rewrite to public API
      const gridModel = (this.chartInstance as any)
        ?.getModel()
        .getComponent("grid");
      if (gridModel) {
        const gridRect = (
          gridModel as unknown as {
            coordinateSystem: {
              getRect(): {
                x: number;
                y: number;
                width: number;
                height: number;
              };
            };
          }
        ).coordinateSystem.getRect();
        if (mouseX >= gridRect.x && mouseX <= gridRect.x + gridRect.width) {
          const ratio = (mouseX - gridRect.x) / gridRect.width;
          const index = Math.floor(ratio * filePaths.length);
          return Math.min(Math.max(0, index), filePaths.length - 1);
        }
      }
      return -1;
    };

    container.addEventListener("mousemove", (e: MouseEvent) => {
      if (!this.chartInstance) return;
      const index = getIndexFromCoordinates(e.clientX, e.clientY);
      const cursorStyle =
        index !== -1 && filePaths[index] ? "pointer" : "default";
      this.chartInstance.getZr().setCursorStyle(cursorStyle);
    });

    container.addEventListener("click", (e: MouseEvent) => {
      if (e.button !== 0) return;
      const index = getIndexFromCoordinates(e.clientX, e.clientY);
      if (index !== -1 && filePaths[index]) {
        this.app.workspace.openLinkText(
          filePaths[index],
          "",
          e.ctrlKey || e.metaKey,
        );
      }
    });

    container.addEventListener("auxclick", (e: MouseEvent) => {
      if (e.button !== 0) return;
      const index = getIndexFromCoordinates(e.clientX, e.clientY);
      if (index !== -1 && filePaths[index]) {
        this.app.workspace.openLinkText(filePaths[index], "", true);
      }
    });

    container.addEventListener("contextmenu", (e: MouseEvent) => {
      e.preventDefault();
      const index = getIndexFromCoordinates(e.clientX, e.clientY);
      if (index === -1) return;

      const filePath = filePaths[index];
      if (!filePath) return;

      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (!(file instanceof TFile)) return;

      const menu = new Menu();
      this.app.workspace.trigger("file-menu", menu, file);
      menu.showAtMouseEvent(e);
    });
  }

  private cleanup(): void {
    this.renderer?.dispose();
    this.renderer = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.chartInstance = null;
    this.containerEl.empty();
  }

  async onClose() {
    this.cleanup();
  }
}

export class BarChartView extends BaseChartView {
  readonly type = BAR_VIEW_TYPE;

  static getOptions(): BasesAllOptions[] {
    return [
      {
        type: "group",
        displayName: "X axis",
        items: [
          {
            type: "property",
            displayName: "Property",
            placeholder: "Select category property",
            key: "xAxis",
          },
          {
            type: "toggle",
            displayName: "Show line",
            key: "showXLine",
            default: false,
          },
          {
            type: "toggle",
            displayName: "Omit zero values",
            key: "omitZero",
            default: false,
          },
        ],
      },
      {
        type: "group",
        displayName: "Y axis",
        items: [
          {
            type: "property",
            displayName: "Property",
            placeholder: "Select value property",
            key: "yAxis",
          },
          {
            type: "text",
            displayName: "Max",
            key: "yMax",
            default: "",
            placeholder: "auto",
          },
          {
            type: "text",
            displayName: "Min",
            key: "yMin",
            default: "",
            placeholder: "auto",
          },
          {
            type: "toggle",
            displayName: "Show line",
            key: "showYLine",
            default: true,
          },
        ],
      },
      {
        type: "group",
        displayName: "Style",
        items: [
          {
            type: "text",
            displayName: "Color",
            key: "color",
            placeholder: "var(--interactive-accent)",
          },
          {
            type: "toggle",
            displayName: "Show labels",
            key: "showLabels",
            default: false,
          },
          {
            type: "slider",
            displayName: "Bar width",
            min: 5,
            max: 95,
            step: 1,
            key: "barWidth",
            default: 15,
          },
        ],
      },
    ];
  }

  getChartType(): "bar" {
    return "bar";
  }

  getAdditionalConfig(): Partial<ChartConfig> {
    return {};
  }
}

export class LineChartView extends BaseChartView {
  readonly type = LINE_VIEW_TYPE;

  static getOptions(): BasesAllOptions[] {
    return [
      {
        type: "group",
        displayName: "X axis",
        items: [
          {
            type: "property",
            displayName: "Property",
            placeholder: "Select category property",
            key: "xAxis",
          },
          {
            type: "toggle",
            displayName: "Show line",
            key: "showXLine",
            default: false,
          },
          {
            type: "toggle",
            displayName: "Omit zero values",
            key: "omitZero",
            default: false,
          },
        ],
      },
      {
        type: "group",
        displayName: "Y axis",
        items: [
          {
            type: "property",
            displayName: "Property",
            placeholder: "Select value property",
            key: "yAxis",
          },
          {
            type: "text",
            displayName: "Max",
            key: "yMax",
            default: "",
            placeholder: "auto",
          },
          {
            type: "text",
            displayName: "Min",
            key: "yMin",
            default: "",
            placeholder: "auto",
          },
          {
            type: "toggle",
            displayName: "Show line",
            key: "showYLine",
            default: true,
          },
        ],
      },
      {
        type: "group",
        displayName: "Style",
        items: [
          {
            type: "text",
            displayName: "Color",
            key: "color",
            placeholder: "var(--interactive-accent)",
          },
          {
            type: "toggle",
            displayName: "Show labels",
            key: "showLabels",
            default: false,
          },
          {
            type: "toggle",
            displayName: "Smooth curve",
            key: "lineSmooth",
            default: false,
          },
          {
            type: "toggle",
            displayName: "Show area under line",
            key: "lineArea",
            default: false,
          },
        ],
      },
    ];
  }

  getChartType(): "line" {
    return "line";
  }

  getAdditionalConfig(): Partial<ChartConfig> {
    return {};
  }
}

export default class BasesChartsPlugin extends Plugin {
  async onload() {
    this.registerBasesView(BAR_VIEW_TYPE, {
      name: "Bar Chart",
      icon: "lucide-bar-chart-3",
      factory: (controller, containerEl) =>
        new BarChartView(controller, containerEl),
      options: BarChartView.getOptions,
    });

    this.registerBasesView(LINE_VIEW_TYPE, {
      name: "Line Chart",
      icon: "lucide-line-chart",
      factory: (controller, containerEl) =>
        new LineChartView(controller, containerEl),
      options: LineChartView.getOptions,
    });
  }
}
