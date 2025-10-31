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

import { SerializationAdapter } from '../types.js';
import { TAG_ARRAY_BUFFER } from '../constants.js';
import { decodeBase64, encodeBase64 } from '../base64.js';

export default function arrayBufferAdapter(): SerializationAdapter {
  return adapter;
}

const KIND_ARRAY_BUFFER = 0;
const KIND_INT8_ARRAY = 1;
const KIND_UINT8_ARRAY = 2;
const KIND_UINT8_CLAMPED_ARRAY = 3;
const KIND_INT16_ARRAY = 4;
const KIND_UINT16_ARRAY = 5;
const KIND_INT32_ARRAY = 6;
const KIND_UINT32_ARRAY = 7;
const KIND_FLOAT32_ARRAY = 8;
const KIND_FLOAT64_ARRAY = 9;
const KIND_BIGINT64_ARRAY = 10;
const KIND_BIGUINT64_ARRAY = 11;
const KIND_DATA_VIEW = 12;

const adapter: SerializationAdapter<ArrayBuffer | ArrayBufferView, [base64: string, kind: number]> = {
  tag: TAG_ARRAY_BUFFER,

  canPack(value) {
    return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
  },

  pack(value, _options) {
    if (value instanceof ArrayBuffer) {
      return [encodeBase64(value), KIND_ARRAY_BUFFER];
    }

    let kind: number;

    if (value instanceof Int8Array) {
      kind = KIND_INT8_ARRAY;
    } else if (value instanceof Uint8Array) {
      kind = KIND_UINT8_ARRAY;
    } else if (value instanceof Uint8ClampedArray) {
      kind = KIND_UINT8_CLAMPED_ARRAY;
    } else if (value instanceof Int16Array) {
      kind = KIND_INT16_ARRAY;
    } else if (value instanceof Uint16Array) {
      kind = KIND_UINT16_ARRAY;
    } else if (value instanceof Int32Array) {
      kind = KIND_INT32_ARRAY;
    } else if (value instanceof Uint32Array) {
      kind = KIND_UINT32_ARRAY;
    } else if (value instanceof Float32Array) {
      kind = KIND_FLOAT32_ARRAY;
    } else if (value instanceof Float64Array) {
      kind = KIND_FLOAT64_ARRAY;
    } else if (typeof BigInt64Array !== 'undefined' && value instanceof BigInt64Array) {
      kind = KIND_BIGINT64_ARRAY;
    } else if (typeof BigUint64Array !== 'undefined' && value instanceof BigUint64Array) {
      kind = KIND_BIGUINT64_ARRAY;
    } else {
      kind = KIND_DATA_VIEW;
    }

    return [encodeBase64(value.buffer), kind];
  },

  unpack(payload, _options) {
    const arrayBuffer = decodeBase64(payload[0]);
    const kind = payload[1];

    if (kind === KIND_ARRAY_BUFFER) {
      return arrayBuffer;
    }

    let view: ArrayBufferView;

    if (kind === KIND_INT8_ARRAY) {
      view = new Int8Array(arrayBuffer);
    } else if (kind === KIND_UINT8_ARRAY) {
      view = new Uint8Array(arrayBuffer);
    } else if (kind === KIND_UINT8_CLAMPED_ARRAY) {
      view = new Uint8ClampedArray(arrayBuffer);
    } else if (kind === KIND_INT16_ARRAY) {
      view = new Int16Array(arrayBuffer);
    } else if (kind === KIND_UINT16_ARRAY) {
      view = new Uint16Array(arrayBuffer);
    } else if (kind === KIND_INT32_ARRAY) {
      view = new Int32Array(arrayBuffer);
    } else if (kind === KIND_UINT32_ARRAY) {
      view = new Uint32Array(arrayBuffer);
    } else if (kind === KIND_FLOAT32_ARRAY) {
      view = new Float32Array(arrayBuffer);
    } else if (kind === KIND_FLOAT64_ARRAY) {
      view = new Float64Array(arrayBuffer);
    } else if (kind === KIND_BIGINT64_ARRAY) {
      view = new BigInt64Array(arrayBuffer);
    } else if (kind === KIND_BIGUINT64_ARRAY) {
      view = new BigUint64Array(arrayBuffer);
    } else {
      view = new DataView(arrayBuffer);
    }

    return view;
  },
};
