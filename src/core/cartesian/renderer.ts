import { ChartRenderer, ChartRendererOptions } from "../base/index.ts";
import {
  REFERENCE_LINE_COLOR_OPTION,
  REFERENCE_LINE_NAME_OPTION,
  REFERENCE_LINE_STYLE_OPTION,
  REFERENCE_LINE_VALUE_OPTION,
  REFERENCE_LINE_WIDTH_OPTION,
  ROTATE_X_LABELS_OPTION,
  SHOW_X_LABELS_OPTION,
  SHOW_X_LINE_OPTION,
  SHOW_Y_LABELS_OPTION,
  SHOW_Y_LINE_OPTION,
  X_LINE_STYLE_OPTION,
  X_LINE_WIDTH_OPTION,
  Y_FORMAT_OPTION,
  Y_LINE_STYLE_OPTION,
  Y_LINE_WIDTH_OPTION,
  Y_MAX_OPTION,
  Y_MIN_OPTION,
} from "./options.ts";

export abstract class CartesianChartRenderer extends ChartRenderer {
  protected hitAreas: SVGRectElement[] = [];
  protected shadowRects: Map<number, SVGRectElement> = new Map();
  protected chartHeight = 0;
  protected chartBottom = 0;
  protected minValue = 0;
  protected valueRange = 1;
  protected groupWidth = 0;
  protected count = 0;
  protected yLabels: number[] = [];
  protected xAxisData: string[] = [];
  protected yConfiguredMax: number | undefined;
  protected yConfiguredMin: number | undefined;
  protected showYLine: boolean;
  protected showYLabels: boolean;
  protected showXLine: boolean;
  protected showXLabels: boolean;
  protected rotateXLabels: number;
  protected referenceLineValue: string | undefined;
  protected referenceLineColor: string;
  protected referenceLineStyle: string;
  protected referenceLineWidth: number;
  protected referenceLineName: string;
  protected xLineWidth: number;
  protected xLineStyle: string;
  protected yLineWidth: number;
  protected yLineStyle: string;
  protected yFormat: string;

  constructor(options: ChartRendererOptions) {
    super(options);
    this.yConfiguredMax = this.config.get(Y_MAX_OPTION.key) as
      | number
      | undefined;
    this.yConfiguredMin = this.config.get(Y_MIN_OPTION.key) as
      | number
      | undefined;
    this.showYLine = (this.config.get(SHOW_Y_LINE_OPTION.key) ??
      SHOW_Y_LINE_OPTION.default) as boolean;
    this.showYLabels = (this.config.get(SHOW_Y_LABELS_OPTION.key) ??
      SHOW_Y_LABELS_OPTION.default) as boolean;
    this.showXLine = (this.config.get(SHOW_X_LINE_OPTION.key) ??
      SHOW_X_LINE_OPTION.default) as boolean;
    this.showXLabels = (this.config.get(SHOW_X_LABELS_OPTION.key) ??
      SHOW_X_LABELS_OPTION.default) as boolean;
    this.rotateXLabels = (this.config.get(ROTATE_X_LABELS_OPTION.key) ??
      ROTATE_X_LABELS_OPTION.default) as number;
    this.referenceLineValue = this.config.get(
      REFERENCE_LINE_VALUE_OPTION.key,
    ) as
      | string
      | undefined;
    this.referenceLineColor =
      (this.config.get(REFERENCE_LINE_COLOR_OPTION.key) ||
        "var(--text-error)") as string;
    this.referenceLineStyle =
      (this.config.get(REFERENCE_LINE_STYLE_OPTION.key) ||
        REFERENCE_LINE_STYLE_OPTION.default) as string;
    this.referenceLineWidth =
      (this.config.get(REFERENCE_LINE_WIDTH_OPTION.key) ||
        REFERENCE_LINE_WIDTH_OPTION.default) as number;
    this.referenceLineName = this.config.get(
      REFERENCE_LINE_NAME_OPTION.key,
    ) as string;
    this.xLineWidth = (this.config.get(X_LINE_WIDTH_OPTION.key) ||
      X_LINE_WIDTH_OPTION.default) as number;
    this.xLineStyle = (this.config.get(X_LINE_STYLE_OPTION.key) ||
      X_LINE_STYLE_OPTION.default) as string;
    this.yLineWidth = (this.config.get(Y_LINE_WIDTH_OPTION.key) ||
      Y_LINE_WIDTH_OPTION.default) as number;
    this.yLineStyle = (this.config.get(Y_LINE_STYLE_OPTION.key) ||
      Y_LINE_STYLE_OPTION.default) as string;
    this.yFormat = (this.config.get(Y_FORMAT_OPTION.key) as string) ||
      "{value}";
  }

