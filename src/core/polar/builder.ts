import { BaseChartBuilder } from "../base/builder.ts";
import { OBSIDIAN_COLORS } from "../base/colors.ts";
import { color } from "../base/options.ts";

export abstract class PolarChartBuilder extends BaseChartBuilder {
  protected setupCoordinateSystem() {
    const configColor = (this.config.get(color.key) as string | undefined)
      ?.trim();

    if (configColor && configColor !== "" && configColor !== "undefined") {
      this.option.color = configColor;
    } else {
      this.option.color = OBSIDIAN_COLORS;
    }

    this.option.tooltip = {
      ...this.option.tooltip,
      trigger: "item",
    };
  }
}
