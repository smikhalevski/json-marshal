/**
 * Serializes {@link !DOMException}, {@link !Error}, {@link !EvalError}, {@link !RangeError}, {@link !ReferenceError},
 * {@link !SyntaxError}, {@link !TypeError}, and {@link !URIError}.
 *
 * ```ts
 * import { stringify } from 'json-marshal';
 * import errorAdapter from 'json-marshal/adapter/error';
 *
 * stringify(new Error(), { adapters: [errorAdapter()] });
 * ```
 *
 * @module adapter/error
 */
import { Adapter } from '../types';
import { TAG_ERROR } from '../Tag';

export default function errorAdapter(): Adapter {
  return adapter;
}

const adapter: Adapter<Error, { name: string; message: string }> = {
  tag: TAG_ERROR,

  isSupported(value) {
    return value instanceof Error || value instanceof DOMException;
  },

  pack(value, options) {
    return { name: value.constructor.name, message: value.message };
  },

  unpack(payload, options) {
    return new (((global as any)[payload.name] as ErrorConstructor) || Error)(payload.message);
  },
};