  protected computeCartesianLayout() {
    this.hitAreas = [];
    this.shadowRects.clear();
    this.computeRotationPadding();
    this.computeYLabelPadding();
    const chartWidth = this.width - this.padding.left - this.padding.right;
    this.chartHeight = this.chartAreaEnd - this.padding.top -
      this.padding.bottom;
    this.chartBottom = this.chartAreaEnd - this.padding.bottom;
    const maxValue = Math.max(this.getMaxValue(), 1);
    this.minValue = this.getMinValue();
    this.valueRange = maxValue - this.minValue || 1;
    this.xAxisData = this.labels;
    this.count = Math.max(this.xAxisData.length, 1);
    this.groupWidth = chartWidth / this.count;
    this.yLabels = this.computeYLabels(maxValue);
  }

  protected computeRotationPadding() {
    if (this.rotateXLabels === 0) return;

    const angleRad = Math.abs(this.rotateXLabels) * Math.PI / 180;
    const emSize = 13;
    let maxProjection = 0;
    for (const label of this.labels) {
      const textWidth = label.length * 7;
      const projection = textWidth / 2 * Math.abs(Math.sin(angleRad)) +
        emSize / 2 * Math.abs(Math.cos(angleRad));
      if (projection > maxProjection) maxProjection = projection;
    }

    const neededExtra = Math.max(0, maxProjection - 10);
    this.padding.bottom += neededExtra;
  }

  protected computeYLabelPadding() {
    if (!this.showYLabels) return;

    const maxValue = Math.max(this.getMaxValue(), 1);
    const labels = this.computeYLabels(maxValue);
    let maxWidth = 0;
    for (const v of labels) {
      const text = this.formatYValue(v);
      maxWidth = Math.max(maxWidth, text.length * 7);
    }
    const needed = maxWidth + 16;
    if (this.padding.left < needed) {
      this.padding.left = needed;
    }
  }

  protected getMaxValue(): number {
    if (this.yConfiguredMax) return this.yConfiguredMax;

    let max: number | undefined;
    for (const values of this.values) {
      for (const v of values) {
        if (v !== null) {
          if (max === undefined || v > max) max = v;
        }
      }
    }
    return max ?? 100;
  }

  protected getMinValue(): number {
    if (this.yConfiguredMin) return this.yConfiguredMin;
    return 0;
  }

  protected computeYLabels(maxValue: number): number[] {
    const valueRange = maxValue - this.getMinValue() || 1;
    const rawStep = valueRange / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const norm = rawStep / magnitude;
    const yStep = norm <= 1.5
      ? magnitude
      : norm <= 3.5
      ? 2 * magnitude
      : norm <= 7.5
      ? 5 * magnitude
      : 10 * magnitude;
    const labels: number[] = [];
    for (let v = 0; v <= maxValue; v += yStep) {
      labels.push(v);
    }
    if (labels[labels.length - 1] !== maxValue) {
      labels.push(maxValue);
    }
    return labels;
  }

