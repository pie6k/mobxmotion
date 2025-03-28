import { SpringsManager, clearCurrentlyComputingStyleProperty, setCurrentlyComputingStyleProperty } from "./springs";

import { CSSProperties } from "react";
import { typedEntries } from "./utils";

type HTMLOrSVGElement = HTMLElement | SVGElement;

type AnyVariableStyle = {
  [key in `--${string}`]: string | number;
};

type TransformProperties = {
  x?: number;
  y?: number;
  rotateZ?: number;
  scale?: number;
};

export type StyleWithTransforms = CSSProperties & AnyVariableStyle & TransformProperties;
export type StyleAndVariables = CSSProperties & AnyVariableStyle;

function resolveStyleInput(style: StyleWithTransforms): StyleAndVariables {
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

export function computeStyleAndVariables(style: StyleWithTransforms, springs: SpringsManager): StyleAndVariables {
  const computedStyles: StyleWithTransforms = {};

  for (const key in style) {
    setCurrentlyComputingStyleProperty(springs, key);

    // @ts-ignore
    computedStyles[key] = style[key];

    clearCurrentlyComputingStyleProperty();
  }

  return resolveStyleInput(computedStyles);
}

function getIsCSSVariableString(key: string): key is `--${string}` {
  return key.startsWith("--");
}

export function getChangedProperties(
  styleAndVariables: StyleAndVariables,
  previousStylesAndVariables: StyleAndVariables,
): StyleAndVariables {
  const changedProperties: StyleAndVariables = {};

  for (const [key, value] of typedEntries(styleAndVariables)) {
    if (previousStylesAndVariables[key] !== value) {
      // @ts-ignore
      changedProperties[key] = value;
    }
  }

  return changedProperties;
}

export function applyStyleAndVariables(element: HTMLOrSVGElement, styleAndVariables: StyleAndVariables) {
  const style = element.style;

  for (const [key, value] of typedEntries(styleAndVariables)) {
    if (getIsCSSVariableString(key)) {
      style.setProperty(key, `${value}`);
    } else {
      // @ts-ignore
      style[key] = value;
    }
  }
}
