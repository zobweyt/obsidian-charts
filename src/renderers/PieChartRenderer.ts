import {
  SeriesOption,
  XAXisOption,
  YAXisOption,
} from "echarts/types/dist/shared";
import { CHART_COLORS, ChartRenderer } from "./ChartRenderer.ts";

export class PieChartRenderer extends ChartRenderer {
  protected override createXAxisOption(): XAXisOption {
    return { show: false };
  }

  protected override createYAxisOption(): YAXisOption {
    return { show: false };
  }

  protected override createSingleSeries(
    name: string,
    index: number,
    _: string,
  ): SeriesOption {
    const pieData = this.data.labels.map((label, i) => ({
      value: this.data.values[index]?.[i] ?? 0,
      name: label,
    }));

    return {
      name,
      type: "pie",
      radius: this.config.pieDonut ? ["40%", "70%"] : "70%",
      center: ["50%", "50%"],
      animation: false,
      color: CHART_COLORS,
      data: pieData,
      label: {
        show: this.config.showLabels,
        position: "outside",
        color: `var(--text-muted)`,
        fontFamily: "inherit",
        fontSize: `var(--font-ui-small)`,
        formatter: (params) =>
          `${params.name}: ${params.value?.toString() ?? ""}`,
      },
      emphasis: {
        scale: false,
        itemStyle: {
          color: "inherit",
          opacity: 0.8,
        },
      },
    };
  }
}
