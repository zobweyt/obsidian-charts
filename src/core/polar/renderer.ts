import { ChartRenderer } from "../base/index.ts";

export interface ArcParams {
  currentAngle: number;
  sliceAngle: number;
  outerRadius: number;
  innerRadius: number;
}

export abstract class PolarChartRenderer extends ChartRenderer {
  protected centerX = 0;
  protected centerY = 0;
  protected radius = 0;

  protected readonly ringGap = 20;

  protected computePolarLayout() {
    this.centerX = this.padding.left +
      (this.width - this.padding.left - this.padding.right) / 2;
    this.centerY = this.padding.top +
      (this.chartAreaEnd - this.padding.top - this.padding.bottom) / 2;
    this.radius = Math.min(this.centerX, this.centerY) * 0.9;
  }

  protected buildArcD(s: ArcParams): string {
    const cx = this.centerX;
    const cy = this.centerY;
    const a = s.currentAngle;
    const b = s.sliceAngle;
    const O = s.outerRadius;
    const I = s.innerRadius;
    const largeArc = b > Math.PI ? 1 : 0;

    const osx = cx + O * Math.cos(a);
    const osy = cy + O * Math.sin(a);
    const oex = cx + O * Math.cos(a + b);
    const oey = cy + O * Math.sin(a + b);

    if (I <= 0) {
      return [
        `M ${cx} ${cy}`,
        `L ${osx} ${osy}`,
        `A ${O} ${O} 0 ${largeArc} 1 ${oex} ${oey}`,
        `Z`,
      ].join(" ");
    }

    const isx = cx + I * Math.cos(a + b);
    const isy = cy + I * Math.sin(a + b);
    const iex = cx + I * Math.cos(a);
    const iey = cy + I * Math.sin(a);

    return [
      `M ${osx} ${osy}`,
      `A ${O} ${O} 0 ${largeArc} 1 ${oex} ${oey}`,
      `L ${isx} ${isy}`,
      `A ${I} ${I} 0 ${largeArc} 0 ${iex} ${iey}`,
      `Z`,
    ].join(" ");
  }

  protected computeRings(
    seriesCount: number,
    holePercent: number,
  ): { innerR: number; outerR: number }[] {
    const holeR = (holePercent / 100) * this.radius;
    const availableR = this.radius - holeR;
    const ringW = availableR / Math.max(seriesCount, 1);
    return Array.from({ length: seriesCount }, (_, i) => ({
      innerR: holeR + i * ringW,
      outerR: holeR + (i + 1) * ringW - this.ringGap,
    }));
  }
}
