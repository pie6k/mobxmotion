import { Channel } from "./Channel";
import { NumberSpring } from "./NumberSpring";
import { SpringConfigInput } from "./config";
import { raf } from "./raf";

export class AutoNumberSpring extends NumberSpring {
  constructor(
    initialValue: number,
    config?: SpringConfigInput,
    private targetWindow?: Window | null,
  ) {
    super(initialValue, config);
  }

  setTargetValue(value: number, velocity?: number) {
    const wasAtRest = this.isAtRest;

    super.setTargetValue(value);

    if (velocity !== undefined) {
      this.currentVelocity = velocity;
    }

    this.framesSinceTargetChange = 0;

    if (wasAtRest && !this.isAtRest && !this.isAnimating) {
      this.animateWhileNotAtRest();
    }
  }

  private framesSinceTargetChange = 0;

  snapToTarget(target = this.targetValue): void {
    super.snapToTarget(target);
    this.publish();
  }

  private changesChannel = new Channel<number>();

  private publish() {
    this.changesChannel.emit(this.value);
  }

  private isAnimating = false;

  private async animateWhileNotAtRest() {
    if (this.isAnimating) {
      console.warn("Spring is already animating");
      return;
    }

    this.isAnimating = true;

    let lastFrameTime = await raf(this.targetWindow ?? window);

    while (!this.isAtRest) {
      if (!this.isAnimating) break;

      const time = await raf(this.targetWindow ?? window);

      if (!this.isAnimating) break;

      const deltaTime = time - lastFrameTime;

      lastFrameTime = time;

      super.advanceTimeBy(deltaTime);

      if (this.framesSinceTargetChange++ > 2000) {
        console.warn("Spring is not settling");
        super.snapToTarget();
        this.publish();
        break;
      }

      this.publish();
    }

    this.isAnimating = false;
  }

  onChange(callback: (value: number) => void) {
    return this.changesChannel.subscribe(callback);
  }

  destroy() {
    this.isAnimating = false;
    this.stop();
    this.changesChannel.destroy();
  }
}
