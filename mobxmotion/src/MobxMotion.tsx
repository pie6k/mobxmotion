import { AutoNumberSpring, SpringConfigInput } from "./spring";
import { IAtom, createAtom, reaction, untracked } from "mobx";
import React, { CSSProperties, HTMLAttributes, ReactNode, RefObject, forwardRef, useEffect } from "react";
import { Thunk, resolveThunk } from "./thunk";

import { createMicrotaskGroup } from "./microtask";
import { getElementOwnerWindow } from "./window";
import { shallowEqual } from "fast-equals";
import { typedEntries } from "./object";
import { useInnerForwardRef } from "./ref";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

type HTMLOrSVGElement = HTMLElement | SVGElement;

interface MobxSpringObject {
  target: number;
  springConfig?: SpringConfigInput;
}

type ElementRef = RefObject<HTMLOrSVGElement | null>;

type AnyVariableStyle = {
  [key in `--${string}`]: string | number;
};

type TransformProperties = {
  x?: number;
  y?: number;
  rotateZ?: number;
  scale?: number;
};

type ElementStyle = CSSProperties & AnyVariableStyle & TransformProperties;
type StyleAndVariables = CSSProperties & AnyVariableStyle;

type MobxMotionStyle = {
  [key in keyof ElementStyle]?: Thunk<ElementStyle[key]>;
};

interface CurrentlyComputingStyleProperty {
  ref: ElementRef;
  key: string;
  springIndex: number;
}

let currentlyComputingStyleProperty: CurrentlyComputingStyleProperty | null = null;

const reusableCurrentlyComputingStyleProperty: CurrentlyComputingStyleProperty = {
  ref: null as unknown as ElementRef,
  key: "",
  springIndex: 0,
};

function reuseCurrentlyComputingStyleProperty(ref: ElementRef, key: string) {
  reusableCurrentlyComputingStyleProperty.ref = ref;
  reusableCurrentlyComputingStyleProperty.key = key;
  reusableCurrentlyComputingStyleProperty.springIndex = 0;

  return reusableCurrentlyComputingStyleProperty;
}

export function $spring(value: number, options?: SpringConfigInput): number {
  if (!currentlyComputingStyleProperty) {
    throw new Error("mobxSpring can only be used inside a MobxMotion component");
  }

  currentlyComputingStyleProperty.springIndex++;

  const spring = getOrCreateElementPropSpring(currentlyComputingStyleProperty, {
    target: value,
    springConfig: options,
  });

  if (!spring) return value;

  return spring.value;
}

function resolveStyleInput(style: ElementStyle): StyleAndVariables {
  const { x, y, rotateZ, scale, ...cssProperties } = style;

  let finalTransforms: string[] = cssProperties.transform ? [cssProperties.transform] : [];

  if (x !== undefined) {
    finalTransforms.push(`translateX(${x}px)`);
  }

  if (y !== undefined) {
    finalTransforms.push(`translateY(${y}px)`);
  }

  if (rotateZ !== undefined) {
    finalTransforms.push(`rotateZ(${rotateZ}deg)`);
  }

  if (scale !== undefined) {
    finalTransforms.push(`scale(${scale})`);
  }

  const finalTransform = finalTransforms.length > 0 ? finalTransforms.join(" ") : "";

  if (finalTransform) {
    cssProperties.transform = finalTransform;
  }

  return cssProperties;
}

function computeStyleAndVariables(style: MobxMotionStyle, ref: ElementRef): StyleAndVariables {
  const computedStyles: ElementStyle = {};

  for (const key in style) {
    currentlyComputingStyleProperty = reuseCurrentlyComputingStyleProperty(ref, key);

    Reflect.set(computedStyles, key, resolveThunk(Reflect.get(style, key)));

    currentlyComputingStyleProperty = null;
  }

  return resolveStyleInput(computedStyles);
}

export interface MobxMotionProps<ElementType extends HTMLOrSVGElement>
  extends Omit<HTMLAttributes<ElementType>, "style"> {
  ref?: RefObject<ElementType | null>;
  as?: keyof HTMLElementTagNameMap;
  style?: MobxMotionStyle;
  isPaused?: boolean;
}

const elementsSpringsRegistry = new WeakMap<ElementRef, Map<string, AutoNumberSpring[]>>();
const elementStyleChangedAtom = new WeakMap<ElementRef, IAtom>();

