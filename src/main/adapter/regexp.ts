/**
 * Serializes {@link !RegExp RegExp} instances.
 *
 * ```ts
 * import regexpAdapter from 'json-marshal/adapter/regexp';
 * ```
 *
 * @module adapter/regexp
 */
import { Tag } from '../Tag';
import type { SerializationAdapter } from '../types';

export default function regexpAdapter(): SerializationAdapter {
  return adapter;
}

const adapter: SerializationAdapter = {
  getTag(value, _options) {
    if (value instanceof RegExp) {
      return Tag.REGEXP;
    }
  },

  getPayload(_tag, value, _options) {
    return [value.source, value.flags];
  },

  getValue(tag, dehydratedPayload, _options) {
    if (tag === Tag.REGEXP) {
      return new RegExp(dehydratedPayload[0], dehydratedPayload[1]);
    }
  },
};
