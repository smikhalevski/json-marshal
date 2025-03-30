import { SerializationOptions } from './types';
import {
  TAG_ARRAY,
  TAG_BIGINT,
  TAG_NAN,
  TAG_NEGATIVE_INFINITY,
  TAG_POSITIVE_INFINITY,
  TAG_REF,
  TAG_UNDEFINED,
} from './constants';
import { qsort } from 'algomatic';

const { isArray } = Array;
const jsonStringify = JSON.stringify;

export function dehydrate(input: any, refs: Map<any, number>, options: SerializationOptions): string | undefined {
  if (input === null) {
    return 'null';
  }

  if (input === undefined) {
    return '[' + TAG_UNDEFINED + ']';
  }

  if (typeof input === 'string') {
    return jsonStringify(input);
  }

  if (typeof input === 'number') {
    if (input !== input) {
      return '[' + TAG_NAN + ']';
    }
    if (input === -Infinity) {
      return '[' + TAG_NEGATIVE_INFINITY + ']';
    }
    if (input === +Infinity) {
      return '[' + TAG_POSITIVE_INFINITY + ']';
    }
    return '' + input;
  }

  if (typeof input === 'boolean') {
    return input ? 'true' : 'false';
  }

  if (typeof input === 'bigint') {
    return '[' + TAG_BIGINT + ',"' + input + '"]';
  }

  if (typeof input === 'object' || typeof input === 'function' || typeof input === 'symbol') {
    const ref = refs.get(input);

    if (ref !== undefined) {
      return '[' + TAG_REF + ',' + ref + ']';
    }
    refs.set(input, refs.size);
  }

  const { adapters } = options;

  if (adapters !== undefined) {
    for (let i = 0; i < adapters.length; ++i) {
      const adapter = adapters[i];

      if (!adapter.isSupported(input, options)) {
        continue;
      }

      const payload = adapter.pack(input, options);

      if (payload === input) {
        break;
      }
      if (payload === undefined) {
        refs.delete(input);
        return;
      }

      const json = dehydrate(payload, refs, options);

      if (json === undefined) {
        refs.delete(input);
        return;
      }

      return '[' + adapter.tag + ',' + json + ']';
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
    return undefined;
  }

  if (isArray(input)) {
    let str = '';
    let value0;

    for (let separated = false, i = 0; i < input.length; ++i) {
      const valueStr = dehydrate(input[i], refs, options);

      if (valueStr === undefined) {
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
    return '[' + TAG_ARRAY + ',[' + str + ']]';
  }

  // Object
  let str = '';
  let value;
  let valueStr;
  let isSeparated = false;

  if (!options.isStable) {
    for (const key in input) {
      value = input[key];

      if (value === undefined && !options.isUndefinedPropertyValuesPreserved) {
        continue;
      }

      valueStr = dehydrate(value, refs, options);

      if (valueStr === undefined) {
        continue;
      }
      if (isSeparated) {
        str += ',';
      }
      isSeparated = true;
      str += jsonStringify(key) + ':' + valueStr;
    }
  } else {
    const keys = qsort(Object.keys(input));

    for (let i = 0; i < keys.length; ++i) {
      value = input[keys[i]];

      if (value === undefined && !options.isUndefinedPropertyValuesPreserved) {
        continue;
      }

      valueStr = dehydrate(value, refs, options);

      if (valueStr === undefined) {
        continue;
      }
      if (isSeparated) {
        str += ',';
      }
      isSeparated = true;
      str += jsonStringify(keys[i]) + ':' + valueStr;
    }
  }

  return '{' + str + '}';
}
