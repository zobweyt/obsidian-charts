import type { ChartContext } from "../chart/context.ts";
import { BAR_WIDTH_OPTION } from "../chart/options.ts";
import {
  createBarLabel,
  createBarPath,
  GAP,
  MIN_LABEL_HEIGHT,
} from "./render.ts";

export class Bar {
  constructor(private chart: ChartContext) {}

  render(group: SVGGElement, clipPathId: string) {
    const clip = createSvg("g", {
      attr: { "clip-path": `url(#${clipPathId})` },
    });
    const perBar = this.chart.groupWidth /
      Math.max(this.chart.values.length, 1);
    const barWidth = perBar *
      ((this.chart.config.get(BAR_WIDTH_OPTION.key) ||
        BAR_WIDTH_OPTION.default) as number) /
      100;
    const step = barWidth + GAP;
    const contentWidth = step * this.chart.values.length - GAP;

    this.chart.values.forEach(
      (values: (number | null)[], seriesIndex: number) => {
        const color = this.chart.colors[seriesIndex];
        values.forEach((value: number | null, index: number) => {
          if (value === null) return;
          const barHeight = ((value - this.chart.minValue) /
            this.chart.valueRange) * this.chart.plotHeight;
          const barX = this.chart.padding.left +
            this.chart.groupWidth * (index + 0.5) - contentWidth / 2 +
            seriesIndex * step;
          const barY = this.chart.baseline - barHeight;
          const bar = createSvg("path", {
            attr: {
              d: createBarPath(barX, barY, barWidth, barHeight),
              fill: color,
            },
          });
          bar.style.pointerEvents = "none";
          bar.dataset.index = index.toString();
          clip.appendChild(bar);
          if (this.chart.showLabels && barHeight > MIN_LABEL_HEIGHT) {
            createBarLabel(clip, barX, barY, barWidth, value);
          }
        });
      },
    );
    group.appendChild(clip);
  }
}
