import { linear } from "../../lib/curve/linear.ts";
import { bump } from "../../lib/curve/bump.ts";
import { natural } from "../../lib/curve/natural.ts";
import { monotone } from "../../lib/curve/monotone.ts";
import { step } from "../../lib/curve/step.ts";
import { stepbefore } from "../../lib/curve/stepbefore.ts";
import { stepafter } from "../../lib/curve/stepafter.ts";
import { Point } from "../../lib/point.ts";

const curves: Record<
  string,
  (points: Point[], close?: boolean, bottom?: number) => string
> = {
  linear,
  bump,
  natural,
  monotone,
  step,
  stepbefore,
  stepafter,
};

export function createPath(
  points: Point[],
  curve: string,
  close: boolean,
  bottom: number,
): string {
  const fn = curves[curve];
  if (fn) return fn(points, close, bottom);
  return linear(points, close, bottom);
}
