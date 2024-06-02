/**
 * Serializes [typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects),
 * {@link !DataView} amd {@link !ArrayBuffer} instances as Base64-encoded string.
 *
 * ```ts
 * import { stringify } from 'json-marshal';
 * import arrayBufferAdapter from 'json-marshal/adapter/array-buffer';
 *
 * stringify(new ArrayBuffer(10), { adapters: [arrayBufferAdapter()] });
 * ```
 *
 * @module adapter/array-buffer
 */

import { decodeBase64, encodeBase64 } from '../base64';
import { Tag } from '../Tag';
import type { SerializationAdapter } from '../types';

export default function arrayBufferAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value, _options) {
    if (value instanceof ArrayBuffer) {
      return Tag.ARRAY_BUFFER;
    }

    if (!ArrayBuffer.isView(value)) {
      return undefined;
    }

    if (value instanceof Int8Array) {
      return Tag.INT8_ARRAY;
    } else if (value instanceof Uint8Array) {
      return Tag.UINT8_ARRAY;
    } else if (value instanceof Uint8ClampedArray) {
      return Tag.UINT8_CLAMPED_ARRAY;
    } else if (value instanceof Int16Array) {
      return Tag.INT16_ARRAY;
    } else if (value instanceof Uint16Array) {
      return Tag.UINT16_ARRAY;
    } else if (value instanceof Int32Array) {
      return Tag.INT32_ARRAY;
    } else if (value instanceof Uint32Array) {
      return Tag.UINT32_ARRAY;
    } else if (value instanceof Float32Array) {
      return Tag.FLOAT32_ARRAY;
    } else if (value instanceof Float64Array) {
      return Tag.FLOAT64_ARRAY;
    } else if (typeof BigInt64Array !== 'undefined' && value instanceof BigInt64Array) {
      return Tag.BIGINT64_ARRAY;
    } else if (typeof BigUint64Array !== 'undefined' && value instanceof BigUint64Array) {
      return Tag.BIGUINT64_ARRAY;
    } else {
      return Tag.DATA_VIEW;
    }
  },

  getPayload(_tag, value, _options) {
    return encodeBase64(value instanceof ArrayBuffer ? value : value.buffer);
  },

  getValue(tag, dehydratedPayload, _options) {
    switch (tag) {
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
        return new constructors[tag](decodeBase64(dehydratedPayload));

      case Tag.ARRAY_BUFFER:
        return decodeBase64(dehydratedPayload);
    }
  },
};

const constructors = {
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
