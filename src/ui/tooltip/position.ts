export function computePosition(
  element: HTMLElement,
  wrapper: HTMLElement,
  rx: number,
  ry: number,
) {
  const wrapperRect = wrapper.getBoundingClientRect();
  const scaleX = wrapperRect.width > 0
    ? wrapper.offsetWidth / wrapperRect.width
    : 1;
  const scaleY = wrapperRect.height > 0
    ? wrapper.offsetHeight / wrapperRect.height
    : 1;
  const scale = Math.min(scaleX, scaleY);
  const viewX = rx * scaleX;
  const viewY = ry * scaleY;
  const margin = 24 * scale;
  const edgePadding = 8 * scale;
  element.style.left = "0px";
  element.style.top = "0px";
  const tooltipRect = element.getBoundingClientRect();
  const tooltipWidth = tooltipRect.width * scaleX;
  const tooltipHeight = tooltipRect.height * scaleY;
  const maxX = wrapper.offsetWidth - tooltipWidth - edgePadding;
  const maxY = wrapper.offsetHeight - tooltipHeight - edgePadding;
  const positions = [
    { left: viewX + margin, top: viewY + margin },
    { left: viewX + margin, top: viewY - tooltipHeight - margin },
    { left: viewX - tooltipWidth - margin, top: viewY + margin },
    {
      left: viewX - tooltipWidth - margin,
      top: viewY - tooltipHeight - margin,
    },
  ];
  for (const position of positions) {
    if (
      position.left >= edgePadding &&
      position.left <= maxX &&
      position.top >= edgePadding &&
      position.top <= maxY
    ) {
      return position;
    }
  }
  return {
    left: Math.max(edgePadding, Math.min(viewX - margin, maxX)),
    top: Math.max(edgePadding, Math.min(viewY - margin, maxY)),
  };
}
