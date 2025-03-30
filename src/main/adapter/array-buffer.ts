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
import { SerializationAdapter } from '../types';
import { TAG_ARRAY_BUFFER } from '../constants';

const enum Kind {
  ARRAY_BUFFER,
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
}

export default function arrayBufferAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter<ArrayBuffer | ArrayBufferView, [base64: string, kind: Kind]> = {
  tag: TAG_ARRAY_BUFFER,

  isSupported(value) {
    return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
  },

  pack(value, _options) {
    if (value instanceof ArrayBuffer) {
      return [encodeBase64(value), Kind.ARRAY_BUFFER];
    }

    let kind: Kind;

    if (value instanceof Int8Array) {
      kind = Kind.INT8_ARRAY;
    } else if (value instanceof Uint8Array) {
      kind = Kind.UINT8_ARRAY;
    } else if (value instanceof Uint8ClampedArray) {
      kind = Kind.UINT8_CLAMPED_ARRAY;
    } else if (value instanceof Int16Array) {
      kind = Kind.INT16_ARRAY;
    } else if (value instanceof Uint16Array) {
      kind = Kind.UINT16_ARRAY;
    } else if (value instanceof Int32Array) {
      kind = Kind.INT32_ARRAY;
    } else if (value instanceof Uint32Array) {
      kind = Kind.UINT32_ARRAY;
    } else if (value instanceof Float32Array) {
      kind = Kind.FLOAT32_ARRAY;
    } else if (value instanceof Float64Array) {
      kind = Kind.FLOAT64_ARRAY;
    } else if (typeof BigInt64Array !== 'undefined' && value instanceof BigInt64Array) {
      kind = Kind.BIGINT64_ARRAY;
    } else if (typeof BigUint64Array !== 'undefined' && value instanceof BigUint64Array) {
      kind = Kind.BIGUINT64_ARRAY;
    } else {
      kind = Kind.DATA_VIEW;
    }

    return [encodeBase64(value.buffer), kind];
  },

  unpack(payload, _options) {
    const arrayBuffer = decodeBase64(payload[0]);
    const kind = payload[1];

    if (kind === Kind.ARRAY_BUFFER) {
      return arrayBuffer;
    }

    let view: ArrayBufferView;

    if (kind === Kind.INT8_ARRAY) {
      view = new Int8Array(arrayBuffer);
    } else if (kind === Kind.UINT8_ARRAY) {
      view = new Uint8Array(arrayBuffer);
    } else if (kind === Kind.UINT8_CLAMPED_ARRAY) {
      view = new Uint8ClampedArray(arrayBuffer);
    } else if (kind === Kind.INT16_ARRAY) {
      view = new Int16Array(arrayBuffer);
    } else if (kind === Kind.UINT16_ARRAY) {
      view = new Uint16Array(arrayBuffer);
    } else if (kind === Kind.INT32_ARRAY) {
      view = new Int32Array(arrayBuffer);
    } else if (kind === Kind.UINT32_ARRAY) {
      view = new Uint32Array(arrayBuffer);
    } else if (kind === Kind.FLOAT32_ARRAY) {
      view = new Float32Array(arrayBuffer);
    } else if (kind === Kind.FLOAT64_ARRAY) {
      view = new Float64Array(arrayBuffer);
    } else if (kind === Kind.BIGINT64_ARRAY) {
      view = new BigInt64Array(arrayBuffer);
    } else if (kind === Kind.BIGUINT64_ARRAY) {
      view = new BigUint64Array(arrayBuffer);
    } else {
      view = new DataView(arrayBuffer);
    }

    return view;
  },
};
