import { ChartRendererOptions } from "../../core/base/index.ts";
import { CartesianChartRenderer } from "../../core/cartesian/index.ts";
import {
  LINE_AREA_OPTION,
  LINE_SMOOTH_OPTION,
  LINE_WIDTH_OPTION as lineWidthOption,
} from "./options.ts";

export class LineChartRenderer extends CartesianChartRenderer {
  private circles: Map<number, SVGCircleElement[]> = new Map();
  private lineWidth: number;
  private smooth: boolean;
  private showArea: boolean;

  constructor(options: ChartRendererOptions) {
    super(options);
    this.lineWidth = (options.config.get(lineWidthOption.key) as number) ||
      lineWidthOption.default;
    this.smooth = (options.config.get(LINE_SMOOTH_OPTION.key) ??
      LINE_SMOOTH_OPTION.default) as boolean;
    this.showArea = (options.config.get(LINE_AREA_OPTION.key) ??
      LINE_AREA_OPTION.default) as boolean;
  }

  render() {
    this.beginRender();
    this.circles.clear();
    this.computeCartesianLayout();

    const clipId = this.createChartClipPath();
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.renderYGridLines(group);

    if (this.showXLine) {
      for (let i = 0; i < this.count; i++) {
        const x = this.padding.left + this.groupWidth * (i + 0.5);
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
    this.renderReferenceLine(group);
    this.renderLines(group, clipId);
    this.svg.appendChild(group);
    this.renderXAxisLabels(this.svg);
    this.renderHitAreas(this.svg);
    this.finishRender();
  }

  private buildPath(
    points: { x: number; y: number }[],
    smooth: boolean,
    close: boolean,
  ): string {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;

    if (smooth) {
      const n = points.length;
      const slopes: number[] = [];
      for (let i = 0; i < n - 1; i++) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;
        slopes.push(dx !== 0 ? dy / dx : 0);
      }

      const tangents: number[] = [];
      for (let i = 0; i < n; i++) {
        if (i === 0) {
          tangents.push(slopes[0]);
        } else if (i === n - 1) {
          tangents.push(slopes[n - 2]);
        } else {
          const s1 = slopes[i - 1];
          const s2 = slopes[i];
          if (s1 * s2 <= 0) {
            tangents.push(0);
          } else {
            const h = 2 * s1 * s2 / (s1 + s2);
            const m = 3 * Math.min(Math.abs(s1), Math.abs(s2));
            tangents.push(Math.sign(s1) * Math.min(Math.abs(h), m));
          }
        }
      }

      for (let i = 0; i < n - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const dx = p1.x - p0.x;
        if (dx === 0) {
          d += ` L ${p1.x} ${p1.y}`;
          continue;
        }

        const cp1x = p0.x + dx / 3;
        const cp1y = p0.y + tangents[i] * dx / 3;
        const cp2x = p1.x - dx / 3;
        const cp2y = p1.y - tangents[i + 1] * dx / 3;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    if (close) {
      d += ` L ${points[points.length - 1].x} ${this.chartBottom}`;
      d += ` L ${points[0].x} ${this.chartBottom}`;
      d += ` Z`;
    }

    return d;
  }

  private gradientFill(color: string): string {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("xmlns", ns);
    const defs = document.createElementNS(ns, "defs");
    const grad = document.createElementNS(ns, "linearGradient");
    grad.setAttribute("id", "g");
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    const stop1 = document.createElementNS(ns, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", color);
    stop1.setAttribute("stop-opacity", "0.5");
    grad.appendChild(stop1);
    const stop2 = document.createElementNS(ns, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", color);
    stop2.setAttribute("stop-opacity", "0");
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);
    return `url("data:image/svg+xml;charset=utf-8,${
      encodeURIComponent(new XMLSerializer().serializeToString(svg))
    }#g")`;
  }

  private renderLines(parent: SVGGElement, clipId: string) {
    this.values.forEach((seriesValues, seriesIndex) => {
      const color = this.colors[seriesIndex];
      const resolvedColor = this.resolveColor(color);
      const points: { x: number; y: number }[] = [];

      seriesValues.forEach((value, i) => {
        const x = this.padding.left + this.groupWidth * (i + 0.5);
        const pointValue = value ?? 0;
        const y = this.chartBottom -
          ((pointValue - this.minValue) / this.valueRange) * this.chartHeight;
        points.push({ x, y });
      });

      const clipGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      clipGroup.setAttribute("clip-path", `url(#${clipId})`);

      if (this.showArea) {
        const pathData = this.buildPath(points, this.smooth, true);
        const areaPath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        areaPath.setAttribute("d", pathData);
        areaPath.style.fill = this.gradientFill(resolvedColor);
        areaPath.style.pointerEvents = "none";
        clipGroup.appendChild(areaPath);
      }

      const pathData = this.buildPath(points, this.smooth, false);
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", this.lineWidth.toString());
      path.setAttribute("stroke-linejoin", "round");
      path.style.pointerEvents = "none";
      clipGroup.appendChild(path);

      seriesValues.forEach((value, i) => {
        if (this.showLabels) {
          this.createText(
            clipGroup,
            points[i].x,
            points[i].y - 8,
            (value ?? 0).toString(),
          );
        }
      });

      seriesValues.forEach((_, i) => {
        const pt = points[i];
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );
        circle.setAttribute("cx", pt.x.toString());
        circle.setAttribute("cy", pt.y.toString());
        circle.setAttribute("r", (3 * this.lineWidth).toString());
        circle.setAttribute("fill", color);
        circle.style.pointerEvents = "none";
        circle.setAttribute("opacity", "0");
        clipGroup.appendChild(circle);

        const cols = this.circles.get(i) || [];
        cols.push(circle);
        this.circles.set(i, cols);
      });

      parent.appendChild(clipGroup);
    });
  }

  protected override showShadow(index: number) {
    super.showShadow(index);
    const cols = this.circles.get(index);
    if (cols) { for (const c of cols) c.setAttribute("opacity", "1"); }
  }

  protected override hideShadow(index: number) {
    super.hideShadow(index);
    const cols = this.circles.get(index);
    if (cols) { for (const c of cols) c.setAttribute("opacity", "0"); }
  }
}
