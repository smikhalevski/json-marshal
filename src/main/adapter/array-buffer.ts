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
import { Adapter } from '../types';
import { TAG_ARRAY_BUFFER } from '../Tag';

export default function arrayBufferAdapter(): Adapter {
  return adapter;
}

const adapter: Adapter = {
  tag: TAG_ARRAY_BUFFER,

  isSupported(value) {
    return (
      ArrayBuffer.isView(value) ||
      value instanceof ArrayBuffer ||
      value instanceof Int8Array ||
      value instanceof Uint8Array ||
      value instanceof Uint8ClampedArray ||
      value instanceof Int16Array ||
      value instanceof Uint16Array ||
      value instanceof Int32Array ||
      value instanceof Uint32Array ||
      value instanceof Float32Array ||
      value instanceof Float64Array ||
      (BigInt64Array !== undefined && value instanceof BigInt64Array) ||
      (BigUint64Array !== undefined && value instanceof BigUint64Array)
    );
  },

  pack(value, options) {
    return value instanceof ArrayBuffer
      ? [null, encodeBase64(value)]
      : [value.constructor.name, encodeBase64(value.buffer)];
  },

  unpack(payload, options) {
    if (payload[0] === null) {
      return decodeBase64(payload[1]);
    }

    return new (global as any)[payload[0]](decodeBase64(payload[1]));
  },
};
