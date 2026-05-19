import { SeriesOption } from "echarts/types/dist/shared";
import { ChartRenderer } from "./ChartRenderer.ts";

export class BarChartRenderer extends ChartRenderer {
  protected override createSingleSeries(
    name: string,
    index: number,
    color: string,
  ): SeriesOption {
    const isLast = index === this.data.seriesNames.length - 1;

    return {
      name: name,
      data: this.data.values[index],
      type: "bar",
      stack: "total",
      animation: false,
      label: {
        show: isLast ? this.config.showLabels : false,
        position: "top",
        color: `var(--text-muted)`,
        fontFamily: "inherit",
        fontSize: `var(--font-ui-small)`,
        formatter: (params) => params.value?.toString() ?? "",
        offset: [0, -4],
      },
      itemStyle: {
        color: color,
        borderRadius: isLast ? [4, 4, 0, 0] : [0, 0, 0, 0],
      },
      barWidth: `${this.config.barWidth || 15}%`,
      emphasis: {
        disabled: true,
      },
    };
  }
}
