import { AnimatedSpring } from "./AnimatedSpring";
import { RefObject } from "react";
import { SpringConfigInput } from "./springConfig";
import { getElementOwnerWindow } from "./utils";

interface CurrentlyComputingStyleProperty {
  springsManager: SpringsManager | null;
  property: string;
  springIndex: number;
}

let currentlyComputingStyleProperty: CurrentlyComputingStyleProperty = {
  springsManager: null,
  property: "",
  springIndex: 0,
};

type ElementRef = RefObject<Element | null>;

export function setCurrentlyComputingStyleProperty(springsManager: SpringsManager, property: string) {
  currentlyComputingStyleProperty.springsManager = springsManager;
  currentlyComputingStyleProperty.property = property;
  currentlyComputingStyleProperty.springIndex = 0;
}

export function clearCurrentlyComputingStyleProperty() {
  currentlyComputingStyleProperty.springsManager = null;
}

export function $spring(value: number, options?: SpringConfigInput): number {
  if (!currentlyComputingStyleProperty.springsManager) {
    throw new Error("$spring can only be used inside style getters of MobxMotion components");
  }

  return currentlyComputingStyleProperty.springsManager.getSpringValue(
    currentlyComputingStyleProperty.property,
    currentlyComputingStyleProperty.springIndex++,
    value,
    options,
  );
}

const EMPTY_SPRING_CONFIG: SpringConfigInput = {};

export class SpringsManager {
  private springs: Map<string, AnimatedSpring[]> = new Map();

  constructor(private ref: ElementRef) {}

  get element() {
    return this.ref.current;
  }

  getSpringValue(property: string, springIndex: number, value: number, options?: SpringConfigInput): number {
    const element = this.element;

    // It is likely the first render, don't initialize spring yet. Simply return input value.
    if (!element) {
      return value;
    }

    let springs = this.springs.get(property);

    if (!springs) {
      springs = [];
      this.springs.set(property, springs);
    }

    let spring = springs[springIndex];

    if (!spring) {
      spring = new AnimatedSpring(value, options, getElementOwnerWindow(element));
      springs[springIndex] = spring;
    } else {
      spring.setTargetValue(value);
      spring.updateConfig(options ?? EMPTY_SPRING_CONFIG);
    }

    return spring.value;
  }

  clearUnused(usedProperties: string[]) {
    for (let [property, springs] of this.springs.entries()) {
      if (usedProperties.includes(property)) continue;

      springs = [...springs];

      this.springs.delete(property);

      for (const spring of springs) {
        spring.stop();
      }
    }
  }

  clear() {
    const springs = [...this.springs.values()].flat();

    this.springs.clear();

    for (const spring of springs) {
      spring.stop();
    }
  }
}
