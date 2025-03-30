import { SerializationOptions } from './types';
import {
  TAG_ARRAY,
  TAG_BIGINT,
  TAG_NAN,
  TAG_NEGATIVE_INFINITY,
  TAG_POSITIVE_INFINITY,
  TAG_REF,
  TAG_UNDEFINED,
} from './Tag';

const { isArray } = Array;
const { isInteger } = Number;

export function hydrate(input: any, refs: Map<number, any>, options: SerializationOptions): any {
  if (input === null || typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  // Object
  if (!isArray(input)) {
    refs.set(refs.size, input);

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
    refs.set(refs.size, input);
    return input;
  }

  const tag = input[0];

  // Regular array
  if (!isInteger(tag)) {
    refs.set(refs.size, input);

    for (let i = 0; i < input.length; ++i) {
      input[i] = hydrate(input[i], refs, options);
    }
    return input;
  }

  switch (tag) {
    case TAG_UNDEFINED:
      return undefined;

    case TAG_NAN:
      return NaN;

    case TAG_NEGATIVE_INFINITY:
      return -Infinity;

    case TAG_POSITIVE_INFINITY:
      return +Infinity;

    case TAG_BIGINT:
      return BigInt(input[1]);

    // Reference
    case TAG_REF:
      const value = refs.get(input[1]);

      if (value === undefined) {
        throw new ReferenceError('Unexpected reference: ' + input[1]);
      }
      return value;

    // Encoded array
    case TAG_ARRAY:
      input = input[1];
      refs.set(refs.size, input);

      for (let i = 0; i < input.length; ++i) {
        input[i] = hydrate(input[i], refs, options);
      }
      return input;
  }

  const { adapters } = options;

  if (adapters !== undefined) {
    for (let i = 0; i < adapters.length; ++i) {
      const adapter = adapters[i];

      if (adapter.tag !== tag) {
        continue;
      }

      let payload = input[1];

      const value = adapter.unpack(payload, options);

      if (value === undefined) {
        continue;
      }

      refs.set(refs.size, value);

      payload = hydrate(payload, refs, options);

      if (adapter.hydrate !== undefined) {
        adapter.hydrate(value, payload, options);
      }
      return value;
    }
  }

  throw new Error('Unexpected tag: ' + tag);
}
