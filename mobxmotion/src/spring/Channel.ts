type Subscriber<T> = (value: T) => void;

export class Channel<T> {
  private subscribers = new Map<Symbol, Subscriber<T>>();

  subscribe(subscriber: Subscriber<T>) {
    const symbol = Symbol();
    this.subscribers.set(symbol, subscriber);

    return () => {
      this.subscribers.delete(symbol);
    };
  }

  emit(value: T) {
    for (const subscriber of this.subscribers.values()) {
      subscriber(value);
    }
  }

  destroy() {
    this.subscribers.clear();
  }
}
