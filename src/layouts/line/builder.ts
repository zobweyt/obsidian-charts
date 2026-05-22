import { showLabels } from "../../core/base/index.ts";
import { CartesianChartBuilder } from "../../core/cartesian/index.ts";
import { lineArea, lineSmooth, lineWidth } from "./options.ts";

export class LineChartBuilder extends CartesianChartBuilder {
  protected override setupChart() {
    const lineWidthValue =
      (this.config.get(lineWidth.key) || lineWidth.default) as number;
    const showArea =
      (this.config.get(lineArea.key) ?? lineArea.default) as boolean;

    this.option.series = this.properties.map((property, index) => ({
      name: this.config.getDisplayName(property),
      data: this.data.map((entry) => entry.getValue(property)?.toString()),
      type: "line",
      smooth:
        (this.config.get(lineSmooth.key) ?? lineSmooth.default) as boolean,
      symbol: "circle",
      symbolSize: 6 * lineWidthValue,
      lineStyle: {
        width: lineWidthValue,
      },
      markLine: index === 0 ? this.getReferenceLineOption() : undefined,
      areaStyle: showArea
        ? {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: (this.option.color as string[])[index] },
              { offset: 1, color: "rgba(0, 0, 0, 0)" },
            ],
          },
          opacity: 0.25,
        }
        : undefined,
      label: {
        show:
          (this.config.get(showLabels.key) ?? showLabels.default) as boolean,
        position: "top",
        color: "var(--text-muted)",
        fontFamily: "inherit",
        fontSize: "var(--font-ui-small)",
        offset: [0, -4],
        formatter: (params) => params.value?.toString() ?? "",
      },
      itemStyle: {
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
