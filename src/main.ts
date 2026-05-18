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
  type BasesPropertyId,
  BasesView,
  Menu,
  Plugin,
  type QueryController,
  TFile,
} from "obsidian";
import { initLocale, t } from "./i18n";

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

const CHART_COLORS = [
  "var(--color-blue)",
  "var(--color-green)",
  "var(--color-red)",
  "var(--color-pink)",
  "var(--color-orange)",
  "var(--color-cyan)",
  "var(--color-purple)",
  "var(--color-yellow)",
];

interface ChartData {
  labels: string[];
  values: number[][];
  filePaths: string[];
  seriesNames: string[];
}

interface ChartConfig {
  type: "bar" | "line";
  xProp?: string;
  showLabels: boolean;
  omitZero: boolean;
  yMin?: number;
  yMax?: number;
  barWidth?: number;
  lineWidth?: number;
  color?: string;
  lineSmooth?: boolean;
  lineArea?: boolean;
  showXLine: boolean;
  showYLine: boolean;
  showXAxisLabel: boolean;
  showYAxisLabel: boolean;
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
  properties?: BasesPropertyId[];
}

class ChartDataExtractor {
  static extract(
    data: QueryData,
    config: ChartConfig,
    getDisplayName?: (id: string) => string,
  ): ChartData {
    const groupedData = data?.groupedData || [];
    const labels: string[] = [];
    const filePaths: string[] = [];

    const seriesNames = data?.properties || [];
    const values: number[][] = seriesNames.map(() => []);

    const displayNames = getDisplayName
      ? seriesNames.map((name) => getDisplayName(name))
      : seriesNames.map((name) =>
          name.replace(/^(note\.|formula\.|file\.)/, ""),
        );

    for (const group of groupedData) {
      for (const entry of group.entries) {
        let xVal = entry.file?.name || "";

        if (config.xProp && config.xProp !== "file.name") {
          const xObj = entry.getValue(String(config.xProp));
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

  abstract createSeriesOptions(): unknown[];

  protected getBaseOption(): Partial<EChartsOption> {
    return {
      backgroundColor: "transparent",
      animation: false,
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

  protected cleanPropertyName(propertyId: string): string {
    return propertyId.replace(/^(note\.|formula\.|file\.)/, "");
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
      borderRadius: 6,
      padding: [6, 10],
      extraCssText:
        "box-shadow: 0 2px 8px var(--background-modifier-box-shadow);",
      transitionDuration: 0,
      formatter: (params) => {
        const paramsArray = params as unknown as Array<{
          seriesName: string;
          value: number;
          color: string;
          axisValue: string;
        }>;
        const xValue = paramsArray[0]?.axisValue || "";

        if (!paramsArray || paramsArray.length === 0) return "";

        let html = `<div style="display: flex; flex-directon: column; align-items: center; justify-content: space-between; gap: 4px;"><div style="font-size: var(--font-ui-small); color: #FAFAFA;">${xValue}</div></div>`;

        for (const item of paramsArray) {
          html += `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 2px; background-color: ${item.color};"></div>
                <span style="font-size: var(--font-ui-small); color: #969696">${this.cleanPropertyName(item.seriesName)}</span>
              </div>
              <span style="font-size: var(--font-ui-small); color: #FAFAFA; font-variant-numeric: tabular-nums;">${item.value}</span>
            </div>
          `;
        }

        return html;
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
        show: this.config.showXAxisLabel,
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
          backgroundColor: this.config.color || CHART_COLORS[0],
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
        show: this.config.showYAxisLabel,
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
    const seriesOptions = this.createSeriesOptions();

    this.chartInstance = echarts.init(this.containerEl, undefined, {
      renderer: "svg",
    });
    this.chartInstance.setOption({
      ...baseOption,
      series: seriesOptions,
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
  createSeriesOptions(): unknown[] {
    const configColor = this.config.color?.trim();

    let colors: string[];

    if (configColor && configColor !== "" && configColor !== "undefined") {
      colors = this.data.seriesNames.map(() => configColor);
    } else if (this.data.seriesNames.length === 1) {
      colors = ["var(--interactive-accent)"];
    } else {
      colors = this.data.seriesNames.map(
        (_, i) => CHART_COLORS[i % CHART_COLORS.length],
      );
    }

    return this.data.seriesNames.map((name, index) => ({
      name: name,
      data: this.data.values[index],
      type: "bar",
      stack: "total",
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
        color: colors[index],
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: `${this.config.barWidth || 15}%`,
      emphasis: {
        disabled: true,
      },
    }));
  }
}

class LineChartRenderer extends BaseEChartsRenderer {
  createSeriesOptions(): unknown[] {
    const configColor = this.config.color?.trim();

    let colors: string[];

    if (configColor && configColor !== "" && configColor !== "undefined") {
      colors = this.data.seriesNames.map(() => configColor);
    } else if (this.data.seriesNames.length === 1) {
      colors = ["var(--interactive-accent)"];
    } else {
      colors = this.data.seriesNames.map(
        (_, i) => CHART_COLORS[i % CHART_COLORS.length],
      );
    }

    return this.data.seriesNames.map((name, index) => ({
      name: name,
      data: this.data.values[index],
      type: "line",
      animation: false,
      smooth: this.config.lineSmooth || false,
      symbol: "circle",
      symbolSize: 6 * (this.config?.lineWidth ?? 1),
      lineStyle: {
        color: colors[index],
        width: this.config.lineWidth,
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
                  color: colors[index],
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
        color: colors[index],
        borderColor: colors[index],
        borderWidth: 1,
      },
      emphasis: {
        disabled: true,
        scale: false,
        focus: "none",
      },
    }));
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
      {
        groupedData: this.data.groupedData,
        properties: this.data.properties,
      },
      config,
      (id) =>
        this.config?.getDisplayName(id as BasesPropertyId) ||
        id.replace(/^(note\.|formula\.|file\.)/, ""),
    );

    if (
      extractedData.labels.length === 0 ||
      extractedData.seriesNames.length === 0
    )
      return;

    this.renderChart(extractedData, config);
  }

  private buildFullConfig(): ChartConfig {
    return {
      type: this.getChartType(),
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

      // biome-ignore lint/suspicious/noExplicitAny: TODO: use public API
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
        displayName: t("x_axis_group"),
        items: [
          {
            type: "property",
            displayName: t("property_label"),
            placeholder: t("property_placeholder_category"),
            key: "xAxis",
            default: "file.name",
          },
          {
            type: "toggle",
            displayName: t("show_line_label"),
            key: "showXLine",
            default: false,
          },
          {
            type: "toggle",
            displayName: t("show_labels_label"),
            key: "showXLabels",
            default: true,
          },
          {
            type: "toggle",
            displayName: t("omit_zero_values_label"),
            key: "omitZero",
            default: false,
          },
        ],
      },
      {
        type: "group",
        displayName: t("y_axis_group"),
        items: [
          {
            type: "text",
            displayName: t("max_label"),
            key: "yMax",
            default: "",
            placeholder: t("auto_placeholder"),
          },
          {
            type: "text",
            displayName: t("min_label"),
            key: "yMin",
            default: "",
            placeholder: t("auto_placeholder"),
          },
          {
            type: "toggle",
            displayName: t("show_line_label"),
            key: "showYLine",
            default: true,
          },
          {
            type: "toggle",
            displayName: t("show_labels_label"),
            key: "showYLabels",
            default: true,
          },
        ],
      },
      {
        type: "group",
        displayName: t("style_group"),
        items: [
          {
            type: "text",
            displayName: t("color_label"),
            key: "color",
            placeholder: "var(--interactive-accent)",
          },
          {
            type: "toggle",
            displayName: t("show_labels_label"),
            key: "showLabels",
            default: false,
          },
          {
            type: "slider",
            displayName: t("bar_width_label"),
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
        displayName: t("x_axis_group"),
        items: [
          {
            type: "property",
            displayName: t("property_label"),
            placeholder: t("property_placeholder_category"),
            key: "xAxis",
            default: "file.name",
          },
          {
            type: "toggle",
            displayName: t("show_line_label"),
            key: "showXLine",
            default: false,
          },
          {
            type: "toggle",
            displayName: t("show_labels_label"),
            key: "showXLabels",
            default: true,
          },
          {
            type: "toggle",
            displayName: t("omit_zero_values_label"),
            key: "omitZero",
            default: false,
          },
        ],
      },
      {
        type: "group",
        displayName: t("y_axis_group"),
        items: [
          {
            type: "text",
            displayName: t("max_label"),
            key: "yMax",
            default: "",
            placeholder: t("auto_placeholder"),
          },
          {
            type: "text",
            displayName: t("min_label"),
            key: "yMin",
            default: "",
            placeholder: t("auto_placeholder"),
          },
          {
            type: "toggle",
            displayName: t("show_line_label"),
            key: "showYLine",
            default: true,
          },
          {
            type: "toggle",
            displayName: t("show_labels_label"),
            key: "showYLabels",
            default: true,
          },
        ],
      },
      {
        type: "group",
        displayName: t("style_group"),
        items: [
          {
            type: "text",
            displayName: t("color_label"),
            key: "color",
            placeholder: "var(--interactive-accent)",
          },
          {
            type: "toggle",
            displayName: t("show_labels_label"),
            key: "showLabels",
            default: false,
          },
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
    await initLocale();

    this.registerBasesView(BAR_VIEW_TYPE, {
      name: t("bar_chart_name"),
      icon: "lucide-bar-chart-3",
      factory: (controller, containerEl) =>
        new BarChartView(controller, containerEl),
      options: BarChartView.getOptions,
    });

    this.registerBasesView(LINE_VIEW_TYPE, {
      name: t("line_chart_name"),
      icon: "lucide-line-chart",
      factory: (controller, containerEl) =>
        new LineChartView(controller, containerEl),
      options: LineChartView.getOptions,
    });
  }
}
