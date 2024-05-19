import { decodeBase64 } from './base64';
import { Tag } from './Tag';

export function hydrate(value: any, refs: Map<number, any>): any {
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
