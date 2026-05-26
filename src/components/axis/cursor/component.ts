import { Keymap, Menu, TFile } from "obsidian";
import type { AxisContext } from "../context.ts";
import type { AxisTooltip } from "../tooltip/component.ts";

export class AxisCursor {
  private targets: SVGRectElement[] = [];
  private activeIndex: number = 0;

  constructor(
    private context: AxisContext,
    private tooltip: AxisTooltip,
  ) {}

  renderTargets() {
    const chart = this.context.chart;
    this.targets = [];

    for (let index = 0; index < chart.groupCount; index++) {
      const x = chart.padding.left + chart.groupWidth * index;
      const rect = createSvg("rect", {
        cls: "bases-chart-cursor-target",
        attr: {
          x,
          y: chart.padding.top,
          width: chart.groupWidth,
          height: chart.plotHeight,
          tabindex: index === this.activeIndex ? 0 : -1,
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
        this.updateFocusableIndex(index);
        this.tooltip.show(
          index,
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
      });

      target.addEventListener("mouseleave", () => {
        this.updateFocusableIndex(index);
        this.tooltip.hide();
      });

      target.addEventListener("mousedown", () => {
        this.updateFocusableIndex(index);
      });

      target.addEventListener("focus", () => {
        if (!target.matches(":focus-visible")) return;

        this.updateFocusableIndex(index);
        const rect = chart.container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const x = (targetRect.left + targetRect.width / 2) - rect.left;
        const y = (targetRect.top + targetRect.height / 2) - rect.top;

        this.tooltip.show(index, x, y);
      });

      target.addEventListener("blur", () => {
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

      target.addEventListener("keydown", (event) => {
        let nextIndex = index;

        switch (event.key) {
          case "ArrowRight":
            nextIndex = Math.min(this.targets.length - 1, index + 1);
            event.preventDefault();
            break;
          case "ArrowLeft":
            nextIndex = Math.max(0, index - 1);
            event.preventDefault();
            break;
          case "Home":
            nextIndex = 0;
            event.preventDefault();
            break;
          case "End":
            nextIndex = this.targets.length - 1;
            event.preventDefault();
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            this.openFile(index, event as unknown as MouseEvent);
            return;
          default:
            return;
        }

        if (nextIndex !== index && this.targets[nextIndex]) {
          this.targets[nextIndex].focus();
        }
      });
    });
  }

  private updateFocusableIndex(newIndex: number) {
    if (newIndex < 0 || newIndex >= this.targets.length) return;
    if (this.targets[this.activeIndex]) {
      this.targets[this.activeIndex].setAttribute("tabindex", "-1");
    }
    this.activeIndex = newIndex;
    if (this.targets[this.activeIndex]) {
      this.targets[this.activeIndex].setAttribute("tabindex", "0");
    }
  }

  private openFile(index: number, event: MouseEvent) {
    const chart = this.context.chart;
    const filePaths = chart.data.data.map((entry) => entry.file.path);
    if (index < 0 || index >= filePaths.length) return;
    const filePath = filePaths[index];
    if (!filePath) return;
    const file = chart.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return;
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
}
