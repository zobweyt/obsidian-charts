import { AxisContext, AxisType, createAxisContext } from "./context.ts";
import { AxisLabels } from "./labels/component.ts";
import { AxisLines } from "./lines/component.ts";
import { AxisReferenceLine } from "./reference/component.ts";
import { AxisCursor } from "./cursor/component.ts";
import { AxisTooltip } from "./tooltip/component.ts";
import type { ChartContext } from "../chart/context.ts";

export class Axis<T extends AxisType> {
  context: AxisContext;
  label: AxisLabels;
  line: AxisLines;
  refLine?: AxisReferenceLine;
  cursor?: AxisCursor;
  tooltip?: AxisTooltip;

  constructor(context: ChartContext, type: T) {
    this.context = createAxisContext(context, type);
    this.label = new AxisLabels(this.context);
    this.line = new AxisLines(this.context);
    if (type === "y") {
      this.tooltip = new AxisTooltip(this.context);
      this.cursor = new AxisCursor(this.context, this.tooltip);
      this.refLine = new AxisReferenceLine(this.context);
    }
  }
}
