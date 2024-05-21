import { Tag } from './Tag';
import type { ParseOptions } from './types';

export function hydrate(input: any, refs: Map<number, any>, options: ParseOptions): any {
  if (input === null || typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  const refsSize = refs.size;

  // Object
  if (!Array.isArray(input)) {
    refs.set(refsSize, input);

    for (const key in input) {
      const value = input[key];

      if (value !== null && typeof value === 'object') {
        input[key] = hydrate(value, refs, options);
      }
    }

    return input;
  }

  // Zero-length array
  if (input.length === 0) {
    refs.set(refsSize, input);
    return input;
  }

  const tag = input[0];

  // Non-encoded array
  if (typeof tag !== 'number' || (tag | 0) !== tag || tag < 0) {
    refs.set(refsSize, input);

    for (let index = 0; index < input.length; ++index) {
      input[index] = hydrate(input[index], refs, options);
    }
    return input;
  }

  let value;
  let values;

  switch (tag) {
    case Tag.REF:
      value = refs.get(input[1]);

      if (value === undefined) {
        throw new Error('Illegal reference: ' + input[1]);
      }
      return value;

    case Tag.UNDEFINED:
      return undefined;

    case Tag.NAN:
      return NaN;

    case Tag.POSITIVE_INFINITY:
      return Infinity;

    case Tag.NEGATIVE_INFINITY:
      return -Infinity;

    case Tag.BIGINT:
      return BigInt(input[1]);

    case Tag.ARRAY:
      input = input[1];
      refs.set(refsSize, input);

      for (let index = 0; index < input.length; ++index) {
        input[index] = hydrate(input[index], refs, options);
      }
      return input;

    case Tag.SET:
      if (input.length === 2) {
        values = input[1];
      }

      input = new Set();
      refs.set(refsSize, input);

      if (values !== undefined) {
        for (value of values) {
          input.add(hydrate(value, refs, options));
        }
      }
      return input;

    case Tag.MAP:
      if (input.length === 2) {
        values = input[1];
      }

      input = new Map();
      refs.set(refsSize, input);

      if (values !== undefined) {
        for (value of values) {
          input.set(hydrate(value[0], refs, options), hydrate(value[1], refs, options));
        }
      }
      return input;
  }

  if (options.adapters !== undefined) {
    value = hydrate(input[1], refs, options);

    for (const adapter of options.adapters) {
      if ((input = adapter.deserialize(tag, value)) !== undefined) {
        return input;
      }
    }
  }

  throw new Error('Unrecognized tag: ' + tag);
}
