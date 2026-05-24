import { ChartRendererOptions } from "../../core/base/index.ts";
import { CartesianChartRenderer } from "../../core/cartesian/index.ts";
import { BAR_WIDTH_OPTION } from "./options.ts";

export class BarChartRenderer extends CartesianChartRenderer {
  private barWidth: number;

  constructor(options: ChartRendererOptions) {
    super(options);
    this.barWidth = options.config.get(BAR_WIDTH_OPTION.key) as number ||
      BAR_WIDTH_OPTION.default;
  }

  render() {
    this.beginRender();
    this.computeCartesianLayout();

    const clipId = this.createChartClipPath();
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.renderYGridLines(group);

    if (this.showXLine) {
      for (let i = 0; i <= this.count; i++) {
        const x = this.padding.left + (this.groupWidth * i);
        this.createGridLine(
          group,
          x,
          this.padding.top,
          x,
          this.chartBottom,
          this.xLineWidth,
          this.xLineStyle,
        );
      }
    }

    this.renderYAxisLabels(this.svg);
    this.renderShadowRects(this.svg);
    this.renderBars(group, clipId);
    this.renderReferenceLine(group);
    this.svg.appendChild(group);
    this.renderXAxisLabels(this.svg);
    this.renderHitAreas(this.svg);
    this.finishRender();
  }

  private renderBars(group: SVGGElement, clipId: string) {
    const clipGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    clipGroup.setAttribute("clip-path", `url(#${clipId})`);
    const perBar = this.groupWidth / Math.max(this.values.length, 1);
    const seriesCount = this.values.length;
    const gap = 6;
    const barPixelWidth = perBar * (this.barWidth / 100);
    const step = barPixelWidth + gap;
    const clusterWidth = step * seriesCount;

    this.values.forEach((seriesValues, seriesIndex) => {
      const color = this.colors[seriesIndex];

      seriesValues.forEach((value, i) => {
        if (value === null) return;

        const barHeight = ((value - this.minValue) / this.valueRange) *
          this.chartHeight;
        const barX = this.padding.left + this.groupWidth * (i + 0.5) -
          clusterWidth / 2 + seriesIndex * step;
        const barY = this.chartBottom - barHeight;
        const width = barPixelWidth;

        const bar = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        bar.setAttribute(
          "d",
          `M ${barX + 4} ${barY} L ${barX + width - 4} ${barY} A 4 4 0 0 1 ${
            barX + width
          } ${barY + 4} L ${barX + width} ${barY + barHeight} L ${barX} ${
            barY + barHeight
          } L ${barX} ${barY + 4} A 4 4 0 0 1 ${barX + 4} ${barY} Z`,
        );
        bar.setAttribute("fill", color);
        bar.style.pointerEvents = "none";
        bar.dataset.index = i.toString();
        clipGroup.appendChild(bar);

        if (this.showLabels && barHeight > 10) {
          this.createText(
            clipGroup,
            barX + width / 2,
            barY - 4,
            value.toString(),
          );
        }
      });
    });
    group.appendChild(clipGroup);
  }
}
