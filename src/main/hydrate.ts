import { Tag } from './Tag';
import { SerializationOptions } from './types';

export function hydrate(input: any, refs: Map<number, any>, options: SerializationOptions): any {
  if (input === null || typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  // Object
  if (!Array.isArray(input)) {
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
  if (!Number.isInteger(tag)) {
    refs.set(refs.size, input);

    for (let i = 0; i < input.length; ++i) {
      input[i] = hydrate(input[i], refs, options);
    }
    return input;
  }

  switch (tag) {
    case Tag.UNDEFINED:
      return undefined;

    case Tag.NAN:
      return NaN;

    case Tag.NEGATIVE_INFINITY:
      return -Infinity;

    case Tag.POSITIVE_INFINITY:
      return +Infinity;

    case Tag.BIGINT:
      return BigInt(input[1]);

    // Reference
    case Tag.REF:
      const value = refs.get(input[1]);

      if (value === undefined) {
        throw new ReferenceError("Reference isn't hydrated: " + input[1]);
      }
      return value;

    // Encoded array
    case Tag.ARRAY:
      input = input[1];
      refs.set(refs.size, input);

      for (let i = 0; i < input.length; ++i) {
        input[i] = hydrate(input[i], refs, options);
      }
      return input;
  }

  const adapters = options.adapters;

  if (adapters !== undefined) {
    for (let adapter, value, payload, i = 0; i < adapters.length; ++i) {
      adapter = adapters[i];
      payload = input[1];

      value = adapter.getValue(tag, payload, options);

      if (value === undefined) {
        continue;
      }

      refs.set(refs.size, value);

      payload = hydrate(payload, refs, options);

      if (adapter.hydrateValue !== undefined) {
        adapter.hydrateValue(tag, value, payload, options);
      }
      return value;
    }
  }

  throw new Error('Unrecognized tag: ' + tag);
}
