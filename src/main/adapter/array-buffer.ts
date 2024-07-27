/**
 * Serializes [typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects),
 * {@link !DataView} and {@link !ArrayBuffer} instances as Base64-encoded string.
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

import { decodeBase64, encodeBase64 } from '../utils';
import { Tag } from '../Tag';
import { SerializationAdapter } from '../types';

export default function arrayBufferAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value, _options) {
    if (value instanceof ArrayBufferConstructor) {
      return Tag.ARRAY_BUFFER;
    }
    if (!ArrayBufferConstructor.isView(value)) {
      return undefined;
    }
    if (value instanceof Int8ArrayConstructor) {
      return Tag.INT8_ARRAY;
    }
    if (value instanceof Uint8ArrayConstructor) {
      return Tag.UINT8_ARRAY;
    }
    if (value instanceof Uint8ClampedArrayConstructor) {
      return Tag.UINT8_CLAMPED_ARRAY;
    }
    if (value instanceof Int16ArrayConstructor) {
      return Tag.INT16_ARRAY;
    }
    if (value instanceof Uint16ArrayConstructor) {
      return Tag.UINT16_ARRAY;
    }
    if (value instanceof Int32ArrayConstructor) {
      return Tag.INT32_ARRAY;
    }
    if (value instanceof Uint32ArrayConstructor) {
      return Tag.UINT32_ARRAY;
    }
    if (value instanceof Float32ArrayConstructor) {
      return Tag.FLOAT32_ARRAY;
    }
    if (value instanceof Float64ArrayConstructor) {
      return Tag.FLOAT64_ARRAY;
    }
    if (BigInt64ArrayConstructor !== undefined && value instanceof BigInt64ArrayConstructor) {
      return Tag.BIGINT64_ARRAY;
    }
    if (BigUint64ArrayConstructor !== undefined && value instanceof BigUint64ArrayConstructor) {
      return Tag.BIGUINT64_ARRAY;
    }
    return Tag.DATA_VIEW;
  },

  getPayload(_tag, value, _options) {
    return encodeBase64(value instanceof ArrayBufferConstructor ? value : value.buffer);
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

const ArrayBufferConstructor = ArrayBuffer;
const Int8ArrayConstructor = Int8Array;
const Uint8ArrayConstructor = Uint8Array;
const Uint8ClampedArrayConstructor = Uint8ClampedArray;
const Int16ArrayConstructor = Int16Array;
const Uint16ArrayConstructor = Uint16Array;
const Int32ArrayConstructor = Int32Array;
const Uint32ArrayConstructor = Uint32Array;
const Float32ArrayConstructor = Float32Array;
const Float64ArrayConstructor = Float64Array;
const BigInt64ArrayConstructor = typeof BigInt64Array !== 'undefined' ? BigInt64Array : undefined;
const BigUint64ArrayConstructor = typeof BigUint64Array !== 'undefined' ? BigUint64Array : undefined;
const DataViewConstructor = DataView;

const constructors = {
  [Tag.INT8_ARRAY]: Int8ArrayConstructor,
  [Tag.UINT8_ARRAY]: Uint8ArrayConstructor,
  [Tag.UINT8_CLAMPED_ARRAY]: Uint8ClampedArrayConstructor,
  [Tag.INT16_ARRAY]: Int16ArrayConstructor,
  [Tag.UINT16_ARRAY]: Uint16ArrayConstructor,
  [Tag.INT32_ARRAY]: Int32ArrayConstructor,
  [Tag.UINT32_ARRAY]: Uint32ArrayConstructor,
  [Tag.FLOAT32_ARRAY]: Float32ArrayConstructor,
  [Tag.FLOAT64_ARRAY]: Float64ArrayConstructor,
  [Tag.BIGINT64_ARRAY]: BigInt64ArrayConstructor || DataViewConstructor,
  [Tag.BIGUINT64_ARRAY]: BigUint64ArrayConstructor || DataViewConstructor,
  [Tag.DATA_VIEW]: DataViewConstructor,
};
