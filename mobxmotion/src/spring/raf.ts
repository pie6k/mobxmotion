const currentRafPromise = new Map<Window, Promise<number>>();

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
