import { decodeBase64, encodeBase64 } from './base64';

const enum Tag {
  REF,
  UNDEFINED,
  NAN,
  POSITIVE_INFINITY,
  NEGATIVE_INFINITY,
  BIGINT,
  DATE,
  REGEXP,
  ARRAY,
  SET,
  MAP,

  INT8_ARRAY,
  UINT8_ARRAY,
  UINT8_CLAMPED_ARRAY,
  INT16_ARRAY,
  UINT16_ARRAY,
  INT32_ARRAY,
  UINT32_ARRAY,
  FLOAT32_ARRAY,
  FLOAT64_ARRAY,
  BIGINT64_ARRAY,
  BIGUINT64_ARRAY,
  DATA_VIEW,
  ARRAY_BUFFER,

  ERROR,
  EVAL_ERROR,
  RANGE_ERROR,
  REFERENCE_ERROR,
  SYNTAX_ERROR,
  TYPE_ERROR,
  URI_ERROR,
  DOM_EXCEPTION,
}

export interface StringifyOptions {
  /**
   * If `true` then `undefined` values are encoded during serialization.
   *
   * @default false
   */
  preserveUndefined?: boolean;

  /**
   * If `true` then object keys, `Set` items, and `Map` entries are sorted during serialization.
   *
   * @default false
   */
  stable?: boolean;
}

const stringifyOptions: StringifyOptions = {
  preserveUndefined: false,
  stable: false,
};

export function stringify(value: any, options?: StringifyOptions): string {
  return dehydrate(value, new Map(), options || stringifyOptions)!;
}

export function parse(json: string | undefined): any {
  if (json === null || json === undefined) {
    return json;
  }
  return hydrate(JSON.parse(json), new Map());
}

function dehydrate(value: any, refs: Map<any, number>, options: StringifyOptions): string | undefined {
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

function hydrate(value: any, refs: Map<number, any>): any {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  const index = refs.size;

  if (!Array.isArray(value)) {
    refs.set(index, value);

    for (const key in value) {
      const item = value[key];

      if (item !== null && typeof item === 'object') {
        value[key] = hydrate(item, refs);
      }
    }

    return value;
  }

  if (value.length === 0) {
    refs.set(index, value);
    return value;
  }

  const tag = value[0];

  if (typeof tag !== 'number' || (tag | 0) !== tag) {
    refs.set(index, value);

    for (let i = 0; i < value.length; ++i) {
      value[i] = hydrate(value[i], refs);
    }
    return value;
  }

  let items;

  switch (tag) {
    case Tag.REF:
      value = refs.get(value[1]);
      break;

    case Tag.UNDEFINED:
      value = undefined;
      break;

    case Tag.NAN:
      value = NaN;
      break;

    case Tag.POSITIVE_INFINITY:
      value = Infinity;
      break;

    case Tag.NEGATIVE_INFINITY:
      value = -Infinity;
      break;

    case Tag.BIGINT:
      value = BigInt(value[1]);
      break;

    case Tag.DATE:
      value = new Date(value[1]);
      refs.set(index, value);
      break;

    case Tag.REGEXP:
      value = new RegExp(value[1], value[2]);
      refs.set(index, value);
      break;

    case Tag.ARRAY:
      value = value[1];
      refs.set(index, value);

      for (let i = 0; i < value.length; ++i) {
        value[i] = hydrate(value[i], refs);
      }
      break;

    case Tag.INT8_ARRAY:
    case Tag.UINT8_ARRAY:
    case Tag.UINT8_CLAMPED_ARRAY:
    case Tag.INT16_ARRAY:
    case Tag.UINT16_ARRAY:
    case Tag.INT32_ARRAY:
    case Tag.UINT32_ARRAY:
    case Tag.FLOAT32_ARRAY:
    case Tag.FLOAT64_ARRAY:
    case Tag.BIGINT64_ARRAY:
    case Tag.BIGUINT64_ARRAY:
    case Tag.DATA_VIEW:
      value = new viewConstructors[tag](decodeBase64(value[1]));
      refs.set(index, value);
      break;

    case Tag.ARRAY_BUFFER:
      value = decodeBase64(value[1]);
      refs.set(index, value);
      break;

    case Tag.ERROR:
    case Tag.EVAL_ERROR:
    case Tag.RANGE_ERROR:
    case Tag.REFERENCE_ERROR:
    case Tag.SYNTAX_ERROR:
    case Tag.TYPE_ERROR:
    case Tag.URI_ERROR:
      value = new errorConstructors[tag](value[1]);
      refs.set(index, value);
      break;

    case Tag.DOM_EXCEPTION:
      value = new DOMException(value[1], value[2]);
      refs.set(index, value);
      break;

    case Tag.SET:
      if (value.length === 2) {
        items = value[1];
      }

      value = new Set();
      refs.set(index, value);

      if (items !== undefined) {
        for (const item of items) {
          value.add(hydrate(item, refs));
        }
      }
      break;

    case Tag.MAP:
      if (value.length === 2) {
        items = value[1];
      }

      value = new Map();
      refs.set(index, value);

      if (items !== undefined) {
        for (const item of items) {
          value.set(hydrate(item[0], refs), hydrate(item[1], refs));
        }
      }
      break;

    default:
      throw new Error('Unrecognized tag');
  }

  return value;
}

const viewConstructors: { [tag: number]: new (arrayBuffer: ArrayBuffer) => unknown } = {
  [Tag.INT8_ARRAY]: Int8Array,
  [Tag.UINT8_ARRAY]: Uint8Array,
  [Tag.UINT8_CLAMPED_ARRAY]: Uint8ClampedArray,
  [Tag.INT16_ARRAY]: Int16Array,
  [Tag.UINT16_ARRAY]: Uint16Array,
  [Tag.INT32_ARRAY]: Int32Array,
  [Tag.UINT32_ARRAY]: Uint32Array,
  [Tag.FLOAT32_ARRAY]: Float32Array,
  [Tag.FLOAT64_ARRAY]: Float64Array,
  [Tag.BIGINT64_ARRAY]: typeof BigInt64Array !== 'undefined' ? BigInt64Array : DataView,
  [Tag.BIGUINT64_ARRAY]: typeof BigUint64Array !== 'undefined' ? BigUint64Array : DataView,
  [Tag.DATA_VIEW]: DataView,
};

const errorConstructors: { [tag: number]: ErrorConstructor } = {
  [Tag.ERROR]: Error,
  [Tag.EVAL_ERROR]: EvalError,
  [Tag.RANGE_ERROR]: RangeError,
  [Tag.REFERENCE_ERROR]: ReferenceError,
  [Tag.SYNTAX_ERROR]: SyntaxError,
  [Tag.TYPE_ERROR]: TypeError,
  [Tag.URI_ERROR]: URIError,
};
