import {
  App,
  BasesPropertyId,
  BasesQueryResult,
  BasesViewConfig,
  Keymap,
  Menu,
  TFile,
} from "obsidian";
import {
  COLOR_OPTION,
  LEGEND_POSITION_OPTION,
  SHOW_LABELS_OPTION,
  SHOW_LEGEND_OPTION,
} from "./options.ts";
import { X_AXIS_OPTION } from "../cartesian/options.ts";
import { COLORS } from "./colors.ts";

export interface ChartRendererOptions {
  container: HTMLElement;
  queryResult: BasesQueryResult;
  config: BasesViewConfig;
  app: App;
}

export abstract class ChartRenderer {
  protected resizeObserver: ResizeObserver | null = null;
  protected svg!: SVGSVGElement;
  protected tooltip!: HTMLElement;
  protected queryResult: BasesQueryResult;
  protected config: BasesViewConfig;
  protected container: HTMLElement;
  protected app: App;
  protected lastHoveredIndex = -1;
  protected width = 0;
  protected height = 0;
  protected chartAreaEnd = 0;
  protected padding = { top: 30, bottom: 30, left: 30, right: 30 };
  protected showLegend: boolean;
  protected showLabels: boolean;
  protected legendPosition: string;
  protected legendSide = "bottom";
  protected legendAlign = "center";
  protected labels: string[] = [];
  protected values: (number | null)[][] = [];
  protected colors: string[] = [];
  protected propertyNames: string[] = [];
  protected filePaths: string[] = [];
  protected tooltipTitle!: HTMLElement;
  protected tooltipDots: HTMLElement[] = [];
  protected tooltipValueSpans: HTMLElement[] = [];
  protected tooltipRows: HTMLElement[] = [];