function destroyMobxMotionElement(ref: ElementRef) {
  const keysSprings = elementsSpringsRegistry.get(ref);

  if (keysSprings) {
    keysSprings.forEach((springs) => {
      springs.forEach((spring) => {
        spring.destroy();
      });
    });

    keysSprings.clear();
  }
}

function getStyleChangedAtom(ref: ElementRef) {
  let atom = elementStyleChangedAtom.get(ref);

  if (!atom) {
    atom = createAtom("Style Changed");

    elementStyleChangedAtom.set(ref, atom);
  }

  return atom;
}

function reportStyleChanged(ref: ElementRef) {
  const atom = getStyleChangedAtom(ref);
  atom.reportChanged();
}

function reportStyleObserved(ref: ElementRef) {
  const atom = getStyleChangedAtom(ref);

  atom.reportObserved();
}

function getOrCreateElementPropSpring(
  currentlyComputingStyleProperty: CurrentlyComputingStyleProperty,
  springValue: MobxSpringObject,
) {
  const { ref, key, springIndex } = currentlyComputingStyleProperty;

  if (!ref.current) return null;

  let elementSprings = elementsSpringsRegistry.get(ref);

  if (!elementSprings) {
    elementSprings = new Map();
    elementsSpringsRegistry.set(ref, elementSprings);
  }

  let propSprings = elementSprings.get(key);

  if (!propSprings) {
    propSprings = [];
    elementSprings.set(key, propSprings);
  }

  let propSpring = propSprings[springIndex];

  if (!propSpring) {
    propSpring = new AutoNumberSpring(springValue.target, springValue.springConfig, getElementOwnerWindow(ref.current));

    propSprings[springIndex] = propSpring;

    propSpring.onChange(() => {
      reportStyleChanged(ref);
    });
  } else {
    propSpring.setTargetValue(springValue.target);
    propSpring.updateConfig(springValue.springConfig ?? {});
  }

  return propSpring;
}

function getIsCSSVariableString(key: string): key is `--${string}` {
  return key.startsWith("--");
}

function getChangedProperties(
  styleAndVariables: StyleAndVariables,
  previousStylesAndVariables: StyleAndVariables,
): StyleAndVariables {
  const changedProperties: StyleAndVariables = {};

  for (const [key, value] of typedEntries(styleAndVariables)) {
    if (previousStylesAndVariables[key] !== value) {
      Reflect.set(changedProperties, key, value);
    }
  }

  return changedProperties;
}

function applyStyleAndVariables(element: HTMLOrSVGElement, styleAndVariables: StyleAndVariables) {
  const style = element.style;

  for (const [key, value] of typedEntries(styleAndVariables)) {
    if (getIsCSSVariableString(key)) {
      style.setProperty(key, `${value}`);
    } else {
      Reflect.set(style, key, value);
    }
  }
}

const microtask = createMicrotaskGroup();

export type MobxMotionComponent<ElementType extends HTMLOrSVGElement> = (
  props: MobxMotionProps<ElementType>,
) => ReactNode;

export function createMobxMotionComponent<ElementType extends HTMLElement | SVGElement>(
  componentName: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap,
): MobxMotionComponent<ElementType> {
  const MobxMotion = forwardRef<ElementType, MobxMotionProps<ElementType>>(function MobxMotion(
    { style, isPaused, as = componentName, ...props },
    forwardedRef,
  ) {
    const ref = useInnerForwardRef(forwardedRef);

    useIsomorphicLayoutEffect(() => {
      if (!style) return;
      if (isPaused) return;

      const element = ref.current;

      if (!element) return;

      return reaction(
        () => {
          reportStyleObserved(ref);

          return computeStyleAndVariables(style, ref);
        },
        (stylesAndVariables, previousStylesAndVariables) => {
          const changedProperties = getChangedProperties(stylesAndVariables, previousStylesAndVariables);

          applyStyleAndVariables(element, changedProperties);
        },
        { scheduler: microtask, equals: shallowEqual },
      );
    }, [style, isPaused]);

    useEffect(() => {
      return () => {
        // not unmounting
        if (ref.current) return;
        destroyMobxMotionElement(ref);
      };
    }, []);

    const Element = as as "div";

    return (
      <Element
        ref={ref as unknown as RefObject<HTMLDivElement>}
        {...(props as MobxMotionProps<HTMLDivElement>)}
        style={untracked(() => {
          if (!style) return undefined;

          return computeStyleAndVariables(style, ref);
        })}
      />
    );
  });

  MobxMotion.displayName = `MobxMotion${componentName}`;

  return MobxMotion;
}
