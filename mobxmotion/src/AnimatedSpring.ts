import { Spring } from "./Spring";
import { SpringConfigInput } from "./springConfig";
import { raf } from "./utils";

export class AnimatedSpring extends Spring {
  constructor(
    initialValue: number,
    config?: SpringConfigInput,
    private targetWindow?: Window | null,
  ) {
    super(initialValue, config);
  }

  setTargetValue(value: number) {
    if (this.targetValue === value) return;

    const wasAtRest = this.isAtRest;

    super.setTargetValue(value);

    if (wasAtRest && !this.isAtRest && !this.isAnimating) {
      this.animateWhileNotAtRest();
    }
  }

  private isAnimating = false;

  private async animateWhileNotAtRest() {
    const targetWindow = this.targetWindow ?? window;
    if (this.isAnimating) {
      console.warn("Spring is already animating");
      return;
    }

    this.isAnimating = true;

    let lastFrameTime = await raf(targetWindow);

    while (!this.isAtRest) {
      if (!this.isAnimating) break;

      const time = await raf(targetWindow);

      if (!this.isAnimating) break;

      const deltaTime = time - lastFrameTime;

      lastFrameTime = time;

      super.advanceTimeBy(deltaTime);
    }

    this.isAnimating = false;
  }

  stop() {
    this.isAnimating = false;
    super.stop();
  }
}
