import * as echarts from "echarts";
import {
  EChartsOption,
  SeriesOption,
  TooltipOption,
  XAXisOption,
  YAXisOption,
} from "echarts/types/dist/shared";

export const CHART_COLORS = [
  "var(--color-blue)",
  "var(--color-green)",
  "var(--color-red)",
  "var(--color-pink)",
  "var(--color-orange)",
  "var(--color-cyan)",
  "var(--color-purple)",
  "var(--color-yellow)",
];

export interface ChartData {
  labels: string[];
  values: number[][];
  filePaths: string[];
  seriesNames: string[];
}

export interface ChartConfig {
  xProp?: string;
  showLabels: boolean;
  omitZero: boolean;
  yMin?: number;
  yMax?: number;
  color?: string;
  barWidth?: number;
  lineWidth?: number;
  lineSmooth?: boolean;
  lineArea?: boolean;
  showXLine: boolean;
  showYLine: boolean;
  showLegend: boolean;
  showXAxisLabel: boolean;
  showYAxisLabel: boolean;
  pieDonut: boolean;
}

export abstract class ChartRenderer {
  protected chartInstance: echarts.ECharts | null = null;
  protected containerEl: HTMLElement;
  protected data: ChartData;
  protected config: ChartConfig;

  constructor(containerEl: HTMLElement, data: ChartData, config: ChartConfig) {
    this.containerEl = containerEl;
    this.data = data;
    this.config = config;
  }

  protected createSeriesOptions(): SeriesOption[] {
    const colors = this.getColors();
    return this.data.seriesNames.map((name, index) =>
      this.createSingleSeries(name, index, colors[index])
    );
  }

  protected abstract createSingleSeries(
    name: string,
    index: number,
    color: string,
  ): SeriesOption;

  private getColors(): string[] {
    const configColor = this.config.color?.trim();

    if (configColor && configColor !== "" && configColor !== "undefined") {
      return this.data.seriesNames.map(() => configColor);
    }

    if (this.data.seriesNames.length === 1) {
      return ["var(--interactive-accent)"];
    }

    return this.data.seriesNames.map(
      (_, i) => CHART_COLORS[i % CHART_COLORS.length],
    );
  }

  protected getBaseOption(): Partial<EChartsOption> {
    return {
      backgroundColor: "transparent",
      animation: false,
      legend: {
        show: this.config.showLegend,
        textStyle: {
          color: `var(--text-muted)`,
          fontFamily: "inherit",
        },
        pageTextStyle: {
          color: `var(--text-muted)`,
        },
        type: "scroll",
        itemGap: 48,
        itemWidth: 12,
        itemHeight: 12,
        borderRadius: 2,
        padding: 0,
        bottom: 0,
        orient: "horizontal",
      },
      tooltip: this.createTooltipOption(),
      grid: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30,
        backgroundColor: "transparent",
        containLabel: true,
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

        let html =
          `<div style="display: flex; font-family: var(--font-interface); flex-direction: column; justify-content: space-between; gap: 4px;"><div style="font-size: var(--font-ui-small); color: #FAFAFA;">${xValue}</div></div>`;

        for (const item of paramsArray) {
          html += `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; border-radius: 2px; background-color: ${item.color};"></div>
                <span style="font-size: var(--font-ui-small); font-family: var(--font-interface); color: #969696">
                  ${item.seriesName}
                </span>
              </div>
              <span style="font-size: var(--font-ui-small); font-family: var(--font-interface); color: #FAFAFA; font-variant-numeric: tabular-nums;">${item.value}</span>
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
        fontFamily: "inherit",
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
        fontFamily: "inherit",
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

  render() {
    const baseOption = this.getBaseOption();
    const seriesOptions = this.createSeriesOptions();

    const width = this.containerEl.clientWidth || undefined;
    const height = this.containerEl.clientHeight || 320;

    this.chartInstance = echarts.init(this.containerEl, undefined, {
      renderer: "svg",
      width: width,
      height: height,
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
}
