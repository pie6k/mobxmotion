export type ErrorInput = string | Error;

export function createError(input: ErrorInput) {
  return input instanceof Error ? input : new Error(input);
}
