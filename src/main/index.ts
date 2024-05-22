/**
 * The module with the core JSON Marshal functionality.
 *
 * ```ts
 * import { stringify, parse } from 'json-marshal';
 * ```
 *
 * @module json-marshal
 */

import { dehydrate, DISCARDED } from './dehydrate';
import { hydrate } from './hydrate';
import { Tag } from './Tag';
import type { SerializationOptions } from './types';

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
