export interface SpringConfig {
  /**
   * It tells how much "target value" wants to bring current value to itself.
   *
   * It means the further away the current value is from the target value, the bigger force will be applied if stiffness is big.
   *
   * F = DISTANCE TO TARGET * STIFFNESS
   */
  stiffness: number;
  /**
   * "Stopping force" that works against current movement (velocity). It's like air-resistance.
   * The faster the object moves, the more resistance it will have. The slower it moves, the less resistance it will have.
   * F = CURRENT VELOCITY * DAMPING
   *
   * It can be thought of as "stopping easing" - if it's bigger, fast moving objects will stop faster.
   * It will barely affect "getting up to speed" as slowly moving object will not have much 'resistance' - you need mass for that.
   */
  damping: number;
  /**
   * The bigger the mass, the more object wants to keep its "current velocity".
   *
   * It means it will "get up to speed" more slowly, but will also "slow down" more slowly.
   *
   * It can be thought of as "starting easing"
   */
  mass: number;

  /**
   * If true, value will never overshoot the target value. It will stop at the target value
   */
  clamp: boolean;

  /**
   * If set, value will be rounded to this precision
   */
  precision: number;
}

export type SpringConfigInput = Partial<SpringConfig>;

export const DEFAULT_SPRING_CONFIG: SpringConfig = {
  stiffness: 300,
  damping: 30,
  mass: 1,
  clamp: false,
  precision: 0.002,
};

export function resolveSpringConfigInput(input?: SpringConfigInput): SpringConfig {
  return {
    ...DEFAULT_SPRING_CONFIG,
    ...input,
  };
}

export function validateSpringConfig(input: SpringConfig) {
  if (input.mass! < 0) {
    throw new Error("Mass value must be greater or equal 0");
  }

  if (input.stiffness! <= 0) {
    throw new Error("Stiffness value must be greater than 0");
  }

  if (input.precision! <= 0) {
    throw new Error("Precision must be greater than 0");
  }
}
