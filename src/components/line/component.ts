import type { ChartContext } from "../chart/context.ts";
import {
  LINE_AREA_OPTION,
  LINE_SMOOTH_OPTION,
  LINE_WIDTH_OPTION,
} from "../chart/options.ts";
import { resolveColor } from "../chart/svg.ts";
import {
  computePoints,
  renderArea,
  renderLabels,
  renderLinePath,
  renderPoints,
} from "./render.ts";

export class Line {
  constructor(private chart: ChartContext) {}

  render(parent: SVGGElement, clipPathId: string) {
    const lineWidth = (this.chart.config.get(LINE_WIDTH_OPTION.key) ||
      LINE_WIDTH_OPTION.default) as number;
    const smooth = ((this.chart.config.get(LINE_SMOOTH_OPTION.key) ||
      LINE_SMOOTH_OPTION.default) as string) === "smooth";
    const area = (this.chart.config.get(LINE_AREA_OPTION.key) ||
      LINE_AREA_OPTION.default) as string;

    this.chart.values.forEach(
      (values: (number | null)[], seriesIndex: number) => {
        const color = this.chart.colors[seriesIndex];
        const resolvedColor = resolveColor(this.chart.container, color);
        const points = computePoints(this.chart, values);
        const clip = createSvg("g", {
          attr: { "clip-path": `url(#${clipPathId})` },
        });

        if (area !== "none") {
          renderArea(
            clip,
            points,
            smooth,
            this.chart.baseline,
            resolvedColor,
            area,
          );
        }

        renderLinePath(
          clip,
          points,
          smooth,
          this.chart.baseline,
          color,
          lineWidth,
        );

        if (this.chart.showLabels) {
          renderLabels(clip, points, values);
        }

        renderPoints(clip, points, values, lineWidth, color);

        parent.appendChild(clip);
      },
    );
  }
}
