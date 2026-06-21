export function createSvgTextElement(
  parent: SVGElement,
  x: number,
  y: number,
  content: string,
  extra?: { anchor?: string; fill?: string; transform?: string; cls?: string },
): SVGTextElement {
  const element = createSvg("text", {
    cls: "bases-chart-label",
    attr: { x, y, "text-anchor": extra?.anchor || "middle" },
    parent,
  });
  if (extra?.cls) element.classList.add(extra.cls);
  element.textContent = content;
  element.style.fill = extra?.fill || "var(--text-muted)";
  if (extra?.transform) element.setAttribute("transform", extra.transform);
  return element;
}

export function computeDashArray(lineStyle: string): string {
  return lineStyle === "dotted" ? "2,2" : "4,4";
}

export function createSvgGridLine(
  parent: SVGElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth?: number,
  strokeStyle?: string,
): SVGLineElement {
  const line = createSvg("line", {
    attr: { x1, x2, y1, y2, stroke: "var(--bases-table-border-color)" },
  });
  if (strokeStyle && strokeStyle !== "solid") {
    line.setAttribute("stroke-dasharray", computeDashArray(strokeStyle));
  }
  if (strokeWidth) line.setAttribute("stroke-width", strokeWidth.toString());
  parent.appendChild(line);
  return line;
}

let gradientCounter = 0;

export function createGradient(
  svg: SVGSVGElement,
  color: string,
  seriesIndex: number,
  segmentIndex: number,
): string {
  let defs = svg.querySelector("defs") as SVGDefsElement | null;
  if (!defs) {
    defs = createSvg("defs") as SVGDefsElement;
    svg.insertBefore(defs, svg.firstChild);
  }

  const id =
    `line-gradient-${seriesIndex}-${segmentIndex}-${gradientCounter++}`;
  const gradient = createSvg("linearGradient", {
    attr: {
      id,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    },
  });

  const stop1 = createSvg("stop", {
    attr: {
      offset: "0%",
      "stop-color": color,
      "stop-opacity": "0.25",
    },
  });
  const stop2 = createSvg("stop", {
    attr: {
      offset: "100%",
      "stop-color": color,
      "stop-opacity": "0",
    },
  });

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);

  return `url(#${id})`;
}

export function resolveColor(element: HTMLElement, value: string): string {
  if (!value.startsWith("var(")) return value;
  return getComputedStyle(element).getPropertyValue(value.slice(4, -1).trim())
    .trim() || value;
}

export function clipPath(
  svg: SVGSVGElement,
  x: number,
  y: number,
  width: number,
  height: number,
): string {
  let defs = svg.querySelector("defs") as SVGDefsElement | null;
  if (!defs) {
    defs = createSvg("defs") as SVGDefsElement;
    svg.insertBefore(defs, svg.firstChild);
  }
  defs.querySelector("#chart-clip")?.remove();
  const clipPathElement = createSvg("clipPath", { attr: { id: "chart-clip" } });
  const rect = createSvg("rect");
  rect.setAttribute("x", x.toString());
  rect.setAttribute("y", y.toString());
  rect.setAttribute("width", Math.max(0, width).toString());
  rect.setAttribute("height", Math.max(0, height).toString());
  clipPathElement.appendChild(rect);
  defs.appendChild(clipPathElement);
  return "chart-clip";
}
