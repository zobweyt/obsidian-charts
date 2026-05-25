import { Keymap, Menu, TFile } from "obsidian";
import type { AxisContext } from "../context.ts";
import type { AxisTooltip } from "../tooltip/component.ts";

export class AxisCursor {
  private shadowRects = new Map<number, SVGRectElement>();
  private targets: SVGRectElement[] = [];

  constructor(
    private context: AxisContext,
    private tooltip: AxisTooltip,
  ) {}

  renderShadows() {
    const chart = this.context.chart;
    for (let index = 0; index < chart.groupCount; index++) {
      const x = chart.padding.left + chart.groupWidth * index;
      const rect = createSvg("rect", {
        attr: {
          x,
          y: chart.padding.top,
          width: chart.groupWidth,
          height: chart.plotHeight,
          fill: "var(--background-modifier-hover)",
          opacity: "0",
        },
      });
      rect.style.pointerEvents = "none";
      chart.svg.appendChild(rect);
      this.shadowRects.set(index, rect);
    }
  }

  renderTargets() {
    const chart = this.context.chart;
    for (let index = 0; index < chart.groupCount; index++) {
      const x = chart.padding.left + chart.groupWidth * index;
      const rect = createSvg("rect", {
        cls: "bases-chart-cursor-target",
        attr: {
          x,
          y: chart.padding.top,
          width: chart.groupWidth,
          height: chart.plotHeight,
          fill: "transparent",
        },
      });
      rect.dataset.index = index.toString();
      chart.svg.appendChild(rect);
      this.targets.push(rect);
    }
  }

  attachEvents() {
    const chart = this.context.chart;
    this.targets.forEach((target) => {
      const index = parseInt(target.dataset.index!, 10);
      target.addEventListener("mouseenter", (event) => {
        const rect = chart.container.getBoundingClientRect();
        this.show(index);
        this.tooltip.show(
          index,
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
      });
      target.addEventListener("mouseleave", () => {
        this.hide(index);
        this.tooltip.hide();
      });
      target.addEventListener("click", (event) => {
        this.openFile(index, event);
      });
      target.addEventListener("contextmenu", (event) => {
        this.openContextMenu(index, event);
      });
      target.addEventListener("auxclick", (event) => {
        if (event.button === 1) this.openFile(index, event);
      });
    });
  }

  private openFile(index: number, event: MouseEvent) {
    const chart = this.context.chart;
    const filePaths = chart.data.data.map((entry) => entry.file.path);
    if (index < 0 || index >= filePaths.length) return;
    const filePath = filePaths[index];
    if (!filePath) return;
    const file = chart.app.vault.getAbstractFileByPath(filePath);
    if (
      !(file instanceof TFile) || (event.button !== 0 && event.button !== 1)
    ) {
      return;
    }
    if (event.button === 1) event.preventDefault();
    chart.app.workspace.openLinkText(file.path, "", Keymap.isModEvent(event));
  }

  private openContextMenu(index: number, event: MouseEvent) {
    const chart = this.context.chart;
    const filePaths = chart.data.data.map((entry) => entry.file.path);
    if (index < 0 || index >= filePaths.length) return;
    const filePath = filePaths[index];
    if (!filePath) return;
    const file = chart.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return;
    event.preventDefault();
    const menu = new Menu();
    chart.app.workspace.handleLinkContextMenu(menu, file.name, file.path);
    menu.showAtMouseEvent(event);
  }

  private show(index: number) {
    this.shadowRects.get(index)?.setAttribute("opacity", "1");
  }

  private hide(index: number) {
    this.shadowRects.get(index)?.setAttribute("opacity", "0");
  }
}
