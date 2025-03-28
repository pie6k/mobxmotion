export function getElementOwnerWindow(element: Element) {
  return element.ownerDocument.defaultView;
}

export type AnyObject = Record<keyof unknown, unknown>;

export function typedKeys<O>(input: O): Array<keyof O> {
  return Object.keys(input as any) as Array<keyof O>;
}

export function typedEntries<T extends object>(input: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(input) as Array<[keyof T, T[keyof T]]>;
}

export function shallowEqual(a: unknown, b: unknown) {
  if (a === b) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    // @ts-ignore
    if (a[key] !== b[key]) return false;
  }

  return true;
}

const currentRafPromise = new WeakMap<Window, Promise<number>>();

export function raf(targetWindow: Window = window) {
  let promise = currentRafPromise.get(targetWindow);

  if (promise) return promise;

  promise = new Promise<number>((resolve) => {
    targetWindow.requestAnimationFrame(resolve);
  }).finally(() => {
    currentRafPromise.delete(targetWindow);
  });

  currentRafPromise.set(targetWindow, promise);

  return promise;
}
