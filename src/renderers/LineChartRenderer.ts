import { SeriesOption } from "echarts/types/dist/shared";
import { ChartRenderer } from "./ChartRenderer.ts";

export class LineChartRenderer extends ChartRenderer {
  protected override createSingleSeries(
    name: string,
    index: number,
    color: string,
  ): SeriesOption {
    return {
      name: name,
      data: this.data.values[index],
      type: "line",
      animation: false,
      smooth: this.config.lineSmooth || false,
      symbol: "circle",
      symbolSize: 6 * (this.config?.lineWidth ?? 1),
      lineStyle: {
        color: color,
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
                color: color,
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
        fontFamily: "inherit",
        fontSize: `var(--font-ui-small)`,
        formatter: (params) => params.value?.toString() ?? "",
        offset: [0, -4],
      },
      itemStyle: {
        color: color,
        borderColor: color,
        borderWidth: 1,
      },
      emphasis: {
        disabled: true,
        scale: false,
        focus: "none",
      },
    };
  }
}
