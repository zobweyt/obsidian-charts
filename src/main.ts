import { Plugin } from "obsidian";
import { BarChartBasesView } from "./views/BarChartBasesView";
import { LineChartBasesView } from "./views/LineChartBasesView";
import { PieChartBasesView } from "./views/PieChartBasesView";

export default class BasesChartLayoutsPlugin extends Plugin {
  async onload() {
    this.registerBasesView(...BarChartBasesView.create());
    this.registerBasesView(...LineChartBasesView.create());
    this.registerBasesView(...PieChartBasesView.create());
  }
}
