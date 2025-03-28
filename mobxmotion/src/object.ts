export type AnyObject = Record<keyof unknown, unknown>;

export function objectMap<O extends AnyObject, NV>(
  input: O,
  mapper: (value: O[keyof O], key: keyof O) => NV,
): Record<keyof O, NV> {
  const mappedObject = {} as Record<keyof O, NV>;
  typedKeys(input).forEach((key) => {
    const oldValue = input[key];
    const newValue = mapper(oldValue, key);

    mappedObject[key] = newValue;
  });

  return mappedObject;
}

export function typedKeys<O>(input: O): Array<keyof O> {
  return Object.keys(input as any) as Array<keyof O>;
}

export function typedEntries<T extends object>(input: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(input) as Array<[keyof T, T[keyof T]]>;
}

export function removeUndefined<T>(input: T) {
  const output = {} as T;

  for (const key in input) {
    if (input[key] !== undefined) {
      output[key] = input[key];
    }
  }

  return output;
}

type AnyKey = string | number | symbol;

export function swapObjectKeysAndValues<K extends AnyKey, V extends AnyKey>(input: Record<K, V>): Record<V, K> {
  const output = {} as Record<V, K>;

  for (const key in input) {
    output[input[key]] = key;
  }

  return output;
}

export function mapEntries<K extends AnyKey, V, NK extends AnyKey, NV>(
  input: Record<K, V>,
  mapper: (key: K, value: V) => [NK, NV],
): Record<NK, NV> {
  const output = {} as Record<NK, NV>;

  for (const [key, value] of typedEntries(input)) {
    const [newKey, newValue] = mapper(key, value);
    output[newKey] = newValue;
  }

  return output;
}
