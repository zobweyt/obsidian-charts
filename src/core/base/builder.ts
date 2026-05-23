import { EChartsOption } from "echarts";
import { BasesQueryResult, BasesViewConfig } from "obsidian";
import { OBSIDIAN_COLORS } from "./colors.ts";
import { animation, color, omitZero, showLegend } from "./options.ts";

export abstract class BaseChartBuilder {
  protected option: EChartsOption = {};
  protected readonly config: BasesViewConfig;
  protected readonly properties: BasesQueryResult["properties"];
  protected readonly data: BasesQueryResult["data"];

  constructor(result: BasesQueryResult, config: BasesViewConfig) {
    this.config = config;
    this.properties = result.properties;

    this.option.animation =
      (this.config.get(animation.key) ?? animation.default) as boolean;
    const omitZeroValue = this.config.get(omitZero.key) ?? omitZero.default;

    if (omitZeroValue) {
      this.data = result.data.filter((entry) => {
        return result.properties.some((property) => {
          const value = entry.getValue(property);
          return value?.isTruthy();
        });
      });
    } else {
      this.data = result.data;
    }
  }

  protected abstract setupCoordinateSystem(): void;
  protected abstract setupChart(): void;

  public build() {
    const configColor = (this.config.get(color.key) as string | undefined)
      ?.trim();

    if (configColor && configColor !== "" && configColor !== "undefined") {
      this.option.color = this.properties.map(() => configColor);
    } else if (this.properties.length === 1) {
      this.option.color = ["var(--interactive-accent)"];
    } else {
      this.option.color = this.properties.map(
        (_, i) => OBSIDIAN_COLORS[i % OBSIDIAN_COLORS.length],
      );
    }

    this.option.legend = {
      show: (this.config.get(showLegend.key) ?? showLegend.default) as boolean,
      textStyle: { color: "var(--text-muted)", fontFamily: "inherit" },
      pageTextStyle: { color: "var(--text-muted)" },
      icon: "circle",
      itemStyle: {
        borderWidth: 0,
      },
      itemGap: 48,
      itemWidth: 12,
      itemHeight: 12,
      padding: 0,
      bottom: 12,
      orient: "horizontal",
    };

    this.option.tooltip = {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        animation:
          (this.config.get(animation.key) ?? animation.default) as boolean,
      },
      backgroundColor: "var(--background-modifier-message)",
      borderWidth: 0,
      borderRadius: 6,
      padding: [6, 10],
      hideDelay: 0,
      // TODO: try to use native tooltip
      // className: "tooltip",
      extraCssText:
        "box-shadow: 0 2px 8px var(--background-modifier-box-shadow);",
      transitionDuration: 0,
      formatter: (params: unknown) => {
        const items = Array.isArray(params)
          ? (params as Record<string, unknown>[])
          : [params as Record<string, unknown>];

        const firstItem = items[0];
        const axisValue = firstItem && "axisValue" in firstItem
          ? String(firstItem.axisValue)
          : "";

        let html =
          `<div style="display: flex; font-family: var(--font-interface); flex-direction: column; justify-content: space-between; gap: 4px;"><div style="font-size: var(--font-ui-small); color: #FAFAFA; font-weight: 500;">${axisValue}</div></div>`;

        for (const item of items) {
          if (!item) continue;

          const value = "value" in item ? item.value : undefined;
          const color = "color" in item ? item.color : undefined;
          const seriesName = "seriesName" in item
            ? String(item.seriesName ?? "")
            : "";

          const displayValue = value === "null" || value === undefined
            ? 0
            : value;

          html += `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 12px; height: 12px; border-radius: 9999px; background-color: ${color};"></div>
                <span style="font-size: var(--font-ui-small); font-family: var(--font-interface); color: #969696">${seriesName}</span>
              </div>
              <span style="font-size: var(--font-ui-small); font-family: var(--font-interface); color: #FAFAFA; font-variant-numeric: tabular-nums;">
                ${String(displayValue)}
              </span>
            </div>`;
        }
        return html;
      },
    };

    this.setupCoordinateSystem();
    this.setupChart();

    return this.option;
  }
}
