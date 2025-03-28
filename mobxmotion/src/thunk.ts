export type Thunk<T> = T | (() => T);

export function resolveThunk<T>(thunk: Thunk<T>): T {
  if (typeof thunk === "function") {
    return (thunk as () => T)();
  }

  return thunk as T;
}

export function getIsThunkFunction<T>(value: T | Thunk<T>): value is () => T {
  return typeof value === "function";
}
