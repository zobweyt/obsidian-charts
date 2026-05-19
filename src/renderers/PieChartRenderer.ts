import type {
  SeriesOption,
  XAXisOption,
  YAXisOption,
} from "echarts/types/dist/shared";
import { ChartRenderer } from "./ChartRenderer";

export class PieChartRenderer extends ChartRenderer {
  protected createXAxisOption(): XAXisOption {
    return { show: false };
  }

  protected createYAxisOption(): YAXisOption {
    return { show: false };
  }

  protected createSingleSeries(
    name: string,
    index: number,
    _color: string,
  ): SeriesOption {
    const pieData = this.data.labels.map((label, i) => ({
      value: this.data.values[index]?.[i] ?? 0,
      name: this.cleanPropertyName(label),
    }));

    return {
      name: this.cleanPropertyName(name),
      type: "pie",
      radius: this.config.pieDonut ? ["40%", "70%"] : "70%",
      center: ["50%", "50%"],
      animation: false,
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
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowColor: "transparent",
        },
      },
    };
  }
}
