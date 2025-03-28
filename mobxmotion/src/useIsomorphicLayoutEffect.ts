import { DependencyList } from "react";
import { useLayoutEffect } from "react";

export function useIsomorphicLayoutEffect(effect: () => void, deps: DependencyList) {
  useLayoutEffect(() => {
    effect();
  }, deps);
}
