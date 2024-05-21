import type { StringifyOptions } from './types';
import { Tag } from './Tag';

export const DISCARDED = Symbol('discarded');

export function dehydrate(input: any, refs: Map<any, number>, options: StringifyOptions): string | typeof DISCARDED {
  let tag;
  let str = '';
  let key;
  let keyStr;
  let value;
  let valueStr;
  let separated = false;

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
    if (input === Infinity) {
      return '[' + Tag.POSITIVE_INFINITY + ']';
    }
    if (input === -Infinity) {
      return '[' + Tag.NEGATIVE_INFINITY + ']';
    }
    return String(input);
  }

  if (typeof input === 'boolean') {
    return input ? 'true' : 'false';
  }

  if (typeof input === 'bigint') {
    return '[' + Tag.BIGINT + ',"' + input + '"]';
  }

  if (options.adapters !== undefined) {
    for (const adapter of options.adapters) {
      if (typeof (tag = adapter.getTag(input)) !== 'number' || (tag | 0) !== tag) {
        throw new Error('Illegal tag: ' + String(tag));
      }
      if (tag < 0) {
        continue;
      }
      if ((value = adapter.serialize(tag, input)) === input) {
        break;
      }
      if ((valueStr = dehydrate(value, refs, options)) === DISCARDED) {
        return DISCARDED;
      }
      return '[' + tag + ',' + valueStr + ']';
    }
  }

  if (typeof input.toJSON === 'function') {
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
    return dehydrate(input.valueOf(), refs, options);
  }

  if (typeof input === 'function' || typeof input === 'symbol') {
    return DISCARDED;
  }

  const ref = refs.get(input);
  if (ref !== undefined) {
    return '[' + Tag.REF + ',' + ref + ']';
  }

  refs.set(input, refs.size);

  if (Array.isArray(input)) {
    if (input.length === 0) {
      return '[]';
    }

    for (let index = 0; index < input.length; ++index) {
      if ((valueStr = dehydrate(input[index], refs, options)) === DISCARDED) {
        continue;
      }
      if (separated) {
        str += ',';
      }
      separated = true;
      str += valueStr;
    }

    if (!separated) {
      return '[]';
    }

    // Prevent excessive array encoding
    if (typeof (tag = input[0]) !== 'number' || (tag | 0) !== tag || tag < 0) {
      return '[' + str + ']';
    }
    return '[' + Tag.ARRAY + ',[' + str + ']]';
  }

  if (input instanceof Set) {
    if (input.size === 0) {
      return '[' + Tag.SET + ']';
    }

    if (options.stable) {
      const valueStrs = [];

      for (value of input) {
        if ((valueStr = dehydrate(value, refs, options)) === DISCARDED) {
          continue;
        }
        valueStrs.push(valueStr);
      }

      if ((separated = valueStrs.length !== 0)) {
        valueStrs.sort();
        str = valueStrs.join(',');
      }
    } else {
      for (value of input) {
        if ((valueStr = dehydrate(value, refs, options)) === DISCARDED) {
          continue;
        }
        if (separated) {
          str += ',';
        }
        separated = true;
        str += valueStr;
      }
    }

    if (separated) {
      return '[' + Tag.SET + ',[' + str + ']]';
    }
    return '[' + Tag.SET + ']';
  }

  if (input instanceof Map) {
    if (input.size === 0) {
      return '[' + Tag.MAP + ']';
    }

    if (options.stable) {
      const keyValueStrs = [];

      for (key of input.keys()) {
        if (
          (keyStr = dehydrate(key, refs, options)) === DISCARDED ||
          (valueStr = dehydrate(input.get(key), refs, options)) === DISCARDED
        ) {
          continue;
        }
        keyValueStrs.push('[' + keyStr + ',' + valueStr + ']');
      }

      if ((separated = keyValueStrs.length !== 0)) {
        keyValueStrs.sort();
        str += keyValueStrs.join(',');
      }
    } else {
      for (key of input.keys()) {
        if (
          (keyStr = dehydrate(key, refs, options)) === DISCARDED ||
          (valueStr = dehydrate(input.get(key), refs, options)) === DISCARDED
        ) {
          continue;
        }
        if (separated) {
          str += ',';
        }
        separated = true;
        str += '[' + keyStr + ',' + valueStr + ']';
      }
    }

    if (separated) {
      return '[' + Tag.MAP + ',[' + str + ']]';
    }
    return '[' + Tag.MAP + ']';
  }

  const keys = Object.keys(input);

  if (keys.length === 0) {
    return '{}';
  }

  if (options.stable) {
    keys.sort();
  }

  for (let index = 0; index < keys.length; ++index) {
    if (
      ((value = input[keys[index]]) === undefined && !options.undefinedPropertyValuesPreserved) ||
      (valueStr = dehydrate(value, refs, options)) === DISCARDED
    ) {
      continue;
    }
    if (separated) {
      str += ',';
    }
    separated = true;
    str += JSON.stringify(keys[index]) + ':' + valueStr;
  }

  return '{' + str + '}';
}
