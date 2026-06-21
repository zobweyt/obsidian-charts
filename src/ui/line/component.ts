import { ChartContext } from "../chart/context.ts";
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
  segmentsFromPoints,
} from "./render.ts";
import { Point } from "../../lib/point.ts";

export class Line {
  constructor(private chart: ChartContext) {}

  render(parent: SVGGElement, clipPathId: string) {
    const lineWidth = (this.chart.config.get(LINE_WIDTH_OPTION.key) ||
      LINE_WIDTH_OPTION.default) as number;
    const curve = (this.chart.config.get(LINE_SMOOTH_OPTION.key) ||
      LINE_SMOOTH_OPTION.default) as string;
    const area = (this.chart.config.get(LINE_AREA_OPTION.key) ||
      LINE_AREA_OPTION.default) as string;

    this.chart.values.forEach(
      (values, seriesIndex) => {
        if (values.every((v) => v === null)) return;
        const color = this.chart.colors[seriesIndex];
        const resolvedColor = resolveColor(this.chart.container, color);
        const points = computePoints(
          this.chart,
          values,
          this.chart.connectZeros,
        );
        const clip = createSvg("g", {
          attr: { "clip-path": `url(#${clipPathId})` },
        });

        const renderSegments: Point[][] = this.chart.connectZeros
          ? [points.filter((p): p is Point => p !== null)]
          : segmentsFromPoints(points);

        let segmentIndex = 0;
        for (const segment of renderSegments) {
          if (segment.length < 2) continue;
          if (area !== "none") {
            renderArea(
              clip,
              this.chart.svg,
              segment,
              curve,
              this.chart.baseline,
              resolvedColor,
              area,
              seriesIndex,
              segmentIndex,
            );
          }

          renderLinePath(
            clip,
            segment,
            curve,
            this.chart.baseline,
            color,
            lineWidth,
          );
          segmentIndex++;
        }

        if (this.chart.showLabels) {
          renderLabels(clip, points, values, lineWidth);
        }

        if (this.chart.showPoints) {
          renderPoints(clip, points, values, lineWidth, color);
        }

        parent.appendChild(clip);
      },
    );
  }
}