  constructor(options: ChartRendererOptions) {
    this.container = options.container;
    this.queryResult = options.queryResult;
    this.config = options.config;
    this.app = options.app;
    this.showLegend = (this.config.get(SHOW_LEGEND_OPTION.key) ||
      SHOW_LEGEND_OPTION.default) as boolean;
    this.showLabels = (this.config.get(SHOW_LABELS_OPTION.key) ||
      SHOW_LABELS_OPTION.default) as boolean;
    this.legendPosition = (this.config.get(LEGEND_POSITION_OPTION.key) ||
      LEGEND_POSITION_OPTION.default) as string;
    const [side, align] = this.legendPosition.split("-");
    this.legendSide = side || "bottom";
    this.legendAlign = align || "center";
    this.parseData();
    this.createTooltip();

    this.resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      if (width === this.width && height === this.height) return;
      this.resize(width, height);
    });
    this.resizeObserver.observe(this.container);

    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height ||
      parseInt(
        getComputedStyle(this.container).getPropertyValue(
          "--bases-chart-container-min-height",
        ),
      ) || 300;

    this.container.addEventListener("mousemove", this.onMouseMove);
  }

  private parseData() {
    this.propertyNames = this.queryResult.properties.map((p) =>
      this.config.getDisplayName(p)
    );

    this.values = [];
    for (const property of this.queryResult.properties) {
      const propValues: (number | null)[] = [];
      for (const entry of this.queryResult.data) {
        const rawValue = entry.getValue(property);
        const numericValue = rawValue !== undefined
          ? Number.parseFloat(String(rawValue))
          : null;
        propValues.push(isNaN(numericValue as number) ? null : numericValue);
      }
      this.values.push(propValues);
    }

    const xAxisProp = (this.config.get(X_AXIS_OPTION.key) ??
      X_AXIS_OPTION.default) as BasesPropertyId;
    this.labels = this.queryResult.data.map((entry) =>
      entry.getValue(xAxisProp)?.toString() ?? entry.file.basename
    );

    this.filePaths = this.queryResult.data.map((entry) => entry.file.path);
    this.colors = this.computeColors();
  }

  protected computeColors(): string[] {
    const configColor =
      (this.config.get(COLOR_OPTION.key) as string | undefined)
        ?.trim();
    if (configColor && configColor !== "" && configColor !== "undefined") {
      return this.propertyNames.map(() => configColor);
    }
    if (this.propertyNames.length === 1) {
      return ["var(--interactive-accent)"];
    }
    return this.propertyNames.map((_, i) => COLORS[i % COLORS.length]);
  }

  protected createSVG(width: number, height: number): SVGSVGElement {
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svg.style.display = "block";
    return this.svg;
  }

  protected createTooltip(): HTMLElement {
    if (this.tooltip?.parentNode) {
      return this.tooltip;
    }
    this.container.style.position = "relative";
    this.tooltip = document.createElement("div");
    this.tooltip.className = "bases-chart-tooltip";
    this.tooltip.style.position = "absolute";
    this.tooltip.style.pointerEvents = "none";
    this.tooltip.style.whiteSpace = "nowrap";
    this.tooltip.style.zIndex = "1000";
    this.tooltip.style.visibility = "hidden";
    this.tooltip.style.top = "-9999px";
    this.tooltip.style.left = "-9999px";
    this.tooltip.style.backgroundColor = "var(--background-modifier-message)";
    this.tooltip.style.border = "0";
    this.tooltip.style.borderRadius = "6px";
    this.tooltip.style.padding = "6px 10px";
    this.tooltip.style.boxShadow =
      "0 2px 8px var(--background-modifier-box-shadow)";
    this.tooltip.style.transitionDuration = "0s";

    this.tooltipTitle = document.createElement("div");
    this.tooltipTitle.style.fontSize = "var(--font-ui-small)";
    this.tooltipTitle.style.color = "#FAFAFA";
    this.tooltipTitle.style.fontWeight = "500";
    this.tooltip.appendChild(this.tooltipTitle);

    for (let i = 0; i < this.propertyNames.length; i++) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "space-between";
      row.style.gap = "16px";

      const left = document.createElement("div");
      left.style.display = "flex";
      left.style.alignItems = "center";
      left.style.gap = "6px";

      const dot = document.createElement("div");
      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.borderRadius = "9999px";
      dot.style.backgroundColor = this.colors[i];

      const nameSpan = document.createElement("span");
      nameSpan.style.fontSize = "var(--font-ui-small)";
      nameSpan.style.fontFamily = "var(--font-interface)";
      nameSpan.style.color = "#969696";
      nameSpan.textContent = this.propertyNames[i];

      left.appendChild(dot);
      left.appendChild(nameSpan);

      const valueSpan = document.createElement("span");
      valueSpan.style.fontSize = "var(--font-ui-small)";
      valueSpan.style.fontFamily = "var(--font-interface)";
      valueSpan.style.color = "#FAFAFA";
      valueSpan.style.fontVariantNumeric = "tabular-nums";

      row.appendChild(left);
      row.appendChild(valueSpan);

      this.tooltipDots.push(dot);
      this.tooltipValueSpans.push(valueSpan);
      this.tooltipRows.push(row);
      this.tooltip.appendChild(row);
    }

    this.container.appendChild(this.tooltip);
    return this.tooltip;
  }

  protected showTooltip(index: number, rx: number, ry: number) {
    this.tooltipTitle.textContent = this.labels[index];
    for (let i = 0; i < this.values.length; i++) {
      const v = this.values[i][index];
      this.tooltipValueSpans[i].textContent = (v ?? 0).toString();
      this.tooltipDots[i].style.backgroundColor = this.colors[i];
    }
    this.positionTooltip(rx, ry);
    this.tooltip.style.visibility = "visible";
  }

  protected positionTooltip(visualRX: number, visualRY: number) {
    const crect = this.container.getBoundingClientRect();
    const baseMargin = 24;
    const baseEdgePad = 8;

    const scaleX = crect.width > 0
      ? this.container.offsetWidth / crect.width
      : 1;
    const scaleY = crect.height > 0
      ? this.container.offsetHeight / crect.height
      : 1;

    const s = Math.min(scaleX, scaleY);

    const rx = visualRX * scaleX;
    const ry = visualRY * scaleY;
    const margin = baseMargin * s;
    const edgePad = baseEdgePad * s;

    this.tooltip.style.left = "0px";
    this.tooltip.style.top = "0px";

    const trect = this.tooltip.getBoundingClientRect();
    const tw = trect.width * scaleX;
    const th = trect.height * scaleY;

    const localW = this.container.offsetWidth;
    const localH = this.container.offsetHeight;

    const maxX = localW - tw - edgePad;
    const maxY = localH - th - edgePad;

    const positions = [
      { left: rx + margin, top: ry + margin },
      { left: rx + margin, top: ry - th - margin },
      { left: rx - tw - margin, top: ry + margin },
      { left: rx - tw - margin, top: ry - th - margin },
    ];

    for (const pos of positions) {
      if (
        pos.left >= edgePad &&
        pos.left <= maxX &&
        pos.top >= edgePad &&
        pos.top <= maxY
      ) {
        this.tooltip.style.left = `${pos.left}px`;
        this.tooltip.style.top = `${pos.top}px`;
        return;
      }
    }

    this.tooltip.style.left = `${
      Math.max(edgePad, Math.min(rx - margin, maxX))
    }px`;
    this.tooltip.style.top = `${
      Math.max(edgePad, Math.min(ry - margin, maxY))
    }px`;
  }

  protected hideTooltip() {
    this.tooltip.style.visibility = "hidden";
  }

  protected createText(
    parent: SVGElement,
    x: number,
    y: number,
    content: string,
    extra?: {
      anchor?: string;
      fill?: string;
      fontSize?: string;
      transform?: string;
    },
  ): SVGTextElement {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.setAttribute("x", x.toString());
    el.setAttribute("y", y.toString());
    el.setAttribute("text-anchor", extra?.anchor || "middle");
    el.setAttribute("fill", extra?.fill || "var(--text-muted)");
    el.setAttribute("font-family", "inherit");
    el.style.fontSize = extra?.fontSize || "var(--font-ui-small)";
    el.style.pointerEvents = "none";
    if (extra?.transform) el.setAttribute("transform", extra.transform);
    el.textContent = content;
    parent.appendChild(el);
    return el;
  }

  protected openFileByIndex(index: number, event: MouseEvent) {
    if (index < 0 || index >= this.filePaths.length) return;
    const filePath = this.filePaths[index];
    if (!filePath) return;

    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
      if (event.button !== 0 && event.button !== 1) return;
      if (event.button === 1) event.preventDefault();
      const modEvent = Keymap.isModEvent(event);
      this.app.workspace.openLinkText(file.path, "", modEvent);
    }
  }

  protected openContextMenuByIndex(index: number, event: MouseEvent) {
    if (index < 0 || index >= this.filePaths.length) return;
    const filePath = this.filePaths[index];
    if (!filePath) return;

    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return;

    event.preventDefault();
    const menu = new Menu();
    this.app.workspace.handleLinkContextMenu(menu, file.basename, file.path);
    menu.showAtMouseEvent(event);
  }

  protected beginRender() {
    if (this.svg?.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    if (this.padding.top / this.height > 0.2) {
      this.padding.top += 10;
    } else {
      this.padding.top = 30;
    }
    if (
      this.padding.bottom / this.height > 0.2 &&
      this.height - this.padding.bottom - 20 >
        this.padding.top
    ) {
      this.padding.bottom += 10;
    } else {
      this.padding.bottom = 30;
    }
    this.padding = { top: 30, bottom: 30, left: 30, right: 30 };

    if (this.showLegend) {
      if (this.legendSide === "top" || this.legendSide === "bottom") {
        this.chartAreaEnd = this.height - this.getLegendHeight();
      } else {
        this.padding.left += this.legendSide === "left"
          ? this.getLegendWidth()
          : 0;
        this.padding.right += this.legendSide === "right"
          ? this.getLegendWidth()
          : 0;
        this.chartAreaEnd = this.height;
      }
    } else {
      this.chartAreaEnd = this.height;
    }

    this.svg = this.createSVG(this.width, this.height);
  }

  protected finishRender() {
    if (this.legendSide === "top") {
      this.renderLegend(0);
    } else if (this.legendSide === "left") {
      this.renderLegend(this.padding.top, "left");
    } else if (this.legendSide === "right") {
      this.renderLegend(this.padding.top, "right");
    } else {
      this.renderLegend(this.chartAreaEnd);
    }
    this.container.appendChild(this.svg);
    this.attachEventListeners();
  }

  protected onMouseMove = (event: MouseEvent) => {
    if (this.tooltip?.style?.visibility === "visible") {
      const crect = this.container.getBoundingClientRect();
      this.positionTooltip(
        event.clientX - crect.left,
        event.clientY - crect.top,
      );
    }
  };

  protected attachEventListeners() {}

  protected getLegendHeight(): number {
    if (!this.showLegend || this.propertyNames.length === 0) return 0;
    if (this.legendSide === "left" || this.legendSide === "right") return 0;

    const rowHeight = 20;
    const pad = 4;
    const r = 6;
    const itemGap = 16;
    const itemTextPad = 6;
    const availableWidth = this.width - this.padding.left - this.padding.right;

    let rows = 1;
    let currentRowWidth = 0;
    for (const name of this.propertyNames) {
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

  protected getLegendWidth(): number {
    if (!this.showLegend || this.propertyNames.length === 0) return 0;
    if (this.legendSide !== "left" && this.legendSide !== "right") return 0;

    const r = 6;
    const itemGap = 12;
    const itemTextPad = 6;
    const pad = 8;
    let maxItemWidth = 0;
    for (const name of this.propertyNames) {
      const itemWidth = r * 2 + itemTextPad + name.length * 8 + itemGap;
      if (itemWidth > maxItemWidth) maxItemWidth = itemWidth;
    }
    return maxItemWidth + pad * 2;
  }

  protected renderLegend(legendY?: number, side?: "left" | "right"): number {
    if (!this.showLegend || this.propertyNames.length === 0) return 0;

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
      const totalHeight = this.propertyNames.length * rowHeight;
      const areaTop = legendY ?? this.padding.top;
      const areaHeight = this.chartAreaEnd - areaTop;
      let yStart = areaTop + pad;
      if (this.legendAlign === "center") {
        yStart = areaTop + (areaHeight - totalHeight) / 2;
      } else if (this.legendAlign === "end") {
        yStart = areaTop + areaHeight - totalHeight;
      }
      let yOffset = 0;
      this.propertyNames.forEach((name, i) => {
        const barColor = this.colors[i % this.colors.length];
        const cx = x0 + r;
        const cy = yStart + yOffset + rowHeight / 2;

        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );
        circle.setAttribute("cx", cx.toString());
        circle.setAttribute("cy", cy.toString());
        circle.setAttribute("r", r.toString());
        circle.setAttribute("fill", barColor);
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

      this.propertyNames.forEach((name, i) => {
        const barColor = this.colors[i % this.colors.length];
        const itemWidth = r * 2 + itemTextPad + name.length * 8 + itemGap;

        if (
          currentRow.length > 0 && currentRowWidth + itemWidth > availableWidth
        ) {
          rows.push(currentRow);
          currentRow = [];
          currentRowWidth = 0;
        }

        currentRow.push({ name, color: barColor });
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

  abstract render(): void;

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.render();
  }

  destroy() {
    this.container.removeEventListener("mousemove", this.onMouseMove);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
  }
}
