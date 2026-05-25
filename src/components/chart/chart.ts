import { ChartContext, createChartContext } from "./context.ts";
import { ChartOptions, TYPE_OPTION } from "./options.ts";
import { Axis } from "../axis/component.ts";
import { Legend } from "../legend/component.ts";
import { Bar } from "../bar/component.ts";
import { Line } from "../line/component.ts";
import { computeLayout } from "./layout.ts";
import { clipPath } from "./svg.ts";

export class Chart {
  private context: ChartContext;
  private axisX: Axis<"x">;
  private axisY: Axis<"y">;
  private legend: Legend;
  private bar: Bar;
  private line: Line;
  private resizeObserver: ResizeObserver | null = null;

  constructor(options: ChartOptions) {
    this.context = createChartContext(options);
    this.axisX = new Axis(this.context, "x");
    this.axisY = new Axis(this.context, "y");
    this.legend = new Legend(this.context);
    this.bar = new Bar(this.context);
    this.line = new Line(this.context);

    this.resizeObserver = new ResizeObserver(() => this.render());
    this.resizeObserver.observe(this.context.wrapper);

    const wrapperRect = this.context.wrapper.getBoundingClientRect();
    const scaleX = wrapperRect.width > 0
      ? this.context.wrapper.offsetWidth / wrapperRect.width
      : 1;
    this.context.width = Math.round(wrapperRect.width * scaleX);
    this.context.height = Math.round(
      wrapperRect.height *
        (wrapperRect.height > 0
          ? this.context.wrapper.offsetHeight / wrapperRect.height
          : 1),
    );

    this.context.container.addEventListener("mousemove", this.onMouseMove);
  }

  private onMouseMove = (event: MouseEvent) => {
    const tooltip = this.axisY.tooltip!;
    if (tooltip.isVisible()) {
      const rect = this.context.wrapper.getBoundingClientRect();
      tooltip.position(event.clientX - rect.left, event.clientY - rect.top);
    }
  };

  render() {
    this.context.svg.replaceChildren();
    const wrapperRect = this.context.wrapper.getBoundingClientRect();
    const scaleX = wrapperRect.width > 0
      ? this.context.wrapper.offsetWidth / wrapperRect.width
      : 1;
    const scaleY = wrapperRect.height > 0
      ? this.context.wrapper.offsetHeight / wrapperRect.height
      : 1;
    const svgRect = this.context.svg.getBoundingClientRect();
    const computedWidth = Math.round(svgRect.width * scaleX);
    const computedHeight = Math.round(svgRect.height * scaleY);
    if (computedWidth > 0 && computedHeight > 0) {
      this.context.width = computedWidth;
      this.context.height = computedHeight;
    }
    this.context.areaBottom = this.context.height;
    this.context.svg.setAttribute(
      "viewBox",
      `0 0 ${this.context.width} ${this.context.height}`,
    );

    computeLayout(this.axisX.context, this.axisY.context);

    const padding = this.context.padding;
    const clipPathId = clipPath(
      this.context.svg,
      padding.left - 10,
      padding.top - 30,
      this.context.width - padding.left - padding.right + 20,
      this.context.plotHeight + 30,
    );
    const group = createSvg("g");

    this.axisY.line.renderGrid(group);
    this.axisX.line.renderGrid(group);
    this.axisY.label.renderLabels();
    this.axisY.cursor!.renderShadows();

    const chartType = (this.context.config.get(TYPE_OPTION.key) ||
      TYPE_OPTION.default) as string;
    if (chartType === "bar") {
      this.bar.render(group, clipPathId);
    } else {
      this.line.render(group, clipPathId);
    }

    this.axisY.refLine!.render(group);
    this.context.svg.appendChild(group);
    this.axisX.label.renderLabels();
    this.axisY.cursor!.renderTargets();
    this.legend.render();
    this.axisY.cursor!.attachEvents();
  }

  destroy() {
    this.context.container.removeEventListener(
      "mousemove",
      this.onMouseMove,
    );
    this.resizeObserver?.disconnect();
    this.legend.destroy();
    this.axisY.tooltip!.destroy();
    if (this.context.svg?.parentNode) {
      this.context.svg.parentNode.removeChild(this.context.svg);
    }
    if (this.context.wrapper?.parentNode) {
      this.context.wrapper.parentNode.removeChild(this.context.wrapper);
    }
  }
}
