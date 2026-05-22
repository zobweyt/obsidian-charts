import { showLabels } from "../../core/base/index.ts";
import { PolarChartBuilder } from "../../core/polar/index.ts";
import { pieHoleRadius } from "./options.ts";

export class PieChartBuilder extends PolarChartBuilder {
  protected override setupChart() {
    const holeRadius =
      (this.config.get(pieHoleRadius.key) ?? pieHoleRadius.default) as number;

    this.option.series = this.properties.map((property, i) => {
      const name = this.config.getDisplayName(property);
      const pieData = this.data.map((entry) => ({
        name: entry.file.basename,
        value: Number.parseFloat(String(entry.getValue(property))) || 0,
      }));

      const step = (70 - holeRadius) / this.properties.length;
      const outer = 70 - i * step;
      const inner = outer - step +
        (holeRadius * (1 - i / this.properties.length));

      const radius = holeRadius === 0 && i === 0
        ? `${outer}%`
        : [`${inner}%`, `${outer}%`];

      return {
        name,
        type: "pie",
        radius,
        center: ["50%", "50%"],
        data: pieData,
        label: {
          show: i === 0 && this.properties.length > 1
            ? false
            : (this.config.get(showLabels.key) ??
              showLabels.default) as boolean,
          position: "outside",
          color: "var(--text-muted)",
          fontFamily: "inherit",
          fontSize: "var(--font-ui-small)",
          formatter: (params) =>
            `${String(params.name ?? "")}: ${params.value?.toString() ?? ""}`,
        },
        emphasis: {
          scale: false,
          itemStyle: {
            color: "inherit",
            opacity: 0.8,
          },
        },
      };
    });
  }
}
