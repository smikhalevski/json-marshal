/**
 * The module with the core JSON Marshal functionality.
 *
 * ```ts
 * import JSONMarshal from 'json-marshal';
 * ```
 *
 * @module json-marshal
 */

import arrayBufferAdapter from './adapter/array-buffer';
import dateAdapter from './adapter/date';
import errorAdapter from './adapter/error';
import mapAdapter from './adapter/map';
import regexpAdapter from './adapter/regexp';
import setAdapter from './adapter/set';
import { dehydrate } from './dehydrate';
import { hydrate } from './hydrate';
import { SerializationOptions } from './types';
import { checkAdapterTypes } from './utils';

export type { SerializationOptions, SerializationAdapter } from './types';

const emptyObject = {};

/**
 * Serializes value as a JSON string.
 *
 * @param value The value to serialize.
 * @param options Serialization options.
 */
export function stringify(value: any, options: SerializationOptions = emptyObject): string {
  checkAdapterTypes(options.adapters);
  return dehydrate(value, new Map(), options)!;
}

/**
 * Deserializes a JSON string, that was previously serialized with {@link stringify}.
 *
 * @param str The JSON string to deserialize.
 * @param options Serialization options.
 */
export function parse(str: string, options: SerializationOptions = emptyObject): any {
  return hydrate(JSON.parse(str), new Map(), options);
}

/**
 * Creates a {@link parse}-{@link stringify} pair that shares the same serialization options.
 *
 * @param options Serialization options.
 */
export function createSerializer(options: SerializationOptions = {}) {
  return {
    parse(str: string): any {
      return parse(str, options);
    },
    stringify(value: any): string {
      return stringify(value, options);
    },
  };
}

/**
 * The default non-stable serializer that uses all built-in adapters.
 */
const defaultSerializer = createSerializer({
  adapters: [arrayBufferAdapter(), dateAdapter(), errorAdapter(), mapAdapter(), regexpAdapter(), setAdapter()],
});

export default defaultSerializer;
