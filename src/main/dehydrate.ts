import { encodeBase64 } from './base64';
import { StringifyOptions } from './index';
import { Tag } from './Tag';

export function dehydrate(value: any, refs: Map<any, number>, options: StringifyOptions): string | undefined {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    if (options.preserveUndefined) {
      return '[' + Tag.UNDEFINED + ']';
    }
    return;
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (value !== value) {
      return '[' + Tag.NAN + ']';
    }
    if (value === Infinity) {
      return '[' + Tag.POSITIVE_INFINITY + ']';
    }
    if (value === -Infinity) {
      return '[' + Tag.NEGATIVE_INFINITY + ']';
    }
    return value.toString();
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'bigint') {
    return '[' + Tag.BIGINT + ',"' + value.toString() + '"]';
  }

  if (typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }

  if (
    value instanceof String ||
    value instanceof Number ||
    value instanceof Symbol ||
    value instanceof Boolean ||
    (typeof BigInt !== 'undefined' && value instanceof BigInt)
  ) {
    return dehydrate(value.valueOf(), refs, options);
  }

  if (typeof value.toJSON === 'function') {
    return dehydrate(value.toJSON(), refs, options);
  }

  const ref = refs.get(value);

  if (ref !== undefined) {
    return '[' + Tag.REF + ',' + ref + ']';
  }

  refs.set(value, refs.size);

  let tag;
  let json = '';
  let separated = false;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    for (let i = 0; i < value.length; ++i) {
      if (i !== 0) {
        json += ',';
      }
      json += dehydrate(value[i], refs, options) || 'null';
    }

    // Prevent excessive array encoding
    tag = value[0];
    if (typeof tag !== 'number' || (tag | 0) !== tag) {
      return '[' + json + ']';
    }

    return '[' + Tag.ARRAY + ',[' + json + ']]';
  }

  if (ArrayBuffer.isView(value)) {
    if (value instanceof Int8Array) {
      tag = Tag.INT8_ARRAY;
    } else if (value instanceof Uint8Array) {
      tag = Tag.UINT8_ARRAY;
    } else if (value instanceof Uint8ClampedArray) {
      tag = Tag.UINT8_CLAMPED_ARRAY;
    } else if (value instanceof Int16Array) {
      tag = Tag.INT16_ARRAY;
    } else if (value instanceof Uint16Array) {
      tag = Tag.UINT16_ARRAY;
    } else if (value instanceof Int32Array) {
      tag = Tag.INT32_ARRAY;
    } else if (value instanceof Uint32Array) {
      tag = Tag.UINT32_ARRAY;
    } else if (value instanceof Float32Array) {
      tag = Tag.FLOAT32_ARRAY;
    } else if (value instanceof Float64Array) {
      tag = Tag.FLOAT64_ARRAY;
    } else if (typeof BigInt64Array !== 'undefined' && value instanceof BigInt64Array) {
      tag = Tag.BIGINT64_ARRAY;
    } else if (typeof BigUint64Array !== 'undefined' && value instanceof BigUint64Array) {
      tag = Tag.BIGUINT64_ARRAY;
    } else {
      tag = Tag.DATA_VIEW;
    }
    return '[' + tag + ',"' + encodeBase64(value.buffer) + '"]';
  }

  if (value instanceof ArrayBuffer) {
    return '[' + Tag.ARRAY_BUFFER + ',"' + encodeBase64(value) + '"]';
  }

  if (value instanceof Date) {
    return '[' + Tag.DATE + ',' + value.getTime() + ']';
  }

  if (value instanceof RegExp) {
    return '[' + Tag.REGEXP + ',' + JSON.stringify(value.source) + ',"' + value.flags + '"]';
  }

  if (value instanceof Error) {
    if (typeof DOMException !== 'undefined' && value instanceof DOMException) {
      return '[' + Tag.DOM_EXCEPTION + ',' + JSON.stringify(value.message) + ',' + JSON.stringify(value.name) + ']';
    }

    if (value instanceof EvalError) {
      tag = Tag.EVAL_ERROR;
    } else if (value instanceof RangeError) {
      tag = Tag.RANGE_ERROR;
    } else if (value instanceof ReferenceError) {
      tag = Tag.REFERENCE_ERROR;
    } else if (value instanceof SyntaxError) {
      tag = Tag.SYNTAX_ERROR;
    } else if (value instanceof TypeError) {
      tag = Tag.TYPE_ERROR;
    } else if (value instanceof URIError) {
      tag = Tag.URI_ERROR;
    } else {
      tag = Tag.ERROR;
    }
    return '[' + tag + ',' + JSON.stringify(value.message) + ']';
  }

  if (value instanceof Set) {
    if (value.size === 0) {
      return '[' + Tag.SET + ']';
    }

    if (options.stable) {
      const itemJsons = [];

      for (const item of value) {
        const itemJson = dehydrate(item, refs, options);
        if (itemJson !== undefined) {
          itemJsons.push(itemJson);
        }
      }

      separated = itemJsons.length !== 0;

      if (separated) {
        itemJsons.sort();
        json = itemJsons.join(',');
      }
    } else {
      for (const item of value) {
        const itemJson = dehydrate(item, refs, options);
        if (itemJson === undefined) {
          continue;
        }
        if (separated) {
          json += ',';
        }
        separated = true;
        json += itemJson;
      }
    }

    if (separated) {
      return '[' + Tag.SET + ',[' + json + ']]';
    }
    return '[' + Tag.SET + ']';
  }

  if (value instanceof Map) {
    if (value.size === 0) {
      return '[' + Tag.MAP + ']';
    }

    if (options.stable) {
      const itemJsons = [];

      for (const key of value.keys()) {
        const keyJson = dehydrate(key, refs, options);
        if (keyJson === undefined) {
          continue;
        }

        const valueJson = dehydrate(value.get(key), refs, options);
        if (valueJson === undefined) {
          continue;
        }

        itemJsons.push('[' + keyJson + ',' + valueJson + ']');
      }

      separated = itemJsons.length !== 0;

      if (separated) {
        itemJsons.sort();
        json = itemJsons.join(',');
      }
    } else {
      for (const key of value.keys()) {
        const keyJson = dehydrate(key, refs, options);
        if (keyJson === undefined) {
          continue;
        }

        const valueJson = dehydrate(value.get(key), refs, options);
        if (valueJson === undefined) {
          continue;
        }

        if (separated) {
          json += ',';
        }
        separated = true;
        json += '[' + keyJson + ',' + valueJson + ']';
      }
    }

    if (separated) {
      return '[' + Tag.MAP + ',[' + json + ']]';
    }
    return '[' + Tag.MAP + ']';
  }

  const keys = Object.keys(value);

  if (keys.length === 0) {
    return '{}';
  }

  if (options.stable) {
    keys.sort();
  }

  for (let i = 0; i < keys.length; ++i) {
    const valueJson = dehydrate(value[keys[i]], refs, options);
    if (valueJson === undefined) {
      continue;
    }
    if (separated) {
      json += ',';
    }
    separated = true;
    json += JSON.stringify(keys[i]) + ':' + valueJson;
  }

  return '{' + json + '}';
}
