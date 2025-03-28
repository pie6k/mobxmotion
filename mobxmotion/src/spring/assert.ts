import { ErrorInput, createError } from "./error";

export function assert(input: unknown, error?: ErrorInput): asserts input {
  if (!input) {
    throw createError(error ?? "Assertion failed");
  }
}
