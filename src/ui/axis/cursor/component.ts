import { Keymap, Menu, TFile } from "obsidian";
import { AxisContext } from "../context.ts";
import { Tooltip } from "../../tooltip/component.ts";

export class AxisCursor {
  private targets: SVGRectElement[] = [];
  private handlers: {
    target: SVGRectElement;
    type: string;
    handler: EventListener;
  }[] = [];
  private activeIndex: number = 0;
  private lastResolvedIndex: number = 0;

  highlight?: (index: number | null) => void;

  constructor(
    private context: AxisContext,
    private tooltip: Tooltip,
  ) {}

  private resolveIndex(event: MouseEvent): number {
    const chart = this.context.chart;
    const rect = chart.container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const cellIndex = Math.floor(
      (mouseX - chart.padding.left) / chart.groupWidth,
    );
    if (cellIndex < 0 || cellIndex >= chart.groupCount) return -1;
    return cellIndex;
  }

  private isValidIndex(index: number): boolean {
    if (index < 0) return false;
    return this.context.chart.xScale !== "numeric" ||
      this.context.chart.xValuesRaw[index] !== null;
  }

  renderTargets(parent?: SVGElement) {
    const chart = this.context.chart;
    this.targets = [];
    if (chart.groupCount <= 0 || chart.plotHeight <= 0) return;

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
      (parent || chart.svg).appendChild(rect);
      this.targets.push(rect);
    }
  }

  private onMouseEnter(index: number, event: MouseEvent) {
    this.lastResolvedIndex = index;
    if (!this.isValidIndex(index)) return;
    const chart = this.context.chart;
    const rect = chart.container.getBoundingClientRect();
    this.updateFocusableIndex(index);
    this.highlight?.(index);
    this.tooltip.show(
      index,
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
  }

  private onMouseLeave() {
    this.updateFocusableIndex(this.lastResolvedIndex);
    this.highlight?.(null);
    this.tooltip.hide();
  }

  private onMouseDown(index: number) {
    if (!this.isValidIndex(index)) return;
    this.updateFocusableIndex(index);
  }

  private onFocus(index: number, target: SVGRectElement) {
    if (!target.matches(":focus-visible")) return;
    if (!this.isValidIndex(index)) return;
    const chart = this.context.chart;
    this.updateFocusableIndex(index);
    this.highlight?.(index);
    const rect = chart.container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const x = (targetRect.left + targetRect.width / 2) - rect.left;
    const y = (targetRect.top + targetRect.height / 2) - rect.top;
    this.tooltip.show(index, x, y);
  }

  private onBlur() {
    this.highlight?.(null);
    this.tooltip.hide();
  }

  private onClick(index: number, event: MouseEvent) {
    if (!this.isValidIndex(index)) return;
    this.openFile(index, event);
  }

  private onContextMenu(index: number, event: MouseEvent) {
    if (!this.isValidIndex(index)) return;
    this.openContextMenu(index, event);
  }

  private onAuxClick(index: number, event: MouseEvent) {
    if (!this.isValidIndex(index)) return;
    if (event.button === 1) this.openFile(index, event);
  }

  private onKeyDown(index: number, event: KeyboardEvent) {
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
      this.highlight?.(nextIndex);
      this.targets[nextIndex].focus();
    }
  }

  attachEvents() {
    this.handlers = [];
    this.targets.forEach((target) => {
      const index = parseInt(target.dataset.index!, 10);

      const onMouseEnter = (event: Event) =>
        this.onMouseEnter(index, event as MouseEvent);
      const onMouseLeave = () => this.onMouseLeave();
      const onMouseDown = () => this.onMouseDown(index);
      const onFocus = () => this.onFocus(index, target);
      const onBlur = () => this.onBlur();
      const onClick = (event: Event) =>
        this.onClick(index, event as MouseEvent);
      const onContextMenu = (event: Event) =>
        this.onContextMenu(index, event as MouseEvent);
      const onAuxClick = (event: Event) =>
        this.onAuxClick(index, event as MouseEvent);
      const onKeyDown = (event: Event) =>
        this.onKeyDown(index, event as KeyboardEvent);

      target.addEventListener("mouseenter", onMouseEnter);
      target.addEventListener("mouseleave", onMouseLeave);
      target.addEventListener("mousedown", onMouseDown);
      target.addEventListener("focus", onFocus);
      target.addEventListener("blur", onBlur);
      target.addEventListener("click", onClick);
      target.addEventListener("contextmenu", onContextMenu);
      target.addEventListener("auxclick", onAuxClick);
      target.addEventListener("keydown", onKeyDown);

      this.handlers.push(
        { target, type: "mouseenter", handler: onMouseEnter },
        { target, type: "mouseleave", handler: onMouseLeave },
        { target, type: "mousedown", handler: onMouseDown },
        { target, type: "focus", handler: onFocus },
        { target, type: "blur", handler: onBlur },
        { target, type: "click", handler: onClick },
        { target, type: "contextmenu", handler: onContextMenu },
        { target, type: "auxclick", handler: onAuxClick },
        { target, type: "keydown", handler: onKeyDown },
      );
    });
  }

  destroy() {
    for (const { target, type, handler } of this.handlers) {
      target.removeEventListener(type, handler);
    }
    this.handlers = [];
    for (const target of this.targets) {
      target.remove();
    }
    this.targets = [];
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
    if (index < 0 || index >= chart.groupFilePaths.length) return;
    const filePath = chart.groupFilePaths[index][0];
    if (!filePath) return;
    const file = chart.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return;
    if (event.button === 1) event.preventDefault();
    chart.app.workspace.openLinkText(file.path, "", Keymap.isModEvent(event));
  }

  private openContextMenu(index: number, event: MouseEvent) {
    const chart = this.context.chart;
    if (index < 0 || index >= chart.groupFilePaths.length) return;
    const filePath = chart.groupFilePaths[index][0];
    if (!filePath) return;
    const file = chart.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return;
    event.preventDefault();
    const menu = new Menu();
    chart.app.workspace.handleLinkContextMenu(menu, file.name, file.path);
    menu.showAtMouseEvent(event);
  }
}
