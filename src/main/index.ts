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
export function createSerializer(options = defaultOptions): JSON {
  return {
    [Symbol.toStringTag]: 'JSONMarshal',

    parse: json => parse(json, options),
    stringify: value => stringify(value, options),
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
