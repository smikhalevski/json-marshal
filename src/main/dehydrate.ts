import { Tag } from './Tag';
import { SerializationOptions } from './types';

/**
 * Prevents payload from being serialized if returned from the {@link SerializationAdapter.getPayload}.
 */
export const DISCARDED = Symbol('discarded');

export function dehydrate(
  input: any,
  refs: Map<any, number>,
  options: SerializationOptions
): string | typeof DISCARDED {
  if (input === DISCARDED) {
    return DISCARDED;
  }

  if (input === null) {
    return 'null';
  }

  if (input === undefined) {
    return '[' + Tag.UNDEFINED + ']';
  }

  if (typeof input === 'string') {
    return JSON.stringify(input);
  }

  if (typeof input === 'number') {
    if (input !== input) {
      return '[' + Tag.NAN + ']';
    }
    if (input === -Infinity) {
      return '[' + Tag.NEGATIVE_INFINITY + ']';
    }
    if (input === +Infinity) {
      return '[' + Tag.POSITIVE_INFINITY + ']';
    }
    return String(input);
  }

  if (typeof input === 'boolean') {
    return input ? 'true' : 'false';
  }

  if (typeof input === 'bigint') {
    return '[' + Tag.BIGINT + ',"' + input + '"]';
  }

  if (typeof input === 'object' || typeof input === 'function' || typeof input === 'symbol') {
    const ref = refs.get(input);

    if (ref !== undefined) {
      return '[' + Tag.REF + ',' + ref + ']';
    }
    refs.set(input, refs.size);
  }

  const adapters = options.adapters;

  if (adapters !== undefined) {
    for (let adapter, tag, payload, payloadStr, i = 0; i < adapters.length; ++i) {
      adapter = adapters[i];
      tag = adapter.getTag(input, options);

      if (tag === undefined) {
        continue;
      }
      if (!Number.isInteger(tag)) {
        throw new TypeError('Illegal tag: ' + String(tag));
      }

      payload = adapter.getPayload(tag, input, options);

      if (payload === undefined) {
        return '[' + tag + ']';
      }
      if (payload === input) {
        break;
      }

      payloadStr = dehydrate(payload, refs, options);

      if (payloadStr === DISCARDED) {
        refs.delete(input);
        return DISCARDED;
      }

      return '[' + tag + ',' + payloadStr + ']';
    }
  }

  if (typeof input.toJSON === 'function') {
    refs.delete(input);
    return dehydrate(input.toJSON(), refs, options);
  }

  if (
    typeof input === 'object' &&
    ((typeof BigInt !== 'undefined' && input instanceof BigInt) ||
      input instanceof String ||
      input instanceof Number ||
      input instanceof Boolean ||
      input instanceof Symbol)
  ) {
    refs.delete(input);
    return dehydrate(input.valueOf(), refs, options);
  }

  if (typeof input === 'function' || typeof input === 'symbol') {
    refs.delete(input);
    return DISCARDED;
  }

  if (Array.isArray(input)) {
    let str = '';
    let value0;

    for (let valueStr, separated = false, i = 0; i < input.length; ++i) {
      valueStr = dehydrate(input[i], refs, options);

      if (valueStr === DISCARDED) {
        continue;
      }
      if (separated) {
        str += ',';
      } else {
        separated = true;
        value0 = input[i];
      }
      str += valueStr;
    }

    // Regular array
    if (typeof value0 !== 'number') {
      return '[' + str + ']';
    }

    // Encoded array
    return '[' + Tag.ARRAY + ',[' + str + ']]';
  }

  // Object
  const keys = Object.keys(input);

  if (options.stable) {
    keys.sort();
  }

  let str = '';

  for (let value, valueStr, separated = false, i = 0; i < keys.length; ++i) {
    value = input[keys[i]];

    if (value === undefined && !options.undefinedPropertyValuesPreserved) {
      continue;
    }

    valueStr = dehydrate(value, refs, options);

    if (valueStr === DISCARDED) {
      continue;
    }
    if (separated) {
      str += ',';
    }
    separated = true;
    str += JSON.stringify(keys[i]) + ':' + valueStr;
  }

  return '{' + str + '}';
}
