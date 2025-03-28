import { ForwardedRef, RefObject, useCallback, useMemo, useRef } from "react";

export function useFreshValueGetter<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return useCallback(() => ref.current, []);
}

export function useCurrentValueRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

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
