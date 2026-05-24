import {
  ChartRendererOptions,
  COLOR_OPTION,
  COLORS,
} from "../../core/base/index.ts";
import { PolarChartRenderer } from "../../core/polar/index.ts";
import { PIE_HOLE_RADIUS_OPTION } from "./options.ts";

export class PieChartRenderer extends PolarChartRenderer {
  private holeRadius: number;

  constructor(options: ChartRendererOptions) {
    super(options);
    this.holeRadius =
      (options.config.get(PIE_HOLE_RADIUS_OPTION.key) as number) ??
        PIE_HOLE_RADIUS_OPTION.default;
  }

  protected override computeColors(): string[] {
    const configColor =
      (this.config.get(COLOR_OPTION.key) as string | undefined)
        ?.trim();
    if (configColor && configColor !== "" && configColor !== "undefined") {
      return this.labels.map(() => configColor);
    }
    if (this.labels.length === 1) {
      return ["var(--interactive-accent)"];
    }
    return this.labels.map((_, i) => COLORS[i % COLORS.length]);
  }

  render() {
    this.beginRender();
    this.computePolarLayout();

    const rings = this.computeRings(this.values.length, this.holeRadius);
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    this.values.forEach((seriesValues, seriesIndex) => {
      const total = seriesValues.reduce<number>(
        (sum, v) => sum + (v ?? 0),
        0,
      ) || 1;
      const { innerR, outerR } = rings[seriesIndex];

      let currentAngle = -Math.PI / 2;
      seriesValues.forEach((value, i) => {
        if (value === null || value === 0) return;
        const color = this.colors[i];
        const rawAngle = (value ?? 0) / total * 2 * Math.PI;
        const minAngle = 0.02;
        const sliceAngle = Math.max(rawAngle, minAngle);

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute(
          "d",
          this.buildArcD({
            currentAngle,
            sliceAngle,
            outerRadius: outerR,
            innerRadius: innerR,
          }),
        );
        path.setAttribute("fill", color);
        path.style.cursor = "pointer";
        path.dataset.seriesIndex = seriesIndex.toString();
        path.dataset.itemIndex = i.toString();
        group.appendChild(path);

        if (this.showLabels && rawAngle > 0.3) {
          const midAngle = currentAngle + sliceAngle / 2;
          const lx = this.centerX +
            (innerR + outerR) / 2 * Math.cos(midAngle);
          const ly = this.centerY +
            (innerR + outerR) / 2 * Math.sin(midAngle);
          this.createText(group, lx, ly, (value ?? 0).toString(), {
            fill: "#ffffff",
          });
        }

        currentAngle += sliceAngle;
      });
    });

    this.svg.appendChild(group);
    this.finishRender();
  }

  protected override getLegendHeight(): number {
    if (!this.showLegend || this.labels.length === 0) return 0;
    if (this.legendSide === "left" || this.legendSide === "right") return 0;

    const rowHeight = 20;
    const pad = 4;
    const r = 6;
    const itemGap = 16;
    const itemTextPad = 6;
    const availableWidth = this.width - this.padding.left - this.padding.right;

    let rows = 1;
    let currentRowWidth = 0;
    for (const name of this.labels) {
      const itemWidth = r * 2 + itemTextPad + name.length * 8 + itemGap;
      if (currentRowWidth + itemWidth > availableWidth) {
        rows++;
        currentRowWidth = itemWidth;
      } else {
        currentRowWidth += itemWidth;
      }
    }

    return rows * rowHeight + pad * 2;
  }

