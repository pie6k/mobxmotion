/**
 * Actual physics emulation happens here. This is heavily optimized for performance.
 *
 * Note: for better precision we sample steps in 1ms intervals, but we only return the last step, so if we calculate 1 frame in 60fps (16ms) - we'll actually perform 16 steps.
 * This is because it is possible that spring will move over 'central' point in one 16fps step, so force should change direction in the meanwhile, otherwise spring would keep accelerating on the other side.
 * It would be not a 'critical' bug as spring would still settle, but it would ignore subtle 'wiggle' at the end of the animation.
 */

/**
 * Each step returns new x and new velocitiy. As those are called thousands of times per second, we reuse the same array to avoid GC and constant array creation.
 * Important: as a result of this, result of this function should instantly be destructured and never mutated, eg const [newX, newV] = stepSpringOne(...)
 */
let reusedResult: [number, number] = [0, 0];

function returnReused(x: number, v: number) {
  reusedResult[0] = x;
  reusedResult[1] = v;
  return reusedResult;
}

const USE_PRECISE_EMULATION = true;

function stepSpringBy(
  deltaMS: number,
  currentX: number,
  currentVelocity: number,
  targetX: number,
  stiffness: number,
  damping: number,
  mass: number,
  clamp: boolean,
  precision: number,
): [newX: number, newV: number] {
  const deltaS = deltaMS / 1000;

  /**
   * The further we are from target, the more force spring tension will apply
   */
  const springTensionForce = -(currentX - targetX) * stiffness;
  /**
   * The faster we are moving, the more force friction force will be applied
   */
  const frictionForce = -currentVelocity * damping;

  // the bigger the mass, the less 'raw' force will actually affect the movement
  const finalForce = (springTensionForce + frictionForce) / mass;

  const newVelocity = currentVelocity + finalForce * deltaS;
  const newX = currentX + newVelocity * deltaS;

  if (clamp) {
    if (currentX < targetX && newX > targetX) {
      return returnReused(targetX, 0);
    }

    if (currentX > targetX && newX < targetX) {
      return returnReused(targetX, 0);
    }
  }

  const newDistanceToTarget = Math.abs(newX - targetX);

  // When both velocity and distance to target are under the precision, we 'snap' to the target and stop the spring
  // Otherwise - spring would keep moving, slower and slower, forever as it's energy would never fall to 0
  if (Math.abs(newVelocity) < precision && newDistanceToTarget < precision) {
    return returnReused(targetX, 0);
  }

  return returnReused(newX, newVelocity);
}

export function stepSpring(
  deltaMS: number,
  currentX: number,
  currentV: number,
  targetX: number,
  stiffness: number,
  damping: number,
  mass: number,
  clamp: boolean,
  precision: number,
): [newX: number, newV: number] {
  if (!USE_PRECISE_EMULATION) {
    return stepSpringBy(deltaMS, currentX, currentV, targetX, stiffness, damping, mass, clamp, precision);
  }

  const upperDeltaMS = Math.ceil(deltaMS);

  if (upperDeltaMS > 10_000) {
    throw new Error("Spring emulation is too long, finishing simulation");
  }

  for (let i = 1; i <= upperDeltaMS; i++) {
    // Last, sub-1ms step - do precise emulation
    if (i > deltaMS) {
      [currentX, currentV] = stepSpringBy(
        i - deltaMS,
        currentX,
        currentV,
        targetX,
        stiffness,
        damping,
        mass,
        clamp,
        precision,
      );
    } else {
      // Emulate in 1ms steps
      [currentX, currentV] = stepSpringBy(1, currentX, currentV, targetX, stiffness, damping, mass, clamp, precision);
    }
  }

  return returnReused(currentX, currentV);
}
