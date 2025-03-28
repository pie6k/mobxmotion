import React, { FunctionComponent, HTMLAttributes, RefObject, forwardRef, useEffect, useState } from "react";
import { StyleWithTransforms, applyStyleAndVariables, computeStyleAndVariables, getChangedProperties } from "./style";
import { reaction, untracked } from "mobx";
import { useInnerForwardRef, useIsomorphicLayoutEffect } from "./hooks";

import { SpringsManager } from "./springs";
import { shallowEqual } from "./utils";

type HTMLOrSVGElement = HTMLElement | SVGElement;

export interface MobxMotionProps<ElementType extends HTMLOrSVGElement>
  extends Omit<HTMLAttributes<ElementType>, "style"> {
  ref?: RefObject<ElementType | null>;
  as?: keyof HTMLElementTagNameMap;
  style?: StyleWithTransforms;
}

export type MobxMotionComponent<ElementType extends HTMLOrSVGElement> = FunctionComponent<MobxMotionProps<ElementType>>;

export function createMobxMotionComponent<ElementType extends HTMLOrSVGElement>(
  componentName: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap,
): MobxMotionComponent<ElementType> {
  const MobxMotion = forwardRef<ElementType, MobxMotionProps<ElementType>>(function MobxMotion(
    { style, as = componentName, ...props },
    forwardedRef,
  ) {
    const ref = useInnerForwardRef(forwardedRef);
    const [springsManager] = useState(() => new SpringsManager(ref));

    useIsomorphicLayoutEffect(() => {
      if (!style) {
        springsManager.clear();
        return;
      }

      const element = ref.current;

      if (!element) return;

      return reaction(
        () => {
          return computeStyleAndVariables(style, springsManager);
        },
        (stylesAndVariables, previousStylesAndVariables) => {
          const changedProperties = getChangedProperties(stylesAndVariables, previousStylesAndVariables);

          applyStyleAndVariables(element, changedProperties);
        },
        { equals: shallowEqual },
      );
    }, [style]);

    useEffect(() => {
      return () => {
        // not unmounting
        if (ref.current) return;

        springsManager.clear();
      };
    }, []);

    const Element = as as "div";

    return (
      <Element
        ref={ref as unknown as RefObject<HTMLDivElement>}
        {...(props as MobxMotionProps<HTMLDivElement>)}
        style={untracked(() => {
          if (!style) return undefined;

          return computeStyleAndVariables(style, springsManager);
        })}
      />
    );
  });

  MobxMotion.displayName = `MobxMotion__${componentName}`;

  return MobxMotion;
}
