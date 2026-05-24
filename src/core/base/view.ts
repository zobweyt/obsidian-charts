import { BasesView, QueryController } from "obsidian";
import { ChartRenderer, ChartRendererOptions } from "./renderer.ts";

type RendererConstructor = new (options: ChartRendererOptions) => ChartRenderer;

export class ChartBasesView extends BasesView {
  protected renderer: ChartRenderer | null = null;
  readonly container: HTMLElement;

  constructor(
    controller: QueryController,
    parent: HTMLElement,
    public readonly type: string,
    private rendererCtor: RendererConstructor,
  ) {
    super(controller);
    this.container = parent;
  }

  override onDataUpdated() {
    if (this.renderer) {
      this.renderer.destroy();
    }

    this.renderer = new this.rendererCtor({
      container: this.container,
      queryResult: this.data,
      config: this.config,
      app: this.app,
    });
    this.renderer.render();
  }

  override onunload() {
    this.renderer?.destroy();
    super.onunload();
  }
}
