export function getElementOwnerWindow(element: HTMLElement | SVGElement) {
  return element.ownerDocument.defaultView;
}