  protected createGridLine(
    parent: SVGElement,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeWidth?: number,
    strokeStyle?: string,
  ): SVGLineElement {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1.toString());
    line.setAttribute("x2", x2.toString());
    line.setAttribute("y1", y1.toString());
    line.setAttribute("y2", y2.toString());
    line.setAttribute("stroke", "var(--bases-table-border-color)");
    line.setAttribute(
      "stroke-dasharray",
      strokeStyle
        ? (strokeStyle !== "solid" ? this.getDasharray(strokeStyle) : "")
        : "2,2",
    );
    if (strokeWidth) {
      line.setAttribute("stroke-width", strokeWidth.toString());
    }
    parent.appendChild(line);
    return line;
  }

  protected renderYGridLines(group: SVGGElement) {
    if (!this.showYLine) return;

    for (const v of this.yLabels) {
      const y = this.chartBottom -
        ((v - this.minValue) / this.valueRange) * this.chartHeight;
      this.createGridLine(
        group,
        this.padding.left,
        y,
        this.width - this.padding.right,
        y,
        this.yLineWidth,
        this.yLineStyle,
      );
    }
  }

  protected getDasharray(style: string): string {
    return style === "dotted" ? "2,2" : "4,4";
  }

  protected formatYValue(value: number): string {
    return this.yFormat.replace("{value}", value.toString());
  }

  protected renderYAxisLabels(svg: SVGSVGElement) {
    if (!this.showYLabels) return;

    const group = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    for (const v of this.yLabels) {
      const y = this.chartBottom -
        ((v - this.minValue) / this.valueRange) * this.chartHeight;
      const text = this.createText(
        group,
        this.padding.left - 8,
        y + 4,
        this.formatYValue(v),
        { anchor: "end" },
      );
      text.dataset.yValue = v.toString();
    }
    svg.appendChild(group);
  }

  protected renderXAxisLabels(svg: SVGSVGElement) {
    if (!this.showXLabels) return;

    const rotate = this.rotateXLabels;
    const group = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    const y = this.chartAreaEnd - 10;
    let prevRight = -Infinity;
    this.xAxisData.forEach((label, i) => {
      const x = this.padding.left + this.groupWidth * (i + 0.5);

      const textLen = label.length * 7;
      const halfW = rotate === 0
        ? textLen / 2
        : (textLen / 2 * Math.cos(Math.abs(rotate) * Math.PI / 180) +
          12 * Math.sin(Math.abs(rotate) * Math.PI / 180));

      if (x - halfW < prevRight) return;

      prevRight = x + halfW;

      this.createText(
        group,
        x,
        y,
        label,
        { transform: `rotate(${-rotate}, ${x}, ${y})` },
      );
    });
    svg.appendChild(group);
  }

  protected renderReferenceLine(group: SVGGElement) {
    if (!this.referenceLineValue || this.referenceLineValue === "") return;
    const referenceValue = Number(this.referenceLineValue);
    if (isNaN(referenceValue)) return;

    const referenceY = this.chartBottom -
      ((referenceValue - this.minValue) / this.valueRange) * this.chartHeight;
    if (referenceY < this.padding.top || referenceY > this.chartBottom) return;

    const referenceLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    referenceLine.setAttribute("x1", this.padding.left.toString());
    referenceLine.setAttribute(
      "x2",
      (this.width - this.padding.right).toString(),
    );
    referenceLine.setAttribute("y1", referenceY.toString());
    referenceLine.setAttribute("y2", referenceY.toString());
    referenceLine.setAttribute("stroke", this.referenceLineColor);
    referenceLine.setAttribute(
      "stroke-dasharray",
      this.referenceLineStyle !== "solid"
        ? this.getDasharray(this.referenceLineStyle)
        : "",
    );
    referenceLine.setAttribute(
      "stroke-width",
      this.referenceLineWidth.toString(),
    );
    group.appendChild(referenceLine);

    if (this.referenceLineName) {
      this.createText(
        group,
        this.padding.left + 4,
        referenceY - 4,
        this.referenceLineName,
        { anchor: "start", fill: this.referenceLineColor },
      );
    }

    const formatted = this.formatYValue(referenceValue);
    const matchingLabel = this.svg.querySelector(
      `[data-y-value="${referenceValue}"]`,
    ) as SVGTextElement | null;
    if (matchingLabel) {
      matchingLabel.setAttribute("fill", this.referenceLineColor);
    } else {
      this.createText(
        group,
        this.padding.left - 8,
        referenceY + 4,
        formatted,
        { anchor: "end", fill: this.referenceLineColor },
      );
    }
  }

  protected renderShadowRects(parent: SVGElement) {
    for (let i = 0; i < this.count; i++) {
      const x = this.padding.left + this.groupWidth * i;
      const shadow = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      shadow.setAttribute("x", x.toString());
      shadow.setAttribute("y", this.padding.top.toString());
      shadow.setAttribute("width", this.groupWidth.toString());
      shadow.setAttribute("height", this.chartHeight.toString());
      shadow.setAttribute("fill", "var(--background-modifier-hover)");
      shadow.setAttribute("opacity", "0");
      shadow.style.pointerEvents = "none";
      parent.appendChild(shadow);
      this.shadowRects.set(i, shadow);
    }
  }

  protected renderHitAreas(parent: SVGElement) {
    for (let i = 0; i < this.count; i++) {
      const x = this.padding.left + this.groupWidth * i;
      const hit = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      hit.setAttribute("x", x.toString());
      hit.setAttribute("y", this.padding.top.toString());
      hit.setAttribute("width", this.groupWidth.toString());
      hit.setAttribute("height", this.chartHeight.toString());
      hit.setAttribute("fill", "transparent");
      hit.style.cursor = "pointer";
      hit.dataset.index = i.toString();
      parent.appendChild(hit);
      this.hitAreas.push(hit);
    }
  }

  protected override attachEventListeners() {
    this.hitAreas.forEach((hit) => {
      const index = parseInt(hit.dataset.index || "-1", 10);

      hit.addEventListener("mouseenter", (event) => {
        this.lastHoveredIndex = index;
        this.showShadow(index);
        const crect = this.container.getBoundingClientRect();
        this.showTooltipForIndex(
          index,
          event.clientX - crect.left,
          event.clientY - crect.top,
        );
      });

      hit.addEventListener("mouseleave", () => {
        this.hideShadow(index);
        this.hideTooltip();
      });

      hit.addEventListener("click", (event) => {
        this.openFileByIndex(index, event);
      });

      hit.addEventListener("contextmenu", (event) => {
        this.openContextMenuByIndex(index, event);
      });

      hit.addEventListener("auxclick", (event) => {
        if (event.button === 1) {
          this.openFileByIndex(index, event);
        }
      });
    });
  }

  protected showShadow(index: number) {
    const shadow = this.shadowRects.get(index);
    if (shadow) shadow.setAttribute("opacity", "0.5");
  }

  protected hideShadow(index: number) {
    const shadow = this.shadowRects.get(index);
    if (shadow) shadow.setAttribute("opacity", "0");
  }

  protected showTooltipForIndex(index: number, x: number, y: number) {
    this.showTooltip(index, x, y);
  }

  protected createChartClipPath(): string {
    let defs = this.svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      this.svg.insertBefore(defs, this.svg.firstChild);
    }
    const id = "chart-clip";
    const existing = defs.querySelector(`#${id}`);
    if (existing) existing.remove();

    const clipPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "clipPath",
    );
    clipPath.setAttribute("id", id);
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const topPad = 30;
    rect.setAttribute("x", (this.padding.left - 10).toString());
    rect.setAttribute("y", (this.padding.top - topPad).toString());
    rect.setAttribute(
      "width",
      (this.width - this.padding.left - this.padding.right + 20).toString(),
    );
    rect.setAttribute(
      "height",
      (this.chartHeight + topPad).toString(),
    );
    clipPath.appendChild(rect);
    defs.appendChild(clipPath);
    return id;
  }

  protected resolveColor(value: string): string {
    if (value.startsWith("var(")) {
      const name = value.slice(4, -1).trim();
      return getComputedStyle(this.container).getPropertyValue(name).trim() ||
        value;
    }
    return value;
  }
}
