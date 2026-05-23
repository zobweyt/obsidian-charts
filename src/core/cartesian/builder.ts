import { BasesPropertyId } from "obsidian";
import { BaseChartBuilder } from "../base/builder.ts";
import {
  referenceLineColor,
  referenceLineName,
  referenceLineStyle,
  referenceLineValue,
  referenceLineWidth,
  rotateXLabels,
  showXLabels,
  showXLine,
  showYLabels,
  showYLine,
  xAxis,
  yMax,
  yMin,
} from "./options.ts";
import { LineSeriesOption } from "echarts";

export abstract class CartesianChartBuilder extends BaseChartBuilder {
  protected setupCoordinateSystem() {
    this.option.grid = {
      top: 30,
      bottom: 30,
      left: 30,
      right: 30,
      containLabel: true,
      show: true,
      borderWidth: 0,
    };

    const rotationValue =
      (this.config.get(rotateXLabels.key) ?? rotateXLabels.default) as number;

    const xAxisProp =
      (this.config.get(xAxis.key) ?? xAxis.default) as BasesPropertyId;
    this.option.xAxis = {
      type: "category",
      data: this.data.map((entry) =>
        entry.getValue(xAxisProp)?.toString() ?? ""
      ),
      axisPointer: {
        show: true,
        type: "shadow",
        shadowStyle: {
          color: "var(--background-modifier-hover)",
          opacity: 0.5,
        },
      },
      axisLabel: {
        show:
          (this.config.get(showXLabels.key) ?? showXLabels.default) as boolean,
        color: "var(--text-muted)",
        fontFamily: "inherit",
        fontSize: "var(--font-ui-smaller)",
        rotate: rotationValue,
        hideOverlap: true,
      },
      axisLine: {
        show: (this.config.get(showYLine.key) ?? showYLine.default) as boolean,
        lineStyle: { color: "var(--bases-table-border-color)" },
      },
      splitLine: {
        show: (this.config.get(showXLine.key) ?? showXLine.default) as boolean,
        lineStyle: { color: "var(--bases-table-border-color)", type: "dotted" },
      },
    };

    this.option.yAxis = {
      type: "value",
      min: this.config.get(yMin.key) as number | undefined,
      max: this.config.get(yMax.key) as number | undefined,
      axisLabel: {
        show:
          (this.config.get(showYLabels.key) ?? showYLabels.default) as boolean,
        color: "var(--text-muted)",
        fontFamily: "inherit",
        fontSize: "var(--font-ui-smaller)",
      },
      axisLine: {
        show: (this.config.get(showXLine.key) ?? showXLine.default) as boolean,
        lineStyle: { color: "var(--bases-table-border-color)" },
      },
      splitLine: {
        show: (this.config.get(showYLine.key) ?? showYLine.default) as boolean,
        lineStyle: { color: "var(--bases-table-border-color)", type: "dotted" },
      },
    };
  }

  protected getReferenceLineOption(): LineSeriesOption["markLine"] {
    const rawValue = this.config.get(referenceLineValue.key);

    if (rawValue === undefined || rawValue === null || rawValue === "") {
      return undefined;
    }

    const value = Number(rawValue);
    if (isNaN(value)) return undefined;
    const name = this.config.get(referenceLineName.key) as string;

    const width = (this.config.get(referenceLineWidth.key) ||
      referenceLineWidth.default) as number;

    const color = (this.config.get(referenceLineColor.key) ||
      "var(--text-error)") as string;
    const style =
      (this.config.get(referenceLineStyle.key) ?? referenceLineStyle.default) as
        | "solid"
        | "dashed"
        | "dotted";

    return {
      symbol: "none",
      silent: true,
      data: [
        {
          yAxis: value,
          lineStyle: {
            color: color,
            type: style,
            width: width,
          },
          label: {
            show: true,
            position: name ? "insideStartTop" : "end",
            formatter: name || `${value}`,
            color: color,
            fontSize: "var(--font-ui-smaller)",
          },
        },
      ],
    };
  }
}
