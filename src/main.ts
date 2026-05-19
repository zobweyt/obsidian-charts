import { Plugin } from "obsidian";
import { BarChartBasesView } from "./views/BarChartBasesView.ts";
import { LineChartBasesView } from "./views/LineChartBasesView.ts";
import { PieChartBasesView } from "./views/PieChartBasesView.ts";

export default class BasesChartLayoutsPlugin extends Plugin {
  public override onload() {
    this.registerBasesView(...BarChartBasesView.create());
    this.registerBasesView(...LineChartBasesView.create());
    this.registerBasesView(...PieChartBasesView.create());
  }
}
