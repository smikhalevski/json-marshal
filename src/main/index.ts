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
import { dehydrate, DISCARDED } from './dehydrate';
import { hydrate } from './hydrate';
import { Tag } from './Tag';
import { SerializationOptions } from './types';

export { DISCARDED } from './dehydrate';
export type { SerializationOptions, SerializationAdapter } from './types';

/**
 * Serializes value as a JSON string.
 *
 * @param value The value to serialize.
 * @param options Serialization options.
 */
export function stringify(value: any, options?: SerializationOptions): string {
  const valueStr = dehydrate(value, new Map(), options || {});

  return valueStr !== DISCARDED ? valueStr : '[' + Tag.UNDEFINED + ']';
}

/**
 * Deserializes a JSON string, that was previously serialized with {@link stringify}.
 *
 * @param str The JSON string to deserialize.
 * @param options Serialization options.
 */
export function parse(str: string, options?: SerializationOptions): any {
  return hydrate(JSON.parse(str), new Map(), options || {});
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
export default createSerializer({
  adapters: [arrayBufferAdapter(), dateAdapter(), errorAdapter(), mapAdapter(), regexpAdapter(), setAdapter()],
});