  protected override renderLegend(
    legendY?: number,
    side?: "left" | "right",
  ): number {
    if (!this.showLegend || this.labels.length === 0) return 0;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const r = 6;
    const itemGap = 16;
    const rowHeight = 20;
    const pad = 4;
    const itemTextPad = 6;

    if (side) {
      const x0 = side === "left"
        ? pad
        : this.width - this.getLegendWidth() + pad;
      const totalHeight = this.labels.length * rowHeight;
      const areaTop = legendY ?? this.padding.top;
      const areaHeight = this.chartAreaEnd - areaTop;
      let yStart = areaTop + pad;
      if (this.legendAlign === "center") {
        yStart = areaTop + (areaHeight - totalHeight) / 2;
      } else if (this.legendAlign === "end") {
        yStart = areaTop + areaHeight - totalHeight;
      }
      let yOffset = 0;
      this.labels.forEach((name, i) => {
        const cx = x0 + r;
        const cy = yStart + yOffset + rowHeight / 2;

        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );
        circle.setAttribute("cx", cx.toString());
        circle.setAttribute("cy", cy.toString());
        circle.setAttribute("r", r.toString());
        circle.setAttribute("fill", this.colors[i]);
        group.appendChild(circle);

        this.createText(
          group,
          x0 + r * 2 + itemTextPad,
          cy + 4,
          name,
          { anchor: "start" },
        );

        yOffset += rowHeight;
      });
    } else {
      const availableWidth = this.width - this.padding.left -
        this.padding.right;

      const rows: { name: string; color: string }[][] = [];
      let currentRow: { name: string; color: string }[] = [];
      let currentRowWidth = 0;

      this.labels.forEach((name, i) => {
        const itemWidth = r * 2 + itemTextPad + name.length * 8 + itemGap;

        if (
          currentRow.length > 0 && currentRowWidth + itemWidth > availableWidth
        ) {
          rows.push(currentRow);
          currentRow = [];
          currentRowWidth = 0;
        }

        currentRow.push({ name, color: this.colors[i] });
        currentRowWidth += itemWidth;
      });

      if (currentRow.length > 0) {
        rows.push(currentRow);
      }

      const y0 = legendY ?? this.height;
      const rowTotalWidths = rows.map((row) =>
        row.reduce(
          (sum, { name }) =>
            sum + r * 2 + itemTextPad + name.length * 8 + itemGap,
          0,
        )
      );

      rows.forEach((row, rowIndex) => {
        const totalWidth = rowTotalWidths[rowIndex];
        let startX: number;
        if (this.legendAlign === "start") {
          startX = this.padding.left;
        } else if (this.legendAlign === "end") {
          startX = this.width - this.padding.right - totalWidth;
        } else {
          startX = (this.width - totalWidth) / 2;
        }
        let offset = 0;

        row.forEach(({ name, color }) => {
          const cx = startX + offset + r;
          const cy = y0 + pad + rowIndex * rowHeight + rowHeight / 2;

          const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle",
          );
          circle.setAttribute("cx", cx.toString());
          circle.setAttribute("cy", cy.toString());
          circle.setAttribute("r", r.toString());
          circle.setAttribute("fill", color);
          group.appendChild(circle);

          this.createText(
            group,
            startX + offset + r * 2 + itemTextPad,
            cy + 4,
            name,
            { anchor: "start" },
          );

          offset += r * 2 + itemTextPad + name.length * 8 + itemGap;
        });
      });
    }

    this.svg.appendChild(group);
    return 0;
  }

  protected override attachEventListeners() {
    const paths = this.svg.querySelectorAll("path[data-series-index]");
    paths.forEach((path) => {
      const itemIndex = parseInt(
        (path as HTMLElement).dataset.itemIndex || "0",
        10,
      );

      path.addEventListener("mouseenter", (event) => {
        const allPaths = this.svg.querySelectorAll("path[data-series-index]");
        allPaths.forEach((p) => {
          (p as HTMLElement).style.opacity =
            (p as HTMLElement).dataset.itemIndex !== itemIndex.toString()
              ? "0.5"
              : "";
        });
        const crect = this.container.getBoundingClientRect();
        this.showTooltip(
          itemIndex,
          (event as MouseEvent).clientX - crect.left,
          (event as MouseEvent).clientY - crect.top,
        );
      });

      path.addEventListener("mouseleave", () => {
        const allPaths = this.svg.querySelectorAll("path[data-series-index]");
        allPaths.forEach((p) => {
          (p as HTMLElement).style.opacity = "";
        });
        this.hideTooltip();
      });

      path.addEventListener("click", (event) => {
        this.openFileByIndex(itemIndex, event as MouseEvent);
      });

      path.addEventListener("auxclick", (event) => {
        this.openFileByIndex(itemIndex, event as MouseEvent);
      });

      path.addEventListener("contextmenu", (event) => {
        this.openContextMenuByIndex(itemIndex, event as MouseEvent);
      });
    });
  }

  protected override showTooltip(index: number, rx: number, ry: number) {
    this.tooltipTitle.textContent = this.labels[index];
    for (let i = 0; i < this.values.length; i++) {
      const v = this.values[i][index];
      this.tooltipValueSpans[i].textContent = (v ?? 0).toString();
      this.tooltipDots[i].style.backgroundColor = this.colors[index];
    }
    this.positionTooltip(rx, ry);
    this.tooltip.style.visibility = "visible";
  }
}
