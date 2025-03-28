import { DependencyList, useLayoutEffect } from "react";
import { ForwardedRef, RefObject, useMemo } from "react";

export function applyValueToForwardedRef<T>(forwardedRef: ForwardedRef<T>, value: T) {
  if (typeof forwardedRef === "function") {
    forwardedRef(value);
  } else if (forwardedRef != null) {
    forwardedRef.current = value;
  }
}

export function useInnerForwardRef<T>(forwardedRef: ForwardedRef<T>) {
  const innerRefObject = useMemo<RefObject<T | null>>(() => {
    let currentValue: T | null = null;

    return {
      get current() {
        return currentValue;
      },
      set current(value) {
        currentValue = value;
        applyValueToForwardedRef(forwardedRef, value);
      },
    };
  }, [forwardedRef]);

  return innerRefObject;
}

const IS_SERVER = typeof window === "undefined";

export function useIsomorphicLayoutEffect(effect: () => void, deps: DependencyList) {
  if (IS_SERVER) return;

  useLayoutEffect(() => {
    effect();
  }, deps);
}
