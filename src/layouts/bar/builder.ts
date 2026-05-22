import { showLabels } from "../../core/base/index.ts";
import { CartesianChartBuilder } from "../../core/cartesian/index.ts";
import { barWidth } from "./options.ts";

export class BarChartBuilder extends CartesianChartBuilder {
  protected override setupChart() {
    const barWidthOption =
      (this.config.get(barWidth.key) || barWidth.default) as number;
    const barWidthValue = `${barWidthOption}%`;

    this.option.series = this.properties.map((property, index) => ({
      name: this.config.getDisplayName(property),
      data: this.data.map((entry) => entry.getValue(property)?.toString()),
      type: "bar",
      markLine: index === 0 ? this.getReferenceLineOption() : undefined,
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
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: barWidthValue,
      emphasis: {
        disabled: true,
      },
    }));
  }
}
