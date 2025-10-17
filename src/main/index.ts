/**
 * The module with the core JSON Marshal functionality.
 *
 * ```ts
 * import JSONMarshal from 'json-marshal';
 * ```
 *
 * @module json-marshal
 */

import arrayBufferAdapter from './adapter/array-buffer.js';
import dateAdapter from './adapter/date.js';
import errorAdapter from './adapter/error.js';
import mapAdapter from './adapter/map.js';
import regexpAdapter from './adapter/regexp.js';
import setAdapter from './adapter/set.js';
import { dehydrate } from './dehydrate.js';
import { hydrate } from './hydrate.js';
import { SerializationOptions, Serializer } from './types.js';
import { checkAdapterTypes } from './utils.js';

export type { Dehydrated, SerializationOptions, SerializationAdapter, Serializer } from './types.js';

const defaultOptions: Readonly<SerializationOptions> = {
  adapters: undefined,
  isStable: false,
  isUndefinedPropertyValuesPreserved: false,
};

Object.freeze(defaultOptions);

/**
 * Deserializes a JSON string, that was previously serialized with {@link stringify}.
 *
 * @param json The JSON string to deserialize.
 * @param options Serialization options.
 */
export function parse(json: string, options = defaultOptions): any {
  return hydrate(JSON.parse(json), new Map(), options);
}

/**
 * Serializes value as a JSON string.
 *
 * @param value The value to serialize.
 * @param options Serialization options.
 */
export function stringify(value: any, options = defaultOptions): string {
  checkAdapterTypes(options.adapters);

  return dehydrate(value, new Map(), options)!;
}

/**
 * Creates a {@link parse}-{@link stringify} pair that shares the same serialization options.
 *
 * @param options Serialization options.
 */
export function createSerializer(options = defaultOptions): Serializer {
  return {
    parse(json) {
      return parse(json, options);
    },

    stringify(value) {
      return stringify(value, options);
    },
  };
}

/**
 * The default non-stable serializer that uses all built-in adapters.
 */
const defaultSerializer = createSerializer({
  adapters: [arrayBufferAdapter(), dateAdapter(), errorAdapter(), mapAdapter(), regexpAdapter(), setAdapter()],
  isStable: false,
  isUndefinedPropertyValuesPreserved: false,
});

export default defaultSerializer;
